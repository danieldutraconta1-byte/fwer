// Hand Raise Management System

// Global hand raise state
const HandRaiseState = {
    raisedHands: [],
    studentHandRaised: false,
    lastHandRaiseTime: null
};

// Hand Raise Manager
const HandRaiseManager = {
    // Student raises hand
    raiseHand: async (studentName) => {
        if (!studentName) {
            showToast('Nome do aluno não encontrado', 'error');
            return false;
        }
        
        const alunoId = StudentManager.getTempId();
        
        // Check if student already has hand raised
        const existingHandRaise = HandRaiseState.raisedHands.find(h => h.alunoId === alunoId);
        
        if (existingHandRaise) {
            // Remove existing hand raise
            try {
                await api.maosLevantadas.remove(existingHandRaise.id);
                HandRaiseState.raisedHands = HandRaiseState.raisedHands.filter(h => h.alunoId !== alunoId);
                HandRaiseState.studentHandRaised = false;
                
                showToast('Mão abaixada', 'info');
                HandRaiseManager.updateStudentHandButton();
                HandRaiseManager.updateTeacherHandsDisplay(); // Update teacher UI immediately
                
                return false;
            } catch (error) {
                showToast('Erro ao abaixar a mão: ' + error.message, 'error');
                console.error('Erro ao abaixar a mão:', error);
                return false;
            }
        } else {
            // Add new hand raise
            const handRaise = {
                alunoId: alunoId,
                nomeAluno: studentName,
                dataHora: new Date()
            };
            
            try {
                const createdHandRaise = await api.maosLevantadas.create(handRaise);
                HandRaiseState.raisedHands.push(createdHandRaise);
                HandRaiseState.studentHandRaised = true;
                HandRaiseState.lastHandRaiseTime = new Date();
                
                showToast('Mão levantada! O professor foi notificado.', 'success');
                HandRaiseManager.updateStudentHandButton();
                HandRaiseManager.updateTeacherHandsDisplay(); // Update teacher UI immediately
                
                return true;
            } catch (error) {
                showToast('Erro ao levantar a mão' + error.message, 'error');
                console.error('Erro ao levantar a mão:', error);
                return false;
            }
        }
    },
    
    // Update student hand button state
    updateStudentHandButton: () => {
        const handButton = document.querySelector('button[onclick="raiseHand()"]');
        if (!handButton) return;
        
        if (HandRaiseState.studentHandRaised) {
            handButton.innerHTML = '<i class="fas fa-hand-paper"></i> Abaixar Mão';
            handButton.className = 'btn btn-danger btn-small';
        } else {
            handButton.innerHTML = '<i class="fas fa-hand-paper"></i> Levantar Mão';
            handButton.className = 'btn btn-warning btn-small';
        }
    },
    
    // Notify teacher about hand raise changes
    notifyTeacher: async () => {
        try {
            HandRaiseState.raisedHands = await api.maosLevantadas.getAll();
            // Update teacher\'s raised hands display
            HandRaiseManager.updateTeacherHandsDisplay();
            
            // Show notification to teacher
            if (RoomState.isTeacher) {
                const activeHands = HandRaiseState.raisedHands.length;
                if (activeHands > 0) {
                    HandRaiseManager.showTeacherNotification(activeHands);
                }
            }
        } catch (error) {
            console.error("Erro ao notificar professor sobre mãos levantadas:", error);
        }
    },
    
    // Show notification to teacher
    showTeacherNotification: (count) => {
        // Remove existing notification
        const existingNotification = document.querySelector('.raised-hand-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'raised-hand-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-hand-paper"></i>
                <span>${count} aluno${count > 1 ? 's' : ''} com a mão levantada</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Click to view details
        notification.addEventListener('click', () => {
            openRaisedHands();
            notification.remove();
        });
    },
    
    // Update teacher's raised hands display
    updateTeacherHandsDisplay: () => {
        const handsSection = document.getElementById('raised-hands-section');
        if (!handsSection) return;
        
        const handsList = handsSection.querySelector('.raised-hands-list');
        if (!handsList) return;
        
        if (HandRaiseState.raisedHands.length === 0) {
            handsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-hand-paper" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                    <p>Nenhum aluno com a mão levantada</p>
                </div>
            `;
            return;
        }
        
        handsList.innerHTML = HandRaiseState.raisedHands.map(hand => `
            <div class="raised-hand-item">
                <div class="hand-student-info">
                    <i class="fas fa-hand-paper hand-icon"></i>
                    <span class="student-name">${hand.studentName}</span>
                </div>
                <div class="hand-actions">
                    <span class="hand-time">${new Date(hand.raisedAt).toLocaleTimeString()}</span>
                    <button class="btn btn-small btn-secondary" onclick="acknowledgeHand('${hand.studentId}')">
                        <i class="fas fa-check"></i> Atender
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    // Acknowledge a raised hand (teacher)
    acknowledgeHand: async (handId) => {
        try {
            await api.maosLevantadas.remove(handId);
            HandRaiseState.raisedHands = HandRaiseState.raisedHands.filter(h => h.id !== handId);
            
            showToast('Mão atendida com sucesso!', 'success');
            HandRaiseManager.updateTeacherHandsDisplay();
            
            // If this was the current student, update their button
            if (StudentManager.getTempId() && HandRaiseState.studentHandRaised) {
                const studentHand = HandRaiseState.raisedHands.find(h => h.alunoId === StudentManager.getTempId());
                if (!studentHand) {
                    HandRaiseState.studentHandRaised = false;
                    HandRaiseManager.updateStudentHandButton();
                }
            }
        } catch (error) {
            showToast('Erro ao atender a mão: ' + error.message, 'error');
            console.error('Erro ao atender a mão:', error);
        }
    },
    
    // Clear all raised hands (teacher)
    clearAllHands: async () => {
        if (confirm('Tem certeza que deseja limpar todas as mãos levantadas?')) {
            try {
                await api.maosLevantadas.removeAll();
                HandRaiseState.raisedHands = [];
                HandRaiseState.studentHandRaised = false;
                
                HandRaiseManager.updateTeacherHandsDisplay();
                showToast('Todas as mãos foram abaixadas', 'info');
            } catch (error) {
                showToast('Erro ao limpar mãos levantadas: ' + error.message, 'error');
                console.error('Erro ao limpar mãos levantadas:', error);
            }
        }
    },
    
    // Initialize hand raise system
    init: async () => {
        try {
            HandRaiseState.raisedHands = await api.maosLevantadas.getAll();
            const studentId = StudentManager.getTempId();
            if (studentId) {
                HandRaiseState.studentHandRaised = HandRaiseState.raisedHands.some(hand => hand.alunoId === studentId);
            }
        } catch (error) {
            console.error("Erro ao carregar mãos levantadas:", error);
        }
        
        // Update UI
        setTimeout(() => {
            HandRaiseManager.updateStudentHandButton();
            HandRaiseManager.updateTeacherHandsDisplay();
        }, 100);
    },
    
    // Clean up when leaving room
    cleanup: () => {
        HandRaiseState.raisedHands = [];
        HandRaiseState.studentHandRaised = false;
        HandRaiseState.lastHandRaiseTime = null;
    }
};

// Update room leave function to clean up hand raises
const originalLeaveRoomHandRaise = RoomManager.leaveRoom;
RoomManager.leaveRoom = function() {
    if (RoomState.isStudent) {
        HandRaiseManager.cleanup();
    }
    return originalLeaveRoomHandRaise();
};

// Initialize hand raise system
document.addEventListener('DOMContentLoaded', () => {
    HandRaiseManager.init();
    
    // Check for raised hands periodically (for teacher)
    setInterval(async () => {
        if (RoomState.isTeacher) {
            try {
                const hands = await api.maosLevantadas.getAll();
                if (hands.length !== HandRaiseState.raisedHands.length) {
                    HandRaiseState.raisedHands = hands;
                    HandRaiseManager.updateTeacherHandsDisplay();
                    
                    if (hands.length > 0) {
                        HandRaiseManager.showTeacherNotification(hands.length);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar mãos levantadas periodicamente:", error);
            }
        }
    }, 3000);
});

// Export for global access
window.HandRaiseManager = HandRaiseManager;
window.HandRaiseState = HandRaiseState;

