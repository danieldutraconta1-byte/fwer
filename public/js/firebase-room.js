import { db, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp, query, where, getDocs } from './firebase-config.js';

const RoomState = {
    currentRoom: null,
    isTeacher: false,
    isStudent: false,
    roomCode: null,
    qrCodeGenerated: false,
    unsubscribers: []
};

const RoomManager = {
    generateRoomCode: () => {
        const digits = '0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += digits.charAt(Math.floor(Math.random() * digits.length));
        }
        return code;
    },

    createRoom: async () => {
        const roomCode = RoomManager.generateRoomCode();

        try {
            await setDoc(doc(db, 'salas', roomCode), {
                code: roomCode,
                teacher: 'Professor Atual',
                createdAt: serverTimestamp(),
                isActive: true,
                studentsCount: 0
            });

            RoomState.currentRoom = { code: roomCode };
            RoomState.isTeacher = true;
            RoomState.roomCode = roomCode;

            RoomManager.listenToStudents(roomCode);
            RoomManager.updateTeacherUI();

            console.log('Sala criada:', roomCode);
            return roomCode;
        } catch (error) {
            console.error('Erro ao criar sala:', error);
            throw error;
        }
    },

    joinRoom: async (roomCode) => {
        try {
            const roomDoc = await getDoc(doc(db, 'salas', roomCode));

            if (!roomDoc.exists() || !roomDoc.data().isActive) {
                throw new Error('Sala não encontrada ou inativa');
            }

            RoomState.currentRoom = roomDoc.data();
            RoomState.isStudent = true;
            RoomState.roomCode = roomCode;

            return roomDoc.data();
        } catch (error) {
            console.error('Erro ao entrar na sala:', error);
            throw error;
        }
    },

    listenToStudents: (roomCode) => {
        const q = query(collection(db, 'alunos'), where('roomCode', '==', roomCode));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const students = [];
            snapshot.forEach((doc) => {
                students.push({ id: doc.id, ...doc.data() });
            });

            const connectedCount = document.getElementById('connected-students');
            if (connectedCount) {
                connectedCount.textContent = students.length;
            }

            if (window.loadConnectedStudents) {
                window.loadConnectedStudents();
            }
        });

        RoomState.unsubscribers.push(unsubscribe);
    },

    updateTeacherUI: () => {
        const roomCodeElement = document.getElementById('teacher-room-code');
        if (roomCodeElement && RoomState.roomCode) {
            roomCodeElement.textContent = RoomState.roomCode;
        }
    },

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

            qrContainer.innerHTML = '';

            const qrData = JSON.stringify({
                type: 'room_access',
                roomCode: RoomState.roomCode,
                timestamp: Date.now()
            });

            if (typeof QRCode !== 'undefined') {
                QRCode.toCanvas(qrData, { width: 256, margin: 2 }, (error, canvas) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    qrContainer.appendChild(canvas);
                    RoomState.qrCodeGenerated = true;

                    const qrRoomCodeElement = document.getElementById('qr-room-code');
                    if (qrRoomCodeElement) {
                        qrRoomCodeElement.textContent = RoomState.roomCode;
                    }

                    resolve(canvas);
                });
            } else {
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

                const qrRoomCodeElement = document.getElementById('qr-room-code');
                if (qrRoomCodeElement) {
                    qrRoomCodeElement.textContent = RoomState.roomCode;
                }

                resolve(placeholder);
            }
        });
    },

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

    endRoom: async () => {
        if (RoomState.isTeacher && RoomState.roomCode) {
            try {
                await updateDoc(doc(db, 'salas', RoomState.roomCode), {
                    isActive: false
                });

                RoomState.unsubscribers.forEach(unsub => unsub());
                RoomState.unsubscribers = [];

                RoomState.currentRoom = null;
                RoomState.isTeacher = false;
                RoomState.roomCode = null;
                RoomState.qrCodeGenerated = false;

                if (window.showToast) {
                    window.showToast('Sala encerrada com sucesso', 'info');
                }
                if (window.navigateTo) {
                    window.navigateTo('home');
                }
            } catch (error) {
                console.error('Erro ao encerrar sala:', error);
            }
        }
    },

    leaveRoom: async () => {
        if (RoomState.isStudent && window.StudentManager) {
            await window.StudentManager.removeFromFirebase();
        }

        RoomState.unsubscribers.forEach(unsub => unsub());
        RoomState.unsubscribers = [];

        RoomState.isStudent = false;
        RoomState.currentRoom = null;
        RoomState.roomCode = null;

        if (window.navigateTo) {
            window.navigateTo('home');
        }
    }
};

window.RoomManager = RoomManager;
window.RoomState = RoomState;

export { RoomManager, RoomState };
