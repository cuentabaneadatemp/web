/**
 * main.js — Lógica Principal de la Interfaz
 * Contactos Anónimos v2.0
 *
 * Gestiona el estado de la aplicación, la interacción con el DOM,
 * los modales, los temas visuales y la integración con los módulos
 * API, DB, GEO y PERMISSIONS.
 *
 * Dependencias (deben cargarse antes en este orden):
 *   1. security.js  — Protecciones de seguridad del lado del cliente
 *   2. geo.js       — Geolocalización y geobloqueo
 *   3. permissions.js — Solicitud de permisos del navegador
 *   4. db.js        — Persistencia local (sessionStorage / localStorage)
 *   5. api.js       — Generación de números cubanos
 *
 * @module main
 * @version 2.0
 */

(function () {
    'use strict';

    /* ── Configuración ───────────────────────────────────────── */

    /**
     * Configuración global inmutable de la aplicación.
     * @type {Readonly<object>}
     */
    const CONFIG = Object.freeze({
        /** Número de tarjetas por lote de carga */
        BATCH_SIZE:       5,
        /** URL del canal oficial de WhatsApp */
        WHATSAPP_CHANNEL: 'https://whatsapp.com/channel/0029VbCdMrUHgZWU8CQ6uu0h',
        /** Duración del toast en ms */
        TOAST_DURATION:   2200,
        /** Mensaje por defecto del input */
        DEFAULT_MESSAGE:  'Hola, vi tu número en la red anónima. ¿Charlamos?',
        /** Definición de temas visuales */
        THEMES: {
            greenblue: {
                gradStart:   '#0f172a',
                gradEnd:     '#03060c',
                accentColor: '#25D366',
                primaryWa:   '#25D366',
                primaryTg:   '#26A5E4',
            },
        },
    });

    /* ── Estado ──────────────────────────────────────────────── */

    /**
     * Estado mutable de la aplicación.
     * @type {object}
     */
    const state = {
        numbers:        [],
        usedSet:        new Set(),
        currentMessage: CONFIG.DEFAULT_MESSAGE,
        isLoading:      false,
        currentTheme:   'greenblue',
        toastTimer:     null,
    };

    /* ── Referencias al DOM ──────────────────────────────────── */

    /** Acceso rápido a elementos por ID */
    const $ = (id) => document.getElementById(id);

    /**
     * Mapa de referencias a elementos del DOM.
     * Centraliza todos los accesos para facilitar mantenimiento.
     * @type {object}
     */
    const DOM = {
        // Contenido principal
        phoneList:          $('phoneList'),
        counter:            $('numbersCounter'),
        customMsg:          $('customMsg'),
        searchBtn:          $('searchBtn'),
        resetBtn:           $('resetBtn'),
        loadMoreBtn:        $('loadMoreBtn'),
        // Modales de contenido
        acceptModal:        $('acceptTermsModal'),
        acceptBtn:          $('acceptTermsBtn'),
        privacyModal:       $('privacyModal'),
        termsModal:         $('termsModal'),
        openPrivacy:        $('openPrivacy'),
        openTerms:          $('openTerms'),
        // Modales de sistema
        loadingModal:       $('loadingPermissionsModal'),
        blockedModal:       $('blockedAccessModal'),
        permDeniedModal:    $('permissionsDeniedModal'),
        blockedReason:      $('blockedReason'),
        retryBtn:           $('retryPermissionsBtn'),
        // Indicadores de permisos
        permGeo:            $('perm-geo'),
        permStorage:        $('perm-storage'),
        permNotif:          $('perm-notif'),
        // UI general
        toast:              $('toastMsg'),
        themeGreenBlue:     $('themeGreenBlue'),
        themeRandom:        $('themeRandom'),
        shareChannel:       $('shareWhatsAppChannel'),
    };

    /* ── Utilidades ──────────────────────────────────────────── */

    /**
     * Escapa caracteres HTML especiales para prevenir XSS.
     * @param {string} str - Cadena a escapar
     * @returns {string} Cadena con caracteres HTML escapados
     */
    function escapeHtml(str) {
        if (!str) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(str).replace(/[&<>"']/g, (c) => map[c]);
    }

    /**
     * Muestra un mensaje toast temporal en la parte inferior de la pantalla.
     * @param {string} text              - Texto del mensaje
     * @param {number} [duration]        - Duración en ms (por defecto CONFIG.TOAST_DURATION)
     */
    function showToast(text, duration = CONFIG.TOAST_DURATION) {
        if (!DOM.toast) return;
        clearTimeout(state.toastTimer);
        // Intentar traducir si i18n está disponible
        const displayText = (typeof i18n !== 'undefined' && text.includes('.'))
            ? i18n.t(text, { plural: '' })
            : text;
        DOM.toast.textContent = displayText;
        DOM.toast.classList.add('show');
        state.toastTimer = setTimeout(() => {
            DOM.toast.classList.remove('show');
        }, duration);
    }

    /**
     * Copia texto al portapapeles usando la API moderna con fallback.
     * @param {string} text          - Texto a copiar
     * @param {string} [successMsg]  - Mensaje de éxito del toast
     */
    async function copyToClipboard(text, successMsg = 'Copiado al portapapeles') {
        try {
            await navigator.clipboard.writeText(text);
            showToast(successMsg);
        } catch (_) {
            showToast('No se pudo copiar');
        }
    }

    /* ── Renderizado ─────────────────────────────────────────── */

    /**
     * Construye el HTML de una tarjeta de número de teléfono.
     * @param {object} item - Objeto de número generado por API
     * @returns {string} HTML de la tarjeta
     */
    function buildPhoneCardHTML(item) {
        return `
            <div class="phone-card" data-id="${escapeHtml(item.id)}" role="listitem">
                <div class="phone-info">
                    <div class="phone-icon" aria-hidden="true">👤</div>
                    <div class="phone-details">
                        <div class="phone-number">${escapeHtml(item.formatted)}</div>
                        <div class="phone-label">Número móvil cubano</div>
                    </div>
                </div>
                <div class="chat-buttons">
                    <a href="${escapeHtml(item.waLink)}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="wa-btn"
                       aria-label="Contactar por WhatsApp al ${escapeHtml(item.formatted)}">
                        <i class="fab fa-whatsapp" aria-hidden="true"></i>
                        <span>WhatsApp</span>
                    </a>
                    <a href="${escapeHtml(item.telegramLink)}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="telegram-btn"
                       aria-label="Contactar por Telegram al ${escapeHtml(item.formatted)}">
                        <i class="fab fa-telegram" aria-hidden="true"></i>
                        <span>Telegram</span>
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Re-renderiza la lista completa de números en el DOM.
     * Actualiza también el contador de números disponibles.
     */
    function renderNumbers() {
        if (!DOM.phoneList) return;

        if (state.numbers.length === 0) {
            DOM.phoneList.setAttribute('aria-busy', 'false');
            DOM.phoneList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-phone-slash" aria-hidden="true"></i>
                    <span>No hay números. Usa "Buscar" o "Cargar más".</span>
                </div>`;
            if (DOM.counter) DOM.counter.textContent = '0 números';
            return;
        }

        DOM.phoneList.setAttribute('aria-busy', 'false');
        DOM.phoneList.innerHTML = state.numbers.map(buildPhoneCardHTML).join('');

        if (DOM.counter) {
            const n = state.numbers.length;
            DOM.counter.textContent = `${n} número${n !== 1 ? 's' : ''}`;
        }
    }

    /* ── Carga de números ────────────────────────────────────── */

    /**
     * Carga un lote de números nuevos y los añade o reemplaza en la lista.
     * @param {number}  [batchSize]   - Cantidad de números a cargar
     * @param {boolean} [reset=false] - Si true, reemplaza la lista actual
     */
    async function loadNumbers(batchSize = CONFIG.BATCH_SIZE, reset = false) {
        if (state.isLoading) return;
        state.isLoading = true;

        if (DOM.loadMoreBtn) {
            DOM.loadMoreBtn.disabled = true;
            DOM.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-pulse" aria-hidden="true"></i> <span>Generando...</span>';
        }

        try {
            const usedSet = reset ? new Set() : state.usedSet;
            const { newNumbers, usedSet: updatedSet } = API.generateUniqueNumbers(
                batchSize,
                usedSet,
                state.currentMessage
            );

            if (newNumbers.length === 0) {
                showToast('No hay más números únicos disponibles.', 3000);
                return;
            }

            // Registrar en historial y estadísticas
            if (typeof DB !== 'undefined') {
                newNumbers.forEach((n) => DB.History.add(n.raw));
                DB.Stats.increment('totalGenerated', newNumbers.length);
            }

            state.usedSet = updatedSet;
            state.numbers = reset ? newNumbers : [...state.numbers, ...newNumbers];

            renderNumbers();

        } catch (err) {
            console.error('[main] Error al generar números:', err);
            showToast('Error al generar números. Inténtalo de nuevo.', 3000);
        } finally {
            state.isLoading = false;
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.disabled = false;
                DOM.loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle" aria-hidden="true"></i> <span>Cargar más</span>';
            }
        }
    }

    /**
     * Reinicia la lista de números: limpia el historial y carga un nuevo lote.
     */
    function resetNumbers() {
        state.numbers = [];
        state.usedSet = new Set();

        if (typeof DB !== 'undefined') {
            DB.History.clear();
            DB.Stats.increment('totalResets');
        }

        renderNumbers();
        loadNumbers(CONFIG.BATCH_SIZE, true);
    }

    /**
     * Aplica el mensaje personalizado del input y recarga la lista.
     */
    function applySearch() {
        const msg = DOM.customMsg ? DOM.customMsg.value.trim() : '';
        state.currentMessage = msg || CONFIG.DEFAULT_MESSAGE;

        if (typeof DB !== 'undefined') {
            DB.Stats.increment('totalSearches');
        }

        resetNumbers();
    }

    /* ── Temas visuales ──────────────────────────────────────── */

    /**
     * Aplica un tema visual a la aplicación modificando las variables CSS.
     * Actualiza también el estado visual (aria-pressed) de los botones de tema.
     * @param {'greenblue'|'random'} theme - Identificador del tema a aplicar
     */
    function applyTheme(theme) {
        state.currentTheme = theme;
        const root = document.documentElement;

        if (theme === 'greenblue') {
            const t = CONFIG.THEMES.greenblue;
            root.style.setProperty('--primary-wa',   t.primaryWa);
            root.style.setProperty('--primary-tg',   t.primaryTg);
            root.style.setProperty('--accent-color', t.accentColor);
            root.style.setProperty('--grad-start',   t.gradStart);
            root.style.setProperty('--grad-end',     t.gradEnd);
            document.body.style.background = `radial-gradient(ellipse at 30% 10%, ${t.gradStart}, ${t.gradEnd})`;

        } else if (theme === 'experimental') {
            root.style.setProperty('--primary-wa',   '#00f2ff');
            root.style.setProperty('--primary-tg',   '#7000ff');
            root.style.setProperty('--accent-color', '#00f2ff');
            root.style.setProperty('--grad-start',   '#050505');
            root.style.setProperty('--grad-end',     '#000000');
            document.body.style.background = 'linear-gradient(180deg, #050505 0%, #000000 100%)';

        } else if (theme === 'random') {
            const hue1  = Math.floor(Math.random() * 360);
            const hue2  = (hue1 + 45) % 360;
            const sat   = 55 + Math.floor(Math.random() * 30);
            const light = 18 + Math.floor(Math.random() * 18);
            const accent = (hue1 + 180) % 360;
            const gStart = `hsl(${hue1}, ${sat}%, ${light}%)`;
            const gEnd   = `hsl(${hue2}, ${sat}%, ${Math.max(5, light - 10)}%)`;
            const aColor = `hsl(${accent}, 70%, 55%)`;

            root.style.setProperty('--accent-color', aColor);
            root.style.setProperty('--grad-start',   gStart);
            root.style.setProperty('--grad-end',     gEnd);
            document.body.style.background = `radial-gradient(ellipse at 30% 10%, ${gStart}, ${gEnd})`;
        }

        // Actualizar estado visual de los botones de tema
        if (DOM.themeGreenBlue) {
            const isActive = theme === 'greenblue';
            DOM.themeGreenBlue.classList.toggle('active', isActive);
            DOM.themeGreenBlue.setAttribute('aria-pressed', String(isActive));
        }
        if (DOM.themeRandom) {
            const isActive = theme === 'random';
            DOM.themeRandom.classList.toggle('active', isActive);
            DOM.themeRandom.setAttribute('aria-pressed', String(isActive));
        }
    }

    /* ── Canal de WhatsApp ───────────────────────────────────── */

    /**
     * Comparte el enlace del canal de WhatsApp usando la Web Share API
     * o copiándolo al portapapeles como fallback.
     */
    function shareWhatsAppChannel() {
        const url = CONFIG.WHATSAPP_CHANNEL;

        if (navigator.share) {
            navigator.share({
                title: 'Canal de WhatsApp — Contactos Anónimos',
                text:  'Únete al canal oficial de Contactos Anónimos',
                url,
            }).catch(() => copyToClipboard(url, 'Enlace copiado al portapapeles'));
        } else {
            copyToClipboard(url, 'Enlace copiado al portapapeles');
        }
    }

    /* ── Modales ─────────────────────────────────────────────── */

    /**
     * Abre un modal y enfoca el primer elemento interactivo.
     * @param {HTMLElement|null} modal - Elemento del modal a abrir
     */
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        const focusable = modal.querySelector('button, [tabindex="0"], a[href]');
        if (focusable) setTimeout(() => focusable.focus(), 50);
    }

    /**
     * Cierra un modal.
     * @param {HTMLElement|null} modal - Elemento del modal a cerrar
     */
    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    /**
     * Inicializa los modales de contenido (términos, privacidad).
     * Verifica si el usuario ya aceptó los términos para omitir el modal.
     */
    function initModals() {
        const alreadyAccepted = (typeof DB !== 'undefined')
            ? DB.Terms.hasAccepted()
            : false;

        if (!alreadyAccepted) {
            openModal(DOM.acceptModal);
        } else {
            loadNumbers(CONFIG.BATCH_SIZE, true);
        }

        // Aceptar términos
        if (DOM.acceptBtn) {
            DOM.acceptBtn.addEventListener('click', () => {
                if (typeof DB !== 'undefined') DB.Terms.accept();
                closeModal(DOM.acceptModal);
                loadNumbers(CONFIG.BATCH_SIZE, true);
            });
        }

        // Abrir modales de información
        if (DOM.openPrivacy) {
            DOM.openPrivacy.addEventListener('click', () => openModal(DOM.privacyModal));
        }

        if (DOM.openTerms) {
            DOM.openTerms.addEventListener('click', () => openModal(DOM.termsModal));
        }

        // Cerrar modales con botón de cierre
        document.querySelectorAll('.modal-close').forEach((btn) => {
            btn.addEventListener('click', () => {
                closeModal(DOM.privacyModal);
                closeModal(DOM.termsModal);
            });
        });

        // Cerrar al hacer clic en el overlay (fuera del contenido)
        [DOM.privacyModal, DOM.termsModal].forEach((overlay) => {
            if (!overlay) return;
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal(overlay);
            });
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal(DOM.privacyModal);
                closeModal(DOM.termsModal);
            }
        });
    }

    /* ── Eventos ─────────────────────────────────────────────── */

    /**
     * Registra todos los event listeners de la interfaz principal.
     */
    function bindEvents() {
        if (DOM.searchBtn)      DOM.searchBtn.addEventListener('click', applySearch);
        if (DOM.resetBtn)       DOM.resetBtn.addEventListener('click', resetNumbers);
        if (DOM.loadMoreBtn)    DOM.loadMoreBtn.addEventListener('click', () => loadNumbers(CONFIG.BATCH_SIZE, false));
        if (DOM.themeGreenBlue) DOM.themeGreenBlue.addEventListener('click', () => applyTheme('greenblue'));
        if (DOM.themeRandom)    DOM.themeRandom.addEventListener('click', () => applyTheme('random'));
        if (DOM.shareChannel)   DOM.shareChannel.addEventListener('click', shareWhatsAppChannel);

        // Botón de descarga de APK
        const downloadAPKBtn = document.getElementById('downloadAPKBtn');
        if (downloadAPKBtn && typeof window.APKDownloadManager !== 'undefined') {
            downloadAPKBtn.addEventListener('click', () => {
                window.APKDownloadManager.downloadAPK();
            });
        }

        // Escuchar cambios de idioma
        if (typeof window !== 'undefined') {
            window.addEventListener('languagechange', () => {
                renderNumbers();
            });
        }

        // Buscar al presionar Enter en el campo de mensaje
        if (DOM.customMsg) {
            DOM.customMsg.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') applySearch();
            });
        }

        // Reintentar permisos
        if (DOM.retryBtn) {
            DOM.retryBtn.addEventListener('click', () => {
                closeModal(DOM.permDeniedModal);
                // Revocar caché de permisos para forzar nueva solicitud
                if (typeof PERMISSIONS !== 'undefined') {
                    PERMISSIONS.revokePermissionsCache();
                }
                location.reload();
            });
        }
    }

    /* ── Verificación de Acceso (Geobloqueo + Permisos) ─────── */

    /**
     * Actualiza el indicador visual de un permiso en el modal de permisos rechazados.
     * @param {HTMLElement|null} el      - Elemento li del permiso
     * @param {boolean}          granted - true si fue concedido
     */
    function _updatePermissionIndicator(el, granted) {
        if (!el) return;
        const statusIcon = el.querySelector('.perm-status');
        el.classList.toggle('perm-granted', granted);
        el.classList.toggle('perm-denied', !granted);
        if (statusIcon) {
            statusIcon.className = granted
                ? 'fas fa-check-circle perm-status'
                : 'fas fa-times-circle perm-status';
        }
    }

    /**
     * Verifica los permisos del navegador y la ubicación geográfica
     * antes de permitir el acceso a la plataforma.
     *
     * Flujo:
     *   1. Muestra modal de carga
     *   2. Solicita permisos obligatorios (geo, storage, notificaciones)
     *   3. Si se rechazan → muestra modal de permisos rechazados
     *   4. Verifica geolocalización y detecta VPN
     *   5. Si está bloqueado → muestra modal de acceso denegado
     *   6. Si todo OK → oculta modal de carga y retorna true
     *
     * @returns {Promise<boolean>} true si se permite el acceso
     */
    async function checkAccessRequirements() {
        try {
            // Mostrar modal de carga
            openModal(DOM.loadingModal);

            // 1. Solicitar permisos obligatorios
            if (typeof PERMISSIONS !== 'undefined') {
                const permsResult = await PERMISSIONS.requestMandatoryPermissions();

                // Actualizar indicadores visuales
                _updatePermissionIndicator(DOM.permGeo,     permsResult.geolocation);
                _updatePermissionIndicator(DOM.permStorage, permsResult.storage);
                _updatePermissionIndicator(DOM.permNotif,   permsResult.notifications);

                if (!permsResult.allApproved) {
                    closeModal(DOM.loadingModal);
                    openModal(DOM.permDeniedModal);
                    return false;
                }
            }

            // 2. Verificar ubicación y detectar VPN
            if (typeof GEO !== 'undefined') {
                const geoResult = await GEO.init();

                if (!geoResult.allowed) {
                    const reason = geoResult.vpnDetected
                        ? '❌ VPN o Proxy detectado. Por favor desactívalo.'
                        : `❌ Tu ubicación (${geoResult.country || 'Desconocida'}) no está permitida.`;

                    if (DOM.blockedReason) {
                        DOM.blockedReason.textContent = reason;
                    }

                    closeModal(DOM.loadingModal);
                    openModal(DOM.blockedModal);
                    console.warn('[main] Acceso bloqueado:', reason);
                    return false;
                }

                // Iniciar monitoreo continuo de ubicación
                GEO.startMonitoring(
                    (location) => {
                        console.log('[main] Ubicación actualizada:', location);
                    },
                    (isBlocked) => {
                        if (isBlocked) {
                            console.error('[main] Usuario salió de Cuba — bloqueando acceso');
                            if (DOM.blockedReason) {
                                DOM.blockedReason.textContent = '❌ Has salido de la región permitida.';
                            }
                            openModal(DOM.blockedModal);
                            // Ocultar contenido principal
                            if (DOM.phoneList) DOM.phoneList.innerHTML = '';
                        }
                    }
                );
            }

            // Todo OK: ocultar modal de carga
            closeModal(DOM.loadingModal);
            return true;

        } catch (err) {
            console.error('[main] Error en verificación de acceso:', err);
            closeModal(DOM.loadingModal);
            return false;
        }
    }

    /* ── Inicialización ──────────────────────────────────────── */

    /**
     * Punto de entrada de la aplicación.
     * Inicializa la sesión, registra eventos, aplica el tema
     * y ejecuta la verificación de acceso.
     */
    function init() {
        // Inicializar internacionalización
        if (typeof i18n !== 'undefined') {
            i18n.init();
        }

        // Inicializar sesión en DB
        if (typeof DB !== 'undefined') {
            DB.Session.init();
        }

        bindEvents();
        bindLanguageToggle();
        bindBetaBannerGesture();
        bindBetaToggle();
        applyTheme('greenblue');

        // Verificar permisos y ubicación antes de mostrar la app
        checkAccessRequirements().then((allowed) => {
            if (allowed) {
                initModals();
            }
        });
    }

    /**
     * Vincula el botón de cambio de idioma.
     */
    function bindLanguageToggle() {
        const langToggle = document.getElementById('langToggle');
        if (!langToggle) return;

        langToggle.addEventListener('click', () => {
            const current = (typeof i18n !== 'undefined') ? i18n.getLanguage() : 'es';
            const next = current === 'es' ? 'en' : 'es';
            if (typeof i18n !== 'undefined') {
                i18n.setLanguage(next);
                const label = document.getElementById('langLabel');
                if (label) label.textContent = next.toUpperCase();
            }
        });

        // Establecer etiqueta inicial
        const label = document.getElementById('langLabel');
        if (label) {
            const current = (typeof i18n !== 'undefined') ? i18n.getLanguage() : 'es';
            label.textContent = current.toUpperCase();
        }
    }

    /**
     * Vincula el botón de modo beta.
     */
    /**
     * Vincula el banner de la plataforma para activar/desactivar el modo beta.
     * Un toque activa el modo beta.
     * Dos toques rápidos (doble toque) desactivan el modo beta.
     */
    function bindBetaBannerGesture() {
        const bannerLogo = document.querySelector('.css-logo');
        if (!bannerLogo || typeof BETA === 'undefined') return;

        let lastClickTime = 0;
        let clickTimeout = null;
        const DOUBLE_CLICK_DELAY = 300; // ms

        bannerLogo.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastClickTime;

            if (timeDiff < DOUBLE_CLICK_DELAY) {
                // DOBLE TOQUE: Desactivar modo beta
                if (clickTimeout) {
                    clearTimeout(clickTimeout);
                    clickTimeout = null;
                }
                BETA.setBetaMode(false);
                showToast('Modo Beta Desactivado', 2000);
            } else {
                // UN TOQUE: Programar activación si no hay segundo toque
                clickTimeout = setTimeout(() => {
                    if (!BETA.isBetaEnabled()) {
                        BETA.setBetaMode(true);
                        showToast('Modo Beta Activado — Estilo Experimental', 2000);
                    }
                    clickTimeout = null;
                }, DOUBLE_CLICK_DELAY);
            }

            lastClickTime = currentTime;
        });

        // Escuchar cambios globales de modo beta para aplicar el estilo experimental
        window.addEventListener('betamodechange', (e) => {
            const isEnabled = e.detail.enabled;
            document.body.classList.toggle('beta-mode-active', isEnabled);
            
            // Actualizar el tema si el modo beta está activado
            if (isEnabled) {
                applyTheme('experimental');
            } else {
                applyTheme('greenblue');
            }
        });

        // Inicializar estado si ya estaba guardado
        if (BETA.isBetaEnabled()) {
            document.body.classList.add('beta-mode-active');
        }
    }

    function bindBetaToggle() {
        const betaToggle = document.getElementById('betaToggle');
        if (!betaToggle) return;

        betaToggle.addEventListener('click', () => {
            if (typeof BetaPanel === 'undefined') return;
            BetaPanel.toggleBetaPanel();
        });

        // Escuchar cambios de modo beta para el botón (si existe)
        if (typeof window !== 'undefined') {
            window.addEventListener('betamodechange', (e) => {
                betaToggle.classList.toggle('active', e.detail.enabled);
                betaToggle.setAttribute('aria-pressed', String(e.detail.enabled));
            });
        }
    }

    // Arrancar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
