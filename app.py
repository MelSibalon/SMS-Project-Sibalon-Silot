# Ultra-simple WSGI application for Render.com
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Explicitly set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_system.settings_production')

# Import the WSGI application
from django.core.wsgi import get_wsgi_application

# Create the application - this MUST be named 'app' for Render
app = get_wsgi_application()
