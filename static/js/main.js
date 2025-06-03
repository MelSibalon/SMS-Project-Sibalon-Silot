// Base API URL
const API_BASE_URL = '/api/';

// Common utility functions
function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('d-none');
    }
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('d-none');
    }
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Find the notification container and append the alert
    const container = document.getElementById('notification-container');
    container.appendChild(alertDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 500);
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function getYearText(year) {
    const yearTexts = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year',
        5: '5th Year'
    };
    return yearTexts[year] || `Year ${year}`;
}

// Function to get cookies (needed for CSRF token)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// API Request functions
async function fetchAPI(endpoint, options = {}) {
    try {
        // Add cache-busting parameter for GET requests to prevent caching
        const url = options.method === undefined || options.method === 'GET' 
            ? `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}_=${new Date().getTime()}` 
            : `${API_BASE_URL}${endpoint}`;
        
        // Prepare headers with CSRF token for non-GET requests
        const headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
        
        // Add CSRF token for non-GET requests
        if (options.method !== undefined && options.method !== 'GET') {
            headers['X-CSRFToken'] = getCookie('csrftoken');
        }
            
        const response = await fetch(url, {
            headers: headers,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        
        // For DELETE operations or other responses with no content
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return { success: true };
        }
        
        // Only try to parse JSON if there's actual content
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
    } catch (error) {
        console.error('API Request Error:', error);
        showAlert(error.message, 'danger');
        throw error;
    }
}

// Student functions
async function getStudents() {
    // Add timestamp to ensure fresh data
    const timestamp = new Date().getTime();
    
    // First request to get initial data and pagination info
    const firstPage = await fetchAPI(`students/?_=${timestamp}`);
    
    // If there's only one page or no next page, return the results
    if (!firstPage.next) {
        return firstPage;
    }
    
    // Otherwise, we need to fetch all pages
    let allResults = [...firstPage.results];
    let nextPageUrl = firstPage.next;
    
    // Keep fetching until we've got all pages
    while (nextPageUrl) {
        // Extract the relative path from the full URL
        const urlParts = nextPageUrl.split('/api/');
        if (urlParts.length < 2) break;
        
        // Add timestamp to ensure fresh data for each page
        const relativePath = urlParts[1] + (urlParts[1].includes('?') ? '&' : '?') + `_=${timestamp}`;
        const nextPageData = await fetchAPI(relativePath);
        
        // Add the results to our collection
        allResults = [...allResults, ...nextPageData.results];
        nextPageUrl = nextPageData.next;
    }
    
    // Return a modified response with all results
    return {
        ...firstPage,
        results: allResults,
        count: allResults.length,
        next: null,
        previous: null
    };
}

async function getStudent(id) {
    return fetchAPI(`students/${id}/`);
}

async function createStudent(studentData) {
    return fetchAPI('students/', {
        method: 'POST',
        body: JSON.stringify(studentData)
    });
}

async function updateStudent(id, studentData) {
    return fetchAPI(`students/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(studentData)
    });
}

async function deleteStudent(id) {
    return fetchAPI(`students/${id}/`, {
        method: 'DELETE'
    });
}

async function getStudentSubjects(id) {
    return fetchAPI(`students/${id}/subjects/`);
}

async function getStudentGrades(id) {
    return fetchAPI(`students/${id}/grades/`);
}

// Subject functions
async function getSubjects() {
    // First request to get initial data and pagination info
    const firstPage = await fetchAPI('subjects/');
    
    // If there's only one page or no next page, return the results
    if (!firstPage.next) {
        return firstPage;
    }
    
    // Otherwise, we need to fetch all pages
    let allResults = [...firstPage.results];
    let nextPageUrl = firstPage.next;
    
    // Keep fetching until we've got all pages
    while (nextPageUrl) {
        // Extract the relative path from the full URL
        const urlParts = nextPageUrl.split('/api/');
        if (urlParts.length < 2) break;
        
        const relativePath = urlParts[1];
        const nextPageData = await fetchAPI(relativePath);
        
        // Add the results to our collection
        allResults = [...allResults, ...nextPageData.results];
        nextPageUrl = nextPageData.next;
    }
    
    // Return a modified response with all results
    return {
        ...firstPage,
        results: allResults,
        count: allResults.length,
        next: null,
        previous: null
    };
}

async function getSubject(id) {
    return fetchAPI(`subjects/${id}/`);
}

async function createSubject(subjectData) {
    return fetchAPI('subjects/', {
        method: 'POST',
        body: JSON.stringify(subjectData)
    });
}

async function updateSubject(id, subjectData) {
    return fetchAPI(`subjects/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(subjectData)
    });
}

