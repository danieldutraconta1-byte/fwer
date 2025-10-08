// Global state management
const AppState = {
    currentPage: 'home',
    user: null,
    classes: [],
    quizzes: [],
    materials: [],
    helpRequests: [],
    reports: [],
    attendanceRecords: []
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    loadMockData();
    navigateTo('home');
});

// Initialize application
function initializeApp() {
    console.log('Inicializando Plataforma Educacional...');

    // Set up event listeners
    setupEventListeners();

    // Initialize components
    initializeComponents();

    // Show loading overlay briefly
    showLoading();
    setTimeout(hideLoading, 1000);
}

// Setup global event listeners
function setupEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Handle escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeAllModals();
            closeAllSections();
        }
    });

    // Handle form submissions
    document.addEventListener('submit', function (e) {
        e.preventDefault();
    });
}

// Initialize components
function initializeComponents() {
    // Initialize any component-specific logic here
    console.log('Componentes inicializados');
}

// SPA Navigation System
function navigateTo(page) {
    const paginaAntiga = AppState.currentPage; 
    
    const buttonSair = document.getElementById("sair");
    const spanText = buttonSair.querySelector("span");
    const header = document.querySelector(".header");


    if(page == "home" && paginaAntiga != "home" && header.classList.contains("expandido")){
        exibirMenu();
    }
    if (page != "home") {
        if(header.classList.contains('expandido')){
            exibirMenu();
        }
        if (page == "teacher-panel") {
            buttonSair.onclick = endRoom;
            spanText.textContent = "Desativar";
        } else {
            buttonSair.onclick = leaveRoom;
            spanText.textContent = "Sair";
        }
        buttonSair.style.display = "flex";
    } else {
        buttonSair.style.display = "none";
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

        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await fetch(`pages/${page}.html`);

        if (!response.ok) {
            throw new Error(`Página não encontrada: ${page}`);
        }

        const content = await response.text();
        mainContent.innerHTML = content;

        // Initialize page-specific functionality
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
        case 'student-panel':
            initializeStudentPanel();
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

// Initialize student panel
function initializeStudentPanel() {
    console.log('Painel do aluno carregado');
    loadStudentClasses();
}

// Initialize teacher panel
function initializeTeacherPanel() {
    console.log('Painel do professor carregado');
    loadTeacherClasses();
    loadTeacherMaterials();
    loadHelpRequests();
    loadReports();
    loadAttendanceRecords();
}

// Update navigation state
function updateNavigationState(page) {
    // Update active navigation items if needed
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

    // Auto remove after 3 seconds
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

// Student Panel Functions
function openTaskSubmission() {
    closeAllSections();
    const section = document.getElementById('task-submission-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function openAttendanceCheck() {
    openCameraModal('attendance');
}

function openHelpForm() {
    closeAllSections();
    const section = document.getElementById('help-form-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function openSupportMaterials() {
    closeAllSections();
    const section = document.getElementById('support-materials-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function openReportForm() {
    closeAllSections();
    const section = document.getElementById('report-form-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function openQuizzes() {
    closeAllSections();
    const section = document.getElementById('quizzes-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function openMyClasses() {
    closeAllSections();
    const section = document.getElementById('my-classes-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadStudentClasses();
    }
}

// Teacher Panel Functions
function openManageClasses() {
    closeAllSections();
    const section = document.getElementById('manage-classes-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadTeacherClasses();
    }
}

function openTempLink() {
    closeAllSections();
    const section = document.getElementById('temp-link-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        populateClassSelects();
    }
}

function openMaterialUpload() {
    closeAllSections();
    const section = document.getElementById('material-upload-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        populateClassSelects();
        loadTeacherMaterials();
    }
}

function openAttendanceControl() {
    closeAllSections();
    const section = document.getElementById('attendance-control-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        populateClassSelects();
        loadAttendanceRecords();
    }
}

function openHelpRequests() {
    closeAllSections();
    const section = document.getElementById('help-requests-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadHelpRequests();
    }
}

function openReports() {
    closeAllSections();
    const section = document.getElementById('reports-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadReports();
    }
}

function openCreateQuiz() {
    closeAllSections();
    const section = document.getElementById('create-quiz-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        populateClassSelects();
    }
}

// Form submission functions
function submitTask() {
    const title = document.getElementById('task-title')?.value;
    const description = document.getElementById('task-description')?.value;
    const file = document.getElementById('task-file')?.files[0];

    if (!title || !description) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }

    // Simulate task submission
    showLoading();
    setTimeout(() => {
        hideLoading();
        showToast('Tarefa enviada com sucesso!');

        // Clear form
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-file').value = '';

        closeAllSections();
    }, 1500);
}

function submitHelp() {
    const subject = document.getElementById('help-subject')?.value;
    const description = document.getElementById('help-description')?.value;

    if (!subject || !description) {
        showToast('Por favor, preencha todos os campos', 'error');
        return;
    }

    // Simulate help submission
    showLoading();
    setTimeout(() => {
        hideLoading();
        showToast('Solicitação de ajuda enviada com sucesso!');

        // Clear form
        document.getElementById('help-subject').value = '';
        document.getElementById('help-description').value = '';

        closeAllSections();
    }, 1500);
}

function submitReport() {
    const type = document.getElementById('report-type')?.value;
    const description = document.getElementById('report-description')?.value;
    const anonymous = document.getElementById('report-anonymous')?.checked;

    if (!type || !description) {
        showToast('Por favor, preencha todos os campos', 'error');
        return;
    }

    // Simulate report submission
    showLoading();
    setTimeout(() => {
        hideLoading();
        showToast('Denúncia enviada com sucesso!');

        // Clear form
        document.getElementById('report-type').value = '';
        document.getElementById('report-description').value = '';
        document.getElementById('report-anonymous').checked = false;

        closeAllSections();
    }, 1500);
}

// Quiz functions
function startQuiz(quizId) {
    showToast(`Iniciando quiz: ${quizId}`, 'info');
    // Here you would implement the quiz interface
}

// Load mock data
async function loadMockData() {
    try {
        AppState.classes = await api.salas.getAll();
        AppState.quizzes = await api.quizzes.getAll();
        AppState.materials = await api.materiais.getAll();
        AppState.helpRequests = await api.maosLevantadas.getAll(); // Assumindo que helpRequests são mãos levantadas
        AppState.reports = []; // Não há tabela para reports, manter vazio ou criar uma
        AppState.attendanceRecords = await api.presencas.getAll();
        console.log("Dados carregados da API", AppState);
    } catch (error) {
        showToast("Erro ao carregar dados iniciais: " + error.message, "error");
        console.error("Erro ao carregar dados iniciais:", error);
    }
}

window.submitTask = submitTask;
window.submitHelp = submitHelp;
window.submitReport = submitReport;
window.startQuiz = startQuiz;

// Teacher panel functions
window.openManageClasses = openManageClasses;
window.openTempLink = openTempLin
window.openMaterialUpload = openMaterialUpload;
window.openAttendanceControl = openAttendanceControl;
window.openHelpRequests = openHelpRequests;
window.openReports = openReports;
window.openCreateQuiz = openCreateQuiz;



// Additional Panel Functions

// Class Management Functions
function openCreateClassModal() {
    const modalContent = `
        <div class="form-group">
            <label>Nome da Turma</label>
            <input type="text" id="new-class-name" placeholder="Digite o nome da turma">
        </div>
        <div class="form-group">
            <label>Disciplina</label>
            <input type="text" id="new-class-subject" placeholder="Digite a disciplina">
        </div>
        <div class="form-group">
            <label>Horário</label>
            <input type="text" id="new-class-schedule" placeholder="Ex: Seg/Qua/Sex 08:00-09:30">
        </div>
        <div class="form-group">
            <label>Máximo de Alunos</label>
            <input type="number" id="new-class-max-students" value="30" min="1">
        </div>
    `;

    const saveBtn = DOM.create('button', {
        className: 'btn btn-primary',
        onclick: 'createClass()'
    }, 'Criar Turma');

    const cancelBtn = DOM.create('button', {
        className: 'btn btn-secondary',
        onclick: "closeModal('create-class-modal')"
    }, 'Cancelar');

    const modal = createModal('create-class-modal', 'Criar Nova Turma', modalContent, [cancelBtn, saveBtn]);

    // Add modal to container
    const modalContainer = DOM.get('modal-container');
    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);

    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function createClass() {
    const name = DOM.get('new-class-name')?.value;
    const subject = DOM.get('new-class-subject')?.value;
    const schedule = DOM.get('new-class-schedule')?.value;
    const maxStudents = DOM.get('new-class-max-students')?.value;

    if (!name || !subject || !schedule) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }

    showLoading();

    setTimeout(() => {
        const newClass = {
            id: Date.now(),
            name: name,
            subject: subject,
            teacher: 'Prof. Atual',
            students: 0,
            schedule: schedule,
            code: StringUtils.generateClassCode(),
            maxStudents: parseInt(maxStudents) || 30
        };

        AppState.classes.push(newClass);

        hideLoading();
        showToast('Turma criada com sucesso!', 'success');
        closeModal('create-class-modal');
        loadTeacherClasses();
        populateClassSelects();
    }, 1500);
}

function openJoinClassModal() {
    const modalContent = `
        <div class="form-group">
            <label>Código da Turma</label>
            <input type="text" id="join-class-code" placeholder="Digite o código da turma (ex: MAT001)" maxlength="6">
        </div>
        <p class="text-sm text-gray-600">
            Solicite o código da turma ao seu professor ou use o QR Code fornecido.
        </p>
    `;

    const joinBtn = DOM.create('button', {
        className: 'btn btn-primary',
        onclick: 'joinClass()'
    }, 'Entrar na Turma');

    const cancelBtn = DOM.create('button', {
        className: 'btn btn-secondary',
        onclick: "closeModal('join-class-modal')"
    }, 'Cancelar');

    const modal = createModal('join-class-modal', 'Entrar em Turma', modalContent, [cancelBtn, joinBtn]);

    // Add modal to container
    const modalContainer = DOM.get('modal-container');
    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);

    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
}

function joinClass() {
    const code = DOM.get('join-class-code')?.value?.toUpperCase();

    if (!code) {
        showToast('Por favor, digite o código da turma', 'error');
        return;
    }

    if (!Validator.isValidClassCode(code)) {
        showToast('Código inválido. Use o formato ABC123', 'error');
        return;
    }

    showLoading();

    setTimeout(() => {
        // Simulate class validation
        const classExists = AppState.classes.find(c => c.code === code);

        if (!classExists) {
            hideLoading();
            showToast('Turma não encontrada. Verifique o código e tente novamente.', 'error');
            return;
        }

        if (classExists.students >= classExists.maxStudents) {
            hideLoading();
            showToast('Turma lotada. Não é possível entrar nesta turma.', 'warning');
            return;
        }

        // Add student to class
        classExists.students += 1;

        hideLoading();
        showToast(`Você entrou na turma ${classExists.name}!`, 'success');
        closeModal('join-class-modal');
        loadStudentClasses();
    }, 2000);
}

function leaveClass(classId) {
    if (confirm('Tem certeza que deseja sair desta turma?')) {
        const classData = AppState.classes.find(c => c.id === classId);
        if (classData && classData.students > 0) {
            classData.students -= 1;
        }

        showToast('Você saiu da turma', 'info');
        loadStudentClasses();
    }
}

function editClass(classId) {
    showToast('Funcionalidade de edição em desenvolvimento', 'info');
}

function deleteClass(classId) {
    if (confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) {
        AppState.classes = AppState.classes.filter(c => c.id !== classId);
        showToast('Turma excluída com sucesso', 'success');
        loadTeacherClasses();
        populateClassSelects();
    }
}

// Temporary Link Generation
function generateTempLink() {
    const classId = DOM.get('temp-link-class')?.value;
    const expiryHours = DOM.get('temp-link-expiry')?.value;

    if (!classId) {
        showToast('Por favor, selecione uma turma', 'error');
        return;
    }

    const classData = AppState.classes.find(c => c.id == classId);
    if (!classData) {
        showToast('Turma não encontrada', 'error');
        return;
    }

    showLoading();

    setTimeout(() => {
        const linkId = StringUtils.generateRandomString(12);
        const baseURL = window.location.origin + window.location.pathname;
        const tempLink = `${baseURL}#join/${classData.code}/${linkId}`;

        const expiryDate = DateUtils.addHours(new Date(), parseInt(expiryHours));

        // Show result
        const resultSection = DOM.get('temp-link-result');
        const linkInput = DOM.get('generated-link');
        const expirySpan = DOM.get('link-expiry-time');

        if (resultSection && linkInput && expirySpan) {
            linkInput.value = tempLin
            expirySpan.textContent = DateUtils.formatDateTime(expiryDate);
            resultSection.style.display = 'block';
        }

        hideLoading();
        showToast('Link temporário gerado com sucesso!', 'success');

        // Auto copy to clipboard
        copyToClipboard('generated-link');

    }, 1500);
}

// Material Upload
function uploadMaterial() {
    const title = DOM.get('material-title')?.value;
    const description = DOM.get('material-description')?.value;
    const classId = DOM.get('material-class')?.value;
    const file = DOM.get('material-file')?.files[0];

    if (!title || !description || !classId) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }

    showLoading();

    setTimeout(() => {
        const newMaterial = {
            id: Date.now(),
            title: title,
            description: description,
            classId: parseInt(classId),
            type: file ? FileUtils.getExtension(file.name) : 'link',
            uploadDate: DateUtils.getCurrentDate(),
            fileName: file ? file.name : null,
            fileSize: file ? FileUtils.formatSize(file.size) : null
        };

        AppState.materials.push(newMaterial);

        // Clear form
        DOM.get('material-title').value = '';
        DOM.get('material-description').value = '';
        DOM.get('material-class').value = '';
        DOM.get('material-file').value = '';

        hideLoading();
        showToast('Material enviado com sucesso!', 'success');
        loadTeacherMaterials();
    }, 2000);
}

function downloadMaterial(materialId) {
    const material = AppState.materials.find(m => m.id === materialId);
    if (material) {
        showToast(`Baixando: ${material.title}`, 'info');
        // Simulate download
    }
}

// Quiz Creation
let questionCount = 1;

function addQuestion() {
    questionCount++;
    const questionsContainer = DOM.get('quiz-questions');
    const newQuestion = createQuestionComponent(questionCount);
    questionsContainer.appendChild(newQuestion);

    showToast(`Pergunta ${questionCount} adicionada`, 'success');
}

function removeQuestion(questionNumber) {
    const questionItems = DOM.queryAll('.question-item');
    if (questionItems.length > 1) {
        questionItems[questionNumber - 1].remove();
        showToast(`Pergunta ${questionNumber} removida`, 'info');
    } else {
        showToast('Deve haver pelo menos uma pergunta', 'warning');
    }
}

function createQuiz() {
    const title = DOM.get('quiz-title')?.value;
    const description = DOM.get('quiz-description')?.value;
    const classId = DOM.get('quiz-class')?.value;
    const timeLimit = DOM.get('quiz-time-limit')?.value;

    if (!title || !description || !classId) {
        showToast('Por favor, preencha todos os campos obrigatórios', 'error');
        return;
    }

    const questions = [];
    const questionItems = DOM.queryAll('.question-item');

    questionItems.forEach((item, index) => {
        const questionText = item.querySelector('.question-text')?.value;
        const options = Array.from(item.querySelectorAll('.option')).map(opt => opt.value);
        const correctAnswer = item.querySelector('.correct-answer')?.value;

        if (questionText && options.every(opt => opt.trim())) {
            questions.push({
                question: questionText,
                options: options,
                correctAnswer: parseInt(correctAnswer)
            });
        }
    });

    if (questions.length === 0) {
        showToast('Adicione pelo menos uma pergunta completa', 'error');
        return;
    }

    showLoading();

    setTimeout(() => {
        const newQuiz = {
            id: StringUtils.generateRandomString(8),
            title: title,
            description: description,
            classId: parseInt(classId),
            timeLimit: parseInt(timeLimit),
            questions: questions,
            createdDate: DateUtils.getCurrentDate()
        };

        AppState.quizzes.push(newQuiz);

        // Clear form
        DOM.get('quiz-title').value = '';
        DOM.get('quiz-description').value = '';
        DOM.get('quiz-class').value = '';
        DOM.get('quiz-time-limit').value = '15';

        // Reset questions
        const questionsContainer = DOM.get('quiz-questions');
        questionsContainer.innerHTML = '<h3>Perguntas</h3>';
        questionCount = 1;
        addQuestion();

        hideLoading();
        showToast('Quiz criado com sucesso!', 'success');
    }, 2000);
}

// Help and Report Management
function replyToHelp(requestId) {
    showToast('Abrindo sistema de resposta...', 'info');
    // Here you would implement a reply interface
}

function resolveHelp(requestId) {
    if (confirm('Marcar esta solicitação como resolvida?')) {
        AppState.helpRequests = AppState.helpRequests.filter(r => r.id !== requestId);
        showToast('Solicitação marcada como resolvida', 'success');
        loadHelpRequests();
    }
}

function investigateReport(reportId) {
    const report = AppState.reports.find(r => r.id === reportId);
    if (report) {
        report.status = 'investigating';
        showToast('Denúncia marcada como em investigação', 'info');
        loadReports();
    }
}

function resolveReport(reportId) {
    if (confirm('Marcar esta denúncia como resolvida?')) {
        AppState.reports = AppState.reports.filter(r => r.id !== reportId);
        showToast('Denúncia marcada como resolvida', 'success');
        loadReports();
    }
}

// Export new functions
window.openCreateClassModal = openCreateClassModal;
window.createClass = createClass;
window.openJoinClassModal = openJoinClassModal;
window.joinClass = joinClass;
window.leaveClass = leaveClass;
window.editClass = editClass;
window.deleteClass = deleteClass;
window.generateTempLink = generateTempLin
window.uploadMaterial = uploadMaterial;
window.downloadMaterial = downloadMaterial;
window.addQuestion = addQuestion;
window.removeQuestion = removeQuestion;
window.createQuiz = createQuiz;
window.replyToHelp = replyToHelp;
window.resolveHelp = resolveHelp;
window.investigateReport = investigateReport;
window.resolveReport = resolveReport;


// New Room System Functions

// Student Access Functions
function showStudentAccess() {
    // Hide hero section and show student access
    const heroSection = document.querySelector('.hero-section');
    const featuresSection = document.querySelector('.features-section');
    const studentAccessSection = document.getElementById('student-access-section');

    if (heroSection) heroSection.style.display = 'none';
    if (featuresSection) featuresSection.style.display = 'none';
    if (studentAccessSection) studentAccessSection.style.display = 'flex';
}

function hideStudentAccess() {
    // Show hero section and hide student access
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

    // Stop QR scanner if active
    if (QRScanner.isScanning) {
        QRScanner.stop();
    }
}

function showCodeInput() {
    const studentAccessSection = document.getElementById('student-access-section');
    const codeInputSection = document.getElementById('code-input-section');

    if (studentAccessSection) studentAccessSection.style.display = 'none';
    if (codeInputSection) codeInputSection.style.display = 'flex';

    // Focus on input
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

    // Stop QR scanner if active
    if (QRScanner.isScanning) {
        QRScanner.stop();
    }
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

    RoomManager.joinRoom(roomCode)
        .then(room => {
            hideLoading();
            showToast(`Entrando na sala ${roomCode}...`, 'success');

            // Clear input
            const codeInput = document.getElementById('room-code-input');
            if (codeInput) codeInput.value = '';

            // Navigate to student room
            navigateTo('student-room');
        })
        .catch(error => {
            hideLoading();
            showToast(error, 'error');
        });
}

// QR Scanner Functions
function startQRScanner() {
    showLoading();

    QRScanner.start()
        .then(() => {
            hideLoading();
            showToast('Câmera iniciada. Posicione o QR Code na área de escaneamento', 'info');

            // Simulate QR detection for demo (in real app, would use actual QR detection)
            if (RoomState.roomCode) {
                QRScanner.simulateDetection(RoomState.roomCode);
            }
        })
        .catch(error => {
            hideLoading();
            showToast(error, 'error');
        });
}

// Teacher Panel Functions
function initializeTeacherPanel() {
    console.log('Painel do professor carregado');

    // Create room automatically when teacher panel loads
    if (!RoomState.isTeacher && !RoomState.currentRoom) {
        const roomCode = RoomManager.createRoom();
        showToast(`Sala criada com código: ${roomCode}`, 'success');
    } else if (RoomState.isTeacher) {
        RoomManager.updateTeacherUI();
    }
}

function generateNewRoomCode() {
    if (confirm('Gerar um novo código irá desconectar todos os alunos. Continuar?')) {
        const newCode = RoomManager.createRoom();
        showToast(`Novo código gerado: ${newCode}`, 'success');

        // Reset QR code
        RoomState.qrCodeGenerated = false;
        const qrContainer = document.getElementById('qr-code-container');
        if (qrContainer) {
            qrContainer.innerHTML = '';
        }
    }
}

function generateQRCode() {
    if (!RoomState.roomCode) {
        showToast('Nenhuma sala ativa', 'error');
        return;
    }

    closeAllSections();
    const section = document.getElementById('qr-code-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });

        if (!RoomState.qrCodeGenerated) {
            showLoading();

            RoomManager.generateQRCode()
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
    RoomManager.downloadQRCode();
}

function printQRCode() {
    RoomManager.printQRCode();
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

function openActivities() {
    closeAllSections();
    const section = document.getElementById('activities-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadActivities();
    }
}

function openStudentQuestions() {
    closeAllSections();
    const section = document.getElementById('student-questions-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        loadStudentQuestions();
    }
}

function endRoom() {
    if (confirm('Tem certeza que deseja encerrar a sala? Todos os alunos serão desconectados.')) {
        RoomManager.endRoom();
    }
}

// Student Room Functions
function leaveRoom() {
    if (confirm('Tem certeza que deseja sair da sala?')) {
        RoomManager.leaveRoom();
    }
}

function markAttendance() {
    showToast('Abrindo câmera para marcar presença...', 'info');
    openCameraModal('attendance');
}

function raiseHand() {
    
    showToast('Mão levantada! O professor foi notificado.', 'success');
}

function askQuestion() {
    const question = prompt('Digite sua pergunta:');
    if (question && question.trim()) {
        showToast('Pergunta enviada ao professor!', 'success');
    }
}

function viewActivities() {
    showToast('Carregando atividades disponíveis...', 'info');
}

function toggleChat() {
    const chatElement = document.getElementById('room-chat');
    if (chatElement) {
        chatElement.style.display = chatElement.style.display === 'none' ? 'block' : 'none';
    }
}

function sendMessage() {
    const messageInput = document.getElementById('chat-message-input');
    if (messageInput && messageInput.value.trim()) {
        showToast('Mensagem enviada!', 'success');
        messageInput.value = '';
    }
}

// Load Functions for Teacher Panel
function loadConnectedStudents() {
    const studentsList = document.getElementById('connected-students-list');
    if (!studentsList) return;

    const students = RoomState.currentRoom ? RoomState.currentRoom.students : [];

    if (students.length === 0) {
        studentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <p>Nenhum aluno conectado ainda</p>
            </div>
        `;
        return;
    }

    studentsList.innerHTML = students.map(student => `
        <div class="student-item">
            <div class="student-info">
                <i class="fas fa-user-circle"></i>
                <span class="student-name">${student.name}</span>
                <span class="join-time">Entrou às ${new Date(student.joinedAt).toLocaleTimeString()}</span>
            </div>
            <div class="student-status">
                <span class="status-badge ${student.isPresent ? 'present' : 'absent'}">
                    ${student.isPresent ? 'Presente' : 'Ausente'}
                </span>
            </div>
        </div>
    `).join('');
}

function loadActivities() {
    const activitiesList = document.getElementById('activities-list');
    if (!activitiesList) return;

    activitiesList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-tasks" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
            <p>Nenhuma atividade criada ainda</p>
            <button class="btn btn-primary" onclick="createActivity()">
                <i class="fas fa-plus"></i> Criar Primeira Atividade
            </button>
        </div>
    `;
}

function loadStudentQuestions() {
    const questionsList = document.getElementById('student-questions-list');
    if (!questionsList) return;

    questionsList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-question-circle" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
            <p>Nenhuma pergunta recebida ainda</p>
        </div>
    `;
}

function createActivity() {
    showToast('Funcionalidade de criação de atividades em desenvolvimento', 'info');
}

// Update navigation to handle new pages
const originalNavigateTo = navigateTo;
navigateTo = function (page) {
    // Handle special navigation cases
    if (page === 'student-room') {
        if (!RoomState.isStudent || !RoomState.currentRoom) {
            showToast('Você precisa entrar em uma sala primeiro', 'error');
            navigateTo('home');
            return;
        }
    }

    // Call original navigation function
    originalNavigateTo(page);
};

// Export new functions for global access
window.showStudentAccess = showStudentAccess;
window.hideStudentAccess = hideStudentAccess;
window.showCodeInput = showCodeInput;
window.showQRScanner = showQRScanner;
window.backToStudentAccess = backToStudentAccess;
window.joinRoomByCode = joinRoomByCode;
window.startQRScanner = startQRScanner;
window.generateNewRoomCode = generateNewRoomCode;
window.generateQRCode = generateQRCode;
window.downloadQRCode = downloadQRCode;
window.printQRCode = printQRCode;
window.openConnectedStudents = openConnectedStudents;
window.openActivities = openActivities;
window.openStudentQuestions = openStudentQuestions;
window.endRoom = endRoom;
window.leaveRoom = leaveRoom;
window.markAttendance = markAttendance;
window.raiseHand = raiseHand;
window.askQuestion = askQuestion;
window.viewActivities = viewActivities;
window.toggleChat = toggleChat;
window.sendMessage = sendMessage;
window.createActivity = createActivity;


// Student Name Functions
function confirmStudentName() {
    const nameInput = document.getElementById('student-name-input');
    const name = nameInput ? nameInput.value.trim() : '';

    if (StudentManager.confirmName(name)) {
        // Clear input
        if (nameInput) nameInput.value = '';
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

// Export function for global access
window.confirmStudentName = confirmStudentName;


// Quiz Functions

// Teacher Quiz Functions
function openQuizManagement() {
    closeAllSections();
    const section = document.getElementById('quiz-management-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        QuizManager.updateTeacherQuizUI();
    }
}

function createQuizFromForm() {
    const title = document.getElementById('quiz-title')?.value.trim();
    const question = document.getElementById('quiz-question')?.value.trim();

    if (!title || !question) {
        showToast('Por favor, preencha o título e a pergunta', 'error');
        return;
    }

    const options = [];
    for (let i = 0; i < 4; i++) {
        const option = document.getElementById(`option-${i}`)?.value.trim();
        if (!option) {
            showToast(`Por favor, preencha a opção ${String.fromCharCode(65 + i)}`, 'error');
            return;
        }
        options.push(option);
    }

    const correctAnswer = document.querySelector('input[name="correct-answer"]:checked')?.value;
    if (correctAnswer === undefined) {
        showToast('Por favor, selecione a resposta correta', 'error');
        return;
    }

    const quizData = {
        title: title,
        question: question,
        options: options,
        correctAnswer: parseInt(correctAnswer)
    };

    QuizManager.createQuiz(quizData);

    // Clear form
    document.getElementById('quiz-form')?.reset();
}

function endCurrentQuiz() {
    if (confirm('Tem certeza que deseja encerrar o quiz atual?')) {
        QuizManager.endQuiz();
    }
}

function sairAtividade(){
        const modal = document.getElementById('create-activity-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.add('active');
            // Focar no título
            setTimeout(() => {
                const titleInput = document.getElementById('activity-title');
                if (titleInput) titleInput.focus();
            }, 100);
        }
    }

function viewQuizResults() {
    const results = QuizManager.getResults();
    if (!results) {
        showToast('Nenhum resultado disponível', 'error');
        return;
    }

    const section = document.getElementById('quiz-management-section');
    const content = section?.querySelector('.section-content');
    if (!content) return;

    content.innerHTML = `
        <div class="quiz-results">
            <div class="results-header">
                <h3>Resultados do Quiz: ${results.quiz.title}</h3>
                <button class="btn btn-secondary" onclick="QuizManager.updateTeacherQuizUI()">
                    <i class="fas fa-arrow-left"></i> Voltar
                </button>
            </div>
            
            <div class="results-summary">
                <div class="summary-card total">
                    <div class="summary-number total">${results.totalStudents}</div>
                    <div class="summary-label">Total de Respostas</div>
                </div>
                <div class="summary-card correct">
                    <div class="summary-number correct">${results.correctAnswers}</div>
                    <div class="summary-label">Respostas Corretas</div>
                </div>
                <div class="summary-card incorrect">
                    <div class="summary-number incorrect">${results.incorrectAnswers}</div>
                    <div class="summary-label">Respostas Incorretas</div>
                </div>
            </div>
            
            <div class="quiz-question">
                <strong>Pergunta:</strong> ${results.quiz.question}
            </div>
            
            <div class="quiz-options">
                ${results.quiz.options.map((option, index) => `
                    <div class="quiz-option-display ${index === results.quiz.correctAnswer ? 'correct-option' : ''}">
                        ${String.fromCharCode(65 + index)}) ${option}
                        ${index === results.quiz.correctAnswer ? '<i class="fas fa-check correct-icon"></i>' : ''}
                    </div>
                `).join('')}
            </div>
            
            ${results.responses.length > 0 ? `
                <div class="responses-list">
                    <h4>Respostas dos Alunos:</h4>
                    ${results.responses.map(response => `
                        <div class="response-item ${response.isCorrect ? 'correct' : 'incorrect'}">
                            <div class="response-student">${response.studentName}</div>
                            <div class="response-answer">
                                <span>${String.fromCharCode(65 + response.selectedOption)}) ${results.quiz.options[response.selectedOption]}</span>
                                <i class="fas ${response.isCorrect ? 'fa-check' : 'fa-times'} response-icon ${response.isCorrect ? 'correct' : 'incorrect'}"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>Nenhuma resposta recebida ainda.</p>'}
        </div>
    `;
}

// Student Quiz Functions
function selectQuizOption(optionIndex) {
    // Clear previous selections
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Select current option
    const selectedOption = document.querySelector(`.quiz-option:nth-child(${optionIndex + 1})`);
    if (selectedOption) {
        selectedOption.classList.add('selected');

        // Check the radio button
        const radio = selectedOption.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
        }
    }
}

function submitQuizAnswer() {
    const selectedRadio = document.querySelector('input[name="quiz-answer"]:checked');
    if (!selectedRadio) {
        showToast('Por favor, selecione uma resposta', 'error');
        return;
    }

    const selectedOption = parseInt(selectedRadio.value);
    StudentQuizManager.submitAnswer(selectedOption);
}

// Initialize quiz system when teacher panel loads
const originalInitializeTeacherPanel = initializeTeacherPanel;
initializeTeacherPanel = function () {
    originalInitializeTeacherPanel();

    // Initialize quiz UI
    setTimeout(() => {
        if (RoomState.isTeacher) {
            QuizManager.updateTeacherQuizUI();
        }
    }, 100);
};

// Export quiz functions for global access
window.openQuizManagement = openQuizManagement;
window.createQuizFromForm = createQuizFromForm;
window.endCurrentQuiz = endCurrentQuiz;
window.viewQuizResults = viewQuizResults;
window.selectQuizOption = selectQuizOption;
window.submitQuizAnswer = submitQuizAnswer;


// Hand Raise Functions

// Student function to raise/lower hand
function raiseHand() {
    const studentName = StudentManager.getName();
    if (!studentName) {
        showToast('Por favor, digite seu nome primeiro', 'error');
        return;
    }

    const icone = document.querySelector("#iconeMao i")
    if (icone.classList.contains("fa-hand-paper")) {
        icone.classList.remove("fa-hand-paper");
        icone.classList.add("fa-hand-fist");
    } else {
        icone.classList.remove("fa-hand-fist");
        icone.classList.add("fa-hand-paper");
    }

    HandRaiseManager.raiseHand(studentName);
}

// Teacher function to open raised hands section
function openRaisedHands() {
    closeAllSections();
    const section = document.getElementById('raised-hands-section');
    if (section) {
        section.style.display = 'block';
        section.scrollIntoView({ behavior: 'smooth' });
        HandRaiseManager.updateTeacherHandsDisplay();
    }
}

// Teacher function to acknowledge a specific hand
function acknowledgeHand(studentId) {
    HandRaiseManager.acknowledgeHand(studentId);
}

// Export hand raise functions for global access
window.raiseHand = raiseHand;
window.openRaisedHands = openRaisedHands;
window.acknowledgeHand = acknowledgeHand;


// Materials Functions

// Teacher Materials Functions
function openMaterialsManagement() {
    closeAllSections();
    const section = document.getElementById('materials-management-section');
    if (section) {
        section.style.display = 'flex';
        section.style.flexDirection = 'column';  
        section.style.justifyContent = 'space-between';  
        section.style.alignItems = 'center';  
        section.scrollIntoView({ behavior: 'smooth' });
        MaterialsManager.updateTeacherMaterialsUI();
    }
}

function showAddMaterialForm() {
    MaterialsManager.showAddMaterialForm();
}

function addMaterialFromForm() {
    const title = document.getElementById('material-title')?.value.trim();
    const description = document.getElementById('material-description')?.value.trim();
    const materialType = document.querySelector('input[name="material-type"]:checked')?.value;

    if (!title) {
        showToast('Por favor, digite o título do material', 'error');
        return;
    }

    if (!materialType) {
        showToast('Por favor, selecione o tipo de material', 'error');
        return;
    }

    let materialData = {
        title: title,
        description: description,
        type: materialType
    };

    if (materialType === 'link') {
        const url = document.getElementById('material-url')?.value.trim();
        if (!url) {
            showToast('Por favor, digite a URL do material', 'error');
            return;
        }

        // Validate URL
        try {
            new URL(url);
            materialData.url = url;
        } catch (e) {
            showToast('Por favor, digite uma URL válida', 'error');
            return;
        }
    } else if (materialType === 'file') {
        const fileInput = document.getElementById('material-file');
        const file = fileInput?.files[0];

        if (!file) {
            showToast('Por favor, selecione um arquivo', 'error');
            return;
        }

        // For demo purposes, we'll create a fake URL
        // In a real application, you would upload the file to a server
        materialData.url = URL.createObjectURL(file);
        materialData.fileName = file.name;
        materialData.fileSize = formatFileSize(file.size);
    }

    MaterialsManager.addMaterial(materialData);

    // Clear form
    document.getElementById('material-form')?.reset();
}

function removeMaterial(materialId) {
    if (confirm('Tem certeza que deseja remover este material?')) {
        MaterialsManager.removeMaterial(materialId);
    }
}

function previewMaterial(materialId) {
    const material = MaterialsState.materials.find(m => m.id === materialId);
    if (!material) return;

    if (material.type === 'link') {
        window.open(material.url, '_blank');
    } else {
        // For files, open in new tab
        window.open(material.url, '_blank');
    }
}

// Student Materials Functions
function openStudentMaterials() {
    const modal = document.getElementById('student-materials-modal');
    if (modal) {
        modal.style.display = 'flex';
        MaterialsManager.updateStudentMaterialsUI();
    }
}

function closeStudentMaterials() {
    const modal = document.getElementById('student-materials-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function accessMaterial(materialId) {
    const material = MaterialsState.materials.find(m => m.id === materialId);
    if (!material) return;

    // Open material in new tab
    window.open(material.url, '_blank');

    showToast(`Acessando: ${material.title}`, 'info');
}

// Utility function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export materials functions for global access
window.openMaterialsManagement = openMaterialsManagement;
window.showAddMaterialForm = showAddMaterialForm;
window.addMaterialFromForm = addMaterialFromForm;
window.removeMaterial = removeMaterial;
window.previewMaterial = previewMaterial;
window.openStudentMaterials = openStudentMaterials;
window.closeStudentMaterials = closeStudentMaterials;
window.accessMaterial = accessMaterial;
window.formatFileSize = formatFileSize;

