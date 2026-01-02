from typing import Dict, Any, List
import logging
from datetime import datetime, timedelta

from modules.inventory.ai_inventory_handler import InventoryAIHandler
from modules.repricing.repricer import compute_new_price, enforce_margin_or_adjust
from modules.finance.calculator import calculate_margin

logger = logging.getLogger(__name__)


def predict_stock_health(product_id: str, sales_history: List[Dict[str, Any]], lead_time_days: int, product: Dict[str, Any] = None) -> Dict[str, Any]:
    """Predict depletion date and risk using AI, and trigger repricer/seo actions if needed.

    sales_history: list of { date: ISO, qty: int }
    product: optional product metadata (price, cost, sku...)
    """
    handler = InventoryAIHandler()
    ai_resp = handler.predict_stock(product_id, sales_history, lead_time_days, extra_context={'product': product})
    if not ai_resp.get('ok'):
        return {'ok': False, 'error': ai_resp.get('error')}

    pred = ai_resp.get('prediction') or {}

    # parse days_to_depletion if available
    days = None
    try:
        days = int(pred.get('days_to_depletion')) if pred.get('days_to_depletion') is not None else None
    except Exception:
        days = None

    result = {'ok': True, 'prediction': pred}

    # If predicted depletion before next lead_time -> signal repricer to raise price
    if days is not None and days <= lead_time_days:
        logger.info('Predicted depletion in %s days <= lead_time %s -> request price raise', days, lead_time_days)
        # propose a conservative price increase (e.g., +10%) and enforce margin
        current_price = float(product.get('price', 0)) if product else 0
        proposed = round(current_price * 1.10, 2)
        enforcement = enforce_margin_or_adjust(proposed, product or {}, config={'min_allowed_margin_pct': 0.10})
        result['action'] = {'type': 'raise_price', 'proposed_price': enforcement['safe_price'], 'margin_ok': enforcement['ok'], 'reason': 'predicted depletion'}

    # Detect dead stock: no sales in last 30 days
    try:
        if sales_history:
            latest_sale = max(datetime.fromisoformat(s.get('date')) for s in sales_history)
            if (datetime.utcnow() - latest_sale).days >= 30:
                logger.info('Dead stock detected for %s', product_id)
                # aggressive markdown suggestion
                current_price = float(product.get('price', 0)) if product else 0
                markdown_price = round(current_price * 0.7, 2)
                enforcement = enforce_margin_or_adjust(markdown_price, product or {}, config={'min_allowed_margin_pct': 0.05})
                result.setdefault('actions', []).append({'type': 'aggressive_clearance', 'proposed_price': enforcement['safe_price'], 'reason': 'dead_stock'})
                # also suggest SEO refresh
                result.setdefault('actions', []).append({'type': 'seo_refresh', 'reason': 'dead_stock'})
    except Exception:
        logger.exception('Error evaluating dead stock')

    return result


def generate_restock_list(products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate restock recommendations for given products.

    For each product compute forecasted depletion and recommend quantity to order based on velocity and lead time.
    Uses calculate_margin to ensure restock is economically sensible.
    """
    handler = InventoryAIHandler()
    restock = []
    for p in products:
        product_id = p.get('id')
        sales_history = p.get('sales_history', [])
        lead_time = int(p.get('lead_time_days', 14))

        ai_resp = handler.predict_stock(product_id, sales_history, lead_time, extra_context={'product': p})
        pred = ai_resp.get('prediction') if ai_resp.get('ok') else {}

        # estimate average daily velocity
        try:
            total_units = sum(item.get('qty', 0) for item in sales_history)
            days_span = 1
            if sales_history:
                dates = [datetime.fromisoformat(item.get('date')) for item in sales_history]
                days_span = max(1, (max(dates) - min(dates)).days)
            velocity = total_units / days_span
        except Exception:
            velocity = 0

        # recommend order qty = velocity * (lead_time + safety_days)
        safety_days = int(p.get('safety_days', 7))
        recommended_qty = int(max(0, round(velocity * (lead_time + safety_days))))

        # check profitability of restock: estimate margin at current price
        sale_price = float(p.get('price', 0))
        product_costs = {
            'cost': float(p.get('cost', 0)),
            'packaging': float(p.get('packaging_cost', 0)),
            'shipping': float(p.get('shipping_cost', 0)),
            'ads': float(p.get('ads_cost', 0))
        }
        marketplace_fees = {'fee_pct': float(p.get('marketplace_fee_pct', 0.15))}
        margin = calculate_margin(sale_price, product_costs, marketplace_fees)

        restock.append({
            'product_id': product_id,
            'predicted': pred,
            'velocity_per_day': velocity,
            'recommended_qty': recommended_qty,
            'current_margin': margin
        })

    return restock
