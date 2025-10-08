// Camera System for Educational Platform
// Uses MediaDevices API for photo capture

let cameraStream = null;
let capturedPhoto = null;
let cameraContext = null; // 'attendance' or other contexts

// Camera modal elements
const getCameraElements = () => ({
    modal: DOM.get('camera-modal'),
    video: DOM.get('camera-video'),
    canvas: DOM.get('camera-canvas'),
    preview: DOM.get('camera-preview'),
    previewImage: DOM.get('preview-image'),
    startBtn: DOM.get('start-camera-btn'),
    captureBtn: DOM.get('capture-btn'),
    retakeBtn: DOM.get('retake-btn'),
    confirmBtn: DOM.get('confirm-btn'),
    downloadBtn: DOM.get('download-btn')
});

// Open camera modal
function openCameraModal(context = 'general') {
    cameraContext = context;
    const elements = getCameraElements();
    
    if (elements.modal) {
        elements.modal.classList.add('active');
        elements.modal.style.display = 'flex';
        resetCameraState();
    }
}

// Close camera modal
function closeCameraModal() {
    const elements = getCameraElements();
    
    if (elements.modal) {
        elements.modal.classList.remove('active');
        elements.modal.style.display = 'none';
    }
    
    stopCamera();
    resetCameraState();
}

// Reset camera state
function resetCameraState() {
    const elements = getCameraElements();
    
    if (elements.video) elements.video.style.display = 'block';
    if (elements.preview) elements.preview.style.display = 'none';
    if (elements.startBtn) elements.startBtn.style.display = 'block';
    if (elements.captureBtn) elements.captureBtn.style.display = 'none';
    if (elements.retakeBtn) elements.retakeBtn.style.display = 'none';
    if (elements.confirmBtn) elements.confirmBtn.style.display = 'none';
    if (elements.downloadBtn) elements.downloadBtn.style.display = 'none';
    
    capturedPhoto = null;
}

// Start camera
async function startCamera() {
    const elements = getCameraElements();
    
    try {
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Seu navegador não suporta acesso à câmera');
        }
        
        // Request camera access
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user' // Front camera for selfies
            },
            audio: false
        };
        
        showToast('Solicitando acesso à câmera...', 'info');
        
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (elements.video) {
            elements.video.srcObject = cameraStream;
            elements.video.play();
            
            // Wait for video to load
            elements.video.onloadedmetadata = () => {
                showToast('Câmera iniciada com sucesso!', 'success');
                
                // Update button visibility
                if (elements.startBtn) elements.startBtn.style.display = 'none';
                if (elements.captureBtn) elements.captureBtn.style.display = 'block';
            };
        }
        
    } catch (error) {
        console.error('Erro ao acessar câmera:', error);
        
        let errorMessage = 'Erro ao acessar a câmera';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Acesso à câmera negado. Por favor, permita o acesso e tente novamente.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage = 'Seu navegador não suporta acesso à câmera.';
        }
        
        showToast(errorMessage, 'error');
    }
}

// Stop camera
function stopCamera() {
    if (cameraStream) {
        const tracks = cameraStream.getTracks();
        tracks.forEach(track => track.stop());
        cameraStream = null;
    }
}

// Capture photo
function capturePhoto() {
    const elements = getCameraElements();
    
    if (!elements.video || !elements.canvas) {
        showToast('Erro: elementos de câmera não encontrados', 'error');
        return;
    }
    
    try {
        const video = elements.video;
        const canvas = elements.canvas;
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);
        
        // Show preview
        if (elements.previewImage && elements.preview) {
            elements.previewImage.src = capturedPhoto;
            elements.video.style.display = 'none';
            elements.preview.style.display = 'block';
        }
        
        // Update button visibility
        if (elements.captureBtn) elements.captureBtn.style.display = 'none';
        if (elements.retakeBtn) elements.retakeBtn.style.display = 'block';
        if (elements.confirmBtn) elements.confirmBtn.style.display = 'block';
        if (elements.downloadBtn) elements.downloadBtn.style.display = 'block';
        
        showToast('Foto capturada! Você pode refazer ou confirmar.', 'success');
        
    } catch (error) {
        console.error('Erro ao capturar foto:', error);
        showToast('Erro ao capturar foto', 'error');
    }
}

// Retake photo
function retakePhoto() {
    const elements = getCameraElements();
    
    // Show video again
    if (elements.video) elements.video.style.display = 'block';
    if (elements.preview) elements.preview.style.display = 'none';
    
    // Update button visibility
    if (elements.captureBtn) elements.captureBtn.style.display = 'block';
    if (elements.retakeBtn) elements.retakeBtn.style.display = 'none';
    if (elements.confirmBtn) elements.confirmBtn.style.display = 'none';
    if (elements.downloadBtn) elements.downloadBtn.style.display = 'none';
    
    capturedPhoto = null;
    showToast('Pronto para capturar nova foto', 'info');
}

