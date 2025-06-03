/**
 * Fix for grade saving functionality
 * This script overrides the problematic functions to prevent errors
 */

// Create safe versions of the utility functions
window.safeShowLoading = function() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('d-none');
    }
};

window.safeHideLoading = function() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('d-none');
    }
};

window.safeShowAlert = function(message, type = 'success') {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find a suitable container
    const container = document.getElementById('notification-container') || 
                     document.querySelector('.container') || 
                     document.querySelector('.content') || 
                     document.body;
    
    // Insert at the beginning of the container
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 500);
    }, 5000);
};

// Override the handleSaveGrade function to use our safe functions
const originalHandleSaveGrade = window.handleSaveGrade;
window.handleSaveGrade = async function(studentId) {
    console.log('Fixed handleSaveGrade called with studentId:', studentId);
    
    // Convert string ID to number if needed
    if (typeof studentId === 'string') {
        studentId = parseInt(studentId.trim());
    }
    
    console.log('Converted studentId:', studentId);
    
    if (!studentId || isNaN(studentId)) {
        console.error('Invalid student ID:', studentId);
        safeShowAlert('Error: Invalid student ID', 'danger');
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
            safeShowAlert('Please fill in all fields', 'warning');
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
        // Using safe function to avoid errors
        safeShowLoading();

        // Call API to create grade
        await createGrade(gradeData);
        
        // Using safe function to avoid errors
        safeHideLoading();
        safeShowAlert('Grade added successfully!');

        // Reset form and close modal
        document.getElementById('add-grade-form').reset();
        // Set current date as default
        document.getElementById('grade_date').valueAsDate = new Date();
        
        // Close modal by clicking the dismiss button
        const closeButton = document.querySelector('.modal .btn-close') || 
                           document.querySelector('.modal .btn-secondary');
        if (closeButton) {
            closeButton.click();
        }

        // Reload the page after a short delay to show the updated grades
        setTimeout(() => {
            window.location.reload();
        }, 800);
    } catch (error) {
        safeHideLoading();
        console.error('Error adding grade:', error);
        safeShowAlert('Error adding grade: ' + error.message, 'danger');
    }
};
