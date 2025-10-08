import { db, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, where, addDoc, getDocs } from './firebase-config.js';

const QuizManager = {
    currentQuiz: null,
    unsubscribers: [],

    createQuiz: async (quizData) => {
        if (!window.RoomState || !window.RoomState.roomCode) {
            if (window.showToast) {
                window.showToast('Nenhuma sala ativa', 'error');
            }
            return;
        }

        try {
            const quizRef = await addDoc(collection(db, 'quizzes'), {
                ...quizData,
                roomCode: window.RoomState.roomCode,
                isActive: true,
                createdAt: serverTimestamp()
            });

            QuizManager.currentQuiz = { id: quizRef.id, ...quizData };

            if (window.showToast) {
                window.showToast('Quiz criado e enviado aos alunos!', 'success');
            }

            QuizManager.updateTeacherQuizUI();
        } catch (error) {
            console.error('Erro ao criar quiz:', error);
            if (window.showToast) {
                window.showToast('Erro ao criar quiz', 'error');
            }
        }
    },

    endQuiz: async () => {
        if (!QuizManager.currentQuiz) return;

        try {
            await updateDoc(doc(db, 'quizzes', QuizManager.currentQuiz.id), {
                isActive: false
            });

            if (window.showToast) {
                window.showToast('Quiz encerrado', 'info');
            }

            QuizManager.currentQuiz = null;
            QuizManager.updateTeacherQuizUI();
        } catch (error) {
            console.error('Erro ao encerrar quiz:', error);
        }
    },

    updateTeacherQuizUI: () => {
        const section = document.getElementById('quiz-management-section');
        const content = section?.querySelector('.section-content');
        if (!content) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(
                collection(db, 'quizzes'),
                where('roomCode', '==', window.RoomState.roomCode),
                where('isActive', '==', true)
            ),
            (snapshot) => {
                let activeQuiz = null;
                snapshot.forEach((doc) => {
                    activeQuiz = { id: doc.id, ...doc.data() };
                });

                QuizManager.currentQuiz = activeQuiz;

                if (!activeQuiz) {
                    content.innerHTML = `
                        <div class="quiz-creator">
                            <h3>Criar Quiz</h3>
                            <form id="quiz-form">
                                <div class="form-group">
                                    <label for="quiz-title">Título do Quiz *</label>
                                    <input type="text" id="quiz-title" required>
                                </div>
                                <div class="form-group">
                                    <label for="quiz-question">Pergunta *</label>
                                    <textarea id="quiz-question" rows="3" required></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Opções de Resposta *</label>
                                    <input type="text" id="option-0" placeholder="Opção A" required>
                                    <input type="text" id="option-1" placeholder="Opção B" required>
                                    <input type="text" id="option-2" placeholder="Opção C" required>
                                    <input type="text" id="option-3" placeholder="Opção D" required>
                                </div>
                                <div class="form-group">
                                    <label>Resposta Correta *</label>
                                    <div class="radio-group">
                                        <label><input type="radio" name="correct-answer" value="0" required> A</label>
                                        <label><input type="radio" name="correct-answer" value="1"> B</label>
                                        <label><input type="radio" name="correct-answer" value="2"> C</label>
                                        <label><input type="radio" name="correct-answer" value="3"> D</label>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-primary" onclick="createQuizFromForm()">
                                    <i class="fas fa-paper-plane"></i> Enviar Quiz
                                </button>
                            </form>
                        </div>
                    `;
                } else {
                    content.innerHTML = `
                        <div class="active-quiz">
                            <h3>Quiz Ativo: ${QuizManager.escapeHtml(activeQuiz.title)}</h3>
                            <div class="quiz-question">
                                <strong>Pergunta:</strong> ${QuizManager.escapeHtml(activeQuiz.question)}
                            </div>
                            <div class="quiz-options">
                                ${activeQuiz.options.map((option, index) => `
                                    <div class="quiz-option-display ${index === activeQuiz.correctAnswer ? 'correct-option' : ''}">
                                        ${String.fromCharCode(65 + index)}) ${QuizManager.escapeHtml(option)}
                                        ${index === activeQuiz.correctAnswer ? '<i class="fas fa-check correct-icon"></i>' : ''}
                                    </div>
                                `).join('')}
                            </div>
                            <div class="quiz-actions">
                                <button class="btn btn-primary" onclick="viewQuizResults()">
                                    <i class="fas fa-chart-bar"></i> Ver Resultados
                                </button>
                                <button class="btn btn-danger" onclick="endCurrentQuiz()">
                                    <i class="fas fa-stop"></i> Encerrar Quiz
                                </button>
                            </div>
                        </div>
                    `;
                }
            }
        );

        QuizManager.unsubscribers.push(unsubscribe);
    },

    getResults: async () => {
        if (!QuizManager.currentQuiz) return null;

        const responsesSnapshot = await getDocs(
            query(collection(db, 'quiz-respostas'), where('quizId', '==', QuizManager.currentQuiz.id))
        );

        const responses = [];
        responsesSnapshot.forEach((doc) => {
            responses.push({ id: doc.id, ...doc.data() });
        });

        const correctAnswers = responses.filter(r => r.isCorrect).length;
        const incorrectAnswers = responses.length - correctAnswers;

        return {
            quiz: QuizManager.currentQuiz,
            responses: responses,
            totalStudents: responses.length,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers
        };
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    cleanup: () => {
        QuizManager.unsubscribers.forEach(unsub => unsub());
        QuizManager.unsubscribers = [];
    }
};

