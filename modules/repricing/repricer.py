from typing import List, Dict, Any, Optional
from datetime import datetime
import os
from modules.ai.ai_handler import call_gemini
from prompts import AGENT_PERSONA, REPRICING_PROMPT_BRIEF, REPRICING_PROMPT_TEMPLATE

try:
    from modules.finance.calculator import calculate_margin
except Exception:
    # calculator may not be present yet; guard usage
    def calculate_margin(sale_price, product_costs, marketplace_fees):
        # fallback simple margin: (sale_price - cost) / sale_price
        cost = product_costs.get('cost', 0)
        return (sale_price - cost) / sale_price if sale_price > 0 else 0

# Core repricing logic following "Drapieżny Repricing" rules

def compute_new_price(product: Dict[str, Any], competitors: List[Dict[str, Any]],
                      config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Calculate recommended new price for a product.

    product: { id, sku, price, cost, our_lead_time_days, our_rating }
    competitors: [{seller, price, lead_time_days, rating}]
    config: { min_margin_pct, max_discount_pct, epsilon, allow_night_tests }

    Returns: { new_price, reason, actions }
    """
    cfg = {
        'min_margin_pct': 0.20,
        'max_discount_pct': 0.15,
        'epsilon': 0.01,
        'allow_night_tests': True
    }
    if config:
        cfg.update(config)

    price = float(product.get('price', 0))
    cost = float(product.get('cost', 0))
    our_lead = float(product.get('our_lead_time_days', 1))
    our_rating = float(product.get('our_rating', 5.0))

    # baseline = minimum acceptable price to keep min margin
    baseline = round(cost * (1 + cfg['min_margin_pct']), 2)

    # find best competitor (lowest price)
    competitors_sorted = sorted(competitors, key=lambda c: float(c.get('price', 1e9)))
    best = competitors_sorted[0] if competitors_sorted else None

    # default response
    new_price = price
    reason = 'Brak zmian — brak konkurencji' if not best else ''
    actions = []

    if best:
        best_price = float(best.get('price', 0))
        best_lead = float(best.get('lead_time_days', 999))
        best_rating = float(best.get('rating', 0))

        # If competitor cheaper but slower or lower rating -> keep price (or small premium)
        if best_price < price:
            if (best_lead - our_lead) >= 2 or best_rating + 0.1 < our_rating:
                new_price = max(price, baseline)
                reason = 'Konkurent tańszy, ale gorszy czas dostawy/ocena — utrzymujemy cenę (przewaga szybkiej dostawy)'
                actions = ['keep_price', 'highlight_fast_delivery']
            else:
                # competitor is cheaper and comparable — consider micro-jump or match within limits
                allowable_floor = max(baseline, price * (1 - cfg['max_discount_pct']))
                # target to undercut competitor by epsilon if margin allows
                target = round(min(price, max(allowable_floor, best_price - cfg['epsilon'])), 2)
                # night test: allow exploratory micro-jumps during quiet hours
                hour = datetime.now().hour
                if cfg['allow_night_tests'] and 0 <= hour <= 5:
                    new_price = target
                    reason = 'Nocny test: mikro-obniżka cenowa (micro-jump) by sprawdzić elastyczność'
                    actions = ['apply_price', 'run_night_test']
                else:
                    # prefer not to sacrify too much margin during day — be conservative
                    if target < price:
                        new_price = target
                        reason = 'Dostosowanie ceny aby odzyskać Buy Box przy zachowaniu minimalnej marży'
                        actions = ['apply_price']
                    else:
                        new_price = price
                        reason = 'Nie obniżamy ceny — nieopłacalne lub poza limitem rabatu'
                        actions = ['keep_price']
        else:
            # we're already cheapest — but ensure margin and optionally increase a bit
            if price <= baseline:
                new_price = baseline
                reason = 'Podnosimy do minimalnej dopuszczalnej marży'
                actions = ['apply_price']
            else:
                # small price increase if market allows
                new_price = round(min(price * 1.02, price + cfg['epsilon']), 2)
                reason = 'Jesteśmy najtańsi — delikatna optymalizacja ceny w górę dla większej marży'
                actions = ['apply_price']

    # final safety: never go below baseline
    if new_price < baseline:
        new_price = baseline
        if 'reason' in locals():
            reason += ' | korekta do baseline'
        else:
            reason = 'Korekta do baseline'
        if 'apply_price' not in actions:
            actions.append('apply_price')

    return {
        'new_price': round(new_price, 2),
        'reason': reason,
        'actions': actions,
        'baseline': baseline
    }


def run_repricing_ai(product: Dict[str, Any], competitors: List[Dict[str, Any]], config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Call Gemini (via ai_handler) with the repricing prompt and return parsed response.

    Returns dict like {'ok': True, 'response': {...}} or {'ok': False, 'error': '...'}
    """
    try:
        persona = AGENT_PERSONA
        brief = REPRICING_PROMPT_BRIEF.format(persona=persona, product=str(product), competitors=str(competitors), config=str(config or {}))
        prompt = REPRICING_PROMPT_TEMPLATE.format(persona=persona) + "\n\n" + brief
        model = os.environ.get('LM_MODEL', 'models/gemini-3-pro-preview')
        resp = call_gemini(prompt, model=model, response_mime_type='application/json')
        return resp
    except Exception as e:
        return {'ok': False, 'error': str(e)}


def enforce_margin_or_adjust(candidate_price: float, product: Dict[str, Any], config: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Ensure candidate_price meets minimal margin threshold using finance calculator.

    Returns dict with keys: safe_price, ok (bool), margin
    """
    cfg = {'min_allowed_margin_pct': 0.10}
    if config:
        cfg.update(config)

    # build product_costs and marketplace_fees simple structures
    product_costs = {
        'cost': float(product.get('cost', 0)),
        'packaging': float(product.get('packaging_cost', 0)),
        'shipping': float(product.get('shipping_cost', 0)),
        'ads': float(product.get('ads_cost', 0))
    }
    marketplace_fees = {
        'fee_pct': float(product.get('marketplace_fee_pct', 0.15))
    }

    margin = calculate_margin(candidate_price, product_costs, marketplace_fees)
    ok = margin >= cfg['min_allowed_margin_pct']
    safe_price = candidate_price
    # If not ok, raise to baseline (cost + min margin)
    if not ok:
        baseline = round(product_costs['cost'] * (1 + cfg['min_allowed_margin_pct']), 2)
        safe_price = max(baseline, safe_price)
    return {'safe_price': round(safe_price, 2), 'ok': ok, 'margin': margin}


# Placeholder for fetching competitor prices from external sources (APIs, scraping)
# Implement integration per marketplace / partner APIs.

def fetch_competitor_prices(sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Given a list of sources, return competitor price entries.

    sources: [{type: 'api'|'scrape', 'url':..., 'parser': optional}]
    This is a stub — integrate with real endpoints or use ebay_auth / google_drive_manager if needed.
    """
    results = []
    # try to use ebay_auth if available
    try:
        import ebay_auth
        for s in sources:
            # expect source to contain ean/mpn or search params
            data = ebay_auth.fetch_offers_for_identifier(s)
            # normalize data items
            for it in data:
                results.append({
                    'seller': it.get('seller', 'unknown'),
                    'price': float(it.get('price', 999999)),
                    'lead_time_days': float(it.get('lead_time_days', 5)),
                    'rating': float(it.get('rating', 4.5)),
                })
    except Exception:
        # fallback stub
        for s in sources:
            results.append({
                'seller': s.get('seller', 'unknown'),
                'price': float(s.get('price', 999999)),
                'lead_time_days': float(s.get('lead_time_days', 5)),
                'rating': float(s.get('rating', 4.5))
            })
    return results
