/**
 * Pagination functionality for student lists
 */

// Pagination state
let currentPage = 1;
let itemsPerPage = 20; // Increased items per page for better efficiency
let totalItems = 0;
let totalPages = 0;
let allStudents = [];
let isInitialized = false; // Track if pagination has been initialized

// Function to clear student data cache
function clearStudentCache() {
    sessionStorage.removeItem('students_data');
    isInitialized = false;
    console.log('Student data cache cleared');
}

// Function to fetch all students and implement pagination
async function fetchAllStudentsWithPagination(forceRefresh = false) {
    // If forceRefresh is true, we'll clear the cache first
    if (forceRefresh) {
        clearStudentCache();
    }
    
    // Don't reload data if already initialized and not forcing refresh
    if (!forceRefresh && isInitialized && allStudents.length > 0) {
        displayStudentPage(currentPage);
        return;
    }
    
    try {
        showLoading();
        
        // Always fetch fresh data to ensure we have the latest
        const data = await getStudents();
        // Update session cache
        sessionStorage.setItem('students_data', JSON.stringify(data));
        console.log('Fetched fresh student data');
        
        hideLoading();
        
        // Store all students for client-side pagination
        allStudents = data.results || [];
        totalItems = allStudents.length;
        totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // Display first page
        displayStudentPage(1);
        
        // Generate pagination controls
        generatePaginationControls();
        
        // Update info text
        updatePaginationInfo();
        
        // Mark as initialized
        isInitialized = true;
    } catch (error) {
        hideLoading();
        console.error('Error loading students for pagination:', error);
        showAlert('Failed to load students. Please try refreshing the page.', 'danger');
    }
}

