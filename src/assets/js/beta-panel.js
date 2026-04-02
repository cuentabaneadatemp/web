/**
 * beta-panel.js — Panel de Control del Modo Beta
 * Contactos Anónimos v4.0
 *
 * Proporciona interfaz de usuario para gestionar características experimentales
 * y acceder a funciones avanzadas en modo beta.
 *
 * @module BetaPanel
 * @version 4.0
 */

(function (global) {
    'use strict';

    const PANEL_ID = 'betaPanel';
    const FEATURES_CONTAINER_ID = 'betaFeatures';

    /**
     * Crea el panel de control beta en el DOM.
     */
    function createBetaPanel() {
        if (document.getElementById(PANEL_ID)) return;

        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.className = 'beta-panel';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Panel de características experimentales');
        panel.setAttribute('aria-hidden', 'true');

        panel.innerHTML = `
            <div class="beta-panel-header">
                <h3 class="beta-panel-title">
                    <i class="fas fa-flask" aria-hidden="true"></i>
                    Características Experimentales
                </h3>
                <button class="beta-panel-close" type="button" aria-label="Cerrar panel beta">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>

            <div class="beta-panel-content">
                <p class="beta-panel-desc">
                    Participa en características experimentales y ayúdanos a mejorar la plataforma.
                </p>

                <div id="${FEATURES_CONTAINER_ID}" class="beta-features-list">
                    <!-- Características se cargarán dinámicamente -->
                </div>

                <div class="beta-panel-actions">
                    <button id="betaExportData" class="btn btn--secondary btn--small" type="button">
                        <i class="fas fa-download" aria-hidden="true"></i>
                        <span>Exportar Datos</span>
                    </button>
                    <button id="betaResetFeatures" class="btn btn--danger btn--small" type="button">
                        <i class="fas fa-redo" aria-hidden="true"></i>
                        <span>Resetear</span>
                    </button>
                </div>

                <div class="beta-panel-footer">
                    <p class="beta-version-info">
                        <small id="betaVersionInfo"></small>
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        _attachPanelEvents();
        _renderFeatures();
    }

    /**
     * Vincula eventos del panel.
     */
    function _attachPanelEvents() {
        const closeBtn = document.querySelector('.beta-panel-close');
        if (closeBtn) closeBtn.addEventListener('click', hideBetaPanel);

        const exportBtn = document.getElementById('betaExportData');
        if (exportBtn) exportBtn.addEventListener('click', _handleExportData);

        const resetBtn = document.getElementById('betaResetFeatures');
        if (resetBtn) resetBtn.addEventListener('click', _handleResetFeatures);

        const panel = document.getElementById(PANEL_ID);
        if (panel) {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) hideBetaPanel();
            });
        }
    }

    /**
     * Renderiza la lista de características disponibles.
     */
    function _renderFeatures() {
        if (typeof BETA === 'undefined') return;

        const container = document.getElementById(FEATURES_CONTAINER_ID);
        if (!container) return;

        const features = BETA.getAllFeatures();
        const featureStatus = BETA.getFeatureStatus();

        // Agrupar por categoría
        const categorized = {};
        features.forEach(feature => {
            const category = feature.category || 'other';
            if (!categorized[category]) categorized[category] = [];
            categorized[category].push(feature);
        });

        const categoryOrder = [
            'pwa', 'mobile', 'ai', 'messaging', 'organization',
            'search', 'storage', 'accessibility', 'privacy', 'productivity', 'other'
        ];
        const categoryLabels = {
            pwa:           '📲 PWA',
            mobile:        '📱 Móvil',
            ai:            '🤖 Inteligencia Artificial',
            messaging:     '💬 Mensajería',
            organization:  '📁 Organización',
            search:        '🔍 Búsqueda',
            storage:       '💾 Almacenamiento',
            accessibility: '♿ Accesibilidad',
            privacy:       '🔒 Privacidad',
            productivity:  '⚡ Productividad',
            other:         '⚙️ Otros',
        };

        let html = '';
        categoryOrder.forEach(category => {
            if (!categorized[category]) return;

            html += `<div class="beta-category">
                <h3 class="beta-category-title">${categoryLabels[category] || category}</h3>
                <div class="beta-category-features">`;

            categorized[category].forEach(feature => {
                const enabled = featureStatus[feature.id] || false;
                let badgeHtml = '';
                if (feature.id === 'pwaInstall') {
                    badgeHtml = '<span class="beta-feature-badge beta-feature-badge--pwa">PWA</span>';
                } else if (feature.experimental) {
                    badgeHtml = '<span class="beta-feature-badge">Experimental</span>';
                }

                html += `
                    <div class="beta-feature-item" data-feature-id="${feature.id}" data-category="${category}">
                        <div class="beta-feature-header">
                            <label class="beta-feature-toggle">
                                <input type="checkbox"
                                       class="beta-feature-checkbox"
                                       data-feature-id="${feature.id}"
                                       ${enabled ? 'checked' : ''}
                                       aria-label="Activar ${_escapeHtml(feature.name)}">
                                <span class="toggle-slider"></span>
                            </label>
                            <div class="beta-feature-info">
                                <h4 class="beta-feature-name">${_escapeHtml(feature.name)}</h4>
                                <p class="beta-feature-desc">${_escapeHtml(feature.description)}</p>
                                <span class="beta-feature-version">v${feature.version}</span>
                                ${badgeHtml}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        });

        container.innerHTML = html;

        container.querySelectorAll('.beta-feature-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('change', _handleFeatureToggle);
        });

        _updateVersionInfo();
    }

    /**
     * Maneja el cambio de estado de una característica.
     */
    function _handleFeatureToggle(e) {
        if (typeof BETA === 'undefined') return;

        const featureId = e.target.getAttribute('data-feature-id');
        const enabled = e.target.checked;

        if (enabled) {
            BETA.enableFeature(featureId);
        } else {
            BETA.disableFeature(featureId);
        }

        console.log(`[beta-panel] Característica ${featureId}: ${enabled ? 'habilitada' : 'deshabilitada'}`);
    }

    /**
     * Maneja la exportación de datos.
     */
    function _handleExportData() {
        if (typeof AdvancedAPI === 'undefined') {
            console.error('[beta-panel] AdvancedAPI no disponible');
            return;
        }

        const format = confirm('¿Exportar como JSON? (OK) o CSV (Cancelar)');

        if (format) {
            const json = AdvancedAPI.exportHistoryAsJSON();
            AdvancedAPI.downloadFile(json, `contactos-anonimos-${Date.now()}.json`, 'application/json');
        } else {
            const csv = AdvancedAPI.exportHistoryAsCSV();
            AdvancedAPI.downloadFile(csv, `contactos-anonimos-${Date.now()}.csv`, 'text/csv');
        }
    }

    /**
     * Maneja el reseteo de características.
     */
    function _handleResetFeatures() {
        if (typeof BETA === 'undefined') return;

        if (confirm('¿Estás seguro? Esto deshabilitará todas las características experimentales.')) {
            BETA.reset();
            _renderFeatures();
            console.log('[beta-panel] Características reseteadas');
        }
    }

    /**
     * Actualiza la información de versión.
     */
    function _updateVersionInfo() {
        if (typeof BETA === 'undefined') return;

        const versionInfo = BETA.getVersion();
        const infoEl = document.getElementById('betaVersionInfo');

        if (infoEl) {
            infoEl.textContent = `Beta v${versionInfo.betaVersion} | ${versionInfo.enabledCount}/${versionInfo.featureCount} características habilitadas`;
        }
    }

    /**
     * Escapa caracteres HTML especiales.
     */
    function _escapeHtml(str) {
        if (!str) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return String(str).replace(/[&<>"']/g, (c) => map[c]);
    }

    /* ── API Pública ─────────────────────────────────────────── */

    function showBetaPanel() {
        createBetaPanel();
        const panel = document.getElementById(PANEL_ID);
        if (panel) {
            panel.classList.add('active');
            panel.setAttribute('aria-hidden', 'false');
        }
    }

    function hideBetaPanel() {
        const panel = document.getElementById(PANEL_ID);
        if (panel) {
            panel.classList.remove('active');
            panel.setAttribute('aria-hidden', 'true');
        }
    }

    function toggleBetaPanel() {
        const panel = document.getElementById(PANEL_ID);
        if (panel && panel.classList.contains('active')) {
            hideBetaPanel();
        } else {
            showBetaPanel();
        }
    }

    function updatePanel() {
        _renderFeatures();
    }

    /* ── Exportación ─────────────────────────────────────────── */

    global.BetaPanel = Object.freeze({
        showBetaPanel,
        hideBetaPanel,
        toggleBetaPanel,
        updatePanel,
    });

})(window);