// Confirm photo
function confirmPhoto() {
    if (!capturedPhoto) {
        showToast('Nenhuma foto capturada', 'error');
        return;
    }
    
    // Handle photo confirmation based on context
    switch (cameraContext) {
        case 'attendance':
            confirmAttendancePhoto();
            break;
        default:
            showToast('Foto confirmada com sucesso!', 'success');
            closeCameraModal();
            break;
    }
}

// Confirm attendance photo
function confirmAttendancePhoto() {
    if (!capturedPhoto) {
        showToast('Nenhuma foto capturada', 'error');
        return;
    }
    
    // Simulate attendance confirmation
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        
        // Add attendance record
        const attendanceRecord = {
            id: Date.now(),
            student: 'Usuário Atual',
            class: 'Turma Atual',
            date: DateUtils.getCurrentDate(),
            time: DateUtils.getCurrentTime(),
            photo: capturedPhoto,
            status: 'present'
        };
        
        // Add to mock data
        AppState.attendanceRecords.unshift(attendanceRecord);
        
        showToast('Presença marcada com sucesso!', 'success');
        closeCameraModal();
        
    }, 2000);
}

// Download photo
function downloadPhoto() {
    if (!capturedPhoto) {
        showToast('Nenhuma foto para download', 'error');
        return;
    }
    
    try {
        // Create download link
        const link = document.createElement('a');
        link.download = `foto_${DateUtils.getCurrentDate()}_${DateUtils.getCurrentTime().replace(':', '')}.jpg`;
        link.href = capturedPhoto;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Foto baixada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao baixar foto:', error);
        showToast('Erro ao baixar foto', 'error');
    }
}

// Check camera support
function checkCameraSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
            supported: false,
            message: 'Seu navegador não suporta acesso à câmera'
        };
    }
    
    return {
        supported: true,
        message: 'Câmera suportada'
    };
}

// Get available cameras
async function getAvailableCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        
        return cameras.map(camera => ({
            id: camera.deviceId,
            label: camera.label || `Câmera ${cameras.indexOf(camera) + 1}`
        }));
        
    } catch (error) {
        console.error('Erro ao listar câmeras:', error);
        return [];
    }
}

// Switch camera (if multiple available)
async function switchCamera(deviceId) {
    if (cameraStream) {
        stopCamera();
    }
    
    try {
        const constraints = {
            video: {
                deviceId: { exact: deviceId },
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        };
        
        cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
        
        const elements = getCameraElements();
        if (elements.video) {
            elements.video.srcObject = cameraStream;
            elements.video.play();
        }
        
        showToast('Câmera alterada com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao trocar câmera:', error);
        showToast('Erro ao trocar câmera', 'error');
    }
}

// Apply photo filters (optional enhancement)
function applyPhotoFilter(filterType) {
    if (!capturedPhoto) {
        showToast('Nenhuma foto para aplicar filtro', 'error');
        return;
    }
    
    const elements = getCameraElements();
    const canvas = elements.canvas;
    const context = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Apply filter based on type
        switch (filterType) {
            case 'grayscale':
                context.filter = 'grayscale(100%)';
                break;
            case 'sepia':
                context.filter = 'sepia(100%)';
                break;
            case 'blur':
                context.filter = 'blur(2px)';
                break;
            case 'brightness':
                context.filter = 'brightness(120%)';
                break;
            case 'contrast':
                context.filter = 'contrast(120%)';
                break;
            default:
                context.filter = 'none';
        }
        
        context.drawImage(img, 0, 0);
        
        // Update captured photo
        capturedPhoto = canvas.toDataURL('image/jpeg', 0.8);
        
        // Update preview
        if (elements.previewImage) {
            elements.previewImage.src = capturedPhoto;
        }
        
        showToast(`Filtro ${filterType} aplicado!`, 'success');
    };
    
    img.src = capturedPhoto;
}

// Clipboard API integration
async function copyToClipboard(elementId) {
    const element = DOM.get(elementId);
    
    if (!element) {
        showToast('Elemento não encontrado', 'error');
        return;
    }
    
    try {
        let textToCopy = '';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            textToCopy = element.value;
        } else {
            textToCopy = element.textContent || element.innerText;
        }
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
            showToast('Copiado para a área de transferência!', 'success');
        } else {
            // Fallback for older browsers
            element.select();
            document.execCommand('copy');
            showToast('Copiado para a área de transferência!', 'success');
        }
        
    } catch (error) {
        console.error('Erro ao copiar:', error);
        showToast('Erro ao copiar para área de transferência', 'error');
    }
}

// Export functions to global scope
window.openCameraModal = openCameraModal;
window.closeCameraModal = closeCameraModal;
window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.capturePhoto = capturePhoto;
window.retakePhoto = retakePhoto;
window.confirmPhoto = confirmPhoto;
window.downloadPhoto = downloadPhoto;
window.checkCameraSupport = checkCameraSupport;
window.getAvailableCameras = getAvailableCameras;
window.switchCamera = switchCamera;
window.applyPhotoFilter = applyPhotoFilter;
window.copyToClipboard = copyToClipboard;

// Initialize camera system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check camera support on load
    const support = checkCameraSupport();
    if (!support.supported) {
        console.warn('Camera not supported:', support.message);
    }
});

