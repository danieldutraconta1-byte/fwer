// Dynamic Components for Educational Platform
// Functions to generate cards, modals, lists and other UI components

// Class Card Component
function createClassCard(classData, userType = 'student') {
    const card = DOM.create('div', { className: 'class-card' });
    
    const header = DOM.create('div', { className: 'class-header' });
    
    const titleContainer = DOM.create('div');
    const title = DOM.create('h4', { className: 'class-title' }, classData.name);
    const subject = DOM.create('div', { className: 'class-subject' }, classData.subject);
    titleContainer.appendChild(title);
    titleContainer.appendChild(subject);
    
    const menu = DOM.create('div', { className: 'class-menu' });
    const menuBtn = DOM.create('button', { 
        className: 'menu-btn',
        onclick: `toggleClassMenu(${classData.id})`
    });
    menuBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
    
    const dropdown = DOM.create('div', { 
        className: 'menu-dropdown',
        id: `class-menu-${classData.id}`
    });
    
    if (userType === 'student') {
        const leaveItem = DOM.create('button', { 
            className: 'menu-item danger',
            onclick: `leaveClass(${classData.id})`
        }, 'Sair da turma');
        dropdown.appendChild(leaveItem);
    } else {
        const editItem = DOM.create('button', { 
            className: 'menu-item',
            onclick: `editClass(${classData.id})`
        }, 'Editar turma');
        const deleteItem = DOM.create('button', { 
            className: 'menu-item danger',
            onclick: `deleteClass(${classData.id})`
        }, 'Excluir turma');
        dropdown.appendChild(editItem);
        dropdown.appendChild(deleteItem);
    }
    
    menu.appendChild(menuBtn);
    menu.appendChild(dropdown);
    
    header.appendChild(titleContainer);
    header.appendChild(menu);
    
    const details = DOM.create('div', { className: 'class-details' });
    
    const teacherDetail = DOM.create('div', { className: 'class-detail' });
    teacherDetail.innerHTML = `<i class="fas fa-user"></i> ${classData.teacher}`;
    
    const studentsDetail = DOM.create('div', { className: 'class-detail' });
    studentsDetail.innerHTML = `<i class="fas fa-users"></i> ${classData.students} alunos`;
    
    const scheduleDetail = DOM.create('div', { className: 'class-detail' });
    scheduleDetail.innerHTML = `<i class="fas fa-clock"></i> ${classData.schedule}`;
    
    const codeDetail = DOM.create('div', { className: 'class-detail' });
    codeDetail.innerHTML = `<i class="fas fa-key"></i> Código: ${classData.code}`;
    
    details.appendChild(teacherDetail);
    details.appendChild(studentsDetail);
    details.appendChild(scheduleDetail);
    details.appendChild(codeDetail);
    
    card.appendChild(header);
    card.appendChild(details);
    
    return card;
}

// Material Item Component
function createMaterialItem(material) {
    const item = DOM.create('div', { className: 'material-item' });
    
    const icon = getFileIcon(material.type);
    const iconElement = DOM.create('i', { className: icon });
    
    const title = DOM.create('span', {}, material.title);
    
    const button = DOM.create('button', { 
        className: 'btn btn-small',
        onclick: `downloadMaterial(${material.id})`
    }, 'Download');
    
    item.appendChild(iconElement);
    item.appendChild(title);
    item.appendChild(button);
    
    return item;
}

// Quiz Item Component
function createQuizItem(quiz) {
    const item = DOM.create('div', { className: 'quiz-item' });
    
    const info = DOM.create('div', { className: 'quiz-info' });
    const title = DOM.create('h4', {}, quiz.title);
    const details = DOM.create('p', {}, `${quiz.questions} questões • ${quiz.timeLimit} minutos • ${quiz.teacher}`);
    
    info.appendChild(title);
    info.appendChild(details);
    
    const button = DOM.create('button', { 
        className: 'btn btn-primary',
        onclick: `startQuiz('${quiz.id}')`
    }, 'Responder');
    
    item.appendChild(info);
    item.appendChild(button);
    
    return item;
}

// Help Request Item Component
function createHelpRequestItem(request) {
    const item = DOM.create('div', { className: 'help-request-item' });
    
    const header = DOM.create('div', { className: 'request-header' });
    const title = DOM.create('div', { className: 'request-title' }, `${request.student} - ${request.subject}`);
    const date = DOM.create('div', { className: 'request-date' }, DateUtils.formatDateTime(request.date));
    
    header.appendChild(title);
    header.appendChild(date);
    
    const content = DOM.create('div', { className: 'request-content' }, request.content);
    
    const actions = DOM.create('div', { className: 'request-actions' });
    const replyBtn = DOM.create('button', { 
        className: 'btn btn-primary btn-small',
        onclick: `replyToHelp(${request.id})`
    }, 'Responder');
    const resolveBtn = DOM.create('button', { 
        className: 'btn btn-success btn-small',
        onclick: `resolveHelp(${request.id})`
    }, 'Resolver');
    
    actions.appendChild(replyBtn);
    actions.appendChild(resolveBtn);
    
    item.appendChild(header);
    item.appendChild(content);
    item.appendChild(actions);
    
    return item;
}

