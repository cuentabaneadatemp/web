# Seguridad Avanzada - Detección de VPN y Geolocalización v3.0

## Descripción General

El sistema de seguridad avanzada implementa múltiples capas de detección de VPN, geolocalización mejorada y gestión de permisos del navegador para garantizar que solo usuarios autorizados en Cuba puedan acceder a la plataforma.

## Arquitectura de Seguridad

### 1. Módulo de Geolocalización Avanzada (geo-advanced.js)

Implementa 7 métodos diferentes de detección de VPN:

#### Métodos de Detección de VPN

**1. Detección por API (30 puntos)**
- Consulta múltiples APIs de geolocalización (ipwho.is, ipapi.co)
- Verifica flags de VPN, Proxy y Tor
- Ejemplo: `is_vpn: true`, `is_proxy: true`, `is_tor: true`

**2. Detección por Discrepancia de Ubicación (30 puntos)**
- Compara ubicación por IP vs ubicación por GPS
- Umbral: >100 km de diferencia = VPN sospechoso
- Ejemplo: IP en USA, GPS en Cuba = VPN detectado

**3. Detección por Patrones de ISP (20 puntos)**
- Analiza el nombre del ISP/Organización
- Busca patrones de VPN conocidos (ExpressVPN, NordVPN, etc.)
- Lista de 20+ patrones de VPN populares

**4. Detección por Tipo de Conexión (15 puntos)**
- Verifica el tipo de conexión reportado
- Tipos sospechosos: vpn, proxy, datacenter, hosting, tor, relay, anonymizer

**5. Detección por WebRTC Leak (10 puntos)**
- Detecta fugas de IP real a través de WebRTC
- Crea peer connection y analiza candidatos ICE
- Identifica IPs locales que no coinciden con IP reportada

**6. Detección por DNS Leak (10 puntos)**
- Intenta resolver dominios externos
- Verifica si el DNS está siendo redirigido
- Indica posible túnel VPN

**7. Puntuación Combinada (0-100)**
- Suma puntuaciones de todos los métodos
- Umbral de bloqueo: ≥40 puntos
- Proporciona análisis detallado de cada método

### 2. Módulo de Permisos Avanzados (permissions-advanced.js)

Expande los permisos del navegador de 3 a 15:

#### Permisos Obligatorios (5)

1. **Geolocalización (GPS)**
   - Necesario para verificar ubicación en Cuba
   - Timeout: 8 segundos
   - Precisión: Alta

2. **Almacenamiento (localStorage/sessionStorage/IndexedDB)**
   - Necesario para sesión y caché
   - Verifica lectura/escritura en localStorage, sessionStorage e IndexedDB

3. **Notificaciones**
   - Necesario para alertas de seguridad
   - Envía notificación de bienvenida al conceder

4. **Cookies**
   - Necesario para persistencia de sesión
   - Verifica lectura/escritura de cookies

5. **Acceso a Red (Fetch/XHR)**
   - Necesario para consultar APIs
   - Verifica conectividad a internet

#### Permisos Opcionales (10)

6. **Cámara** - Para futuras características de verificación
7. **Micrófono** - Para futuras características de audio
8. **Vibración** - Para retroalimentación háptica
9. **Acelerómetro** - Para detectar movimiento del dispositivo
10. **Giroscopio** - Para detectar orientación del dispositivo
11. **Sensor de Luz** - Para detectar ambiente
12. **Sensor de Proximidad** - Para detectar cercanía
13. **Acceso a Archivos** - Para futuras características de carga
14. **Portapapeles** - Para compartir contenido
15. **Pantalla Completa** - Para modo inmersivo

### 3. Módulo de Seguridad Integrada (security-advanced.js)

Integra geo-advanced.js y permissions-advanced.js en un sistema cohesivo:

#### Niveles de Amenaza

```javascript
THREAT_LEVELS = {
    CRITICAL: 'critical',  // Acceso bloqueado inmediatamente
    HIGH: 'high',          // Alerta de seguridad importante
    MEDIUM: 'medium',      // Advertencia moderada
    LOW: 'low',            // Información de seguridad
    INFO: 'info',          // Evento informativo
}
```

