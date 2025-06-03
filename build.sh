#!/usr/bin/env bash
# Build script for Render.com deployment

set -o errexit

cd student_management_system

# Install Python dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
