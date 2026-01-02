from typing import Dict, Any
from modules.ai.base import BaseAIHandler
import logging

logger = logging.getLogger(__name__)


class InventoryAIHandler(BaseAIHandler):
    def __init__(self, model: str = None, response_mime_type: str = None):
        super().__init__(model=model or 'models/gemini-3-pro-preview', response_mime_type=response_mime_type or 'application/json')

    def predict_stock(self, product_id: str, sales_history: Any, lead_time_days: int, extra_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Ask Gemini to predict stock depletion and risk factors.

        Returns a dict with keys: ok, predicted_depletion_date (ISO), days_to_depletion (int), risk ('low'|'medium'|'high'), rationale
        """
        ctx = {
            'product_id': product_id,
            'sales_history_summary': sales_history,
            'lead_time_days': lead_time_days,
            'extra_context': extra_context or {}
        }
        prompt = f"Predict stock depletion for product and consider seasonality/external events. Return JSON with predicted_depletion_date, days_to_depletion, risk, rationale.\nInput:\n{ctx}"
        resp = self.generate(prompt)
        if not resp.get('ok'):
            logger.error('Inventory AI predict error: %s', resp.get('error'))
            return {'ok': False, 'error': resp.get('error')}
        return {'ok': True, 'prediction': resp.get('response')}
