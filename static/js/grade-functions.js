/**
 * Grade Management Functions
 * Contains functions for adding, editing, and deleting grades
 */

// Function to add a new grade for a student
async function handleSaveGrade(studentId) {
    console.log('handleSaveGrade called with studentId:', studentId);
    
    // Convert string ID to number if needed
    if (typeof studentId === 'string') {
        studentId = parseInt(studentId.trim());
    }
    
    console.log('Converted studentId:', studentId);
    
    if (!studentId || isNaN(studentId)) {
        console.error('Invalid student ID:', studentId);
        showAlert('Error: Invalid student ID', 'danger');
        return;
    }
    
    try {
        // Get form values
        const subjectId = document.getElementById('grade_subject').value;
        const gradeType = document.getElementById('grade_type').value;
        const score = document.getElementById('grade_score').value;
        const maxScore = document.getElementById('grade_max_score').value;
        const date = document.getElementById('grade_date').value;
        const description = document.getElementById('grade_description').value;

        // Validate input
        if (!subjectId || !gradeType || !score || !maxScore || !date || !description) {
            showAlert('Please fill in all fields', 'warning');
            return;
        }

        // Prepare grade data
        const gradeData = {
            student: studentId,
            subject: subjectId,
            grade_type: gradeType,
            score: parseFloat(score),
            max_score: parseFloat(maxScore),
            date: date,
            description: description
        };

        console.log('Creating grade with data:', gradeData);
        showLoading();

        // Call API to create grade
        await createGrade(gradeData);
        
        hideLoading();
        showAlert('Grade added successfully!');

        // Reset form and close modal
        document.getElementById('add-grade-form').reset();
        // Set current date as default
        document.getElementById('grade_date').valueAsDate = new Date();
        
        // Close modal using a simpler approach with the data-bs-dismiss attribute
        document.querySelector('[data-bs-dismiss="modal"]').click();

        // Reload grades list
        await loadStudentGrades(studentId);
        
        // Refresh the page to show the updated grades
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch (error) {
        hideLoading();
        console.error('Error adding grade:', error);
        showAlert('Error adding grade: ' + error.message, 'danger');
    }
}

// Function to handle saving grade from subject detail page
async function handleSaveGradeFromSubject(subjectId) {
    try {
        // Get form values
        const studentId = document.getElementById('grade_student').value;
        const gradeType = document.getElementById('grade_type').value;
        const score = document.getElementById('grade_score').value;
        const maxScore = document.getElementById('grade_max_score').value;
        const date = document.getElementById('grade_date').value;
        const description = document.getElementById('grade_description').value;

        // Validate input
        if (!studentId || !gradeType || !score || !maxScore || !date || !description) {
            showAlert('Please fill in all fields', 'warning');
            return;
        }

        // Prepare grade data
        const gradeData = {
            student: studentId,
            subject: subjectId,
            grade_type: gradeType,
            score: parseFloat(score),
            max_score: parseFloat(maxScore),
            date: date,
            description: description
        };

        console.log('Creating grade with data:', gradeData);
        showLoading();

        // Call API to create grade
        await createGrade(gradeData);
        
        hideLoading();
        showAlert('Grade added successfully!');

        // Reset form and close modal
        document.getElementById('add-grade-form').reset();
        // Set current date as default
        document.getElementById('grade_date').valueAsDate = new Date();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addGradeModal'));
        modal.hide();

        // Reload grades list
        await loadSubjectGrades(subjectId);
    } catch (error) {
        hideLoading();
        console.error('Error adding grade:', error);
        showAlert('Error adding grade: ' + error.message, 'danger');
    }
}

// Function to load a grade for editing
async function loadEditGrade(gradeId) {
    try {
        const grade = await getGrade(gradeId);
        
        // Fill edit form with grade data
        document.getElementById('edit_grade_id').value = grade.id;
        document.getElementById('edit_grade_subject').value = grade.subject;
        document.getElementById('edit_grade_type').value = grade.grade_type;
        document.getElementById('edit_grade_score').value = grade.score;
        document.getElementById('edit_grade_max_score').value = grade.max_score;
        document.getElementById('edit_grade_date').value = grade.date;
        document.getElementById('edit_grade_description').value = grade.description;
        
        // Show edit modal
        const modal = new bootstrap.Modal(document.getElementById('editGradeModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading grade for edit:', error);
        showAlert('Error loading grade: ' + error.message, 'danger');
    }
}

// Function to update a grade
async function handleUpdateGrade() {
    try {
        const gradeId = document.getElementById('edit_grade_id').value;
        
        // Get updated values
        const subjectId = document.getElementById('edit_grade_subject').value;
        const gradeType = document.getElementById('edit_grade_type').value;
        const score = document.getElementById('edit_grade_score').value;
        const maxScore = document.getElementById('edit_grade_max_score').value;
        const date = document.getElementById('edit_grade_date').value;
        const description = document.getElementById('edit_grade_description').value;

        // Validate input
        if (!subjectId || !gradeType || !score || !maxScore || !date || !description) {
            showAlert('Please fill in all fields', 'warning');
            return;
        }

        // Prepare updated grade data
        const gradeData = {
            subject: subjectId,
            grade_type: gradeType,
            score: parseFloat(score),
            max_score: parseFloat(maxScore),
            date: date,
            description: description
        };

        console.log('Updating grade with data:', gradeData);
        showLoading();

        // Call API to update grade
        await updateGrade(gradeId, gradeData);
        
        hideLoading();
        showAlert('Grade updated successfully!');

        // Close edit modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editGradeModal'));
        modal.hide();

        // Reload grades - determine if we're on student or subject detail page
        const studentInfoSection = document.getElementById('student-info');
        const studentIdElement = document.getElementById('grade_student_id');
        if (studentInfoSection && studentIdElement && studentIdElement.value) {
            await loadStudentGrades(studentIdElement.value);
        } else {
            const subjectIdElement = document.getElementById('grade_subject_id');
            if (subjectIdElement && subjectIdElement.value) {
                await loadSubjectGrades(subjectIdElement.value);
            }
        }
    } catch (error) {
        hideLoading();
        console.error('Error updating grade:', error);
        showAlert('Error updating grade: ' + error.message, 'danger');
    }
}

// Function to confirm deletion of a grade
function confirmDeleteGrade(gradeId) {
    document.getElementById('delete_grade_id').value = gradeId;
    const modal = new bootstrap.Modal(document.getElementById('deleteGradeModal'));
    modal.show();
}

// Function to delete a grade
async function handleDeleteGrade() {
    try {
        const gradeId = document.getElementById('delete_grade_id').value;
        
        console.log('Deleting grade with ID:', gradeId);
        showLoading();

        // Call API to delete grade
        await deleteGrade(gradeId);
        
        hideLoading();
        showAlert('Grade deleted successfully!');

        // Close delete modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteGradeModal'));
        modal.hide();

        // Reload grades - determine if we're on student or subject detail page
        const studentInfoSection = document.getElementById('student-info');
        const studentIdElement = document.getElementById('grade_student_id');
        if (studentInfoSection && studentIdElement && studentIdElement.value) {
            await loadStudentGrades(studentIdElement.value);
        } else {
            const subjectIdElement = document.getElementById('grade_subject_id');
            if (subjectIdElement && subjectIdElement.value) {
                await loadSubjectGrades(subjectIdElement.value);
            }
        }
    } catch (error) {
        hideLoading();
        console.error('Error deleting grade:', error);
        showAlert('Error deleting grade: ' + error.message, 'danger');
    }
}

// Function to load student's enrolled subjects for the grade modal
async function loadStudentSubjectsForGrade(studentId) {
    try {
        const subjects = await getStudentSubjects(studentId);
        const subjectSelect = document.getElementById('grade_subject');
        const editSubjectSelect = document.getElementById('edit_grade_subject');
        
        // Clear current options except the first placeholder option
        while (subjectSelect.options.length > 1) {
            subjectSelect.remove(1);
        }
        
        if (subjects.length === 0) {
            // If no subjects, add a disabled option
            const option = document.createElement('option');
            option.text = 'No subjects enrolled';
            option.disabled = true;
            subjectSelect.add(option);
            return;
        }
        
        // Add the subjects to the select elements
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.text = subject.name;
            subjectSelect.add(option);
            
            // Also add to edit modal if it exists
            if (editSubjectSelect) {
                const editOption = document.createElement('option');
                editOption.value = subject.id;
                editOption.text = subject.name;
                editSubjectSelect.add(editOption);
            }
        });
    } catch (error) {
        console.error('Error loading student subjects for grade:', error);
        showAlert('Error loading subjects: ' + error.message, 'danger');
    }
}

// Make grade functions globally available
window.handleSaveGrade = handleSaveGrade;
window.handleSaveGradeFromSubject = handleSaveGradeFromSubject;
window.loadEditGrade = loadEditGrade;
window.handleUpdateGrade = handleUpdateGrade;
window.confirmDeleteGrade = confirmDeleteGrade;
window.handleDeleteGrade = handleDeleteGrade;
window.loadStudentSubjectsForGrade = loadStudentSubjectsForGrade;