// Function to display a specific page of students
function displayStudentPage(page) {
    currentPage = parseInt(page); // Ensure page is an integer
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    const tableBody = document.getElementById('students-table-body');
    const noStudentsMessage = document.getElementById('no-students-message');
    
    if (allStudents.length === 0) {
        tableBody.innerHTML = '';
        noStudentsMessage.classList.remove('d-none');
        return;
    }
    
    noStudentsMessage.classList.add('d-none');
    
    // Get current page students
    const currentPageStudents = allStudents.slice(startIndex, endIndex);
    
    // Generate table rows
    tableBody.innerHTML = currentPageStudents.map(student => `
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
    
    // Update pagination info
    updatePaginationInfo();
    
    // Update pagination controls to reflect the current page
    updatePaginationActiveState();
}

// Function to generate pagination controls - optimized for performance
function generatePaginationControls() {
    const paginationElement = document.getElementById('student-pagination');
    if (!paginationElement) return;
    
    // Always regenerate the pagination controls to ensure correct state
    // The optimization was causing issues with the active state not updating correctly
    
    // Save total pages to dataset for future comparison
    paginationElement.dataset.totalPages = totalPages;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}" id="prev-page-button">
            <a class="page-link" href="#" aria-label="Previous" onclick="displayStudentPage(${currentPage - 1}); return false;">
                <i class="fas fa-chevron-left" aria-hidden="true"></i>
                <span class="visually-hidden">Previous</span>
            </a>
        </li>
    `;
    
    // Page numbers - optimize for mobile by showing fewer pages on smaller screens
    const maxVisiblePages = window.innerWidth < 768 ? 3 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if end page is at the maximum
    if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // First page if not visible
    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="displayStudentPage(1); return false;">1</a>
            </li>
        `;
        
        if (startPage > 2) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }
    
    // Generate page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="displayStudentPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    // Last page if not visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
        
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="displayStudentPage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }
    
    // Next button with ARIA attributes for accessibility
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}" id="next-page-button">
            <a class="page-link" href="#" aria-label="Next" onclick="displayStudentPage(${currentPage + 1}); return false;">
                <i class="fas fa-chevron-right" aria-hidden="true"></i>
                <span class="visually-hidden">Next</span>
            </a>
        </li>
    `;
    
    // Set the pagination HTML
    paginationElement.innerHTML = paginationHTML;
}

// Function to update pagination info text
function updatePaginationInfo() {
    const paginationInfo = document.getElementById('pagination-showing');
    if (!paginationInfo) return;
    
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + itemsPerPage - 1, totalItems);
    
    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${totalItems} students`;
}

// Function to apply filters with pagination
function applyFiltersWithPagination(filters = {}) {
    const tableBody = document.getElementById('students-table-body');
    const noStudentsMessage = document.getElementById('no-students-message');
    
    // Apply filters if provided
    let filteredResults = [...allStudents];
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
    
    // Update filtered results
    allStudents = filteredResults;
    totalItems = allStudents.length;
    totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Reset to first page
    currentPage = 1;
    
    if (allStudents.length === 0) {
        tableBody.innerHTML = '';
        noStudentsMessage.classList.remove('d-none');
        
        // Clear pagination
        document.getElementById('student-pagination').innerHTML = '';
        document.getElementById('pagination-showing').textContent = 'No students found';
        return;
    }
    
    // Display first page
    displayStudentPage(1);
    
    // Generate pagination controls
    generatePaginationControls();
}

// Initialize pagination when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const studentsTableBody = document.getElementById('students-table-body');
    if (studentsTableBody) {
        // Replace loadStudents with our pagination version
        fetchAllStudentsWithPagination();
        
        // Add event listeners for search and filter
        document.getElementById('search-button')?.addEventListener('click', handleSearchWithPagination);
        document.getElementById('student-search')?.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                handleSearchWithPagination();
            }
        });
        
        document.getElementById('apply-filters')?.addEventListener('click', handleFiltersWithPagination);
        document.getElementById('reset-filters')?.addEventListener('click', resetFiltersWithPagination);
    }
});

// Handler for search with pagination
function handleSearchWithPagination() {
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
    
    applyFiltersWithPagination(filters);
}

// Handler for filters with pagination
function handleFiltersWithPagination() {
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
    
    applyFiltersWithPagination(filters);
}

// Reset filters with pagination
function resetFiltersWithPagination() {
    document.getElementById('student-search').value = '';
    document.getElementById('course-filter').value = '';
    document.getElementById('year-filter').value = '';
    document.getElementById('section-filter').value = '';
    
    // Reload all students
    fetchAllStudentsWithPagination();
}

// Make functions globally available
window.displayStudentPage = displayStudentPage;
window.handleSearchWithPagination = handleSearchWithPagination;
window.handleFiltersWithPagination = handleFiltersWithPagination;
window.resetFiltersWithPagination = resetFiltersWithPagination;
window.clearStudentCache = clearStudentCache;

// Function to update the active state of pagination controls
function updatePaginationActiveState() {
    const paginationElement = document.getElementById('student-pagination');
    if (!paginationElement) return;
    
    // Remove active class from all page items
    const allPageItems = paginationElement.querySelectorAll('.page-item');
    allPageItems.forEach(item => {
        if (item.classList.contains('active')) {
            item.classList.remove('active');
        }
    });
    
    // Update previous/next buttons
    const prevButton = document.getElementById('prev-page-button');
    const nextButton = document.getElementById('next-page-button');
    
    if (prevButton) {
        prevButton.classList.toggle('disabled', currentPage === 1);
        // Update the onclick handler to use the current page
        const prevLink = prevButton.querySelector('a');
        if (prevLink) {
            prevLink.onclick = function() {
                if (currentPage > 1) {
                    displayStudentPage(currentPage - 1);
                }
                return false;
            };
        }
    }
    
    if (nextButton) {
        nextButton.classList.toggle('disabled', currentPage === totalPages);
        // Update the onclick handler to use the current page
        const nextLink = nextButton.querySelector('a');
        if (nextLink) {
            nextLink.onclick = function() {
                if (currentPage < totalPages) {
                    displayStudentPage(currentPage + 1);
                }
                return false;
            };
        }
    }
    
    // Find and set the new active page
    const pageLinks = paginationElement.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        if (link.textContent == currentPage) {
            link.parentElement.classList.add('active');
        }
    });
}
