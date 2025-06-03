/**
 * Navigation enhancements for the Student Management System
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle the refresh data button
    const refreshDataBtn = document.getElementById('refresh-data-btn');
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear session storage cache
            sessionStorage.removeItem('students_data');
            sessionStorage.removeItem('subjects_data');
            
            // Reset pagination initialization flag if it exists
            if (typeof isInitialized !== 'undefined') {
                isInitialized = false;
            }
            
            // Show loading indicator
            showAlert('Refreshing data...', 'info');
            
            // Reload the current page
            setTimeout(() => {
                window.location.reload();
            }, 500);
        });
    }
    
    // Add active class to nav items based on current URL
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== '/') {
            link.classList.add('active');
        } else if (href === '/' && currentPath === '/') {
            link.classList.add('active');
        }
    });
    
    // Enhance keyboard navigation
    document.addEventListener('keydown', function(e) {
        // Alt + D: Go to Dashboard
        if (e.altKey && e.key === 'd') {
            window.location.href = '/dashboard/';
        }
        
        // Alt + S: Go to Students
        if (e.altKey && e.key === 's') {
            window.location.href = '/';
        }
        
        // Alt + B: Go to Subjects
        if (e.altKey && e.key === 'b') {
            window.location.href = '/subjects/';
        }
        
        // Alt + R: Refresh data
        if (e.altKey && e.key === 'r' && refreshDataBtn) {
            refreshDataBtn.click();
        }
    });
});
