/**
 * apk-download-manager.js — Gestor de Descarga de APK
 * Contactos Anónimos v3.0
 *
 * Gestiona la descarga del APK móvil con restricciones de modo beta.
 * Solo permite descargar si el usuario tiene habilitado el modo beta.
 * Proporciona feedback visual y notificaciones al usuario.
 *
 * @module apkDownloadManager
 * @version 3.0
 */

(function (global) {
    'use strict';

    /* ── Constantes ──────────────────────────────────────────── */

    const APK_DOWNLOAD_URL = 'downloads/ContactosAnonimos.apklink';
    const APK_FILE_NAME = 'ContactosAnonimos.apklink';
    const APK_SIZE = '1.3 KB';
    const MIN_BETA_VERSION = '3.0.0';

    /* ── Estado ──────────────────────────────────────────────– */

    let isDownloading = false;
    let downloadProgress = 0;

    /* ── API Pública ──────────────────────────────────────────– */

    const APKDownloadManager = {
        /**
         * Verifica si el usuario puede descargar el APK
         * @returns {boolean} true si el modo beta está habilitado
         */
        canDownloadAPK: function() {
            if (typeof window.BetaMode !== 'undefined') {
                return window.BetaMode.isBetaModeEnabled();
            }
            return false;
        },

        /**
         * Obtiene el estado de la característica de descarga de APK
         * @returns {boolean} true si la característica está habilitada
         */
        isAPKDownloadEnabled: function() {
            if (typeof window.BetaMode !== 'undefined') {
                return window.BetaMode.isFeatureEnabled('mobileAppDownload');
            }
            return false;
        },

        /**
         * Inicia la descarga del APK
         * @returns {Promise<void>}
         */
        downloadAPK: async function() {
            try {
                // Verificar si el modo beta está habilitado
                if (!this.canDownloadAPK()) {
                    this._showBetaRequiredModal();
                    return;
                }

                // Verificar si la característica está habilitada
                if (!this.isAPKDownloadEnabled()) {
                    this._showFeatureDisabledModal();
                    return;
                }

                // Registrar evento de descarga
                this._logDownloadEvent();

                // Iniciar descarga
                isDownloading = true;
                this._triggerDownload();

                // Mostrar notificación de éxito
                this._showDownloadStartedNotification();

            } catch (error) {
                console.error('Error al descargar APK:', error);
                this._showDownloadErrorNotification();
            } finally {
                isDownloading = false;
            }
        },

        /**
         * Obtiene información del APK
         * @returns {Object} Información del APK
         */
        getAPKInfo: function() {
            return {
                name: 'Contactos Anónimos',
                fileName: APK_FILE_NAME,
                size: APK_SIZE,
                version: '3.0.0',
                minAndroidVersion: 'Android 5.0+',
                downloadUrl: APK_DOWNLOAD_URL,
                betaRequired: true,
                category: 'mobile',
                features: [
                    'Offline support',
                    'Push notifications',
                    'Background sync',
                    'File handling',
                    'Share target',
                    'Quick actions',
                ],
            };
        },

        /**
         * Obtiene el estado de descarga
         * @returns {Object} Estado actual de descarga
         */
        getDownloadStatus: function() {
            return {
                isDownloading: isDownloading,
                progress: downloadProgress,
                canDownload: this.canDownloadAPK(),
                featureEnabled: this.isAPKDownloadEnabled(),
            };
        },

        /**
         * Abre el modal de información del APK
         */
        showAPKInfo: function() {
            const info = this.getAPKInfo();
            this._showAPKInfoModal(info);
        },

        /**
         * Habilita la descarga del APK (requiere modo beta)
         */
        enableAPKDownload: function() {
            if (typeof window.BetaMode !== 'undefined') {
                window.BetaMode.enableFeature('mobileAppDownload');
                this._showFeatureEnabledNotification();
            }
        },

        /**
         * Deshabilita la descarga del APK
         */
        disableAPKDownload: function() {
            if (typeof window.BetaMode !== 'undefined') {
                window.BetaMode.disableFeature('mobileAppDownload');
                this._showFeatureDisabledNotification();
            }
        },
    };

    /* ── Funciones Privadas ──────────────────────────────────– */

    /**
     * Dispara la descarga del archivo
     */
    APKDownloadManager._triggerDownload = function() {
        const link = document.createElement('a');
        link.href = APK_DOWNLOAD_URL;
        link.download = APK_FILE_NAME;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    /**
     * Muestra modal indicando que se requiere modo beta
     */
    APKDownloadManager._showBetaRequiredModal = function() {
        const modal = document.createElement('div');
        modal.className = 'apk-modal apk-modal--beta-required';
        modal.innerHTML = `
            <div class="apk-modal-content">
                <div class="apk-modal-header">
                    <i class="fas fa-lock" aria-hidden="true"></i>
                    <h2 data-i18n="beta.required_title">Modo Beta Requerido</h2>
                </div>
                <div class="apk-modal-body">
                    <p data-i18n="beta.apk_beta_required">
                        La descarga del APK solo está disponible para usuarios con modo beta habilitado.
                    </p>
                    <div class="apk-feature-info">
                        <h3 data-i18n="beta.features_included">Características Incluidas:</h3>
                        <ul>
                            <li>📱 Aplicación nativa para Android</li>
                            <li>⚡ Rendimiento optimizado (1.3 KB)</li>
                            <li>🔄 Sincronización en segundo plano</li>
                            <li>🔔 Notificaciones push</li>
                            <li>📴 Funciona sin internet</li>
                        </ul>
                    </div>
                </div>
                <div class="apk-modal-footer">
                    <button class="apk-btn apk-btn--secondary" id="apkModalCancel">
                        <i class="fas fa-times"></i>
                        <span data-i18n="btn.close">Cerrar</span>
                    </button>
                    <button class="apk-btn apk-btn--primary" id="apkEnableBeta">
                        <i class="fas fa-rocket"></i>
                        <span data-i18n="beta.enable_beta">Habilitar Modo Beta</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this._attachModalListeners(modal);
        this._translateModal(modal);
    };

    /**
     * Muestra modal indicando que la característica está deshabilitada
     */
    APKDownloadManager._showFeatureDisabledModal = function() {
        const modal = document.createElement('div');
        modal.className = 'apk-modal apk-modal--feature-disabled';
        modal.innerHTML = `
            <div class="apk-modal-content">
                <div class="apk-modal-header">
                    <i class="fas fa-toggle-off" aria-hidden="true"></i>
                    <h2 data-i18n="beta.feature_disabled_title">Característica Deshabilitada</h2>
                </div>
                <div class="apk-modal-body">
                    <p data-i18n="beta.apk_feature_disabled">
                        La descarga de APK está deshabilitada. Habilítala desde el panel de características beta.
                    </p>
                </div>
                <div class="apk-modal-footer">
                    <button class="apk-btn apk-btn--secondary" id="apkModalCancel">
                        <i class="fas fa-times"></i>
                        <span data-i18n="btn.close">Cerrar</span>
                    </button>
                    <button class="apk-btn apk-btn--primary" id="apkEnableFeature">
                        <i class="fas fa-check"></i>
                        <span data-i18n="beta.enable_feature">Habilitar Característica</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this._attachModalListeners(modal);
        this._translateModal(modal);
    };

    /**
     * Muestra modal con información del APK
     */
    APKDownloadManager._showAPKInfoModal = function(info) {
        const modal = document.createElement('div');
        modal.className = 'apk-modal apk-modal--info';
        modal.innerHTML = `
            <div class="apk-modal-content">
                <div class="apk-modal-header">
                    <i class="fab fa-android" aria-hidden="true"></i>
                    <h2>${info.name}</h2>
                </div>
                <div class="apk-modal-body">
                    <div class="apk-info-grid">
                        <div class="apk-info-item">
                            <span class="apk-info-label">Versión:</span>
                            <span class="apk-info-value">${info.version}</span>
                        </div>
                        <div class="apk-info-item">
                            <span class="apk-info-label">Tamaño:</span>
                            <span class="apk-info-value">${info.size}</span>
                        </div>
                        <div class="apk-info-item">
                            <span class="apk-info-label">Android:</span>
                            <span class="apk-info-value">${info.minAndroidVersion}</span>
                        </div>
                        <div class="apk-info-item">
                            <span class="apk-info-label">Modo Beta:</span>
                            <span class="apk-info-value">Requerido</span>
                        </div>
                    </div>
                    <h3>Características:</h3>
                    <ul class="apk-features-list">
                        ${info.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="apk-modal-footer">
                    <button class="apk-btn apk-btn--secondary" id="apkModalCancel">
                        <i class="fas fa-times"></i>
                        <span data-i18n="btn.close">Cerrar</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this._attachModalListeners(modal);
        this._translateModal(modal);
    };

    /**
     * Adjunta listeners a los botones del modal
     */
    APKDownloadManager._attachModalListeners = function(modal) {
        const cancelBtn = modal.querySelector('#apkModalCancel');
        const enableBetaBtn = modal.querySelector('#apkEnableBeta');
        const enableFeatureBtn = modal.querySelector('#apkEnableFeature');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.remove();
            });
        }

        if (enableBetaBtn) {
            enableBetaBtn.addEventListener('click', () => {
                if (typeof window.BetaMode !== 'undefined') {
                    window.BetaMode.enableBetaMode();
                    window.BetaMode.enableFeature('mobileAppDownload');
                    modal.remove();
                    this._showBetaEnabledNotification();
                }
            });
        }

        if (enableFeatureBtn) {
            enableFeatureBtn.addEventListener('click', () => {
                this.enableAPKDownload();
                modal.remove();
                this._showFeatureEnabledNotification();
            });
        }

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    };

    /**
     * Traduce el contenido del modal
     */
    APKDownloadManager._translateModal = function(modal) {
        if (typeof window.i18n !== 'undefined') {
            const elements = modal.querySelectorAll('[data-i18n]');
            elements.forEach(el => {
                const key = el.getAttribute('data-i18n');
                const translation = window.i18n.t(key);
                if (translation) {
                    el.textContent = translation;
                }
            });
        }
    };

    /**
     * Muestra notificación de descarga iniciada
     */
    APKDownloadManager._showDownloadStartedNotification = function() {
        if (typeof window.showNotification !== 'undefined') {
            window.showNotification('Descarga iniciada', 'El APK se está descargando...', 'success');
        }
    };

    /**
     * Muestra notificación de error en descarga
     */
    APKDownloadManager._showDownloadErrorNotification = function() {
        if (typeof window.showNotification !== 'undefined') {
            window.showNotification('Error', 'No se pudo descargar el APK. Intenta de nuevo.', 'error');
        }
    };

    /**
     * Muestra notificación de modo beta habilitado
     */
    APKDownloadManager._showBetaEnabledNotification = function() {
        if (typeof window.showNotification !== 'undefined') {
            window.showNotification('Modo Beta Habilitado', 'Ahora puedes descargar el APK', 'success');
        }
    };

    /**
     * Muestra notificación de característica habilitada
     */
    APKDownloadManager._showFeatureEnabledNotification = function() {
        if (typeof window.showNotification !== 'undefined') {
            window.showNotification('Característica Habilitada', 'Descarga de APK activada', 'success');
        }
    };

    /**
     * Muestra notificación de característica deshabilitada
     */
    APKDownloadManager._showFeatureDisabledNotification = function() {
        if (typeof window.showNotification !== 'undefined') {
            window.showNotification('Característica Deshabilitada', 'Descarga de APK desactivada', 'info');
        }
    };

    /**
     * Registra evento de descarga en analytics
     */
    APKDownloadManager._logDownloadEvent = function() {
        if (typeof window.logEvent !== 'undefined') {
            window.logEvent('apk_download', {
                timestamp: new Date().toISOString(),
                betaMode: this.canDownloadAPK(),
                featureEnabled: this.isAPKDownloadEnabled(),
                userAgent: navigator.userAgent,
            });
        }
    };

    /* ── Exposición Global ──────────────────────────────────– */

    global.APKDownloadManager = APKDownloadManager;

    // Disparar evento de carga
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const event = new CustomEvent('apkDownloadManagerReady', {
                detail: { manager: APKDownloadManager },
            });
            document.dispatchEvent(event);
        });
    } else {
        const event = new CustomEvent('apkDownloadManagerReady', {
            detail: { manager: APKDownloadManager },
        });
        document.dispatchEvent(event);
    }

})(window);
