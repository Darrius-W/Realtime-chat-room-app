import os
from datetime import timedelta
from dotenv import load_dotenv

# Locate and read .env
load_dotenv()

# Configuration Class: Extracts sensitive data from system ennvironment. Used to isolate 
# system settings from logical operations
class Config:
    
    # Secure token used by Flask to encrypt server-side session cookies
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default_fallback_secret_key')
    
    # Target location indicating where database is
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Disable modification tracking to reduce memory overhead
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Manages session storage and browser-close cleanup
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = False
    
    # Limits active session longevity
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=30)