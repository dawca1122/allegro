from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)


def _safe_import(module_path: str, attr: str = None):
    try:
        mod = __import__(module_path, fromlist=[attr] if attr else [])
        return getattr(mod, attr) if attr else mod
    except Exception:
        logger.exception('Optional import failed: %s.%s', module_path, attr)
        return None


def analyze_order_risk(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Ask AI to analyze order for anomalies and risk. Returns dict with flags."""
    BaseAIHandler = _safe_import('modules.ai.base', 'BaseAIHandler')
    if BaseAIHandler is None:
        return {'ok': False, 'error': 'AI handler unavailable', 'risk': False}

    handler = BaseAIHandler()
    prompt = {
        'task': 'Analyze order for risk/anomaly',
        'order': order_data,
        'instructions': 'Return JSON: { risk: bool, reasons: [str], severity: "low|medium|high", action: "human"|"auto" }'
    }
    resp = handler.generate(prompt)
    if not resp.get('ok'):
        logger.warning('AI risk analysis failed: %s', resp.get('error'))
        # basic heuristic: negative margin or suspicious address
        margin = None
        try:
            margin = float(order_data.get('calculated_margin', 0))
        except Exception:
            margin = None
        suspicious = False
        addr = order_data.get('shipping_to', {})
        if isinstance(addr, dict):
            country = addr.get('country', '').lower()
            if country and country not in ['poland', 'polska', 'pl'] and float(order_data.get('total_price', 0)) < 20:
                suspicious = True
        if margin is not None and margin < 0:
            return {'ok': True, 'risk': True, 'reasons': ['negative_margin'], 'severity': 'high', 'action': 'human'}
        if suspicious:
            return {'ok': True, 'risk': True, 'reasons': ['suspicious_destination_low_value'], 'severity': 'medium', 'action': 'human'}
        return {'ok': True, 'risk': False, 'reasons': [], 'severity': 'low', 'action': 'auto'}

    parsed = resp.get('response') or {}
    return {'ok': True, 'risk': bool(parsed.get('risk')), 'reasons': parsed.get('reasons', []), 'severity': parsed.get('severity', 'low'), 'action': parsed.get('action', 'auto')}


def reserve_carrier_and_prepare_docs(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Select carrier and prepare packing slip + label data."""
    select_optimal_carrier = _safe_import('modules.logistics.carrier_manager', 'select_optimal_carrier')
    generate_packing_slip = _safe_import('modules.logistics.print_station', 'generate_packing_slip')

    carrier_info = None
    if select_optimal_carrier:
        try:
            carrier_info = select_optimal_carrier({'weight_kg': order_data.get('weight_kg', 1), 'value': order_data.get('total_price', 0), 'dimensions': order_data.get('dimensions')}, order_data.get('shipping_to', {}))
        except Exception:
            logger.exception('Carrier selection failed')

    packing = None
    if generate_packing_slip:
        try:
            packing = generate_packing_slip(order_data)
        except Exception:
            logger.exception('Packing slip generation failed')

    return {'carrier': carrier_info, 'packing_slip': packing}


def process_order_flow(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Full autonomous workflow for a single order. Non-blocking where possible.

    Returns a status dict summarizing actions and results.
    """
    status: Dict[str, Any] = {'order_id': order_data.get('order_id') or order_data.get('id'), 'steps': {}}

    # Step 1: Finance
    try:
        calc = _safe_import('modules.finance.calculator', 'calculate_margin')
        if calc:
            # aggregate product costs from items if available
            items = order_data.get('items', [])
            total_cost = 0.0
            for it in items:
                total_cost += float(it.get('cost', 0)) * int(it.get('qty', 1))
            product_costs = {'cost': total_cost, 'packaging': float(order_data.get('packaging_cost', 0)), 'shipping': float(order_data.get('shipping_cost', 0)), 'ads': float(order_data.get('ads_cost', 0))}
            marketplace_fees = {'fee_pct': float(order_data.get('marketplace_fee_pct', 0.15))}
            margin = calc(float(order_data.get('total_price', 0)), product_costs, marketplace_fees)
            status['steps']['finance'] = {'ok': True, 'margin': margin}
            order_data['calculated_margin'] = margin
        else:
            status['steps']['finance'] = {'ok': False, 'error': 'calculator_unavailable'}
    except Exception:
        logger.exception('Finance step failed')
        status['steps']['finance'] = {'ok': False, 'error': 'exception'}

    # Step 2: Inventory
    try:
        guard = _safe_import('modules.inventory.guard', None)
        if guard:
            # for each product call predict_stock_health asynchronously (best-effort)
            inventory_actions = []
            for it in order_data.get('items', []):
                prod_id = it.get('id') or it.get('product_id') or it.get('sku')
                sales_history = it.get('sales_history', [])
                lead_time = int(it.get('lead_time_days', 14))
                try:
                    res = guard.predict_stock_health(prod_id, sales_history, lead_time, product={'price': it.get('price'), 'cost': it.get('cost')})
                    inventory_actions.append({ 'product_id': prod_id, 'result': res })
                except Exception:
                    logger.exception('inventory check failed for %s', prod_id)
            status['steps']['inventory'] = {'ok': True, 'results': inventory_actions}
        else:
            status['steps']['inventory'] = {'ok': False, 'error': 'inventory_guard_unavailable'}
    except Exception:
        logger.exception('Inventory step failed')
        status['steps']['inventory'] = {'ok': False, 'error': 'exception'}

    # Step 3: Communication - generate thank you / ETA message
    try:
        messaging = _safe_import('modules.messaging.messaging_engine', None)
        if messaging:
            message_ctx = {'order_id': order_data.get('order_id'), 'product': order_data.get('items', [])[0] if order_data.get('items') else {}, 'lang': order_data.get('lang', 'pl')}
            message_data = {'message_text': 'order_confirmation', 'sentiment': 'positive', 'intent': 'confirmation', 'urgency': 1}
            reply = messaging.generate_smart_reply(message_data, message_ctx)
            status['steps']['communication'] = {'ok': True, 'reply': reply}
        else:
            status['steps']['communication'] = {'ok': False, 'error': 'messaging_unavailable'}
    except Exception:
        logger.exception('Communication step failed')
        status['steps']['communication'] = {'ok': False, 'error': 'exception'}

    # Step 4: Logistics - select carrier and prepare docs
    try:
        logistics = reserve_carrier_and_prepare_docs(order_data)
        status['steps']['logistics'] = {'ok': True, 'result': logistics}
    except Exception:
        logger.exception('Logistics step failed')
        status['steps']['logistics'] = {'ok': False, 'error': 'exception'}

    # AI Safety Net: risk analysis
    try:
        risk = analyze_order_risk(order_data)
        status['steps']['risk_analysis'] = risk
        if risk.get('risk') and risk.get('action') == 'human':
            status['status'] = 'ORDER_STUCK_HUMAN_INTERVENTION'
        else:
            status['status'] = 'PROCESSING_OK'
    except Exception:
        logger.exception('Risk analysis failed')
        status['steps']['risk_analysis'] = {'ok': False, 'error': 'exception'}
        status['status'] = 'PROCESSING_OK'

    return status
