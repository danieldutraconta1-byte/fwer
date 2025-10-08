import { db, collection, doc, deleteDoc, onSnapshot, serverTimestamp, query, where, addDoc } from './firebase-config.js';

const MaterialsState = {
    materials: []
};

const MaterialsManager = {
    unsubscribers: [],

    updateTeacherMaterialsUI: () => {
        const container = document.querySelector('#materials-management-section .materials-list');
        if (!container) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(collection(db, 'materiais'), where('roomCode', '==', window.RoomState.roomCode)),
            (snapshot) => {
                const materials = [];
                snapshot.forEach((doc) => {
                    materials.push({ id: doc.id, ...doc.data() });
                });

                MaterialsState.materials = materials;

                if (materials.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-folder-open"></i>
                            <p>Nenhum material adicionado ainda</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = materials.map(material => `
                    <div class="material-item">
                        <div class="material-icon">
                            <i class="fas fa-${material.type === 'link' ? 'link' : 'file'}"></i>
                        </div>
                        <div class="material-info">
                            <h4 class="material-title">${MaterialsManager.escapeHtml(material.title)}</h4>
                            ${material.description ? `<p class="material-description">${MaterialsManager.escapeHtml(material.description)}</p>` : ''}
                            <div class="material-meta">
                                <span class="material-type">${material.type === 'link' ? 'Link' : 'Arquivo'}</span>
                            </div>
                        </div>
                        <div class="material-actions">
                            <button class="btn btn-sm btn-secondary" onclick="MaterialsManager.previewMaterial('${material.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="removeMaterial('${material.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        );

        MaterialsManager.unsubscribers.push(unsubscribe);
    },

    updateStudentMaterialsUI: () => {
        const container = document.getElementById('student-materials-section');
        if (!container) return;

        if (!window.RoomState || !window.RoomState.roomCode) return;

        const unsubscribe = onSnapshot(
            query(collection(db, 'materiais'), where('roomCode', '==', window.RoomState.roomCode)),
            (snapshot) => {
                const materials = [];
                snapshot.forEach((doc) => {
                    materials.push({ id: doc.id, ...doc.data() });
                });

                if (materials.length === 0) {
                    container.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-folder-open"></i>
                            <p>Nenhum material disponível ainda</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = materials.map(material => `
                    <div class="material-item">
                        <div class="material-icon">
                            <i class="fas fa-${material.type === 'link' ? 'link' : 'file'}"></i>
                        </div>
                        <div class="material-info">
                            <h4 class="material-title">${MaterialsManager.escapeHtml(material.title)}</h4>
                            ${material.description ? `<p class="material-description">${MaterialsManager.escapeHtml(material.description)}</p>` : ''}
                        </div>
                        <button class="btn btn-primary" onclick="accessMaterial('${material.id}')">
                            <i class="fas fa-external-link-alt"></i>
                            Acessar
                        </button>
                    </div>
                `).join('');
            }
        );

        MaterialsManager.unsubscribers.push(unsubscribe);
    },

    showAddMaterialForm: () => {
        const section = document.getElementById('materials-management-section');
        const headerSection = document.getElementById('material-section-header');

        if (!section || !headerSection) return;

        const existingForm = document.getElementById('add-material-form');
        if (existingForm) {
            existingForm.remove();
            return;
        }

        const formHTML = `
            <div id="add-material-form" class="material-form">
                <h3>Adicionar Material</h3>
                <form id="material-form">
                    <div class="form-group">
                        <label for="material-title">Título *</label>
                        <input type="text" id="material-title" required>
                    </div>
                    <div class="form-group">
                        <label for="material-description">Descrição</label>
                        <textarea id="material-description" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Material *</label>
                        <div class="radio-group">
                            <label>
                                <input type="radio" name="material-type" value="link" checked>
                                Link
                            </label>
                            <label>
                                <input type="radio" name="material-type" value="file">
                                Arquivo
                            </label>
                        </div>
                    </div>
                    <div class="form-group" id="url-field">
                        <label for="material-url">URL *</label>
                        <input type="url" id="material-url">
                    </div>
                    <div class="form-group" id="file-field" style="display: none;">
                        <label for="material-file">Arquivo *</label>
                        <input type="file" id="material-file">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="MaterialsManager.showAddMaterialForm()">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="addMaterialFromForm()">Adicionar</button>
                    </div>
                </form>
            </div>
        `;

        headerSection.insertAdjacentHTML('afterend', formHTML);

        document.querySelectorAll('input[name="material-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const urlField = document.getElementById('url-field');
                const fileField = document.getElementById('file-field');

                if (e.target.value === 'link') {
                    urlField.style.display = 'block';
                    fileField.style.display = 'none';
                } else {
                    urlField.style.display = 'none';
                    fileField.style.display = 'block';
                }
            });
        });
    },

    addMaterial: async (materialData) => {
        if (!window.RoomState || !window.RoomState.roomCode) {
            if (window.showToast) {
                window.showToast('Nenhuma sala ativa', 'error');
            }
            return;
        }

        try {
            await addDoc(collection(db, 'materiais'), {
                ...materialData,
                roomCode: window.RoomState.roomCode,
                createdAt: serverTimestamp()
            });

            if (window.showToast) {
                window.showToast('Material adicionado com sucesso!', 'success');
            }

            const form = document.getElementById('add-material-form');
            if (form) form.remove();
        } catch (error) {
            console.error('Erro ao adicionar material:', error);
            if (window.showToast) {
                window.showToast('Erro ao adicionar material', 'error');
            }
        }
    },

    removeMaterial: async (materialId) => {
        if (!confirm('Tem certeza que deseja remover este material?')) return;

        try {
            await deleteDoc(doc(db, 'materiais', materialId));

            if (window.showToast) {
                window.showToast('Material removido com sucesso', 'info');
            }
        } catch (error) {
            console.error('Erro ao remover material:', error);
        }
    },

    previewMaterial: (materialId) => {
        const material = MaterialsState.materials.find(m => m.id === materialId);
        if (material && material.url) {
            window.open(material.url, '_blank');
        }
    },

    escapeHtml: (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    cleanup: () => {
        MaterialsManager.unsubscribers.forEach(unsub => unsub());
        MaterialsManager.unsubscribers = [];
    }
};

window.MaterialsManager = MaterialsManager;
window.MaterialsState = MaterialsState;

window.openMaterialsManagement = function() {
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
};

window.showAddMaterialForm = function() {
    MaterialsManager.showAddMaterialForm();
};

window.addMaterialFromForm = function() {
    const title = document.getElementById('material-title')?.value.trim();
    const description = document.getElementById('material-description')?.value.trim();
    const materialType = document.querySelector('input[name="material-type"]:checked')?.value;

    if (!title) {
        if (window.showToast) {
            window.showToast('Por favor, digite o título do material', 'error');
        }
        return;
    }

    if (!materialType) {
        if (window.showToast) {
            window.showToast('Por favor, selecione o tipo de material', 'error');
        }
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
            if (window.showToast) {
                window.showToast('Por favor, digite a URL do material', 'error');
            }
            return;
        }

        try {
            new URL(url);
            materialData.url = url;
        } catch (e) {
            if (window.showToast) {
                window.showToast('Por favor, digite uma URL válida', 'error');
            }
            return;
        }
    } else if (materialType === 'file') {
        const fileInput = document.getElementById('material-file');
        const file = fileInput?.files[0];

        if (!file) {
            if (window.showToast) {
                window.showToast('Por favor, selecione um arquivo', 'error');
            }
            return;
        }

        materialData.url = URL.createObjectURL(file);
        materialData.fileName = file.name;
        materialData.fileSize = formatFileSize(file.size);
    }

    MaterialsManager.addMaterial(materialData);
};

window.removeMaterial = function(materialId) {
    MaterialsManager.removeMaterial(materialId);
};

window.previewMaterial = function(materialId) {
    MaterialsManager.previewMaterial(materialId);
};

window.openStudentMaterials = function() {
    const modal = document.getElementById('student-materials-modal');
    if (modal) {
        modal.style.display = 'flex';
        MaterialsManager.updateStudentMaterialsUI();
    }
};

window.closeStudentMaterials = function() {
    const modal = document.getElementById('student-materials-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.accessMaterial = function(materialId) {
    const material = MaterialsState.materials.find(m => m.id === materialId);
    if (material && material.url) {
        window.open(material.url, '_blank');

        if (window.showToast) {
            window.showToast(`Acessando: ${material.title}`, 'info');
        }
    }
};

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

window.formatFileSize = formatFileSize;

export { MaterialsManager, MaterialsState };
