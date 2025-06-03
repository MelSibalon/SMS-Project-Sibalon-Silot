/**
 * Cache Buster Script
 * This script should be included at the top of the page to force reloading of all scripts
 */

// Force reload all JavaScript files by adding timestamp parameters
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cache buster running...');
    
    // Add a timestamp to all script tags to force reload
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        const originalSrc = script.getAttribute('src');
        if (originalSrc && !originalSrc.includes('clear-cache.js')) {
            const newSrc = originalSrc.includes('?') 
                ? `${originalSrc}&_=${new Date().getTime()}` 
                : `${originalSrc}?_=${new Date().getTime()}`;
            script.setAttribute('src', newSrc);
            console.log(`Updated script src: ${originalSrc} -> ${newSrc}`);
        }
    });
    
    console.log('All script sources have been updated to prevent caching');
});

// Also fix the grade update function directly (in case the other fix doesn't load)
window.fixGradeUpdate = async function(id, data) {
    try {
        // Get the current URL to extract student ID if needed
        const pathParts = window.location.pathname.split('/');
        let studentId = null;
        
        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i] === 'students' && i+1 < pathParts.length) {
                studentId = parseInt(pathParts[i+1]);
                break;
            }
        }
        
        // Always include student ID in update data
        if (studentId && !data.student) {
            data.student = studentId;
        }
        
        // Log what we're doing
        console.log('Direct grade update with ID:', id, 'data:', data);
        
        // Make direct fetch request
        const response = await fetch(`/api/grades/${id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to update grade: ' + response.statusText);
        }
        
        alert('Grade updated successfully!');
        window.location.reload();
        return true;
    } catch (error) {
        console.error('Error in direct grade update:', error);
        alert('Error updating grade: ' + error.message);
        return false;
    }
};
