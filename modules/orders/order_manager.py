from typing import Dict, Any, List
import logging
from modules.orders.workflow_engine import process_order_flow

logger = logging.getLogger(__name__)

# In-memory store for processed orders (simple persistence during runtime)
_ORDERS_STORE: Dict[str, Dict[str, Any]] = {}


def process_new_order(order_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main entry: process a new order through the workflow and store status."""
    order_id = order_data.get('order_id') or order_data.get('id') or order_data.get('orderId')
    if not order_id:
        order_id = f"tmp-{len(_ORDERS_STORE)+1}"
        order_data['order_id'] = order_id

    logger.info('Processing new order %s', order_id)
    status = process_order_flow(order_data)

    # store a lightweight dashboard summary
    summary = {
        'order_id': order_id,
        'total_price': order_data.get('total_price') or order_data.get('summary', {}).get('totalToPay', {}).get('amount'),
        'intelligence_status': {
            'profit': f"{status.get('steps', {}).get('finance', {}).get('margin')}",
            'carrier': status.get('steps', {}).get('logistics', {}).get('result', {}).get('carrier', {}).get('carrier_name') if status.get('steps', {}).get('logistics', {}).get('result') else None,
            'message': status.get('steps', {}).get('communication', {}).get('reply', {}).get('reply_text') if status.get('steps', {}).get('communication') else None,
            'risk': status.get('steps', {}).get('risk_analysis')
        },
        'raw_status': status
    }
    _ORDERS_STORE[str(order_id)] = summary
    return summary


def get_dashboard_orders() -> List[Dict[str, Any]]:
    return list(_ORDERS_STORE.values())
