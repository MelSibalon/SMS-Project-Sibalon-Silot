/**
 * Enhanced Tables - Adds modern styling and clickable functionality to tables
 */

// Function to make table rows clickable
function makeRowsClickable() {
    document.querySelectorAll('.clickable-row').forEach(row => {
        row.addEventListener('click', function(e) {
            // Don't navigate if clicking on buttons/links inside the row
            if (e.target.closest('button') || e.target.closest('a') || e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
                return;
            }
            
            const href = this.dataset.href;
            if (href) {
                window.location.href = href;
            }
        });
    });
}

// Function to enhance subject tables
function enhanceSubjectTable() {
    const tableBody = document.getElementById('subjects-table-body');
    if (!tableBody) return;
    
    // Get all rows and enhance them
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        // Add clickable class
        row.classList.add('clickable-row');
        
        // Get the subject link to extract href and ID
        const subjectLink = row.querySelector('a');
        if (subjectLink) {
            const href = subjectLink.getAttribute('href');
            row.setAttribute('data-href', href);
            
            // Make the subject name link use our styled class
            subjectLink.classList.add('subject-name-link');
            
            // Enhance the code column with a badge
            const codeCell = row.querySelector('td:first-child');
            if (codeCell && !codeCell.querySelector('.badge')) {
                const code = codeCell.textContent.trim();
                codeCell.innerHTML = `<span class="badge bg-light text-dark">${code}</span>`;
            }
            
            // Enhance the student count with a badge
            const countCell = row.querySelector('td:nth-child(4)');
            if (countCell && !countCell.querySelector('.badge')) {
                const count = countCell.textContent.trim();
                countCell.innerHTML = `<span class="badge bg-primary">${count} students</span>`;
            }
            
            // Add titles to the action buttons
            const editButton = row.querySelector('.btn-outline-primary');
            if (editButton) {
                editButton.setAttribute('title', 'Edit Subject');
            }
            
            const deleteButton = row.querySelector('.btn-outline-danger');
            if (deleteButton) {
                deleteButton.setAttribute('title', 'Delete Subject');
            }
        }
    });
    
    // Make rows clickable
    makeRowsClickable();
}

// Function to enhance student tables
function enhanceStudentTable() {
    const tableBody = document.getElementById('students-table-body');
    if (!tableBody) return;
    
    // Get all rows and enhance them
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        // Add clickable class
        row.classList.add('clickable-row');
        
        // Get the student link to extract href and ID
        const studentLink = row.querySelector('a');
        if (studentLink) {
            const href = studentLink.getAttribute('href');
            row.setAttribute('data-href', href);
            
            // Make the student name link use our styled class
            studentLink.classList.add('student-name-link');
            
            // Enhance the ID column with a badge if not already done
            const idCell = row.querySelector('td:first-child');
            if (idCell && !idCell.querySelector('.badge')) {
                const id = idCell.textContent.trim();
                idCell.innerHTML = `<span class="badge bg-light text-dark">${id}</span>`;
            }
            
            // Enhance the course with a badge if not already done
            const courseCell = row.querySelector('td:nth-child(4)');
            if (courseCell && !courseCell.querySelector('.badge') && courseCell.textContent.trim() !== '-') {
                const course = courseCell.textContent.trim();
                courseCell.innerHTML = `<span class="badge text-dark" style="background-color: #a3b18a;">${course}</span>`;
            }
            
            // Add titles to the action buttons
            const editButton = row.querySelector('.btn-outline-primary');
            if (editButton) {
                editButton.setAttribute('title', 'Edit Student');
            }
            
            const deleteButton = row.querySelector('.btn-outline-danger');
            if (deleteButton) {
                deleteButton.setAttribute('title', 'Delete Student');
            }
        }
    });
    
    // Make rows clickable
    makeRowsClickable();
}

// Initialize the enhancements when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Enhance tables
    enhanceSubjectTable();
    enhanceStudentTable();
    
    // Also apply after any AJAX updates by setting interval checks
    setInterval(enhanceSubjectTable, 1000); // Check and enhance every second
    setInterval(enhanceStudentTable, 1000); // Check and enhance every second
});
