# Debug views to help diagnose production issues
from django.http import JsonResponse
from django.conf import settings
import os

def debug_info(request):
    """Return system information to help diagnose deployment issues"""
    from student_portal.models import Student, Subject
    
    # Basic system info
    data = {
        'debug_mode': settings.DEBUG,
        'database': settings.DATABASES['default']['ENGINE'],
        'static_url': settings.STATIC_URL,
        'static_root': settings.STATIC_ROOT,
        'allowed_hosts': settings.ALLOWED_HOSTS,
        'base_dir': str(settings.BASE_DIR),
        'middleware': settings.MIDDLEWARE,
        'static_storage': settings.STATICFILES_STORAGE,
    }
    
    # Data counts
    try:
        data['student_count'] = Student.objects.count()
        data['subject_count'] = Subject.objects.count()
        data['database_ok'] = True
    except Exception as e:
        data['database_ok'] = False
        data['database_error'] = str(e)
    
    # Static files info
    if os.path.exists(settings.STATIC_ROOT):
        data['static_root_exists'] = True
        try:
            files = os.listdir(settings.STATIC_ROOT)
            data['static_files_count'] = len(files)
            data['static_files_sample'] = files[:5] if files else []
        except Exception as e:
            data['static_files_error'] = str(e)
    else:
        data['static_root_exists'] = False
    
    return JsonResponse(data)
