# Buddy Android App — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir la web app de voz Kast en una app Android llamada Buddy con tema Dark Cosmos, bottom navigation, almacenamiento seguro de API keys, soporte de Ultravox y Groq pipeline, e i18n ES/EN/FR.

**Architecture:** El HTML de Kast (single-file, ~4000 líneas) se transforma y se coloca en `buddy/www/index.html`. Capacitor genera el proyecto Android y sirve ese HTML en un WebView nativo. El plugin `capacitor-secure-storage-plugin` se expone como `window.Capacitor.Plugins.SecureStoragePlugin` al JS del WebView. Las API keys se guardan en Android Keystore. Todo lo demás (personas, stats) queda en localStorage.

**Tech Stack:** HTML/CSS/JS vanilla · Capacitor 8 (instalado: 8.4.0) · capacitor-secure-storage-plugin@0.13.0 · Android SDK 34 · Node.js 20+ · Java 17

**Nota:** En Task 8, usar `window.Capacitor.Plugins.SecureStoragePlugin` (no `SecureStorage`) para el plugin instalado.

---

## Prerequisitos (verificar antes de empezar)

- [ ] Node.js 20+ instalado: `node --version`
- [ ] Java 17 instalado: `java --version`
- [ ] Android Studio instalado con SDK 34 y un emulador Android 13+ configurado
- [ ] Variables de entorno: `ANDROID_HOME` y `JAVA_HOME` configuradas

---

## Estructura de archivos final

```
buddy/
├── www/
│   └── index.html          ← app completa (single-file, todo inline)
├── android/                ← generado por Capacitor (no editar manualmente)
├── capacitor.config.json   ← configuración del APK
└── package.json            ← Capacitor + plugin secure-storage
```

---

## Task 1: Crear la estructura del proyecto Capacitor

**Files:**
- Create: `buddy/package.json`
- Create: `buddy/capacitor.config.json`
- Create: `buddy/www/index.html` (placeholder, se rellena en Task 2)

- [ ] **Step 1: Crear el directorio del proyecto**

```bash
cd "C:\Users\xavie\OneDrive\Documentos\Cerrador"
mkdir buddy
cd buddy
mkdir www
```

- [ ] **Step 2: Crear package.json**

Crear el archivo `buddy/package.json` con este contenido exacto:

```json
{
  "name": "buddy-voice-app",
  "version": "1.0.0",
  "description": "Buddy — AI Voice Assistant",
  "main": "index.js",
  "scripts": {
    "build": "echo 'No build step — single file HTML'",
    "sync": "npx cap sync android",
    "open": "npx cap open android"
  },
  "dependencies": {
    "@capacitor/android": "^6.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor-community/secure-storage": "^0.9.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0"
  }
}
```

- [ ] **Step 3: Instalar dependencias**

```bash
cd buddy
npm install
```

Resultado esperado: carpeta `node_modules/` creada, sin errores.

- [ ] **Step 4: Crear capacitor.config.json**

```json
{
  "appId": "com.buddy.voiceapp",
  "appName": "Buddy",
  "webDir": "www",
  "android": {
    "buildOptions": {
      "releaseType": "APK"
    }
  },
  "plugins": {
    "SecureStorage": {
      "keychainService": "buddy_secure_storage"
    }
  }
}
```

- [ ] **Step 5: Crear placeholder HTML**

Crear `buddy/www/index.html` con contenido mínimo (se reemplaza en Task 2):

```html
<!DOCTYPE html>
<html><body><h1>Buddy placeholder</h1></body></html>
```

- [ ] **Step 6: Inicializar Capacitor y añadir Android**

```bash
cd buddy
npx cap init Buddy com.buddy.voiceapp --web-dir www
npx cap add android
```

Resultado esperado: carpeta `android/` creada con proyecto Gradle.

- [ ] **Step 7: Commit**

```bash
git add buddy/package.json buddy/capacitor.config.json buddy/www/index.html
git commit -m "feat: initialize Capacitor project structure for Buddy"
```

---

## Task 2: Transformar el HTML de Kast — renombrado base

**Files:**
- Modify: `buddy/www/index.html` ← reemplazar con HTML transformado de Kast

El HTML de Kast está en el historial de conversación del diseño. Este task hace los cambios de renombrado básico.

- [ ] **Step 1: Copiar el HTML de Kast a buddy/www/index.html**

Pegar el HTML completo de Kast en `buddy/www/index.html`.

- [ ] **Step 2: Renombrar todas las ocurrencias de texto "Kast" → "Buddy"**

Hacer búsqueda y reemplazo global (case-sensitive) en el archivo:

| Buscar | Reemplazar |
|---|---|
| `KAST` | `BUDDY` |
| `Kast` | `Buddy` |
| `kast` | `buddy` |
| `title>Kast` | `title>Buddy` |
| `Bienvenue sur Kast` | `Bienvenue sur Buddy` |
| `Bienvenue sur Buddy — Assistant Vocal` | `Buddy — Voice Assistant` |

- [ ] **Step 3: Renombrar las claves de localStorage**

Hacer búsqueda y reemplazo global:

| Buscar | Reemplazar |
|---|---|
| `'kast_apiKey'` | `'buddy_apiKey'` |
| `'kast_geminiApiKey'` | `'buddy_geminiApiKey'` |
| `'kast_theme'` | `'buddy_theme'` |
| `'kast_realtimeModel'` | `'buddy_realtimeModel'` |
| `'kast_budgetLimit'` | `'buddy_budgetLimit'` |
| `'kast_personas'` | `'buddy_personas'` |
| `'kast_activePersonaId'` | `'buddy_activePersonaId'` |
| `'kast_userInfo'` | `'buddy_userInfo'` |
| `'kast_stats'` | `'buddy_stats'` |
| `'kast_sidebarCollapsed'` | `'buddy_sidebarCollapsed'` |
| `kast-backup-` | `buddy-backup-` |
| `kast-persona-` | `buddy-persona-` |
| `kast-persona` | `buddy-persona` |
| `type: 'kast-persona'` | `type: 'buddy-persona'` |
| `data.type !== 'kast-persona'` | `data.type !== 'buddy-persona'` |

- [ ] **Step 4: Actualizar el título y favicon**

Localizar y reemplazar en el `<head>`:

```html
<!-- ANTES -->
<title>Kast — Assistant Vocal</title>

<!-- DESPUÉS -->
<title>Buddy — Voice Assistant</title>
```

- [ ] **Step 5: Eliminar el crédito de Xavier Bourdet del footer**

Localizar el `<div class="app-footer">` y reemplazar con:

```html
<div class="app-footer">
    Buddy — AI Voice Assistant &nbsp;·&nbsp; v1.0
</div>
```

También eliminar el `<div class="logo-credit">` del sidebar.

- [ ] **Step 6: Verificar en navegador**

Abrir `buddy/www/index.html` directamente en Chrome. Verificar:
- El título de la pestaña dice "Buddy — Voice Assistant"
- El logo en el sidebar dice "BUDDY"
- No hay referencias a "Kast" visibles en la UI

- [ ] **Step 7: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: rename Kast to Buddy, update localStorage keys"
```

---

## Task 3: Dark Cosmos — rediseño de colores y tema

**Files:**
- Modify: `buddy/www/index.html` — sección `<style>` con las variables CSS

- [ ] **Step 1: Reemplazar las variables CSS del tema oscuro**

Localizar el bloque `:root { ... }` (tema oscuro, que empieza con `--bg-primary: #0f0f1a`) y reemplazarlo completamente con:

```css
:root {
    --bg-primary: #0a0a1f;
    --bg-secondary: #0f0f2e;
    --bg-sidebar: #08081a;
    --bg-input: #0a0a20;
    --bg-hover: rgba(139,92,246,0.08);
    --bg-active: rgba(139,92,246,0.18);
    --text-primary: #e2d9f3;
    --text-secondary: #9a8cb0;
    --text-muted: #4a4060;
    --accent: #8b5cf6;
    --accent2: #ec4899;
    --danger: #f87171;
    --success: #34d399;
    --border: rgba(139,92,246,0.15);
    --shadow: rgba(0,0,0,0.6);
    --modal-bg: #0f0f2e;
    --canvas-bg: #0a0a1f;
    --transcript-user: rgba(139,92,246,0.12);
    --transcript-ai: rgba(236,72,153,0.10);
}
```

- [ ] **Step 2: Reemplazar las variables CSS del tema claro**

Localizar el bloque `[data-theme="light"] { ... }` y reemplazarlo con:

```css
[data-theme="light"] {
    --bg-primary: #f3f0ff;
    --bg-secondary: #ffffff;
    --bg-sidebar: #ede8ff;
    --bg-input: #f5f2ff;
    --bg-hover: rgba(109,40,217,0.06);
    --bg-active: rgba(109,40,217,0.12);
    --text-primary: #1a0a2e;
    --text-secondary: #5a4a7a;
    --text-muted: #9a8cb0;
    --accent: #6d28d9;
    --accent2: #db2777;
    --danger: #dc2626;
    --success: #059669;
    --border: rgba(109,40,217,0.15);
    --shadow: rgba(109,40,217,0.12);
    --modal-bg: #ffffff;
    --canvas-bg: #ede8ff;
    --transcript-user: rgba(109,40,217,0.08);
    --transcript-ai: rgba(219,39,119,0.07);
}
```

- [ ] **Step 3: Actualizar el SVG del logo en el sidebar**

Localizar el `<svg>` dentro del `<div class="logo">` y reemplazarlo con uno que use gradiente violeta/rosa:

```html
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="buddyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#8b5cf6"/>
            <stop offset="100%" stop-color="#ec4899"/>
        </linearGradient>
    </defs>
    <rect x="15" y="25" width="70" height="55" rx="14" fill="url(#buddyGrad)"/>
    <rect x="22" y="20" width="56" height="10" rx="5" fill="url(#buddyGrad)" opacity="0.6"/>
    <circle cx="37" cy="48" r="8" fill="#0a0a1f"/>
    <circle cx="63" cy="48" r="8" fill="#0a0a1f"/>
    <circle cx="37" cy="48" r="4" fill="#fff"/>
    <circle cx="63" cy="48" r="4" fill="#fff"/>
    <rect x="35" y="62" width="30" height="6" rx="3" fill="#0a0a1f"/>
    <rect x="8" y="45" width="10" height="6" rx="3" fill="url(#buddyGrad)" opacity="0.5"/>
    <rect x="82" y="45" width="10" height="6" rx="3" fill="url(#buddyGrad)" opacity="0.5"/>
</svg>
```

