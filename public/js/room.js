// Room Management System for Temporary Classrooms

// Global room state
const RoomState = {
    currentRoom: null,
    isTeacher: false,
    isStudent: false,
    connectedStudents: [],
    roomCode: null,
    qrCodeGenerated: false
};

// Room Management Functions
const RoomManager = {
    // Generate a 6-digit room code
    generateRoomCode: () => {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        return code;
    },

    // Create a new room (teacher)
    createRoom: () => {
        const roomCode = RoomManager.generateRoomCode();
        RoomState.currentRoom = {
            code: roomCode,
            teacher: 'Professor Atual',
            students: [],
            createdAt: new Date(),
            isActive: true
        };
        RoomState.isTeacher = true;
        RoomState.roomCode = roomCode;
        
        // Update UI
        RoomManager.updateTeacherUI();
        
        // Store in session storage (temporary)
        sessionStorage.setItem('currentRoom', JSON.stringify(RoomState.currentRoom));
        sessionStorage.setItem('isTeacher', 'true');
        
        console.log('Sala criada:', roomCode);
        return roomCode;
    },

    // Join a room (student)
    joinRoom: (roomCode) => {
        // Simulate room validation
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if room exists (in real app, this would be a server call)
                const storedRoom = sessionStorage.getItem('currentRoom');
                
                if (storedRoom) {
                    const room = JSON.parse(storedRoom);
                    if (room.code === roomCode && room.isActive) {
                        RoomState.currentRoom = room;
                        RoomState.isStudent = true;
                        RoomState.roomCode = roomCode;
                        
                        // Add student to room
                        const studentName = `Aluno ${Math.floor(Math.random() * 1000)}`;
                        room.students.push({
                            name: studentName,
                            joinedAt: new Date(),
                            isPresent: false
                        });
                        
                        // Update stored room
                        sessionStorage.setItem('currentRoom', JSON.stringify(room));
                        sessionStorage.setItem('isStudent', 'true');
                        sessionStorage.setItem('studentName', studentName);
                        
                        resolve(room);
                    } else {
                        reject('Sala não encontrada ou inativa');
                    }
                } else {
                    reject('Sala não encontrada');
                }
            }, 1000);
        });
    },

    // Leave room
    leaveRoom: () => {
        if (RoomState.isTeacher) {
            // End room for everyone
            RoomManager.endRoom();
        } else if (RoomState.isStudent) {
            // Remove student from room
            const room = JSON.parse(sessionStorage.getItem('currentRoom') || '{}');
            const studentName = sessionStorage.getItem('studentName');
            
            if (room.students) {
                room.students = room.students.filter(s => s.name !== studentName);
                sessionStorage.setItem('currentRoom', JSON.stringify(room));
            }
            
            // Clear student state
            RoomState.isStudent = false;
            RoomState.currentRoom = null;
            RoomState.roomCode = null;
            
            sessionStorage.removeItem('isStudent');
            sessionStorage.removeItem('studentName');
            
            // Navigate back to home
            navigateTo('home');
        }
    },

    // End room (teacher only)
    endRoom: () => {
        if (RoomState.isTeacher) {
            RoomState.currentRoom = null;
            RoomState.isTeacher = false;
            RoomState.roomCode = null;
            RoomState.qrCodeGenerated = false;
            
            // Clear storage
            exibirMenu();
            sessionStorage.removeItem('currentRoom');
            sessionStorage.removeItem('isTeacher');
            
            showToast('Sala encerrada com sucesso', 'info');
            navigateTo('home');
        }
    },

    // Update teacher UI
    updateTeacherUI: () => {
        const roomCodeElement = document.getElementById('teacher-room-code');
        const connectedStudentsElement = document.getElementById('connected-students');
        
        if (roomCodeElement && RoomState.roomCode) {
            roomCodeElement.textContent = RoomState.roomCode;
        }
        
        if (connectedStudentsElement && RoomState.currentRoom) {
            connectedStudentsElement.textContent = RoomState.currentRoom.students.length;
        }
    },

    // Update student UI
    updateStudentUI: () => {
        const roomCodeElement = document.getElementById('current-room-code');
        
        if (roomCodeElement && RoomState.roomCode) {
            roomCodeElement.textContent = RoomState.roomCode;
        }
    },

    // Generate QR Code
    generateQRCode: () => {
        return new Promise((resolve, reject) => {
            if (!RoomState.roomCode) {
                reject('Nenhuma sala ativa');
                return;
            }

            const qrContainer = document.getElementById('qr-code-container');
            if (!qrContainer) {
                reject('Container do QR Code não encontrado');
                return;
            }

            // Clear previous QR code
            qrContainer.innerHTML = '';

            // Create QR code data
            const qrData = JSON.stringify({
                type: 'room_access',
                roomCode: RoomState.roomCode,
                timestamp: Date.now()
            });

            // Generate QR code using QRCode library
            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(qrData, { width: 256, margin: 2 }, (error, canvas) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    
                    qrContainer.appendChild(canvas);
                    RoomState.qrCodeGenerated = true;
                    
                    // Update QR room code display
                    const qrRoomCodeElement = document.getElementById('qr-room-code');
                    if (qrRoomCodeElement) {
                        qrRoomCodeElement.textContent = RoomState.roomCode;
                    }
                    
                    resolve(canvas);
                });
            } else {
                // Fallback: create a simple QR code placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'qr-placeholder';
                placeholder.style.cssText = `
                    width: 256px;
                    height: 256px;
                    background: #f0f0f0;
                    border: 2px solid #0066cc;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    font-family: monospace;
                `;
                placeholder.innerHTML = `
                    <i class="fas fa-qrcode" style="font-size: 4rem; color: #0066cc; margin-bottom: 1rem;"></i>
                    <div style="font-size: 1.5rem; font-weight: bold; color: #0066cc;">${RoomState.roomCode}</div>
                    <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">QR Code da Sala</div>
                `;
                
                qrContainer.appendChild(placeholder);
                RoomState.qrCodeGenerated = true;
                
                // Update QR room code display
                const qrRoomCodeElement = document.getElementById('qr-room-code');
                if (qrRoomCodeElement) {
                    qrRoomCodeElement.textContent = RoomState.roomCode;
                }
                
                resolve(placeholder);
            }
        });
    },

    // Download QR Code
    downloadQRCode: () => {
        const canvas = document.querySelector('#qr-code-container canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `sala-${RoomState.roomCode}-qrcode.png`;
            link.href = canvas.toDataURL();
            link.click();
            showToast('QR Code baixado com sucesso', 'success');
        } else {
            showToast('QR Code não encontrado', 'error');
        }
    },

    // Print QR Code
    printQRCode: () => {
        const qrContainer = document.getElementById('qr-code-container');
        if (qrContainer) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code - Sala ${RoomState.roomCode}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                text-align: center; 
                                padding: 2rem; 
                            }
                            .qr-print { 
                                margin: 2rem auto; 
                            }
                            h1 { 
                                color: #0066cc; 
                                margin-bottom: 1rem; 
                            }
                            .room-code { 
                                font-size: 2rem; 
                                font-weight: bold; 
                                color: #0066cc; 
                                margin: 1rem 0; 
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Código de Acesso à Sala</h1>
                        <div class="room-code">${RoomState.roomCode}</div>
                        <div class="qr-print">${qrContainer.innerHTML}</div>
                        <p>Escaneie o QR Code ou digite o código para entrar na sala</p>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    },

    // Initialize room system
    init: () => {
        // Check if there's an existing room session
        const storedRoom = sessionStorage.getItem('currentRoom');
        const isTeacher = sessionStorage.getItem('isTeacher') === 'true';
        const isStudent = sessionStorage.getItem('isStudent') === 'true';
        
        if (storedRoom) {
            RoomState.currentRoom = JSON.parse(storedRoom);
            RoomState.roomCode = RoomState.currentRoom.code;
            
            if (isTeacher) {
                RoomState.isTeacher = true;
                setTimeout(() => RoomManager.updateTeacherUI(), 100);
            } else if (isStudent) {
                RoomState.isStudent = true;
                setTimeout(() => RoomManager.updateStudentUI(), 100);
            }
        }
    }
};