// Report Item Component
function createReportItem(report) {
    const item = DOM.create('div', { className: 'report-item' });
    
    const header = DOM.create('div', { className: 'report-header' });
    const title = DOM.create('div', { className: 'report-title' }, 
        `${StringUtils.toTitleCase(report.type)} ${report.anonymous ? '(Anônimo)' : ''}`);
    const date = DOM.create('div', { className: 'report-date' }, DateUtils.formatDateTime(report.date));
    
    header.appendChild(title);
    header.appendChild(date);
    
    const content = DOM.create('div', { className: 'report-content' }, report.content);
    
    const actions = DOM.create('div', { className: 'report-actions' });
    const investigateBtn = DOM.create('button', { 
        className: 'btn btn-warning btn-small',
        onclick: `investigateReport(${report.id})`
    }, 'Investigar');
    const resolveBtn = DOM.create('button', { 
        className: 'btn btn-success btn-small',
        onclick: `resolveReport(${report.id})`
    }, 'Resolver');
    
    actions.appendChild(investigateBtn);
    actions.appendChild(resolveBtn);
    
    item.appendChild(header);
    item.appendChild(content);
    item.appendChild(actions);
    
    return item;
}

// Attendance Record Component
function createAttendanceRecord(record) {
    const item = DOM.create('div', { className: 'attendance-record' });
    
    const photo = DOM.create('img', { 
        className: 'attendance-photo',
        src: record.photo,
        alt: 'Foto de presença'
    });
    
    const info = DOM.create('div', { className: 'attendance-info' });
    const name = DOM.create('h4', {}, record.student);
    const details = DOM.create('p', {}, `${record.class} - ${DateUtils.formatDate(record.date)} às ${record.time}`);
    
    info.appendChild(name);
    info.appendChild(details);
    
    const status = DOM.create('div', { 
        className: `attendance-status ${record.status}`
    }, record.status === 'present' ? 'Presente' : 'Ausente');
    
    item.appendChild(photo);
    item.appendChild(info);
    item.appendChild(status);
    
    return item;
}

// Modal Component
function createModal(id, title, content, actions = []) {
    const modal = DOM.create('div', { 
        className: 'modal',
        id: id
    });
    
    const modalContent = DOM.create('div', { className: 'modal-content' });
    
    const header = DOM.create('div', { className: 'modal-header' });
    const titleElement = DOM.create('h3', {}, title);
    const closeBtn = DOM.create('button', { 
        className: 'close-btn',
        onclick: `closeModal('${id}')`
    });
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    
    header.appendChild(titleElement);
    header.appendChild(closeBtn);
    
    const body = DOM.create('div', { className: 'modal-body' });
    if (typeof content === 'string') {
        body.innerHTML = content;
    } else {
        body.appendChild(content);
    }
    
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    
    if (actions.length > 0) {
        const footer = DOM.create('div', { className: 'modal-footer' });
        actions.forEach(action => {
            footer.appendChild(action);
        });
        modalContent.appendChild(footer);
    }
    
    modal.appendChild(modalContent);
    
    return modal;
}

// Question Component for Quiz Creation
function createQuestionComponent(questionNumber) {
    const questionItem = DOM.create('div', { className: 'question-item' });
    
    const questionGroup = DOM.create('div', { className: 'form-group' });
    const questionLabel = DOM.create('label', {}, `Pergunta ${questionNumber}`);
    const questionInput = DOM.create('input', { 
        type: 'text',
        className: 'question-text',
        placeholder: 'Digite a pergunta'
    });
    
    questionGroup.appendChild(questionLabel);
    questionGroup.appendChild(questionInput);
    
    const optionsGroup = DOM.create('div', { className: 'form-group' });
    const optionsLabel = DOM.create('label', {}, 'Alternativas');
    
    const optionA = DOM.create('input', { 
        type: 'text',
        className: 'option',
        placeholder: 'Alternativa A'
    });
    const optionB = DOM.create('input', { 
        type: 'text',
        className: 'option',
        placeholder: 'Alternativa B'
    });
    const optionC = DOM.create('input', { 
        type: 'text',
        className: 'option',
        placeholder: 'Alternativa C'
    });
    const optionD = DOM.create('input', { 
        type: 'text',
        className: 'option',
        placeholder: 'Alternativa D'
    });
    
    optionsGroup.appendChild(optionsLabel);
    optionsGroup.appendChild(optionA);
    optionsGroup.appendChild(optionB);
    optionsGroup.appendChild(optionC);
    optionsGroup.appendChild(optionD);
    
    const answerGroup = DOM.create('div', { className: 'form-group' });
    const answerLabel = DOM.create('label', {}, 'Resposta Correta');
    const answerSelect = DOM.create('select', { className: 'correct-answer' });
    
    const optionASelect = DOM.create('option', { value: '0' }, 'A');
    const optionBSelect = DOM.create('option', { value: '1' }, 'B');
    const optionCSelect = DOM.create('option', { value: '2' }, 'C');
    const optionDSelect = DOM.create('option', { value: '3' }, 'D');
    
    answerSelect.appendChild(optionASelect);
    answerSelect.appendChild(optionBSelect);
    answerSelect.appendChild(optionCSelect);
    answerSelect.appendChild(optionDSelect);
    
    answerGroup.appendChild(answerLabel);
    answerGroup.appendChild(answerSelect);
    
    const removeBtn = DOM.create('button', { 
        className: 'btn btn-error btn-small',
        onclick: `removeQuestion(${questionNumber})`,
        style: 'margin-top: 10px;'
    });
    removeBtn.innerHTML = '<i class="fas fa-trash"></i> Remover Pergunta';
    
    questionItem.appendChild(questionGroup);
    questionItem.appendChild(optionsGroup);
    questionItem.appendChild(answerGroup);
    questionItem.appendChild(removeBtn);
    
    return questionItem;
}

