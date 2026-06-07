# Model Picker & Config Badges — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un selector de modelo expandible en Home (debajo del botón Start) y mejorar las etiquetas de modelos por proceso en Config con badges de calidad/precio.

**Architecture:** Single-file HTML app (`buddy/www/index.html`). Todos los cambios van en ese archivo: CSS añadido en el bloque `<style>`, HTML en `#controls`, JS en el bloque `<script>`. El picker usa una variable `sessionModelOverride` (temporal, no persiste) que sobreescribe el modelo de la persona para esa sesión.

**Tech Stack:** HTML/CSS/JS vanilla, Capacitor Android. No hay framework ni bundler.

---

## Task 1: CSS — estilos del picker expandible

**Files:**
- Modify: `buddy/www/index.html` — bloque `<style>` principal (buscar `.btn-pause` para ubicarte, añadir después)

- [ ] **Step 1: Añadir estilos del picker**

Buscar en el CSS la regla `.btn-pause {` y añadir justo ANTES de ella:

```css
    /* ── Model Picker ──────────────────────────── */
    #modelPickerWrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 8px;
    }
    .model-picker-btn {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 20px;
      color: var(--text-secondary);
      font-size: 0.78rem;
      padding: 5px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: border-color 0.2s, color 0.2s;
      font-family: inherit;
    }
    .model-picker-btn:hover { border-color: var(--violet); color: var(--text-primary); }
    .model-picker-arrow { font-size: 0.65rem; opacity: 0.6; }
    .model-picker-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: center;
      margin-top: 8px;
      padding: 0 12px;
    }
    .model-picker-chip {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      color: var(--text-secondary);
      font-size: 0.72rem;
      padding: 5px 12px;
      cursor: pointer;
      text-align: center;
      line-height: 1.3;
      transition: all 0.15s;
      font-family: inherit;
    }
    .model-picker-chip.active {
      background: var(--violet);
      border-color: var(--violet);
      color: #fff;
    }
    .model-picker-chip:hover:not(.active) {
      border-color: var(--violet);
      color: var(--text-primary);
    }
    .model-picker-chip-cost {
      display: block;
      font-size: 0.65rem;
      opacity: 0.7;
      margin-top: 1px;
    }
```

- [ ] **Step 2: Verificar no hay conflicto de nombres**

Buscar en el archivo que no exista ya `model-picker-btn` ni `modelPickerWrap`:
```
Grep: "model-picker-btn" en buddy/www/index.html → debe dar 0 resultados antes del cambio
```

- [ ] **Step 3: Commit**

```bash
git add buddy/www/index.html
git commit -m "style: model picker expandible — CSS base"
```

---

## Task 2: HTML — añadir picker en #controls

**Files:**
- Modify: `buddy/www/index.html` — sección `<div id="controls">` (línea ~2096)

- [ ] **Step 1: Localizar el bloque #controls**

El bloque actual es:
```html
              <div id="controls">
                  <button class="btn btn-start" id="startBtn">Iniciar conversación</button>
                  <button class="btn-pause" id="pauseBtn" style="display:none">&#9208;</button>
                  <button class="btn-mute" id="muteBtn" style="display:none"><span class="icon">&#127908;</span></button>
                  <button class="btn btn-stop" id="stopBtn" style="display:none">Terminar</button>
              </div>
```

- [ ] **Step 2: Añadir el picker debajo del startBtn**

Reemplazar el bloque `<div id="controls">` con:
```html
              <div id="controls">
                  <button class="btn btn-start" id="startBtn">Iniciar conversación</button>
                  <div id="modelPickerWrap">
                    <button class="model-picker-btn" id="modelPickerBtn">
                      <span id="modelPickerLabel">⚙️ …</span>
                      <span class="model-picker-arrow">▾</span>
                    </button>
                    <div id="modelPickerChips" class="model-picker-chips" style="display:none"></div>
                  </div>
                  <button class="btn-pause" id="pauseBtn" style="display:none">&#9208;</button>
                  <button class="btn-mute" id="muteBtn" style="display:none"><span class="icon">&#127908;</span></button>
                  <button class="btn btn-stop" id="stopBtn" style="display:none">Terminar</button>
              </div>
```

- [ ] **Step 3: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: model picker HTML — botón expandible en Home"
```

---

## Task 3: JS — variable sessionModelOverride y función renderModelPicker

**Files:**
- Modify: `buddy/www/index.html` — bloque JS (añadir cerca de `let activeProvider` en línea ~3313)

- [ ] **Step 1: Añadir variable sessionModelOverride**

Buscar la línea:
```js
    let activeProvider = 'openai'; // 'openai' ou 'gemini' pour la session en cours
```

Añadir justo DESPUÉS:
```js
    let sessionModelOverride = ''; // model override temporal — se resetea al parar
