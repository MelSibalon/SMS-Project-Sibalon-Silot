/**
 * Complete Grade Functionality Fix
 * This script fixes all issues with grade creation and updating
 */

// Debugging function to inspect API responses
async function logApiResponse(url, options) {
    try {
        // Create a copy of the request
        const response = await fetch(url, options);
        const clonedResponse = response.clone();
        
        // Get the response content
        const text = await clonedResponse.text();
        console.log('API Response:', {
            url: url,
            status: response.status,
            statusText: response.statusText,
            body: text
        });
        
        // Return the original response for further processing
        return response;
    } catch (error) {
        console.error('Error in logApiResponse:', error);
        throw error;
    }
}

// Add a custom fetch function for debugging
window.debugFetchAPI = async function(endpoint, options = {}) {
    try {
        const url = options.method === undefined || options.method === 'GET' 
            ? `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}_=${new Date().getTime()}` 
            : `${API_BASE_URL}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
        
        if (options.method !== undefined && options.method !== 'GET') {
            headers['X-CSRFToken'] = getCookie('csrftoken');
        }
            
        console.log('Debug API Request:', {
            url: url,
            method: options.method || 'GET',
            headers: headers,
            body: options.body
        });
        
        const response = await logApiResponse(url, {
            headers: headers,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { success: true };
        }
        
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    } catch (error) {
        console.error('API Request Error:', error);
        showAlert(error.message, 'danger');
        throw error;
    }
};

// Fix grade update function to properly update grades
window.fixedUpdateGrade = async function(id, gradeData) {
    console.log('Using fixed update grade function with ID:', id, 'Data:', gradeData);
    return debugFetchAPI(`grades/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(gradeData)
    });
};

// Fix the handleSaveGrade function to make description optional
window.handleSaveGrade = async function(studentId) {
    console.log('Fixed handleSaveGrade called with studentId:', studentId);
    
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
        const description = document.getElementById('grade_description').value || ''; // Make description optional

        // Validate input (description is now optional)
        if (!subjectId || !gradeType || !score || !maxScore || !date) {
            showAlert('Please fill in all required fields', 'warning');
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
            description: description // Can be empty
        };

        console.log('Creating grade with data:', gradeData);
        
        // Try to show loading if the element exists
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) spinner.classList.remove('d-none');
        } catch (e) { console.log('No spinner found'); }

        // Call API to create grade
        await createGrade(gradeData);
        
        // Try to hide loading if the element exists
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) spinner.classList.add('d-none');
        } catch (e) { console.log('No spinner found'); }
        
        // Show success alert
        showAlert('Grade added successfully!');

        // Reset form and close modal
        document.getElementById('add-grade-form').reset();
        
        // Set current date as default
        document.getElementById('grade_date').valueAsDate = new Date();
        
        // Close modal using button
        document.querySelector('.modal .btn-close').click();

        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 800);
    } catch (error) {
        // Try to hide loading if the element exists
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) spinner.classList.add('d-none');
        } catch (e) { console.log('No spinner found'); }
        
        console.error('Error adding grade:', error);
        showAlert('Error adding grade: ' + error.message, 'danger');
    }
};

// Fix the handleUpdateGrade function to properly update grades
window.handleUpdateGrade = async function() {
    try {
        const gradeId = document.getElementById('edit_grade_id').value;
        console.log('Updating grade with ID:', gradeId);
        
        // Get updated values
        const subjectId = document.getElementById('edit_grade_subject').value;
        const gradeType = document.getElementById('edit_grade_type').value;
        const score = document.getElementById('edit_grade_score').value;
        const maxScore = document.getElementById('edit_grade_max_score').value;
        const date = document.getElementById('edit_grade_date').value;
        const description = document.getElementById('edit_grade_description').value || ''; // Make description optional

        // Validate input (description is now optional)
        if (!subjectId || !gradeType || !score || !maxScore || !date) {
            showAlert('Please fill in all required fields', 'warning');
            return;
        }
        
        // Get the student ID from the page
        let studentId;
        const studentIdField = document.getElementById('grade_student_id');
        if (studentIdField) {
            studentId = parseInt(studentIdField.value);
        } else {
            // If we can't find the field, try to get it from the URL
            const pathParts = window.location.pathname.split('/');
            for (let i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === 'students' && i+1 < pathParts.length) {
                    studentId = parseInt(pathParts[i+1]);
                    break;
                }
            }
        }
        
        if (!studentId || isNaN(studentId)) {
            console.error('Could not determine student ID for grade update');
            showAlert('Error: Could not determine student ID', 'danger');
            return;
        }

        // Prepare updated grade data - INCLUDE THE STUDENT ID
        const gradeData = {
            student: studentId,
            subject: subjectId,
            grade_type: gradeType,
            score: parseFloat(score),
            max_score: parseFloat(maxScore),
            date: date,
            description: description // Can be empty
        };

        console.log('Updating grade with data:', gradeData);
        
        // Try to show loading if the element exists
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) spinner.classList.remove('d-none');
        } catch (e) { console.log('No spinner found'); }

        // Call our fixed API to update grade
        await fixedUpdateGrade(gradeId, gradeData);
        
        // Try to hide loading if the element exists
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) spinner.classList.add('d-none');
        } catch (e) { console.log('No spinner found'); }
        
        showAlert('Grade updated successfully!');

        // Close edit modal
        document.querySelector('#editGradeModal .btn-close').click();

        // Reload the page to show updated grades
        setTimeout(() => {
            window.location.reload();
        }, 800);
    } catch (error) {
        // Try to hide loading if the element exists
        try {
            const spinner = document.getElementById('loading-spinner');
            if (spinner) spinner.classList.add('d-none');
        } catch (e) { console.log('No spinner found'); }
        
        console.error('Error updating grade:', error);
        showAlert('Error updating grade: ' + error.message, 'danger');
    }
};
