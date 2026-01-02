from typing import Dict, Any, List
from modules.ai.ai_handler import call_gemini
from prompts import AGENT_PERSONA
import logging

logger = logging.getLogger(__name__)


def optimize_listing(product_data: Dict[str, Any], model: str = 'models/gemini-3-pro-preview') -> Dict[str, Any]:
    """Use AI to generate optimized listing: title (LSI), html description (AIDA), and keywords/tags.

    Returns: { title, html_description, keywords }
    """
    prompt = f"{AGENT_PERSONA}\nModuł: SEO Autopilot\nWygeneruj zoptymalizowany tytuł oparty na LSI, strukturę opisu HTML zastosowaniem AIDA, oraz listę słów kluczowych dla produktu:\n\n{product_data}\n\nWymagaj formatu JSON: { {'title': 'string', 'html_description': 'string', 'keywords': ['kw1','kw2']} }"

    resp = call_gemini(prompt, model=model, response_mime_type='application/json')
    if not resp.get('ok'):
        logger.error('SEO optimize failed: %s', resp.get('error'))
        # fallback basic generation
        title = product_data.get('name') or product_data.get('title') or f"Produkt {product_data.get('sku', '')}"
        html_description = f"<p>{product_data.get('description','')}</p>"
        keywords = [product_data.get('sku',''), product_data.get('brand','')]
        return {'title': title, 'html_description': html_description, 'keywords': keywords, 'source': 'fallback'}

    parsed = resp.get('response') or {}
    return {
        'title': parsed.get('title') if isinstance(parsed, dict) else None,
        'html_description': parsed.get('html_description') if isinstance(parsed, dict) else None,
        'keywords': parsed.get('keywords') if isinstance(parsed, dict) else []
    }