- [ ] **Step 4: Actualizar el favicon SVG en el `<head>`**

Localizar la línea `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">` y reemplazar el SVG inline con uno que use violeta:

```html
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='15' y='25' width='70' height='55' rx='14' fill='%238b5cf6'/%3E%3Ccircle cx='37' cy='48' r='8' fill='%230a0a1f'/%3E%3Ccircle cx='63' cy='48' r='8' fill='%230a0a1f'/%3E%3Ccircle cx='37' cy='48' r='4' fill='%23fff'/%3E%3Ccircle cx='63' cy='48' r='4' fill='%23fff'/%3E%3Crect x='35' y='62' width='30' height='6' rx='3' fill='%230a0a1f'/%3E%3C/svg%3E">
```

- [ ] **Step 5: Actualizar colores de los visualizadores**

Localizar la función `drawRadialViz` y buscar las llamadas en `animate()`. Cambiar los colores de los visualizadores:

```js
// ANTES (en animate()):
drawRadialViz(personaCtx, personaCanvas, smoothPersonaLevel, 'rgb(255, 183, 77)', time, personaSpeaking);
drawRadialViz(userCtx, userCanvas, smoothUserLevel, 'rgb(79, 195, 247)', time, userSpeaking);

// DESPUÉS:
drawRadialViz(personaCtx, personaCanvas, smoothPersonaLevel, 'rgb(236, 72, 153)', time, personaSpeaking);
drawRadialViz(userCtx, userCanvas, smoothUserLevel, 'rgb(139, 92, 246)', time, userSpeaking);
```

También actualizar el transcripteur:
```js
// ANTES:
drawRadialViz(userCtx, userCanvas, smoothUserLevel, 'rgb(79, 195, 247)', time, userSpeaking);
// DESPUÉS:
drawRadialViz(userCtx, userCanvas, smoothUserLevel, 'rgb(139, 92, 246)', time, userSpeaking);
```

- [ ] **Step 6: Actualizar los colores de las etiquetas del vizBar**

Localizar las clases CSS `.viz-label.persona` y `.viz-label.user`:

```css
/* ANTES */
.viz-label.persona { color: var(--accent2); }
.viz-label.user { color: var(--accent); }

/* DESPUÉS — ya correcto con las nuevas variables, solo verificar */
/* accent = #8b5cf6 (violeta) para user */
/* accent2 = #ec4899 (rosa) para persona */
```

También actualizar las clases del modo claro:
```css
/* ANTES */
[data-theme="light"] .viz-label.persona { color: #ffb74d; }
[data-theme="light"] .viz-label.user { color: #4fc3f7; }

/* DESPUÉS */
[data-theme="light"] .viz-label.persona { color: #db2777; }
[data-theme="light"] .viz-label.user { color: #6d28d9; }
```

- [ ] **Step 7: Añadir gradiente al body para efecto cósmico**

Localizar el estilo del `body` y añadir:

```css
body {
    /* ... propiedades existentes ... */
    background: radial-gradient(ellipse at 20% 50%, rgba(109,40,217,0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.06) 0%, transparent 50%),
                var(--bg-primary);
}
```

- [ ] **Step 8: Verificar en navegador**

Abrir `buddy/www/index.html` en Chrome. Verificar:
- Fondo oscuro con tono azul/cósmico
- Botones y acentos en violeta/rosa
- Logo con gradiente violeta→rosa
- Visualizadores en violeta y rosa (crear un persona y pulsar "Iniciar" para verlos)

- [ ] **Step 9: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: apply Dark Cosmos theme (violet/pink neon, cosmic gradient)"
```

---

## Task 4: Bottom navigation — reemplazar el sidebar

**Files:**
- Modify: `buddy/www/index.html` — estructura HTML + CSS del layout

Este task es el más grande estructuralmente. El sidebar de 280px se reemplaza por una barra de navegación inferior con 4 tabs. Las secciones (Personas, Stats, Config) se convierten en "pantallas" que se muestran/ocultan según el tab activo.

- [ ] **Step 1: Modificar el CSS del grid del body**

Localizar `body { ... grid-template-columns: 280px 1fr; ... }` y cambiar:

```css
body {
    /* mantener todas las propiedades existentes excepto grid */
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: radial-gradient(ellipse at 20% 50%, rgba(109,40,217,0.08) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.06) 0%, transparent 50%),
                var(--bg-primary);
    color: var(--text-primary);
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: background 0.3s, color 0.3s;
}
```

- [ ] **Step 2: Eliminar el CSS del sidebar**

Eliminar (o comentar) todos los bloques CSS que empiezan con `#sidebar`, `.sidebar-header`, `.sidebar-footer`, `.sidebar-section-header`, `#sidebarToggle`, `body.sidebar-collapsed`, y `body.sidebar-mobile-open`.

- [ ] **Step 3: Añadir CSS del bottom navigation**

Añadir al final del bloque `<style>`, antes de `</style>`:

```css
/* ═══════════════════════════════════════
   BOTTOM NAVIGATION
   ═══════════════════════════════════════ */
#bottomNav {
    display: flex;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    padding: 8px 0 max(8px, env(safe-area-inset-bottom));
    flex-shrink: 0;
    z-index: 100;
}

.nav-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 4px;
    border: none;
    background: none;
    color: var(--text-muted);
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: color 0.2s;
    font-family: inherit;
}

.nav-tab .nav-icon {
    font-size: 1.3rem;
    transition: transform 0.2s;
}

.nav-tab.active {
    color: var(--accent);
}

.nav-tab.active .nav-icon {
    transform: scale(1.15);
}

.nav-tab:hover:not(.active) {
    color: var(--text-secondary);
}

/* Pantallas de las tabs */
#screenHome, #screenPersonas, #screenStats, #screenConfig {
    flex: 1;
    overflow: hidden;
    display: none;
    flex-direction: column;
}

#screenHome.active, #screenPersonas.active,
#screenStats.active, #screenConfig.active {
    display: flex;
}

/* Área de contenido principal */
#appContent {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
}

/* Pantalla de personas (grid) */
#screenPersonas {
    overflow-y: auto;
    padding: 16px;
    gap: 12px;
}

.personas-grid-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    flex-shrink: 0;
}

.personas-grid-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
}

/* Pantalla de configuración */
#screenConfig {
    overflow-y: auto;
    padding: 16px;
}

/* Pantalla de stats */
#screenStats {
    overflow-y: auto;
    padding: 16px;
}
```

- [ ] **Step 4: Reemplazar el HTML del `<body>`**

Localizar el HTML de la estructura principal (el `<aside id="sidebar">`, el `<div id="sidebarToggle">` y el `<main id="main">`) y reemplazarlo con:

