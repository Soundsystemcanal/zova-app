# Buddy — Mobile App Design Spec
**Fecha:** 2026-06-06  
**Estado:** ✅ APROBADO — 2026-06-06. Listo para plan de implementación.

---

## Resumen

Buddy es una app Android derivada de la web app de voz **Kast** (por Renaud Dékode). Se renombra, rediseña visualmente, se empaqueta como APK nativo via Capacitor, y se amplía con soporte de APIs baratas adicionales y almacenamiento seguro de claves API.

---

## Decisiones confirmadas por el usuario

| Decisión | Elección |
|---|---|
| Plataforma | Android únicamente |
| Distribución | APK via Capacitor + GitHub Releases + QR code |
| APIs añadidas | Multi-proveedor: OpenAI Realtime + Gemini Live + Ultravox + Groq pipeline |
| Idioma UI | Multi-idioma: ES / EN / FR (i18n por idioma del dispositivo) |
| Estilo visual | Dark Cosmos (azul espacial + violeta + rosa neón) |
| Layout móvil | Bottom navigation — 4 pestañas: Inicio / Personas / Stats / Config |

---

## Sección 1 — Arquitectura (PRESENTADA, pendiente aprobación)

Capacitor como shell nativo. El HTML de Kast corre dentro de un WebView Android.

```
buddy/
├── src/
│   └── index.html          ← HTML de Kast renombrado/rediseñado
├── android/                ← proyecto Android generado por Capacitor
├── capacitor.config.json   ← nombre de app, bundle id, icono
└── package.json            ← Capacitor + @capacitor-community/secure-storage
```

- API keys → Android Keystore via `@capacitor-community/secure-storage` (AES-256)
- Personas, stats, historial → localStorage del WebView (no sensible)
- Migración automática al primer arranque: localStorage → Keystore

---

## Sección 2 — Rediseño visual Dark Cosmos (PRESENTADA, pendiente aprobación)

| Elemento | Kast | Buddy |
|---|---|---|
| Fondo | `#0f0f1a` | `#0a0a1f → #0d0d2b` gradiente |
| Acento principal | `#4fc3f7` cyan | `#8b5cf6` violeta + `#ec4899` rosa neón |
| Acento secundario | `#ffb74d` naranja | `#6d28d9` púrpura |
| Logo | KAST | BUDDY (gradiente violeta→rosa) |
| Layout | Sidebar 280px | Bottom navigation 4 tabs |

Pestañas bottom nav: 🏠 Inicio · 👤 Personas · 📊 Stats · ⚙️ Config

---

## Sección 3 — Multi-proveedor APIs (PRESENTADA, pendiente aprobación)

| Proveedor | Tipo | Coste aprox. |
|---|---|---|
| OpenAI Realtime | WebSocket voz | ~$0.06/min |
| Gemini Live | WebSocket voz | ~$0.002/min |
| Ultravox *(nuevo)* | WebSocket voz | ~$0.005/min |
| Groq pipeline *(nuevo)* | STT→LLM→TTS | ~$0.001/min |

Ultravox: compatible con API WebSocket de OpenAI, modelos Llama 3.  
Groq pipeline: Groq Whisper + Llama 3 70B + browser TTS nativo.

---

## Sección 4 — Almacenamiento seguro (PRESENTADA, pendiente aprobación)

```js
// Kast (antes):
localStorage.setItem('kast_apiKey', 'sk-...')

// Buddy (después):
SecureStorage.set({ key: 'buddy_apiKey', value: 'sk-...' })
// → Android Keystore, cifrado AES-256, no exportable
```

Migración transparente al primer arranque.

---

## Pendiente de discutir

- [ ] Aprobación de secciones 1–4
- [ ] Sección 5: i18n — estructura de traducciones ES/EN/FR
- [ ] Sección 6: Distribución — GitHub Releases + generación del QR
- [ ] Sección 7: Plan de build — pasos para generar el APK
- [ ] Escribir plan de implementación (invocar writing-plans)

---

## Fuente base

HTML original: app Kast by Renaud Dékode (~4000 líneas, single-file, sin build step).  
Mockups guardados en: `.superpowers/brainstorm/2160-1780734852/`
