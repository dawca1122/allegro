import os
import json
import logging
from typing import Dict, Any
import socket

try:
    import google.generativeai as genai
except Exception:
    genai = None

logger = logging.getLogger(__name__)


class BaseAIHandler:
    def __init__(self, model: str = 'models/gemini-3-pro-preview', response_mime_type: str = 'application/json'):
        self.model = model
        self.response_mime_type = response_mime_type

    def generate(self, prompt: str, model: str = None, response_mime_type: str = None) -> Dict[str, Any]:
        model = model or self.model
        response_mime_type = response_mime_type or self.response_mime_type

        # Heartbeat / host check: prevent running AI on unauthorized hosts
        allowed_host = os.environ.get('ALLOWED_HOST')
        if allowed_host:
            try:
                current = socket.gethostname()
                if allowed_host != current:
                    msg = f'Host {current} not allowed to run AI (allowed: {allowed_host})'
                    logger.error(msg)
                    return {'ok': False, 'error': msg}
            except Exception:
                logger.exception('Host check failed')

        if genai is None:
            msg = 'google.generativeai not installed'
            logger.error(msg)
            return {'ok': False, 'error': msg}

        api_key = os.environ.get('GOOGLE_API_KEY')
        if not api_key:
            msg = 'GOOGLE_API_KEY not set'
            logger.error(msg)
            return {'ok': False, 'error': msg}

        try:
            genai.configure(api_key=api_key)
            response = genai.generate(model=model, prompt=prompt, response_mime_type=response_mime_type)

            text = None
            if hasattr(response, 'text'):
                text = response.text
            else:
                text = getattr(response, 'content', None) or str(response)

            parsed = None
            if response_mime_type == 'application/json' and text:
                try:
                    parsed = json.loads(text)
                except Exception:
                    try:
                        if hasattr(response, 'candidates') and len(response.candidates) > 0:
                            cand = response.candidates[0]
                            parsed = json.loads(cand.get('content', cand.get('text', '{}')))
                    except Exception:
                        logger.exception('Failed to parse JSON from model response')
                        parsed = {'raw': text}
            else:
                parsed = {'raw': text}

            try:
                if hasattr(response, 'metadata'):
                    logger.info('Model metadata: %s', getattr(response, 'metadata'))
            except Exception:
                pass

            return {'ok': True, 'response': parsed}
        except Exception as e:
            logger.exception('Model generate failed')
            return {'ok': False, 'error': str(e)}
