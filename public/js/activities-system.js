// Sistema de Atividades - Front-end
// Gerencia criação de atividades pelo professor e respostas dos alunos

class ActivitiesSystem {
    constructor() {
        this.activities = [];
        this.responses = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
    }

    bindEvents() {
        // Event listeners para ações do sistema
        document.addEventListener('click', (e) => {
            // Ações do professor
            if (e.target.matches('[data-action="create-activity"]')) {
                this.openCreateActivityModal();
            }
            if (e.target.matches('[data-action="save-activity"]')) {
                this.saveActivity();
            }
            if (e.target.matches('[data-action="view-responses"]')) {
                const activityId = parseInt(e.target.dataset.activityId);
                this.viewActivityResponses(activityId);
            }
            if (e.target.matches('[data-action="delete-activity"]')) {
                const activityId = parseInt(e.target.dataset.activityId);
                this.deleteActivity(activityId);
            }
            if (e.target.matches('[data-action="download-response"]')) {
                const responseId = parseInt(e.target.dataset.responseId);
                this.downloadResponse(responseId);
            }

            // Ações do aluno
            if (e.target.matches('[data-action="view-activity"]')) {
                const activityId = parseInt(e.target.dataset.activityId);
                this.openActivityModal(activityId);
            }
            if (e.target.matches('[data-action="submit-response"]')) {
                const activityId = parseInt(e.target.dataset.activityId);
                this.submitResponse(activityId);
            }

            // Fechar modais
            if (e.target.matches('[data-action="close-modal"]')) {
                this.closeAllModals();
            }
        });

        // Upload de arquivos
        document.addEventListener('change', (e) => {
            if (e.target.matches('#response-file')) {
                this.handleFileUpload(e.target);
            }
        });
    }

    // PROFESSOR - Abrir modal de criação de atividade
    openCreateActivityModal() {
        const modal = document.getElementById('create-activity-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            
            // Limpar formulário
            this.clearActivityForm();
            
            // Focar no título
            setTimeout(() => {
                const titleInput = document.getElementById('activity-title');
                if (titleInput) titleInput.focus();
            }, 100);
        }
    }

    

    // PROFESSOR - Salvar nova atividade
    async saveActivity() {
        const title = document.getElementById('activity-title')?.value.trim();
        const description = document.getElementById('activity-description')?.value.trim();
        const type = document.getElementById('activity-type')?.value;
        const dueDate = document.getElementById('activity-due-date')?.value;
        const maxFileSize = document.getElementById('activity-max-file-size')?.value;

        // Validações
        if (!title) {
            this.showToast('Por favor, digite o título da atividade', 'error');
            return;
        }

        if (!description) {
            this.showToast('Por favor, digite a descrição da atividade', 'error');
            return;
        }

        if (!type) {
            this.showToast('Por favor, selecione o tipo de resposta', 'error');
            return;
        }

        // Criar atividade
        const activityData = {
            titulo: title,
            descricao: description,
            tipo: type, // 'text', 'file', 'both'
            dataPrazo: dueDate || null,
            tamanhoMaximoArquivo: parseInt(maxFileSize) || 10, // MB
            professorId: AppState.user.id // Assuming AppState.user holds the current teacher's ID
        };

        try {
            const createdActivity = await api.atividades.create(activityData);
            this.activities.push(createdActivity);
            
            this.showToast('Atividade criada com sucesso!', 'success');
            this.closeAllModals();
            this.updateTeacherActivitiesUI();
        } catch (error) {
            this.showToast('Erro ao criar atividade: ' + error.message, 'error');
            console.error('Erro ao criar atividade:', error);
        }
    }

