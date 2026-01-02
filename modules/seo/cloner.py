from typing import Dict, Any, List
from modules.ai.ai_handler import call_gemini
from prompts import AGENT_PERSONA
import logging

logger = logging.getLogger(__name__)


def clone_and_variate(listing_id: str, base_listing: Dict[str, Any] = None, count: int = 5, model: str = 'models/gemini-3-pro-preview') -> List[Dict[str, Any]]:
    """Generate `count` unique variations of a base listing.

    If base_listing is None, function assumes caller will supply base data or fetch it externally.
    Returns list of variations: [{title, html_description, keywords, angle}]
    """
    if base_listing is None:
        raise RuntimeError('base_listing must be provided for cloning')

    prompt = f"{AGENT_PERSONA}\nModuł: SEO Cloner\nWeź poniższy opis i wygeneruj {count} unikalnych wersji. Każda wersja ma mieć inny 'kąt' sprzedaży (np. oszczędność, premium, szybkość dostawy), unikalną strukturę zdań i nagłówki. Zwróć odpowiedź w JSON jako lista obiektów z polami: title, html_description, keywords, angle.\n\nBase listing:\n{base_listing}\n"

    resp = call_gemini(prompt, model=model, response_mime_type='application/json')
    if not resp.get('ok'):
        logger.error('SEO cloner failed: %s', resp.get('error'))
        # fallback: naive variations
        variations = []
        for i in range(count):
            variations.append({
                'title': f"{base_listing.get('title','Product')} - wariacja {i+1}",
                'html_description': f"<p>{base_listing.get('description','')}</p>",
                'keywords': base_listing.get('keywords', [])[:5],
                'angle': 'fallback'
            })
        return variations

    parsed = resp.get('response')
    if isinstance(parsed, list):
        return parsed
+    # if response wrapped in dict
+    if isinstance(parsed, dict) and parsed.get('variations'):
+        return parsed.get('variations')
+
+    return []