const StudentQuizManager = {
    unsubscriber: null,

    listenForQuiz: () => {
        if (!window.RoomState || !window.RoomState.roomCode) return;

        StudentQuizManager.unsubscriber = onSnapshot(
            query(
                collection(db, 'quizzes'),
                where('roomCode', '==', window.RoomState.roomCode),
                where('isActive', '==', true)
            ),
            (snapshot) => {
                let activeQuiz = null;
                snapshot.forEach((doc) => {
                    activeQuiz = { id: doc.id, ...doc.data() };
                });

                if (activeQuiz) {
                    StudentQuizManager.showQuizModal(activeQuiz);
                } else {
                    StudentQuizManager.hideQuizModal();
                }
            }
        );
    },

    showQuizModal: async (quiz) => {
        const studentName = window.StudentManager ? window.StudentManager.getName() : 'Anônimo';

        const existingResponse = await getDocs(
            query(
                collection(db, 'quiz-respostas'),
                where('quizId', '==', quiz.id),
                where('studentName', '==', studentName)
            )
        );

        if (!existingResponse.empty) {
            return;
        }

        let modal = document.getElementById('student-quiz-modal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'student-quiz-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${StudentQuizManager.escapeHtml(quiz.title)}</h3>
                </div>
                <div class="modal-body">
                    <div class="quiz-question">
                        <p>${StudentQuizManager.escapeHtml(quiz.question)}</p>
                    </div>
                    <div class="quiz-options">
                        ${quiz.options.map((option, index) => `
                            <div class="quiz-option" onclick="selectQuizOption(${index})">
                                <input type="radio" name="quiz-answer" value="${index}" id="option-${index}">
                                <label for="option-${index}">
                                    ${String.fromCharCode(65 + index)}) ${StudentQuizManager.escapeHtml(option)}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="submitQuizAnswer()">
                        <i class="fas fa-paper-plane"></i> Enviar Resposta
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    },

    hideQuizModal: () => {
        const modal = document.getElementById('student-quiz-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    submitAnswer: async (selectedOption) => {
        const studentName = window.StudentManager ? window.StudentManager.getName() : 'Anônimo';

        if (!QuizManager.currentQuiz && !window.RoomState) return;

        const activeQuizSnapshot = await getDocs(
            query(
                collection(db, 'quizzes'),
                where('roomCode', '==', window.RoomState.roomCode),
                where('isActive', '==', true)
            )
        );

        let activeQuiz = null;
        activeQuizSnapshot.forEach((doc) => {
            activeQuiz = { id: doc.id, ...doc.data() };
        });

        if (!activeQuiz) return;

        const isCorrect = selectedOption === activeQuiz.correctAnswer;

        try {
            await addDoc(collection(db, 'quiz-respostas'), {
                quizId: activeQuiz.id,
                studentName: studentName,
                selectedOption: selectedOption,
                isCorrect: isCorrect,
                submittedAt: serverTimestamp()
            });

            if (window.showToast) {
                window.showToast('Resposta enviada!', 'success');
            }

            StudentQuizManager.hideQuizModal();
        } catch (error) {
            console.error('Erro ao enviar resposta:', error);
        }
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    cleanup: () => {
        if (StudentQuizManager.unsubscriber) {
            StudentQuizManager.unsubscriber();
            StudentQuizManager.unsubscriber = null;
        }
    }
};

window.QuizManager = QuizManager;
window.StudentQuizManager = StudentQuizManager;

window.openQuizManagement = function() {
    closeAllSections();
    const section = document.getElementById('quiz-management-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        QuizManager.updateTeacherQuizUI();
    }
};

window.createQuizFromForm = function() {
    const title = document.getElementById('quiz-title')?.value.trim();
    const question = document.getElementById('quiz-question')?.value.trim();

    if (!title || !question) {
        if (window.showToast) {
            window.showToast('Por favor, preencha o título e a pergunta', 'error');
        }
        return;
    }

    const options = [];
    for (let i = 0; i < 4; i++) {
        const option = document.getElementById(`option-${i}`)?.value.trim();
        if (!option) {
            if (window.showToast) {
                window.showToast(`Por favor, preencha a opção ${String.fromCharCode(65 + i)}`, 'error');
            }
            return;
        }
        options.push(option);
    }

    const correctAnswer = document.querySelector('input[name="correct-answer"]:checked')?.value;
    if (correctAnswer === undefined) {
        if (window.showToast) {
            window.showToast('Por favor, selecione a resposta correta', 'error');
        }
        return;
    }

    const quizData = {
        title: title,
        question: question,
        options: options,
        correctAnswer: parseInt(correctAnswer)
    };

    QuizManager.createQuiz(quizData);
};

window.endCurrentQuiz = function() {
    if (confirm('Tem certeza que deseja encerrar o quiz atual?')) {
        QuizManager.endQuiz();
    }
};

window.viewQuizResults = async function() {
    const results = await QuizManager.getResults();
    if (!results) {
        if (window.showToast) {
            window.showToast('Nenhum resultado disponível', 'error');
        }
        return;
    }

    const section = document.getElementById('quiz-management-section');
    const content = section?.querySelector('.section-content');
    if (!content) return;

    content.innerHTML = `
        <div class="quiz-results">
            <div class="results-header">
                <h3>Resultados do Quiz: ${results.quiz.title}</h3>
                <button class="btn btn-secondary" onclick="QuizManager.updateTeacherQuizUI()">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            </div>

            <div class="results-summary">
                <div class="summary-card total">
                    <div class="summary-number total">${results.totalStudents}</div>
                    <div class="summary-label">Total de Respostas</div>
                </div>
                <div class="summary-card correct">
                    <div class="summary-number correct">${results.correctAnswers}</div>
                    <div class="summary-label">Respostas Corretas</div>
                </div>
                <div class="summary-card incorrect">
                    <div class="summary-number incorrect">${results.incorrectAnswers}</div>
                    <div class="summary-label">Respostas Incorretas</div>
                </div>
            </div>

            <div class="quiz-question">
                <strong>Pergunta:</strong> ${results.quiz.question}
            </div>

            <div class="quiz-options">
                ${results.quiz.options.map((option, index) => `
                    <div class="quiz-option-display ${index === results.quiz.correctAnswer ? 'correct-option' : ''}">
                        ${String.fromCharCode(65 + index)}) ${option}
                        ${index === results.quiz.correctAnswer ? '<i class="fas fa-check correct-icon"></i>' : ''}
                    </div>
                `).join('')}
            </div>

            ${results.responses.length > 0 ? `
                <div class="responses-list">
                    <h4>Respostas dos Alunos:</h4>
                    ${results.responses.map(response => `
                        <div class="response-item ${response.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="response-student">${response.studentName}</div>
                            <div class="response-answer">
                                <span>${String.fromCharCode(65 + response.selectedOption)}) ${results.quiz.options[response.selectedOption]}</span>
                                <i class="fas ${response.isCorrect ? 'fa-check' : 'fa-times'} response-icon ${response.isCorrect ? 'correct' : 'incorrect'}"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>Nenhuma resposta recebida ainda.</p>'}
        </div>
    `;
};

window.selectQuizOption = function(optionIndex) {
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });

    const selectedOption = document.querySelector(`.quiz-option:nth-child(${optionIndex + 1})`);
    if (selectedOption) {
        selectedOption.classList.add('selected');

        const radio = selectedOption.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
    }
};

window.submitQuizAnswer = function() {
    const selectedRadio = document.querySelector('input[name="quiz-answer"]:checked');
    if (!selectedRadio) {
        if (window.showToast) {
            window.showToast('Por favor, selecione uma resposta', 'error');
        }
        return;
    }

    const selectedOption = parseInt(selectedRadio.value);
    StudentQuizManager.submitAnswer(selectedOption);
};

export { QuizManager, StudentQuizManager };