    // PROFESSOR - Ver respostas de uma atividade
    viewActivityResponses(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;

        const responses = this.responses.filter(r => r.activityId === activityId);
        
        const modal = document.getElementById('activity-responses-modal');
        if (!modal) return;

        // Atualizar conteúdo do modal
        const titleElement = modal.querySelector('.modal-title');
        const contentElement = modal.querySelector('.responses-content');

        if (titleElement) {
            titleElement.textContent = `Respostas: ${activity.title}`;
        }

        if (contentElement) {
            if (responses.length === 0) {
                contentElement.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>Nenhuma resposta recebida ainda</p>
                        <small>As respostas dos alunos aparecerão aqui</small>
                    </div>
                `;
            } else {
                contentElement.innerHTML = `
                    <div class="responses-summary">
                        <div class="summary-item">
                            <span class="summary-number">${responses.length}</span>
                            <span class="summary-label">Respostas Recebidas</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-number">${[...new Set(responses.map(r => r.studentName))].length}</span>
                            <span class="summary-label">Alunos Únicos</span>
                        </div>
                    </div>
                    <div class="responses-list">
                        ${responses.map(response => this.renderResponseItem(response)).join('')}
                    </div>
                `;
            }
        }

        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    // PROFESSOR - Renderizar item de resposta
    renderResponseItem(response) {
        const submittedAt = new Date(response.submittedAt).toLocaleString('pt-BR');
        
        return `
            <div class="response-item">
                <div class="response-header">
                    <div class="student-info">
                        <i class="fas fa-user-circle"></i>
                        <span class="student-name">${this.escapeHtml(response.studentName)}</span>
                        <span class="submission-time">${submittedAt}</span>
                    </div>
                    ${response.fileName ? `
                        <button class="btn-download" data-action="download-response" data-response-id="${response.id}">
                            <i class="fas fa-download"></i>
                            ${this.escapeHtml(response.fileName)}
                        </button>
                    ` : ''}
                </div>
                ${response.textResponse ? `
                    <div class="response-text">
                        <h4>Resposta em Texto:</h4>
                        <p>${this.escapeHtml(response.textResponse)}</p>
                    </div>
                ` : ''}
                ${response.fileName ? `
                    <div class="response-file">
                        <h4>Arquivo Enviado:</h4>
                        <div class="file-info">
                            <i class="fas fa-file"></i>
                            <span>${this.escapeHtml(response.fileName)}</span>
                            <span class="file-size">(${this.formatFileSize(response.fileSize)})</span>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // PROFESSOR - Deletar atividade
    async deleteActivity(activityId) {
        if (confirm('Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.')) {
            try {
                await api.atividades.remove(activityId);
                this.activities = this.activities.filter(a => a.id !== activityId);
                this.responses = this.responses.filter(r => r.activityId !== activityId);
                this.showToast('Atividade excluída com sucesso', 'info');
                this.updateTeacherActivitiesUI();
            } catch (error) {
                this.showToast('Erro ao excluir atividade: ' + error.message, 'error');
                console.error('Erro ao excluir atividade:', error);
            }
        }
    }

    // PROFESSOR - Atualizar interface do professor
    updateTeacherActivitiesUI() {
        const container = document.getElementById('teacher-activities-list');
        if (!container) return;

        if (this.activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>Nenhuma atividade criada ainda</p>
                    <button class="btn btn-primary" data-action="create-activity">
                        <i class="fas fa-plus" id="materialAdicionar"></i> Criar Primeira Atividade
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.activities.map(activity => {
            const responseCount = this.responses.filter(r => r.activityId === activity.id).length;
            const uniqueStudents = [...new Set(this.responses.filter(r => r.activityId === activity.id).map(r => r.studentName))].length;
            const createdAt = new Date(activity.createdAt).toLocaleDateString('pt-BR');
            
            return `
                <div class="activity-card teacher-activity">
                    <div class="activity-header">
                        <h3 class="activity-title">${this.escapeHtml(activity.title)}</h3>
                        <div class="activity-actions">
                            <button class="btn-icon view" data-action="view-responses" data-activity-id="${activity.id}" title="Ver respostas">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon delete" data-action="delete-activity" data-activity-id="${activity.id}" title="Excluir atividade">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="activity-description">
                        <p>${this.escapeHtml(activity.description)}</p>
                    </div>
                    <div class="activity-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Criada em ${createdAt}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-file-alt"></i>
                            <span>Tipo: ${this.getActivityTypeLabel(activity.type)}</span>
                        </div>
                        ${activity.dueDate ? `
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>Prazo: ${new Date(activity.dueDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="activity-stats">
                        <div class="stat-item">
                            <span class="stat-number">${responseCount}</span>
                            <span class="stat-label">Respostas</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${uniqueStudents}</span>
                            <span class="stat-label">Alunos</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ALUNO - Abrir modal de atividade
    openActivityModal(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;

        const modal = document.getElementById('activity-modal');
        if (!modal) return;

        // Verificar se já respondeu
        const studentName = this.getCurrentStudentName();
        const existingResponse = this.responses.find(r => 
            r.activityId === activityId && r.studentName === studentName
        );

        // Atualizar conteúdo do modal
        const titleElement = modal.querySelector('.modal-title');
        const contentElement = modal.querySelector('.activity-content');

        if (titleElement) {
            titleElement.textContent = activity.title;
        }

        if (contentElement) {
            contentElement.innerHTML = `
                <div class="activity-details">
                    <div class="activity-description">
                        <h4>Descrição:</h4>
                        <p>${this.escapeHtml(activity.description)}</p>
                    </div>
                    
                    <div class="activity-info">
                        <div class="info-item">
                            <i class="fas fa-file-alt"></i>
                            <span>Tipo de resposta: ${this.getActivityTypeLabel(activity.type)}</span>
                        </div>
                        ${activity.dueDate ? `
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span>Prazo: ${new Date(activity.dueDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                        ` : ''}
                        ${activity.type !== 'text' ? `
                            <div class="info-item">
                                <i class="fas fa-file-upload"></i>
                                <span>Tamanho máximo: ${activity.maxFileSize}MB</span>
                            </div>
                        ` : ''}
                    </div>

                    ${existingResponse ? `
                        <div class="existing-response">
                            <div class="response-status">
                                <i class="fas fa-check-circle"></i>
                                <span>Você já respondeu esta atividade</span>
                            </div>
                            <div class="response-details">
                                <p><strong>Enviado em:</strong> ${new Date(existingResponse.submittedAt).toLocaleString('pt-BR')}</p>
                                ${existingResponse.textResponse ? `
                                    <div class="response-text">
                                        <strong>Sua resposta:</strong>
                                        <p>${this.escapeHtml(existingResponse.textResponse)}</p>
                                    </div>
                                ` : ''}
                                ${existingResponse.fileName ? `
                                    <div class="response-file">
                                        <strong>Arquivo enviado:</strong>
                                        <span>${this.escapeHtml(existingResponse.fileName)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : `
                        <div class="response-form">
                            <h4>Enviar Resposta:</h4>
                            
                            ${activity.type === 'text' || activity.type === 'both' ? `
                                <div class="form-group">
                                    <label for="response-text">Resposta em Texto:</label>
                                    <textarea id="response-text" placeholder="Digite sua resposta aqui..." rows="5"></textarea>
                                </div>
                            ` : ''}
                            
                            ${activity.type === 'file' || activity.type === 'both' ? `
                                <div class="form-group">
                                    <label for="response-file">Arquivo:</label>
                                    <div class="file-upload-wrapper">
                                        <input type="file" id="response-file" accept="*/*">
                                        <label for="response-file" class="file-upload-label">
                                            <i class="fas fa-cloud-upload-alt"></i>
                                            <span>Escolher arquivo</span>
                                        </label>
                                    </div>
                                    <div id="file-preview" style="display: none;"></div>
                                </div>
                            ` : ''}

                            <button class="btn btn-primary" data-action="submit-response" data-activity-id="${activityId}">
                                <i class="fas fa-paper-plane"></i> Enviar Resposta
                            </button>
                        </div>
                    `}
                </div>
            `;
        }

        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    // ALUNO - Enviar resposta
    async submitResponse(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;

        const alunoId = StudentManager.getTempId();
        if (!alunoId) {
            this.showToast("ID do aluno não encontrado.", "error");
            return;
        }

        const textResponse = document.getElementById("response-text")?.value.trim();
        const fileInput = document.getElementById("response-file");
        const file = fileInput?.files[0];

        if (activity.tipo === "text" && !textResponse) {
            this.showToast("Por favor, digite sua resposta.", "error");
            return;
        }

        if (activity.tipo === "file" && !file) {
            this.showToast("Por favor, selecione um arquivo para enviar.", "error");
            return;
        }

        if (activity.tipo === "both" && !textResponse && !file) {
            this.showToast("Por favor, digite sua resposta ou selecione um arquivo.", "error");
            return;
        }

        if (file && file.size > activity.tamanhoMaximoArquivo * 1024 * 1024) {
            this.showToast(`O arquivo excede o tamanho máximo permitido de ${activity.tamanhoMaximoArquivo}MB.`, "error");
            return;
        }

        const responseData = {
            atividadeId: activityId,
            alunoId: alunoId,
            respostaTexto: textResponse || null,
            nomeArquivo: file ? file.name : null,
            tipoArquivo: file ? file.type : null,
            tamanhoArquivo: file ? file.size : null,
            // fileContent: file ? await this.readFileAsBase64(file) : null, // Implement file upload to a service
        };

        try {
            const createdResponse = await api.respostasAtividades.create(responseData);
            this.responses.push(createdResponse);
            this.showToast("Resposta enviada com sucesso!", "success");
            this.closeAllModals();
            this.updateTeacherActivitiesUI();
            this.updateStudentActivitiesUI();
        } catch (error) {
            this.showToast("Erro ao enviar resposta: " + error.message, "error");
            console.error("Erro ao enviar resposta:", error);
        }
    }

    // ALUNO - Atualizar interface do aluno
    updateStudentActivitiesUI() {
        const container = document.getElementById('student-activities-list');
        if (!container) return;

        if (this.activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>Nenhuma atividade disponível</p>
                    <small>As atividades criadas pelo professor aparecerão aqui</small>
                </div>
            `;
            return;
        }

        const studentName = this.getCurrentStudentName();

        container.innerHTML = this.activities.map(activity => {
            const hasResponded = this.responses.some(r => 
                r.activityId === activity.id && r.studentName === studentName
            );
            
            const createdAt = new Date(activity.createdAt).toLocaleDateString('pt-BR');
            const isOverdue = activity.dueDate && new Date(activity.dueDate) < new Date();
            
            return `
                <div class="activity-card student-activity ${hasResponded ? 'responded' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="activity-header">
                        <h3 class="activity-title">${this.escapeHtml(activity.title)}</h3>
                        <div class="activity-status">
                            ${hasResponded ? `
                                <span class="status-badge responded">
                                    <i class="fas fa-check-circle"></i>
                                    Respondida
                                </span>
                            ` : isOverdue ? `
                                <span class="status-badge overdue">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    Atrasada
                                </span>
                            ` : `
                                <span class="status-badge pending">
                                    <i class="fas fa-clock"></i>
                                    Pendente
                                </span>
                            `}
                        </div>
                    </div>
                    <div class="activity-description">
                        <p>${this.escapeHtml(activity.description)}</p>
                    </div>
                    <div class="activity-meta">
                        <div class="meta-item">
                            <i class="fas fa-calendar"></i>
                            <span>Criada em ${createdAt}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-file-alt"></i>
                            <span>Tipo: ${this.getActivityTypeLabel(activity.type)}</span>
                        </div>
                        ${activity.dueDate ? `
                            <div class="meta-item">
                                <i class="fas fa-clock"></i>
                                <span>Prazo: ${new Date(activity.dueDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="activity-actions">
                        <button class="btn btn-primary" data-action="view-activity" data-activity-id="${activity.id}">
                            <i class="fas fa-eye"></i>
                            ${hasResponded ? 'Ver Detalhes' : 'Responder'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Utilitários
    getCurrentStudentName() {
        return document.getElementById('student-name-input')?.value?.trim() || 'Aluno Anônimo';
    }

    getActivityTypeLabel(type) {
        const labels = {
            'text': 'Texto',
            'file': 'Arquivo',
            'both': 'Texto e Arquivo'
        };
        return labels[type] || 'Desconhecido';
    }

    clearActivityForm() {
        const form = document.getElementById('create-activity-form');
        if (form) {
            form.reset();
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.activity-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('active');
        });
    }

    handleFileUpload(input) {
        const file = input.files[0];
        const preview = document.getElementById('file-preview');
        
        if (file && preview) {
            preview.style.display = 'block';
            preview.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file"></i>
                    <span class="file-name">${this.escapeHtml(file.name)}</span>
                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                </div>
                <button class="btn-remove-file" onclick="this.parentElement.style.display='none'; document.getElementById('response-file').value='';">&times;</button>
            `;
        }
    }

    downloadResponse(responseId) {
        const response = this.responses.find(r => r.id === responseId);
        if (response && response.fileContent) {
            const a = document.createElement('a');
            a.href = response.fileContent;
            a.download = response.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        } else {
            this.showToast("Arquivo não encontrado para download.", "error");
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    async loadData() {
        try {
            this.activities = await api.atividades.getAll();
            this.responses = await api.respostasAtividades.getAll();
            this.updateTeacherActivitiesUI();
            this.updateStudentActivitiesUI();
        } catch (error) {
            console.error("Erro ao carregar dados de atividades:", error);
            this.showToast("Erro ao carregar atividades e respostas.", "error");
        }
    }

    saveToStorage() {
        // No longer needed as data is persisted via API
    }
}

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', () => {
    window.activitiesSystem = new ActivitiesSystem();
});

