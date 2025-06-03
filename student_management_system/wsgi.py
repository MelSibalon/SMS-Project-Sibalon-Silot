"""
WSGI config for student_management_system project.

It exposes the WSGI callable as a module-level variable named `application`.
"""

import os
import sys

# Add the project root to the Python path to help imports resolve correctly
path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if path not in sys.path:
    sys.path.append(path)

# Always use production settings on Render
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_system.settings_production')

# Get WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
