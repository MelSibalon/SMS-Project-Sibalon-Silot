# Student Management System

A comprehensive Django-based Student Management System designed to manage students, subjects, and related educational data.

## Contributors

- Sibalon
- Silot

## Features

- Student registration and management
- Subject creation and management
- Student-subject relationship management
- Client-side pagination for better navigation through data
- Responsive design for various devices

## Requirements

- Python 3.8 or higher
- Django 3.2 or higher
- Other dependencies as listed in requirements.txt

## Setup and Installation

### Option 1: With Virtual Environment (Recommended)

1. Clone the repository:
   ```
   git clone <your-repository-url>
   cd Sibalon-Silot
   ```

2. Create and activate a virtual environment:
   ```
   # On Windows
   python -m venv .venv
   .venv\Scripts\activate

   # On macOS/Linux
   python -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Navigate to the project directory:
   ```
   cd student_management_system
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser (admin):
   ```
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```
   python manage.py runserver
   ```

8. Access the application at http://127.0.0.1:8000/

### Option 2: Without Virtual Environment

1. Clone the repository:
   ```
   git clone <your-repository-url>
   cd Sibalon-Silot
   ```

2. Install dependencies directly (ensure Python is installed and in your PATH):
   ```
   pip install -r requirements.txt
   ```

3. Navigate to the project directory:
   ```
   cd student_management_system
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser (admin):
   ```
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

7. Access the application at http://127.0.0.1:8000/

## Application Structure

- `student_management_system/` - Main Django project directory
  - `student_portal/` - Main application for student management
  - `templates/` - HTML templates
  - `static/` - CSS, JavaScript, and media files
  - `api/` - API endpoints for the application

## Usage

1. Login with your superuser credentials
2. Use the admin interface to manage students, subjects, and other data
3. Access the student portal to view and interact with the student management system

## Note

This project implements client-side pagination to display all students and subjects efficiently. Navigation features include pagination controls, page number indicators, and keyboard shortcuts for better user experience.

## Deployment

### Deploying on Render

1. Create a Render account at [render.com](https://render.com)

2. Create a new Web Service and connect your GitHub repository

3. Configure your service:
   - **Name**: Student-Management-System (or your preferred name)
   - **Region**: Choose the region closest to you
   - **Root Directory**: Leave empty if your repository has the same structure as this project
   - **Build Command**: `pip install -r student_management_system/requirements.txt`
   - **Start Command**: `cd student_management_system && gunicorn student_management_system.wsgi`
   - **Instance Type**: Free

4. Add environment variables:
   - `DEBUG`: false
   - `SECRET_KEY`: Generate a secure key
   - `ALLOWED_HOSTS`: your-app-name.onrender.com,localhost,127.0.0.1

5. Click 'Create Web Service'

6. Once deployed, set up a PostgreSQL database (optional):
   - Create a new PostgreSQL database from Render dashboard
   - Add the database URL as `DATABASE_URL` environment variable
   - Update settings.py to use this database connection

Note: Free instances on Render will spin down after periods of inactivity. The first request after inactivity may take some time to respond.
