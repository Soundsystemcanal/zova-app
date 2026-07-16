# Avatar Shells Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada persona de Zova puede tener su propia carcasa de avatar (Orb/Crystal/Flame/Cloud) combinada con cualquiera de las 4 paletas de color, sobre la misma cara expresiva compartida.

**Architecture:** El SVG monolítico `buildZovaSvg(skin)` se descompone en 3 capas: defs de skin (gradientes), SHELL (cuerpo por carcasa, registro `AVATAR_SHELLS`) y FACE (grupo facial único compartido, incrustado vía `{{FACE}}` + `faceTransform`). El motor de animación facial no se toca; los parámetros de movimiento del cuerpo (flotación/respiración) se leen de `shell.motion`. La persona guarda `avatar: {shell, skin}` opcional, resuelto por `getEffectiveAvatar()` con fallback al default global.

**Tech Stack:** Vanilla JS + SVG inline en `buddy/www/index.html` (single-file, sin dependencias nuevas). Verificación: `node --check` del JS extraído + CDP sobre Xiaomi 14T.

**Spec:** `docs/superpowers/specs/2026-07-16-avatar-shells-design.md`

## Global Constraints

- Un único archivo de código: `buddy/www/index.html`. Sin dependencias nuevas.
- Tras CADA edición del HTML, validar sintaxis JS (comando exacto en cada task; trampa conocida: apóstrofes sin escapar en strings JS con comillas simples — `d\'après`).
- Comentarios de código en francés (estilo del codebase). Strings visibles de UI con i18n ES/EN/FR (objeto `TRANSLATIONS`, 3 bloques).
- IDs faciales = contrato intocable, existen UNA sola vez: `zFaceGroup, zBrowL, zBrowR, zCheekL, zCheekR, zIL, zIR, zPL, zPR, zHL1L, zHL1R, zLL, zLR, zLBL, zLBR, zMS, zMFill, zTongue, zTeeth, zLipUpper, zLipLower, zLipShine, zCL, zCR` (+ clipPaths `zEyeClipL/R` y filtro `zGL` en defs).
- IDs de cuerpo = contrato opcional (el motor usa `?.`, omitirlos es seguro): `zFloat, zShadow, zRing, zSpecMain, zSpecHot, zDot, zPulse1, zPulse2`.
- **Regresión cero en Orb**: `orb` + `dark_cosmos` debe verse idéntica a la esfera actual (captura comparada en Task 8).
- Persona sin campo `avatar` → aspecto según default global (`getAvatarSkin()` + orb). Shell/skin desconocida → fallback silencioso a `orb` / skin global.
- localStorage: no se crean claves nuevas (el campo vive dentro de `buddy_personas`).
- Los números de línea citados son del commit `e07fb37`; verificar con grep antes de editar (el archivo se desplaza).

---

### Task 1: Descomponer buildZovaSvg en skinDefs + FACE_SVG + AVATAR_SHELLS.orb + buildAvatarSvg

**Files:**
- Modify: `buddy/www/index.html` (~5688-5807: `buildZovaSvg` actual; buscar con `grep -n "function buildZovaSvg"`)

**Interfaces:**
- Consumes: `AVATAR_SKINS` (registro existente de 4 paletas, commit `639dc04`).
- Produces: `skinDefs(skin) → string` (contenido de `<defs>`); `FACE_SVG: string` (grupo facial); `AVATAR_SHELLS = { orb: { label, emoji, faceTransform, motion, body(skin) } }`; `buildAvatarSvg(shell, skin) → string`. `buildZovaSvg` DEJA de existir.

- [ ] **Step 1: Localizar los bloques actuales**

```powershell
cd C:\Users\xavie\OneDrive\Documentos\Cerrador
grep -n "function buildZovaSvg" buddy/www/index.html
grep -n "stageEl.innerHTML = buildZovaSvg" buddy/www/index.html
```
Expected: 1 definición y 1 call-site (dentro de `mount()`).

- [ ] **Step 2: Crear `skinDefs(skin)`**

La función `buildZovaSvg(skin)` actual devuelve un template que empieza por `<defs>` y termina en `</defs>` seguido del cuerpo. Cortar TODO el contenido entre `<defs>` y `</defs>` (inclusive los clipPaths `zEyeClipL/R`, el filtro `zGL` y todos los gradientes con interpolaciones `${skin.*}`) y moverlo, sin cambiar ni un carácter del interior, a:

```js
    // Défs partagés : gradients de la palette + clips/filtre du visage.
    // Utilisés par toutes les carcasses.
    function skinDefs(skin) { return `<contenido movido, SIN las etiquetas <defs></defs>>`; }
```