```html
<body>

  <!-- ════════ CONTENIDO PRINCIPAL ════════ -->
  <div id="appContent">

    <!-- PANTALLA: Inicio (conversación) -->
    <div id="screenHome" class="active">
      <!-- Botones flotantes arriba -->
      <button id="homeBtn" class="main-top-btn" title="Inicio" style="display:none">⌂</button>
      <button id="themeToggleBtn" class="main-top-btn" title="Tema">☽</button>

      <div id="emptyState">
          <div class="welcome-title">Bienvenido a Buddy</div>
          <div class="welcome-subtitle">Elige un persona o crea uno nuevo</div>
          <div class="welcome-grid" id="welcomeGrid"></div>
      </div>

      <div id="conversationArea" style="display:none">
          <div id="conversationBody">
              <div id="personaHeader">
                  <div id="personaHeaderAvatar"></div>
                  <div class="persona-header-info">
                      <div id="personaHeaderName"></div>
                      <div id="personaHeaderDesc"></div>
                  </div>
                  <button class="btn-edit-persona" id="duplicatePersonaBtn" title="Duplicar"><span class="icon">⧉</span></button>
                  <button class="btn-edit-persona" id="editPersonaBtn" title="Editar"><span class="icon">✎</span></button>
              </div>
              <div id="vizBar">
                  <span class="viz-label persona" id="personaVizLabel">Persona</span>
                  <div id="vizLinkWrap"><canvas id="vizLinkCanvas" width="400" height="24"></canvas></div>
                  <span class="viz-label user">Yo</span>
              </div>
              <div id="visualizers">
                  <div class="viz-container"><canvas id="personaViz" width="280" height="280"></canvas></div>
                  <div class="viz-container"><canvas id="userViz" width="280" height="280"></canvas></div>
              </div>
              <div id="controls">
                  <button class="btn btn-start" id="startBtn">Iniciar conversación</button>
                  <button class="btn-pause" id="pauseBtn" style="display:none">⏸</button>
                  <button class="btn-mute" id="muteBtn" style="display:none"><span class="icon">🎤</span></button>
                  <button class="btn btn-stop" id="stopBtn" style="display:none">Terminar</button>
              </div>
              <div id="status">Listo</div>
              <div id="sessionBar" style="display:none">
                  <div class="session-item"><span class="session-dot live"></span> <span id="sessionTimer">0:00</span></div>
                  <div class="session-item" id="sessionModel"></div>
                  <div class="session-item" id="sessionTokens"></div>
                  <div class="session-item" id="sessionCost"></div>
              </div>
              <div class="transcript-header">
                  <button class="transcript-toggle" id="transcriptToggle"><span class="icon">▼</span> Transcripción</button>
                  <div style="flex:1"></div>
                  <button class="transcript-export-btn" id="copyTranscriptBtn"><span class="icon">📋</span> Copiar</button>
                  <button class="transcript-export-btn" id="exportTranscriptBtnConv"><span class="icon">📄</span> Exportar</button>
              </div>
              <div id="transcript">
                  <div class="transcript-empty">La transcripción aparecerá aquí...</div>
              </div>
          </div>
      </div>

      <div class="app-footer">Buddy — AI Voice Assistant &nbsp;·&nbsp; v1.0</div>
    </div>

    <!-- PANTALLA: Personas -->
    <div id="screenPersonas">
      <div class="personas-grid-header">
          <div class="personas-grid-title">Mis personas</div>
          <button class="btn-new-persona" id="newPersonaBtn" style="width:auto;padding:8px 14px;font-size:0.82rem">+ Nuevo</button>
      </div>
      <!-- Importar persona -->
      <label id="importPersonaLabel" style="display:none"><input type="file" id="importPersonaInput" accept=".json" style="display:none"></label>
      <!-- Grid de personas (mismo welcomeGrid reutilizado, ver JS) -->
      <div class="welcome-grid" id="personasGrid"></div>
    </div>

    <!-- PANTALLA: Stats -->
    <div id="screenStats">
      <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:16px;color:var(--text-primary)">Estadísticas</h2>
      <div class="stats-tabs" id="statsTabBtns">
          <button data-stats-tab="periods" class="active">Períodos</button>
          <button data-stats-tab="personas">Personas</button>
          <button data-stats-tab="models">Modelos</button>
      </div>
      <div id="statsContent"></div>
    </div>

    <!-- PANTALLA: Config -->
    <div id="screenConfig">
      <!-- El contenido del modal de config se mueve aquí como pantalla inline -->
      <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:16px;color:var(--text-primary)">Configuración</h2>
      <div id="configInlineContent">
          <!-- Se rellena en Task 5 (i18n) y Task 8 (secure storage) -->
          <!-- Por ahora, el botón de config sigue abriendo el modal -->
          <button class="sidebar-footer-btn" id="apiConfigBtn" style="width:100%;padding:12px;background:var(--bg-hover);border:1px solid var(--border);border-radius:10px;color:var(--text-secondary);font-size:0.9rem;cursor:pointer;margin-bottom:8px">⚙ API Keys y Modelo</button>
          <button class="sidebar-footer-btn" id="myInfoBtn" style="width:100%;padding:12px;background:var(--bg-hover);border:1px solid var(--border);border-radius:10px;color:var(--text-secondary);font-size:0.9rem;cursor:pointer;margin-bottom:8px">👤 Mis información</button>
          <button class="sidebar-footer-btn" id="backupBtn" style="width:100%;padding:12px;background:var(--bg-hover);border:1px solid var(--border);border-radius:10px;color:var(--text-secondary);font-size:0.9rem;cursor:pointer;margin-bottom:8px">💾 Copia de seguridad</button>
      </div>
    </div>

  </div><!-- /appContent -->

  <!-- ════════ BOTTOM NAVIGATION ════════ -->
  <nav id="bottomNav">
      <button class="nav-tab active" data-tab="home">
          <span class="nav-icon">🏠</span>
          <span data-i18n="nav_home">Inicio</span>
      </button>
      <button class="nav-tab" data-tab="personas">
          <span class="nav-icon">👤</span>
          <span data-i18n="nav_personas">Personas</span>
      </button>
      <button class="nav-tab" data-tab="stats">
          <span class="nav-icon">📊</span>
          <span data-i18n="nav_stats">Stats</span>
      </button>
      <button class="nav-tab" data-tab="config">
          <span class="nav-icon">⚙️</span>
          <span data-i18n="nav_config">Config</span>
      </button>
  </nav>

  <!-- ════════ MODALS (se mantienen igual) ════════ -->
  <!-- ... pegar todos los modals del HTML original aquí ... -->
```

- [ ] **Step 5: Añadir JS del bottom navigation**

Añadir al inicio del bloque `<script>` (antes de cualquier otra cosa):

