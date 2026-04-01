/**
 * api.js — Módulo de Generación de Números
 * Contactos Anónimos v2.0
 *
 * Genera números de teléfono móvil cubanos válidos de forma
 * aleatoria, formatea los datos y construye los enlaces de
 * contacto para WhatsApp y Telegram.
 *
 * Formato cubano: +53 5X XXX XXXX
 * Prefijo móvil:  5 + dígito válido (2-9) + 6 dígitos
 */

(function (global) {
    'use strict';

    /* ── Constantes ──────────────────────────────────────────── */

    /** Segundo dígito válido para móviles cubanos (5X...) */
    const VALID_SECOND_DIGITS = Object.freeze(['2', '3', '4', '5', '6', '7', '8', '9']);

    /** Prefijo internacional de Cuba */
    const COUNTRY_CODE = '53';

    /** Intentos máximos para evitar bucles infinitos */
    const MAX_ATTEMPTS = 50_000;

    /** Mensaje por defecto si no se proporciona uno */
    const DEFAULT_MESSAGE = 'Hola, vi tu número en la red anónima. ¿Charlamos?';

    /* ── Generación de números ───────────────────────────────── */

    /**
     * Genera un número de móvil cubano crudo (sin formato).
     * @returns {string} 8 dígitos, ej. "52345678"
     */
    function _generateRaw() {
        const second = VALID_SECOND_DIGITS[
            Math.floor(Math.random() * VALID_SECOND_DIGITS.length)
        ];
        let rest = '';
        for (let i = 0; i < 6; i++) {
            rest += Math.floor(Math.random() * 10);
        }
        return `5${second}${rest}`;
    }

    /**
     * Formatea un número crudo al estilo internacional.
     * @param {string} raw - 8 dígitos
     * @returns {string} "+53 5X XXX XXXX"
     */
    function formatNumber(raw) {
        if (!raw || raw.length !== 8) return raw;
        return `+${COUNTRY_CODE} ${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5)}`;
    }

    /**
     * Construye el enlace de WhatsApp para un número.
     * @param {string} raw
     * @param {string} message
     * @returns {string}
     */
    function _buildWhatsAppLink(raw, message) {
        const number = `${COUNTRY_CODE}${raw}`;
        const text   = encodeURIComponent(
            _sanitizeMessage(message || DEFAULT_MESSAGE)
        );
        return `https://wa.me/${number}?text=${text}`;
    }

    /**
     * Construye el enlace de Telegram para un número.
     * @param {string} raw
     * @param {string} message
     * @returns {string}
     */
    function _buildTelegramLink(raw, message) {
        const number = `+${COUNTRY_CODE}${raw}`;
        const text   = encodeURIComponent(
            _sanitizeMessage(message || DEFAULT_MESSAGE)
        );
        return `https://t.me/${encodeURIComponent(number)}?text=${text}`;
    }

    /**
     * Sanitiza el mensaje del usuario para evitar inyecciones.
     * @param {string} msg
     * @returns {string}
     */
    function _sanitizeMessage(msg) {
        if (typeof msg !== 'string') return DEFAULT_MESSAGE;
        // Eliminar caracteres de control y limitar longitud
        return msg
            .replace(/[\x00-\x1F\x7F]/g, '')
            .trim()
            .slice(0, 300) || DEFAULT_MESSAGE;
    }

    /**
     * Genera un ID único para cada entrada de número.
     * @param {string} raw
     * @returns {string}
     */
    function _generateEntryId(raw) {
        return `${Date.now().toString(36)}-${raw}-${Math.random().toString(36).slice(2, 6)}`;
    }

    /* ── API principal ───────────────────────────────────────── */

    /**
     * Genera un lote de números únicos no repetidos.
     *
     * @param {number}      count       - Cantidad de números a generar
     * @param {Set<string>} existingSet - Conjunto de números ya usados
     * @param {string}      [message]   - Mensaje personalizado para los enlaces
     * @returns {{ newNumbers: Array, usedSet: Set<string> }}
     */
    function generateUniqueNumbers(count, existingSet, message) {
        const safeCount = Math.max(1, Math.min(count, 50));
        const used      = new Set(existingSet instanceof Set ? existingSet : []);
        const results   = [];
        let   attempts  = 0;
        const msg       = _sanitizeMessage(message || DEFAULT_MESSAGE);

        while (results.length < safeCount && attempts < MAX_ATTEMPTS) {
            attempts++;
            const raw = _generateRaw();

            if (used.has(raw)) continue;

            used.add(raw);
            results.push({
                id:           _generateEntryId(raw),
                raw,
                formatted:    formatNumber(raw),
                waLink:       _buildWhatsAppLink(raw, msg),
                telegramLink: _buildTelegramLink(raw, msg),
                generatedAt:  Date.now(),
            });
        }

        return { newNumbers: results, usedSet: used };
    }

    /**
     * Valida si una cadena es un número de móvil cubano válido.
     * @param {string} raw
     * @returns {boolean}
     */
    function isValidCubanMobile(raw) {
        if (typeof raw !== 'string' || raw.length !== 8) return false;
        if (raw[0] !== '5') return false;
        if (!VALID_SECOND_DIGITS.includes(raw[1])) return false;
        return /^\d{8}$/.test(raw);
    }

    /* ── Exportación ─────────────────────────────────────────── */
    global.API = Object.freeze({
        generateUniqueNumbers,
        formatNumber,
        isValidCubanMobile,
        DEFAULT_MESSAGE,
        COUNTRY_CODE,
    });

})(window);