- [ ] **Step 3: Extraer `FACE_SVG`**

Cortar el bloque facial completo — desde `<g id="zFaceGroup">` hasta su `</g>` de cierre (el que precede a `<circle cx="100" cy="100" r="85" fill="url(#zVol)"`) — y moverlo verbatim a una constante:

```js
    // Visage partagé par toutes les carcasses — NE JAMAIS dupliquer.
    // Un correctif facial s'applique ainsi à toutes les formes.
    const FACE_SVG = `<g id="zFaceGroup">…bloque movido verbatim…</g>`;
```

- [ ] **Step 4: Crear el registro `AVATAR_SHELLS` con `orb`**

El resto del template (sombra + `zFloat` con esfera/anillo/speculares + `zVol` + `zDot`) pasa a ser el `body` de orb, con el token `{{FACE}}` donde estaba `zFaceGroup`:

```js
    // ════════════════════════════════════════════════
    //  Carcasses d'avatar — forme extérieure par persona.
    //  Contrat : body(skin) contient {{FACE}} là où s'insère le visage.
    //  IDs de corps optionnels (le moteur utilise ?.) : zFloat, zShadow,
    //  zRing, zSpecMain, zSpecHot, zDot, zPulse1, zPulse2.
    // ════════════════════════════════════════════════
    const AVATAR_SHELLS = {
        orb: {
            label: 'Orb', emoji: '🔮',
            faceTransform: '',
            motion: { floatAmp: 4.5, swayAmp: 3, rollAmp: 1.2, breathAmp: 0.018, speed: 1, shadowRx: 66 },
            body: (skin) => `<ellipse id="zShadow" cx="100" cy="190" rx="66" ry="8" fill="${skin.shadow}" opacity="0.16"/>
<g id="zFloat">
…(los círculos/elipses actuales de la esfera, verbatim con sus ${skin.*})…
{{FACE}}
<circle cx="100" cy="100" r="85" fill="url(#zVol)" opacity="0.8"/>
</g>
<circle id="zDot" cx="100" cy="173" r="3" fill="${skin.swatch}" opacity="0.5" filter="url(#zGL)"/>`
        }
    };
```

- [ ] **Step 5: Crear `buildAvatarSvg` y eliminar `buildZovaSvg`**

```js
    function buildAvatarSvg(shell, skin) {
        const face = shell.faceTransform
            ? `<g transform="${shell.faceTransform}">${FACE_SVG}</g>`
            : FACE_SVG;
        return `<defs>${skinDefs(skin)}${shell.defs ? shell.defs(skin) : ''}</defs>` +
               shell.body(skin).replace('{{FACE}}', face);
    }
```

En `mount()` (dentro de `createZovaAvatar`), reemplazar temporalmente:
```js
                stageEl.innerHTML = buildAvatarSvg(AVATAR_SHELLS.orb, skin);
```
(la firma de `createZovaAvatar` se cambia en Task 2; en este task sigue recibiendo `skinId`).

- [ ] **Step 6: Validar sintaxis**

```powershell
python -c "
import re, os
content = open('buddy/www/index.html', encoding='utf-8').read()
scripts = [s for s in re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)]
open(os.environ['TEMP']+'/zova_t1.js','w',encoding='utf-8').write('\n'.join(scripts))
"
node --check "$env:TEMP\zova_t1.js"
```
Expected: exit 0, sin output de error.