```js
// ════════════════════════════════════════════════
//  BOTTOM NAVIGATION
// ════════════════════════════════════════════════

const screens = {
    home: document.getElementById('screenHome'),
    personas: document.getElementById('screenPersonas'),
    stats: document.getElementById('screenStats'),
    config: document.getElementById('screenConfig')
};

let activeTab = 'home';

function switchTab(tab) {
    // Ocultar todas las pantallas
    Object.values(screens).forEach(s => s.classList.remove('active'));
    // Mostrar la pantalla activa
    screens[tab].classList.add('active');
    // Actualizar tabs
    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    activeTab = tab;

    // Si es la tab de personas, renderizar el grid
    if (tab === 'personas') {
        renderPersonasGrid();
    }
    // Si es la tab de stats, renderizar stats
    if (tab === 'stats') {
        renderStats('periods');
        document.querySelectorAll('#statsTabBtns button').forEach(b => {
            b.classList.toggle('active', b.dataset.statsTab === 'periods');
        });
    }
}

document.getElementById('bottomNav').addEventListener('click', (e) => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;
    switchTab(tab.dataset.tab);
});

// Función para renderizar el grid de personas en la pantalla Personas
function renderPersonasGrid() {
    const grid = document.getElementById('personasGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const list = getPersonas();

    list.forEach(p => {
        const card = document.createElement('div');
        card.className = 'welcome-card';
        card.innerHTML = `
            <button class="welcome-card-menu-btn" title="Opciones">&hellip;</button>
            <div class="welcome-card-menu">
                <button data-action="edit"><span class="icon">✎</span> Editar</button>
                <button data-action="duplicate"><span class="icon">⧉</span> Duplicar</button>
                <button data-action="export"><span class="icon">💾</span> Exportar</button>
                <button data-action="delete" class="danger"><span class="icon">🗑</span> Eliminar</button>
            </div>
            <div class="welcome-card-avatar">
                ${p.image ? `<img src="${p.image}">` : `<div class="welcome-card-placeholder">${p.name.charAt(0).toUpperCase()}</div>`}
            </div>
            <div class="welcome-card-name">${esc(p.name)}</div>
            <div class="welcome-card-desc">${esc(p.description || '')}</div>
        `;
        // Clic en la tarjeta → ir a conversación
        card.addEventListener('click', (e) => {
            if (e.target.closest('.welcome-card-menu-btn') || e.target.closest('.welcome-card-menu')) return;
            selectPersona(p.id);
            switchTab('home');
        });
        // Menu "..." — reutilizar lógica de renderWelcomeGrid
        const menuBtn = card.querySelector('.welcome-card-menu-btn');
        const menu = card.querySelector('.welcome-card-menu');
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            grid.querySelectorAll('.welcome-card-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
            menu.classList.toggle('open');
        });
        menu.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
            e.stopPropagation(); menu.classList.remove('open'); openPersonaModal(p);
        });
        menu.querySelector('[data-action="duplicate"]').addEventListener('click', (e) => {
            e.stopPropagation(); menu.classList.remove('open');
            const dup = {...JSON.parse(JSON.stringify(p)), id:'p_'+Date.now(), name: p.name+' (copia)'};
            const all = getPersonas(); all.push(dup); savePersonas(all);
            renderPersonasGrid();
        });
        menu.querySelector('[data-action="export"]').addEventListener('click', (e) => {
            e.stopPropagation(); menu.classList.remove('open');
            const exp = { type:'buddy-persona', version:1, exportDate: new Date().toISOString(), persona: {name:p.name,description:p.description,image:p.image,model:p.model,voice:p.voice,reactivity:p.reactivity,creativity:p.creativity,greeting:p.greeting,translateLang:p.translateLang,prompt:p.prompt}};
            downloadFile(JSON.stringify(exp,null,2), `buddy-persona-${p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.json`, 'application/json');
        });
        menu.querySelector('[data-action="delete"]').addEventListener('click', async (e) => {
            e.stopPropagation(); menu.classList.remove('open');
            if (!await customConfirm(`¿Eliminar «${p.name}»?`, {title:'Eliminar persona', icon:'🗑', confirmLabel:'Eliminar', danger:true})) return;
            const newList = getPersonas().filter(x => x.id !== p.id);
            savePersonas(newList);
            if (getActiveId() === p.id) { setActiveId(''); showEmptyState(); }
            renderPersonasGrid();
        });
        grid.appendChild(card);
    });

    // Tarjeta transcriptor
    const trCard = document.createElement('div');
    trCard.className = 'welcome-card welcome-card-new';
    trCard.innerHTML = `<div class="welcome-card-avatar"><div class="transcripteur-card-icon">T</div></div><div class="welcome-card-name">Transcriptor</div><div class="welcome-card-desc">Transcripción de voz</div>`;
    trCard.addEventListener('click', () => { selectTranscripteur(); switchTab('home'); });
    grid.appendChild(trCard);

    // Tarjeta "+ Nuevo"
    const newCard = document.createElement('div');
    newCard.className = 'welcome-card welcome-card-new';
    newCard.innerHTML = `<div class="welcome-card-new-icon">+</div><div class="welcome-card-name">Nuevo persona</div>`;
    newCard.addEventListener('click', () => openPersonaModal());
    grid.appendChild(newCard);

    // Tarjeta Importar
    const importCard = document.createElement('label');
    importCard.className = 'welcome-card welcome-card-new';
    importCard.style.cursor = 'pointer';
    importCard.innerHTML = `<div class="welcome-card-new-icon"><span class="icon">📂</span></div><div class="welcome-card-name">Importar</div><input type="file" accept=".json" style="display:none" class="welcome-import-input">`;
    importCard.querySelector('.welcome-import-input').addEventListener('change', (e) => {
        document.getElementById('importPersonaInput').files = e.target.files;
        document.getElementById('importPersonaInput').dispatchEvent(new Event('change'));
        e.target.value = '';
    });
    grid.appendChild(importCard);
}
```

- [ ] **Step 6: Actualizar la función showEmptyState**

La función original `showEmptyState()` mostraba el grid de bienvenida. En la nueva versión, cuando no hay persona activo en la tab Home, mostramos el grid de bienvenida dentro de `#emptyState`. Actualizar:

```js
function showEmptyState() {
    restoreTranscripteurLayout();
    isTranscripteurMode = false;
    document.getElementById('conversationArea').classList.remove('transcripteur-mode');
    const trTop = document.getElementById('transcripteurTop');
    if (trTop) trTop.remove();
    document.getElementById('startBtn').textContent = 'Iniciar conversación';

    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('conversationArea').style.display = 'none';
    setActiveId('');
    // Renderizar el grid de bienvenida dentro del emptyState
    renderWelcomeGrid();
}
```

- [ ] **Step 7: Eliminar el sidebar del HTML**

Eliminar el `<aside id="sidebar">...</aside>` completo y el `<div id="sidebarToggle">` del HTML.

- [ ] **Step 8: Verificar en navegador**

Abrir `buddy/www/index.html` en Chrome con DevTools en modo móvil (Ctrl+Shift+M, iPhone 14 Pro). Verificar:
- Bottom nav visible con 4 tabs
- Tab Inicio muestra la conversación
- Tab Personas muestra el grid
- Tab Stats muestra las estadísticas
- Tab Config muestra los botones de configuración
- Los modals (editar persona, API config) siguen funcionando

- [ ] **Step 9: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: replace sidebar with bottom navigation, add 4-tab layout"
```

---

## Task 5: i18n — ES / EN / FR

**Files:**
- Modify: `buddy/www/index.html` — añadir sistema de traducciones inline

- [ ] **Step 1: Añadir el objeto de traducciones**

Añadir al inicio del `<script>`, justo antes del código del bottom navigation:

```js
// ════════════════════════════════════════════════
//  I18N — TRADUCCIONES ES / EN / FR
// ════════════════════════════════════════════════

const TRANSLATIONS = {
    es: {
        nav_home: 'Inicio', nav_personas: 'Personas', nav_stats: 'Stats', nav_config: 'Config',
        welcome_title: 'Bienvenido a Buddy',
        welcome_subtitle: 'Elige un persona o crea uno nuevo',
        btn_new_persona: '+ Nuevo persona',
        btn_import_persona: 'Importar persona',
        btn_start: 'Iniciar conversación',
        btn_start_transcribe: 'Iniciar transcripción',
        btn_stop: 'Terminar',
        btn_mute_on: 'Silenciar micrófono',
        btn_mute_off: 'Activar micrófono',
        status_ready: 'Listo',
        status_connecting: 'Conectando...',
        status_connected: '¡Conectado — habla!',
        status_speaking: 'Hablando...',
        status_listening: 'Escuchando...',
        status_thinking: 'Pensando...',
        status_paused: 'Pausa',
        status_muted: 'Micrófono silenciado',
        transcript_placeholder: 'La transcripción aparecerá aquí...',
        transcript_label: 'Transcripción',
        btn_copy: 'Copiar',
        btn_export: 'Exportar',
        config_title: 'Configuración',
        config_api_openai: 'Clave API OpenAI',
        config_api_gemini: 'Clave API Google Gemini',
        config_api_ultravox: 'Clave API Ultravox',
        config_api_groq: 'Clave API Groq',
        config_model_default: 'Modelo por defecto',
        config_budget: 'Presupuesto mensual',
        btn_save: 'Guardar',
        btn_cancel: 'Cancelar',
        my_info_title: 'Mis datos',
        backup_title: 'Copia de seguridad',
        stats_title: 'Estadísticas',
        persona_new_title: 'Nuevo persona',
        persona_edit_title: 'Editar persona',
        insights_title: 'Nuevos datos detectados sobre ti',
        model_using_default: 'Usar modelo por defecto',
    },
    en: {
        nav_home: 'Home', nav_personas: 'Personas', nav_stats: 'Stats', nav_config: 'Config',
        welcome_title: 'Welcome to Buddy',
        welcome_subtitle: 'Choose a persona or create a new one',
        btn_new_persona: '+ New persona',
        btn_import_persona: 'Import persona',
        btn_start: 'Start conversation',
        btn_start_transcribe: 'Start transcription',
        btn_stop: 'End',
        btn_mute_on: 'Mute microphone',
        btn_mute_off: 'Unmute microphone',
        status_ready: 'Ready',
        status_connecting: 'Connecting...',
        status_connected: 'Connected — speak!',
        status_speaking: 'Speaking...',
        status_listening: 'Listening...',
        status_thinking: 'Thinking...',
        status_paused: 'Paused',
        status_muted: 'Microphone muted',
        transcript_placeholder: 'Transcript will appear here...',
        transcript_label: 'Transcript',
        btn_copy: 'Copy',
        btn_export: 'Export',
        config_title: 'Settings',
        config_api_openai: 'OpenAI API Key',
        config_api_gemini: 'Google Gemini API Key',
        config_api_ultravox: 'Ultravox API Key',
        config_api_groq: 'Groq API Key',
        config_model_default: 'Default model',
        config_budget: 'Monthly budget',
        btn_save: 'Save',
        btn_cancel: 'Cancel',
        my_info_title: 'My information',
        backup_title: 'Backup',
        stats_title: 'Statistics',
        persona_new_title: 'New persona',
        persona_edit_title: 'Edit persona',
        insights_title: 'New info detected about you',
        model_using_default: 'Use default model',
    },
    fr: {
        nav_home: 'Accueil', nav_personas: 'Personas', nav_stats: 'Stats', nav_config: 'Config',
        welcome_title: 'Bienvenue sur Buddy',
        welcome_subtitle: 'Choisissez un persona ou créez-en un nouveau',
        btn_new_persona: '+ Nouveau persona',
        btn_import_persona: 'Importer un persona',
        btn_start: 'Démarrer la conversation',
        btn_start_transcribe: 'Démarrer la transcription',
        btn_stop: 'Terminer',
        btn_mute_on: 'Couper le micro',
        btn_mute_off: 'Activer le micro',
        status_ready: 'Prêt',
        status_connecting: 'Connexion...',
        status_connected: 'Connecté — parlez !',
        status_speaking: 'Parle...',
        status_listening: 'Écoute...',
        status_thinking: 'Réfléchit...',
        status_paused: 'Pause',
        status_muted: 'Micro coupé',
        transcript_placeholder: 'La transcription apparaîtra ici...',
        transcript_label: 'Transcription',
        btn_copy: 'Copier',
        btn_export: 'Exporter',
        config_title: 'Configuration',
        config_api_openai: 'Clé API OpenAI',
        config_api_gemini: 'Clé API Google Gemini',
        config_api_ultravox: 'Clé API Ultravox',
        config_api_groq: 'Clé API Groq',
        config_model_default: 'Modèle par défaut',
        config_budget: 'Budget mensuel',
        btn_save: 'Sauvegarder',
        btn_cancel: 'Annuler',
        my_info_title: 'Mes informations',
        backup_title: 'Sauvegarde',
        stats_title: 'Statistiques',
        persona_new_title: 'Nouveau persona',
        persona_edit_title: 'Modifier le persona',
        insights_title: 'Nouvelles infos détectées sur vous',
        model_using_default: 'Utiliser le modèle par défaut',
    }
};

function detectLang() {
    const saved = localStorage.getItem('buddy_lang');
    if (saved && TRANSLATIONS[saved]) return saved;
    const nav = (navigator.language || navigator.userLanguage || 'en').slice(0, 2).toLowerCase();
    return TRANSLATIONS[nav] ? nav : 'en';
}

let LANG = detectLang();

function t(key) {
    return (TRANSLATIONS[LANG] && TRANSLATIONS[LANG][key]) || TRANSLATIONS['en'][key] || key;
}

function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });
}

function setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    LANG = lang;
    localStorage.setItem('buddy_lang', lang);
    applyI18n();
}
```

- [ ] **Step 2: Añadir atributos data-i18n al HTML**

Añadir `data-i18n` a los elementos de texto estático clave. Ejemplos:

```html
<!-- Welcome title -->
<div class="welcome-title" data-i18n="welcome_title">Welcome to Buddy</div>
<div class="welcome-subtitle" data-i18n="welcome_subtitle">Choose a persona or create a new one</div>

<!-- Start button -->
<button class="btn btn-start" id="startBtn" data-i18n="btn_start">Start conversation</button>
<button class="btn btn-stop" id="stopBtn" data-i18n="btn_stop">End</button>

<!-- Transcript -->
<div class="transcript-empty" data-i18n="transcript_placeholder">Transcript will appear here...</div>
```

- [ ] **Step 3: Llamar a applyI18n() al final del script**

Al final del `<script>`, justo antes del cierre `</script>`, añadir:

```js
// Aplicar traducciones al cargar
applyI18n();
```

- [ ] **Step 4: Añadir selector de idioma en la pantalla Config**

En el `<div id="screenConfig">`, dentro de `#configInlineContent`, añadir:

```html
<div style="margin-bottom:8px">
    <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">Idioma / Language / Langue</div>
    <div style="display:flex;gap:6px">
        <button onclick="setLang('es')" style="flex:1;padding:8px;background:var(--bg-hover);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);cursor:pointer;font-family:inherit">🇪🇸 ES</button>
        <button onclick="setLang('en')" style="flex:1;padding:8px;background:var(--bg-hover);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);cursor:pointer;font-family:inherit">🇬🇧 EN</button>
        <button onclick="setLang('fr')" style="flex:1;padding:8px;background:var(--bg-hover);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);cursor:pointer;font-family:inherit">🇫🇷 FR</button>
    </div>
</div>
```

- [ ] **Step 5: Actualizar los textos dinámicos del JS para usar t()**

Localizar los lugares en el JS donde se establecen textos de UI y actualizarlos. Ejemplos clave:

```js
// setStatus() — añadir traducciones
function setStatus(text, type = '') {
    statusEl.textContent = text;
    statusEl.className = type;
}
// Las llamadas a setStatus() se mantienen igual pero pasar t() cuando sea string fijo:
setStatus(t('status_ready'));
setStatus(t('status_connecting'));
setStatus(t('status_connected'), 'connected');
// etc.

// startBtn text:
document.getElementById('startBtn').textContent = isTranscripteurMode ? t('btn_start_transcribe') : t('btn_start');
```

- [ ] **Step 6: Verificar en navegador**

Abrir `buddy/www/index.html`. En la tab Config, cambiar idioma. Verificar que:
- Los textos de nav cambian (Inicio/Home/Accueil)
- El welcome title cambia
- El placeholder de transcript cambia
- Se persiste el idioma en localStorage

