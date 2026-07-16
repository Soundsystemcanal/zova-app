# Avatar Shells — identidad visual por persona (diseño)

**Fecha**: 2026-07-16
**Estado**: aprobado por Xavier (brainstorming en sesión)
**Archivo afectado**: `buddy/www/index.html` (único)

## Objetivo

Que cada persona tenga su propia identidad visual en conversación: una **carcasa** (forma exterior) combinable con una **paleta de color**, sobre la misma cara expresiva compartida. El avatar animado aparece en conversación; la foto/retrato de la persona sigue en tarjetas, cabecera y widget (sin cambios).

Decisiones tomadas:
- Carcasas distintas, **misma cara** (reutiliza motor de expresiones/visemas al 100%).
- Matriz libre: carcasa × paleta (4×4 = 16 combinaciones con las `AVATAR_SKINS` existentes).
- El usuario elige en el editor de persona; el wizard sugiere según tono.
- Convivencia con la foto de persona: avatar en conversación, foto en listas.

## Contexto técnico actual

- `buildZovaSvg(skin)` genera el SVG completo (defs de gradientes + cuerpo + cara) para una paleta.
- `createZovaAvatar(stageEl, skinId)` monta y anima: máquina de estados (idle/greeting/listening/thinking/speaking), interpolación spring, parpadeo/mirada/asentimiento, visemas de lip-sync.
- `renderZova()` anima rasgos faciales con coordenadas específicas de esta anatomía (contrato estable) y partes de "cuerpo" (flotación, sombra, anillo, specular) hoy con constantes fijas.
- `AVATAR_SKINS` (4 paletas) + `getAvatarSkin()`/`setAvatarSkin()` global (commit `639dc04`).
- Montaje único: `maybeMountAvatar()` → `homeAvatar`.

## Arquitectura: composición en 3 capas

```
buildAvatarSvg(shell, skin)
├── <defs>      → gradientes de la skin (actuales) + defs propios del shell
├── SHELL layer → shell.body(skin): cuerpo/forma exterior (anillo, forma, sombra, punto estado)
└── FACE layer  → FACE_SVG compartido (cejas, ojos, mejillas, boca), envuelto en
                  <g transform="${shell.faceTransform}">
```

Registro de carcasas:

```js
const AVATAR_SHELLS = {
    orb: {
        label: 'Orb', emoji: '🔮',
        faceTransform: '',                       // posición actual, sin ajuste
        motion: { floatAmp: 4.5, swayAmp: 3, breathAmp: 0.018, speed: 1 },
        body: (skin) => `...esfera actual...`
    },
    crystal: { /* gema facetada */ },
    flame:   { /* llama */ },
    cloud:   { /* nube */ }
};
```

Reglas:
- **La cara nunca se duplica**: `FACE_SVG` es un template único; un fix facial aplica a todas las carcasas.
- **Contrato de IDs del cuerpo**: `zFloat`, `zShadow`, `zRing`, `zSpecMain`, `zSpecHot`, `zDot` — el motor ya usa `?.` en todos, así que un shell puede omitir elementos (ej. Cloud sin anillo) sin romper nada.
- `createZovaAvatar(stageEl, { shell, skin })` — la parte facial de `renderZova()` no se toca; la parte de cuerpo usa `shell.motion` (los valores de Orb = constantes actuales).

## Modelo de datos

- Persona: campo opcional `p.avatar = { shell: 'crystal', skin: 'ocean' }`.
- `getEffectiveAvatar(persona)` → `persona.avatar` válido, o `{ shell: 'orb', skin: getAvatarSkin() }`.
- **Compatibilidad**: personas sin campo → aspecto idéntico a hoy. Los swatches globales de Config siguen siendo el default de la app.
- `maybeMountAvatar()` compara el avatar efectivo con el montado; si difiere → `homeAvatar = null` y remonta. `selectPersona()` ya la llama.
- Export/import/QR: `avatar` viaja dentro del JSON de persona (~40 bytes; sin impacto en el límite QR).

## UI

**Editor de persona** — fila "Avatar" bajo el campo imagen:
- Selector de carcasa: 4 botones emoji (🔮 💎 🔥 ☁️), mismo patrón que los swatches.
- Selector de paleta: los 4 swatches circulares existentes.
- Botón "↺" para volver al default global (elimina el campo `avatar`).
- Persistencia vía el Save existente (`savePersonas()`).

**Wizard** — extensión del mapeo determinista (patrón `WIZARD_VOICE_MAP`), tono→avatar sugerido, pre-rellenado y revisable en el editor:

| Tono | Shell | Paleta |
|---|---|---|
| chaleureux | ☁️ cloud | sunset |
| pro | 💎 crystal | mono |
| expert | 💎 crystal | dark_cosmos |
| fun | 🔥 flame | sunset |
| calme | ☁️ cloud | ocean |
| default | 🔮 orb | dark_cosmos |

## Las 4 carcasas (v1)

| Shell | Forma | Motion (vs Orb float 4.5/sway 3/breath 1.8%) |
|---|---|---|
| 🔮 Orb | Esfera actual (migración de referencia) | Idéntica a hoy |
| 💎 Crystal | Gema facetada ~9 caras, gradiente por faceta, brillo recorriendo aristas (reusa ciclo specular) | Rígido: float 2.5, sway 1.5, sin breath |
| 🔥 Flame | Silueta gota/llama, contorno superior ondulante (2 paths alternando opacidad con `rph`) | Vivo: float 5.5; cara más baja (`translate(0,12) scale(0.88)`) |
| ☁️ Cloud | Blob de 3-4 elipses solapadas, bordes con blur suave | Lento y amplio: float 6, sway 4, breath 2.5%, velocidad ×0.5 |

Los valores exactos de `faceTransform` y las formas se ajustan iterando con capturas en dispositivo (ciclo captura→ajuste por shell en el plan).

**Personas default** (en `injectDefaultPersona()`, solo si no tienen ya el campo): Zova→orb/dark_cosmos, Gaia→cloud/ocean, Lingo→crystal/mono.

## Errores y fallbacks

- Shell o skin desconocida (import de versión futura): fallback silencioso a orb + skin global (patrón `|| AVATAR_SKINS.dark_cosmos` existente).
- Campo `avatar` malformado (no objeto): se ignora → default global.

## Verificación (Xiaomi 14T, CDP + capturas)

1. **Regresión Orb**: migrada al nuevo sistema, visualmente idéntica a hoy en idle y speaking (captura comparada).
2. Montar cada shell×skin (16): grupo facial presente, visemas mueven la boca, sin errores de consola.
3. Cambiar entre personas con avatares distintos → remonta el correcto.
4. Export→import de persona conserva `avatar`; QR de persona sigue cabiendo.
5. Persona sin campo → usa default global; cambiar swatch global la afecta, no a las que tienen avatar propio.
6. `node --check` del JS extraído tras cada edición (trampa conocida de apóstrofes).

## Fuera de alcance (v1)

- Anatomías faciales distintas (robot/gato/humano) — exigiría re-diseñar el motor facial; la arquitectura de capas deja la puerta abierta (un futuro shell podría declarar su propio FACE, pero no se construye ahora).
- Avatar en widget/tarjetas (la foto sigue ahí).
- Packs de carcasas monetizables (la arquitectura lo permite; decisión de negocio posterior).
