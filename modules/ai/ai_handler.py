from modules.ai.base import BaseAIHandler


# Singleton handler used by modules. Configurable via env if needed.
_DEFAULT_MODEL = 'models/gemini-3-pro-preview'
_DEFAULT_RESPONSE_MIME = 'application/json'
_handler = BaseAIHandler(model=_DEFAULT_MODEL, response_mime_type=_DEFAULT_RESPONSE_MIME)


def call_gemini(prompt: str, model: str = None, response_mime_type: str = None) -> Dict[str, Any]:
    """Unified wrapper to call the shared AI handler. Returns dict with 'ok' and 'response' or 'error'."""
    return _handler.generate(prompt, model=model, response_mime_type=response_mime_type)
