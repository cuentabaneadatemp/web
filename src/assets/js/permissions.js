/**
 * permissions.js — Módulo de Solicitud de Permisos del Navegador
 * Contactos Anónimos v2.0
 *
 * Solicita permisos obligatorios al usuario:
 *   1. Geolocalización (GPS)
 *   2. Almacenamiento (localStorage, sessionStorage)
 *   3. Notificaciones
 *   4. Cámara (opcional)
 *   5. Micrófono (opcional)
 *
 * Estos permisos son REQUERIDOS para usar la plataforma.
 * Si el usuario rechaza, se le bloquea el acceso.
 */

(function (global) {
    'use strict';

    /* ── Constantes ──────────────────────────────────────────── */
    const PERMISSIONS_CACHE_KEY = '_ca_permissions_v2';
    const PERMISSIONS_TTL = 86400000; // 24 horas

    /* ── Estado ──────────────────────────────────────────────── */
    const state = {
        permissionsGranted: {},
        allPermissionsApproved: false,
    };

    /* ── Utilidades ──────────────────────────────────────────── */

    /**
     * Lee el caché de permisos.
     * @returns {object|null}
     */
    function _readPermissionsCache() {
        try {
            const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY);
            if (!cached) return null;

            const data = JSON.parse(cached);
            const now = Date.now();

            // Verificar si el caché sigue siendo válido
            if ((now - data.timestamp) > PERMISSIONS_TTL) {
                localStorage.removeItem(PERMISSIONS_CACHE_KEY);
                return null;
            }

            return data.permissions;
        } catch (_) {
            return null;
        }
    }

    /**
     * Guarda el caché de permisos.
     * @param {object} permissions
     */
    function _writePermissionsCache(permissions) {
        try {
            localStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                permissions,
            }));
        } catch (_) {
            /* Ignorar errores de almacenamiento */
        }
    }

    /**
     * Solicita permiso de geolocalización.
     * @returns {Promise<boolean>}
     */
    async function _requestGeolocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn('[permissions] Geolocation API no disponible');
                resolve(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                () => {
                    console.log('[permissions] ✅ Geolocalización permitida');
                    resolve(true);
                },
                (error) => {
                    console.warn('[permissions] ❌ Geolocalización rechazada:', error.message);
                    resolve(false);
                },
                { timeout: 8000 }
            );
        });
    }

    /**
     * Solicita permiso de almacenamiento.
     * Intenta escribir en localStorage y sessionStorage.
     * @returns {Promise<boolean>}
     */
    async function _requestStorage() {
        try {
            const testKey = '__ca_storage_test__';
            const testValue = 'test';

            // Probar localStorage
            try {
                localStorage.setItem(testKey, testValue);
                localStorage.removeItem(testKey);
            } catch (err) {
                console.warn('[permissions] ❌ localStorage rechazado:', err.message);
                return false;
            }

            // Probar sessionStorage
            try {
                sessionStorage.setItem(testKey, testValue);
                sessionStorage.removeItem(testKey);
            } catch (err) {
                console.warn('[permissions] ❌ sessionStorage rechazado:', err.message);
                return false;
            }

            console.log('[permissions] ✅ Almacenamiento permitido');
            return true;
        } catch (err) {
            console.error('[permissions] Error en solicitud de almacenamiento:', err);
            return false;
        }
    }

    /**
     * Solicita permiso de notificaciones.
     * @returns {Promise<boolean>}
     */
    async function _requestNotifications() {
        if (!('Notification' in window)) {
            console.warn('[permissions] Notifications API no disponible');
            return false;
        }

        if (Notification.permission === 'granted') {
            console.log('[permissions] ✅ Notificaciones ya permitidas');
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('[permissions] ❌ Notificaciones rechazadas');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            const granted = permission === 'granted';

            if (granted) {
                console.log('[permissions] ✅ Notificaciones permitidas');
                // Enviar notificación de prueba
                new Notification('Contactos Anónimos', {
                    body: 'Notificaciones habilitadas correctamente.',
                    icon: 'assets/img/favicon.svg',
                    badge: 'assets/img/favicon.svg',
                });
            } else {
                console.warn('[permissions] ❌ Notificaciones rechazadas');
            }

            return granted;
        } catch (err) {
            console.error('[permissions] Error en solicitud de notificaciones:', err);
            return false;
        }
    }

    /**
     * Solicita permiso de cámara (opcional).
     * @returns {Promise<boolean>}
     */
    async function _requestCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('[permissions] Camera API no disponible');
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('[permissions] ✅ Cámara permitida');
            return true;
        } catch (err) {
            console.warn('[permissions] ❌ Cámara rechazada:', err.message);
            return false;
        }
    }

    /**
     * Solicita permiso de micrófono (opcional).
     * @returns {Promise<boolean>}
     */
    async function _requestMicrophone() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('[permissions] Microphone API no disponible');
            return false;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('[permissions] ✅ Micrófono permitido');
            return true;
        } catch (err) {
            console.warn('[permissions] ❌ Micrófono rechazado:', err.message);
            return false;
        }
    }

    /**
     * Solicita permiso de vibración (opcional).
     * @returns {Promise<boolean>}
     */
    async function _requestVibration() {
        if (!navigator.vibrate) {
            console.warn('[permissions] Vibration API no disponible');
            return false;
        }

        try {
            navigator.vibrate(100);
            console.log('[permissions] ✅ Vibración permitida');
            return true;
        } catch (err) {
            console.warn('[permissions] ❌ Vibración rechazada:', err.message);
            return false;
        }
    }

    /* ── API Pública ─────────────────────────────────────────── */

    /**
     * Solicita todos los permisos OBLIGATORIOS.
     * @returns {Promise<object>} { geolocation, storage, notifications, allApproved }
     */
    async function requestMandatoryPermissions() {
        console.log('[permissions] Solicitando permisos obligatorios...');

        // Verificar caché
        const cached = _readPermissionsCache();
        if (cached && cached.allApproved) {
            console.log('[permissions] Usando caché de permisos');
            state.permissionsGranted = cached;
            state.allPermissionsApproved = true;
            return cached;
        }

        // Solicitar permisos
        const [geolocation, storage, notifications] = await Promise.all([
            _requestGeolocation(),
            _requestStorage(),
            _requestNotifications(),
        ]);

        const result = {
            geolocation,
            storage,
            notifications,
            allApproved: geolocation && storage && notifications,
        };

        state.permissionsGranted = result;
        state.allPermissionsApproved = result.allApproved;

        // Guardar en caché
        _writePermissionsCache(result);

        console.log('[permissions] Resultado:', result);
        return result;
    }

    /**
     * Solicita permisos OPCIONALES (cámara, micrófono, vibración).
     * @returns {Promise<object>}
     */
    async function requestOptionalPermissions() {
        console.log('[permissions] Solicitando permisos opcionales...');

        const [camera, microphone, vibration] = await Promise.all([
            _requestCamera(),
            _requestMicrophone(),
            _requestVibration(),
        ]);

        return { camera, microphone, vibration };
    }

    /**
     * Comprueba si todos los permisos obligatorios fueron aprobados.
     * @returns {boolean}
     */
    function areMandatoryPermissionsApproved() {
        return state.allPermissionsApproved;
    }

    /**
     * Obtiene el estado actual de los permisos.
     * @returns {object}
     */
    function getPermissionsStatus() {
        return { ...state.permissionsGranted };
    }

    /**
     * Revoca el caché de permisos (fuerza nueva solicitud).
     */
    function revokePermissionsCache() {
        try {
            localStorage.removeItem(PERMISSIONS_CACHE_KEY);
            state.permissionsGranted = {};
            state.allPermissionsApproved = false;
            console.log('[permissions] Caché de permisos revocado');
        } catch (_) {}
    }

    /* ── Exportación ─────────────────────────────────────────── */
    global.PERMISSIONS = Object.freeze({
        requestMandatoryPermissions,
        requestOptionalPermissions,
        areMandatoryPermissionsApproved,
        getPermissionsStatus,
        revokePermissionsCache,
    });

})(window);
