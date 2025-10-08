import { db, collection, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from './firebase-config.js';

const StudentManager = {
    currentStudentName: null,
    currentStudentId: null,

    showNameModal: () => {
        const modal = document.getElementById('student-name-modal');
        if (modal) {
            modal.style.display = 'flex';

            setTimeout(() => {
                const nameInput = document.getElementById('student-name-input');
                if (nameInput) nameInput.focus();
            }, 100);
        }
    },

    hideNameModal: () => {
        const modal = document.getElementById('student-name-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    confirmName: async (name) => {
        if (!name || name.trim().length < 2) {
            if (window.showToast) {
                window.showToast('Por favor, digite um nome válido (mínimo 2 caracteres)', 'error');
            }
            return false;
        }

        StudentManager.currentStudentName = name.trim();

        try {
            if (window.RoomState && window.RoomState.roomCode) {
                const studentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                StudentManager.currentStudentId = studentId;

                await setDoc(doc(db, 'alunos', studentId), {
                    name: StudentManager.currentStudentName,
                    roomCode: window.RoomState.roomCode,
                    joinedAt: serverTimestamp(),
                    isPresent: false,
                    raisedHand: false
                });

                StudentManager.hideNameModal();
                StudentManager.updateStudentUI();

                if (window.showToast) {
                    window.showToast(`Bem-vindo, ${StudentManager.currentStudentName}!`, 'success');
                }

                return true;
            }
        } catch (error) {
            console.error('Erro ao salvar aluno:', error);
            if (window.showToast) {
                window.showToast('Erro ao entrar na sala', 'error');
            }
            return false;
        }
    },

    updateStudentUI: () => {
        if (!StudentManager.currentStudentName) return;

        const roomHeader = document.querySelector('.room-header .container');
        if (roomHeader && !document.querySelector('.student-info-display')) {
            const studentInfoDiv = document.createElement('div');
            studentInfoDiv.className = 'student-info-display';
            studentInfoDiv.innerHTML = `
                <div class="student-welcome">
                    <div class="student-avatar">
                        ${StudentManager.currentStudentName.charAt(0).toUpperCase()}
                    </div>
                    <div class="student-details">
                        <h3>${StudentManager.currentStudentName}</h3>
                        <p>Participando da sala ${window.RoomState ? window.RoomState.roomCode : ''}</p>
                    </div>
                </div>
            `;

            const roomInfo = roomHeader.querySelector('.room-info');
            if (roomInfo) {
                roomInfo.parentNode.insertBefore(studentInfoDiv, roomInfo.nextSibling);
            }
        }
    },

    getName: () => {
        return StudentManager.currentStudentName;
    },

    getId: () => {
        return StudentManager.currentStudentId;
    },

    removeFromFirebase: async () => {
        if (StudentManager.currentStudentId) {
            try {
                await deleteDoc(doc(db, 'alunos', StudentManager.currentStudentId));
            } catch (error) {
                console.error('Erro ao remover aluno:', error);
            }
        }
        StudentManager.currentStudentName = null;
        StudentManager.currentStudentId = null;
    }
};

const originalJoinRoom = window.RoomManager ? window.RoomManager.joinRoom : null;
if (window.RoomManager) {
    window.RoomManager.joinRoom = async function(roomCode) {
        const room = await originalJoinRoom(roomCode);

        setTimeout(() => {
            if (!StudentManager.currentStudentName) {
                StudentManager.showNameModal();
            } else {
                StudentManager.updateStudentUI();
            }
        }, 500);

        return room;
    };
}

window.StudentManager = StudentManager;

export { StudentManager };