async function deleteSubject(id) {
    return fetchAPI(`subjects/${id}/`, {
        method: 'DELETE'
    });
}

async function getSubjectStudents(id) {
    return fetchAPI(`subjects/${id}/students/`);
}

async function getSubjectGrades(id) {
    return fetchAPI(`subjects/${id}/grades/`);
}

// Grade functions
async function getGrades(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return fetchAPI(`grades/${queryParams ? '?' + queryParams : ''}`);
}

async function getGrade(id) {
    return fetchAPI(`grades/${id}/`);
}

async function createGrade(gradeData) {
    return fetchAPI('grades/', {
        method: 'POST',
        body: JSON.stringify(gradeData)
    });
}

async function updateGrade(id, gradeData) {
    console.log('Update Grade API call with id:', id, 'and data:', gradeData);
    
    // Get the original grade to ensure we have all required fields
    try {
        const originalGrade = await getGrade(id);
        console.log('Original grade data:', originalGrade);
        
        // Ensure student ID is included
        if (!gradeData.student && originalGrade && originalGrade.student) {
            gradeData.student = originalGrade.student;
        }
        
        // Make sure all required fields are present
        const completeData = {
            ...originalGrade,  // Start with all original data
            ...gradeData,     // Override with new data
        };
        
        console.log('Complete update data being sent:', completeData);
        
        return fetchAPI(`grades/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(completeData)
        });
    } catch (error) {
        console.error('Error in updateGrade:', error);
        throw error;
    }
}

async function deleteGrade(id) {
    return fetchAPI(`grades/${id}/`, {
        method: 'DELETE'
    });
}

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

// DOM manipulations for index.html
document.addEventListener('DOMContentLoaded', function() {
    // Override blue elements with green
    setTimeout(function() {
        // Fix blue badges
        const blueBadges = document.querySelectorAll('.badge');
        blueBadges.forEach(badge => {
            if (badge.classList.contains('bg-primary') || badge.classList.contains('bg-info') || 
                badge.textContent.includes('course') || badge.textContent.includes('subject')) {
                badge.style.backgroundColor = '#3a5a40';
                badge.style.color = 'white';
            }
        });
        
        // Fix student enrolled badges
        const studentBadges = document.querySelectorAll('.badge:not(.bg-light):not(.bg-danger):not(.bg-warning):not(.bg-success)');
        studentBadges.forEach(badge => {
            badge.style.backgroundColor = '#3a5a40';
            badge.style.color = 'white';
        });
        
        // Fix filter buttons
        const filterButtons = document.querySelectorAll('.filters button');
        filterButtons.forEach(button => {
            button.style.backgroundColor = '#3a5a40';
            button.style.borderColor = '#344e41';
            button.style.color = 'white';
        });
        
        // Fix action buttons to be hollow with green icons
        const actionButtons = document.querySelectorAll('.btn-outline-primary');
        actionButtons.forEach(button => {
            button.style.backgroundColor = 'transparent';
            button.style.borderColor = '#3a5a40';
            button.style.color = '#3a5a40';
            
            // Fix the icon color
            const icon = button.querySelector('i');
            if (icon) {
                icon.style.color = '#3a5a40';
            }
        });
    }, 500);
    // Check if we're on the index page
    const studentsTableBody = document.getElementById('students-table-body');
    
    // Setup filter event listeners if we're on the index page
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    if (applyFiltersBtn && resetFiltersBtn) {
        applyFiltersBtn.addEventListener('click', handleSearchStudents);
        
        resetFiltersBtn.addEventListener('click', function() {
            // Reset all filter fields
            document.getElementById('student-search').value = '';
            document.getElementById('course-filter').value = '';
            document.getElementById('year-filter').value = '';
            document.getElementById('section-filter').value = '';
            
            // Reload students without filters
            loadStudents();
        });
    }
    if (studentsTableBody) {
        loadStudents();
        
        // Add event listeners for student actions
        document.getElementById('save-student-btn').addEventListener('click', handleSaveStudent);
        document.getElementById('update-student-btn').addEventListener('click', handleUpdateStudent);
        document.getElementById('confirm-delete-btn').addEventListener('click', handleDeleteStudent);
        document.getElementById('search-button').addEventListener('click', handleSearchStudents);
        document.getElementById('student-search').addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                handleSearchStudents();
            }
        });
    }
    
    // Check if we're on the student detail page
    const studentInfoSection = document.getElementById('student-info');
    const studentIdElement = document.getElementById('grade_student_id');
    if (studentInfoSection && studentIdElement) {
        const studentId = parseInt(studentIdElement.value);
        if (studentId) {
            loadStudentDetails(studentId);
            loadStudentSubjects(studentId);
            loadStudentGrades(studentId);
            
            // Add event listeners for student detail actions
            document.getElementById('enroll-subject-btn').addEventListener('click', () => handleEnrollSubject(studentId));
            document.getElementById('save-grade-btn').addEventListener('click', () => handleSaveGrade(studentId));
            document.getElementById('update-grade-btn').addEventListener('click', handleUpdateGrade);
            document.getElementById('confirm-delete-grade-btn').addEventListener('click', handleDeleteGrade);
        }
    }
    
    // Check if we're on the subject detail page
    const subjectInfoSection = document.getElementById('subject-info');
    const subjectIdElement = document.getElementById('grade_subject_id');
    if (subjectInfoSection && subjectIdElement) {
        const subjectId = parseInt(subjectIdElement.value);
        if (subjectId) {
            loadSubjectDetails(subjectId);
            loadSubjectStudents(subjectId);
            loadSubjectGrades(subjectId);
            
            // Add event listeners for subject detail actions
            document.getElementById('add-student-to-subject-btn').addEventListener('click', () => handleAddStudentToSubject(subjectId));
            document.getElementById('save-grade-btn').addEventListener('click', () => handleSaveGradeFromSubject(subjectId));
            document.getElementById('update-grade-btn').addEventListener('click', handleUpdateGrade);
            document.getElementById('confirm-delete-grade-btn').addEventListener('click', handleDeleteGrade);
        }
    }
});

// Students page functions
async function loadStudents(filters = {}, forceRefresh = true) {
    // Now just a wrapper around our pagination implementation
    // This ensures backward compatibility with any existing code
    if (typeof fetchAllStudentsWithPagination === 'function') {
        if (Object.keys(filters).length > 0) {
            await fetchAllStudentsWithPagination(forceRefresh);
            applyFiltersWithPagination(filters);
        } else {
            await fetchAllStudentsWithPagination(forceRefresh);
        }
        return;
    }
    
    // Fallback to original implementation if pagination isn't available
    try {
        showLoading();
        const data = await getStudents();
        hideLoading();
        
        const tableBody = document.getElementById('students-table-body');
        const noStudentsMessage = document.getElementById('no-students-message');
        
        // Apply filters if provided
        let filteredResults = data.results;
        if (filters.course) {
            filteredResults = filteredResults.filter(student => student.course === filters.course);
        }
        if (filters.year) {
            filteredResults = filteredResults.filter(student => student.year === parseInt(filters.year));
        }
        if (filters.section) {
            filteredResults = filteredResults.filter(student => student.section === parseInt(filters.section));
        }
        if (filters.searchTerm) {
            const searchTerm = filters.searchTerm.toLowerCase();
            filteredResults = filteredResults.filter(student => 
                student.first_name.toLowerCase().includes(searchTerm) ||
                student.last_name.toLowerCase().includes(searchTerm) ||
                student.student_id.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm) ||
                (student.course && student.course.toLowerCase().includes(searchTerm))
            );
        }
        
        if (filteredResults.length === 0) {
            tableBody.innerHTML = '';
            noStudentsMessage.classList.remove('d-none');
            return;
        }
        
        noStudentsMessage.classList.add('d-none');
        tableBody.innerHTML = filteredResults.map(student => `
            <tr class="clickable-row" data-href="/students/${student.id}/">
                <td><span class="badge bg-light text-dark">${student.student_id}</span></td>
                <td>
                    <a href="/students/${student.id}/" class="student-name-link">
                        ${student.first_name} ${student.last_name}
                    </a>
                </td>
                <td>${student.email}</td>
                <td>${student.course ? `<span class="badge text-dark" style="background-color: #a3b18a;">${student.course}</span>` : '-'}</td>
                <td>
                    ${student.year ? `<span class="year-badge">${getYearText(student.year)}</span>` : '-'} 
                    <span class="section-badge">Section ${student.section || '-'}</span>
                </td>
                <td>${formatDate(student.date_of_birth)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="loadEditStudent(${student.id})" title="Edit Student">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="confirmDeleteStudent(${student.id})" title="Delete Student">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Make rows clickable
        makeRowsClickable();
    } catch (error) {
        hideLoading();
        console.error('Error loading students:', error);
    }
}

function handleSearchStudents() {
    const searchTerm = document.getElementById('student-search').value.trim();
    const courseFilter = document.getElementById('course-filter')?.value || '';
    const yearFilter = document.getElementById('year-filter')?.value || '';
    const sectionFilter = document.getElementById('section-filter')?.value || '';
    
    const filters = {
        searchTerm: searchTerm,
        course: courseFilter,
        year: yearFilter,
        section: sectionFilter
    };
    
    loadStudents(filters);
}

async function loadStudentsWithSearch(searchTerm) {
    try {
        showLoading();
        const data = await fetchAPI(`students/?search=${encodeURIComponent(searchTerm)}`);
        hideLoading();
        
        const tableBody = document.getElementById('students-table-body');
        const noStudentsMessage = document.getElementById('no-students-message');
        
        if (data.results.length === 0) {
            tableBody.innerHTML = '';
            noStudentsMessage.classList.remove('d-none');
            return;
        }
        
        noStudentsMessage.classList.add('d-none');
        tableBody.innerHTML = data.results.map(student => `
            <tr>
                <td>${student.student_id}</td>
                <td>
                    <a href="/students/${student.id}/">
                        ${student.first_name} ${student.last_name}
                    </a>
                </td>
                <td>${student.email}</td>
                <td>${formatDate(student.date_of_birth)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="loadEditStudent(${student.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="confirmDeleteStudent(${student.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        hideLoading();
        console.error('Error searching students:', error);
    }
}

async function handleSaveStudent() {
    try {
        const form = document.getElementById('add-student-form');
        const formData = new FormData(form);
        const studentData = {};
        
        formData.forEach((value, key) => {
            studentData[key] = value;
        });
        
        showLoading();
        await createStudent(studentData);
        hideLoading();
        showAlert('Student added successfully!');
        
        // Reset form and close modal
        form.reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addStudentModal'));
        modal.hide();
        
        // Clear cache and force a complete reload of the students data
        console.log('Refreshing student list after adding a student');
        // Clear the cache first if the function exists
        if (typeof clearStudentCache === 'function') {
            clearStudentCache();
        }
        await loadStudents({}, true);
    } catch (error) {
        hideLoading();
        console.error('Error saving student:', error);
        showAlert('Error adding student: ' + error.message, 'danger');
    }
}

async function loadEditStudent(id) {
    try {
        const student = await getStudent(id);
        
        // Fill form with student data
        document.getElementById('edit_student_id').value = student.id;
        document.getElementById('edit_first_name').value = student.first_name;
        document.getElementById('edit_last_name').value = student.last_name;
        document.getElementById('edit_student_id_field').value = student.student_id;
        document.getElementById('edit_email').value = student.email;
        document.getElementById('edit_date_of_birth').value = student.date_of_birth;
        
        // Set course, year, and section values
        if (student.course) {
            document.getElementById('edit_course').value = student.course;
        }
        if (student.year) {
            document.getElementById('edit_year').value = student.year;
        }
        if (student.section) {
            document.getElementById('edit_section').value = student.section;
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editStudentModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading student for edit:', error);
    }
}

async function handleUpdateStudent() {
    try {
        const id = document.getElementById('edit_student_id').value;
        const form = document.getElementById('edit-student-form');
        const formData = new FormData(form);
        const studentData = {};
        
        formData.forEach((value, key) => {
            studentData[key] = value;
        });
        
        showLoading();
        await updateStudent(id, studentData);
        hideLoading();
        showAlert('Student updated successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editStudentModal'));
        modal.hide();
        
        // Clear cache and force a complete reload of the students data
        console.log('Refreshing student list after updating a student');
        // Clear the cache first if the function exists
        if (typeof clearStudentCache === 'function') {
            clearStudentCache();
        }
        await loadStudents({}, true);
    } catch (error) {
        hideLoading();
        console.error('Error updating student:', error);
        showAlert('Error updating student: ' + error.message, 'danger');
    }
}

function confirmDeleteStudent(id) {
    document.getElementById('delete_student_id').value = id;
    const modal = new bootstrap.Modal(document.getElementById('deleteStudentModal'));
    modal.show();
}

async function handleDeleteStudent() {
    try {
        const id = document.getElementById('delete_student_id').value;
        console.log('Attempting to delete student with ID:', id);
        
        // Add loading indicator
        showLoading();
        
        // Call the API to delete the student
        await deleteStudent(id);
        
        // Show success message
        showAlert('Student deleted successfully!');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteStudentModal'));
        modal.hide();
        
        // Remove loading indicator
        hideLoading();
        
        // Clear cache and force a complete reload of the students list
        console.log('Refreshing student list after deleting a student');
        // Clear the cache first if the function exists
        if (typeof clearStudentCache === 'function') {
            clearStudentCache();
        }
        await loadStudents({}, true);
    } catch (error) {
        // Hide loading indicator
        hideLoading();
        
        console.error('Error deleting student:', error);
        showAlert('Error deleting student: ' + error.message, 'danger');
    }
}

// Make functions globally available
window.loadEditStudent = loadEditStudent;
window.confirmDeleteStudent = confirmDeleteStudent;