#### Cálculo de Puntuación de Amenaza

- Acceso bloqueado: +50 puntos → CRITICAL
- VPN detectado: +30 puntos → HIGH
- VPN score ≥70: +20 puntos → HIGH
- Permisos incompletos: +15 puntos → MEDIUM
- Permisos específicos rechazados: +10 puntos cada uno
- WebRTC leak: +25 puntos → MEDIUM
- DNS leak: +20 puntos → MEDIUM

#### Funcionalidades

1. **Registro de Seguridad**
   - Registra todos los eventos de seguridad
   - Almacena hasta 1000 entradas
   - Persistencia en localStorage

2. **Sistema de Alertas**
   - Alertas activas con TTL de 1 hora
   - Eventos personalizados para cada alerta
   - Posibilidad de descartar alertas

3. **Monitoreo Continuo**
   - Verifica seguridad cada 5 minutos (configurable)
   - Detecta cambios de ubicación
   - Alerta si se detecta VPN durante la sesión

4. **Reportes Detallados**
   - Información de geolocalización
   - Estado de permisos
   - Historial de eventos
   - Alertas activas

## Flujo de Seguridad

### Inicialización

```
1. Usuario accede a la plataforma
   ↓
2. SECURITY_ADVANCED.init() se ejecuta
   ↓
3. GEO_ADVANCED.init() verifica ubicación
   ├─ Consulta APIs de geolocalización
   ├─ Obtiene ubicación por GPS
   ├─ Ejecuta 7 métodos de detección de VPN
   └─ Calcula puntuación de VPN (0-100)
   ↓
4. PERMISSIONS_ADVANCED.requestMandatoryPermissions()
   ├─ Verifica geolocalización
   ├─ Verifica almacenamiento
   ├─ Verifica notificaciones
   ├─ Verifica cookies
   └─ Verifica acceso a red
   ↓
5. Calcular nivel de amenaza
   ↓
6. Registrar eventos y crear alertas
   ↓
7. Bloquear o permitir acceso
   ↓
8. Iniciar monitoreo continuo
```

### Monitoreo Continuo

```
Cada 5 minutos:
1. Verificar ubicación actual (GPS)
2. Verificar si sigue en Cuba
3. Si cambió de ubicación:
   ├─ Registrar evento
   ├─ Crear alerta
   └─ Posiblemente bloquear acceso
```

## API Pública

### GEO_ADVANCED

```javascript
// Inicializar
const geoResult = await GEO_ADVANCED.init();
// Retorna: { allowed, location, vpnDetected, vpnScore, vpnDetectionMethods, ... }

// Iniciar monitoreo
GEO_ADVANCED.startMonitoring(onLocationChange, onBlockedChange, onVPNDetected);

// Detener monitoreo
GEO_ADVANCED.stopMonitoring();

// Obtener ubicación actual
const location = GEO_ADVANCED.getCurrentLocation();

// Obtener información de VPN
const vpnInfo = GEO_ADVANCED.getVPNDetectionInfo();
// Retorna: { isDetected, score, methods, webrtcLeakIPs, dnsLeakDetected }

// Obtener estado completo
const state = GEO_ADVANCED.getState();
```

### PERMISSIONS_ADVANCED

```javascript
// Solicitar permisos obligatorios
const mandatoryResult = await PERMISSIONS_ADVANCED.requestMandatoryPermissions();
// Retorna: { geolocation, storage, notifications, cookies, networkAccess, allApproved }

// Solicitar permisos opcionales
const optionalResult = await PERMISSIONS_ADVANCED.requestOptionalPermissions();
// Retorna: { camera, microphone, vibration, accelerometer, gyroscope, ... }

// Obtener información detallada
const info = PERMISSIONS_ADVANCED.getDetailedPermissionsInfo();

// Verificar si todos los permisos obligatorios fueron aprobados
const approved = PERMISSIONS_ADVANCED.areMandatoryPermissionsApproved();

// Obtener estado de permisos
const status = PERMISSIONS_ADVANCED.getPermissionsStatus();

// Revocar caché de permisos
PERMISSIONS_ADVANCED.revokePermissionsCache();
```

### SECURITY_ADVANCED

