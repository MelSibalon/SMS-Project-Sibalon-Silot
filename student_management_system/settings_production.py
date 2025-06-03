import os
import dj_database_url
from .settings import *

# Enable debug mode for troubleshooting
DEBUG = True

# Allow any host for now (we'll lock this down later)
ALLOWED_HOSTS = ['*']

# Ensure Whitenoise is configured correctly
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# CORS settings - allow all for now
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Disable security settings while debugging
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Simplified database configuration with better error handling
try:
    if 'DATABASE_URL' in os.environ:
        DATABASES = {
            'default': dj_database_url.config(
                default=os.environ.get('DATABASE_URL'),
                conn_max_age=600,
                conn_health_checks=True,
                ssl_require=False,  # Try without SSL first
            )
        }
        print(f"Using database configuration: {DATABASES['default']['ENGINE']}")
except Exception as e:
    print(f"Error configuring database: {e}")
    # Fallback to SQLite for debugging if there's an issue
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Ensure secret key is set from environment
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)
