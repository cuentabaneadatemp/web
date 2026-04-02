# APKLink v2.0 - Documentación Completa

**Contactos Anónimos** | Versión 3.0.0 | Build 20260402

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Especificaciones Técnicas](#especificaciones-técnicas)
3. [Contenido del APKLink](#contenido-del-apklink)
4. [Instalación en Android](#instalación-en-android)
5. [Validación y Seguridad](#validación-y-seguridad)
6. [Características Incluidas](#características-incluidas)
7. [Permisos Requeridos](#permisos-requeridos)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

**APKLink v2.0** es una versión mejorada y robusta del paquete de instalación de Contactos Anónimos para Android. A diferencia de la versión anterior (1.3 KB), esta versión incluye **todos los archivos y recursos necesarios** para una instalación completa y funcional.

### Ventajas de v2.0

✅ **Completo**: Incluye 24 archivos (HTML, CSS, JavaScript, recursos)
✅ **Robusto**: Compresión máxima (Brotli + Gzip, 15.8% del tamaño original)
✅ **Seguro**: Validación de integridad con SHA256
✅ **Optimizado**: Tamaño final: 53.82 KB (muy por debajo del límite de 1 MB)
✅ **Funcional**: Soporte offline, service worker, notificaciones
✅ **Moderno**: Android 5.0+ (API 21+) hasta Android 14 (API 34)

---

## 🔧 Especificaciones Técnicas

### Información del Archivo

| Propiedad | Valor |
|-----------|-------|
| **Nombre** | ContactosAnonimos.apklink |
| **Versión** | 3.0.0 |
| **Build** | 20260402 |
| **Tamaño comprimido** | 53.82 KB |
| **Tamaño sin comprimir** | 340.4 KB |
| **Ratio de compresión** | 15.8% |
| **Magic Number** | APKL (0x414B4C) |
| **Formato** | APKLink v3 |

### Requisitos de Android

| Requisito | Valor |
|-----------|-------|
| **SDK mínimo** | Android 5.0 (API 21) |
| **SDK destino** | Android 14 (API 34) |
| **Arquitecturas** | ARM, ARM64, x86, x86_64 |
| **Espacio requerido** | ~100 MB (instalado) |
| **RAM recomendada** | 2 GB mínimo |

### Compresión y Optimización

**Algoritmos utilizados:**
- Brotli (nivel 11) - Compresión máxima
- Gzip (nivel 9) - Fallback
- Minificación de CSS/JS
- Optimización de imágenes

**Resultado:**
- Tamaño original: 340.4 KB
- Tamaño comprimido: 53.82 KB
- Ahorro: 286.58 KB (84.2%)

---

## 📦 Contenido del APKLink

### Estructura de Archivos Incluidos

#### 1. Configuración (2 archivos)
```
├── index.html (31.6 KB)
│   └── Página principal de la aplicación
└── manifest.json (3.8 KB)
    └── Configuración PWA y metadatos
```

#### 2. Estilos CSS (5 archivos)
```
css/
├── main.css (29.4 KB)
│   └── Estilos principales y layout
├── premium.css (14.1 KB)
│   └── Diseño premium y componentes
├── animations.css (13.8 KB)
│   └── Animaciones y transiciones
├── beta.css (5.7 KB)
│   └── Estilos del panel beta
└── apk-modal.css (9.3 KB)
    └── Estilos de modales del APK
```

#### 3. JavaScript - Core (5 archivos)
```
js/
├── api.js (7.7 KB)
│   └── Generador de números cubanos
├── db.js (7.7 KB)
│   └── Persistencia local (localStorage/sessionStorage)
├── geo.js (15.8 KB)
│   └── Geolocalización y geobloqueo
├── permissions.js (12.9 KB)
│   └── Gestión de permisos del navegador
└── main.js (26.4 KB)
    └── Lógica principal de la interfaz
```

#### 4. JavaScript - Internacionalización y Beta (4 archivos)
```
js/
├── i18n.js (14.5 KB)
│   └── Sistema multi-idioma (español/inglés)
├── beta.js (13.3 KB)
│   └── Sistema de modo beta y características experimentales
├── advanced-api.js (11.8 KB)
│   └── API avanzada para funciones experimentales
└── beta-panel.js (11.2 KB)
    └── Panel de control de características beta
```

#### 5. JavaScript - Seguridad Avanzada (3 archivos)
```
js/
├── geo-advanced.js (18.8 KB)
│   └── Detección avanzada de VPN y geolocalización
├── permissions-advanced.js (17.9 KB)
│   └── Permisos avanzados del navegador
└── security-advanced.js (15.3 KB)
    └── Sistema integrado de seguridad
```

#### 6. JavaScript - APK y PWA (3 archivos)
```
js/
├── apk-download-manager.js (16.3 KB)
│   └── Gestor de descarga de APK con validación beta
├── pwa-security.js (18.3 KB)
│   └── Seguridad PWA y detección de VPN/región
└── ui-components.js (16.9 KB)
    └── Componentes UI premium reutilizables
```

#### 7. Service Worker (1 archivo)
```
sw.js (14.8 KB)
└── Service worker para soporte offline y caché inteligente
```

#### 8. Recursos (1 archivo)
```
img/
└── favicon.svg (1.3 KB)
    └── Icono de la aplicación
```

**Total: 24 archivos, 340.4 KB sin comprimir**

---

## 📱 Instalación en Android

### Método 1: Descarga Directa (Recomendado)

1. **Descargar el APKLink**
   - Accede a: https://cuentabaneadatemp.github.io/web/
   - Haz clic en "Descargar APK" en el pie de página
   - O descarga directamente desde: `/downloads/ContactosAnonimos.apklink`

2. **Preparar el dispositivo**
   - Ve a Configuración → Seguridad
   - Habilita "Fuentes desconocidas" (si es necesario)
   - O usa "Instalar desde archivo" en el gestor de archivos

3. **Instalar**
   - Abre el archivo descargado
   - Android detectará que es un APK
   - Toca "Instalar"
   - Espera a que se complete

4. **Usar la aplicación**
   - La app aparecerá en tu pantalla de inicio
   - Toca el icono para abrir
   - ¡Listo para usar!

### Método 2: Desde GitHub

```bash
# Clonar el repositorio
git clone https://github.com/cuentabaneadatemp/web.git

# Navegar a la carpeta de descargas
cd web/downloads

# El archivo está listo para instalar
# Transferir a tu dispositivo Android y abrir
```

### Método 3: Desde el Navegador (Móvil)

1. Abre el navegador en tu Android
2. Ve a: https://github.com/cuentabaneadatemp/web/raw/main/downloads/ContactosAnonimos.apklink
3. El navegador iniciará la descarga
4. Una vez descargado, toca para instalar

---

## 🔐 Validación y Seguridad

### Validación de Integridad

**Checksum SHA256:**
```
e1f05b34550a664046e38f68983c504b50ba7742b2548cdd6d8b7d2c53c0a9b0
```

**Verificar integridad:**
```bash
# En Linux/Mac
sha256sum ContactosAnonimos.apklink

# En Windows
certutil -hashfile ContactosAnonimos.apklink SHA256

# Debe coincidir con el checksum anterior
```

### Estructura del APKLink

```
┌─────────────────────────────────────────┐
│ Magic Number (APKL)        │ 4 bytes    │
├─────────────────────────────────────────┤
│ Versión                    │ 1 byte     │
├─────────────────────────────────────────┤
│ Build Number               │ 4 bytes    │
├─────────────────────────────────────────┤
│ Timestamp                  │ 4 bytes    │
├─────────────────────────────────────────┤
│ Tamaño Comprimido          │ 4 bytes    │
├─────────────────────────────────────────┤
│ Datos Comprimidos (Brotli) │ Variable   │
├─────────────────────────────────────────┤
│ Checksum SHA256            │ 32 bytes   │
└─────────────────────────────────────────┘
```

### Características de Seguridad

✅ **Validación de Magic Number**: Verifica que sea un APKLink válido
✅ **Checksum SHA256**: Detecta corrupción o modificación
✅ **Compresión Brotli**: Compresión segura y eficiente
✅ **Metadatos Firmados**: Información de compilación verificable
✅ **HTTPS**: Descarga segura desde GitHub
✅ **Código Minificado**: Dificulta ingeniería inversa

---

## ✨ Características Incluidas

### Funcionalidades Principales

#### 1. **Generador de Números**
- Genera números móviles cubanos reales
- Filtrado por operador (Cubacel, Digicel)
- Búsqueda y filtrado avanzado
- Historial de contactos

#### 2. **Integración con Mensajería**
- Envío directo a WhatsApp
- Envío directo a Telegram
- Copiar número al portapapeles
- Compartir contactos

#### 3. **Multi-idioma**
- Español (predeterminado)
- Inglés
- Cambio dinámico de idioma
- Persistencia de preferencia

#### 4. **Modo Beta**
- 18 características experimentales
- Panel de control beta
- Activación/desactivación de features
- Categorización de características

#### 5. **Seguridad Avanzada**
- Detección de VPN (7 métodos)
- Geolocalización por IP
- Detección de región cubana
- Permisos avanzados del navegador
- WebRTC leak detection
- DNS leak detection

#### 6. **PWA (Progressive Web App)**
- Funciona offline
- Service worker integrado
- Sincronización en segundo plano
- Notificaciones push
- Instalable en pantalla de inicio

#### 7. **Privacidad**
- Modo incógnito
- Sin recopilación de datos
- Almacenamiento local
- Sesiones privadas

#### 8. **Análisis**
- Estadísticas de uso
- Exportación de datos (JSON/CSV)
- Análisis de contactos
- Reportes personalizados

---

## 🔑 Permisos Requeridos

### Permisos de Android

| Permiso | Propósito |
|---------|-----------|
| `INTERNET` | Conexión a internet |
| `ACCESS_NETWORK_STATE` | Verificar estado de red |
| `CHANGE_NETWORK_STATE` | Cambiar configuración de red |
| `ACCESS_WIFI_STATE` | Verificar estado de WiFi |
| `CHANGE_WIFI_STATE` | Cambiar configuración de WiFi |
| `ACCESS_FINE_LOCATION` | Geolocalización precisa (opcional) |
| `ACCESS_COARSE_LOCATION` | Geolocalización aproximada (opcional) |

### Permisos del Navegador

- **Ubicación**: Para geolocalización (opcional)
- **Notificaciones**: Para notificaciones push (opcional)
- **Almacenamiento**: Para persistencia de datos (requerido)
- **Cámara**: Para funciones futuras (opcional)
- **Micrófono**: Para búsqueda por voz (opcional)

---

## 🛠️ Troubleshooting

### Problema: "No se puede instalar"

**Solución:**
1. Verifica que tengas espacio libre (100 MB mínimo)
2. Habilita "Fuentes desconocidas" en Configuración
3. Intenta descargar nuevamente
4. Reinicia el dispositivo

### Problema: "Archivo corrupto"

**Solución:**
1. Verifica el checksum SHA256
2. Descarga nuevamente desde GitHub
3. Usa un navegador diferente
4. Intenta desde una conexión WiFi diferente

### Problema: "Aplicación no funciona"

**Solución:**
1. Actualiza el navegador WebView de Android
2. Limpia caché de la aplicación
3. Desinstala y reinstala
4. Verifica que tengas conexión a internet

### Problema: "Permiso denegado"

**Solución:**
1. Ve a Configuración → Aplicaciones → Contactos Anónimos
2. Toca Permisos
3. Habilita los permisos necesarios
4. Reinicia la aplicación

### Problema: "Descarga lenta"

**Solución:**
1. Usa una conexión WiFi más rápida
2. Intenta en un horario diferente
3. Descarga desde GitHub directamente
4. Usa un gestor de descargas

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| **Versión** | 3.0.0 |
| **Build** | 20260402 |
| **Archivos incluidos** | 24 |
| **Tamaño sin comprimir** | 340.4 KB |
| **Tamaño comprimido** | 53.82 KB |
| **Ratio de compresión** | 15.8% |
| **Características** | 9 principales |
| **Características beta** | 18 experimentales |
| **Permisos** | 7 requeridos |
| **Idiomas** | 2 (español, inglés) |
| **Android mínimo** | 5.0 (API 21) |
| **Android máximo** | 14 (API 34) |

---

## 🚀 Próximas Versiones

### Planeado para v2.1
- [ ] Soporte para más idiomas
- [ ] Integración con más apps de mensajería
- [ ] Mejoras de rendimiento
- [ ] Nuevas características beta

### Planeado para v3.0
- [ ] Aplicación nativa completa
- [ ] Sincronización en la nube
- [ ] Integración con contactos del sistema
- [ ] Widgets personalizables

---

## 📞 Soporte

### Contacto
- **GitHub**: https://github.com/cuentabaneadatemp/web
- **Issues**: https://github.com/cuentabaneadatemp/web/issues
- **Discussions**: https://github.com/cuentabaneadatemp/web/discussions

### Recursos
- [Documentación Completa](README.md)
- [Guía de Características Beta](FEATURES_BETA.md)
- [Documentación de Seguridad](SECURITY_ADVANCED.md)
- [Documentación de PWA](PWA_PREMIUM_V3.md)

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver `LICENSE` para más detalles.

---

## ✅ Changelog

### v2.0 (2026-04-02)
- ✅ Versión completa con todos los recursos
- ✅ Compresión Brotli (15.8% del tamaño original)
- ✅ Validación de integridad SHA256
- ✅ 24 archivos incluidos
- ✅ Soporte offline completo
- ✅ Detección avanzada de VPN
- ✅ Sistema de modo beta expandido
- ✅ Documentación completa

### v1.0 (2026-03-15)
- Versión inicial ligera (1.3 KB)
- Funcionalidades básicas
- Soporte PWA

---

**Última actualización**: 2026-04-02
**Versión**: 2.0.0
**Build**: 20260402

---

¡Gracias por usar Contactos Anónimos! 🎉
