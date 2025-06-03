import os
import dj_database_url
from .settings import *

# Production settings
DEBUG = False

# Allow Render.com domain and your custom domain if you have one
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com']

# Configure static files for production
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Add whitenoise for static file serving
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Database configuration for Render - uses SQLite by default if no DATABASE_URL
# For production, configure a PostgreSQL database in Render dashboard
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# Security settings - temporarily disable for initial deployment
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Use environment variable for secret key in production
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)
