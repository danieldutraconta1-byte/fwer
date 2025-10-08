// Global state management
const AppState = {
    currentPage: 'home',
    user: null
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    navigateTo('home');
});

// Initialize application
function initializeApp() {
    console.log('Inicializando Plataforma Educacional com Firebase...');

    setupEventListeners();
    initializeComponents();

    showLoading();
    setTimeout(hideLoading, 1000);
}

// Setup global event listeners
function setupEventListeners() {
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllModals();
            closeAllSections();
        }
    });

    document.addEventListener('submit', function (e) {
        e.preventDefault();
    });
}

// Initialize components
function initializeComponents() {
    console.log('Componentes inicializados');
}

// SPA Navigation System
function navigateTo(page) {
    const paginaAntiga = AppState.currentPage;

    const buttonSair = document.getElementById("sair");
    const spanText = buttonSair?.querySelector("span");
    const header = document.querySelector(".header");

    if (page == "home" && paginaAntiga != "home" && header?.classList.contains("expandido")) {
        exibirMenu();
    }

    if (page != "home") {
        if (header?.classList.contains('expandido')) {
            exibirMenu();
        }

        if (buttonSair) {
            if (page == "teacher-panel") {
                buttonSair.onclick = endRoom;
                if (spanText) spanText.textContent = "Desativar";
            } else {
                buttonSair.onclick = leaveRoom;
                if (spanText) spanText.textContent = "Sair";
            }
            buttonSair.style.display = "flex";
        }
    } else {
        if (buttonSair) buttonSair.style.display = "none";
    }

    console.log(`Navegando para: ${page}`);

    AppState.currentPage = page;
    history.pushState({ page }, '', `#${page}`);

    loadPageContent(page);
    updateNavigationState(page);
}

// Load page content dynamically
async function loadPageContent(page) {
    const mainContent = document.getElementById('main-content');

    try {
        showLoading();

        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await fetch(`pages/${page}.html`);

        if (!response.ok) {
            throw new Error(`Página não encontrada: ${page}`);
        }

        const content = await response.text();
        mainContent.innerHTML = content;

        initializePageFunctionality(page);

        hideLoading();

    } catch (error) {
        console.error('Erro ao carregar página:', error);
        mainContent.innerHTML = `
            <div class="error-page">
                <div class="container">
                    <div class="error-content">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h1>Página não encontrada</h1>
                        <p>A página que você está procurando não existe.</p>
                        <button class="btn btn-primary" onclick="navigateTo('home')">
                            <i class="fas fa-home"></i> Voltar ao Início
                        </button>
                    </div>
                </div>
            </div>
        `;
        hideLoading();
    }
}

// Initialize page-specific functionality
function initializePageFunctionality(page) {
    switch (page) {
        case 'student-room':
            initializeStudentRoom();
            break;
        case 'teacher-panel':
            initializeTeacherPanel();
            break;
        case 'home':
            initializeHomePage();
            break;
    }
}

// Initialize home page
function initializeHomePage() {
    console.log('Página inicial carregada');
}

// Initialize student room
function initializeStudentRoom() {
    console.log('Sala do aluno carregada');

    if (window.StudentQuizManager) {
        window.StudentQuizManager.listenForQuiz();
    }
}

// Initialize teacher panel
function initializeTeacherPanel() {
    console.log('Painel do professor carregado');

    if (window.RoomManager && (!window.RoomState || !window.RoomState.isTeacher)) {
        window.RoomManager.createRoom().then(roomCode => {
            if (window.showToast) {
                window.showToast(`Sala criada com código: ${roomCode}`, 'success');
            }
        }).catch(error => {
            console.error('Erro ao criar sala:', error);
            if (window.showToast) {
                window.showToast('Erro ao criar sala', 'error');
            }
        });
    } else if (window.RoomManager) {
        window.RoomManager.updateTeacherUI();
    }
}

// Update navigation state
function updateNavigationState(page) {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
    });
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function (e) {
    if (e.state && e.state.page) {
        loadPageContent(e.state.page);
    } else {
        navigateTo('home');
    }
});

// Loading functions
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Toast notification system
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'info': return 'fas fa-info-circle';
        default: return 'fas fa-check-circle';
    }
}

// Modal functions
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        modal.style.display = 'none';
    });
}

function closeAllSections() {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
}

// Student Access Functions
function showStudentAccess() {
    const heroSection = document.querySelector('.hero-section');
    const featuresSection = document.querySelector('.features-section');
    const studentAccessSection = document.getElementById('student-access-section');

    if (heroSection) heroSection.style.display = 'none';
    if (featuresSection) featuresSection.style.display = 'none';
    if (studentAccessSection) studentAccessSection.style.display = 'flex';
}

function hideStudentAccess() {
    const heroSection = document.querySelector('.hero-section');
    const featuresSection = document.querySelector('.features-section');
    const studentAccessSection = document.getElementById('student-access-section');
    const codeInputSection = document.getElementById('code-input-section');
    const qrScannerSection = document.getElementById('qr-scanner-section');

    if (heroSection) heroSection.style.display = 'block';
    if (featuresSection) featuresSection.style.display = 'block';
    if (studentAccessSection) studentAccessSection.style.display = 'none';
    if (codeInputSection) codeInputSection.style.display = 'none';
    if (qrScannerSection) qrScannerSection.style.display = 'none';
}

function showCodeInput() {
    const studentAccessSection = document.getElementById('student-access-section');
    const codeInputSection = document.getElementById('code-input-section');

    if (studentAccessSection) studentAccessSection.style.display = 'none';
    if (codeInputSection) codeInputSection.style.display = 'flex';

    setTimeout(() => {
        const codeInput = document.getElementById('room-code-input');
        if (codeInput) codeInput.focus();
    }, 100);
}

