import os
import json
import logging
from typing import Dict, Any, List
import bcrypt
import jwt
import time

logger = logging.getLogger(__name__)

ROOT = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(ROOT, 'security')
ALLOWED_FILE = os.path.join(DATA_DIR, 'allowed_users.json')

MASTER_PASSWORD = os.environ.get('MASTER_PASSWORD', 'Pompernikel1401..')
JWT_SECRET = os.environ.get('JWT_SECRET', 'dev_jwt_secret_change_me')
JWT_ALGO = 'HS256'
TOKEN_EXP_SECONDS = int(os.environ.get('TOKEN_EXPIRE_SECONDS', '3600'))


def _ensure_dir():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
    except Exception:
        pass


def _load_allowed() -> List[Dict[str, Any]]:
    _ensure_dir()
    if not os.path.exists(ALLOWED_FILE):
        # create initial allowed with Blazej
        default = [{'email': 'blazej.guschall@gmail.com', 'password_hash': _hash_password(MASTER_PASSWORD)}]
        with open(ALLOWED_FILE, 'w') as f:
            json.dump(default, f)
        return default
    try:
        with open(ALLOWED_FILE, 'r') as f:
            return json.load(f)
    except Exception:
        logger.exception('Failed to load allowed users')
        return []


def _save_allowed(users: List[Dict[str, Any]]):
    _ensure_dir()
    try:
        with open(ALLOWED_FILE, 'w') as f:
            json.dump(users, f)
    except Exception:
        logger.exception('Failed to save allowed users')


def _hash_password(raw: str) -> str:
    return bcrypt.hashpw(raw.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def _verify_password(raw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(raw.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def authenticate_issue_token(email: str, password: str) -> Dict[str, Any]:
    users = _load_allowed()
    # find user
    for u in users:
        if u.get('email') == email:
            if _verify_password(password, u.get('password_hash', '')):
                payload = {'sub': email, 'iat': int(time.time())}
                token = jwt.encode({**payload, 'exp': int(time.time()) + TOKEN_EXP_SECONDS}, JWT_SECRET, algorithm=JWT_ALGO)
                return {'ok': True, 'token': token}
            return {'ok': False, 'error': 'invalid_credentials'}

    # not found: allow auto-registration only if correct master password and slots < 3
    if password == MASTER_PASSWORD:
        if len(users) < 3:
            new = {'email': email, 'password_hash': _hash_password(password)}
            users.append(new)
            _save_allowed(users)
            payload = {'sub': email, 'iat': int(time.time())}
            token = jwt.encode({**payload, 'exp': int(time.time()) + TOKEN_EXP_SECONDS}, JWT_SECRET, algorithm=JWT_ALGO)
            return {'ok': True, 'token': token, 'registered': True}
        else:
            return {'ok': False, 'error': 'max_users_reached'}

    return {'ok': False, 'error': 'not_allowed'}


def verify_token(token: str) -> Dict[str, Any]:
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return {'ok': True, 'email': data.get('sub')}
    except Exception as e:
        return {'ok': False, 'error': str(e)}
