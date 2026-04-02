/**
 * i18n.js — Sistema de Internacionalización
 * Contactos Anónimos v2.0
 *
 * Gestiona la traducción de la interfaz entre español e inglés.
 * Proporciona funciones para obtener traducciones, cambiar idioma
 * y persistir la preferencia del usuario.
 *
 * @module i18n
 * @version 2.0
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
            'header.title': 'Contactos Anónimos',
            'header.subtitle': 'Conecta sin límites',
            'header.description': 'Millones de números móviles reales para chatear',
            'header.theme.greenblue': 'Verde/Azul',
            'header.theme.random': 'Aleatorio',
            'header.language': 'Idioma',
            'header.beta': 'Modo Beta',

            // Botones principales
            'btn.search': 'Buscar',
            'btn.reset': 'Reiniciar',
            'btn.loadMore': 'Cargar más',
            'btn.copy': 'Copiar',
            'btn.whatsapp': 'WhatsApp',
            'btn.telegram': 'Telegram',
            'btn.share': 'Compartir Canal',
            'btn.accept': 'Aceptar',
            'btn.decline': 'Rechazar',
            'btn.retry': 'Reintentar',
            'btn.close': 'Cerrar',
            'btn.feedback': 'Enviar Feedback',

            // Secciones principales
            'section.contacts': 'Contactos Disponibles',
            'section.message': 'Mensaje Personalizado',
            'section.privacy': 'Privacidad y Seguridad',
            'section.permissions': 'Permisos Requeridos',
            'section.beta': 'Características Experimentales',

            // Mensajes de estado
            'status.loading': 'Cargando...',
            'status.generating': 'Generando...',
            'status.empty': 'No hay números. Usa "Buscar" o "Cargar más".',
            'status.error': 'Error al generar números. Inténtalo de nuevo.',
            'status.copied': 'Copiado al portapapeles',
            'status.failed': 'No se pudo copiar',
            'status.noMore': 'No hay más números únicos disponibles.',

            // Modales
            'modal.terms.title': 'Términos y Condiciones',
            'modal.terms.content': 'Al usar esta plataforma aceptas nuestros términos y condiciones.',
            'modal.privacy.title': 'Política de Privacidad',
            'modal.privacy.content': 'Tu privacidad es importante. No recolectamos datos personales.',
            'modal.permissions.title': 'Permisos Requeridos',
            'modal.permissions.content': 'Necesitamos los siguientes permisos para funcionar:',
            'modal.blocked.title': 'Acceso Denegado',
            'modal.blocked.vpn': '❌ VPN o Proxy detectado. Por favor desactívalo.',
            'modal.blocked.location': '❌ Tu ubicación no está permitida.',
            'modal.blocked.outside': '❌ Has salido de la región permitida.',
            'modal.loading.title': 'Verificando acceso...',

            // Permisos
            'perm.geolocation': 'Geolocalización',
            'perm.storage': 'Almacenamiento Local',
            'perm.notifications': 'Notificaciones',
            'perm.granted': 'Concedido',
            'perm.denied': 'Rechazado',

            // Información de números
            'number.label': 'Número móvil cubano',
            'number.count.singular': '1 número',
            'number.count.plural': '{count} números',
            'number.counter': '{count} número{plural}',

            // Mensajes por defecto
            'message.default': 'Hola, vi tu número en la red anónima. ¿Charlamos?',
            'message.placeholder': 'Escribe tu mensaje personalizado...',
            'message.maxLength': 'Máximo 300 caracteres',

            // Características beta
            'beta.title': 'Modo Beta',
            'beta.description': 'Participa en características experimentales',
            'beta.enable': 'Habilitar Modo Beta',
            'beta.disable': 'Deshabilitar Modo Beta',
            'beta.features': 'Características Disponibles',
            'beta.feature.advanced': 'Generador Avanzado',
            'beta.feature.analytics': 'Análisis de Contactos',
            'beta.feature.themes': 'Temas Personalizados',
            'beta.feature.notifications': 'Notificaciones Mejoradas',
            'beta.feature.incognito': 'Modo Incógnito',

            // Información general
            'info.whatsapp': 'Contactar por WhatsApp',
            'info.telegram': 'Contactar por Telegram',
            'info.channel': 'Canal oficial de WhatsApp',
            'info.version': 'Versión',
            'info.about': 'Acerca de',
            'info.help': 'Ayuda',
            'info.feedback': 'Reportar Problema',
        },

        en: {
            // Header and navigation
            'header.title': 'Anonymous Contacts',
            'header.subtitle': 'Connect Without Limits',
            'header.description': 'Millions of real mobile numbers to chat',
            'header.theme.greenblue': 'Green/Blue',
            'header.theme.random': 'Random',
            'header.language': 'Language',
            'header.beta': 'Beta Mode',

            // Main buttons
            'btn.search': 'Search',
            'btn.reset': 'Reset',
            'btn.loadMore': 'Load More',
            'btn.copy': 'Copy',
            'btn.whatsapp': 'WhatsApp',
            'btn.telegram': 'Telegram',
            'btn.share': 'Share Channel',
            'btn.accept': 'Accept',
            'btn.decline': 'Decline',
            'btn.retry': 'Retry',
            'btn.close': 'Close',
            'btn.feedback': 'Send Feedback',

            // Main sections
            'section.contacts': 'Available Contacts',
            'section.message': 'Custom Message',
            'section.privacy': 'Privacy & Security',
            'section.permissions': 'Required Permissions',
            'section.beta': 'Experimental Features',

            // Status messages
            'status.loading': 'Loading...',
            'status.generating': 'Generating...',
            'status.empty': 'No numbers. Use "Search" or "Load More".',
            'status.error': 'Error generating numbers. Try again.',
            'status.copied': 'Copied to clipboard',
            'status.failed': 'Failed to copy',
            'status.noMore': 'No more unique numbers available.',

            // Modals
            'modal.terms.title': 'Terms and Conditions',
            'modal.terms.content': 'By using this platform you accept our terms and conditions.',
            'modal.privacy.title': 'Privacy Policy',
            'modal.privacy.content': 'Your privacy is important. We do not collect personal data.',
            'modal.permissions.title': 'Required Permissions',
            'modal.permissions.content': 'We need the following permissions to work:',
            'modal.blocked.title': 'Access Denied',
            'modal.blocked.vpn': '❌ VPN or Proxy detected. Please disable it.',
            'modal.blocked.location': '❌ Your location is not allowed.',
            'modal.blocked.outside': '❌ You have left the allowed region.',
            'modal.loading.title': 'Verifying access...',

            // Permissions
            'perm.geolocation': 'Geolocation',
            'perm.storage': 'Local Storage',
            'perm.notifications': 'Notifications',
            'perm.granted': 'Granted',
            'perm.denied': 'Denied',

            // Number information
            'number.label': 'Cuban mobile number',
            'number.count.singular': '1 number',
            'number.count.plural': '{count} numbers',
            'number.counter': '{count} number{plural}',

            // Default messages
            'message.default': 'Hi, I saw your number on the anonymous network. Wanna chat?',
            'message.placeholder': 'Type your custom message...',
            'message.maxLength': 'Maximum 300 characters',

            // Beta features
            'beta.title': 'Beta Mode',
            'beta.description': 'Participate in experimental features',
            'beta.enable': 'Enable Beta Mode',
            'beta.disable': 'Disable Beta Mode',
            'beta.features': 'Available Features',
            'beta.feature.advanced': 'Advanced Generator',
            'beta.feature.analytics': 'Contact Analytics',
            'beta.feature.themes': 'Custom Themes',
            'beta.feature.notifications': 'Enhanced Notifications',
            'beta.feature.incognito': 'Incognito Mode',

            // General information
            'info.whatsapp': 'Contact via WhatsApp',
            'info.telegram': 'Contact via Telegram',
            'info.channel': 'Official WhatsApp Channel',
            'info.version': 'Version',
            'info.about': 'About',
            'info.help': 'Help',
            'info.feedback': 'Report Issue',
        },
    });

    /* ── Estado ──────────────────────────────────────────────── */

    let currentLanguage = _loadLanguage();

    /* ── Funciones Privadas ──────────────────────────────────── */

    /**
     * Carga el idioma guardado o detecta el del navegador.
     * @returns {string} Código de idioma ('es' o 'en')
     */
    function _loadLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
            return saved;
        }

        const browserLang = navigator.language.split('-')[0];
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
            return browserLang;
        }

        return DEFAULT_LANGUAGE;
    }

    /**
     * Reemplaza placeholders en una cadena de traducción.
     * @param {string} text - Texto con placeholders {key}
     * @param {object} params - Objeto con valores para reemplazar
     * @returns {string} Texto con placeholders reemplazados
     */
    function _interpolate(text, params) {
        if (!params || typeof text !== 'string') return text;
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Actualiza todos los elementos con atributo data-i18n.
     */
    function _updateDOM() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const params = el.getAttribute('data-i18n-params');
            const text = t(key, params ? JSON.parse(params) : undefined);
            el.textContent = text;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            const text = t(key);
            el.placeholder = text;
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.getAttribute('data-i18n-title');
            const text = t(key);
            el.title = text;
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria-label');
            const text = t(key);
            el.setAttribute('aria-label', text);
        });
    }

    /**
     * Emite evento personalizado cuando cambia el idioma.
     */
    function _emitChangeEvent() {
        const event = new CustomEvent('languagechange', {
            detail: { language: currentLanguage },
        });
        window.dispatchEvent(event);
    }

    /* ── API Pública ─────────────────────────────────────────── */

    /**
     * Obtiene una traducción por clave.
     * @param {string} key - Clave de traducción (ej: 'btn.search')
     * @param {object} [params] - Parámetros para interpolación
     * @returns {string} Texto traducido
     */
    function t(key, params) {
        const dict = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
        let text = dict[key] || key;

        if (params) {
            text = _interpolate(text, params);
        }

        return text;
    }

    /**
     * Obtiene el idioma actual.
     * @returns {string} Código de idioma
     */
    function getLanguage() {
        return currentLanguage;
    }

    /**
     * Cambia el idioma actual.
     * @param {string} lang - Código de idioma ('es' o 'en')
     */
    function setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) {
            console.warn(`[i18n] Idioma no soportado: ${lang}`);
            return;
        }

        currentLanguage = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        _updateDOM();
        _emitChangeEvent();
    }

    /**
     * Obtiene lista de idiomas soportados.
     * @returns {Array<string>} Array de códigos de idioma
     */
    function getSupportedLanguages() {
        return Array.from(SUPPORTED_LANGUAGES);
    }

    /**
     * Inicializa el sistema i18n.
     * Debe llamarse al cargar la página.
     */
    function init() {
        document.documentElement.lang = currentLanguage;
        _updateDOM();
    }

    /* ── Exportación ─────────────────────────────────────────── */

    global.i18n = Object.freeze({
        t,
        getLanguage,
        setLanguage,
        getSupportedLanguages,
        init,
    });

})(window);