function showQRScanner() {
    const studentAccessSection = document.getElementById('student-access-section');
    const qrScannerSection = document.getElementById('qr-scanner-section');

    if (studentAccessSection) studentAccessSection.style.display = 'none';
    if (qrScannerSection) qrScannerSection.style.display = 'flex';
}

function backToStudentAccess() {
    const studentAccessSection = document.getElementById('student-access-section');
    const codeInputSection = document.getElementById('code-input-section');
    const qrScannerSection = document.getElementById('qr-scanner-section');

    if (studentAccessSection) studentAccessSection.style.display = 'flex';
    if (codeInputSection) codeInputSection.style.display = 'none';
    if (qrScannerSection) qrScannerSection.style.display = 'none';
}

function joinRoomByCode(roomCode = null) {
    if (!roomCode) {
        const codeInput = document.getElementById('room-code-input');
        roomCode = codeInput ? codeInput.value.trim() : '';
    }

    if (!roomCode || roomCode.length !== 6) {
        showToast('Por favor, digite um código de 6 dígitos', 'error');
        return;
    }

    showLoading();

    if (window.RoomManager) {
        window.RoomManager.joinRoom(roomCode)
            .then(room => {
                hideLoading();
                showToast(`Entrando na sala ${roomCode}...`, 'success');

                const codeInput = document.getElementById('room-code-input');
                if (codeInput) codeInput.value = '';

                navigateTo('student-room');
            })
            .catch(error => {
                hideLoading();
                showToast(error.message || 'Erro ao entrar na sala', 'error');
            });
    } else {
        hideLoading();
        showToast('Sistema não inicializado corretamente', 'error');
    }
}

// Teacher Panel Functions
function generateNewRoomCode() {
    if (confirm('Gerar um novo código irá desconectar todos os alunos. Continuar?')) {
        if (window.RoomManager) {
            window.RoomManager.createRoom().then(newCode => {
                showToast(`Novo código gerado: ${newCode}`, 'success');

                if (window.RoomState) {
                    window.RoomState.qrCodeGenerated = false;
                }

                const qrContainer = document.getElementById('qr-code-container');
                if (qrContainer) {
                    qrContainer.innerHTML = '';
                }
            });
        }
    }
}

function generateQRCode() {
    if (!window.RoomState || !window.RoomState.roomCode) {
        showToast('Nenhuma sala ativa', 'error');
        return;
    }

    closeAllSections();
    const section = document.getElementById('qr-code-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });

        if (window.RoomManager && !window.RoomState.qrCodeGenerated) {
            showLoading();

            window.RoomManager.generateQRCode()
                .then(() => {
                    hideLoading();
                    showToast('QR Code gerado com sucesso!', 'success');
                })
                .catch(error => {
                    hideLoading();
                    showToast(`Erro ao gerar QR Code: ${error}`, 'error');
                });
        }
    }
}

function downloadQRCode() {
    if (window.RoomManager) {
        window.RoomManager.downloadQRCode();
    }
}

function printQRCode() {
    if (window.RoomManager) {
        window.RoomManager.printQRCode();
    }
}

function openConnectedStudents() {
    closeAllSections();
    const section = document.getElementById('connected-students-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadConnectedStudents();
    }
}

function loadConnectedStudents() {
    const studentsList = document.getElementById('connected-students-list');
    if (!studentsList) return;

    studentsList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-users" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
            <p>Os alunos conectados aparecerão aqui em tempo real</p>
        </div>
    `;
}

function endRoom() {
    if (confirm('Tem certeza que deseja encerrar a sala? Todos os alunos serão desconectados.')) {
        if (window.RoomManager) {
            window.RoomManager.endRoom();
        }
    }
}

function leaveRoom() {
    if (confirm('Tem certeza que deseja sair da sala?')) {
        if (window.RoomManager) {
            window.RoomManager.leaveRoom();
        }
    }
}

function confirmStudentName() {
    const nameInput = document.getElementById('student-name-input');
    const name = nameInput ? nameInput.value.trim() : '';

    if (window.StudentManager) {
        if (window.StudentManager.confirmName(name)) {
            if (nameInput) nameInput.value = '';
        }
    }
}

// Handle Enter key in student name input
document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('student-name-input');
    if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmStudentName();
            }
        });
    }
});

function exibirMenu() {
    const header = document.querySelector('.header');
    const nav = document.querySelector('.nav');

    if (header && nav) {
        if (header.classList.contains('expandido')) {
            header.classList.remove('expandido');
            nav.style.display = 'none';
        } else {
            header.classList.add('expandido');
            nav.style.display = 'flex';
        }
    }
}

// Export global functions
window.navigateTo = navigateTo;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.closeAllModals = closeAllModals;
window.closeAllSections = closeAllSections;
window.showStudentAccess = showStudentAccess;
window.hideStudentAccess = hideStudentAccess;
window.showCodeInput = showCodeInput;
window.showQRScanner = showQRScanner;
window.backToStudentAccess = backToStudentAccess;
window.joinRoomByCode = joinRoomByCode;
window.generateNewRoomCode = generateNewRoomCode;
window.generateQRCode = generateQRCode;
window.downloadQRCode = downloadQRCode;
window.printQRCode = printQRCode;
window.openConnectedStudents = openConnectedStudents;
window.endRoom = endRoom;
window.leaveRoom = leaveRoom;
window.confirmStudentName = confirmStudentName;
window.exibirMenu = exibirMenu;
