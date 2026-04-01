# Análisis Exhaustivo del Repositorio — Contactos Anónimos

## Resumen de Hallazgos

A continuación se documentan todos los errores, inconsistencias y problemas de conectividad detectados en el repositorio.

---

## 1. ERRORES CRÍTICOS

### 1.1 Workflow de GitHub Pages — Ruta de Artefacto Incorrecta
**Archivo:** `docs/github-pages-deploy.yml`  
**Línea:** 40  
**Problema:** El workflow sube únicamente `./src` como artefacto, pero `index.html` está en la raíz del repositorio. Esto hace que el sitio desplegado en GitHub Pages NO funcione, ya que falta el punto de entrada principal.  
**Corrección:** Cambiar `path: './src'` por `path: '.'` (raíz del repositorio).

### 1.2 Workflow en Ubicación Incorrecta
**Archivo:** `docs/github-pages-deploy.yml`  
**Problema:** El archivo del workflow está en `docs/` en lugar de `.github/workflows/`. GitHub Actions NO detecta workflows fuera de `.github/workflows/`, por lo que el CI/CD nunca se ejecuta automáticamente.  
**Corrección:** Mover el archivo a `.github/workflows/deploy.yml`.

### 1.3 CSP Bloquea las APIs de Geolocalización
**Archivo:** `index.html` (línea 11-19)  
**Problema:** La directiva `connect-src 'none'` en el Content Security Policy bloquea TODAS las conexiones de red, incluyendo las llamadas a `https://ipwho.is/` y `https://ipapi.co/json/` que hace `geo.js`. Esto hace que el geobloqueo siempre falle silenciosamente.  
**Corrección:** Actualizar `connect-src` para permitir los dominios de las APIs de geolocalización.

### 1.4 Conflicto en Permisos: Geolocalización Bloqueada por Permissions-Policy
**Archivo:** `index.html` (línea 25)  
**Problema:** La meta etiqueta `Permissions-Policy` tiene `geolocation=()` que bloquea el acceso a la Geolocation API del navegador, pero el módulo `permissions.js` y `geo.js` dependen de ella. Esto crea una contradicción: se solicita geolocalización pero la política la deshabilita.  
**Corrección:** Cambiar a `geolocation=(self)` para permitir el uso en el origen propio.

### 1.5 Comentario HTML Malformado
**Archivo:** `index.html` (línea 353)  
**Problema:** El comentario de cierre de la sección de modales está malformado: `<!-- ══════════════<!-- ════════════════════════════════════════`. Hay un comentario de apertura anidado dentro de otro comentario, lo cual es HTML inválido.  
**Corrección:** Limpiar el comentario duplicado.

### 1.6 Punto y Coma Extra en main.js
**Archivo:** `src/assets/js/main.js` (línea 535)  
**Problema:** Hay un punto y coma extra después del bloque `if/else` de inicialización: `};` en la línea 535, lo que genera código sintácticamente incorrecto (aunque los motores JS modernos lo toleran, es un error de estilo y potencial problema en modo estricto).

---

## 2. ERRORES DE CONECTIVIDAD Y ESTRUCTURA

### 2.1 Ruta del Ícono de Notificación Incorrecta
**Archivo:** `src/assets/js/permissions.js` (líneas 160-163)  
**Problema:** La notificación de prueba usa `icon: 'assets/img/favicon.svg'` (ruta relativa sin `src/`), pero el archivo real está en `src/assets/img/favicon.svg`. La ruta incorrecta causará que el ícono no aparezca en la notificación.  
**Corrección:** Cambiar a `icon: 'src/assets/img/favicon.svg'`.

### 2.2 Límites Geográficos de Cuba Incompletos
**Archivo:** `src/assets/js/geo.js` (líneas 22-25)  
**Problema:** Los límites de Cuba definidos son `lat: { min: 19.8, max: 20.4 }`, pero Cuba se extiende desde aproximadamente 19.8°N hasta 23.2°N. Los límites actuales excluyen la mayor parte del territorio cubano (La Habana está a ~23.1°N), lo que bloquearía a usuarios legítimos.  
**Corrección:** Actualizar a `lat: { min: 19.8, max: 23.3 }`.

