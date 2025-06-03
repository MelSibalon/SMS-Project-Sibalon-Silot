from rest_framework import serializers
from .models import Student, Subject, Grade

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    # Make students field optional by setting required=False
    students = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Student.objects.all(),
        required=False
    )
    
    class Meta:
        model = Subject
        fields = '__all__'
        
    def create(self, validated_data):
        # Auto-populate units with default value if not provided
        if 'units' not in validated_data:
            validated_data['units'] = 3
            
        # Set empty list for students if not provided
        if 'students' not in validated_data:
            validated_data['students'] = []
            
        return super().create(validated_data)
        
    def update(self, instance, validated_data):
        # Keep existing units value if not provided
        if 'units' not in validated_data and instance.units:
            validated_data['units'] = instance.units
        return super().update(instance, validated_data)

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Grade
        fields = '__all__'
    
    def get_student_name(self, obj):
        return str(obj.student)
    
    def get_subject_name(self, obj):
        return str(obj.subject)