- [ ] **Step 7: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: add i18n system with ES/EN/FR language support"
```

---

## Task 6: Ultravox — nuevo proveedor de voz barato

**Files:**
- Modify: `buddy/www/index.html` — JS de conexión WebSocket + select de modelos + config

Ultravox es un proveedor de voz realtime. Para iniciar una sesión:
1. POST a la API REST para crear una "call" y obtener un `joinUrl` (WebSocket URL)
2. Conectar al `joinUrl` via WebSocket
3. El protocolo de mensajes es similar a OpenAI Realtime

- [ ] **Step 1: Añadir Ultravox a los selectores de modelo**

Localizar el `<select id="realtimeModelSelect">` en el modal de configuración y añadir:

```html
<optgroup label="Ultravox">
    <option value="ultravox-v0-5-llama-3-3-70b">Ultravox Llama 3.3 70B — económico</option>
    <option value="ultravox-v0-5-llama-3-1-8b">Ultravox Llama 3.1 8B — muy económico</option>
</optgroup>
```

Hacer lo mismo en el `<select id="pModel">` del editor de persona.

- [ ] **Step 2: Añadir campo de clave API de Ultravox en Config**

En el panel `#configPanelApi`, añadir después del bloque de Gemini:

```html
<hr style="border:none;border-top:1px solid var(--border);margin:16px 0">

<label for="ultravoxApiKeyInput" data-i18n="config_api_ultravox">Clave API Ultravox</label>
<input type="password" id="ultravoxApiKeyInput" placeholder="utv-...">
<div class="hint">Necesaria para los modelos Ultravox. <a href="https://app.ultravox.ai/settings/api-keys" target="_blank" rel="noopener">Obtener clave</a> — plan gratuito disponible.</div>
<div id="ultravoxApiKeyStatus"></div>
```

- [ ] **Step 3: Añadir funciones de storage para Ultravox**

Añadir junto a las demás funciones de storage:

```js
function getUltravoxApiKey() { return localStorage.getItem('buddy_ultravoxApiKey') || ''; }
function setUltravoxApiKey(k) { localStorage.setItem('buddy_ultravoxApiKey', k); }
```

- [ ] **Step 4: Actualizar getProviderForModel()**

```js
function getProviderForModel(model) {
    if (model && model.startsWith('gemini')) return 'gemini';
    if (model && model.startsWith('ultravox')) return 'ultravox';
    return 'openai';
}
```

- [ ] **Step 5: Actualizar PRICING con Ultravox**

```js
const PRICING = {
    'gpt-realtime-2':    { input: 0.032, output: 0.064 },
    'gpt-realtime-1.5':  { input: 0.032, output: 0.064 },
    'gpt-realtime-mini': { input: 0.010, output: 0.020 },
    'gpt-realtime-translate': { input: 0.032, output: 0.064 },
    'gemini-3.1-flash-live-preview': { input: 0.003, output: 0.012 },
    'gpt-realtime-whisper': { perMinute: 0.017 },
    'ultravox-v0-5-llama-3-3-70b': { perMinute: 0.005 },
    'ultravox-v0-5-llama-3-1-8b':  { perMinute: 0.002 },
};
```

- [ ] **Step 6: Actualizar VOICES con voces de Ultravox**

```js
const VOICES = {
    openai: [ /* ... existentes ... */ ],
    gemini: [ /* ... existentes ... */ ],
    ultravox: [
        { value: 'Mark',    label: 'Mark — masculino, claro' },
        { value: 'Jessica', label: 'Jessica — femenino, cálido' },
        { value: 'Tanya',   label: 'Tanya — femenino, profesional' },
        { value: 'David',   label: 'David — masculino, profundo' },
    ]
};
```

- [ ] **Step 7: Añadir función connectUltravox()**

Añadir en el bloque de conexiones WebSocket (junto a `connectOpenAI`, `connectGemini`):

```js
async function connectUltravox(persona) {
    const apiKey = getUltravoxApiKey();
    if (!apiKey) { openApiKeyModal(); return; }

    setStatus(t('status_connecting'));

    // 1. Crear la call via REST para obtener el joinUrl
    let joinUrl;
    try {
        const fullInstructions = buildFullInstructions(persona);
        const resp = await fetch('https://api.ultravox.ai/api/calls', {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemPrompt: fullInstructions,
                model: activeModelId,
                voice: persona.voice || 'Mark',
                firstSpeaker: (persona.greeting === 'user') ? 'FIRST_SPEAKER_USER' : 'FIRST_SPEAKER_AGENT',
                temperature: (() => {
                    const temps = { 'precise': 0.5, 'balanced': 0.7, 'creative': 0.9, 'wild': 1.1 };
                    return temps[persona.creativity] || 0.7;
                })(),
                initialOutputMedium: 'MESSAGE_MEDIUM_VOICE',
                medium: { serverWebSocket: { inputSampleRate: 48000, outputSampleRate: 48000 } },
                transcriptOptional: false,
            })
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.detail || `HTTP ${resp.status}`);
        }
        const data = await resp.json();
        joinUrl = data.joinUrl;
        if (!joinUrl) throw new Error('No joinUrl en la respuesta de Ultravox');
    } catch (err) {
        setStatus(`Error: ${err.message}`, 'error');
        return;
    }

    // 2. Conectar al WebSocket
    ws = new WebSocket(joinUrl);
    ws.onopen = () => {
        isConnected = true;
        micReady = true;
        setStatus(t('status_connected'), 'connected');
    };

    ws.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            handleUltravoxServerEvent(data, persona);
        } catch {
            // Puede ser audio binario
            if (e.data instanceof Blob) {
                e.data.arrayBuffer().then(buf => {
                    // Audio PCM16 a 48kHz
                    const float32 = new Float32Array(buf.byteLength / 2);
                    const view = new DataView(buf);
                    for (let i = 0; i < float32.length; i++) {
                        float32[i] = view.getInt16(i * 2, true) / 32768;
                    }
                    const audioBuf = playbackContext.createBuffer(1, float32.length, 48000);
                    audioBuf.getChannelData(0).set(float32);
                    const src = playbackContext.createBufferSource();
                    src.buffer = audioBuf;
                    src.connect(playbackAnalyser);
                    const now = playbackContext.currentTime;
                    const start = Math.max(now + 0.05, nextPlayTime);
                    src.start(start);
                    nextPlayTime = start + audioBuf.duration;
                    playbackSources.push(src);
                    src.onended = () => {
                        const idx = playbackSources.indexOf(src);
                        if (idx > -1) playbackSources.splice(idx, 1);
                    };
                });
            }
        }
    };

    ws.onerror = () => setStatus('Error de conexión Ultravox', 'error');
    ws.onclose = (e) => {
        isConnected = false;
        if (e.code !== 1000) setStatus(`Ultravox desconectado (${e.code})`, 'error');
    };
}

function handleUltravoxServerEvent(data, persona) {
    const personaName = persona ? persona.name : 'Buddy';

    // Transcripción del agente
    if (data.type === 'transcript' && data.role === 'agent') {
        if (!currentTranscriptAi) {
            currentTranscriptAi = addTranscriptMessage(personaName, '', 'ai');
        }
        currentTranscriptAi.querySelector('.text').textContent = data.text || '';
        if (data.final) {
            currentTranscriptAi = null;
        }
        scrollTranscript();
    }

    // Transcripción del usuario
    if (data.type === 'transcript' && data.role === 'user' && data.final) {
        const txt = (data.text || '').trim();
        if (txt) {
            const el = document.getElementById('transcript');
            const placeholder = el.querySelector('.transcript-empty');
            if (placeholder) placeholder.remove();
            const msg = document.createElement('div');
            msg.className = 'transcript-msg user';
            msg.innerHTML = `<div class="sender">${esc('Yo')}</div><div class="text">${esc(txt)}</div>`;
            el.appendChild(msg);
            scrollTranscript();
        }
    }

    // Estado de la llamada
    if (data.type === 'state') {
        if (data.state === 'listening') setStatus(t('status_listening'), 'connected');
        if (data.state === 'thinking') setStatus(t('status_thinking'), 'connected');
        if (data.state === 'speaking') setStatus(t('status_speaking'), 'connected');
    }
}
```

- [ ] **Step 8: Actualizar connectWebSocket() para incluir Ultravox**

Localizar la función `connectWebSocket()` y añadir el caso Ultravox:

```js
function connectWebSocket() {
    setStatus(t('status_connecting'));

    if (isTranscripteurMode) {
        connectWhisper();
        return;
    }

    const persona = getPersonas().find(p => p.id === getActiveId());
    if (!persona) return;

    if (activeProvider === 'gemini') {
        connectGemini(persona);
    } else if (activeProvider === 'ultravox') {
        connectUltravox(persona);
    } else if (activeModelId === 'gpt-realtime-translate') {
        connectTranslate(persona);
    } else {
        connectOpenAI(persona);
    }
}
```

- [ ] **Step 9: Actualizar startBtn handler para Ultravox**

En el handler del startBtn, añadir verificación de clave Ultravox:

```js
// Añadir al bloque de verificación de proveedor:
if (activeProvider === 'ultravox' && !getUltravoxApiKey()) { openApiKeyModal(); return; }
```

- [ ] **Step 10: Actualizar el saveApiKeyBtn para guardar clave Ultravox**

```js
// En el handler de saveApiKeyBtn, añadir:
const ultravoxKey = document.getElementById('ultravoxApiKeyInput').value.trim();
setUltravoxApiKey(ultravoxKey);
```

- [ ] **Step 11: Verificar en navegador**

Abrir el modal de Config. Verificar que aparece el campo de clave Ultravox. Configurar la clave y crear un persona con modelo Ultravox. Iniciar conversación. Verificar que conecta y responde (requiere clave real).

