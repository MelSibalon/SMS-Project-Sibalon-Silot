#!/bin/bash
# Simple build script for Render.com deployment

set -o errexit

# Print debug info
echo "Python version:"
python --version
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input

# Run migrations
echo "Running migrations..."
python manage.py migrate

echo "Build completed successfully"