// ==================== CONFIGURACIÓN GLOBAL ====================
const DEFAULT_LANG = 'es';
const DEFAULT_THEME = 'light';
let currentLang = localStorage.getItem('lang') || DEFAULT_LANG;

// ==================== GESTIÓN DE IDIOMAS ====================
// Cargar archivos JSON de idiomas desde la carpeta /locales/
async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

// Aplicar traducciones al DOM
function applyTranslations(translations) {
    if (!translations) return;
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = key.split('.').reduce((obj, k) => {
            return obj ? obj[k] : null;
        }, translations);
        
        if (translation) {
            element.textContent = translation;
        }
    });
}

// Actualizar bandera y texto del botón
function updateLangButton(lang) {
    const flagSpan = document.getElementById('lang-flag');
    const textSpan = document.getElementById('lang-text');
    
    if (!flagSpan || !textSpan) return;
    
    if (lang === 'es') {
        flagSpan.textContent = '🇲🇽';
        textSpan.textContent = 'ES';
        document.documentElement.lang = 'es';
    } else {
        flagSpan.textContent = '🇺🇸';
        textSpan.textContent = 'EN';
        document.documentElement.lang = 'en';
    }
}

// Cambiar idioma
async function setLanguage(lang) {
    const translations = await loadTranslations(lang);
    if (translations) {
        applyTranslations(translations);
        currentLang = lang;
        localStorage.setItem('lang', lang);
        updateLangButton(lang);
    } else {
        console.error('Failed to load translations for:', lang);
    }
}

// ==================== GESTIÓN DE TEMA (oscuro/claro) ====================
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Cambiar icono del botón
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        if (theme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
}

// ==================== MENÚ HAMBURGUESA (móvil) ====================
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    const icon = hamburger.querySelector('i');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Cambiar icono
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
}

// ==================== ACORDEÓN (FAQ) ====================
function setupAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Cerrar todos los items
            document.querySelectorAll('.accordion-item').forEach(acc => acc.classList.remove('active'));
            
            // Abrir el item clickeado si no estaba activo
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ==================== MODAL DE CLIENTE ====================
function setupModal() {
    const modal = document.getElementById('client-modal');
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('client-form');

    if (!modal || !openBtn || !closeBtn || !form) return;

    openBtn.addEventListener('click', () => {
        modal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Enviar formulario (simulación)
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('¡Gracias! Te contactaremos pronto.'); // En producción, aquí iría tu lógica AJAX
        modal.classList.remove('show');
        form.reset();
    });
}

// ==================== MANEJAR ERRORES DE IMÁGENES ====================
function setupImageFallbacks() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // Crear SVG placeholder si la imagen falla
            const placeholder = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23e2e8f0'/%3E%3Ctext x='300' y='210' font-family='sans-serif' font-size='20' fill='%2364748b' text-anchor='middle'%3EImagen no disponible%3C/text%3E%3C/svg%3E`;
            
            // Evitar loop infinito
            this.onerror = null;
            this.src = placeholder;
        });
    });
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Cargar idioma guardado o por defecto
    await setLanguage(currentLang);
    
    // 2. Cargar tema guardado o por defecto
    const savedTheme = localStorage.getItem('theme') || DEFAULT_THEME;
    setTheme(savedTheme);
    
    // 3. Configurar interacciones
    setupHamburgerMenu();
    setupAccordion();
    setupModal();
    setupImageFallbacks();

    // 4. Evento para cambiar idioma
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            const newLang = currentLang === 'es' ? 'en' : 'es';
            setLanguage(newLang);
        });
    }

    // 5. Evento para cambiar tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }

    // 6. Log para debug
    console.log('Camacho Craft Homes - Página cargada correctamente');
    console.log('Idioma actual:', currentLang);
    console.log('Tema actual:', document.documentElement.getAttribute('data-theme'));
});