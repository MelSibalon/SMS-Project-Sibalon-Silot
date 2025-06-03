#!/usr/bin/env bash
# Build script for Render.com deployment

set -o errexit

# Print Python version for debugging
python --version

# Install Python dependencies
pip install -r requirements.txt

# Collect static files with verbosity
echo "Collecting static files..."
python manage.py collectstatic --no-input -v 2

# Run migrations with safety checks
echo "Running migrations..."
python manage.py makemigrations --check --dry-run
python manage.py migrate --plan
python manage.py migrate

# Show static directory structure for debugging
echo "Static files directory structure:"
find staticfiles -type f | sort | head -20