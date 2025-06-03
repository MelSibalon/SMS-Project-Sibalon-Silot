from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for our API views
router = DefaultRouter()
router.register(r'students', views.StudentViewSet)
router.register(r'subjects', views.SubjectViewSet)
router.register(r'grades', views.GradeViewSet)

urlpatterns = [
    # API URLs
    path('api/', include(router.urls)),
    
    # Frontend URLs
    path('', views.dashboard, name='dashboard'),
    path('students/', views.index, name='index'),
    path('students/<int:student_id>/', views.student_detail, name='student_detail'),
    path('subjects/', views.subjects, name='subjects'),
    path('subjects/<int:subject_id>/', views.subject_detail, name='subject_detail'),
]