```

- [ ] **Step 2: Añadir función renderModelPicker**

Buscar la función `function applyConvModel(val) {` (línea ~7097) y añadir justo DESPUÉS del cierre de esa función (después del `}`):

```js
    async function renderModelPicker() {
        const wrap = document.getElementById('modelPickerWrap');
        if (!wrap) return;

        // Modelo actual: override de sesión → modelo de persona → default Config
        const persona = getPersonas().find(p => p.id === getActiveId());
        const currentVal = sessionModelOverride
            || (persona && persona.model ? getModelConvValueForModel(persona.model) : null)
            || getModelConv();

        // Actualizar label del botón
        const currentOpt = MODEL_CONV_OPTIONS.find(o => o.value === currentVal) || MODEL_CONV_OPTIONS[1];
        document.getElementById('modelPickerLabel').textContent = `⚙️ ${currentOpt.label} · ${currentOpt.cost}`;

        // Filtrar modelos según keys disponibles
        const [openaiKey, geminiKey, ultravoxKey, groqKey] = await Promise.all([
            getApiKey(), getGeminiApiKey(), getUltravoxApiKey(), getGroqApiKey()
        ]);
        const hasKey = { openai: !!openaiKey, gemini: !!geminiKey, 'ultravox-70b': !!ultravoxKey, 'ultravox-8b': !!ultravoxKey, 'groq-70b': !!groqKey, 'groq-8b': !!groqKey };

        const chips = document.getElementById('modelPickerChips');
        const available = MODEL_CONV_OPTIONS.filter(o => hasKey[o.value]);
        if (available.length === 0) {
            chips.innerHTML = '<span style="font-size:0.75rem;color:var(--text-muted)">Aucune clé API configurée</span>';
            return;
        }

        chips.innerHTML = available.map(o =>
            `<button class="model-picker-chip${o.value === currentVal ? ' active' : ''}" data-val="${o.value}">
                ${o.label}
                <span class="model-picker-chip-cost">${o.cost}</span>
            </button>`
        ).join('');

        chips.querySelectorAll('.model-picker-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                sessionModelOverride = chip.dataset.val;
                chips.style.display = 'none';
                renderModelPicker(); // actualizar label
            });
        });
    }

    // Convierte un modelId real (ej: 'gpt-4o-realtime-...') al valor de MODEL_CONV_OPTIONS
    function getModelConvValueForModel(modelId) {
        if (!modelId) return null;
        if (modelId.startsWith('gemini')) return 'gemini';
        if (modelId.startsWith('ultravox-70b') || modelId === 'ultravox-70b') return 'ultravox-70b';
        if (modelId.startsWith('ultravox')) return 'ultravox-8b';
        if (modelId === 'groq-70b' || modelId.includes('70b')) return 'groq-70b';
        if (modelId === 'groq-8b' || modelId.includes('8b')) return 'groq-8b';
        return 'openai';
    }
```

- [ ] **Step 3: Añadir listener del botón expandible**

Buscar el bloque `initModelSelectors();` (línea ~7113) y añadir justo DESPUÉS:

```js
    // Model picker en Home
    document.getElementById('modelPickerBtn').addEventListener('click', async () => {
        const chips = document.getElementById('modelPickerChips');
        if (chips.style.display === 'none') {
            await renderModelPicker(); // refresh keys y chips
            chips.style.display = 'flex';
        } else {
            chips.style.display = 'none';
        }
    });
    renderModelPicker(); // label inicial
```

- [ ] **Step 4: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: renderModelPicker() — selector expandible con filtrado por keys"
```

---

## Task 4: JS — integrar override en selectPersona y stopConversation

**Files:**
- Modify: `buddy/www/index.html` — funciones `selectPersona` y `stopConversation`

- [ ] **Step 1: Llamar renderModelPicker al seleccionar persona**

En `function selectPersona(id)`, al final (justo antes del cierre `}`), después de `updateTokenCounter();`:

```js
        sessionModelOverride = ''; // reset al cambiar de persona
        renderModelPicker();
```

- [ ] **Step 2: Resetear override al parar conversación**

En `stopConversation()`, buscar la línea:
```js
        isConnected = false;
```

Añadir justo DESPUÉS:
```js
        sessionModelOverride = '';
        renderModelPicker();
```

- [ ] **Step 3: Mostrar/ocultar picker según estado conversación**

En `stopConversation()`, buscar:
```js
        startBtn.style.display = 'inline-block';
```

Añadir justo DESPUÉS:
```js
        document.getElementById('modelPickerWrap').style.display = '';
```

En `startBtn.addEventListener('click', ...)`, buscar:
```js
        startBtn.style.display = 'none';
```

Añadir justo DESPUÉS:
```js
        document.getElementById('modelPickerWrap').style.display = 'none';
```

- [ ] **Step 4: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: picker — reset en stop/selectPersona, ocultar durante conversación"
```

---

## Task 5: JS — aplicar override en startBtn

**Files:**
- Modify: `buddy/www/index.html` — `startBtn.addEventListener('click', ...)` (línea ~6299)

- [ ] **Step 1: Aplicar sessionModelOverride al iniciar**

Buscar el bloque del modo persona normal:
```js
            // Mode persona normal
            const persona = getPersonas().find(p => p.id === getActiveId());
            activeModelId = getEffectiveModel(persona);
            activeProvider = getProviderForModel(activeModelId);
