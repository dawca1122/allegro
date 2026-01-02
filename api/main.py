from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import importlib
from typing import Any

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DISABLE_AUTH = os.environ.get('DISABLE_AUTH', '0') == '1'

# small auth dependency used by endpoints, bypassed if DISABLE_AUTH=1
async def get_current_user(request: Request) -> Any:
    if DISABLE_AUTH:
        return {"sub": "dev", "name": "Dev User"}
    auth = request.headers.get('authorization')
    if not auth:
        raise HTTPException(status_code=401, detail="Not authenticated")
    # real token validation should be here
    return {"sub": "user", "name": "API User"}

# helper: try to import a handler function from modules
def _call_module_func(func_name: str, *args, **kwargs):
    try:
        # import modules package dynamically
        modules_pkg = importlib.import_module('modules')
    except Exception:
        modules_pkg = None

    # try several likely module names
    candidates = []
    if modules_pkg:
        # look for top-level functions first
        candidates.append((modules_pkg, func_name))
        # look into common submodules
        for subname in ['dashboard', 'repricer', 'repricing', 'negotiator', 'ai', 'main']:
            try:
                sub = importlib.import_module(f'modules.{subname}')
                candidates.append((sub, func_name))
            except Exception:
                pass
    for mod, fn in candidates:
        if hasattr(mod, fn):
            try:
                return getattr(mod, fn)(*args, **kwargs)
            except Exception as e:
                raise
    # nothing found
    return None

@app.get('/api/orders/dashboard')
async def orders_dashboard(user=Depends(get_current_user)):
    try:
        result = _call_module_func('get_dashboard')
        if result is None:
            # try alternative function name
            result = _call_module_func('orders_dashboard')
        if result is None:
            # fallback sample
            result = [
                {"id":"1","title":"Sample Item A","price":100.0,"suggested_price":95.0},
                {"id":"2","title":"Sample Item B","price":50.0},
            ]
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post('/api/execute_repricing')
async def execute_repricing(request: Request, user=Depends(get_current_user)):
    payload = await request.json()
    try:
        result = _call_module_func('execute_repricing', payload)
        if result is None:
            result = {"status": "ok", "updated": 0}
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post('/api/negotiate')
async def negotiate(request: Request, user=Depends(get_current_user)):
    payload = await request.json()
    try:
        result = _call_module_func('negotiate', payload)
        if result is None:
            result = {"status": "ok", "negotiated": 0}
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Root health endpoint
@app.get('/api/health')
async def health():
    return {"status": "ok"}
