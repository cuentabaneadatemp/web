/**
 * beta.js — Sistema de Modo Beta
 * Contactos Anónimos v2.0
 *
 * Gestiona el acceso a características experimentales y feature flags.
 * Permite a los usuarios participar en funciones beta y proporciona
 * un panel de control para habilitar/deshabilitar features.
 *
 * @module beta
 * @version 2.0
 */

(function (global) {
    'use strict';

    /* ── Constantes ──────────────────────────────────────────── */

    const STORAGE_KEY = '_ca_beta_mode';
    const FEATURES_KEY = '_ca_beta_features';

    /**
     * Definición de características experimentales disponibles.
     * Cada feature tiene: nombre, descripción, versión, estado por defecto.
     */
    const AVAILABLE_FEATURES = Object.freeze({
        advancedGenerator: {
            id: 'advancedGenerator',
            name: 'Advanced Number Generator',
            description: 'Filter numbers by operator, region, and availability',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
        analytics: {
            id: 'analytics',
            name: 'Contact Analytics',
            description: 'View statistics and patterns of your contacts',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
        customThemes: {
            id: 'customThemes',
            name: 'Custom Themes',
            description: 'Create and manage your own color themes',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
        enhancedNotifications: {
            id: 'enhancedNotifications',
            name: 'Enhanced Notifications',
            description: 'Advanced notification settings and alerts',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
        incognitoMode: {
            id: 'incognitoMode',
            name: 'Incognito Mode',
            description: 'Use without saving history or data',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
        dataExport: {
            id: 'dataExport',
            name: 'Data Export',
            description: 'Export your contact history as CSV or JSON',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
        advancedSearch: {
            id: 'advancedSearch',
            name: 'Advanced Search',
            description: 'Search and filter contacts with advanced options',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
        darkModeSync: {
            id: 'darkModeSync',
            name: 'Dark Mode Auto-Sync',
            description: 'Automatically sync theme with system preferences',
            version: '2.1.0',
            enabled: false,
            experimental: true,
        },
    });

    /* ── Estado ──────────────────────────────────────────────– */

    let betaMode = _loadBetaMode();
    let enabledFeatures = _loadEnabledFeatures();

    /* ── Funciones Privadas ──────────────────────────────────– */

    /**
     * Carga el estado del modo beta del almacenamiento local.
     * @returns {boolean} true si el modo beta está habilitado
     */
    function _loadBetaMode() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored === 'true';
        } catch (_) {
            return false;
        }
    }

    /**
     * Carga las características habilitadas del almacenamiento local.
     * @returns {object} Mapa de características habilitadas
     */
    function _loadEnabledFeatures() {
        try {
            const stored = localStorage.getItem(FEATURES_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (_) {
            return {};
        }
    }

    /**
     * Persiste el estado del modo beta en almacenamiento local.
     */
    function _saveBetaMode() {
        try {
            localStorage.setItem(STORAGE_KEY, String(betaMode));
        } catch (_) {
            /* Cuota excedida u otro error — ignorar silenciosamente */
        }
    }

    /**
     * Persiste las características habilitadas en almacenamiento local.
     */
    function _saveEnabledFeatures() {
        try {
            localStorage.setItem(FEATURES_KEY, JSON.stringify(enabledFeatures));
        } catch (_) {
            /* Cuota excedida u otro error — ignorar silenciosamente */
        }
    }

    /**
     * Emite evento personalizado cuando cambia el estado beta.
     */
    function _emitBetaChangeEvent() {
        const event = new CustomEvent('betamodechange', {
            detail: {
                enabled: betaMode,
                features: enabledFeatures,
            },
        });
        window.dispatchEvent(event);
    }

    /**
     * Emite evento cuando cambia una característica específica.
     */
    function _emitFeatureChangeEvent(featureId, enabled) {
        const event = new CustomEvent('betafeaturechange', {
            detail: {
                featureId,
                enabled,
            },
        });
        window.dispatchEvent(event);
    }

    /* ── API Pública ─────────────────────────────────────────– */

    /**
     * Obtiene el estado actual del modo beta.
     * @returns {boolean} true si el modo beta está habilitado
     */
    function isBetaEnabled() {
        return betaMode;
    }

    /**
     * Habilita o deshabilita el modo beta.
     * @param {boolean} enabled - true para habilitar, false para deshabilitar
     */
    function setBetaMode(enabled) {
        if (betaMode === enabled) return;

        betaMode = enabled;
        _saveBetaMode();

        if (!enabled) {
            // Deshabilitar todas las características al desactivar modo beta
            enabledFeatures = {};
            _saveEnabledFeatures();
        }

        _emitBetaChangeEvent();
    }

    /**
     * Obtiene información de una característica específica.
     * @param {string} featureId - ID de la característica
     * @returns {object|null} Información de la característica o null
     */
    function getFeature(featureId) {
        return AVAILABLE_FEATURES[featureId] || null;
    }

    /**
     * Obtiene lista de todas las características disponibles.
     * @returns {Array<object>} Array de características
     */
    function getAllFeatures() {
        return Object.values(AVAILABLE_FEATURES);
    }

    /**
     * Verifica si una característica está habilitada.
     * @param {string} featureId - ID de la característica
     * @returns {boolean} true si está habilitada
     */
    function isFeatureEnabled(featureId) {
        if (!betaMode) return false;
        return enabledFeatures[featureId] === true;
    }

    /**
     * Habilita una característica experimental.
     * @param {string} featureId - ID de la característica
     * @returns {boolean} true si fue habilitada exitosamente
     */
    function enableFeature(featureId) {
        if (!betaMode) {
            console.warn('[beta] Modo beta debe estar habilitado para usar características experimentales');
            return false;
        }

        if (!AVAILABLE_FEATURES[featureId]) {
            console.warn(`[beta] Característica desconocida: ${featureId}`);
            return false;
        }

        if (enabledFeatures[featureId] === true) {
            return true; // Ya está habilitada
        }

        enabledFeatures[featureId] = true;
        _saveEnabledFeatures();
        _emitFeatureChangeEvent(featureId, true);

        console.log(`[beta] Característica habilitada: ${featureId}`);
        return true;
    }

    /**
     * Deshabilita una característica experimental.
     * @param {string} featureId - ID de la característica
     * @returns {boolean} true si fue deshabilitada exitosamente
     */
    function disableFeature(featureId) {
        if (!AVAILABLE_FEATURES[featureId]) {
            console.warn(`[beta] Característica desconocida: ${featureId}`);
            return false;
        }

        if (enabledFeatures[featureId] !== true) {
            return true; // Ya está deshabilitada
        }

        enabledFeatures[featureId] = false;
        _saveEnabledFeatures();
        _emitFeatureChangeEvent(featureId, false);

        console.log(`[beta] Característica deshabilitada: ${featureId}`);
        return true;
    }

    /**
     * Obtiene lista de características habilitadas.
     * @returns {Array<string>} Array de IDs de características habilitadas
     */
    function getEnabledFeatures() {
        return Object.keys(enabledFeatures).filter((id) => enabledFeatures[id] === true);
    }

    /**
     * Obtiene estado de todas las características.
     * @returns {object} Mapa de características y sus estados
     */
    function getFeatureStatus() {
        const status = {};
        Object.keys(AVAILABLE_FEATURES).forEach((id) => {
            status[id] = isFeatureEnabled(id);
        });
        return status;
    }

    /**
     * Reinicia el modo beta a valores por defecto.
     */
    function reset() {
        betaMode = false;
        enabledFeatures = {};
        _saveBetaMode();
        _saveEnabledFeatures();
        _emitBetaChangeEvent();
    }

    /**
     * Obtiene información de versión del sistema beta.
     * @returns {object} Información de versión
     */
    function getVersion() {
        return {
            betaVersion: '2.1.0',
            featureCount: Object.keys(AVAILABLE_FEATURES).length,
            enabledCount: getEnabledFeatures().length,
        };
    }

    /* ── Exportación ─────────────────────────────────────────– */

    global.BETA = Object.freeze({
        isBetaEnabled,
        setBetaMode,
        getFeature,
        getAllFeatures,
        isFeatureEnabled,
        enableFeature,
        disableFeature,
        getEnabledFeatures,
        getFeatureStatus,
        reset,
        getVersion,
    });

})(window);
