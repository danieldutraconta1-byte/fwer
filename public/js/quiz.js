// Quiz Management System

// Global quiz state
const QuizState = {
    currentQuiz: null,
    studentAnswers: {},
    quizHistory: [],
    isQuizActive: false
};

// Quiz Manager for Teachers
const QuizManager =  {
    // Create a new quiz
    createQuiz: async (quizData) => {
        const quiz = {
            id: 'quiz_' + Date.now(),
            title: quizData.title,
            question: quizData.question,
            options: quizData.options,
            correctAnswer: quizData.correctAnswer,
            allowMultiple: quizData.allowMultiple || false,
            createdAt: new Date(),
            responses: {},
            isActive: true
        };
        
        try {
            const createdQuiz = await api.quizzes.create(quiz);
            QuizState.currentQuiz = createdQuiz;
            QuizState.isQuizActive = true;
            QuizState.studentAnswers = {};
            
            // Update teacher UI
            QuizManager.updateTeacherQuizUI();
            
            // Notify students (via backend/websocket in real app)
            showToast("Quiz enviado para os alunos!", "success");
            return createdQuiz;
        } catch (error) {
            showToast("Erro ao criar quiz: " + error.message, "error");
            console.error("Erro ao criar quiz:", error);
            return null;
        }
    },
    
    // End current quiz
    endQuiz: async () => {
        if (QuizState.currentQuiz) {
            try {
                await api.quizzes.update(QuizState.currentQuiz.id, { isActive: false });
                QuizState.currentQuiz.isActive = false;
                QuizState.isQuizActive = false;
                
                // Add to history
                QuizState.quizHistory.push({
                    ...QuizState.currentQuiz,
                    endedAt: new Date(),
                    totalResponses: Object.keys(QuizState.studentAnswers).length
                });
                
                QuizManager.updateTeacherQuizUI();
                showToast("Quiz encerrado!", "info");
            } catch (error) {
                showToast("Erro ao encerrar quiz: " + error.message, "error");
                console.error("Erro ao encerrar quiz:", error);
            }
        }
    },
    
    // Get quiz results
    getResults: () => {
        if (!QuizState.currentQuiz) return null;
        
        const results = {
            quiz: QuizState.currentQuiz,
            totalStudents: Object.keys(QuizState.studentAnswers).length,
            correctAnswers: 0,
            incorrectAnswers: 0,
            responses: []
        };
        
        Object.entries(QuizState.studentAnswers).forEach(([studentId, answer]) => {
            const isCorrect = answer.selectedOption === QuizState.currentQuiz.correctAnswer;
            if (isCorrect) results.correctAnswers++;
            else results.incorrectAnswers++;
            
            results.responses.push({
                studentName: answer.studentName,
                selectedOption: answer.selectedOption,
                isCorrect: isCorrect,
                answeredAt: answer.answeredAt
            });
        });
        
        return results;
    },
    
    // Update teacher quiz UI
    updateTeacherQuizUI: () => {
        const quizSection = document.getElementById('quiz-management-section');
        if (!quizSection) return;
        
        const quizContent = quizSection.querySelector('.section-content');
        if (!quizContent) return;
        
        if (QuizState.isQuizActive && QuizState.currentQuiz) {
            // Show active quiz
            quizContent.innerHTML = `
                <div class="active-quiz">
                    <div class="quiz-header">
                        <h3>${QuizState.currentQuiz.title}</h3>
                        <div class="quiz-actions">
                            <button class="btn btn-secondary" onclick="viewQuizResults()">
                                <i class="fas fa-chart-bar"></i> Ver Resultados
                            </button>
                            <button class="btn btn-danger" onclick="endCurrentQuiz()">
                                <i class="fas fa-stop"></i> Encerrar Quiz
                            </button>
                        </div>
                    </div>
                    <div class="quiz-question">
                        <strong>Pergunta:</strong> ${QuizState.currentQuiz.question}
                    </div>
                    <div class="quiz-options">
                        ${QuizState.currentQuiz.options.map((option, index) => `
                            <div class="quiz-option-display ${index === QuizState.currentQuiz.correctAnswer ? 'correct-option' : ''}">
                                ${String.fromCharCode(65 + index)}) ${option}
                                ${index === QuizState.currentQuiz.correctAnswer ? '<i class="fas fa-check correct-icon"></i>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="quiz-stats">
                        <div class="stat-item">
                            <span class="stat-number">${Object.keys(QuizState.studentAnswers).length}</span>
                            <span class="stat-label">Respostas</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Show create quiz form
            quizContent.innerHTML = `
                <div class="create-quiz-form">
                    <h3>Criar Novo Quiz</h3>
                    <form id="quiz-form">
                        <div class="form-group">
                            <label for="quiz-title">Título do Quiz:</label>
                            <input type="text" id="quiz-title" placeholder="Ex: Quiz de Matemática" required>
                        </div>
                        <div class="form-group">
                            <label for="quiz-question">Pergunta:</label>
                            <textarea id="quiz-question" placeholder="Digite sua pergunta aqui..." required></textarea>
                        </div>
                        <div class="form-group">
                            <label>Opções de Resposta:</label>
                            <div class="quiz-options-form">
                                <div class="option-input">
                                    <input type="text" id="option-0" placeholder="Opção A" required>
                                    <div class="certo-input">
                                        <input type="radio" name="correct-answer" value="0" required>
                                        <label>Correta</label>
                                    </div>
                                </div>
                                <div class="option-input">
                                    <input type="text" id="option-1" placeholder="Opção B" required>
                                    <div class="certo-input">
                                        <input type="radio" name="correct-answer" value="1" required>
                                        <label>Correta</label>
                                    </div>
                                </div>
                                <div class="option-input">
                                    <input type="text" id="option-2" placeholder="Opção C" required>
                                    <div class="certo-input">
                                        <input type="radio" name="correct-answer" value="2" required>
                                        <label>Correta</label>
                                    </div>
                                </div>
                                <div class="option-input">
                                    <input type="text" id="option-3" placeholder="Opção D" required>
                                    <div class="certo-input">
                                        <input type="radio" name="correct-answer" value="3" required>
                                        <label>Correta</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-primary" onclick="createQuizFromForm()">
                                <i class="fas fa-paper-plane"></i> Enviar Quiz
                            </button>
                        </div>
                    </form>
                </div>
            `;
        }
    },
    

    
    // Initialize quiz system
    init: async () => {
        // Check for existing quiz from backend
        try {
            const activeQuizzes = await api.quizzes.getAllActive();
            if (activeQuizzes && activeQuizzes.length > 0) {
                QuizState.currentQuiz = activeQuizzes[0]; // Assuming only one active quiz at a time
                QuizState.isQuizActive = true;
                // Fetch student answers for this quiz if needed
                // QuizState.studentAnswers = await api.respostas.getByQuizId(QuizState.currentQuiz.id);
            }
        } catch (error) {
            console.error("Erro ao carregar quizzes ativos:", error);
        }
    }
};