- [ ] **Step 7: Verificar en dispositivo que Orb sigue montando**

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; $env:ANDROID_HOME = "C:\Users\xavie\AppData\Local\Android\Sdk"; $env:PATH = "$env:PATH;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools"
cd buddy; npx cap sync android; cd android; .\gradlew assembleDebug; adb install -r app\build\outputs\apk\debug\app-debug.apk
adb shell am force-stop com.buddy.voiceapp; adb shell monkey -p com.buddy.voiceapp -c android.intent.category.LAUNCHER 1
# CDP (patrón CLAUDE.md): forward + eval
# eval: "avatarEnabled=true; maybeMountAvatar(); JSON.stringify({face: !!document.querySelector('#avatarStage #zFaceGroup'), ring: !!document.querySelector('#avatarStage #zRing'), stops: document.querySelector('#avatarStage #zFA stop').getAttribute('stop-color')})"
```
Expected: `{"face":true,"ring":true,"stops":"#4a4194"}`.

- [ ] **Step 8: Commit**

```bash
git add buddy/www/index.html
git commit -m "refactor(avatar): descomponer SVG en skinDefs + FACE_SVG + AVATAR_SHELLS.orb"
```

---

### Task 2: Motor parametrizado por shell + getEffectiveAvatar + remount por persona

**Files:**
- Modify: `buddy/www/index.html` — `createZovaAvatar` (~5825), `renderZova` (parte cuerpo, ~5889-5905), `maybeMountAvatar` (~5985), swatch handler de Config (~6425)

**Interfaces:**
- Consumes: `AVATAR_SHELLS`, `AVATAR_SKINS`, `getAvatarSkin()`, `getPersonas()`, `getActiveId()`.
- Produces: `createZovaAvatar(stageEl, {shell: string, skin: string})` (nueva firma); `getEffectiveAvatar(persona) → {shell, skin}` (ids validados); hook genérico `zPulse1/zPulse2` en renderZova.

- [ ] **Step 1: Nueva firma de createZovaAvatar**

Reemplazar el arranque actual:
```js
    function createZovaAvatar(stageEl, skinId) {
        const skin = AVATAR_SKINS[skinId] || AVATAR_SKINS.dark_cosmos;
```
por:
```js
    function createZovaAvatar(stageEl, avatar) {
        // avatar = { shell, skin } — ids déjà validés par getEffectiveAvatar()
        const shell = AVATAR_SHELLS[avatar?.shell] || AVATAR_SHELLS.orb;
        const skin  = AVATAR_SKINS[avatar?.skin]  || AVATAR_SKINS.dark_cosmos;
        const mo    = shell.motion;
```
Y en `mount()`: `stageEl.innerHTML = buildAvatarSvg(shell, skin);`

- [ ] **Step 2: Parametrizar la parte "cuerpo" de renderZova**

Reemplazar las líneas de flotación/sombra (actuales con constantes 4.5/3/1.2/0.018 y `(floatY+4.5)/9` / `rx 66`):
```js
            const ft = performance.now()/1000 * mo.speed;
            const floatY = Math.sin(ft*.9)*mo.floatAmp, swayX = Math.sin(ft*.6)*mo.swayAmp, rollZ = Math.sin(ft*.45)*mo.rollAmp, breath = 1+Math.sin(ft*.8)*mo.breathAmp;
            const zFloat = g('zFloat');
            if (zFloat) zFloat.setAttribute('transform', `translate(${swayX},${floatY}) rotate(${rollZ},100,100) scale(${breath})`);
            const lift = mo.floatAmp > 0 ? (floatY+mo.floatAmp)/(mo.floatAmp*2) : 0.5;
            g('zShadow')?.setAttribute('rx', mo.shadowRx-lift*12);
```
(las líneas de `zShadow` opacity/cx, speculares, anillo y todo lo facial quedan igual). Añadir al final de renderZova, junto al `zDot`, el hook genérico de pulso para shells animadas:
```js
            // Hook générique : éléments de carcasse qui pulsent en alternance (ex. flamme)
            g('zPulse1')?.setAttribute('opacity', .5+Math.sin(rph*2)*.4);
            g('zPulse2')?.setAttribute('opacity', .5-Math.sin(rph*2)*.4);
```

- [ ] **Step 3: getEffectiveAvatar + remount por cambio en maybeMountAvatar**

Justo antes de `maybeMountAvatar()`:
```js
    // Résout l'avatar effectif d'un persona : son champ avatar s'il est
    // valide, sinon le défaut global (skin des swatches Config + orb).
    function getEffectiveAvatar(persona) {
        const a = (persona && typeof persona.avatar === 'object' && persona.avatar) || {};
        return {
            shell: AVATAR_SHELLS[a.shell] ? a.shell : 'orb',
            skin:  AVATAR_SKINS[a.skin]  ? a.skin  : getAvatarSkin()
        };
    }
    let mountedAvatarKey = null;
```
En `maybeMountAvatar()`, reemplazar el bloque `if (!homeAvatar) {...}` por:
```js
        const av = getEffectiveAvatar(getPersonas().find(p => p.id === getActiveId()));
        const key = av.shell + '|' + av.skin;
        if (homeAvatar && mountedAvatarKey !== key) homeAvatar = null; // persona/skin a changé
        if (!homeAvatar) {
            homeAvatar = createZovaAvatar(document.getElementById('avatarStage'), av);
            homeAvatar.mount();
            mountedAvatarKey = key;
        }
```

- [ ] **Step 4: Validar sintaxis** — mismo comando del Task 1 Step 6 (tmp `zova_t2.js`). Expected: exit 0.

- [ ] **Step 5: Verificar en dispositivo**

Build+install+restart (Task 1 Step 7). CDP eval:
```js
"avatarEnabled=true; maybeMountAvatar(); const a=getEffectiveAvatar(null); JSON.stringify({eff:a, mounted: mountedAvatarKey, face: !!document.querySelector('#avatarStage #zFaceGroup')})"
```
Expected: `{"eff":{"shell":"orb","skin":"dark_cosmos"},"mounted":"orb|dark_cosmos","face":true}`.

- [ ] **Step 6: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(avatar): motor parametrizado por shell + getEffectiveAvatar + remount por persona"
```

---

### Task 3: Shell Crystal 💎

**Files:**
- Modify: `buddy/www/index.html` — registro `AVATAR_SHELLS` (añadir entrada tras `orb`)

**Interfaces:**
- Consumes: contrato `body(skin)` + `{{FACE}}` + IDs opcionales (Task 1), `mo` (Task 2).
- Produces: `AVATAR_SHELLS.crystal`.

- [ ] **Step 1: Añadir la entrada `crystal`**

```js
        crystal: {
            label: 'Crystal', emoji: '💎',
            faceTransform: 'translate(0,6) scale(0.92)',
            motion: { floatAmp: 2.5, swayAmp: 1.5, rollAmp: 0.6, breathAmp: 0, speed: 1, shadowRx: 58 },
            body: (skin) => `<ellipse id="zShadow" cx="100" cy="190" rx="58" ry="7" fill="${skin.shadow}" opacity="0.16"/>
<g id="zFloat">
<polygon points="100,10 155,30 188,80 180,140 140,185 60,185 20,140 12,80 45,30" fill="none" stroke="url(#zRM)" stroke-width="1.8" opacity="0.7"/>
<polygon points="100,16 150,34 181,81 174,137 136,179 64,179 26,137 19,81 50,34" fill="url(#zFA)"/>
<polygon points="100,16 150,34 181,81 174,137 136,179 64,179 26,137 19,81 50,34" fill="url(#zCore)"/>
<polygon points="100,16 150,34 181,81 174,137 136,179 64,179 26,137 19,81 50,34" fill="url(#zRim)"/>
<path d="M100,16 L19,81 L100,100 Z" fill="rgba(255,255,255,0.06)"/>
<path d="M100,16 L181,81 L100,100 Z" fill="rgba(255,255,255,0.10)"/>
<path d="M26,137 L64,179 L100,100 Z" fill="rgba(0,0,0,0.10)"/>
<path d="M174,137 L136,179 L100,100 Z" fill="rgba(255,255,255,0.04)"/>
<path id="zPulse1" d="M100,16 L150,34" stroke="rgba(255,255,255,0.8)" stroke-width="1.5" fill="none"/>
<path id="zPulse2" d="M19,81 L26,137" stroke="rgba(255,255,255,0.6)" stroke-width="1.2" fill="none"/>
<ellipse id="zSpecMain" cx="70" cy="52" rx="20" ry="12" fill="url(#zSpec)" opacity="0.85" transform="rotate(-30,70,52)"/>
<circle id="zSpecHot" cx="64" cy="46" r="5" fill="url(#zSpec2)" opacity="0.95"/>
{{FACE}}
</g>
<circle id="zDot" cx="100" cy="173" r="3" fill="${skin.swatch}" opacity="0.5" filter="url(#zGL)"/>`
        },
```

- [ ] **Step 2: Validar sintaxis** (tmp `zova_t3.js`). Expected: exit 0.

- [ ] **Step 3: Iteración visual en dispositivo**

Build+install+restart. CDP: `"avatarEnabled=true; setAvatarSkin('mono'); homeAvatar=null; mountedAvatarKey=null; document.getElementById('avatarStage').innerHTML = buildAvatarSvg(AVATAR_SHELLS.crystal, AVATAR_SKINS.mono); 'ok'"` y luego captura:
```powershell
adb shell screencap -p /sdcard/s.png; adb pull /sdcard/s.png "$env:TEMP\crystal.png"; adb shell rm /sdcard/s.png
```
Revisar la captura (Read). Ajustar puntos del polígono/`faceTransform` si la cara desborda las facetas o la forma se ve torcida. Repetir hasta que la gema se vea intencional. Al terminar, restaurar: CDP `"setAvatarSkin('dark_cosmos'); location.reload()"`.

- [ ] **Step 4: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(avatar): shell Crystal 💎"
```

---

### Task 4: Shell Flame 🔥

**Files:**
- Modify: `buddy/www/index.html` — registro `AVATAR_SHELLS` (tras `crystal`)

**Interfaces:** igual que Task 3. Produces: `AVATAR_SHELLS.flame`.

- [ ] **Step 1: Añadir la entrada `flame`**

```js
        flame: {
            label: 'Flame', emoji: '🔥',
            faceTransform: 'translate(0,12) scale(0.88)',
            motion: { floatAmp: 5.5, swayAmp: 3.5, rollAmp: 1.6, breathAmp: 0.025, speed: 1.15, shadowRx: 52 },
            body: (skin) => `<ellipse id="zShadow" cx="100" cy="190" rx="52" ry="7" fill="${skin.shadow}" opacity="0.16"/>
<g id="zFloat">
<path id="zPulse1" d="M100,8 C70,40 90,52 100,30 C110,52 130,40 100,8 Z" fill="url(#zRM)" opacity="0.5"/>
<path id="zPulse2" d="M100,14 C82,38 96,48 100,32 C104,48 118,38 100,14 Z" fill="rgba(255,255,255,0.35)" opacity="0.5"/>
<path d="M100,18 C62,60 36,100 36,132 C36,168 64,190 100,190 C136,190 164,168 164,132 C164,100 138,60 100,18 Z" fill="url(#zFA)"/>
<path d="M100,18 C62,60 36,100 36,132 C36,168 64,190 100,190 C136,190 164,168 164,132 C164,100 138,60 100,18 Z" fill="url(#zCore)"/>
<path d="M100,18 C62,60 36,100 36,132 C36,168 64,190 100,190 C136,190 164,168 164,132 C164,100 138,60 100,18 Z" fill="url(#zRim)"/>
<path d="M100,44 C76,76 58,104 58,130 C58,158 78,176 100,176 C122,176 142,158 142,130 C142,104 124,76 100,44 Z" fill="rgba(255,255,255,0.05)"/>
<ellipse id="zSpecMain" cx="76" cy="70" rx="18" ry="26" fill="url(#zSpec)" opacity="0.7" transform="rotate(-16,76,70)"/>
<circle id="zSpecHot" cx="72" cy="60" r="5" fill="url(#zSpec2)" opacity="0.9"/>
{{FACE}}
</g>
<circle id="zDot" cx="100" cy="178" r="3" fill="${skin.swatch}" opacity="0.5" filter="url(#zGL)"/>`
        },
```

- [ ] **Step 2: Validar sintaxis** (tmp `zova_t4.js`). Expected: exit 0.

- [ ] **Step 3: Iteración visual en dispositivo** — mismo ciclo del Task 3 Step 3 con `AVATAR_SHELLS.flame` + `AVATAR_SKINS.sunset`, captura `flame.png`. La punta debe "lamer" (los dos `zPulse` alternan). Ajustar curvas si la cara queda fuera del cuerpo de la llama.

- [ ] **Step 4: Commit** — `git commit -m "feat(avatar): shell Flame 🔥"`

---

### Task 5: Shell Cloud ☁️

**Files:**
- Modify: `buddy/www/index.html` — registro `AVATAR_SHELLS` (tras `flame`)

**Interfaces:** igual que Task 3. Produces: `AVATAR_SHELLS.cloud`.

- [ ] **Step 1: Añadir la entrada `cloud`**

```js
        cloud: {
            label: 'Cloud', emoji: '☁️',
            faceTransform: 'translate(0,8) scale(0.95)',
            motion: { floatAmp: 6, swayAmp: 4, rollAmp: 0.8, breathAmp: 0.025, speed: 0.55, shadowRx: 70 },
            defs: (skin) => `<filter id="zCloudBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>`,
            body: (skin) => `<ellipse id="zShadow" cx="100" cy="190" rx="70" ry="8" fill="${skin.shadow}" opacity="0.14"/>
<g id="zFloat">
<g filter="url(#zCloudBlur)" opacity="0.55">
<ellipse cx="100" cy="112" rx="82" ry="62" fill="url(#zFA)"/>
<ellipse cx="52" cy="96" rx="40" ry="32" fill="url(#zFA)"/>
<ellipse cx="150" cy="102" rx="38" ry="30" fill="url(#zFA)"/>
<ellipse cx="94" cy="54" rx="44" ry="34" fill="url(#zFA)"/>
</g>
<ellipse cx="100" cy="110" rx="76" ry="58" fill="url(#zFA)"/>
<ellipse cx="56" cy="96" rx="36" ry="28" fill="url(#zFA)"/>
<ellipse cx="146" cy="102" rx="34" ry="27" fill="url(#zFA)"/>
<ellipse cx="95" cy="58" rx="40" ry="30" fill="url(#zFA)"/>
<ellipse cx="100" cy="110" rx="76" ry="58" fill="url(#zCore)"/>
<ellipse cx="100" cy="108" rx="78" ry="60" fill="url(#zRim)" opacity="0.6"/>
<ellipse id="zSpecMain" cx="72" cy="62" rx="24" ry="14" fill="url(#zSpec)" opacity="0.6" transform="rotate(-20,72,62)"/>
<circle id="zSpecHot" cx="66" cy="56" r="5" fill="url(#zSpec2)" opacity="0.8"/>
{{FACE}}
</g>
<circle id="zDot" cx="100" cy="176" r="3" fill="${skin.swatch}" opacity="0.5" filter="url(#zGL)"/>`
        }
```
Nota: `defs(skin)` es el hook opcional que `buildAvatarSvg` ya concatena (Task 1 Step 5) — el blur va en un filtro propio para no tocar `zGL`.

- [ ] **Step 2: Validar sintaxis** (tmp `zova_t5.js`). Expected: exit 0.

- [ ] **Step 3: Iteración visual en dispositivo** — ciclo del Task 3 Step 3 con `AVATAR_SHELLS.cloud` + `AVATAR_SKINS.ocean`, captura `cloud.png`. Movimiento lento y amplio; si el blur penaliza FPS en el WebView (tirones visibles), bajar `stdDeviation` a 2 o quitar el grupo blurred.

- [ ] **Step 4: Commit** — `git commit -m "feat(avatar): shell Cloud ☁️"`

---

### Task 6: UI del editor de persona + persistencia del campo avatar

**Files:**
- Modify: `buddy/www/index.html` — modal persona HTML (insertar antes de `<label for="pModel"`, ~3189), `openPersonaModal` (~7271), `savePersonaBtn` (~7675), `applyWizardResult` (~7256, solo reset), export/QR/import de persona, `TRANSLATIONS` ×3

**Interfaces:**
- Consumes: `AVATAR_SHELLS`, `AVATAR_SKINS`, `getAvatarSkin()`, patrón `tempImage` existente.
- Produces: variable `tempAvatar: {shell, skin} | null`; función `renderAvatarPickers()`; personas guardadas con campo `avatar` opcional.

- [ ] **Step 1: HTML de la fila Avatar**

Insertar antes de `<label for="pModel" data-i18n="modal_persona_model">`:
```html
            <label data-i18n="modal_persona_avatar">Avatar en conversation</label>
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
                <div id="pAvatarShells" style="display:flex;gap:8px"></div>
                <div id="pAvatarSkins" style="display:flex;gap:8px"></div>
                <button type="button" id="pAvatarReset" class="btn-small" style="padding:6px 10px" title="Défaut">&#8634;</button>
            </div>
            <div class="hint" data-i18n="modal_persona_avatar_hint">Forme et couleurs de l'avatar animé pendant la conversation. ↺ = défaut global.</div>
```

- [ ] **Step 2: Estado + render de los pickers**

Junto a `let tempImage = null;` añadir `let tempAvatar = null;` y:
```js
    // Sélecteurs forme + palette de l'avatar du persona. tempAvatar = null → défaut global.
    function renderAvatarPickers() {
        const shellsEl = document.getElementById('pAvatarShells');
        const skinsEl = document.getElementById('pAvatarSkins');
        shellsEl.innerHTML = Object.entries(AVATAR_SHELLS).map(([id, sh]) =>
            `<button type="button" data-shell="${id}" title="${esc(sh.label)}" style="width:38px;height:38px;border-radius:10px;font-size:1.15rem;cursor:pointer;padding:0;background:var(--bg-hover);border:2px solid ${tempAvatar?.shell === id ? 'var(--accent)' : 'var(--border)'}">${sh.emoji}</button>`).join('');
        skinsEl.innerHTML = Object.entries(AVATAR_SKINS).map(([id, sk]) =>
            `<button type="button" data-skin="${id}" title="${esc(sk.label)}" style="width:30px;height:30px;border-radius:50%;cursor:pointer;padding:0;background:${sk.swatch};border:2px solid ${tempAvatar?.skin === id ? sk.swatch : 'transparent'};outline:${tempAvatar?.skin === id ? '2px solid var(--text-primary)' : 'none'}"></button>`).join('');
        shellsEl.querySelectorAll('[data-shell]').forEach(b => b.addEventListener('click', () => {
            tempAvatar = { shell: b.dataset.shell, skin: tempAvatar?.skin || getAvatarSkin() };
            renderAvatarPickers();
        }));
        skinsEl.querySelectorAll('[data-skin]').forEach(b => b.addEventListener('click', () => {
            tempAvatar = { shell: tempAvatar?.shell || 'orb', skin: b.dataset.skin };
            renderAvatarPickers();
        }));
    }
    document.getElementById('pAvatarReset').addEventListener('click', () => { tempAvatar = null; renderAvatarPickers(); });
```

- [ ] **Step 3: Cargar y guardar**

En `openPersonaModal`, junto a `tempImage = persona ? persona.image : null;`:
```js
        tempAvatar = (persona && persona.avatar && AVATAR_SHELLS[persona.avatar.shell]) ? { ...persona.avatar } : null;
        renderAvatarPickers();
```
En el objeto de `savePersonaBtn` (tras `prompt: prompt`):
```js
            prompt: prompt,
            ...(tempAvatar ? { avatar: tempAvatar } : {})
```
En `applyWizardResult` no se toca aún (Task 7); `openPersonaModal()` ya resetea `tempAvatar`.

- [ ] **Step 4: Propagar el campo en export/QR/import/duplicar**

```powershell
grep -n "model: p.model" buddy/www/index.html
```
En CADA sitio que construya un objeto persona campo a campo (export persona ~7717, payload QR ~7996/4694 si campo a campo, import `processPersonaJson` ~11807, duplicar si aplica), añadir `avatar: p.avatar || undefined,` (en import, validar: `avatar: (p.avatar && AVATAR_SHELLS[p.avatar.shell]) ? p.avatar : undefined,`). Los que copien con spread (`{...p}`) no necesitan cambio. EXCEPCIÓN QR: si el payload QR está al límite, `avatar` son ~40 bytes — mantenerlo.

- [ ] **Step 5: i18n** — añadir en los 3 bloques de `TRANSLATIONS` (junto a `modal_persona_model`):
- ES: `modal_persona_avatar: 'Avatar en conversación', modal_persona_avatar_hint: 'Forma y colores del avatar animado durante la conversación. ↺ = valor global.',`
- EN: `modal_persona_avatar: 'Avatar in conversation', modal_persona_avatar_hint: 'Shape and colors of the animated avatar during conversation. ↺ = global default.',`
- FR: `modal_persona_avatar: 'Avatar en conversation', modal_persona_avatar_hint: 'Forme et couleurs de l\'avatar animé pendant la conversation. ↺ = défaut global.',` (¡apóstrofe escapado!)

- [ ] **Step 6: Validar sintaxis** (tmp `zova_t6.js`). Expected: exit 0.

- [ ] **Step 7: Verificar en dispositivo** — build+install+restart. CDP: abrir una persona (`openPersonaModal(getPersonas()[0])`), comprobar `document.querySelectorAll('#pAvatarShells button').length === 4`, click programático en shell `crystal` + skin `ocean`, `savePersonaBtn` click, y `JSON.parse(localStorage.getItem('buddy_personas'))[0].avatar` → `{"shell":"crystal","skin":"ocean"}`. Después restaurar: reeditar y pulsar `pAvatarReset` + guardar → campo ausente.

- [ ] **Step 8: Commit** — `git commit -m "feat(avatar): selector carcasa+paleta por persona en el editor"`

---

### Task 7: Sugerencia del wizard + avatares de las personas default

**Files:**
- Modify: `buddy/www/index.html` — junto a `WIZARD_VOICE_MAP` (~6960), `applyWizardResult` (~7256), `injectDefaultPersona` (~4643), `getDefaultPersonaZova/Gaia/Lingo`

**Interfaces:**
- Consumes: `wizardData.tone` (valores: `chaleureux|pro|fun|calme|expert`), `tempAvatar`/`renderAvatarPickers()` (Task 6).
- Produces: `WIZARD_AVATAR_MAP`; personas default con campo `avatar`.

- [ ] **Step 1: Mapa tono→avatar + aplicación en el wizard**

Tras `WIZARD_VOICE_MAP`:
```js
    // Ton du wizard → avatar suggéré (pré-rempli, révisable dans l'éditeur)
    const WIZARD_AVATAR_MAP = {
        chaleureux: { shell: 'cloud',   skin: 'sunset' },
        pro:        { shell: 'crystal', skin: 'mono' },
        expert:     { shell: 'crystal', skin: 'dark_cosmos' },
        fun:        { shell: 'flame',   skin: 'sunset' },
        calme:      { shell: 'cloud',   skin: 'ocean' }
    };
```
En `applyWizardResult`, tras `document.getElementById('pGreeting').value = wizardData.who;`:
```js
        tempAvatar = WIZARD_AVATAR_MAP[wizardData.tone] ? { ...WIZARD_AVATAR_MAP[wizardData.tone] } : null;
        renderAvatarPickers();
```

- [ ] **Step 2: Personas default**

En `getDefaultPersonaZova()` añadir al objeto retornado: `avatar: { shell: 'orb', skin: 'dark_cosmos' },`
En `getDefaultPersonaGaia()`: `avatar: { shell: 'cloud', skin: 'ocean' },`
En `getDefaultPersonaLingo()`: `avatar: { shell: 'crystal', skin: 'mono' },`
En `injectDefaultPersona()`, tras el bloque de inyección de Lingo, migración para usuarios existentes (solo si falta el campo):
```js
                // Avatar par défaut des personas bundled (migration additive, ne touche pas un choix utilisateur)
                const DEFAULT_AVATARS = { 'zova-default-v1': { shell: 'orb', skin: 'dark_cosmos' }, 'gaia-default-v1': { shell: 'cloud', skin: 'ocean' }, 'lingo-default-v1': { shell: 'crystal', skin: 'mono' } };
                let avatarsAdded = false;
                personas.forEach(p => { if (DEFAULT_AVATARS[p.id] && !p.avatar) { p.avatar = DEFAULT_AVATARS[p.id]; avatarsAdded = true; } });
                if (avatarsAdded) console.log('[Zova] Avatars par défaut injectés');
```
(comprobar que el bloque termina con `localStorage.setItem('buddy_personas', JSON.stringify(personas))` — si el guardado es condicional, incluir `avatarsAdded` en la condición).

- [ ] **Step 3: Validar sintaxis** (tmp `zova_t7.js`). Expected: exit 0.

- [ ] **Step 4: Verificar en dispositivo** — build+install+restart. CDP: `JSON.stringify(getPersonas().filter(p=>p.id.includes('default')).map(p=>({id:p.id, avatar:p.avatar})))` → Zova orb/dark_cosmos, Gaia cloud/ocean, Lingo crystal/mono.

- [ ] **Step 5: Commit** — `git commit -m "feat(avatar): wizard sugiere avatar por tono + defaults Zova/Gaia/Lingo"`

---

### Task 8: Verificación E2E + captura de regresión Orb

**Files:**
- Ninguno (solo verificación; ajustes menores si fallan checks)

**Interfaces:** consume todo lo anterior.

- [ ] **Step 1: Matriz 16 combos via CDP**

```js
"(function(){ const bad=[]; for (const sh of Object.keys(AVATAR_SHELLS)) for (const sk of Object.keys(AVATAR_SKINS)) { document.getElementById('avatarStage').innerHTML = buildAvatarSvg(AVATAR_SHELLS[sh], AVATAR_SKINS[sk]); if (!document.querySelector('#avatarStage #zFaceGroup') || !document.querySelector('#avatarStage #zLipUpper')) bad.push(sh+'/'+sk); } return JSON.stringify({bad}); })()"
```
Expected: `{"bad":[]}`. Después `location.reload()`.

- [ ] **Step 2: Regresión visual Orb** — con la app recién abierta (persona Zova activa, avatar habilitado), captura `adb shell screencap` y comparar a ojo con una captura previa al refactor (o con la esfera en producción v5.0): mismo tamaño, colores, anillo, sombra, cara.

- [ ] **Step 3: Remount al cambiar de persona** — CDP: `selectPersona` a Gaia (cloud) y luego a Lingo (crystal); tras cada uno, `mountedAvatarKey` debe ser `cloud|ocean` y `crystal|mono` respectivamente.

- [ ] **Step 4: Export→import conserva avatar** — CDP: exportar la primera persona con avatar custom a JSON (función export existente), `processPersonaJson` sobre ese JSON, y verificar que la persona importada tiene el mismo `avatar`.

- [ ] **Step 5: Visemas en shell no-orb** — con Gaia (cloud) activa, CDP: `startVisemes('hola como estas', 2)` y comprobar que `#zLipUpper` cambia su `d` entre dos frames (`setTimeout` 300ms).

- [ ] **Step 6: Commit final + push** (si todo verde)

```bash
git add -A && git commit -m "feat(avatar): verificación E2E avatar shells" --allow-empty
git push
```

---

## Self-review (hecho al escribir el plan)

- **Cobertura del spec**: arquitectura 3 capas (T1), motor+motion+resolución+remount (T2), 4 carcasas (T1,T3,T4,T5), UI editor (T6), wizard+defaults (T7), fallbacks (T2 getEffectiveAvatar / T6 import validado), verificación completa (T8, puntos 1-6 del spec).
- **Sin placeholders**: los bloques "movidos verbatim" llevan marcadores exactos de inicio/fin; todo código nuevo está completo.
- **Consistencia de nombres**: `buildAvatarSvg(shell, skin)`, `AVATAR_SHELLS`, `getEffectiveAvatar(persona)`, `tempAvatar`, `renderAvatarPickers()`, `mountedAvatarKey`, `WIZARD_AVATAR_MAP` — usados idénticos en todos los tasks.
