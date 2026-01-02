from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
from typing import List, Dict, Any, Optional
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from modules.security.auth import verify_token, authenticate_issue_token

from prompts import AGENT_PERSONA, REPRICING_PROMPT_TEMPLATE, REPRICING_PROMPT_BRIEF
from modules.repricing.repricer import compute_new_price, fetch_competitor_prices, enforce_margin_or_adjust
from modules.ai.ai_handler import call_gemini
from modules.finance.calculator import calculate_margin
from modules.negotiator.negotiator import negotiate
from modules.logistics.carrier_manager import select_optimal_carrier
from modules.logistics.print_station import group_print_batch, generate_packing_slip
from modules.orders.order_manager import process_new_order, get_dashboard_orders
from modules.allegro.quality_monitor import analyze_discussion, prioritize_discussions
from modules.ads.ads_integrator import check_and_flag_ads, evaluate_product_for_ads
from modules.orders.review_manager import enqueue_review_on_delivery, run_due_reviews, get_pending_reviews
from modules.allegro.quality_guard import handle_dispute, monitor_quality_metrics
from modules.ads.ads_manager import adjust_ads_based_on_margin
from modules.reviews.review_booster import request_positive_review

# try to import optional helpers
try:
    import ebay_auth
except Exception:
    ebay_auth = None
try:
    import google_drive_manager
except Exception:
    google_drive_manager = None

app = FastAPI()
MODEL_NAME = os.environ.get('LM_MODEL', 'models/gemini-3-pro-preview')

# Simple LM client stub - replace with actual Gemini/OpenAI client code

def send_to_model(prompt: str, model_name: str = MODEL_NAME) -> Dict[str, Any]:
    """Call configured LM (Gemini) via ai_handler and return structured response.

    Falls back to stub response if model call fails.
    """
    try:
        resp = call_gemini(prompt, model=model_name, response_mime_type='application/json')
        return resp
    except Exception as e:
        return {'ok': False, 'error': str(e), 'model': model_name}


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        # allow public assets and auth endpoints
        public = ['/api/auth/login', '/login.html', '/login', '/static', '/index.html', '/']
        if path.startswith('/api/') and not any(path.startswith(p) for p in public):
            auth = request.headers.get('authorization') or request.headers.get('Authorization')
            if not auth or not auth.lower().startswith('bearer '):
                return JSONResponse(status_code=401, content={'ok': False, 'error': 'Missing token'})
            token = auth.split(' ',1)[1]
            v = verify_token(token)
            if not v.get('ok'):
                return JSONResponse(status_code=401, content={'ok': False, 'error': 'Invalid token'})
        return await call_next(request)


app.add_middleware(AuthMiddleware)


class ProductIn(BaseModel):
    id: str
    sku: Optional[str]
    price: float
    cost: float
    our_lead_time_days: Optional[float] = 1
    our_rating: Optional[float] = 5.0


class CompetitorIn(BaseModel):
    seller: str
    price: float
    lead_time_days: Optional[float] = 5
    rating: Optional[float] = 4.5


class RepriceRequest(BaseModel):
    product: ProductIn
    competitors: Optional[List[CompetitorIn]] = None
    competitor_sources: Optional[List[Dict[str, Any]]] = None
    config: Optional[Dict[str, Any]] = None


@app.post('/api/reprice')
async def reprice(req: RepriceRequest):
    # get competitor prices either from payload or by fetching sources
    competitors = []
    if req.competitors:
        competitors = [c.dict() for c in req.competitors]
    elif req.competitor_sources:
        competitors = fetch_competitor_prices(req.competitor_sources)

    product = req.product.dict()
    result = compute_new_price(product, competitors, config=req.config)
    return result


@app.post('/api/reprice_with_model')
async def reprice_with_model(req: RepriceRequest):
    # build a prompt for the model
    competitors = [c.dict() for c in req.competitors] if req.competitors else fetch_competitor_prices(req.competitor_sources or [])
    prompt = REPRICING_PROMPT_TEMPLATE.format(persona=AGENT_PERSONA)
    brief = REPRICING_PROMPT_BRIEF.format(persona=AGENT_PERSONA, product=req.product.json(), competitors=str(competitors), config=str(req.config or {}))
    full = prompt + "\n\n" + brief

    # Call the LM (Gemini)
    lm_resp = send_to_model(full, MODEL_NAME)

    # Also compute deterministic recommendation
    deterministic = compute_new_price(req.product.dict(), competitors, config=req.config)

    return {
        'lm': lm_resp,
        'deterministic': deterministic
    }


