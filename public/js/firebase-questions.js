import { db, collection, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, where, addDoc, getDocs } from './firebase-config.js';

class QuestionsSystem {
    constructor() {
        this.unsubscribers = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="submit-question"]')) {
                this.submitQuestion();
            }
            if (e.target.matches('[data-action="mark-answered"]')) {
                const questionId = e.target.dataset.questionId;
                this.markAsAnswered(questionId);
            }
            if (e.target.matches('[data-action="delete-question"]')) {
                const questionId = e.target.dataset.questionId;
                this.deleteQuestion(questionId);
            }
        });
    }

    async submitQuestion() {
        const input = document.getElementById('question-input');

        if (!input || !input.value.trim()) {
            this.showToast('Por favor, digite sua pergunta', 'error');
            return;
        }

        const studentName = window.StudentManager ? window.StudentManager.getName() : 'Anônimo';

        if (!window.RoomState || !window.RoomState.roomCode) {
            this.showToast('Nenhuma sala ativa', 'error');
            return;
        }

        try {
            await addDoc(collection(db, 'perguntas'), {
                text: input.value.trim(),
                studentName: studentName,
                roomCode: window.RoomState.roomCode,
                status: 'pending',
                createdAt: serverTimestamp()
            });

            input.value = '';
            this.showToast('Pergunta enviada com sucesso!', 'success');
            this.updateStudentUI();
        } catch (error) {
            this.showToast('Erro ao enviar pergunta: ' + error.message, 'error');
            console.error('Erro ao enviar pergunta:', error);
        }
    }

    async markAsAnswered(questionId) {
        try {
            await updateDoc(doc(db, 'perguntas', questionId), {
                status: 'answered'
            });
            this.showToast('Pergunta marcada como respondida', 'success');
        } catch (error) {
            console.error('Erro ao marcar pergunta:', error);
        }
    }

    async deleteQuestion(questionId) {
        if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
            try {
                await deleteDoc(doc(db, 'perguntas', questionId));
                this.showToast('Pergunta excluída', 'info');
            } catch (error) {
                console.error('Erro ao excluir pergunta:', error);
            }
        }
    }

    updateStudentUI() {
        const container = document.getElementById('student-questions-sent');
        if (!container) return;

        const studentName = window.StudentManager ? window.StudentManager.getName() : 'Anônimo';

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(
                collection(db, 'perguntas'),
                where('roomCode', '==', window.RoomState.roomCode),
                where('studentName', '==', studentName)
            ),
            (snapshot) => {
                const questions = [];
                snapshot.forEach((doc) => {
                    questions.push({ id: doc.id, ...doc.data() });
                });

                if (questions.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-question-circle"></i>
                            <p>Você ainda não enviou nenhuma pergunta</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = questions.map(question => `
                    <div class="question-item student-question ${question.status}">
                        <div class="question-content">
                            <p class="question-text">${this.escapeHtml(question.text)}</p>
                            <div class="question-meta">
                                <span class="status-badge ${question.status}">
                                    ${this.getStatusText(question.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        );

        this.unsubscribers.push(unsubscribe);
    }

    updateTeacherUI() {
        const container = document.getElementById('teacher-questions-list');
        if (!container) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(collection(db, 'perguntas'), where('roomCode', '==', window.RoomState.roomCode)),
            (snapshot) => {
                const questions = [];
                snapshot.forEach((doc) => {
                    questions.push({ id: doc.id, ...doc.data() });
                });

                if (questions.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-question-circle"></i>
                            <p>Nenhuma pergunta recebida ainda</p>
                        </div>
                    `;
                    this.updateQuestionsCounter(0);
                    return;
                }

                const sortedQuestions = [...questions].sort((a, b) => {
                    if (a.status === 'pending' && b.status !== 'pending') return -1;
                    if (a.status !== 'pending' && b.status === 'pending') return 1;
                    return 0;
                });

                container.innerHTML = sortedQuestions.map(question => `
                    <div class="question-item teacher-question ${question.status}">
                        <div class="question-header">
                            <div class="student-info">
                                <i class="fas fa-user-circle"></i>
                                <span class="student-name">${this.escapeHtml(question.studentName)}</span>
                            </div>
                            <div class="question-actions">
                                ${question.status === 'pending' ? `
                                    <button class="btn-icon answer" data-action="mark-answered" data-question-id="${question.id}" title="Marcar como respondida">
                                        <i class="fas fa-check"></i>
                                    </button>
                                ` : ''}
                                <button class="btn-icon delete" data-action="delete-question" data-question-id="${question.id}" title="Excluir pergunta">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="question-content">
                            <p class="question-text">${this.escapeHtml(question.text)}</p>
                        </div>
                        <div class="question-status">
                            <span class="status-badge ${question.status}">
                                <i class="fas ${this.getStatusIcon(question.status)}"></i>
                                ${this.getStatusText(question.status)}
                            </span>
                        </div>
                    </div>
                `).join('');

                const pendingCount = questions.filter(q => q.status === 'pending').length;
                this.updateQuestionsCounter(pendingCount);
            }
        );

        this.unsubscribers.push(unsubscribe);
    }

    updateQuestionsCounter(count) {
        const counter = document.getElementById('questions-counter');
        if (counter) {
            counter.textContent = count;

            const badge = counter.closest('.notification-badge');
            if (badge) {
                badge.style.display = count > 0 ? 'block' : 'none';
            }
        }
    }

    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'answered': 'Respondida'
        };
        return statusMap[status] || 'Desconhecido';
    }

    getStatusIcon(status) {
        const iconMap = {
            'pending': 'fa-clock',
            'answered': 'fa-check-circle'
        };
        return iconMap[status] || 'fa-question';
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message, type = 'success') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    async clearAllQuestions() {
        if (confirm('Tem certeza que deseja limpar todas as perguntas?')) {
            if (!window.RoomState || !window.RoomState.roomCode) return;

            try {
                const snapshot = await getDocs(
                    query(collection(db, 'perguntas'), where('roomCode', '==', window.RoomState.roomCode))
                );

                const deletePromises = [];
                snapshot.forEach((doc) => {
                    deletePromises.push(deleteDoc(doc.ref));
                });

                await Promise.all(deletePromises);
                this.showToast('Todas as perguntas foram removidas', 'info');
            } catch (error) {
                console.error('Erro ao limpar perguntas:', error);
            }
        }
    }

    cleanup() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }
}

window.questionsSystem = new QuestionsSystem();

window.openStudentQuestionModal = function() {
    const modal = document.getElementById('student-question-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');

        setTimeout(() => {
            const input = document.getElementById('question-input');
            if (input) input.focus();
        }, 100);
    }
};

window.closeStudentQuestionModal = function() {
    const modal = document.getElementById('student-question-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
};

window.openTeacherQuestionsPanel = function() {
    closeAllSections();
    const section = document.getElementById('teacher-questions-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        window.questionsSystem.updateTeacherUI();
    }
};

window.clearAllQuestions = function() {
    window.questionsSystem.clearAllQuestions();
};

export { QuestionsSystem };