// QR Code Scanner Functions
const QRScanner = {
    video: null,
    stream: null,
    isScanning: false,

    // Start QR scanner
    start: () => {
        return new Promise((resolve, reject) => {
            const video = document.getElementById('qr-video');
            if (!video) {
                reject('Elemento de vídeo não encontrado');
                return;
            }

            QRScanner.video = video;

            // Request camera access
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment' // Use back camera if available
                } 
            })
            .then(stream => {
                QRScanner.stream = stream;
                video.srcObject = stream;
                video.play();
                QRScanner.isScanning = true;
                
                // Update button
                const startBtn = document.getElementById('start-scanner-btn');
                if (startBtn) {
                    startBtn.innerHTML = '<i class="fas fa-stop"></i> Parar Câmera';
                    startBtn.onclick = QRScanner.stop;
                }
                
                resolve(stream);
            })
            .catch(error => {
                console.error('Erro ao acessar câmera:', error);
                reject('Não foi possível acessar a câmera');
            });
        });
    },

    // Stop QR scanner
    stop: () => {
        if (QRScanner.stream) {
            QRScanner.stream.getTracks().forEach(track => track.stop());
            QRScanner.stream = null;
        }
        
        if (QRScanner.video) {
            QRScanner.video.srcObject = null;
        }
        
        QRScanner.isScanning = false;
        
        // Update button
        const startBtn = document.getElementById('start-scanner-btn');
        if (startBtn) {
            startBtn.innerHTML = '<i class="fas fa-camera"></i> Iniciar Câmera';
            startBtn.onclick = startQRScanner;
        }
    },

    // Simulate QR code detection (in real app, would use a QR detection library)
    simulateDetection: (roomCode) => {
        setTimeout(() => {
            if (QRScanner.isScanning) {
                showToast(`QR Code detectado: ${roomCode}`, 'success');
                QRScanner.stop();
                joinRoomByCode(roomCode);
            }
        }, 3000);
    }
};

