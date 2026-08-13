// ==================== CONFIGURACIÓN GLOBAL ====================
const DEFAULT_LANG = 'es';
const DEFAULT_THEME = 'light';
let currentLang = localStorage.getItem('lang') || DEFAULT_LANG;
let projectsData = [];

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
        flagSpan.textContent = '🇲🇽';
        textSpan.textContent = 'ES';
    } else {
        flagSpan.textContent = '🇺🇸';
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
    
    // Recargar proyectos con el nuevo idioma
    if (projectsData.length > 0) {
        renderProjects(projectsData, lang);
    }
}

// ==================== GESTIÓN DE PROYECTOS ====================
// Cargar proyectos desde data/projects.json
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        if (!response.ok) {
            throw new Error('No se pudieron cargar los proyectos');
        }
        const data = await response.json();
        projectsData = data.projects;
        renderProjects(projectsData, currentLang);
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        showProjectsError();
    }
}

// Renderizar proyectos en la cuadrícula
function renderProjects(projects, lang) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    // Filtrar solo proyectos destacados (featured)
    const featuredProjects = projects.filter(p => p.featured);
    
    if (featuredProjects.length === 0) {
        container.innerHTML = '<p class="no-projects">No hay proyectos disponibles</p>';
        return;
    }
    
    container.innerHTML = featuredProjects.map(project => {
        const translation = project.translations[lang] || project.translations.es;
        const imagePath = project.images.thumbnail || project.images.main;
        
        return `
            <a href="projects/project-template.html?id=${project.id}" class="card-project">
                <div class="project-img">
                    <img src="${imagePath}" 
                         alt="${translation.title}"
                         onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22 viewBox=%220 0 400 300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%23d1d5db%22/%3E%3Ctext x=%22200%22 y=%22160%22 font-family=%22sans-serif%22 font-size=%2220%22 fill=%22%236b7280%22 text-anchor=%22middle%22%3E${translation.title}%3C/text%3E%3C/svg%3E'">
                    <div class="project-overlay">
                        <span data-i18n="projects.view">Ver proyecto</span>
                    </div>
                </div>
                <div class="project-info">
                    <h3>${translation.title}</h3>
                    <p>${translation.shortDescription}</p>
                    <span class="project-tag">${translation.tag}</span>
                </div>
            </a>
        `;
    }).join('');
    
    // Aplicar traducciones a los nuevos elementos
    applyTranslationsToDynamicContent();
}

// Mostrar error si no se pueden cargar los proyectos
function showProjectsError() {
    const container = document.getElementById('projects-container');
    if (container) {
        container.innerHTML = '<p class="error-message">No se pudieron cargar los proyectos. Por favor, intente más tarde.</p>';
    }
}

// Aplicar traducciones a contenido dinámico
function applyTranslationsToDynamicContent() {
    // Esta función se llama después de renderizar contenido dinámico
    // para asegurar que los textos con data-i18n se traduzcan correctamente
    const currentTranslations = window.currentTranslations;
    if (currentTranslations) {
        applyTranslations(currentTranslations);
    }
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
    
    // 2. Cargar proyectos
    await loadProjects();
    
    // 3. Cargar tema guardado o por defecto
    const savedTheme = localStorage.getItem('theme') || DEFAULT_THEME;
    setTheme(savedTheme);
    
    // 4. Configurar interacciones
    setupHamburgerMenu();
    setupAccordion();
    setupModal();

    // 5. Evento para cambiar idioma
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', async () => {
            const newLang = currentLang === 'es' ? 'en' : 'es';
            await setLanguage(newLang);
        });
    }

    // 6. Evento para cambiar tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        });
    }
});