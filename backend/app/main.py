import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import (
    auth, users, categories, products, cart, checkout, orders, payments, webhooks, admin, settings as store_settings_api
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    await init_db()
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready REST API for VK Technology – DIY Tech Projects e-commerce platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for product images
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(users.router, prefix=api_v1_prefix)
app.include_router(categories.router, prefix=api_v1_prefix)
app.include_router(products.router, prefix=api_v1_prefix)
app.include_router(cart.router, prefix=api_v1_prefix)
app.include_router(checkout.router, prefix=api_v1_prefix)
app.include_router(orders.router, prefix=api_v1_prefix)
app.include_router(payments.router, prefix=api_v1_prefix)
app.include_router(webhooks.router, prefix=api_v1_prefix)
app.include_router(admin.router, prefix=api_v1_prefix)
app.include_router(store_settings_api.router, prefix=api_v1_prefix)

@app.get("/internal/server-health", tags=["Internal"])
async def internal_server_health():
    import httpx
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{settings.SERVER_SERVICE_URL.rstrip('/')}/api/health", timeout=5.0)
            return {"service": "backend-fastapi", "serverStatus": resp.json()}
    except Exception as exc:
        return JSONResponse(status_code=502, content={"error": "Failed to communicate with internal server service", "details": str(exc)})

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "version": "1.0.0"
    }
