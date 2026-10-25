from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "VK Technology – DIY Tech Projects"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "diy-tech-super-secure-jwt-secret-key-production-ready-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Internal Vercel Service Bindings
    SERVER_SERVICE_URL: str = os.getenv("SERVER_SERVICE_URL", "http://localhost:5000")
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'diy_store.db').replace(chr(92), '/')}"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    # Store Defaults (in Paise: ₹1 = 100 paise)
    DEFAULT_SHIPPING_PAISE: int = 7000  # ₹70 standard shipping
    FREE_SHIPPING_THRESHOLD_PAISE: int = 99900  # ₹999 free shipping threshold
    TAX_RATE_PERCENT: float = 18.0  # 18% GST (Electronics)
    COD_ENABLED: bool = True
    COD_MAX_LIMIT_PAISE: int = 2500000  # ₹25,000 max for COD
    
    # Payment Gateway - Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""
    MOCK_PAYMENTS: bool = True  # Automatically falls back to safe mock mode if keys are blank
    
    # Notifications
    MOCK_NOTIFICATIONS: bool = True
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "orders@vktechnology.in"
    OWNER_NOTIFICATION_EMAIL: str = "karthik.suroju@gmail.com"
    OWNER_NOTIFICATION_PHONE: str = "+918555997052"
    
    WHATSAPP_API_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    
    SMS_API_KEY: str = ""
    SMS_SENDER_ID: str = "VKTECH"
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

settings = Settings()