```

Reemplazar con:
```js
            // Mode persona normal
            const persona = getPersonas().find(p => p.id === getActiveId());
            activeModelId = getEffectiveModel(persona);
            activeProvider = getProviderForModel(activeModelId);
            if (sessionModelOverride) {
                applyConvModel(sessionModelOverride); // sobreescribe provider (y modelId para groq/ultravox)
            }
```

- [ ] **Step 2: Verificar que la comprobación de keys sigue correcta**

Las líneas de check de keys (6306-6309) usan `activeProvider` que ya fue actualizado por `applyConvModel`. No requieren cambio.

- [ ] **Step 3: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: startBtn aplica sessionModelOverride antes de conectar"
```

---

## Task 6: HTML — badges en Config (modelos por proceso)

**Files:**
- Modify: `buddy/www/index.html` — `<select id="modelMemorySelect">`, `<select id="modelInsightSelect">`, `<select id="modelGroqSelect">`

- [ ] **Step 1: Actualizar modelMemorySelect**

Buscar:
```html
          <select id="modelMemorySelect" class="model-action-select">
            <option value="llama3-8b-8192">Llama 3 8B — économique</option>
            <option value="llama-3.3-70b-versatile">Llama 3.3 70B — précis</option>
            <option value="gemma2-9b-it">Gemma 2 9B — alternatif</option>
          </select>
```

Reemplazar con:
```html
          <select id="modelMemorySelect" class="model-action-select">
            <option value="llama3-8b-8192">🟢 Llama 3 8B — económico ($0.05/M)</option>
            <option value="llama-3.3-70b-versatile">🟡 Llama 3.3 70B — equilibrado ($0.59/M)</option>
            <option value="gemma2-9b-it">🔵 Gemma 2 9B — alternativo ($0.20/M)</option>
          </select>
```

- [ ] **Step 2: Actualizar modelInsightSelect**

Buscar:
```html
          <select id="modelInsightSelect" class="model-action-select">
            <option value="llama3-8b-8192">Llama 3 8B — économique</option>
            <option value="llama-3.3-70b-versatile">Llama 3.3 70B — précis</option>
            <option value="gemma2-9b-it">Gemma 2 9B — alternatif</option>
          </select>
```

Reemplazar con:
```html
          <select id="modelInsightSelect" class="model-action-select">
            <option value="llama3-8b-8192">🟢 Llama 3 8B — económico ($0.05/M)</option>
            <option value="llama-3.3-70b-versatile">🟡 Llama 3.3 70B — equilibrado ($0.59/M)</option>
            <option value="gemma2-9b-it">🔵 Gemma 2 9B — alternativo ($0.20/M)</option>
          </select>
```

- [ ] **Step 3: Actualizar modelGroqSelect**

Buscar:
```html
          <select id="modelGroqSelect" class="model-action-select">
            <option value="llama-3.3-70b-versatile">Llama 3.3 70B — qualité ($0.001/min)</option>
            <option value="llama-3.1-8b-instant">Llama 3.1 8B — rapide ($0.0005/min)</option>
          </select>
```

Reemplazar con:
```html
          <select id="modelGroqSelect" class="model-action-select">
            <option value="llama-3.3-70b-versatile">🟡 Llama 3.3 70B — equilibrado ($0.001/min)</option>
            <option value="llama-3.1-8b-instant">🟢 Llama 3.1 8B — económico ($0.0005/min)</option>
          </select>
```

- [ ] **Step 4: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat: badges calidad/precio en selects de Config"
```

---

## Task 7: Sync Android y verificación manual

**Files:**
- Run: `buddy/` directory

- [ ] **Step 1: Sync a Android**

```powershell
cd C:\Users\xavie\OneDrive\Documentos\Cerrador\buddy
npx cap sync android
```
Esperado: `Sync finished in X.XXXs`

- [ ] **Step 2: Lista de verificación manual en el dispositivo**

Instalar la APK de debug y verificar:

1. **Picker visible**: En Home con una persona seleccionada, debe aparecer debajo del botón Start un botón tipo pill `⚙️ [modelo] · [coste] ▾`
2. **Label correcto**: El modelo mostrado debe corresponder al modelo de la persona activa
3. **Expand**: Tocar el pill expande una fila de chips con solo los modelos cuya key está configurada
4. **Selección**: Tocar un chip lo marca como activo, colapsa el panel y actualiza el label
5. **Conversación**: Iniciar conversación → el picker desaparece. Al parar → vuelve a aparecer con el modelo reseteado al de la persona
6. **Config badges**: En la pestaña Config → "Modèles par action" → los selects de memoria, insights y Groq muestran los emojis 🟢/🟡/🔵 con costes

- [ ] **Step 3: Commit final**

```bash
git add buddy/www/index.html
git commit -m "chore: sync Android — model picker completo"
```
