import os
import dj_database_url
from .settings import *

# Override settings for production
DEBUG = False

# Additional production hosts - settings.py already has basic ones
ALLOWED_HOSTS.append('sms-project-sibalon-silot.onrender.com')

# Security settings for production
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Ensure we're using the production database
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }

# Ensure secret key is set from environment
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)
