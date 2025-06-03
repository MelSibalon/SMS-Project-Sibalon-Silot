from django.contrib import admin
from .models import Student, Subject, Grade

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'first_name', 'last_name', 'email', 'date_of_birth')
    search_fields = ('first_name', 'last_name', 'student_id', 'email')
    list_filter = ('date_of_birth',)
    ordering = ('last_name', 'first_name')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'description')
    search_fields = ('name', 'code')
    filter_horizontal = ('students',)

@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'grade_type', 'score', 'max_score', 'date')
    list_filter = ('grade_type', 'date', 'subject')
    search_fields = ('student__first_name', 'student__last_name', 'subject__name')
    date_hierarchy = 'date'
