# Características Experimentales - Modo Beta

## Descripción General

El modo beta permite a los usuarios participar en características experimentales y ayudar a mejorar la plataforma. Todas las características están deshabilitadas por defecto y pueden activarse desde el panel de control beta.

## Cómo Activar el Modo Beta

1. Haz clic en el botón **BETA** (icono de frasco) en la esquina superior derecha
2. Se abrirá el panel de características experimentales
3. Activa las características que deseas probar
4. Los cambios se guardan automáticamente

## Características Disponibles

### 1. Generador Avanzado de Números
**Versión:** 2.1.0

Permite filtrar números por operador y región específica de Cuba.

**Funcionalidades:**
- Filtrado por operador (ETECSA, Digicel, Viya)
- Filtrado por provincia/región
- Generación con criterios específicos
- Predicción de disponibilidad

**API:**
```javascript
// Generar números con filtros
const numbers = AdvancedAPI.generateWithFilters({
  operator: '2',  // ETECSA
  region: '01',   // La Habana
  count: 5
});

// Obtener operadores disponibles
const operators = AdvancedAPI.getOperators();

// Obtener regiones disponibles
const regions = AdvancedAPI.getRegions();
```

### 2. Análisis de Contactos
**Versión:** 2.1.0

Proporciona estadísticas detalladas sobre el uso de la plataforma.

**Funcionalidades:**
- Estadísticas de generación de números
- Análisis de patrones de uso
- Reporte de actividad
- Métricas por sesión

**API:**
```javascript
// Obtener análisis de contactos
const analytics = AdvancedAPI.getContactAnalytics();
// Retorna: { totalGenerated, totalSearches, totalResets, historyCount, ... }

// Generar reporte completo de uso
const report = AdvancedAPI.generateUsageReport();
// Retorna: { ...analytics, daysActive, generatedPerDay, reportGeneratedAt }
```

### 3. Temas Personalizados
**Versión:** 2.1.0

Crea y gestiona temas visuales personalizados.

**Funcionalidades:**
- Crear temas con paletas de colores personalizadas
- Guardar múltiples temas
- Aplicar temas guardados
- Sincronización con preferencias del SO

**API:**
```javascript
// Crear un tema personalizado
const theme = AdvancedAPI.createCustomTheme({
  name: 'Mi Tema Oscuro',
  description: 'Un tema personalizado oscuro',
  primary: '#FF6B35',
  secondary: '#004E89',
  accent: '#F77F00',
  background: '#03060c',
  foreground: '#FFFFFF'
});

// Obtener todos los temas
const themes = AdvancedAPI.getCustomThemes();

// Aplicar un tema
AdvancedAPI.applyCustomTheme(themeId);

// Eliminar un tema
AdvancedAPI.deleteCustomTheme(themeId);
```

### 4. Notificaciones Mejoradas
**Versión:** 2.1.0

Sistema avanzado de notificaciones con alertas personalizadas.

**Funcionalidades:**
- Alertas de números nuevos
- Recordatorios de uso
- Notificaciones de actualizaciones del sistema
- Control granular de notificaciones

### 5. Modo Incógnito
**Versión:** 2.1.0

Usa la plataforma sin guardar historial o datos.

**Funcionalidades:**
- Sesiones privadas sin historial
- Borrado automático de datos
- Modo sin permisos opcionales
- Privacidad mejorada

### 6. Exportación de Datos
**Versión:** 2.1.0

Descarga tu historial de contactos en múltiples formatos.

**Funcionalidades:**
- Exportar como CSV
- Exportar como JSON
- Descarga directa de archivos
- Preservación de metadatos

**API:**
```javascript
// Exportar como CSV
const csv = AdvancedAPI.exportHistoryAsCSV();

// Exportar como JSON
const json = AdvancedAPI.exportHistoryAsJSON();

// Descargar archivo
AdvancedAPI.downloadFile(content, 'archivo.csv', 'text/csv');
```

### 7. Búsqueda Avanzada
**Versión:** 2.1.0

Búsqueda y filtrado avanzado de contactos.

**Funcionalidades:**
- Búsqueda por criterios múltiples
- Filtrado por fecha
- Ordenamiento personalizado
- Historial mejorado

### 8. Sincronización Automática de Tema
**Versión:** 2.1.0

