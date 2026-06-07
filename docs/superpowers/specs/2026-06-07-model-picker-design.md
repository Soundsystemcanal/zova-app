# Model Picker & Config Badges — Design Spec
Date: 2026-06-07

## Objetivo

1. Añadir un selector de modelo de conversación expandible en la pantalla Home, accesible antes de iniciar una sesión.
2. Mejorar las etiquetas de los selects de modelos por proceso en Config con badges visuales y costes aproximados.

---

## Feature 1 — Panel expandible en Home

### UI

Debajo del botón "Iniciar conversación", un botón-resumen compacto siempre visible:

```
⚙️  gpt-4o-realtime  ·  ~$0.06/min   ▾
```

Al tocarlo:
- Se expande una fila de chips horizontales (scroll horizontal si no caben)
- Cada chip muestra: nombre corto del modelo + coste/min
- Solo aparecen modelos cuya API key está configurada (filtrado async al expandir)
- El chip del modelo activo está resaltado (color `--violet`)
- Tocar un chip selecciona el modelo y colapsa el panel
- Tocar el botón de nuevo colapsa sin cambio

### Estado

- Variable JS: `let sessionModelOverride = ''` — string vacío = usar modelo de la persona
- Se resetea a `''` en `stopConversation()`
- Al pulsar Start: `activeModelId = sessionModelOverride || getEffectiveModel(persona)`
- El botón se re-renderiza en `loadPersonaIntoHome()` con el modelo actual de la persona como valor inicial

### Modelos disponibles en el picker

Mismo catálogo que el select `modelConvSelect` en Config, filtrado por keys disponibles:

| Modelo | Provider | Coste aprox. |
|--------|----------|-------------|
| gpt-4o-realtime | openai | $0.06/min |
| gpt-4o-mini-realtime | openai | $0.01/min |
| gemini-2.0-flash | gemini | $0.01/min |
| ultravox-70b | ultravox | $0.005/min |
| groq-70b | groq | $0.001/min |
| groq-8b | groq | $0.0005/min |

### Persistencia

- El override NO se persiste — solo dura la sesión actual
- La persona conserva su `persona.model` intacto

---

## Feature 2 — Badges en Config (modelos por proceso)

En los selects `modelMemorySelect`, `modelInsightSelect`, `modelGroqSelect`, cada `<option>` incluye emoji de referencia y coste por millón de tokens:

| Emoji | Significado |
|-------|-------------|
| 🟢 | Económico — ideal para uso frecuente |
| 🟡 | Equilibrado — buena calidad/precio |
| 🔵 | Alternativo — diferente arquitectura |

Ejemplo para memoria episódica:
```html
<option value="llama3-8b-8192">🟢 Llama 3 8B — económico ($0.05/M)</option>
<option value="llama-3.3-70b-versatile">🟡 Llama 3.3 70B — equilibrado ($0.59/M)</option>
<option value="gemma2-9b-it">🔵 Gemma 2 9B — alternativo ($0.20/M)</option>
```

No se añaden modelos nuevos en esta iteración.

---

## Archivos afectados

- `buddy/www/index.html` — único archivo de la app (single-file architecture)
  - HTML: añadir botón expandible en sección Home (`#controls`)
  - CSS: estilos del botón y chips (Dark Cosmos theme)
  - JS: variable `sessionModelOverride`, lógica expand/collapse, filtrado de keys, patch en `startBtn` click y `stopConversation()`
  - HTML Config: actualizar texto de las `<option>` con badges y costes

## Fuera de alcance

- Persistir el override entre sesiones
- Añadir nuevos modelos al catálogo
- Cambiar el modelo de la persona desde Home (solo override temporal)