### 2.3 Módulo DOM — Referencia Faltante al Modal de Permisos
**Archivo:** `src/assets/js/main.js` (líneas 43-60)  
**Problema:** El objeto `DOM` no incluye referencias a `loadingPermissionsModal`, `blockedAccessModal`, ni `permissionsDeniedModal`. La función `checkAccessRequirements()` los obtiene mediante `$()` directamente en lugar de usar el objeto `DOM`, lo que es inconsistente con el patrón del resto del código.

### 2.4 Enlace de Telegram Usa Formato Incorrecto
**Archivo:** `src/assets/js/api.js` (línea 82)  
**Problema:** El enlace de Telegram se construye como `https://t.me/${encodeURIComponent(number)}?text=${text}`, pero Telegram no acepta números de teléfono en la URL de `t.me/`. El formato correcto para iniciar un chat por número es `https://t.me/+{number}` sin `encodeURIComponent` en el número, o usar la API `tg://resolve`.  
**Corrección:** Cambiar a `https://t.me/+${COUNTRY_CODE}${raw}?text=${text}`.

---

## 3. DOCUMENTACIÓN FALTANTE O INCORRECTA

### 3.1 README.md — Rutas Incorrectas
**Archivo:** `README.md`  
**Problema:** El README menciona `src/index.html` como punto de entrada, pero el archivo real es `index.html` en la raíz. También referencia `.github/workflows/deploy.yml` que no existe (el workflow está en `docs/`). Además menciona un `ARCHITECTURE.md` que no existe en el repositorio.

### 3.2 CONTRIBUTING.md — Estructura Desactualizada
**Archivo:** `CONTRIBUTING.md`  
**Problema:** El árbol de estructura del proyecto no incluye `geo.js` ni `permissions.js` (módulos que sí existen), y sigue referenciando `src/index.html` en lugar de `index.html`.

### 3.3 Falta Archivo ARCHITECTURE.md
**Problema:** El README referencia un `ARCHITECTURE.md` que no existe en el repositorio.

### 3.4 Falta Archivo CHANGELOG.md
**Problema:** No existe un registro de cambios entre versiones.

### 3.5 Falta Archivo .github/workflows/deploy.yml
**Problema:** El workflow de CI/CD está en `docs/` en lugar de `.github/workflows/`, por lo que GitHub Actions nunca lo detecta.

---

## 4. PROBLEMAS DE INTERFAZ Y ADAPTABILIDAD

### 4.1 Breakpoints Responsivos Insuficientes
**Archivo:** `src/assets/css/main.css`  
**Problema:** Solo hay 3 breakpoints (768px, 640px, 380px). Falta cobertura para tablets (1024px) y pantallas grandes (1440px+). La grilla de números usa `minmax(290px, 1fr)` que puede generar tarjetas muy anchas en pantallas grandes.

### 4.2 Banner h1 con Emojis de Bandera como Texto
**Archivo:** `index.html` (línea 77)  
**Problema:** El h1 usa emojis de letras `🇼 🇪 🇧` separados por espacios para simular "WEB", lo que es semánticamente incorrecto, no accesible para lectores de pantalla, y visualmente inconsistente.

### 4.3 Estilos Inline en HTML
**Archivo:** `index.html`  
**Problema:** Múltiples elementos usan `style=""` inline (modales, párrafos, etc.), lo que dificulta el mantenimiento y viola la separación de responsabilidades.

### 4.4 Falta de Estado Visual "Activo" en Botones de Tema
**Archivo:** `src/assets/css/main.css`  
**Problema:** No hay clase `.active` para los botones de tema, por lo que el usuario no puede saber qué tema está activo actualmente.

### 4.5 Toast No Adaptable en Móviles
**Archivo:** `src/assets/css/main.css` (línea 584)  
**Problema:** El toast usa `white-space: nowrap` y `left: 50%`, lo que puede desbordarse en pantallas muy pequeñas.

---

## 5. PROBLEMAS DE SEGURIDAD MENORES

### 5.1 Caché de Permisos Puede Ser Explotado
**Archivo:** `src/assets/js/permissions.js`  
**Problema:** El caché de permisos se guarda en `localStorage` sin firma ni integridad. Un usuario podría modificar manualmente el caché para saltarse la verificación de permisos.

### 5.2 Geolocalización por GPS Priorizada Sobre IP
**Archivo:** `src/assets/js/geo.js` (línea 246)  
**Problema:** `const location = gpsLocation || ipLocation` prioriza GPS sobre IP. Si el GPS no está disponible, se usa IP, pero si el GPS da coordenadas fuera de Cuba (por error de precisión), el usuario legítimo es bloqueado.