- [ ] **Step 12: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: add Ultravox voice provider (~$0.005/min)"
```

---

## Task 7: Groq pipeline — STT → LLM → TTS

**Files:**
- Modify: `buddy/www/index.html` — JS del pipeline Groq + config

El pipeline Groq funciona diferente a los WebSocket realtime: graba audio, lo envía a Groq Whisper, obtiene texto, lo envía a Groq LLM, obtiene respuesta en texto, y usa el speech synthesis nativo del navegador para hablar.

- [ ] **Step 1: Añadir Groq a los selectores de modelo**

En ambos selects de modelo, añadir:

```html
<optgroup label="Groq (Pipeline)">
    <option value="groq-llama-3-3-70b">Groq Llama 3.3 70B — pipeline STT→LLM→TTS</option>
    <option value="groq-llama-3-1-8b">Groq Llama 3.1 8B — ultra económico</option>
</optgroup>
```

- [ ] **Step 2: Añadir campo de API key de Groq en Config**

En el panel `#configPanelApi`, añadir después del bloque de Ultravox:

```html
<hr style="border:none;border-top:1px solid var(--border);margin:16px 0">

<label for="groqApiKeyInput" data-i18n="config_api_groq">Clave API Groq</label>
<input type="password" id="groqApiKeyInput" placeholder="gsk_...">
<div class="hint">Necesaria para los modelos Groq. <a href="https://console.groq.com/keys" target="_blank" rel="noopener">Obtener clave gratuita</a> — tier gratuito muy generoso.</div>
<div id="groqApiKeyStatus"></div>
```

- [ ] **Step 3: Añadir funciones de storage para Groq**

```js
function getGroqApiKey() { return localStorage.getItem('buddy_groqApiKey') || ''; }
function setGroqApiKey(k) { localStorage.setItem('buddy_groqApiKey', k); }
```

- [ ] **Step 4: Actualizar getProviderForModel() para Groq**

```js
function getProviderForModel(model) {
    if (model && model.startsWith('gemini')) return 'gemini';
    if (model && model.startsWith('ultravox')) return 'ultravox';
    if (model && model.startsWith('groq')) return 'groq';
    return 'openai';
}
```

- [ ] **Step 5: Actualizar PRICING para Groq**

```js
'groq-llama-3-3-70b': { perMinute: 0.001 },
'groq-llama-3-1-8b':  { perMinute: 0.0005 },
```

- [ ] **Step 6: Añadir función connectGroq()**

```js
// Estado del pipeline Groq
let groqMediaRecorder = null;
let groqChunks = [];
let groqSpeaking = false; // true cuando el TTS está hablando
let groqConversationHistory = []; // historial para el LLM
let groqVADSilenceTimer = null;
let groqRecordingActive = false;

async function connectGroq(persona) {
    const apiKey = getGroqApiKey();
    if (!apiKey) { openApiKeyModal(); return; }

    isConnected = true;
    micReady = true;
    groqConversationHistory = [{ role: 'system', content: buildFullInstructions(persona) }];
    setStatus(t('status_connected'), 'connected');

    // Greeting inicial si el persona habla primero
    if (persona.greeting !== 'user') {
        await groqSpeak('¡Hola! ¿En qué te puedo ayudar?', persona);
    }
}

// Grabar audio del usuario y procesar
function groqStartListening(persona) {
    if (groqSpeaking || groqRecordingActive) return;
    groqChunks = [];
    groqRecordingActive = true;
    groqMediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm;codecs=opus' });
    groqMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) groqChunks.push(e.data); };
    groqMediaRecorder.onstop = () => groqProcessAudio(persona);
    groqMediaRecorder.start(100);

    // VAD simple: después de 1.5s de silencio (nivel bajo), parar
    const checkSilence = () => {
        if (!groqRecordingActive) return;
        if (userAudioLevel < 0.02) {
            if (!groqVADSilenceTimer) {
                groqVADSilenceTimer = setTimeout(() => {
                    if (groqRecordingActive) {
                        groqRecordingActive = false;
                        groqMediaRecorder.stop();
                    }
                }, 1500);
            }
        } else {
            clearTimeout(groqVADSilenceTimer);
            groqVADSilenceTimer = null;
        }
        if (groqRecordingActive) requestAnimationFrame(checkSilence);
    };
    requestAnimationFrame(checkSilence);
}

async function groqProcessAudio(persona) {
    if (groqChunks.length === 0) {
        if (isConnected && !groqSpeaking) groqStartListening(persona);
        return;
    }

    setStatus(t('status_thinking'), 'connected');
    const blob = new Blob(groqChunks, { type: 'audio/webm' });

    try {
        // 1. STT: Groq Whisper
        const formData = new FormData();
        formData.append('file', blob, 'audio.webm');
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('language', LANG);

        const sttResp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${getGroqApiKey()}` },
            body: formData
        });
        if (!sttResp.ok) throw new Error(`STT error: ${sttResp.status}`);
        const sttData = await sttResp.json();
        const userText = sttData.text?.trim() || '';

        if (!userText) {
            if (isConnected && !groqSpeaking) groqStartListening(persona);
            return;
        }

        // Mostrar transcripción del usuario
        addTranscriptMessage('Yo', userText, 'user');
        scrollTranscript();

        // 2. LLM: Groq Chat
        groqConversationHistory.push({ role: 'user', content: userText });

        const llmModel = activeModelId === 'groq-llama-3-3-70b'
            ? 'llama-3.3-70b-versatile'
            : 'llama-3.1-8b-instant';

        const llmResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getGroqApiKey()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: llmModel,
                messages: groqConversationHistory,
                temperature: (() => {
                    const temps = { precise: 0.5, balanced: 0.7, creative: 0.9, wild: 1.1 };
                    return temps[persona.creativity] || 0.7;
                })(),
                max_tokens: 300
            })
        });
        if (!llmResp.ok) throw new Error(`LLM error: ${llmResp.status}`);
        const llmData = await llmResp.json();
        const aiText = llmData.choices?.[0]?.message?.content?.trim() || '';

        // Actualizar historial y tokens
        groqConversationHistory.push({ role: 'assistant', content: aiText });
        totalInputTokens += llmData.usage?.prompt_tokens || 0;
        totalOutputTokens += llmData.usage?.completion_tokens || 0;
        updateTokenCounter();

        // 3. TTS: Web Speech Synthesis (nativo, gratis)
        await groqSpeak(aiText, persona);

    } catch (err) {
        setStatus(`Error: ${err.message}`, 'error');
        console.error('[Groq pipeline]', err);
    }

    // Seguir escuchando
    if (isConnected && !groqSpeaking) groqStartListening(persona);
}

async function groqSpeak(text, persona) {
    return new Promise(resolve => {
        groqSpeaking = true;
        setStatus(t('status_speaking'), 'connected');

        // Mostrar transcripción del AI
        addTranscriptMessage(persona.name, text, 'ai');
        scrollTranscript();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = LANG === 'es' ? 'es-ES' : LANG === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            groqSpeaking = false;
            setStatus(t('status_connected'), 'connected');
            if (isConnected) groqStartListening(persona);
            resolve();
        };
        utterance.onerror = () => {
            groqSpeaking = false;
            resolve();
        };

        window.speechSynthesis.speak(utterance);
    });
}
```

- [ ] **Step 7: Actualizar connectWebSocket() para Groq**

```js
function connectWebSocket() {
    setStatus(t('status_connecting'));
    if (isTranscripteurMode) { connectWhisper(); return; }
    const persona = getPersonas().find(p => p.id === getActiveId());
    if (!persona) return;

    if (activeProvider === 'gemini') {
        connectGemini(persona);
    } else if (activeProvider === 'ultravox') {
        connectUltravox(persona);
    } else if (activeProvider === 'groq') {
        connectGroq(persona).then(() => {
            if (isConnected) groqStartListening(persona);
        });
    } else if (activeModelId === 'gpt-realtime-translate') {
        connectTranslate(persona);
    } else {
        connectOpenAI(persona);
    }
}
```

- [ ] **Step 8: Actualizar stopConversation() para limpiar el pipeline Groq**

Añadir al inicio de `stopConversation()`:

```js
// Limpiar pipeline Groq
if (groqMediaRecorder && groqMediaRecorder.state !== 'inactive') {
    groqRecordingActive = false;
    groqMediaRecorder.stop();
}
groqMediaRecorder = null;
groqChunks = [];
groqSpeaking = false;
groqConversationHistory = [];
clearTimeout(groqVADSilenceTimer);
groqVADSilenceTimer = null;
groqRecordingActive = false;
window.speechSynthesis.cancel();
```

- [ ] **Step 9: Actualizar startBtn para verificar clave Groq**

```js
if (activeProvider === 'groq' && !getGroqApiKey()) { openApiKeyModal(); return; }
```

- [ ] **Step 10: Verificar en navegador**

Configurar una clave Groq (gratuita en console.groq.com). Crear un persona con modelo "Groq Llama 3.3 70B". Iniciar conversación. Verificar que:
- Escucha y transcribe la voz del usuario (Groq Whisper)
- Responde con texto coherente (Groq LLM)
- La respuesta se lee en voz alta (browser TTS)
- La conversación continúa en bucle

- [ ] **Step 11: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: add Groq pipeline provider (Whisper STT + Llama LLM + browser TTS, ~$0.001/min)"
```

---

## Task 8: Almacenamiento seguro con Android Keystore

**Files:**
- Modify: `buddy/www/index.html` — wrapper de storage seguro + migración

- [ ] **Step 1: Añadir el wrapper de SecureStorage al inicio del script**

Añadir al inicio del `<script>` (antes de cualquier función de storage):

