// ==================== CONFIGURACIÓN GLOBAL ====================
const DEFAULT_LANG = 'es';
const DEFAULT_THEME = 'light';
let currentLang = localStorage.getItem('lang') || DEFAULT_LANG;

// ==================== GESTIÓN DE IDIOMAS ====================
// Cargar archivos JSON de idiomas desde la carpeta /locales/
async function loadTranslations(lang) {
    const response = await fetch(`locales/${lang}.json`);
    if (!response.ok) {
        console.error(`No se pudo cargar el idioma ${lang}`);
        return {};
    }
    return await response.json();
}

// Aplicar traducciones al DOM
function applyTranslations(translations) {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = key.split('.').reduce((obj, k) => obj && obj[k], translations);
        if (translation) {
            element.textContent = translation;
        }
    });
}

// Actualizar bandera y texto del botón
function updateLangButton(lang) {
    const flagSpan = document.getElementById('lang-flag');
    const textSpan = document.getElementById('lang-text');
    
    if (lang === 'es') {
        flagSpan.textContent = '🇲🇽';  // Bandera de México
        textSpan.textContent = 'ES';
    } else {
        flagSpan.textContent = '🇺🇸';  // Bandera de USA
        textSpan.textContent = 'EN';
    }
}

// Cambiar idioma
async function setLanguage(lang) {
    const translations = await loadTranslations(lang);
    applyTranslations(translations);
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateLangButton(lang);
    document.documentElement.lang = lang;
}

// ==================== GESTIÓN DE TEMA (oscuro/claro) ====================
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Cambiar icono del botón
    const icon = document.querySelector('#theme-toggle i');
    if (theme === 'dark') {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
}

// ==================== MENÚ HAMBURGUESA (móvil) ====================
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
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
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
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
});