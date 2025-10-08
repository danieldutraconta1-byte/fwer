import { db, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, where, addDoc, getDocs } from './firebase-config.js';

class ActivitiesSystem {
    constructor() {
        this.unsubscribers = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="create-activity"]')) {
                this.openCreateActivityModal();
            }
            if (e.target.matches('[data-action="save-activity"]')) {
                this.saveActivity();
            }
            if (e.target.matches('[data-action="view-responses"]')) {
                const activityId = e.target.dataset.activityId;
                this.viewActivityResponses(activityId);
            }
            if (e.target.matches('[data-action="delete-activity"]')) {
                const activityId = e.target.dataset.activityId;
                this.deleteActivity(activityId);
            }
            if (e.target.matches('[data-action="view-activity"]')) {
                const activityId = e.target.dataset.activityId;
                this.openActivityModal(activityId);
            }
            if (e.target.matches('[data-action="submit-response"]')) {
                const activityId = e.target.dataset.activityId;
                this.submitResponse(activityId);
            }
            if (e.target.matches('[data-action="close-modal"]')) {
                this.closeAllModals();
            }
        });
    }

    openCreateActivityModal() {
        const modal = document.getElementById('create-activity-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('active');
            this.clearActivityForm();

            setTimeout(() => {
                const titleInput = document.getElementById('activity-title');
                if (titleInput) titleInput.focus();
            }, 100);
        }
    }

    async saveActivity() {
        const title = document.getElementById('activity-title')?.value.trim();
        const description = document.getElementById('activity-description')?.value.trim();
        const type = document.getElementById('activity-type')?.value;
        const dueDate = document.getElementById('activity-due-date')?.value;

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

        if (!window.RoomState || !window.RoomState.roomCode) {
            this.showToast('Nenhuma sala ativa', 'error');
            return;
        }

        try {
            await addDoc(collection(db, 'atividades'), {
                title: title,
                description: description,
                type: type,
                dueDate: dueDate || null,
                maxFileSize: 10,
                roomCode: window.RoomState.roomCode,
                createdAt: serverTimestamp()
            });

            this.showToast('Atividade criada com sucesso!', 'success');
            this.closeAllModals();
            this.updateTeacherActivitiesUI();
        } catch (error) {
            this.showToast('Erro ao criar atividade: ' + error.message, 'error');
            console.error('Erro ao criar atividade:', error);
        }
    }

    async deleteActivity(activityId) {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            try {
                await deleteDoc(doc(db, 'atividades', activityId));
                this.showToast('Atividade excluída com sucesso', 'info');
                this.updateTeacherActivitiesUI();
            } catch (error) {
                this.showToast('Erro ao excluir atividade: ' + error.message, 'error');
                console.error('Erro ao excluir atividade:', error);
            }
        }
    }

    updateTeacherActivitiesUI() {
        const container = document.getElementById('teacher-activities-list');
        if (!container) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(collection(db, 'atividades'), where('roomCode', '==', window.RoomState.roomCode)),
            async (snapshot) => {
                const activities = [];
                snapshot.forEach((doc) => {
                    activities.push({ id: doc.id, ...doc.data() });
                });

                if (activities.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <p>Nenhuma atividade criada ainda</p>
                            <button class="btn btn-primary" data-action="create-activity">
                                <i class="fas fa-plus"></i> Criar Primeira Atividade
                            </button>
                        </div>
                    `;
                    return;
                }

                const responsesSnapshot = await getDocs(collection(db, 'respostas'));
                const responses = [];
                responsesSnapshot.forEach((doc) => {
                    responses.push({ id: doc.id, ...doc.data() });
                });

                container.innerHTML = activities.map(activity => {
                    const activityResponses = responses.filter(r => r.activityId === activity.id);
                    const uniqueStudents = [...new Set(activityResponses.map(r => r.studentName))].length;

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
                                    <i class="fas fa-file-alt"></i>
                                    <span>Tipo: ${this.getActivityTypeLabel(activity.type)}</span>
                                </div>
                            </div>
                            <div class="activity-stats">
                                <div class="stat-item">
                                    <span class="stat-number">${activityResponses.length}</span>
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
        );

        this.unsubscribers.push(unsubscribe);
    }

    async viewActivityResponses(activityId) {
        try {
            const activityDoc = await getDocs(query(collection(db, 'atividades'), where('__name__', '==', activityId)));
            let activity = null;
            activityDoc.forEach((doc) => {
                activity = { id: doc.id, ...doc.data() };
            });

            if (!activity) return;

            const responsesSnapshot = await getDocs(
                query(collection(db, 'respostas'), where('activityId', '==', activityId))
            );

            const responses = [];
            responsesSnapshot.forEach((doc) => {
                responses.push({ id: doc.id, ...doc.data() });
            });

            const modal = document.getElementById('activity-responses-modal');
            if (!modal) return;

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
                        </div>
                    `;
                } else {
                    contentElement.innerHTML = `
                        <div class="responses-list">
                            ${responses.map(response => `
                                <div class="response-item">
                                    <div class="response-header">
                                        <div class="student-info">
                                            <i class="fas fa-user-circle"></i>
                                            <span class="student-name">${this.escapeHtml(response.studentName)}</span>
                                        </div>
                                    </div>
                                    ${response.textResponse ? `
                                        <div class="response-text">
                                            <h4>Resposta em Texto:</h4>
                                            <p>${this.escapeHtml(response.textResponse)}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            }

            modal.style.display = 'flex';
            modal.classList.add('active');
        } catch (error) {
            console.error('Erro ao carregar respostas:', error);
        }
    }

    async openActivityModal(activityId) {
        try {
            const activitySnapshot = await getDocs(collection(db, 'atividades'));
            let activity = null;

            activitySnapshot.forEach((doc) => {
                if (doc.id === activityId) {
                    activity = { id: doc.id, ...doc.data() };
                }
            });

            if (!activity) return;

            const studentName = window.StudentManager ? window.StudentManager.getName() : 'Anônimo';

            const responsesSnapshot = await getDocs(
                query(collection(db, 'respostas'), where('activityId', '==', activityId), where('studentName', '==', studentName))
            );

            let existingResponse = null;
            responsesSnapshot.forEach((doc) => {
                existingResponse = { id: doc.id, ...doc.data() };
            });

            const modal = document.getElementById('activity-modal');
            if (!modal) return;

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

                        ${existingResponse ? `
                            <div class="existing-response">
                                <div class="response-status">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Você já respondeu esta atividade</span>
                                </div>
                                ${existingResponse.textResponse ? `
                                    <div class="response-text">
                                        <strong>Sua resposta:</strong>
                                        <p>${this.escapeHtml(existingResponse.textResponse)}</p>
                                    </div>
                                ` : ''}
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
        } catch (error) {
            console.error('Erro ao abrir atividade:', error);
        }
    }

    async submitResponse(activityId) {
        const textResponse = document.getElementById('response-text')?.value.trim();

        if (!textResponse) {
            this.showToast('Por favor, digite sua resposta', 'error');
            return;
        }

        const studentName = window.StudentManager ? window.StudentManager.getName() : 'Anônimo';

        try {
            await addDoc(collection(db, 'respostas'), {
                activityId: activityId,
                studentName: studentName,
                textResponse: textResponse,
                submittedAt: serverTimestamp()
            });

            this.showToast('Resposta enviada com sucesso!', 'success');
            this.closeAllModals();
            this.updateStudentActivitiesUI();
        } catch (error) {
            this.showToast('Erro ao enviar resposta: ' + error.message, 'error');
            console.error('Erro ao enviar resposta:', error);
        }
    }

    updateStudentActivitiesUI() {
        const container = document.getElementById('student-activities-list');
        if (!container) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(collection(db, 'atividades'), where('roomCode', '==', window.RoomState.roomCode)),
            async (snapshot) => {
                const activities = [];
                snapshot.forEach((doc) => {
                    activities.push({ id: doc.id, ...doc.data() });
                });

                if (activities.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <p>Nenhuma atividade disponível</p>
                        </div>
                    `;
                    return;
                }

                const studentName = window.StudentManager ? window.StudentManager.getName() : 'Anônimo';
                const responsesSnapshot = await getDocs(collection(db, 'respostas'));
                const responses = [];
                responsesSnapshot.forEach((doc) => {
                    responses.push({ id: doc.id, ...doc.data() });
                });

                container.innerHTML = activities.map(activity => {
                    const hasResponded = responses.some(r =>
                        r.activityId === activity.id && r.studentName === studentName
                    );

                    return `
                        <div class="activity-card student-activity ${hasResponded ? 'responded' : ''}">
                            <div class="activity-header">
                                <h3 class="activity-title">${this.escapeHtml(activity.title)}</h3>
                                <div class="activity-status">
                                    ${hasResponded ? `
                                        <span class="status-badge responded">
                                            <i class="fas fa-check-circle"></i>
                                            Respondida
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
        );

        this.unsubscribers.push(unsubscribe);
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

    escapeHtml(str) {
        if (!str) return '';
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

    cleanup() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    }
}

window.activitiesSystem = new ActivitiesSystem();
window.openTeacherActivities = function() {
    closeAllSections();
    const section = document.getElementById('teacher-activities-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        window.activitiesSystem.updateTeacherActivitiesUI();
    }
};

window.openStudentActivities = function() {
    closeAllSections();
    const section = document.getElementById('student-activities-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        window.activitiesSystem.updateStudentActivitiesUI();
    }
};

window.sairAtividade = function() {
    const modal = document.getElementById('create-activity-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
};

export { ActivitiesSystem };