```js
// ════════════════════════════════════════════════
//  SECURE STORAGE WRAPPER
//  En Android: usa Android Keystore via Capacitor
//  En navegador web: usa localStorage como fallback
// ════════════════════════════════════════════════

const IS_CAPACITOR = typeof window.Capacitor !== 'undefined' &&
                     window.Capacitor.isNativePlatform();

const SecureStore = {
    async get(key) {
        if (IS_CAPACITOR) {
            try {
                const result = await window.Capacitor.Plugins.SecureStorage.get({ key });
                return result.value || '';
            } catch {
                return '';
            }
        }
        return localStorage.getItem(key) || '';
    },
    async set(key, value) {
        if (IS_CAPACITOR) {
            try {
                await window.Capacitor.Plugins.SecureStorage.set({ key, value });
            } catch (e) {
                console.error('[SecureStorage] set failed:', e);
            }
        } else {
            localStorage.setItem(key, value);
        }
    },
    async remove(key) {
        if (IS_CAPACITOR) {
            try {
                await window.Capacitor.Plugins.SecureStorage.remove({ key });
            } catch {}
        } else {
            localStorage.removeItem(key);
        }
    }
};

// Migración al primer arranque: localStorage → Android Keystore
async function migrateApiKeysToSecureStorage() {
    if (!IS_CAPACITOR) return;
    const migrationDone = localStorage.getItem('buddy_secure_migrated');
    if (migrationDone) return;

    const keysToMigrate = [
        'buddy_apiKey', 'buddy_geminiApiKey',
        'buddy_ultravoxApiKey', 'buddy_groqApiKey'
    ];

    for (const key of keysToMigrate) {
        const value = localStorage.getItem(key);
        if (value) {
            await SecureStore.set(key, value);
            localStorage.removeItem(key); // borrar de localStorage
        }
    }

    localStorage.setItem('buddy_secure_migrated', 'true');
    console.log('[SecureStorage] Migration complete');
}
```

- [ ] **Step 2: Actualizar todas las funciones de API key para usar SecureStore**

Reemplazar las funciones síncronas existentes con versiones async:

```js
// ANTES (síncrono):
function getApiKey() { return localStorage.getItem('buddy_apiKey') || ''; }
function setApiKey(k) { localStorage.setItem('buddy_apiKey', k); }

// DESPUÉS (async con SecureStore):
async function getApiKey() { return await SecureStore.get('buddy_apiKey'); }
async function setApiKey(k) { await SecureStore.set('buddy_apiKey', k); }

async function getGeminiApiKey() { return await SecureStore.get('buddy_geminiApiKey'); }
async function setGeminiApiKey(k) { await SecureStore.set('buddy_geminiApiKey', k); }

async function getUltravoxApiKey() { return await SecureStore.get('buddy_ultravoxApiKey'); }
async function setUltravoxApiKey(k) { await SecureStore.set('buddy_ultravoxApiKey', k); }

async function getGroqApiKey() { return await SecureStore.get('buddy_groqApiKey'); }
async function setGroqApiKey(k) { await SecureStore.set('buddy_groqApiKey', k); }
```

- [ ] **Step 3: Añadir await a todas las llamadas a funciones de API key**

Buscar todos los usos de `getApiKey()`, `getGeminiApiKey()`, etc. en el código y añadir `await`. Ejemplo:

```js
// ANTES:
if (getApiKey()) { ... }
// DESPUÉS:
if (await getApiKey()) { ... }

// ANTES:
const resp = await fetch('...', { headers: { 'Authorization': `Bearer ${getApiKey()}` } });
// DESPUÉS:
const resp = await fetch('...', { headers: { 'Authorization': `Bearer ${await getApiKey()}` } });
```

Las funciones que contienen estos usos deben marcarse como `async` si no lo eran.

- [ ] **Step 4: Añadir función hasAnyApiKey() async**

```js
async function hasAnyApiKey() {
    return !!(await getApiKey() || await getGeminiApiKey() ||
              await getUltravoxApiKey() || await getGroqApiKey());
}
```

- [ ] **Step 5: Llamar a la migración al arrancar la app**

Al final del `<script>`, reemplazar la inicialización:

```js
// ANTES:
renderPersonaList();
showEmptyState();
if (!hasAnyApiKey()) openApiKeyModal();

// DESPUÉS:
(async () => {
    await migrateApiKeysToSecureStorage();
    renderPersonaList();
    showEmptyState();
    if (!await hasAnyApiKey()) openApiKeyModal();
})();
```

- [ ] **Step 6: Verificar en navegador (modo web)**

En Chrome, abrir `buddy/www/index.html`. Verificar que:
- La app arranca sin errores de consola
- Se puede configurar la clave API (usa localStorage como fallback)
- Una conversación funciona normalmente

Nota: el Android Keystore solo se activa al correr en el APK nativo. En web usa localStorage automáticamente.

- [ ] **Step 7: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: add SecureStorage wrapper for API keys (Android Keystore on device, localStorage fallback in browser)"
```

---

## Task 9: Capacitor sync y primer test en emulador

**Files:**
- Modify: `buddy/android/app/src/main/res/values/strings.xml` — nombre de la app
- Modify: `buddy/android/app/src/main/AndroidManifest.xml` — permisos

- [ ] **Step 1: Sincronizar el proyecto Capacitor**

```bash
cd buddy
npx cap sync android
```

Resultado esperado: "✅ android platform - Sync finished in Xs"

- [ ] **Step 2: Verificar que el plugin de secure storage está registrado**

Después del sync, verificar que en `android/app/src/main/java/.../MainActivity.java` (o MainActivityKt) está registrado el plugin. Capacitor 6 lo hace automáticamente vía anotaciones.

Verificar que `android/app/build.gradle` tiene:
```
implementation 'com.capacitorjs.plugins.community:secure-storage:0.9.0'
```

Si no está, añadirlo manualmente y hacer sync de nuevo.

- [ ] **Step 3: Añadir permisos de micrófono en AndroidManifest.xml**

Localizar `buddy/android/app/src/main/AndroidManifest.xml` y verificar que tiene (añadir si faltan):

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-feature android:name="android.hardware.microphone" android:required="true" />
```

- [ ] **Step 4: Actualizar el nombre de la app**

Editar `buddy/android/app/src/main/res/values/strings.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Buddy</string>
    <string name="title_activity_main">Buddy</string>
    <string name="package_name">com.buddy.voiceapp</string>
    <string name="custom_url_scheme">com.buddy.voiceapp</string>
</resources>
```

- [ ] **Step 5: Abrir en Android Studio y ejecutar en emulador**

```bash
cd buddy
npx cap open android
```

En Android Studio:
1. Esperar a que Gradle sincronice
2. Seleccionar emulador Android 13+ (API 33+)
3. Pulsar ▶ Run

Verificar en el emulador:
- La app se instala y abre
- El bottom nav es visible
- Se muestra la pantalla de bienvenida de Buddy
- Al tocar "Config" → se puede introducir una clave API
- Al tocar "Personas" → aparece el grid

- [ ] **Step 6: Probar el micrófono en emulador**

Crear un persona con Groq pipeline (el más fácil de probar sin latencia WebSocket). Iniciar conversación. Verificar que Android pide permiso de micrófono y la app graba audio.

- [ ] **Step 7: Commit**

```bash
git add buddy/android/
git commit -m "feat: configure Android manifest permissions, app name, Capacitor sync"
```

---

## Task 10: Icono de la app y assets Android

**Files:**
- Create: `buddy/android/app/src/main/res/mipmap-*/ic_launcher*.png`

- [ ] **Step 1: Crear el icono de Buddy**

Crear un PNG cuadrado de 1024x1024 con el logo de Buddy (robot con ojos violeta sobre fondo oscuro). Opciones:
- Usar DALL-E / Gemini image generation directamente en la app (ya implementado)
- Crear manualmente con cualquier editor gráfico
- Usar Android Asset Studio online: https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html

El icono debe tener: fondo degradado `#0a0a1f → #1a0a3e`, robot con ojos violeta `#8b5cf6`, halo rosa neón.

- [ ] **Step 2: Generar los tamaños de icono con capacitor-assets**

```bash
cd buddy
npm install -D @capacitor/assets
npx capacitor-assets generate --android
```

Esto lee `assets/icon.png` (1024x1024) y genera todos los tamaños necesarios automáticamente.

Si no tienes `assets/icon.png`, crearlo primero:
```bash
mkdir -p buddy/assets
# Copiar el PNG del icono a buddy/assets/icon.png
```

- [ ] **Step 3: Sync y verificar icono**

```bash
cd buddy
npx cap sync android
npx cap open android
```

Ejecutar en emulador. Verificar que el icono de Buddy aparece correctamente en el launcher del emulador.

- [ ] **Step 4: Commit**

```bash
git add buddy/assets/ buddy/android/app/src/main/res/
git commit -m "feat: add Buddy app icon for Android"
```

---

## Task 11: Build del APK de release

**Files:**
- Create: `buddy/android/app/buddy-release.apk` (generado por Gradle)
- Create: `buddy/buddy-keystore.jks` (keystore de firma — NO subir a git)

- [ ] **Step 1: Crear el keystore de firma**

```bash
cd buddy
keytool -genkeypair -v -keystore buddy-keystore.jks \
  -alias buddy-key -keyalg RSA -keysize 2048 \
  -validity 10000 \
  -dname "CN=Buddy App, OU=Personal, O=Buddy, L=Unknown, ST=Unknown, C=US"
```

Introducir una contraseña segura cuando se solicite. **Guardar esta contraseña en lugar seguro — sin ella no se puede actualizar la app.**

- [ ] **Step 2: Añadir el keystore al .gitignore**

Añadir a `.gitignore`:
```
buddy/buddy-keystore.jks
buddy/android/app/keystore.properties
```

- [ ] **Step 3: Crear el archivo keystore.properties**

Crear `buddy/android/app/keystore.properties` (NO subir a git):

```properties
storeFile=../../../buddy-keystore.jks
storePassword=TU_CONTRASEÑA_AQUI
keyAlias=buddy-key
keyPassword=TU_CONTRASEÑA_AQUI
```

- [ ] **Step 4: Configurar la firma en build.gradle**

Editar `buddy/android/app/build.gradle` y añadir dentro del bloque `android { ... }`:

```groovy
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('app/keystore.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

signingConfigs {
    release {
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

- [ ] **Step 5: Generar el APK firmado**

```bash
cd buddy/android
./gradlew assembleRelease
```

Resultado esperado:
```
BUILD SUCCESSFUL in XXs
1 actionable task: 1 executed
```

El APK estará en: `buddy/android/app/build/outputs/apk/release/app-release.apk`

- [ ] **Step 6: Renombrar el APK**

```bash
cp buddy/android/app/build/outputs/apk/release/app-release.apk buddy/Buddy-v1.0.apk
```

- [ ] **Step 7: Verificar instalando en emulador**

```bash
adb install buddy/Buddy-v1.0.apk
```

Abrir la app en el emulador. Verificar que funciona correctamente.

- [ ] **Step 8: Commit**

```bash
git add buddy/android/app/build.gradle
git commit -m "feat: configure release signing for Buddy APK"
```

---

## Task 12: Distribución via GitHub Releases + QR

**Files:**
- Create: `buddy/INSTALL.md` — instrucciones de instalación

- [ ] **Step 1: Crear una release en GitHub**

1. Subir el repo a GitHub si no está ya: `git remote add origin https://github.com/TU_USUARIO/buddy-app.git && git push -u origin main`
2. Ir a GitHub → Releases → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `Buddy v1.0 — First Release`
5. Subir el archivo `Buddy-v1.0.apk` como asset
6. Publicar la release

