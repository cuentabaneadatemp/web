/**
 * i18n.js — Sistema de Internacionalización
 * Contactos Anónimos v4.0
 *
 * Gestiona la traducción de la interfaz entre español e inglés.
 * Proporciona funciones para obtener traducciones, cambiar idioma
 * y persistir la preferencia del usuario.
 *
 * @module i18n
 * @version 4.0
 */

(function (global) {
    'use strict';

    /* ── Constantes ──────────────────────────────────────────── */
    const STORAGE_KEY = '_ca_language';
    const DEFAULT_LANGUAGE = 'es';
    const SUPPORTED_LANGUAGES = Object.freeze(['es', 'en']);

    /* ── Diccionarios de Traducciones ────────────────────────── */
    const translations = Object.freeze({
        es: {
            // Header y navegación
            'header.title':             'Contactos Anónimos',
            'header.subtitle':          'Contacta sin límites',
            'header.description':       'Millones de números móviles reales para chatear',
            'header.theme.greenblue':   'Verde/Azul',
            'header.theme.neon':        'Neón',
            'header.theme.random':      'Aleatorio',
            'header.language':          'Idioma',
            'header.beta':              'Modo Beta',
            'header.menu':              'Menú',

            // Menú principal
            'menu.section.main':        'Principal',
            'menu.section.appearance':  'Apariencia',
            'menu.section.tools':       'Herramientas',
            'menu.section.info':        'Información',
            'menu.contacts':            'Contactos',
            'menu.generator':           'Generador',
            'menu.favorites':           'Favoritos',
            'menu.themes':              'Temas Visuales',
            'menu.language':            'Idioma',
            'menu.settings':            'Configuración',
            'menu.beta':                'Modo Beta',
            'menu.stats':               'Estadísticas',
            'menu.privacy':             'Privacidad',
            'menu.terms':               'Términos de Uso',
            'menu.about':               'Acerca de',
            'menu.install_pwa':         'Instalar App',
            'menu.share_channel':       'Canal WhatsApp',

            // Botones principales
            'btn.search':               'Buscar',
            'btn.reset':                'Reiniciar',
            'btn.loadMore':             'Cargar más',
            'btn.copy':                 'Copiar',
            'btn.whatsapp':             'WhatsApp',
            'btn.telegram':             'Telegram',
            'btn.share':                'Canal WhatsApp',
            'btn.accept':               'Aceptar y continuar',
            'btn.decline':              'Rechazar',
            'btn.retry':                'Reintentar',
            'btn.close':                'Cerrar',
            'btn.feedback':             'Enviar Feedback',

            // Secciones principales
            'section.contacts':         'Contactos Disponibles',
            'section.message':          'Mensaje Personalizado',
            'section.privacy':          'Privacidad y Seguridad',
            'section.permissions':      'Permisos Requeridos',
            'section.beta':             'Características Experimentales',

            // Mensajes de estado
            'status.loading':           'Cargando números...',
            'status.generating':        'Generando...',
            'status.empty':             'No hay números. Usa "Buscar" o "Cargar más".',
            'status.error':             'Error al generar números. Inténtalo de nuevo.',
            'status.copied':            'Copiado al portapapeles',
            'status.failed':            'No se pudo copiar',
            'status.noMore':            'No hay más números únicos disponibles.',

            // Modales
            'modal.terms.title':        'Términos y Condiciones',
            'modal.terms.content':      'Al usar esta plataforma aceptas nuestros términos y condiciones.',
            'modal.privacy.title':      'Política de Privacidad',
            'modal.privacy.content':    'Tu privacidad es importante. No recolectamos datos personales.',
            'modal.permissions.title':  'Permisos Requeridos',
            'modal.permissions.content':'Necesitamos los siguientes permisos para funcionar:',
            'modal.blocked.title':      'Acceso Denegado',
            'modal.blocked.vpn':        'VPN o Proxy detectado. Por favor desactívalo.',
            'modal.blocked.location':   'Esta plataforma solo está disponible para usuarios en Cuba.',
            'modal.blocked.outside':    'Has salido de la región permitida.',
            'modal.blocked.hint':       'Si crees que esto es un error, verifica tu ubicación y desactiva cualquier VPN o proxy.',
            'modal.loading.title':      'Verificando acceso...',
            'modal.loading.desc':       'Solicitando permisos requeridos y verificando ubicación...',
            'modal.accept.title':       'Aviso de Acceso',
            'modal.accept.desc':        'Para continuar, debes leer y aceptar nuestra Política de Privacidad y Términos de Uso.',
            'modal.accept.summary':     'Todos los números son generados aleatoriamente. El uso de esta plataforma es bajo tu exclusiva responsabilidad. Prohibido el uso para spam, acoso o actividades ilegales.',

            // Permisos
            'perm.geolocation':         'Geolocalización',
            'perm.storage':             'Almacenamiento Local',
            'perm.notifications':       'Notificaciones',
            'perm.granted':             'Concedido',
            'perm.denied':              'Rechazado',

            // Información de números
            'number.label':             'Número móvil cubano',
            'number.count.singular':    '1 número',
            'number.count.plural':      '{count} números',
            'number.counter':           '{count} número{plural}',

            // Mensajes por defecto
            'message.default':          'Hola, vi tu número en la red anónima. ¿Charlamos?',
            'message.placeholder':      'Escribe tu mensaje personalizado...',
            'message.maxLength':        'Máximo 300 caracteres',

            // Características beta
            'beta.title':               'Modo Beta',
            'beta.description':         'Participa en características experimentales antes de su lanzamiento oficial.',
            'beta.enable':              'Habilitar Modo Beta',
            'beta.disable':             'Deshabilitar Modo Beta',
            'beta.features':            'Características Disponibles',
            'beta.feature.advanced':    'Generador Avanzado',
            'beta.feature.analytics':   'Análisis de Contactos',
            'beta.feature.themes':      'Temas Personalizados',
            'beta.feature.notifications':'Notificaciones Mejoradas',
            'beta.feature.incognito':   'Modo Incógnito',

            // Información general
            'info.whatsapp':            'Contactar por WhatsApp',
            'info.telegram':            'Contactar por Telegram',
            'info.channel':             'Canal oficial de WhatsApp',
            'info.version':             'Versión',
            'info.about':               'Acerca de',
            'info.help':                'Ayuda',
            'info.feedback':            'Reportar Problema',

            // Temas
            'theme.greenblue':          'Verde / Azul',
            'theme.neon':               'Neón',
            'theme.sunset':             'Atardecer',
            'theme.ocean':              'Océano',
            'theme.purple':             'Púrpura',
            'theme.random':             'Aleatorio',

            // Generador
            'generator.desc':           'Genera números móviles cubanos de forma aleatoria para iniciar conversaciones anónimas.',
            'generator.count_label':    'Cantidad a generar',
            'generator.btn':            'Generar ahora',

            // Favoritos
            'favorites.empty':          'No tienes favoritos guardados aún.',

            // Configuración
            'settings.notifications':       'Notificaciones',
            'settings.notifications_desc':  'Recibe alertas de nuevos contactos',
            'settings.autoload':            'Carga automática',
            'settings.autoload_desc':       'Cargar más números al hacer scroll',
            'settings.animations':          'Animaciones',
            'settings.animations_desc':     'Efectos visuales de transición',
            'settings.haptics':             'Vibración (haptics)',
            'settings.haptics_desc':        'Retroalimentación táctil al copiar',
            'settings.clear_data':          'Limpiar datos',
            'settings.clear_data_desc':     'Eliminar historial y favoritos guardados',
            'settings.clear_btn':           'Limpiar',

            // Estadísticas
            'stats.total_generated':    'Números generados',
            'stats.total_copied':       'Números copiados',
            'stats.whatsapp_opened':    'WhatsApp abiertos',
            'stats.telegram_opened':    'Telegram abiertos',
            'stats.favorites':          'Favoritos guardados',
            'stats.session_time':       'Tiempo de sesión',
            'stats.reset':              'Reiniciar estadísticas',

            // Privacidad
            'privacy.p1':               'No almacenamos ni procesamos datos personales de los propietarios de los números. Solo se muestran los números de contacto de forma anónima. El uso de la plataforma es bajo tu responsabilidad.',
            'privacy.p2':               'No utilizamos cookies de seguimiento ni compartimos información con terceros. Los datos de sesión se almacenan únicamente en tu dispositivo y se eliminan al cerrar el navegador.',
            'privacy.p3':               'Esta plataforma no recopila información de identificación personal. Los números generados son aleatorios y no están vinculados a personas reales.',

            // Términos
            'terms.intro':              'Al usar esta plataforma, aceptas que:',
            'terms.item1_title':        'Uso responsable:',
            'terms.item1':              'Está prohibido usar la plataforma para spam, acoso, extorsión, fraude o cualquier actividad ilegal.',
            'terms.item2_title':        'Exención de responsabilidad:',
            'terms.item2':              'No nos hacemos responsables por el mal uso de la información proporcionada.',
            'terms.item3_title':        'Números generados:',
            'terms.item3':              'Los números se generan algorítmicamente. No garantizamos su disponibilidad o actividad real.',
            'terms.item4_title':        'Reserva de derechos:',
            'terms.item4':              'Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento.',

            // Acerca de
            'about.desc':               'Plataforma web progresiva para generar y gestionar contactos anónimos de forma segura y privada.',
            'about.feature_offline':    'Funciona sin conexión',
            'about.feature_installable':'Instalable en tu dispositivo',
            'about.feature_secure':     'Seguro y privado',
            'about.feature_fast':       'Rápido y ligero',
            'about.pwa_status':         'Estado PWA:',
            'about.sw_status':          'Service Worker:',
            'about.cache_size':         'Caché:',

            // Pie de página
            'footer.install_pwa':       'Instalar App',
            'footer.pwa_installed':     'App Instalada',
            'footer.disclaimer':        'Uso bajo tu responsabilidad',
        },

        en: {
            // Header and navigation
            'header.title':             'Anonymous Contacts',
            'header.subtitle':          'Connect Without Limits',
            'header.description':       'Millions of real mobile numbers to chat',
            'header.theme.greenblue':   'Green/Blue',
            'header.theme.neon':        'Neon',
            'header.theme.random':      'Random',
            'header.language':          'Language',
            'header.beta':              'Beta Mode',
            'header.menu':              'Menu',

            // Main menu
            'menu.section.main':        'Main',
            'menu.section.appearance':  'Appearance',
            'menu.section.tools':       'Tools',
            'menu.section.info':        'Information',
            'menu.contacts':            'Contacts',
            'menu.generator':           'Generator',
            'menu.favorites':           'Favorites',
            'menu.themes':              'Visual Themes',
            'menu.language':            'Language',
            'menu.settings':            'Settings',
            'menu.beta':                'Beta Mode',
            'menu.stats':               'Statistics',
            'menu.privacy':             'Privacy',
            'menu.terms':               'Terms of Use',
            'menu.about':               'About',
            'menu.install_pwa':         'Install App',
            'menu.share_channel':       'WhatsApp Channel',

            // Main buttons
            'btn.search':               'Search',
            'btn.reset':                'Reset',
            'btn.loadMore':             'Load More',
            'btn.copy':                 'Copy',
            'btn.whatsapp':             'WhatsApp',
            'btn.telegram':             'Telegram',
            'btn.share':                'WhatsApp Channel',
            'btn.accept':               'Accept & Continue',
            'btn.decline':              'Decline',
            'btn.retry':                'Retry',
            'btn.close':                'Close',
            'btn.feedback':             'Send Feedback',

            // Main sections
            'section.contacts':         'Available Contacts',
            'section.message':          'Custom Message',
            'section.privacy':          'Privacy & Security',
            'section.permissions':      'Required Permissions',
            'section.beta':             'Experimental Features',

            // Status messages
            'status.loading':           'Loading numbers...',
            'status.generating':        'Generating...',
            'status.empty':             'No numbers. Use "Search" or "Load More".',
            'status.error':             'Error generating numbers. Try again.',
            'status.copied':            'Copied to clipboard',
            'status.failed':            'Failed to copy',
            'status.noMore':            'No more unique numbers available.',

            // Modals
            'modal.terms.title':        'Terms and Conditions',
            'modal.terms.content':      'By using this platform you accept our terms and conditions.',
            'modal.privacy.title':      'Privacy Policy',
            'modal.privacy.content':    'Your privacy is important. We do not collect personal data.',
            'modal.permissions.title':  'Required Permissions',
            'modal.permissions.content':'We need the following permissions to work:',
            'modal.blocked.title':      'Access Denied',
            'modal.blocked.vpn':        'VPN or Proxy detected. Please disable it.',
            'modal.blocked.location':   'This platform is only available for users in Cuba.',
            'modal.blocked.outside':    'You have left the allowed region.',
            'modal.blocked.hint':       'If you think this is an error, check your location and disable any VPN or proxy.',
            'modal.loading.title':      'Verifying access...',
            'modal.loading.desc':       'Requesting required permissions and verifying location...',
            'modal.accept.title':       'Access Notice',
            'modal.accept.desc':        'To continue, you must read and accept our Privacy Policy and Terms of Use.',
            'modal.accept.summary':     'All numbers are randomly generated. Use of this platform is at your own risk. Prohibited for spam, harassment, or illegal activities.',

            // Permissions
            'perm.geolocation':         'Geolocation',
            'perm.storage':             'Local Storage',
            'perm.notifications':       'Notifications',
            'perm.granted':             'Granted',
            'perm.denied':              'Denied',

            // Number information
            'number.label':             'Cuban mobile number',
            'number.count.singular':    '1 number',
            'number.count.plural':      '{count} numbers',
            'number.counter':           '{count} number{plural}',

            // Default messages
            'message.default':          'Hi, I saw your number on the anonymous network. Wanna chat?',
            'message.placeholder':      'Type your custom message...',
            'message.maxLength':        'Maximum 300 characters',

            // Beta features
            'beta.title':               'Beta Mode',
            'beta.description':         'Participate in experimental features before official release.',
            'beta.enable':              'Enable Beta Mode',
            'beta.disable':             'Disable Beta Mode',
            'beta.features':            'Available Features',
            'beta.feature.advanced':    'Advanced Generator',
            'beta.feature.analytics':   'Contact Analytics',
            'beta.feature.themes':      'Custom Themes',
            'beta.feature.notifications':'Enhanced Notifications',
            'beta.feature.incognito':   'Incognito Mode',

            // General information
            'info.whatsapp':            'Contact via WhatsApp',
            'info.telegram':            'Contact via Telegram',
            'info.channel':             'Official WhatsApp Channel',
            'info.version':             'Version',
            'info.about':               'About',
            'info.help':                'Help',
            'info.feedback':            'Report Issue',

            // Themes
            'theme.greenblue':          'Green / Blue',
            'theme.neon':               'Neon',
            'theme.sunset':             'Sunset',
            'theme.ocean':              'Ocean',
            'theme.purple':             'Purple',
            'theme.random':             'Random',

            // Generator
            'generator.desc':           'Generate random Cuban mobile numbers to start anonymous conversations.',
            'generator.count_label':    'Amount to generate',
            'generator.btn':            'Generate now',

            // Favorites
            'favorites.empty':          'You have no saved favorites yet.',

            // Settings
            'settings.notifications':       'Notifications',
            'settings.notifications_desc':  'Receive alerts for new contacts',
            'settings.autoload':            'Auto-load',
            'settings.autoload_desc':       'Load more numbers on scroll',
            'settings.animations':          'Animations',
            'settings.animations_desc':     'Visual transition effects',
            'settings.haptics':             'Vibration (haptics)',
            'settings.haptics_desc':        'Tactile feedback when copying',
            'settings.clear_data':          'Clear data',
            'settings.clear_data_desc':     'Delete saved history and favorites',
            'settings.clear_btn':           'Clear',

            // Statistics
            'stats.total_generated':    'Numbers generated',
            'stats.total_copied':       'Numbers copied',
            'stats.whatsapp_opened':    'WhatsApp opened',
            'stats.telegram_opened':    'Telegram opened',
            'stats.favorites':          'Saved favorites',
            'stats.session_time':       'Session time',
            'stats.reset':              'Reset statistics',

            // Privacy
            'privacy.p1':               'We do not store or process personal data of number owners. Only contact numbers are shown anonymously. Use of the platform is at your own risk.',
            'privacy.p2':               'We do not use tracking cookies or share information with third parties. Session data is stored only on your device and deleted when you close the browser.',
            'privacy.p3':               'This platform does not collect personally identifiable information. Generated numbers are random and not linked to real people.',

            // Terms
            'terms.intro':              'By using this platform, you agree that:',
            'terms.item1_title':        'Responsible use:',
            'terms.item1':              'It is prohibited to use the platform for spam, harassment, extortion, fraud, or any illegal activity.',
            'terms.item2_title':        'Disclaimer:',
            'terms.item2':              'We are not responsible for misuse of the information provided.',
            'terms.item3_title':        'Generated numbers:',
            'terms.item3':              'Numbers are generated algorithmically. We do not guarantee their availability or real activity.',
            'terms.item4_title':        'Reserved rights:',
            'terms.item4':              'We reserve the right to modify or discontinue the service at any time.',

            // About
            'about.desc':               'Progressive web platform for generating and managing anonymous contacts securely and privately.',
            'about.feature_offline':    'Works offline',
            'about.feature_installable':'Installable on your device',
            'about.feature_secure':     'Secure and private',
            'about.feature_fast':       'Fast and lightweight',
            'about.pwa_status':         'PWA Status:',
            'about.sw_status':          'Service Worker:',
            'about.cache_size':         'Cache:',

            // Footer
            'footer.install_pwa':       'Install App',
            'footer.pwa_installed':     'App Installed',
            'footer.disclaimer':        'Use at your own risk',
        },
    });

    /* ── Estado ──────────────────────────────────────────────── */
    let currentLanguage = _loadLanguage();

    /* ── Funciones Privadas ──────────────────────────────────── */

    function _loadLanguage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
                return saved;
            }
        } catch (_) {}

        const browserLang = navigator.language.split('-')[0];
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
            return browserLang;
        }
        return DEFAULT_LANGUAGE;
    }

    function _interpolate(text, params) {
        if (!params || typeof text !== 'string') return text;
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    function _updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key    = el.getAttribute('data-i18n');
            const params = el.getAttribute('data-i18n-params');
            const text   = t(key, params ? JSON.parse(params) : undefined);
            el.textContent = text;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            el.title = t(el.getAttribute('data-i18n-title'));
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
        });

        // Actualizar atributo lang del html
        document.documentElement.lang = currentLanguage;

        // Actualizar label del botón de idioma en el header
        const langLabel = document.getElementById('langLabel');
        if (langLabel) {
            langLabel.textContent = currentLanguage.toUpperCase();
        }

        // Actualizar tarjetas de idioma en la sección
        document.querySelectorAll('.lang-card[data-lang]').forEach(card => {
            const isActive = card.getAttribute('data-lang') === currentLanguage;
            card.classList.toggle('lang-card--active', isActive);
            card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    /* ── API Pública ─────────────────────────────────────────── */

    function t(key, params) {
        const dict = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
        const text = dict[key] || translations[DEFAULT_LANGUAGE][key] || key;
        return _interpolate(text, params);
    }

    function getLanguage() {
        return currentLanguage;
    }

    function setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            console.warn('[i18n] Idioma no soportado:', lang);
            return false;
        }

        currentLanguage = lang;

        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (_) {}

        _updateDOM();

        window.dispatchEvent(new CustomEvent('languagechange', {
            detail: { language: lang },
        }));

        console.log('[i18n] Idioma cambiado a:', lang);
        return true;
    }

    function getSupportedLanguages() {
        return [...SUPPORTED_LANGUAGES];
    }

    function init() {
        // Vincular botón de idioma del header
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const next = currentLanguage === 'es' ? 'en' : 'es';
                setLanguage(next);
            });
        }

        // Vincular tarjetas de idioma en la sección
        document.querySelectorAll('.lang-card[data-lang]').forEach(card => {
            card.addEventListener('click', () => {
                const lang = card.getAttribute('data-lang');
                setLanguage(lang);
            });
        });

        _updateDOM();
        console.log('[i18n] Sistema de idiomas inicializado. Idioma:', currentLanguage);
    }

    /* ── Exportación ─────────────────────────────────────────── */
    global.i18n = Object.freeze({
        t,
        getLanguage,
        setLanguage,
        getSupportedLanguages,
        init,
    });

    // Auto-inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
