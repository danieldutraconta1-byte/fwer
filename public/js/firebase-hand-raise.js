import { db, doc, updateDoc, onSnapshot, query, where, collection, getDoc, getDocs } from './firebase-config.js';

const HandRaiseManager = {
    unsubscribers: [],

    raiseHand: async (studentName) => {
        if (!window.StudentManager || !window.StudentManager.getId()) {
            if (window.showToast) {
                window.showToast('Por favor, digite seu nome primeiro', 'error');
            }
            return;
        }

        const studentId = window.StudentManager.getId();

        try {
            const studentDoc = doc(db, 'alunos', studentId);
            const currentHandState = await getDoc(studentDoc);

            if (currentHandState.exists()) {
                const isRaised = currentHandState.data().raisedHand || false;

                await updateDoc(studentDoc, {
                    raisedHand: !isRaised
                });

                if (window.showToast) {
                    if (!isRaised) {
                        window.showToast('Mão levantada! O professor foi notificado.', 'success');
                    } else {
                        window.showToast('Mão abaixada.', 'info');
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao levantar mão:', error);
            if (window.showToast) {
                window.showToast('Erro ao atualizar estado da mão', 'error');
            }
        }
    },

    updateTeacherHandsDisplay: () => {
        const container = document.querySelector('#raised-hands-section .raised-hands-list');
        if (!container) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(
                collection(db, 'alunos'),
                where('roomCode', '==', window.RoomState.roomCode),
                where('raisedHand', '==', true)
            ),
            (snapshot) => {
                const studentsWithHandsRaised = [];
                snapshot.forEach((doc) => {
                    studentsWithHandsRaised.push({ id: doc.id, ...doc.data() });
                });

                if (studentsWithHandsRaised.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-hand-paper"></i>
                            <p>Nenhum aluno com a mão levantada</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = studentsWithHandsRaised.map(student => `
                    <div class="hand-raised-item">
                        <div class="student-info">
                            <i class="fas fa-user-circle"></i>
                            <span class="student-name">${HandRaiseManager.escapeHtml(student.name)}</span>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="HandRaiseManager.acknowledgeHand('${student.id}')">
                            <i class="fas fa-check"></i>
                            Atender
                        </button>
                    </div>
                `).join('');
            }
        );

        HandRaiseManager.unsubscribers.push(unsubscribe);
    },

    acknowledgeHand: async (studentId) => {
        try {
            await updateDoc(doc(db, 'alunos', studentId), {
                raisedHand: false
            });

            if (window.showToast) {
                window.showToast('Aluno atendido', 'success');
            }
        } catch (error) {
            console.error('Erro ao atender aluno:', error);
        }
    },

    clearAllHands: async () => {
        if (!confirm('Tem certeza que deseja abaixar todas as mãos?')) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        try {
            const snapshot = await getDocs(
                query(
                    collection(db, 'alunos'),
                    where('roomCode', '==', window.RoomState.roomCode),
                    where('raisedHand', '==', true)
                )
            );

            const updatePromises = [];
            snapshot.forEach((docSnapshot) => {
                updatePromises.push(updateDoc(docSnapshot.ref, { raisedHand: false }));
            });

            await Promise.all(updatePromises);

            if (window.showToast) {
                window.showToast('Todas as mãos foram abaixadas', 'info');
            }
        } catch (error) {
            console.error('Erro ao limpar mãos:', error);
        }
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    cleanup: () => {
        HandRaiseManager.unsubscribers.forEach(unsub => unsub());
        HandRaiseManager.unsubscribers = [];
    }
};

window.HandRaiseManager = HandRaiseManager;

window.raiseHand = function() {
    const studentName = window.StudentManager ? window.StudentManager.getName() : null;
    if (!studentName) {
        if (window.showToast) {
            window.showToast('Por favor, digite seu nome primeiro', 'error');
        }
        return;
    }

    const icone = document.querySelector("#iconeMao i");
    if (icone) {
        if (icone.classList.contains("fa-hand-paper")) {
            icone.classList.remove("fa-hand-paper");
            icone.classList.add("fa-hand-fist");
        } else {
            icone.classList.remove("fa-hand-fist");
            icone.classList.add("fa-hand-paper");
        }
    }

    HandRaiseManager.raiseHand(studentName);
};

window.openRaisedHands = function() {
    closeAllSections();
    const section = document.getElementById('raised-hands-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        HandRaiseManager.updateTeacherHandsDisplay();
    }
};

export { HandRaiseManager };
