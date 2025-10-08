import { db, doc, updateDoc, onSnapshot, query, where, collection, serverTimestamp } from './firebase-config.js';

const PresenceManager = {
    unsubscribers: [],

    markPresence: async (photoData = null) => {
        if (!window.StudentManager || !window.StudentManager.getId()) {
            if (window.showToast) {
                window.showToast('Por favor, digite seu nome primeiro', 'error');
            }
            return;
        }

        const studentId = window.StudentManager.getId();

        try {
            await updateDoc(doc(db, 'alunos', studentId), {
                isPresent: true,
                presenceMarkedAt: serverTimestamp(),
                photoData: photoData
            });

            if (window.showToast) {
                window.showToast('Presença marcada com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao marcar presença:', error);
            if (window.showToast) {
                window.showToast('Erro ao marcar presença', 'error');
            }
        }
    },

    updateAttendanceList: () => {
        const container = document.getElementById('attendance-list');
        if (!container) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(collection(db, 'alunos'), where('roomCode', '==', window.RoomState.roomCode)),
            (snapshot) => {
                const students = [];
                snapshot.forEach((doc) => {
                    students.push({ id: doc.id, ...doc.data() });
                });

                if (students.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-clipboard-check"></i>
                            <p>Nenhum aluno na sala ainda</p>
                        </div>
                    `;
                    return;
                }

                const presentCount = students.filter(s => s.isPresent).length;
                const absentCount = students.length - presentCount;

                container.innerHTML = `
                    <div class="attendance-summary">
                        <div class="summary-item present">
                            <span class="summary-number">${presentCount}</span>
                            <span class="summary-label">Presentes</span>
                        </div>
                        <div class="summary-item absent">
                            <span class="summary-number">${absentCount}</span>
                            <span class="summary-label">Ausentes</span>
                        </div>
                    </div>
                    <div class="attendance-students">
                        ${students.map(student => `
                            <div class="attendance-item ${student.isPresent ? 'present' : 'absent'}">
                                <div class="student-info">
                                    <i class="fas fa-user-circle"></i>
                                    <span class="student-name">${PresenceManager.escapeHtml(student.name)}</span>
                                </div>
                                <div class="attendance-status">
                                    <span class="status-badge ${student.isPresent ? 'present' : 'absent'}">
                                        <i class="fas fa-${student.isPresent ? 'check-circle' : 'times-circle'}"></i>
                                        ${student.isPresent ? 'Presente' : 'Ausente'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        );

        PresenceManager.unsubscribers.push(unsubscribe);
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    cleanup: () => {
        PresenceManager.unsubscribers.forEach(unsub => unsub());
        PresenceManager.unsubscribers = [];
    }
};

window.PresenceManager = PresenceManager;

window.openAttendanceControl = function() {
    closeAllSections();
    const section = document.getElementById('attendance-control-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        PresenceManager.updateAttendanceList();
    }
};

window.markAttendance = function() {
    if (window.showToast) {
        window.showToast('Marcando presença...', 'info');
    }
    PresenceManager.markPresence();
};

export { PresenceManager };
