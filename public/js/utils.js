// Utility functions for the Educational Platform

// DOM Manipulation Utilities
const DOM = {
    // Get element by ID
    get: (id) => document.getElementById(id),
    
    // Get elements by class name
    getByClass: (className) => document.getElementsByClassName(className),
    
    // Get elements by query selector
    query: (selector) => document.querySelector(selector),
    
    // Get all elements by query selector
    queryAll: (selector) => document.querySelectorAll(selector),
    
    // Create element with attributes
    create: (tag, attributes = {}, content = '') => {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        if (content) {
            element.textContent = content;
        }
        return element;
    },
    
    // Show element
    show: (element) => {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element) {
            element.style.display = 'block';
        }
    },
    
    // Hide element
    hide: (element) => {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element) {
            element.style.display = 'none';
        }
    },
    
    // Toggle element visibility
    toggle: (element) => {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    }
};

// Validation Utilities
const Validator = {
    // Check if email is valid
    isEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Check if string is not empty
    isNotEmpty: (str) => {
        return str && str.trim().length > 0;
    },
    
    // Check if string has minimum length
    hasMinLength: (str, minLength) => {
        return str && str.length >= minLength;
    },
    
    // Check if string has maximum length
    hasMaxLength: (str, maxLength) => {
        return str && str.length <= maxLength;
    },
    
    // Check if value is a number
    isNumber: (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    // Check if value is positive number
    isPositiveNumber: (value) => {
        return Validator.isNumber(value) && parseFloat(value) > 0;
    },
    
    // Validate class code format
    isValidClassCode: (code) => {
        const codeRegex = /^[A-Z]{3}\d{3}$/;
        return codeRegex.test(code);
    },
    
    // Validate form data
    validateForm: (formData, rules) => {
        const errors = [];
        
        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const fieldRules = rules[field];
            
            if (fieldRules.required && !Validator.isNotEmpty(value)) {
                errors.push(`${field} é obrigatório`);
            }
            
            if (fieldRules.email && value && !Validator.isEmail(value)) {
                errors.push(`${field} deve ser um email válido`);
            }
            
            if (fieldRules.minLength && value && !Validator.hasMinLength(value, fieldRules.minLength)) {
                errors.push(`${field} deve ter pelo menos ${fieldRules.minLength} caracteres`);
            }
            
            if (fieldRules.maxLength && value && !Validator.hasMaxLength(value, fieldRules.maxLength)) {
                errors.push(`${field} deve ter no máximo ${fieldRules.maxLength} caracteres`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Date and Time Utilities
const DateUtils = {
    // Format date to Brazilian format
    formatDate: (date) => {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('pt-BR');
    },
    
    // Format time to Brazilian format
    formatTime: (date) => {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
    
    // Format date and time
    formatDateTime: (date) => {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return `${DateUtils.formatDate(date)} ${DateUtils.formatTime(date)}`;
    },
    
    // Get current date in YYYY-MM-DD format
    getCurrentDate: () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    },
    
    // Get current time in HH:MM format
    getCurrentTime: () => {
        const now = new Date();
        return now.toTimeString().split(' ')[0].substring(0, 5);
    },
    
    // Calculate time difference in hours
    getHoursDifference: (date1, date2) => {
        const diff = Math.abs(new Date(date2) - new Date(date1));
        return Math.floor(diff / (1000 * 60 * 60));
    },
    
    // Add hours to date
    addHours: (date, hours) => {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    }
};

// String Utilities
const StringUtils = {
    // Capitalize first letter
    capitalize: (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    // Convert to title case
    toTitleCase: (str) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },
    
    // Generate random string
    generateRandomString: (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Generate class code
    generateClassCode: () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        let code = '';
        
        // 3 letters
        for (let i = 0; i < 3; i++) {
            code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        
        // 3 numbers
        for (let i = 0; i < 3; i++) {
            code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        return code;
    },
    
    // Truncate string
    truncate: (str, maxLength, suffix = '...') => {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    },
    
    // Remove accents
    removeAccents: (str) => {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
};

// Array Utilities
const ArrayUtils = {
    // Shuffle array
    shuffle: (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },
    
    // Get unique values
    unique: (array) => {
        return [...new Set(array)];
    },
    
    // Group array by property
    groupBy: (array, property) => {
        return array.reduce((groups, item) => {
            const key = item[property];
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
            return groups;
        }, {});
    },
    
    // Sort array by property
    sortBy: (array, property, ascending = true) => {
        return [...array].sort((a, b) => {
            const aVal = a[property];
            const bVal = b[property];
            
            if (aVal < bVal) return ascending ? -1 : 1;
            if (aVal > bVal) return ascending ? 1 : -1;
            return 0;
        });
    }
};

// Local Storage Utilities
const Storage = {
    // Set item in localStorage
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    // Get item from localStorage
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    // Remove item from localStorage
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    // Clear all localStorage
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// File Utilities
const FileUtils = {
    // Get file extension
    getExtension: (filename) => {
        return filename.split('.').pop().toLowerCase();
    },
    
    // Check if file is image
    isImage: (filename) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        return imageExtensions.includes(FileUtils.getExtension(filename));
    },
    
    // Check if file is video
    isVideo: (filename) => {
        const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        return videoExtensions.includes(FileUtils.getExtension(filename));
    },
    
    // Check if file is document
    isDocument: (filename) => {
        const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
        return docExtensions.includes(FileUtils.getExtension(filename));
    },
    
    // Format file size
    formatSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Read file as data URL
    readAsDataURL: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};

// URL Utilities
const URLUtils = {
    // Get URL parameters
    getParams: () => {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },
    
    // Get specific URL parameter
    getParam: (name, defaultValue = null) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name) || defaultValue;
    },
    
    // Build URL with parameters
    buildURL: (baseURL, params) => {
        const url = new URL(baseURL);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        return url.toString();
    }
};

// Animation Utilities
const AnimationUtils = {
    // Smooth scroll to element
    scrollTo: (element, offset = 0) => {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    },
    
    // Fade in element
    fadeIn: (element, duration = 300) => {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        
        if (element) {
            element.style.opacity = '0';
            element.style.display = 'block';
            
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.min(progress / duration, 1);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        }
    },
    
    // Fade out element
    fadeOut: (element, duration = 300) => {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        
        if (element) {
            let start = null;
            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const opacity = Math.max(1 - (progress / duration), 0);
                
                element.style.opacity = opacity;
                
                if (progress < duration) {
                    requestAnimationFrame(animate);
                } else {
                    element.style.display = 'none';
                }
            };
            
            requestAnimationFrame(animate);
        }
    }
};

// Device Detection Utilities
const DeviceUtils = {
    // Check if mobile device
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Check if tablet
    isTablet: () => {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
    },
    
    // Check if desktop
    isDesktop: () => {
        return !DeviceUtils.isMobile() && !DeviceUtils.isTablet();
    },
    
    // Get screen size category
    getScreenSize: () => {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }
};

// Export utilities to global scope
window.DOM = DOM;
window.Validator = Validator;
window.DateUtils = DateUtils;
window.StringUtils = StringUtils;
window.ArrayUtils = ArrayUtils;
window.Storage = Storage;
window.FileUtils = FileUtils;
window.URLUtils = URLUtils;
window.AnimationUtils = AnimationUtils;
window.DeviceUtils = DeviceUtils;

