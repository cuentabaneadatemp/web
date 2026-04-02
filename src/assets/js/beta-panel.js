/**
 * beta-panel.js — Panel de Control del Modo Beta
 * Contactos Anónimos v2.0
 *
 * Proporciona interfaz de usuario para gestionar características experimentales
 * y acceder a funciones avanzadas en modo beta.
 *
 * @module BetaPanel
 * @version 2.0
 */

(function (global) {
    'use strict';

    const PANEL_ID = 'betaPanel';
    const FEATURES_CONTAINER_ID = 'betaFeatures';

    /**
     * Crea el panel de control beta en el DOM.
     */
    function createBetaPanel() {
        // Evitar duplicados
        if (document.getElementById(PANEL_ID)) {
            return;
        }

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
        if (closeBtn) {
            closeBtn.addEventListener('click', hideBetaPanel);
        }

        const exportBtn = document.getElementById('betaExportData');
        if (exportBtn) {
            exportBtn.addEventListener('click', _handleExportData);
        }

        const resetBtn = document.getElementById('betaResetFeatures');
        if (resetBtn) {
            resetBtn.addEventListener('click', _handleResetFeatures);
        }

        // Cerrar al hacer clic fuera
        const panel = document.getElementById(PANEL_ID);
        if (panel) {
            panel.addEventListener('click', (e) => {
                if (e.target === panel) {
                    hideBetaPanel();
                }
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

        // Agrupar características por categoría
        const categorized = {};
        features.forEach(feature => {
            const category = feature.category || 'other';
            if (!categorized[category]) {
                categorized[category] = [];
            }
            categorized[category].push(feature);
        });

        // Renderizar por categorías
        const categoryOrder = ['mobile', 'ai', 'messaging', 'organization', 'search', 'storage', 'accessibility', 'privacy', 'productivity', 'other'];
        const categoryLabels = {
            mobile: '📱 Móvil',
            ai: '🤖 Inteligencia Artificial',
            messaging: '💬 Mensajería',
            organization: '📁 Organización',
            search: '🔍 Búsqueda',
            storage: '💾 Almacenamiento',
            accessibility: '♿ Accesibilidad',
            privacy: '🔒 Privacidad',
            productivity: '⚡ Productividad',
            other: '⚙️ Otros',
        };

        let html = '';
        categoryOrder.forEach(category => {
            if (categorized[category]) {
                html += `<div class="beta-category">
                    <h3 class="beta-category-title">${categoryLabels[category]}</h3>
                    <div class="beta-category-features">`;

                categorized[category].forEach(feature => {
                    const enabled = featureStatus[feature.id] || false;
                    html += `
                        <div class="beta-feature-item" data-feature-id="${feature.id}" data-category="${category}">
                            <div class="beta-feature-header">
                                <label class="beta-feature-toggle">
                                    <input type="checkbox"
                                           class="beta-feature-checkbox"
                                           data-feature-id="${feature.id}"
                                           ${enabled ? 'checked' : ''}
                                           aria-label="Activar ${feature.name}">
                                    <span class="toggle-slider"></span>
                                </label>
                                <div class="beta-feature-info">
                                    <h4 class="beta-feature-name">${_escapeHtml(feature.name)}</h4>
                                    <p class="beta-feature-desc">${_escapeHtml(feature.description)}</p>
                                    <span class="beta-feature-version">v${feature.version}</span>
                                    ${feature.id === 'mobileAppDownload' ? '<span class="beta-feature-badge">Requiere Beta</span>' : ''}
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += `</div></div>`;
            }
        });

        container.innerHTML = html;

        // Vincular eventos de checkboxes
        container.querySelectorAll('.beta-feature-checkbox').forEach((checkbox) => {
            checkbox.addEventListener('change', _handleFeatureToggle);
        });

        // Actualizar información de versión
        _updateVersionInfo();
    }\n    }\n\n    /**\n     * Maneja el cambio de estado de una característica.\n     */\n    function _handleFeatureToggle(e) {\n        if (typeof BETA === 'undefined') return;\n\n        const featureId = e.target.getAttribute('data-feature-id');\n        const enabled = e.target.checked;\n\n        if (enabled) {\n            BETA.enableFeature(featureId);\n        } else {\n            BETA.disableFeature(featureId);\n        }\n\n        console.log(`[beta-panel] Característica ${featureId}: ${enabled ? 'habilitada' : 'deshabilitada'}`);\n    }\n\n    /**\n     * Maneja la exportación de datos.\n     */\n    function _handleExportData() {\n        if (typeof AdvancedAPI === 'undefined') {\n            console.error('[beta-panel] AdvancedAPI no disponible');\n            return;\n        }\n\n        // Mostrar opciones de exportación\n        const format = confirm('¿Exportar como JSON? (OK) o CSV (Cancelar)');\n\n        if (format) {\n            const json = AdvancedAPI.exportHistoryAsJSON();\n            AdvancedAPI.downloadFile(json, `contactos-anonimos-${Date.now()}.json`, 'application/json');\n        } else {\n            const csv = AdvancedAPI.exportHistoryAsCSV();\n            AdvancedAPI.downloadFile(csv, `contactos-anonimos-${Date.now()}.csv`, 'text/csv');\n        }\n    }\n\n    /**\n     * Maneja el reseteo de características.\n     */\n    function _handleResetFeatures() {\n        if (typeof BETA === 'undefined') return;\n\n        if (confirm('¿Estás seguro? Esto deshabilitará todas las características experimentales.')) {\n            BETA.reset();\n            _renderFeatures();\n            console.log('[beta-panel] Características reseteadas');\n        }\n    }\n\n    /**\n     * Actualiza la información de versión.\n     */\n    function _updateVersionInfo() {\n        if (typeof BETA === 'undefined') return;\n\n        const versionInfo = BETA.getVersion();\n        const infoEl = document.getElementById('betaVersionInfo');\n\n        if (infoEl) {\n            infoEl.textContent = `Beta v${versionInfo.betaVersion} | ${versionInfo.enabledCount}/${versionInfo.featureCount} características habilitadas`;\n        }\n    }\n\n    /**\n     * Escapa caracteres HTML especiales.\n     */\n    function _escapeHtml(str) {\n        if (!str) return '';\n        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' };\n        return String(str).replace(/[&<>\"']/g, (c) => map[c]);\n    }\n\n    /* ── API Pública ─────────────────────────────────────────– */\n\n    /**\n     * Muestra el panel beta.\n     */\n    function showBetaPanel() {\n        createBetaPanel();\n        const panel = document.getElementById(PANEL_ID);\n        if (panel) {\n            panel.classList.add('active');\n            panel.setAttribute('aria-hidden', 'false');\n        }\n    }\n\n    /**\n     * Oculta el panel beta.\n     */\n    function hideBetaPanel() {\n        const panel = document.getElementById(PANEL_ID);\n        if (panel) {\n            panel.classList.remove('active');\n            panel.setAttribute('aria-hidden', 'true');\n        }\n    }\n\n    /**\n     * Alterna la visibilidad del panel beta.\n     */\n    function toggleBetaPanel() {\n        const panel = document.getElementById(PANEL_ID);\n        if (panel && panel.classList.contains('active')) {\n            hideBetaPanel();\n        } else {\n            showBetaPanel();\n        }\n    }\n\n    /**\n     * Actualiza el panel con cambios de características.\n     */\n    function updatePanel() {\n        _renderFeatures();\n    }\n\n    /* ── Exportación ─────────────────────────────────────────– */\n\n    global.BetaPanel = Object.freeze({\n        showBetaPanel,\n        hideBetaPanel,\n        toggleBetaPanel,\n        updatePanel,\n    });\n\n})(window);\n
