/**
 * Quick Navigation functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    
    if (scrollTopBtn) {
        // Initially hide the button
        scrollTopBtn.style.display = 'none';
        
        // Show button when user scrolls down 200px
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 200) {
                scrollTopBtn.style.display = 'flex';
                scrollTopBtn.classList.add('fade-in');
            } else {
                scrollTopBtn.style.display = 'none';
                scrollTopBtn.classList.remove('fade-in');
            }
        });
        
        // Scroll to top when clicked
        scrollTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add keyboard shortcuts for pagination
    document.addEventListener('keydown', function(e) {
        // Check if we're on a page with pagination
        const pagination = document.getElementById('student-pagination');
        if (!pagination) return;
        
        // Arrow right -> next page
        if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
            const nextBtn = pagination.querySelector('li:last-child:not(.disabled) a');
            if (nextBtn) {
                e.preventDefault();
                nextBtn.click();
            }
        }
        
        // Arrow left -> previous page
        if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) {
            const prevBtn = pagination.querySelector('li:first-child:not(.disabled) a');
            if (prevBtn) {
                e.preventDefault();
                prevBtn.click();
            }
        }
        
        // Home key -> first page
        if (e.key === 'Home' && !e.ctrlKey && !e.metaKey) {
            const firstPageBtn = pagination.querySelector('li:nth-child(2):not(.disabled) a');
            if (firstPageBtn) {
                e.preventDefault();
                firstPageBtn.click();
            }
        }
        
        // End key -> last page
        if (e.key === 'End' && !e.ctrlKey && !e.metaKey) {
            const lastPageBtn = pagination.querySelector('li:nth-last-child(2):not(.disabled) a');
            if (lastPageBtn) {
                e.preventDefault();
                lastPageBtn.click();
            }
        }
    });
});