La URL de descarga directa del APK será:
`https://github.com/TU_USUARIO/buddy-app/releases/download/v1.0.0/Buddy-v1.0.apk`

- [ ] **Step 2: Generar el QR code**

Ir a https://qr-code-generator.com/ o usar `qrcode` npm:

```bash
npx qrcode-terminal "https://github.com/TU_USUARIO/buddy-app/releases/download/v1.0.0/Buddy-v1.0.apk"
```

Guardar el QR como imagen PNG.

- [ ] **Step 3: Crear INSTALL.md con instrucciones**

Crear `buddy/INSTALL.md`:

```markdown
# Instalar Buddy en Android

## Paso 1 — Permitir fuentes desconocidas
En Android 8+: Ajustes → Apps → Chrome (o tu navegador) → Instalar apps desconocidas → Permitir

## Paso 2 — Descargar la app
Escanea este QR con tu móvil o abre el link:
[Buddy-v1.0.apk](https://github.com/TU_USUARIO/buddy-app/releases/download/v1.0.0/Buddy-v1.0.apk)

[QR CODE IMAGE]

## Paso 3 — Instalar
Abre el APK descargado y pulsa "Instalar"

## Paso 4 — Configurar
Abre Buddy → Tab Config → Introduce al menos una clave API (OpenAI, Gemini, Ultravox o Groq)

## Precios estimados por minuto de conversación
- OpenAI Realtime: ~$0.06/min
- Gemini Live: ~$0.002/min  
- Ultravox: ~$0.005/min
- Groq pipeline: ~$0.001/min (con tier gratuito disponible)
```

- [ ] **Step 4: Commit final**

```bash
git add buddy/INSTALL.md
git commit -m "docs: add installation instructions and QR code for APK distribution"
git push origin main
```

---

## Task 13: Landing page — partager Zova avec le monde

**Objectif :** Créer une page web publique pour présenter Zova, expliquer le concept, et permettre à n'importe qui de télécharger l'APK facilement.

**Fichiers :**
- Create: `landing/index.html` — single-file, hébergeable sur GitHub Pages

**Philosophie :** La landing doit être aussi soignée que l'app — même univers Dark Cosmos, même slogan, même clarté. C'est la vitrine. Elle doit convaincre en 10 secondes.

---

- [ ] **Step 1 : Définir la structure de la page**

La landing est un single-file HTML (CSS + JS inline) avec les sections suivantes, dans l'ordre :

```
1. Hero          — logo + slogan + bouton téléchargement + QR
2. Concept       — "C'est quoi Zova ?" en 3 bullet points
3. Providers     — tableau comparatif des 4 providers (coût, qualité)
4. Fonctionnalités — icônes + titres (personas, PIN, mémoire, budget, FAQ)
5. Installation  — 3 étapes illustrées (télécharger → autoriser → configurer)
6. Footer        — lien GitHub, "par Xavier Bourdet"
```

- [ ] **Step 2 : Design — Dark Cosmos adapté au web**

Utiliser exactement les mêmes variables CSS que l'app :

```css
:root {
    --bg: #0a0a1f;
    --accent: #8b5cf6;
    --accent2: #ec4899;
    --text: #e2d9f3;
    --text-muted: #9a8cb0;
    --card-bg: #0f0f2e;
    --border: rgba(139,92,246,0.20);
}
body {
    background: radial-gradient(ellipse at 20% 30%, rgba(109,40,217,0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 70%, rgba(236,72,153,0.10) 0%, transparent 50%),
                var(--bg);
    color: var(--text);
    font-family: 'DM Sans', system-ui, sans-serif;
    margin: 0;
    line-height: 1.6;
}
```

Polices : Syne (titres) + DM Sans (corps) — mêmes que l'app, via Google Fonts.

- [ ] **Step 3 : Section Hero**

```html
<section class="hero">
    <div class="hero-logo"><!-- SVG mic Dark Cosmos --></div>
    <h1>Zova</h1>
    <p class="hero-slogan">Ton IA. Ton téléphone. Tes règles.</p>
    <p class="hero-sub">
        Assistant vocal IA — sans serveur, sans abonnement, sans surveillance.
        Tes clés API restent sur ton téléphone.
    </p>
    <a href="LIEN_APK" class="btn-download">⬇ Télécharger l'APK</a>
    <div class="qr-block">
        <img src="qr.png" alt="QR code téléchargement Zova">
        <span>Scanner pour installer</span>
    </div>
</section>
```

- [ ] **Step 4 : Section Concept — 3 valeurs**

```html
<section class="concept">
    <div class="concept-card">
        <span class="icon">🔒</span>
        <h3>Souverain</h3>
        <p>Tes clés API sont chiffrées dans l'Android Keystore.
           Zova ne voit jamais tes données — parce qu'il n'existe pas de serveur Zova.</p>
    </div>
    <div class="concept-card">
        <span class="icon">🎭</span>
        <h3>Personnalisable</h3>
        <p>Crée des assistants sur mesure : nom, personnalité, voix, prompt libre.
           Aucune limite, aucun filtre imposé.</p>
    </div>
    <div class="concept-card">
        <span class="icon">💸</span>
        <h3>Transparent</h3>
        <p>Paye exactement ce que tu utilises, directement au provider.
           Pas d'abonnement. Pas de surprise. Dès ~$0.001/min avec Groq.</p>
    </div>
</section>
```

- [ ] **Step 5 : Section Providers — tableau comparatif**

```html
<section class="providers">
    <h2>4 providers au choix</h2>
    <table>
        <thead>
            <tr>
                <th>Provider</th><th>Qualité</th><th>Coût/min</th><th>Idéal pour</th>
            </tr>
        </thead>
        <tbody>
            <tr><td>OpenAI Realtime</td><td>⭐⭐⭐⭐⭐</td><td>~$0.06</td><td>Qualité maximale</td></tr>
            <tr><td>Gemini Live</td><td>⭐⭐⭐⭐</td><td>~$0.01</td><td>Rapport qualité/prix</td></tr>
            <tr><td>Ultravox</td><td>⭐⭐⭐</td><td>~$0.005</td><td>Usage intense</td></tr>
            <tr class="highlight"><td>Groq pipeline</td><td>⭐⭐⭐</td><td>~$0.001</td><td>Démarrer gratuitement</td></tr>
        </tbody>
    </table>
    <p class="hint">Groq offre un quota gratuit généreux — idéal pour tester Zova sans sortir la carte bancaire.</p>
</section>
```

- [ ] **Step 6 : Section Installation — 3 étapes**

```html
<section class="install">
    <h2>Installer en 3 minutes</h2>
    <div class="steps">
        <div class="step">
            <div class="step-num">1</div>
            <h3>Télécharger</h3>
            <p>Scanne le QR ou clique le bouton. Un fichier .apk se télécharge.</p>
        </div>
        <div class="step">
            <div class="step-num">2</div>
            <h3>Autoriser</h3>
            <p>Android → Paramètres → autoriser l'installation depuis sources inconnues pour ton navigateur.</p>
        </div>
        <div class="step">
            <div class="step-num">3</div>
            <h3>Configurer</h3>
            <p>Ouvre Zova → Config → colle ta clé API Groq (gratuite sur console.groq.com).</p>
        </div>
    </div>
</section>
```

- [ ] **Step 7 : Hébergement sur GitHub Pages**

```bash
# Créer le dossier landing à la racine du repo
mkdir landing
# Créer landing/index.html avec le HTML complet
# Dans GitHub → Settings → Pages → Source: main branch /landing
```

L'URL sera : `https://TU_USUARIO.github.io/zova/` (ou domaine custom si disponible)

- [ ] **Step 8 : Lier la landing à l'app**

Dans `buddy/www/index.html`, onglet Partager du modal Configuration, mettre à jour le lien :

```html
<a href="https://TU_USUARIO.github.io/zova/" target="_blank" rel="noopener" class="btn-small">
    🌐 Page de téléchargement
</a>
```

- [ ] **Step 9 : Vérifier sur mobile**

Ouvrir la landing sur mobile (Chrome Android). Vérifier :
- La page est lisible sans zoom
- Le bouton téléchargement est bien visible et fonctionnel
- Le QR code est scannable
- L'ambiance Dark Cosmos est cohérente avec l'app

- [ ] **Step 10 : Commit**

```bash
git add landing/
git commit -m "feat: add Zova landing page for APK distribution (GitHub Pages)"
git push origin main
```

---

## Self-Review contra el spec

| Requisito del spec | Tarea que lo implementa | Estado |
|---|---|---|
| Android APK via Capacitor | Task 1, 9, 11 | ✅ |
| Distribución GitHub + QR | Task 12 | ✅ |
| OpenAI Realtime | Base (Kast original) | ✅ |
| Gemini Live | Base (Kast original) | ✅ |
| Ultravox (nuevo) | Task 6 | ✅ |
| Groq pipeline (nuevo) | Task 7 | ✅ |
| i18n ES/EN/FR | Task 5 | ✅ |
| Dark Cosmos theme | Task 3 | ✅ |
| Bottom navigation | Task 4 | ✅ |
| Android Keystore seguro | Task 8 | ✅ |
| Renombrar Kast → Buddy | Task 2 | ✅ |
| Landing page de distribución | Task 13 | ⏳ |

---

*Plan escrito el 2026-06-06. Actualizado 2026-06-08 — Task 13 landing page añadida. Spec en: `docs/superpowers/specs/2026-06-06-buddy-mobile-design.md`*
