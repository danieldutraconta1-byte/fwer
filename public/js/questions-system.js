// Sistema de Perguntas - Front-end
// Gerencia perguntas de alunos e painel do professor

class QuestionsSystem {
    constructor() {
        this.questions = JSON.parse(sessionStorage.getItem('questions') || '[]');
        this.nextId = parseInt(sessionStorage.getItem('nextQuestionId') || '1');
        this.isTeacher = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadQuestions();
    }

    bindEvents() {
        // Event listeners para formulários e botões
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="submit-question"]')) {
                this.submitQuestion();
            }
            if (e.target.matches('[data-action="mark-answered"]')) {
                const questionId = parseInt(e.target.dataset.questionId);
                this.markAsAnswered(questionId);
            }
            if (e.target.matches('[data-action="highlight-question"]')) {
                const questionId = parseInt(e.target.dataset.questionId);
                this.highlightQuestion(questionId);
            }
            if (e.target.matches('[data-action="delete-question"]')) {
                const questionId = parseInt(e.target.dataset.questionId);
                this.deleteQuestion(questionId);
            }
        });

        // Enter key no campo de pergunta
        document.addEventListener('keypress', (e) => {
            if (e.target.matches('#question-input') && e.key === 'Enter') {
                this.submitQuestion();
            }
        });
    }

    // Método para aluno enviar pergunta
    submitQuestion() {
        const input = document.getElementById('question-input');
        const studentName = document.getElementById('student-name-input');
        
        if (!input || !input.value.trim()) {
            this.showToast('Por favor, digite sua pergunta', 'error');
            return;
        }

        const question = {
            id: this.nextId++,
            text: input.value.trim(),
            studentName: studentName ? studentName.value.trim() || 'Anônimo' : 'Anônimo',
            timestamp: new Date().toISOString(),
            status: 'pending', // pending, answered, highlighted
            isHighlighted: false
        };

        this.questions.push(question);
        this.saveToStorage();
        
        // Limpar campo
        input.value = '';
        
        this.showToast('Pergunta enviada com sucesso!', 'success');
        this.updateStudentUI();
    }

    // Marcar pergunta como respondida
    markAsAnswered(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question.status = 'answered';
            question.isHighlighted = false;
            this.saveToStorage();
            this.updateTeacherUI();
            this.showToast('Pergunta marcada como respondida', 'success');
        }
    }

    // Destacar pergunta
    highlightQuestion(questionId) {
        // Remove destaque de outras perguntas
        this.questions.forEach(q => q.isHighlighted = false);
        
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question.isHighlighted = true;
            this.saveToStorage();
            this.updateTeacherUI();
            this.showToast('Pergunta destacada', 'info');
        }
    }

    // Deletar pergunta
    deleteQuestion(questionId) {
        if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.saveToStorage();
            this.updateTeacherUI();
            this.showToast('Pergunta excluída', 'info');
        }
    }

    // Salvar no sessionStorage
    saveToStorage() {
        sessionStorage.setItem('questions', JSON.stringify(this.questions));
        sessionStorage.setItem('nextQuestionId', this.nextId.toString());
    }

    // Carregar perguntas do storage
    loadQuestions() {
        this.questions = JSON.parse(sessionStorage.getItem('questions') || '[]');
        this.nextId = parseInt(sessionStorage.getItem('nextQuestionId') || '1');
    }

    // Atualizar interface do aluno
    updateStudentUI() {
        const container = document.getElementById('student-questions-sent');
        if (!container) return;

        const studentQuestions = this.questions.filter(q => 
            q.studentName === (document.getElementById('student-name-input')?.value || 'Anônimo')
        );

        if (studentQuestions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <p>Você ainda não enviou nenhuma pergunta</p>
                </div>
            `;
            return;
        }

        container.innerHTML = studentQuestions.map(question => `
            <div class="question-item student-question ${question.status}">
                <div class="question-content">
                    <p class="question-text">${this.escapeHtml(question.text)}</p>
                    <div class="question-meta">
                        <span class="timestamp">${this.formatTime(question.timestamp)}</span>
                        <span class="status-badge ${question.status}">
                            ${this.getStatusText(question.status)}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Atualizar interface do professor
    updateTeacherUI() {
        const container = document.getElementById('teacher-questions-list');
        if (!container) return;

        if (this.questions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-question-circle"></i>
                    <p>Nenhuma pergunta recebida ainda</p>
                    <small>As perguntas dos alunos aparecerão aqui em tempo real</small>
                </div>
            `;
            return;
        }

        // Ordenar: destacadas primeiro, depois por timestamp
        const sortedQuestions = [...this.questions].sort((a, b) => {
            if (a.isHighlighted && !b.isHighlighted) return -1;
            if (!a.isHighlighted && b.isHighlighted) return 1;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        container.innerHTML = sortedQuestions.map(question => `
            <div class="question-item teacher-question ${question.status} ${question.isHighlighted ? 'highlighted' : ''}">
                <div class="question-header">
                    <div class="student-info">
                        <i class="fas fa-user-circle"></i>
                        <span class="student-name">${this.escapeHtml(question.studentName)}</span>
                        <span class="timestamp">${this.formatTime(question.timestamp)}</span>
                    </div>
                    <div class="question-actions">
                        ${question.status === 'pending' ? `
                            <button class="btn-icon highlight" data-action="highlight-question" data-question-id="${question.id}" title="Destacar pergunta">
                                <i class="fas fa-star"></i>
                            </button>
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
                    ${question.isHighlighted ? '<div class="highlight-badge"><i class="fas fa-star"></i> Pergunta em destaque</div>' : ''}
                </div>
                <div class="question-status">
                    <span class="status-badge ${question.status}">
                        <i class="fas ${this.getStatusIcon(question.status)}"></i>
                        ${this.getStatusText(question.status)}
                    </span>
                </div>
            </div>
        `).join('');

        // Atualizar contador
        this.updateQuestionsCounter();
    }

    // Atualizar contador de perguntas
    updateQuestionsCounter() {
        const counter = document.getElementById('questions-counter');
        if (counter) {
            const pendingCount = this.questions.filter(q => q.status === 'pending').length;
            counter.textContent = pendingCount;
            
            // Atualizar visibilidade do badge
            const badge = counter.closest('.notification-badge');
            if (badge) {
                badge.style.display = pendingCount > 0 ? 'block' : 'none';
            }
        }
    }

    // Obter texto do status
    getStatusText(status) {
        const statusMap = {
            'pending': 'Pendente',
            'answered': 'Respondida',
            'highlighted': 'Em destaque'
        };
        return statusMap[status] || 'Desconhecido';
    }

    // Obter ícone do status
    getStatusIcon(status) {
        const iconMap = {
            'pending': 'fa-clock',
            'answered': 'fa-check-circle',
            'highlighted': 'fa-star'
        };
        return iconMap[status] || 'fa-question';
    }

    // Formatar timestamp
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Escape HTML para segurança
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Mostrar toast notification
    showToast(message, type = 'success') {
        // Usar a função global showToast se disponível
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            // Fallback simples
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Limpar todas as perguntas (para professor)
    clearAllQuestions() {
        if (confirm('Tem certeza que deseja limpar todas as perguntas? Esta ação não pode ser desfeita.')) {
            this.questions = [];
            this.saveToStorage();
            this.updateTeacherUI();
            this.showToast('Todas as perguntas foram removidas', 'info');
        }
    }

    // Obter estatísticas das perguntas
    getStatistics() {
        const total = this.questions.length;
        const pending = this.questions.filter(q => q.status === 'pending').length;
        const answered = this.questions.filter(q => q.status === 'answered').length;
        const highlighted = this.questions.filter(q => q.isHighlighted).length;

        return {
            total,
            pending,
            answered,
            highlighted,
            students: [...new Set(this.questions.map(q => q.studentName))].length
        };
    }
}

// Instância global do sistema de perguntas
window.questionsSystem = new QuestionsSystem();

// Funções globais para uso nos templates
window.openStudentQuestionModal = function() {
    const modal = document.getElementById('student-question-modal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        // Focar no campo de input
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



// Atualizar UI periodicamente para simular tempo real
setInterval(() => {
    if (document.getElementById('teacher-questions-list')) {
        window.questionsSystem.updateTeacherUI();
    }
    if (document.getElementById('student-questions-sent')) {
        window.questionsSystem.updateStudentUI();
    }
}, 5000);
