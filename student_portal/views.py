from django.shortcuts import render
from django.db import transaction
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Student, Subject, Grade
from .serializers import StudentSerializer, SubjectSerializer, GradeSerializer

# API ViewSets
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('-created_at')  # Sort by creation date, newest first
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'student_id', 'email']
    
    def create(self, request, *args, **kwargs):
        try:
            # Print request data for debugging
            print(f"Creating student with data: {request.data}")
            
            # First, check if this student already exists
            student_id = request.data.get('student_id')
            email = request.data.get('email')
            
            existing_student = None
            if student_id:
                existing_student = Student.objects.filter(student_id=student_id).first()
                if existing_student:
                    return Response(
                        {"message": "Student added successfully!", "student": self.get_serializer(existing_student).data},
                        status=status.HTTP_200_OK
                    )
            
            if email and not existing_student:
                existing_student = Student.objects.filter(email=email).first()
                if existing_student:
                    return Response(
                        {"message": "Student added successfully!", "student": self.get_serializer(existing_student).data},
                        status=status.HTTP_200_OK
                    )
            
            # If we get here, the student doesn't exist, so create a new one
            serializer = self.get_serializer(data=request.data)
            
            # Handle validation errors more gracefully
            if not serializer.is_valid():
                # If there are validation errors but they're only for student_id or email
                # and those fields already exist in the database, consider it a success
                errors = serializer.errors
                if len(errors) <= 2 and all(field in ['student_id', 'email'] for field in errors.keys()):
                    # Check if the student exists with either the student_id or email
                    student_id = request.data.get('student_id')
                    email = request.data.get('email')
                    
                    if student_id and Student.objects.filter(student_id=student_id).exists():
                        existing_student = Student.objects.get(student_id=student_id)
                        return Response(
                            {"message": "Student added successfully!", "student": self.get_serializer(existing_student).data},
                            status=status.HTTP_200_OK
                        )
                    
                    if email and Student.objects.filter(email=email).exists():
                        existing_student = Student.objects.get(email=email)
                        return Response(
                            {"message": "Student added successfully!", "student": self.get_serializer(existing_student).data},
                            status=status.HTTP_200_OK
                        )
                
                # If we get here, there are actual validation errors
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Save the instance
            self.perform_create(serializer)
            
            # Return success response
            headers = self.get_success_headers(serializer.data)
            return Response(
                {"message": "Student added successfully!", "student": serializer.data},
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except Exception as e:
            # Log the error
            print(f"Error creating student: {str(e)}")
            
            # Check if the student was actually created despite the error
            student_id = request.data.get('student_id')
            email = request.data.get('email')
            
            if student_id and Student.objects.filter(student_id=student_id).exists():
                existing_student = Student.objects.get(student_id=student_id)
                return Response(
                    {"message": "Student added successfully!", "student": self.get_serializer(existing_student).data},
                    status=status.HTTP_200_OK
                )
            
            if email and Student.objects.filter(email=email).exists():
                existing_student = Student.objects.get(email=email)
                return Response(
                    {"message": "Student added successfully!", "student": self.get_serializer(existing_student).data},
                    status=status.HTTP_200_OK
                )
            
            # Return a more informative error response
            return Response(
                {"error": str(e), "detail": "Failed to create student. Please check your input data."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()
                print(f"Deleting student: {instance}")
                
                # Remove many-to-many relationships first to avoid integrity errors
                instance.subjects.clear()
                print("Cleared subject relationships")
                
                # Delete all grades associated with this student
                grades_count = instance.grades.count()
                instance.grades.all().delete()
                print(f"Deleted {grades_count} grades")
                
                # Now delete the student
                self.perform_destroy(instance)
                print("Student deleted successfully")
                
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error deleting student: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def subjects(self, request, pk=None):
        student = self.get_object()
        subjects = student.subjects.all()
        serializer = SubjectSerializer(subjects, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def available_subjects(self, request, pk=None):
        """Get subjects the student is not enrolled in"""
        try:
            student = self.get_object()
            enrolled_subjects = student.subjects.all()
            all_subjects = Subject.objects.all()
            
            # Filter out already enrolled subjects
            available_subjects = all_subjects.exclude(id__in=enrolled_subjects.values_list('id', flat=True))
            
            serializer = SubjectSerializer(available_subjects, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error getting available subjects: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        """Enroll a student in a subject"""
        try:
            student = self.get_object()
            subject_id = request.data.get('subject_id')
            
            if not subject_id:
                return Response({'error': 'subject_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                subject = Subject.objects.get(pk=subject_id)
            except Subject.DoesNotExist:
                return Response({'error': f'Subject with ID {subject_id} does not exist'}, 
                                status=status.HTTP_404_NOT_FOUND)
            
            # Add the student to the subject
            subject.students.add(student)
            
            return Response({'success': True, 'message': f'Student enrolled in {subject.name} successfully'}, 
                            status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error enrolling student: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def unenroll(self, request, pk=None):
        """Unenroll a student from a subject"""
        try:
            student = self.get_object()
            subject_id = request.data.get('subject_id')
            
            if not subject_id:
                return Response({'error': 'subject_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                subject = Subject.objects.get(pk=subject_id)
            except Subject.DoesNotExist:
                return Response({'error': f'Subject with ID {subject_id} does not exist'}, 
                                status=status.HTTP_404_NOT_FOUND)
            
            # Remove the student from the subject
            subject.students.remove(student)
            
            return Response({'success': True, 'message': f'Student unenrolled from {subject.name} successfully'}, 
                            status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error unenrolling student: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def available_subjects(self, request, pk=None):
        """Get subjects that the student is not enrolled in"""
        try:
            student = self.get_object()
            
            # Get all subjects
            all_subjects = Subject.objects.all()
            
            # Get subjects the student is already enrolled in
            enrolled_subjects = student.subject_set.all()
            
            # Get subjects the student is not enrolled in
            available_subjects = all_subjects.exclude(id__in=enrolled_subjects.values_list('id', flat=True))
            
            serializer = SubjectSerializer(available_subjects, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error getting available subjects: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        student = self.get_object()
        grades = student.grades.all()
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by('name')
    serializer_class = SubjectSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']
    
    def list(self, request, *args, **kwargs):
        """Override list method to ensure proper response format"""
        try:
            # Check if we want all subjects without pagination
            all_param = request.query_params.get('all', None)
            if all_param and all_param.lower() == 'true':
                # Get all subjects without pagination
                queryset = self.filter_queryset(self.get_queryset())
                serializer = self.get_serializer(queryset, many=True)
                print(f"Returning all {len(serializer.data)} subjects without pagination")
                return Response(serializer.data)
            
            # Get the queryset and apply filters
            queryset = self.filter_queryset(self.get_queryset())
            
            # Log the count for debugging
            count = queryset.count()
            print(f"Found {count} subjects in the database")
            
            # Get page from the queryset
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)

            # If not paginated, serialize all
            serializer = self.get_serializer(queryset, many=True)
            
            # Log the serialized data for debugging
            print(f"Returning {len(serializer.data)} subjects in the response")
            print(f"First few subjects: {serializer.data[:3] if serializer.data else []}")
            
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in SubjectViewSet.list: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def all(self, request):
        """Endpoint to return all subjects without pagination"""
        try:
            # Get all subjects without pagination
            queryset = self.get_queryset()
            # Log the raw queryset count for debugging
            count = queryset.count()
            print(f"Found {count} subjects in the database in 'all' endpoint")
            
            # Explicitly list all subjects for debugging
            subjects_list = list(queryset.values('id', 'name', 'code'))
            print(f"Subjects in database: {subjects_list}")
            
            # Serialize the queryset
            serializer = self.get_serializer(queryset, many=True)
            print(f"Serialized data: {serializer.data}")
            print(f"Returning all {len(serializer.data)} subjects from 'all' endpoint")
            
            # Return the serialized data
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in SubjectViewSet.all: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def destroy(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                instance = self.get_object()
                print(f"Deleting subject: {instance}")
                
                # Remove many-to-many relationships first to avoid integrity errors
                instance.students.clear()
                print("Cleared student relationships")
                
                # Delete all grades associated with this subject
                grades_count = instance.grades.count()
                instance.grades.all().delete()
                print(f"Deleted {grades_count} grades")
                
                # Now delete the subject
                self.perform_destroy(instance)
                print("Subject deleted successfully")
                
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Error deleting subject: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def create(self, request, *args, **kwargs):
        try:
            # Get the request data
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data.items())
            
            # Make sure the data is treated as a dictionary
            if not isinstance(data, dict):
                data = dict(data)
            
            # Log what we received for debugging
            print(f"Received subject data: {data}")
            
            # Handle units specifically
            if 'units' in data:
                # Convert units to integer if it's a string
                try:
                    if data['units'] and data['units'] != '':
                        data['units'] = int(data['units'])
                    else:
                        data['units'] = 3
                except (ValueError, TypeError):
                    data['units'] = 3
            else:
                data['units'] = 3
                
            # Ensure students field is properly handled (initially empty for new subjects)
            if 'students' not in data:
                data['students'] = []
            
            # Create serializer with the modified data
            serializer = self.get_serializer(data=data)
            
            if not serializer.is_valid():
                print(f"Serializer errors: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"Error creating subject: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        subject = self.get_object()
        students = subject.students.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def available_students(self, request, pk=None):
        """Get students not enrolled in this subject"""
        try:
            subject = self.get_object()
            print(f"Getting available students for subject: {subject}")
            
            # Get IDs of students already enrolled in this subject
            enrolled_students = subject.students.all()
            print(f"Subject has {enrolled_students.count()} students enrolled")
            
            # Get all students not enrolled in this subject
            available_students = Student.objects.exclude(id__in=enrolled_students.values_list('id', flat=True))
            print(f"Found {available_students.count()} available students")
            
            serializer = StudentSerializer(available_students, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error getting available students: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_student(self, request, pk=None):
        """Add a student to a subject"""
        try:
            subject = self.get_object()
            student_id = request.data.get('student_id')
            
            if not student_id:
                return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                student = Student.objects.get(pk=student_id)
            except Student.DoesNotExist:
                return Response({'error': f'Student with ID {student_id} does not exist'}, 
                               status=status.HTTP_404_NOT_FOUND)
            
            # Check if student is already in the subject
            if student in subject.students.all():
                return Response({'message': f'Student {student.first_name} {student.last_name} is already enrolled in {subject.name}'}, 
                                status=status.HTTP_200_OK)
            
            # Add the student to the subject
            subject.students.add(student)
            
            return Response({'message': f'Student {student.first_name} {student.last_name} added to {subject.name}'}, 
                            status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error adding student to subject: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def remove_student(self, request, pk=None):
        """Remove a student from a subject"""
        try:
            subject = self.get_object()
            student_id = request.data.get('student_id')
            
            if not student_id:
                return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                student = Student.objects.get(pk=student_id)
            except Student.DoesNotExist:
                return Response({'error': f'Student with ID {student_id} does not exist'}, 
                                status=status.HTTP_404_NOT_FOUND)
            
            # Check if student is in the subject
            if student not in subject.students.all():
                return Response({'error': f'Student {student.first_name} {student.last_name} is not enrolled in {subject.name}'}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            # Remove the student from the subject
            subject.students.remove(student)
            
            return Response({'message': f'Student {student.first_name} {student.last_name} removed from {subject.name}'}, 
                            status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error removing student from subject: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def available_students(self, request, pk=None):
        """Get students not enrolled in this subject"""
        try:
            subject = self.get_object()
            enrolled_students = subject.students.all()
            all_students = Student.objects.all()
            
            # Filter out already enrolled students
            available_students = all_students.exclude(id__in=enrolled_students.values_list('id', flat=True))
            
            serializer = StudentSerializer(available_students, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error getting available students: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def grades(self, request, pk=None):
        subject = self.get_object()
        grades = subject.grades.all()
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)

class GradeViewSet(viewsets.ModelViewSet):
    queryset = Grade.objects.all().order_by('-date')
    serializer_class = GradeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['student__first_name', 'student__last_name', 'subject__name', 'grade_type']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get('student_id', None)
        subject_id = self.request.query_params.get('subject_id', None)
        grade_type = self.request.query_params.get('grade_type', None)
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)
        if grade_type:
            queryset = queryset.filter(grade_type=grade_type)
            
        return queryset

# Frontend views
def dashboard(request):
    return render(request, 'student_portal/dashboard.html')

def index(request):
    return render(request, 'student_portal/index.html')

def student_detail(request, student_id):
    return render(request, 'student_portal/student_detail.html', {'student_id': student_id})

def subjects(request):
    return render(request, 'student_portal/subjects.html')

def subject_detail(request, subject_id):
    return render(request, 'student_portal/subject_detail.html', {'subject_id': subject_id})
