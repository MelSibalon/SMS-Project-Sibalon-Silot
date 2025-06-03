"""
WSGI config for student_management_system project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Use production settings if in production environment
if os.environ.get('ENVIRONMENT') == 'production' or os.environ.get('RENDER', False):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_system.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'student_management_system.settings')

application = get_wsgi_application()
