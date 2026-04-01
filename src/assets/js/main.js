/**
 * main.js — Lógica Principal de la Interfaz
 * Contactos Anónimos v2.0
 *
 * Gestiona el estado de la aplicación, la interacción con el DOM,
 * los modales, los temas visuales y la integración con los módulos
 * API y DB.
 */

(function () {
    'use strict';

    /* ── Configuración ───────────────────────────────────────── */
    const CONFIG = Object.freeze({
        BATCH_SIZE:          5,
        WHATSAPP_CHANNEL:    'https://whatsapp.com/channel/0029VbCdMrUHgZWU8CQ6uu0h',
        TOAST_DURATION:      2200,
        DEFAULT_MESSAGE:     'Hola, vi tu número en la red anónima. ¿Charlamos?',
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
    const state = {
        numbers:         [],
        usedSet:         new Set(),
        currentMessage:  CONFIG.DEFAULT_MESSAGE,
        isLoading:       false,
        currentTheme:    'greenblue',
        toastTimer:      null,
    };

    /* ── Referencias al DOM ──────────────────────────────────── */
    const $ = (id) => document.getElementById(id);

    const DOM = {
        phoneList:       $('phoneList'),
        counter:         $('numbersCounter'),
        customMsg:       $('customMsg'),
        searchBtn:       $('searchBtn'),
        resetBtn:        $('resetBtn'),
        loadMoreBtn:     $('loadMoreBtn'),
        acceptModal:     $('acceptTermsModal'),
        acceptBtn:       $('acceptTermsBtn'),
        privacyModal:    $('privacyModal'),
        termsModal:      $('termsModal'),
        openPrivacy:     $('openPrivacy'),
        openTerms:       $('openTerms'),
        toast:           $('toastMsg'),
        themeGreenBlue:  $('themeGreenBlue'),
        themeRandom:     $('themeRandom'),
        shareChannel:    $('shareWhatsAppChannel'),
    };

    /* ── Utilidades ──────────────────────────────────────────── */

    /**
     * Escapa caracteres HTML para prevenir XSS.
     * @param {string} str
     * @returns {string}
     */
    function escapeHtml(str) {
        if (!str) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(str).replace(/[&<>"']/g, (c) => map[c]);
    }

    /**
     * Muestra un mensaje toast temporal.
     * @param {string} text
     * @param {number} [duration]
     */
    function showToast(text, duration = CONFIG.TOAST_DURATION) {
        if (!DOM.toast) return;
        clearTimeout(state.toastTimer);
        DOM.toast.textContent = text;
        DOM.toast.classList.add('show');
        state.toastTimer = setTimeout(() => {
            DOM.toast.classList.remove('show');
        }, duration);
    }

    /**
     * Copia texto al portapapeles con fallback.
     * @param {string} text
     * @param {string} [successMsg]
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
     * Construye el HTML de una tarjeta de número.
     * @param {object} item
     * @returns {string}
     */
    function buildPhoneCardHTML(item) {
        return `
            <div class="phone-card" data-id="${escapeHtml(item.id)}" role="listitem">
                <div class="phone-info">
                    <div class="phone-icon" aria-hidden="true">👤</div>
                    <div>
                        <div class="phone-number">${escapeHtml(item.formatted)}</div>
                    </div>
                </div>
                <div class="chat-buttons">
                    <a href="${escapeHtml(item.waLink)}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="wa-btn"
                       aria-label="Contactar por WhatsApp al ${escapeHtml(item.formatted)}">
                        <i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp
                    </a>
                    <a href="${escapeHtml(item.telegramLink)}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="telegram-btn"
                       aria-label="Contactar por Telegram al ${escapeHtml(item.formatted)}">
                        <i class="fab fa-telegram" aria-hidden="true"></i> Telegram
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Re-renderiza la lista completa de números.
     */
    function renderNumbers() {
        if (!DOM.phoneList) return;

        if (state.numbers.length === 0) {
            DOM.phoneList.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:2.5rem; color:var(--text-muted);">
                    <i class="fas fa-phone-slash" style="font-size:2rem; margin-bottom:0.8rem; display:block;"></i>
                    No hay números. Usa "Buscar" o "Cargar más".
                </div>`;
            if (DOM.counter) DOM.counter.textContent = '0 números disponibles';
            return;
        }

        DOM.phoneList.innerHTML = state.numbers.map(buildPhoneCardHTML).join('');
        if (DOM.counter) {
            DOM.counter.textContent = `${state.numbers.length} número${state.numbers.length !== 1 ? 's' : ''} disponible${state.numbers.length !== 1 ? 's' : ''}`;
        }
    }

    /* ── Carga de números ────────────────────────────────────── */

    /**
     * Carga un lote de números nuevos.
     * @param {number}  [batchSize]
     * @param {boolean} [reset=false] - Si true, reemplaza la lista actual
     */
    async function loadNumbers(batchSize = CONFIG.BATCH_SIZE, reset = false) {
        if (state.isLoading) return;
        state.isLoading = true;

        if (DOM.loadMoreBtn) {
            DOM.loadMoreBtn.disabled = true;
            DOM.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-pulse" aria-hidden="true"></i> Generando...';
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

            // Registrar en historial de DB
            if (typeof DB !== 'undefined') {
                newNumbers.forEach((n) => DB.History.add(n.raw));
                DB.Stats.increment('totalGenerated', newNumbers.length);
            }

            state.usedSet = updatedSet;

            if (reset) {
                state.numbers = newNumbers;
            } else {
                state.numbers = [...state.numbers, ...newNumbers];
            }

            renderNumbers();

        } catch (err) {
            console.error('[main] Error al generar números:', err);
            showToast('Error al generar números. Inténtalo de nuevo.', 3000);
        } finally {
            state.isLoading = false;
            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.disabled = false;
                DOM.loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle" aria-hidden="true"></i> Cargar más';
            }
        }
    }

    /**
     * Reinicia la lista de números.
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
     * Aplica el mensaje personalizado y recarga.
     */
    function applySearch() {
        const msg = DOM.customMsg ? DOM.customMsg.value.trim() : '';
        state.currentMessage = msg || CONFIG.DEFAULT_MESSAGE;

        if (typeof DB !== 'undefined') {
            DB.Stats.increment('totalSearches');
        }

        resetNumbers();
    }

    /* ── Temas ───────────────────────────────────────────────── */

    /**
     * Aplica un tema visual.
     * @param {'greenblue'|'random'} theme
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

        } else if (theme === 'random') {
            const hue1    = Math.floor(Math.random() * 360);
            const hue2    = (hue1 + 45) % 360;
            const sat     = 55 + Math.floor(Math.random() * 30);
            const light   = 18 + Math.floor(Math.random() * 18);
            const accent  = (hue1 + 180) % 360;
            const gStart  = `hsl(${hue1}, ${sat}%, ${light}%)`;
            const gEnd    = `hsl(${hue2}, ${sat}%, ${Math.max(5, light - 10)}%)`;
            const aColor  = `hsl(${accent}, 70%, 55%)`;

            root.style.setProperty('--accent-color', aColor);
            root.style.setProperty('--grad-start',   gStart);
            root.style.setProperty('--grad-end',     gEnd);
            document.body.style.background = `radial-gradient(ellipse at 30% 10%, ${gStart}, ${gEnd})`;
        }
    }

    /* ── Canal de WhatsApp ───────────────────────────────────── */

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

    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        // Enfocar primer elemento interactivo
        const focusable = modal.querySelector('button, [tabindex="0"]');
        if (focusable) setTimeout(() => focusable.focus(), 50);
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    function initModals() {
        // Comprobar si ya aceptó términos (persistido en DB)
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

        // Abrir modales de info
        if (DOM.openPrivacy) {
            DOM.openPrivacy.addEventListener('click', () => openModal(DOM.privacyModal));
            DOM.openPrivacy.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') openModal(DOM.privacyModal);
            });
        }

        if (DOM.openTerms) {
            DOM.openTerms.addEventListener('click', () => openModal(DOM.termsModal));
            DOM.openTerms.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') openModal(DOM.termsModal);
            });
        }

        // Cerrar modales
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

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal(DOM.privacyModal);
                closeModal(DOM.termsModal);
            }
        });
    }

    /* ── Eventos ─────────────────────────────────────────────── */

    function bindEvents() {
        if (DOM.searchBtn)     DOM.searchBtn.addEventListener('click', applySearch);
        if (DOM.resetBtn)      DOM.resetBtn.addEventListener('click', resetNumbers);
        if (DOM.loadMoreBtn)   DOM.loadMoreBtn.addEventListener('click', () => loadNumbers(CONFIG.BATCH_SIZE, false));
        if (DOM.themeGreenBlue) DOM.themeGreenBlue.addEventListener('click', () => applyTheme('greenblue'));
        if (DOM.themeRandom)   DOM.themeRandom.addEventListener('click', () => applyTheme('random'));
        if (DOM.shareChannel)  DOM.shareChannel.addEventListener('click', shareWhatsAppChannel);

        // Buscar al presionar Enter en el input
        if (DOM.customMsg) {
            DOM.customMsg.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') applySearch();
            });
        }
    }

    /* ── Inicialización ──────────────────────────────────────── */

    function init() {
        // Inicializar DB
        if (typeof DB !== 'undefined') {
            DB.Session.init();
        }

        bindEvents();
        applyTheme('greenblue');
        initModals();
    }

    // Arrancar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