Sincroniza automáticamente el tema con las preferencias del sistema operativo.

**Funcionalidades:**
- Detección de preferencia de tema del SO
- Cambio automático (claro/oscuro)
- Sincronización en tiempo real
- Respeto a preferencias del usuario

## Sistema de Internacionalización (i18n)

### Idiomas Soportados
- **Español (es)** - Por defecto
- **Inglés (en)** - Disponible

### Cambiar Idioma
1. Haz clic en el botón de **idioma** (icono de globo) en la esquina superior derecha
2. El idioma se cambiará inmediatamente
3. La preferencia se guardará automáticamente

### Características de i18n
- Detección automática del idioma del navegador
- Persistencia de preferencia de idioma
- Traducción dinámica de elementos del DOM
- Soporte para interpolación de variables
- Eventos de cambio de idioma

**API:**
```javascript
// Obtener traducción
const text = i18n.t('btn.search');

// Cambiar idioma
i18n.setLanguage('en');

// Obtener idioma actual
const current = i18n.getLanguage();

// Obtener idiomas soportados
const supported = i18n.getSupportedLanguages();

// Escuchar cambios de idioma
window.addEventListener('languagechange', (e) => {
  console.log('Idioma cambiado a:', e.detail.language);
});
```

## Sistema de Feature Flags (Beta)

### Gestión de Características

**API:**
```javascript
// Verificar si modo beta está habilitado
const enabled = BETA.isBetaEnabled();

// Habilitar/deshabilitar modo beta
BETA.setBetaMode(true);

// Obtener información de una característica
const feature = BETA.getFeature('advancedGenerator');

// Obtener todas las características
const features = BETA.getAllFeatures();

// Verificar si una característica está habilitada
const isEnabled = BETA.isFeatureEnabled('advancedGenerator');

// Habilitar una característica
BETA.enableFeature('advancedGenerator');

// Deshabilitar una característica
BETA.disableFeature('advancedGenerator');

// Obtener características habilitadas
const enabled = BETA.getEnabledFeatures();

// Obtener estado de todas las características
const status = BETA.getFeatureStatus();

// Resetear modo beta
BETA.reset();

// Obtener información de versión
const version = BETA.getVersion();
```

### Escuchar Cambios de Características

```javascript
// Escuchar cambios de modo beta
window.addEventListener('betamodechange', (e) => {
  console.log('Modo beta:', e.detail.enabled);
  console.log('Características:', e.detail.features);
});

// Escuchar cambios de características específicas
window.addEventListener('betafeaturechange', (e) => {
  console.log('Característica:', e.detail.featureId);
  console.log('Habilitada:', e.detail.enabled);
});
```

## Panel de Control Beta

### Interfaz del Panel

El panel de control beta proporciona:
- Lista de todas las características experimentales
- Toggles para habilitar/deshabilitar características
- Información de versión de cada característica
- Botones de acciones (Exportar Datos, Resetear)
- Información de estado general

### Acciones del Panel

**Exportar Datos:**
- Descarga tu historial de contactos
- Elige entre formato CSV o JSON
- Archivo se descarga automáticamente

**Resetear:**
- Desactiva todas las características experimentales
- Requiere confirmación
- Restaura estado por defecto

## Consideraciones de Seguridad

- Todas las características experimentales se ejecutan localmente
- No se recopilan datos adicionales
- Las preferencias se guardan en localStorage
- Los datos se pueden exportar en cualquier momento
- Modo incógnito no guarda historial

## Reportar Problemas

Si encuentras problemas con características experimentales:

1. Anota los pasos para reproducir el problema
2. Verifica tu navegador y versión
3. Intenta desactivar otras características
4. Reporta en el repositorio de GitHub

## Roadmap Futuro

Características planeadas para versiones futuras:

- Sincronización en la nube
- Compartir temas personalizados
- Análisis avanzado con gráficos
- Integración con APIs externas
- Notificaciones por email
- Autenticación de usuarios
- Historial sincronizado entre dispositivos

## Feedback y Contribuciones

Tu feedback es importante para mejorar estas características. Puedes:

- Reportar bugs en GitHub Issues
- Sugerir mejoras en Discussions
- Contribuir código en Pull Requests
- Compartir experiencias en la comunidad

---

**Última actualización:** Abril 2026
**Versión de Características Beta:** 2.1.0
