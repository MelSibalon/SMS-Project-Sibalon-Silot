/**
 * Grade Display Enhancement Script
 * This script modifies how grades are displayed in the student management system
 * - Formats scores as whole numbers
 * - Sorts grades by date (newest first)
 * - Displays description field
 */

// Function to format scores as whole numbers
function formatScore(score, maxScore) {
    return `${Math.round(score)}/${Math.round(maxScore)}`;
}

// Override the loadStudentGrades function to include Name/Title column and format scores as whole numbers
document.addEventListener('DOMContentLoaded', function() {
    // Make all grade tables scrollable
    const tableResponsiveElements = document.querySelectorAll('.table-responsive');
    tableResponsiveElements.forEach(element => {
        if (element.closest('#gradesTabContent')) {
            element.classList.add('table-scrollable');
        }
    });
    
    // Store original functions if they exist
    const originalLoadStudentGrades = window.loadStudentGrades;
    const originalLoadSubjectGrades = window.loadSubjectGrades;
    
    // Sort grades by date (newest first)
    function sortGradesByDate(grades) {
        return [...grades].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // Descending order (newest first)
        });
    }

    // Override loadStudentGrades if it exists
    if (typeof originalLoadStudentGrades === 'function') {
        window.loadStudentGrades = async function(studentId) {
            try {
                let grades = await getStudentGrades(studentId);
                
                // Sort grades by date (newest first)
                grades = sortGradesByDate(grades);
                
                // Get the table bodies for each grade type
                const allGradesTable = document.getElementById('all-grades-table');
                const activitiesTable = document.getElementById('activities-table');
                const quizzesTable = document.getElementById('quizzes-table');
                const examsTable = document.getElementById('exams-table');
                const noGradesMessage = document.getElementById('no-grades-message');
                
                if (grades.length === 0) {
                    allGradesTable.innerHTML = '';
                    activitiesTable.innerHTML = '';
                    quizzesTable.innerHTML = '';
                    examsTable.innerHTML = '';
                    noGradesMessage.classList.remove('d-none');
                    return;
                }
                
                noGradesMessage.classList.add('d-none');
                
                // Filter grades by type
                const activities = grades.filter(grade => grade.grade_type === 'ACTIVITY');
                const quizzes = grades.filter(grade => grade.grade_type === 'QUIZ');
                const exams = grades.filter(grade => grade.grade_type === 'EXAM');
                
                // Populate all grades table
                allGradesTable.innerHTML = grades.map(grade => `
                    <tr>
                        <td>${grade.subject_name}</td>
                        <td><span class="badge grade-${grade.grade_type.toLowerCase()}">${grade.grade_type}</span></td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Populate activities table
                activitiesTable.innerHTML = activities.map(grade => `
                    <tr>
                        <td>${grade.subject_name}</td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Populate quizzes table
                quizzesTable.innerHTML = quizzes.map(grade => `
                    <tr>
                        <td>${grade.subject_name}</td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Populate exams table
                examsTable.innerHTML = exams.map(grade => `
                    <tr>
                        <td>${grade.subject_name}</td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Error loading student grades:', error);
                showAlert('Error loading grades', 'danger');
            }
        };
    }
    
    // Override loadSubjectGrades if it exists
    if (typeof originalLoadSubjectGrades === 'function') {
        window.loadSubjectGrades = async function(subjectId) {
            try {
                let grades = await getSubjectGrades(subjectId);
                
                // Sort grades by date (newest first)
                grades = sortGradesByDate(grades);
                
                // Get the table bodies for each grade type
                const allGradesTable = document.getElementById('all-grades-table');
                const activitiesTable = document.getElementById('activities-table');
                const quizzesTable = document.getElementById('quizzes-table');
                const examsTable = document.getElementById('exams-table');
                const noGradesMessage = document.getElementById('no-grades-message');
                
                if (grades.length === 0) {
                    allGradesTable.innerHTML = '';
                    activitiesTable.innerHTML = '';
                    quizzesTable.innerHTML = '';
                    examsTable.innerHTML = '';
                    noGradesMessage.classList.remove('d-none');
                    return;
                }
                
                noGradesMessage.classList.add('d-none');
                
                // Filter grades by type
                const activities = grades.filter(grade => grade.grade_type === 'ACTIVITY');
                const quizzes = grades.filter(grade => grade.grade_type === 'QUIZ');
                const exams = grades.filter(grade => grade.grade_type === 'EXAM');
                
                // Populate all grades table
                allGradesTable.innerHTML = grades.map(grade => `
                    <tr>
                        <td>${grade.student_name}</td>
                        <td><span class="badge grade-${grade.grade_type.toLowerCase()}">${grade.grade_type}</span></td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Populate activities table
                activitiesTable.innerHTML = activities.map(grade => `
                    <tr>
                        <td>${grade.student_name}</td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Populate quizzes table
                quizzesTable.innerHTML = quizzes.map(grade => `
                    <tr>
                        <td>${grade.student_name}</td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
                // Populate exams table
                examsTable.innerHTML = exams.map(grade => `
                    <tr>
                        <td>${grade.student_name}</td>
                        <td>${formatScore(grade.score, grade.max_score)}</td>
                        <td>${formatDate(grade.date)}</td>
                        <td>${grade.description || '-'}</td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="loadEditGrade(${grade.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="confirmDeleteGrade(${grade.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Error loading subject grades:', error);
                showAlert('Error loading grades', 'danger');
            }
        };
    }
});

// Make formatScore function globally available
window.formatScore = formatScore;