// Initialize room system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    RoomManager.init();
});

// Export functions for global access
window.RoomManager = RoomManager;
window.QRScanner = QRScanner;


// Student Name Management
const StudentManager = {
    currentStudentName: null,
    
    // Show student name modal
    showNameModal: () => {
        const modal = document.getElementById('student-name-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Focus on input
            setTimeout(() => {
                const nameInput = document.getElementById('student-name-input');
                if (nameInput) nameInput.focus();
            }, 100);
        }
    },
    
    // Hide student name modal
    hideNameModal: () => {
        const modal = document.getElementById('student-name-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    // Confirm student name
    confirmName: (name) => {
        if (!name || name.trim().length < 2) {
            showToast('Por favor, digite um nome válido (mínimo 2 caracteres)', 'error');
            return false;
        }
        
        StudentManager.currentStudentName = name.trim();
        
        // Store in session
        sessionStorage.setItem('studentName', StudentManager.currentStudentName);
        
        // Update room with student info
        const room = JSON.parse(sessionStorage.getItem('currentRoom') || '{}');
        if (room.students) {
            // Update existing student or add new one
            const existingStudentIndex = room.students.findIndex(s => s.tempId === StudentManager.getTempId());
            if (existingStudentIndex >= 0) {
                room.students[existingStudentIndex].name = StudentManager.currentStudentName;
            } else {
                room.students.push({
                    name: StudentManager.currentStudentName,
                    tempId: StudentManager.getTempId(),
                    joinedAt: new Date(),
                    isPresent: false,
                    raisedHand: false
                });
            }
            sessionStorage.setItem('currentRoom', JSON.stringify(room));
        }
        
        StudentManager.hideNameModal();
        StudentManager.updateStudentUI();
        showToast(`Bem-vindo, ${StudentManager.currentStudentName}!`, 'success');
        
        return true;
    },
    
    // Get temporary student ID
    getTempId: () => {
        let tempId = sessionStorage.getItem('studentTempId');
        if (!tempId) {
            tempId = 'student_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('studentTempId', tempId);
        }
        return tempId;
    },
    
    // Update student UI with name
    updateStudentUI: () => {
        if (!StudentManager.currentStudentName) return;
        
        // Update room header with student info
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
                        <p>Participando da sala ${RoomState.roomCode}</p>
                    </div>
                </div>
            `;
            
            // Insert after room info
            const roomInfo = roomHeader.querySelector('.room-info');
            if (roomInfo) {
                roomInfo.parentNode.insertBefore(studentInfoDiv, roomInfo.nextSibling);
            }
        }
    },
    
    // Initialize student name system
    init: () => {
        // Check if student name is already stored
        const storedName = sessionStorage.getItem('studentName');
        if (storedName) {
            StudentManager.currentStudentName = storedName;
        }
    },
    
    // Get current student name
    getName: () => {
        return StudentManager.currentStudentName;
    },
    
    // Clear student data
    clear: () => {
        StudentManager.currentStudentName = null;
        sessionStorage.removeItem('studentName');
        sessionStorage.removeItem('studentTempId');
    }
};

// Update RoomManager to handle student names
const originalJoinRoom = RoomManager.joinRoom;
RoomManager.joinRoom = function(roomCode) {
    return originalJoinRoom(roomCode).then(room => {
        // After successfully joining room, show name modal for students
        setTimeout(() => {
            if (!StudentManager.currentStudentName) {
                StudentManager.showNameModal();
            } else {
                StudentManager.updateStudentUI();
            }
        }, 500);
        
        return room;
    });
};

// Update leave room to clear student data
const originalLeaveRoom = RoomManager.leaveRoom;
RoomManager.leaveRoom = function() {
    if (RoomState.isStudent) {
        StudentManager.clear();
    }
    return originalLeaveRoom();
};

// Initialize student manager
document.addEventListener('DOMContentLoaded', () => {
    StudentManager.init();
});

// Export for global access
window.StudentManager = StudentManager;

