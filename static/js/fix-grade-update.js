/**
 * Fix for grade update functionality
 * This script overrides the handleUpdateGrade function to properly include the student ID
 */

// Override the handleUpdateGrade function to fix the 400 Bad Request error
window.handleUpdateGrade = async function() {
    try {
        const gradeId = document.getElementById('edit_grade_id').value;
        
        // Get the original grade to retrieve the student ID
        const originalGrade = await getGrade(gradeId);
        if (!originalGrade) {
            showAlert('Error: Could not retrieve original grade data', 'danger');
            return;
        }
        
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

        // Prepare updated grade data - INCLUDE THE STUDENT ID which was missing before
        const gradeData = {
            student: originalGrade.student, // This was missing and causing the 400 error
            subject: subjectId,
            grade_type: gradeType,
            score: parseFloat(score),
            max_score: parseFloat(maxScore),
            date: date,
            description: description
        };

        console.log('Updating grade with data:', gradeData);
        
        // Use our safe functions if available
        const showLoadingFn = window.safeShowLoading || window.showLoading;
        const hideLoadingFn = window.safeHideLoading || window.hideLoading;
        const showAlertFn = window.safeShowAlert || window.showAlert;
        
        showLoadingFn();

        // Call API to update grade
        await updateGrade(gradeId, gradeData);
        
        hideLoadingFn();
        showAlertFn('Grade updated successfully!');

        // Close edit modal
        const modalElement = document.getElementById('editGradeModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        } else {
            // If modal instance not found, click the close button
            const closeButton = modalElement.querySelector('.btn-close') || 
                               modalElement.querySelector('.btn-secondary');
            if (closeButton) {
                closeButton.click();
            }
        }

        // Reload the page to show updated grades
        setTimeout(() => {
            window.location.reload();
        }, 800);
    } catch (error) {
        const hideLoadingFn = window.safeHideLoading || window.hideLoading;
        const showAlertFn = window.safeShowAlert || window.showAlert;
        
        hideLoadingFn();
        console.error('Error updating grade:', error);
        showAlertFn('Error updating grade: ' + error.message, 'danger');
    }
};
