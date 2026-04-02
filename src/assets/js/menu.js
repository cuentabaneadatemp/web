/**
 * menu.js — Módulo del Menú Principal y Navegación por Secciones
 * Contactos Anónimos v4.0
 *
 * Gestiona:
 *   1. Apertura/cierre del menú lateral
 *   2. Navegación entre secciones
 *   3. Estado activo de items del menú
 *   4. Integración con idioma y temas
 *   5. Accesos directos del footer
 *
 * @module MENU
 * @version 4.0
 */

(function (global) {
    'use strict';

    /* ── Estado ──────────────────────────────────────────────── */
    const state = {
        isOpen: false,
        currentSection: 'contacts',
    };

    const SECTION_KEY = '_ca_last_section';

    /* ── Referencias DOM ─────────────────────────────────────── */
    let menu, overlay, openBtns, closeBtn, menuItems, sections;

    /* ── Inicialización ──────────────────────────────────────── */
    function init() {
        menu      = document.getElementById('mainMenu');
        overlay   = document.getElementById('menuOverlay');
        closeBtn  = document.getElementById('closeMenuBtn');
        openBtns  = document.querySelectorAll('#openMenuBtn, #openMenuBtnDesktop');
        menuItems = document.querySelectorAll('.menu-item[data-section]');
        sections  = document.querySelectorAll('.app-section');

        if (!menu) return;

        _bindEvents();
        _restoreSection();
        _updatePWAStatus();

        // Vincular botones del footer a secciones
        _bindFooterLinks();

        // Vincular botón de instalación PWA del menú
        const menuInstallBtn = document.getElementById('menuInstallPWA');
        if (menuInstallBtn) {
            menuInstallBtn.addEventListener('click', () => {
                closeMenu();
                if (global.PWA_INSTALL) {
                    global.PWA_INSTALL.installPWA();
                }
            });
        }

        // Botón de canal WhatsApp del menú
        const menuShareBtn = document.getElementById('menuShareChannel');
        if (menuShareBtn) {
            menuShareBtn.addEventListener('click', () => {
                closeMenu();
                const shareBtn = document.getElementById('shareWhatsAppChannel');
                if (shareBtn) shareBtn.click();
            });
        }

        // Botón instalar en sección "Acerca de"
        const aboutInstallBtn = document.getElementById('installPWABtnAbout');
        if (aboutInstallBtn) {
            aboutInstallBtn.addEventListener('click', () => {
                if (global.PWA_INSTALL) {
                    global.PWA_INSTALL.installPWA();
                }
            });
        }

        // Actualizar badge de idioma
        _updateLangBadge();

        // Escuchar cambios de idioma
        window.addEventListener('languagechange', _updateLangBadge);

        console.log('[MENU] Módulo inicializado');
    }

    /* ── Vincular eventos ────────────────────────────────────── */
    function _bindEvents() {
        // Botones de apertura
        openBtns.forEach(btn => {
            btn.addEventListener('click', toggleMenu);
        });

        // Botón de cierre
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
        }

        // Overlay (clic fuera)
        if (overlay) {
            overlay.addEventListener('click', closeMenu);
        }

        // Tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isOpen) {
                closeMenu();
            }
        });

        // Items del menú
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                navigateTo(section);
                closeMenu();
            });
        });
    }

    /* ── Vincular links del footer ───────────────────────────── */
    function _bindFooterLinks() {
        const openPrivacy = document.getElementById('openPrivacy');
        const openTerms   = document.getElementById('openTerms');

        if (openPrivacy) {
            openPrivacy.addEventListener('click', () => navigateTo('privacy'));
        }
        if (openTerms) {
            openTerms.addEventListener('click', () => navigateTo('terms'));
        }
    }

    /* ── Abrir/cerrar menú ───────────────────────────────────── */
    function openMenu() {
        state.isOpen = true;
        menu.classList.add('is-open');
        menu.setAttribute('aria-hidden', 'false');
        overlay.classList.add('is-visible');
        overlay.setAttribute('aria-hidden', 'false');

        // Actualizar botones de apertura
        openBtns.forEach(btn => {
            btn.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
        });

        // Enfocar el menú para accesibilidad
        menu.focus();

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        state.isOpen = false;
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('is-visible');
        overlay.setAttribute('aria-hidden', 'true');

        openBtns.forEach(btn => {
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
        });

        document.body.style.overflow = '';
    }

    function toggleMenu() {
        if (state.isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /* ── Navegación entre secciones ──────────────────────────── */
    function navigateTo(sectionId) {
        if (state.currentSection === sectionId) return;

        // Ocultar sección actual
        const currentEl = document.getElementById(`section-${state.currentSection}`);
        if (currentEl) {
            currentEl.hidden = true;
            currentEl.classList.remove('app-section--active');
        }

        // Mostrar nueva sección
        const newEl = document.getElementById(`section-${sectionId}`);
        if (newEl) {
            newEl.hidden = false;
            newEl.classList.add('app-section--active');
            newEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Actualizar estado activo en el menú
        menuItems.forEach(item => {
            const isActive = item.getAttribute('data-section') === sectionId;
            item.classList.toggle('menu-item--active', isActive);
            if (isActive) {
                item.setAttribute('aria-current', 'page');
            } else {
                item.removeAttribute('aria-current');
            }
        });

        state.currentSection = sectionId;

        // Guardar sección actual
        try {
            sessionStorage.setItem(SECTION_KEY, sectionId);
        } catch (_) {}

        // Actualizar estado PWA si se navega a "Acerca de"
        if (sectionId === 'about') {
            _updateAboutPWAInfo();
        }

        // Actualizar estadísticas si se navega a "stats"
        if (sectionId === 'stats') {
            _updateStats();
        }

        console.log('[MENU] Navegando a sección:', sectionId);
    }

    /* ── Restaurar sección ───────────────────────────────────── */
    function _restoreSection() {
        try {
            const saved = sessionStorage.getItem(SECTION_KEY);
            if (saved && document.getElementById(`section-${saved}`)) {
                // Solo restaurar si no es la sección por defecto
                if (saved !== 'contacts') {
                    navigateTo(saved);
                }
            }
        } catch (_) {}
    }

    /* ── Actualizar badge de idioma ──────────────────────────── */
    function _updateLangBadge() {
        const badge = document.getElementById('menuLangBadge');
        if (badge && global.i18n) {
            badge.textContent = global.i18n.getLanguage().toUpperCase();
        }
    }

    /* ── Actualizar estado PWA en el menú ────────────────────── */
    function _updatePWAStatus() {
        const statusText = document.getElementById('menuPWAStatusText');
        if (!statusText) return;

        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true;

        if (isInstalled) {
            statusText.textContent = 'PWA Instalada';
        } else {
            statusText.textContent = 'Web';
        }
    }

    /* ── Actualizar info PWA en sección "Acerca de" ──────────── */
    function _updateAboutPWAInfo() {
        const pwaStatusEl  = document.getElementById('aboutPWAStatusValue');
        const swStatusEl   = document.getElementById('aboutSWStatus');
        const cacheSizeEl  = document.getElementById('aboutCacheSize');

        const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true;

        if (pwaStatusEl) {
            pwaStatusEl.textContent = isInstalled ? 'Instalada' : 'No instalada';
            pwaStatusEl.style.color = isInstalled ? 'var(--primary-wa)' : 'var(--text-muted)';
        }

        if (swStatusEl) {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                swStatusEl.textContent = 'Activo';
                swStatusEl.style.color = 'var(--primary-wa)';
            } else if ('serviceWorker' in navigator) {
                swStatusEl.textContent = 'Registrado';
                swStatusEl.style.color = '#fbbf24';
            } else {
                swStatusEl.textContent = 'No disponible';
                swStatusEl.style.color = 'var(--text-muted)';
            }
        }

        if (cacheSizeEl) {
            if (global.PWA_SECURITY) {
                global.PWA_SECURITY.getCacheSize().then(size => {
                    cacheSizeEl.textContent = size > 0
                        ? `${(size / 1024).toFixed(1)} KB`
                        : 'Vacío';
                }).catch(() => {
                    cacheSizeEl.textContent = 'N/A';
                });
            } else {
                cacheSizeEl.textContent = 'N/A';
            }
        }
    }

    /* ── Actualizar estadísticas ─────────────────────────────── */
    function _updateStats() {
        try {
            const stats = JSON.parse(localStorage.getItem('_ca_stats_v4') || '{}');

            const fields = {
                statTotalGenerated: stats.generated || 0,
                statTotalCopied:    stats.copied    || 0,
                statWhatsappOpened: stats.whatsapp  || 0,
                statTelegramOpened: stats.telegram  || 0,
                statFavorites:      stats.favorites || 0,
            };

            Object.entries(fields).forEach(([id, val]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = val;
            });

            // Tiempo de sesión
            const sessionEl = document.getElementById('statSessionTime');
            if (sessionEl && global._sessionStart) {
                const mins = Math.floor((Date.now() - global._sessionStart) / 60000);
                sessionEl.textContent = mins > 0 ? `${mins}m` : '<1m';
            }
        } catch (_) {}

        // Favoritos desde DB
        if (global.DB) {
            const favEl = document.getElementById('statFavorites');
            if (favEl) {
                try {
                    const favs = global.DB.getFavorites ? global.DB.getFavorites() : [];
                    favEl.textContent = favs.length;
                    // Actualizar badge del menú
                    const badge = document.getElementById('menuFavsBadge');
                    if (badge) badge.textContent = favs.length;
                } catch (_) {}
            }
        }
    }

    /* ── Actualizar badge de contactos ───────────────────────── */
    function updateContactsBadge(count) {
        const badge = document.getElementById('menuContactsBadge');
        if (badge) badge.textContent = count;
    }

    /* ── Exportación ─────────────────────────────────────────── */
    global.MENU = Object.freeze({
        init,
        openMenu,
        closeMenu,
        toggleMenu,
        navigateTo,
        updateContactsBadge,
    });

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(window);
