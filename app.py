# app.py - Direct entry point for Render.com
import os
import sys

# Add the project directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import the WSGI application from Django project
from student_management_system.wsgi import application as django_application

# Expose the application variable expected by Render
app = django_application
