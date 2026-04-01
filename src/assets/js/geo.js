/**
 * geo.js — Módulo de Geolocalización y Geobloqueo
 * Contactos Anónimos v2.0
 *
 * Implementa:
 *   1. Geolocalización por IP (API externa)
 *   2. Detección de VPN/Proxy
 *   3. Geobloqueo para Cuba (restricción de acceso)
 *   4. Monitoreo continuo de ubicación con Geolocation API del navegador
 *   5. Caché local de ubicación para optimizar requests
 *
 * Nota: Este módulo requiere conexión a internet para consultar APIs de geolocalización.
 * Las APIs utilizadas son gratuitas con límites de requests.
 */

(function (global) {
    'use strict';

    /* ── Constantes ──────────────────────────────────────────── */

    /** Coordenadas aproximadas de Cuba (centro) */
    const CUBA_BOUNDS = {
        lat: { min: 19.8, max: 20.4 },
        lon: { min: -84.9, max: -74.1 },
    };

    /** Margen de tolerancia en grados para geolocalización por GPS */
    const GPS_TOLERANCE = 1.5;

    /** APIs de geolocalización por IP (gratuitas con límites) */
    const GEO_APIS = [
        {
            name:     'ipwhois',
            url:      'https://ipwho.is/',
            parser:   (data) => ({
                country:  data.country,
                country_code: data.country_code,
                latitude: data.latitude,
                longitude: data.longitude,
                is_vpn:   data.is_vpn || false,
                is_proxy: data.is_proxy || false,
                is_tor:   data.is_tor || false,
            }),
        },
        {
            name:     'ipapi-free',
            url:      'https://ipapi.co/json/',
            parser:   (data) => ({
                country:  data.country_name,
                country_code: data.country_code,
                latitude: data.latitude,
                longitude: data.longitude,
                is_vpn:   false,
                is_proxy: false,
                is_tor:   false,
            }),
        },
    ];

    /** Duración del caché de ubicación (ms) */
    const CACHE_TTL = 300000; // 5 minutos

    /* ── Estado ──────────────────────────────────────────────── */
    const state = {
        currentLocation:  null,
        lastGPSLocation:  null,
        locationCache:    null,
        cacheTTL:         null,
        isMonitoring:     false,
        watchId:          null,
        isVpnDetected:    false,
        isBlocked:        false,
    };

    /* ── Utilidades ──────────────────────────────────────────── */

    /**
     * Comprueba si una ubicación está dentro de los límites de Cuba.
     * @param {number} lat - Latitud
     * @param {number} lon - Longitud
     * @returns {boolean}
     */
    function _isInCuba(lat, lon) {
        return (
            lat >= CUBA_BOUNDS.lat.min &&
            lat <= CUBA_BOUNDS.lat.max &&
            lon >= CUBA_BOUNDS.lon.min &&
            lon <= CUBA_BOUNDS.lon.max
        );
    }

    /**
     * Distancia aproximada entre dos puntos (Fórmula de Haversine simplificada).
     * @param {number} lat1
     * @param {number} lon1
     * @param {number} lat2
     * @param {number} lon2
     * @returns {number} distancia en km
     */
    function _distance(lat1, lon1, lat2, lon2) {
        const R = 6371; // radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Realiza una petición GET a una URL con timeout.
     * @param {string} url
     * @param {number} [timeout=5000]
     * @returns {Promise<object>}
     */
    async function _fetchWithTimeout(url, timeout = 5000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' },
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (err) {
            clearTimeout(timeoutId);
            throw err;
        }
    }

    /**
     * Obtiene la ubicación del usuario por IP consultando APIs externas.
     * @returns {Promise<object|null>}
     */
    async function _getLocationByIP() {
        for (const api of GEO_APIS) {
            try {
                const data = await _fetchWithTimeout(api.url, 6000);
                return api.parser(data);
            } catch (err) {
                console.warn(`[geo] API ${api.name} falló:`, err.message);
                continue;
            }
        }
        console.error('[geo] Todas las APIs de geolocalización fallaron');
        return null;
    }

    /**
     * Obtiene la ubicación del navegador usando Geolocation API.
     * @returns {Promise<object|null>}
     */
    function _getLocationByGPS() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn('[geo] Geolocation API no disponible');
                resolve(null);
                return;
            }

            const timeout = setTimeout(() => {
                resolve(null);
                console.warn('[geo] GPS timeout');
            }, 10000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeout);
                    resolve({
                        latitude:  position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy:  position.coords.accuracy,
                        source:    'gps',
                    });
                },
                (error) => {
                    clearTimeout(timeout);
                    console.warn('[geo] GPS error:', error.message);
                    resolve(null);
                },
                { timeout: 10000, maximumAge: 0 }
            );
        });
    }

    /**
     * Valida la consistencia entre ubicación por IP y GPS.
     * Si hay discrepancia significativa, podría indicar VPN.
     * @param {object} ipLocation
     * @param {object} gpsLocation
     * @returns {boolean} true si hay discrepancia sospechosa
     */
    function _detectVPNByLocationMismatch(ipLocation, gpsLocation) {
        if (!ipLocation || !gpsLocation) return false;

        const dist = _distance(
            ipLocation.latitude,
            ipLocation.longitude,
            gpsLocation.latitude,
            gpsLocation.longitude
        );

        // Si la distancia es > 100km, probablemente hay VPN
        return dist > 100;
    }

    /* ── API Pública ─────────────────────────────────────────── */

    /**
     * Inicializa el módulo de geolocalización.
     * Obtiene ubicación por IP y GPS, valida acceso a Cuba.
     * @returns {Promise<object>} { allowed: boolean, location: object, vpnDetected: boolean }
     */
    async function init() {
        try {
            console.log('[geo] Iniciando geolocalización...');

            // Obtener ubicación por IP
            const ipLocation = await _getLocationByIP();
            console.log('[geo] Ubicación por IP:', ipLocation);

            // Obtener ubicación por GPS
            const gpsLocation = await _getLocationByGPS();
            console.log('[geo] Ubicación por GPS:', gpsLocation);

            // Detectar VPN por discrepancia
            const vpnByMismatch = _detectVPNByLocationMismatch(ipLocation, gpsLocation);

            // Detectar VPN por API
            const vpnByAPI = ipLocation && (ipLocation.is_vpn || ipLocation.is_proxy || ipLocation.is_tor);

            const isVpnDetected = vpnByMismatch || vpnByAPI;
            state.isVpnDetected = isVpnDetected;

            if (isVpnDetected) {
                console.warn('[geo] ⚠️ VPN/Proxy detectado');
            }

            // Usar GPS si está disponible, sino usar IP
            const location = gpsLocation || ipLocation;
            state.currentLocation = location;
            state.locationCache = location;
            state.cacheTTL = Date.now();

            // Verificar si está en Cuba
            const isInCuba = location && _isInCuba(location.latitude, location.longitude);
            const countryCode = ipLocation && ipLocation.country_code;

            console.log('[geo] País:', countryCode, '| En Cuba:', isInCuba);

            // Bloquear si no está en Cuba O si usa VPN
            const isBlocked = !isInCuba || isVpnDetected;
            state.isBlocked = isBlocked;

            return {
                allowed:     !isBlocked,
                location,
                vpnDetected: isVpnDetected,
                inCuba:      isInCuba,
                country:     countryCode,
            };

        } catch (err) {
            console.error('[geo] Error en inicialización:', err);
            return {
                allowed:     false,
                location:    null,
                vpnDetected: false,
                inCuba:      false,
                country:     null,
            };
        }
    }

    /**
     * Inicia el monitoreo continuo de ubicación.
     * Verifica cada 30 segundos si el usuario sigue en Cuba.
     * @param {Function} onLocationChange - Callback cuando cambia la ubicación
     * @param {Function} onBlockedChange - Callback cuando cambia estado de bloqueo
     */
    function startMonitoring(onLocationChange, onBlockedChange) {
        if (state.isMonitoring) return;
        state.isMonitoring = true;

        console.log('[geo] Iniciando monitoreo continuo de ubicación...');

        // Monitoreo cada 30 segundos
        const intervalId = setInterval(async () => {
            try {
                // Usar caché si está vigente
                const now = Date.now();
                if (state.locationCache && (now - state.cacheTTL) < CACHE_TTL) {
                    return;
                }

                const gpsLocation = await _getLocationByGPS();
                if (!gpsLocation) return;

                const wasBlocked = state.isBlocked;
                const isInCuba = _isInCuba(gpsLocation.latitude, gpsLocation.longitude);
                state.isBlocked = !isInCuba;
                state.currentLocation = gpsLocation;
                state.locationCache = gpsLocation;
                state.cacheTTL = now;

                if (onLocationChange) {
                    onLocationChange(gpsLocation);
                }

                if (wasBlocked !== state.isBlocked && onBlockedChange) {
                    onBlockedChange(state.isBlocked);
                }

                console.log('[geo] Ubicación actualizada:', gpsLocation);

            } catch (err) {
                console.error('[geo] Error en monitoreo:', err);
            }
        }, 30000);

        state.watchId = intervalId;
    }

    /**
     * Detiene el monitoreo continuo de ubicación.
     */
    function stopMonitoring() {
        if (state.watchId) {
            clearInterval(state.watchId);
            state.watchId = null;
            state.isMonitoring = false;
            console.log('[geo] Monitoreo detenido');
        }
    }

    /**
     * Obtiene la ubicación actual en caché.
     * @returns {object|null}
     */
    function getCurrentLocation() {
        return state.currentLocation;
    }

    /**
     * Comprueba si el usuario está bloqueado.
     * @returns {boolean}
     */
    function isBlocked() {
        return state.isBlocked;
    }

    /**
     * Comprueba si se detectó VPN.
     * @returns {boolean}
     */
    function isVpnDetected() {
        return state.isVpnDetected;
    }

    /* ── Exportación ─────────────────────────────────────────── */
    global.GEO = Object.freeze({
        init,
        startMonitoring,
        stopMonitoring,
        getCurrentLocation,
        isBlocked,
        isVpnDetected,
    });

})(window);