// Utility Functions
function getFileIcon(fileType) {
    const iconMap = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'txt': 'fas fa-file-alt',
        'video': 'fas fa-video',
        'mp4': 'fas fa-video',
        'jpg': 'fas fa-image',
        'jpeg': 'fas fa-image',
        'png': 'fas fa-image',
        'gif': 'fas fa-image',
        'link': 'fas fa-link'
    };
    
    return iconMap[fileType] || 'fas fa-file';
}

// Load Functions
function loadStudentClasses() {
    const container = DOM.get('student-classes-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    AppState.classes.forEach(classData => {
        const card = createClassCard(classData, 'student');
        container.appendChild(card);
    });
}

function loadTeacherClasses() {
    const container = DOM.get('teacher-classes-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    AppState.classes.forEach(classData => {
        const card = createClassCard(classData, 'teacher');
        container.appendChild(card);
    });
}

function loadTeacherMaterials() {
    const container = DOM.get('teacher-materials-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    AppState.materials.forEach(material => {
        const item = createMaterialItem(material);
        container.appendChild(item);
    });
}

function loadHelpRequests() {
    const container = DOM.get('help-requests-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (AppState.helpRequests.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Nenhuma solicitação de ajuda pendente</p>';
        return;
    }
    
    AppState.helpRequests.forEach(request => {
        const item = createHelpRequestItem(request);
        container.appendChild(item);
    });
}

function loadReports() {
    const container = DOM.get('reports-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (AppState.reports.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Nenhuma denúncia recebida</p>';
        return;
    }
    
    AppState.reports.forEach(report => {
        const item = createReportItem(report);
        container.appendChild(item);
    });
}

function loadAttendanceRecords() {
    const container = DOM.get('attendance-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (AppState.attendanceRecords.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Nenhum registro de presença encontrado</p>';
        return;
    }
    
    AppState.attendanceRecords.forEach(record => {
        const item = createAttendanceRecord(record);
        container.appendChild(item);
    });
}

function populateClassSelects() {
    const selects = [
        'temp-link-class',
        'material-class',
        'quiz-class',
        'attendance-class-filter'
    ];
    
    selects.forEach(selectId => {
        const select = DOM.get(selectId);
        if (select) {
            // Clear existing options except first
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
            
            // Add class options
            AppState.classes.forEach(classData => {
                const option = DOM.create('option', { value: classData.id }, classData.name);
                select.appendChild(option);
            });
        }
    });
}

// Interactive Functions
function toggleClassMenu(classId) {
    const menu = DOM.get(`class-menu-${classId}`);
    if (menu) {
        menu.classList.toggle('active');
    }
    
    // Close other menus
    const allMenus = DOM.queryAll('.menu-dropdown');
    allMenus.forEach(otherMenu => {
        if (otherMenu.id !== `class-menu-${classId}`) {
            otherMenu.classList.remove('active');
        }
    });
}

function closeModal(modalId) {
    const modal = DOM.get(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// Export functions to global scope
window.createClassCard = createClassCard;
window.createMaterialItem = createMaterialItem;
window.createQuizItem = createQuizItem;
window.createHelpRequestItem = createHelpRequestItem;
window.createReportItem = createReportItem;
window.createAttendanceRecord = createAttendanceRecord;
window.createModal = createModal;
window.createQuestionComponent = createQuestionComponent;
window.loadStudentClasses = loadStudentClasses;
window.loadTeacherClasses = loadTeacherClasses;
window.loadTeacherMaterials = loadTeacherMaterials;
window.loadHelpRequests = loadHelpRequests;
window.loadReports = loadReports;
window.loadAttendanceRecords = loadAttendanceRecords;
window.populateClassSelects = populateClassSelects;
window.toggleClassMenu = toggleClassMenu;
window.closeModal = closeModal;