// Quiz Manager for Students
const StudentQuizManager = {
    // Check for new quiz from backend
    checkForNewQuiz: async () => {
        try {
            const activeQuizzes = await api.quizzes.getAllActive();
            if (activeQuizzes && activeQuizzes.length > 0) {
                const latestQuiz = activeQuizzes[0]; // Assuming only one active quiz at a time
                const lastAnswered = localStorage.getItem('lastAnsweredQuiz');
                if (!lastAnswered || lastAnswered !== latestQuiz.id) {
                    StudentQuizManager.showQuiz(latestQuiz);
                }
            }
        } catch (error) {
            console.error("Erro ao verificar novos quizzes:", error);
        }
    },
    
    // Show quiz to student
    showQuiz: (quiz) => {
        const modal = document.getElementById('quiz-modal');
        if (!modal) {
            StudentQuizManager.createQuizModal();
        }
        
        const modalContent = document.querySelector('#quiz-modal .modal-body');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="quiz-question">${quiz.question}</div>
                <div class="quiz-options">
                    ${quiz.options.map((option, index) => `
                        <div class="quiz-option" onclick="selectQuizOption(${index})">
                            <input type="radio" name="quiz-answer" value="${index}" id="option-${index}">
                            <label for="option-${index}">${String.fromCharCode(65 + index)}) ${option}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Update modal header
            const modalHeader = document.querySelector('#quiz-modal .modal-header h3');
            if (modalHeader) {
                modalHeader.textContent = quiz.title;
            }
            
            // Show modal
            document.getElementById('quiz-modal').style.display = 'flex';
        }
        
        // Store current quiz for student
        sessionStorage.setItem('currentStudentQuiz', JSON.stringify(quiz));
    },
    
    // Create quiz modal for students
    createQuizModal: () => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'quiz-modal';
        modal.innerHTML = `
            <div class="modal-content quiz-modal-content">
                <div class="modal-header">
                    <h3>Quiz</h3>
                </div>
                <div class="modal-body">
                    <!-- Quiz content will be inserted here -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="submitQuizAnswer()">
                        <i class="fas fa-check"></i> Responder
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Submit quiz answer
    submitAnswer: async(selectedOption) => {
        const quiz = JSON.parse(sessionStorage.getItem('currentStudentQuiz') || '{}');
        if (!quiz.id) return;
        
        const studentName = StudentManager.getName();
        if (!studentName) {
            showToast('Nome do aluno não encontrado', 'error');
            return;
        }

        const answer = {
            quizId: quiz.id,
            alunoId: StudentManager.getTempId(), // Assuming getTempId returns alunoId
            opcaoSelecionada: selectedOption,
            dataResposta: new Date()
        };
        
        try {
            await api.respostas.create(answer);
            localStorage.setItem('lastAnsweredQuiz', quiz.id);
        } catch (error) {
            showToast("Erro ao enviar resposta: " + error.message, "error");
            console.error("Erro ao enviar resposta:", error);
            return null;
        }   
        // Show feedback
        const isCorrect = selectedOption === quiz.correctAnswer;
        const feedbackMessage = isCorrect ? 
            'Resposta correta! Parabéns!' : 
            `Resposta incorreta. A resposta correta era: ${String.fromCharCode(65 + quiz.correctAnswer)}) ${quiz.options[quiz.correctAnswer]}`;
        
        showToast(feedbackMessage, isCorrect ? 'success' : 'error');
        
        // Hide modal
        document.getElementById('quiz-modal').style.display = 'none';
        
        return answer;
    },
    
    // Initialize student quiz system
    init: () => {
        // Check for new quizzes periodically
        setInterval(() => {
            if (RoomState.isStudent) {
                StudentQuizManager.checkForNewQuiz();
            }
        }, 2000);
    }
};

// Initialize quiz systems
document.addEventListener('DOMContentLoaded', () => {
    QuizManager.init();
    StudentQuizManager.init();
});

// Export for global access
window.QuizManager = QuizManager;
window.StudentQuizManager = StudentQuizManager;
window.QuizState = QuizState;