```javascript
// Inicializar
const securityResult = await SECURITY_ADVANCED.init();
// Retorna: { allowed, threatLevel, threatScore, geoResult, permissionsResult }

// Iniciar monitoreo
SECURITY_ADVANCED.startMonitoring(300000); // Cada 5 minutos

// Detener monitoreo
SECURITY_ADVANCED.stopMonitoring();

// Obtener estado de seguridad
const status = SECURITY_ADVANCED.getSecurityStatus();
// Retorna: { isBlocked, threatLevel, lastCheck, activeAlerts, alertCount, logEntries }

// Obtener log de seguridad
const log = SECURITY_ADVANCED.getSecurityLog(100); // Últimas 100 entradas

// Obtener alertas activas
const alerts = SECURITY_ADVANCED.getActiveAlerts();

// Descartar una alerta
SECURITY_ADVANCED.dismissAlert(alertId);

// Obtener información detallada
const detailed = SECURITY_ADVANCED.getDetailedSecurityInfo();

// Limpiar log
SECURITY_ADVANCED.clearSecurityLog();

// Limpiar alertas
SECURITY_ADVANCED.clearAlerts();

// Constantes de niveles de amenaza
SECURITY_ADVANCED.THREAT_LEVELS.CRITICAL
SECURITY_ADVANCED.THREAT_LEVELS.HIGH
SECURITY_ADVANCED.THREAT_LEVELS.MEDIUM
SECURITY_ADVANCED.THREAT_LEVELS.LOW
SECURITY_ADVANCED.THREAT_LEVELS.INFO
```

## Eventos Personalizados

### Evento de Alerta de Seguridad

```javascript
window.addEventListener('securityalert', (event) => {
    const alert = event.detail;
    console.log('Alerta:', alert.title);
    console.log('Nivel:', alert.level);
    console.log('Mensaje:', alert.message);
    console.log('Acción:', alert.action);
});
```

## Almacenamiento Local

### Claves de localStorage

- `_ca_permissions_v3` - Caché de permisos (TTL: 24 horas)
- `_ca_security_log_v3` - Log de eventos de seguridad
- `_ca_security_alerts_v3` - Alertas activas

## Limitaciones y Consideraciones

### Limitaciones Técnicas

1. **WebRTC Leak**: Algunos navegadores pueden no soportar WebRTC
2. **DNS Leak**: Requiere acceso a internet
3. **GPS**: Requiere permiso del usuario y puede no estar disponible en todos los dispositivos
4. **APIs Externas**: Dependen de disponibilidad de ipwho.is e ipapi.co

### Consideraciones de Privacidad

- Todos los datos de seguridad se almacenan localmente
- No se envían datos personales a servidores externos
- Los logs se pueden limpiar en cualquier momento
- Las alertas se expiran automáticamente después de 1 hora

### Consideraciones de Rendimiento

- Las verificaciones de seguridad se ejecutan en paralelo
- El monitoreo continuo se puede ajustar (por defecto: 5 minutos)
- El log se limita a 1000 entradas máximo
- Las APIs tienen timeout de 6 segundos

## Mejoras Futuras

1. Integración con base de datos de VPN en tiempo real
2. Machine learning para detectar patrones de VPN
3. Análisis de comportamiento del usuario
4. Integración con servicios de reputación de IP
5. Notificaciones en tiempo real de amenazas
6. Dashboard de seguridad para administradores
7. Exportación de reportes de seguridad
8. Integración con sistemas SIEM

## Debugging y Troubleshooting

### Ver logs de seguridad

```javascript
console.log(SECURITY_ADVANCED.getSecurityLog());
```

### Ver alertas activas

```javascript
console.log(SECURITY_ADVANCED.getActiveAlerts());
```

### Ver información de VPN

```javascript
console.log(GEO_ADVANCED.getVPNDetectionInfo());
```

### Ver estado de permisos

```javascript
console.log(PERMISSIONS_ADVANCED.getDetailedPermissionsInfo());
```

### Limpiar caché de permisos

```javascript
PERMISSIONS_ADVANCED.revokePermissionsCache();
```

## Referencias

- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API)
- [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

**Última actualización:** Abril 2026
**Versión:** 3.0