@app.post('/api/execute_repricing')
async def execute_repricing(req: RepriceRequest):
    # 1) gather competitors
    competitors = [c.dict() for c in req.competitors] if req.competitors else fetch_competitor_prices(req.competitor_sources or [])

    # 2) deterministic baseline
    deterministic = compute_new_price(req.product.dict(), competitors, config=req.config)

    # 3) prepare prompt for Gemini including competitor data
    brief = REPRICING_PROMPT_BRIEF.format(persona=AGENT_PERSONA, product=req.product.json(), competitors=str(competitors), config=str(req.config or {}))
    prompt = REPRICING_PROMPT_TEMPLATE.format(persona=AGENT_PERSONA) + "\n\n" + brief

    # 4) ask model
    lm_resp = send_to_model(prompt, MODEL_NAME)

    # 5) parse model suggestion
    suggested_price = None
    if lm_resp.get('ok') and isinstance(lm_resp.get('response'), dict):
        suggested_price = lm_resp['response'].get('new_price')

    # 6) enforce margin using calculator
    final = {
        'deterministic': deterministic,
        'lm': lm_resp,
        'final_price': None,
        'final_reason': None,
        'margin_ok': None
    }

    # prefer model suggestion if safe
    candidate = deterministic['new_price']
    if suggested_price is not None:
        candidate = float(suggested_price)

    enforcement = enforce_margin_or_adjust(candidate, req.product.dict(), config=req.config)
    final['final_price'] = enforcement['safe_price']
    final['margin_ok'] = enforcement['ok']
    final['final_reason'] = f"chosen_candidate={candidate}; margin={enforcement['margin']}";

    # if margin not ok and deterministic differs, fallback to deterministic safe price
    if not enforcement['ok'] and deterministic.get('new_price') is not None:
        fallback_enf = enforce_margin_or_adjust(deterministic['new_price'], req.product.dict(), config=req.config)
        final['final_price'] = fallback_enf['safe_price']
        final['final_reason'] += f"; fallback_to_deterministic={fallback_enf['safe_price']}"

    return final


# Negotiation endpoint
class NegotiateRequest(BaseModel):
    offer_id: str
    client_offer: float
    product: ProductIn
    customer_history: Optional[Dict[str, Any]] = None
    inventory_count: Optional[int] = 0
    config: Optional[Dict[str, Any]] = None


@app.post('/api/negotiate')
async def api_negotiate(req: NegotiateRequest):
    result = negotiate(req.offer_id, req.client_offer, req.product.dict(), req.customer_history or {}, req.inventory_count or 0, config=req.config)
    return result


# Logistics endpoints
class OptimizeRequest(BaseModel):
    package_data: Dict[str, Any]
    destination: Dict[str, Any]
    carriers: Optional[List[Dict[str, Any]]] = None


@app.post('/api/logistics/optimize')
async def api_logistics_optimize(req: OptimizeRequest):
    try:
        out = select_optimal_carrier(req.package_data, req.destination, carriers=req.carriers)
        return {'ok': True, 'result': out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class PrintBatchRequest(BaseModel):
    orders: List[Dict[str, Any]]
    group_by: Optional[str] = 'carrier'


@app.post('/api/logistics/print_batch')
async def api_logistics_print_batch(req: PrintBatchRequest):
    try:
        manifests = group_print_batch(req.orders, group_by=req.group_by or 'carrier')
        return {'ok': True, 'manifests': manifests}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))


# Orders processing endpoints
class OrderIn(BaseModel):
    order: Dict[str, Any]


class LoginIn(BaseModel):
    email: str
    password: str


@app.post('/api/auth/login')
async def api_auth_login(req: LoginIn):
    try:
        out = authenticate_issue_token(req.email, req.password)
        if out.get('ok'):
            return {'ok': True, 'token': out.get('token'), 'registered': out.get('registered', False)}
        else:
            return JSONResponse(status_code=401, content={'ok': False, 'error': out.get('error')})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/orders/process')
async def api_orders_process(req: OrderIn):
    try:
        summary = process_new_order(req.order)
        return {'ok': True, 'summary': summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/orders/dashboard')
async def api_orders_dashboard():
    try:
        data = get_dashboard_orders()
        return {'ok': True, 'orders': data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Allegro quality endpoints
class DiscussionIn(BaseModel):
    discussion: Dict[str, Any]


@app.post('/api/allegro/analyze_discussion')
async def api_analyze_discussion(req: DiscussionIn):
    try:
        out = analyze_discussion(req.discussion)
        return {'ok': True, 'result': out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/allegro/dispute')
async def api_allegro_dispute(req: DiscussionIn):
    try:
        dispute_text = req.discussion.get('text') or '"
'.join(m.get('text','') for m in req.discussion.get('messages',[]))
        order_ctx = req.discussion.get('order_context', {})
        out = handle_dispute(dispute_text, order_ctx)
        return {'ok': True, 'result': out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/orders/mark_delivered')
async def api_orders_mark_delivered(req: OrderIn):
    try:
        summary = enqueue_review_on_delivery(req.order)
        return {'ok': True, 'summary': summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/reviews/pending')
async def api_reviews_pending():
    try:
        data = get_pending_reviews()
        return {'ok': True, 'pending': data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/reviews/run_pending')
async def api_reviews_run_pending():
    try:
        res = run_due_reviews()
        return {'ok': True, 'result': res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Ads optimize endpoint
class AdsOptimizeIn(BaseModel):
    product_id: str
    current_margin: float
    product_info: Optional[Dict[str, Any]] = None


@app.post('/api/ads/optimize')
async def api_ads_optimize(req: AdsOptimizeIn):
    try:
        out = adjust_ads_based_on_margin(req.product_id, req.current_margin, product_info=req.product_info)
        return {'ok': True, 'result': out}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Quality score for dashboard
@app.get('/api/quality/score')
async def api_quality_score():
    try:
        # aggregate quality metrics from various modules (stubbed)
        q = monitor_quality_metrics()
        # simple scoring heuristic
        score = 95
        warnings = q.get('issues', [])
        return {'ok': True, 'score': score, 'warnings': warnings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
