from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Student(models.Model):
    YEAR_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
        (5, '5th Year'),
    ]
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    student_id = models.CharField(max_length=20, unique=True)
    email = models.EmailField(unique=True)
    date_of_birth = models.DateField()
    course = models.CharField(max_length=50, blank=True, null=True)
    year = models.IntegerField(choices=YEAR_CHOICES, default=1)
    section = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        course_info = f"{self.course} {self.year}({self.section})" if self.course else ""
        return f"{self.first_name} {self.last_name} ({self.student_id}) {course_info}".strip()

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, null=True)
    # Making units completely optional - can be null or blank with a default value of 3
    units = models.IntegerField(null=True, blank=True, default=3)
    students = models.ManyToManyField(Student, related_name='subjects')
    
    def __str__(self):
        return f"{self.name} ({self.code})"

class Grade(models.Model):
    GRADE_TYPES = [
        ('ACTIVITY', 'Activity'),
        ('QUIZ', 'Quiz'),
        ('EXAM', 'Exam'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='grades')
    grade_type = models.CharField(max_length=10, choices=GRADE_TYPES)
    score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0), MaxValueValidator(100)])
    max_score = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0)])
    date = models.DateField()
    description = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('student', 'subject', 'grade_type', 'date')
    
    def __str__(self):
        return f"{self.student} - {self.subject} - {self.grade_type} - {self.score}/{self.max_score}"
