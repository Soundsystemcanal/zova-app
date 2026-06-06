# Zova — Proyecto Android

> App Android de asistente de voz IA. Funcional en Xiaomi 14T. Leer `buddy/` para el código.

## Resumen rápido

**Zova** es una app Android de voz IA con personas configurables. Single-file HTML + Capacitor. Sin backend. Usa OpenAI Realtime API / Ultravox / Groq. API keys en Android Keystore.

- **App:** `buddy/www/index.html` (~6700 líneas)  
- **Android:** `buddy/android/`  
- **Icono fuente:** `buddy/assets/icon.png`  
- **ID:** `com.zova.voiceapp`

## Estado (2026-06-06)

✅ App funcional en Xiaomi 14T (Android 16 "Baklava")  
✅ Tasks 1–10 completos  
⏳ Task 11 — APK release firmado  
⏳ Task 12 — GitHub Releases + QR  

## Comandos esenciales

```powershell
# Variables de entorno (necesarias en cada sesión PowerShell)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\xavie\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools"

# Sincronizar HTML → Android (después de cada cambio en index.html)
cd C:\Users\xavie\OneDrive\Documentos\Cerrador\buddy
npx cap sync android

# Verificar dispositivo conectado
adb devices

# Regenerar todos los iconos
npx @capacitor/assets generate --iconBackgroundColor '#1a3a8f' --splashBackgroundColor '#1565c0'
```

## Arquitectura

```
index.html (single-file app)
├── CSS: Dark Cosmos theme (violet #8b5cf6, pink #ec4899, bg #0a0a1f)
├── HTML: 4 screens (Home, Personas, Stats, Config) + modales
└── JS:
    ├── i18n: ES/EN/FR (auto-detect + selector)
    ├── SecureStorage: Android Keystore via capacitor-secure-storage-plugin
    ├── Providers: OpenAI Realtime, Gemini Live, Ultravox, Groq pipeline
    ├── WakeLock: screen-on durante conversación
    ├── Reconnect: auto-retry 3x si WS cierra inesperadamente
    └── PIN lock: 4 dígitos, stored en Keystore
```

## Bugs Android ya resueltos

| Síntoma | Causa | Fix |
|---------|-------|-----|
| Persona no abría diálogo | `window.speechSynthesis` undefined → crash en stopConversation | Guard `if (window.speechSynthesis)` |
| No iniciaba conversación | Faltaba RECORD_AUDIO en AndroidManifest | Añadido |
| Export no funcionaba | `a.download` inútil en WebView | `showExportModal()` con JSON copiable |
| Gradle build error | `proguard-android.txt` deprecated | → `proguard-android-optimize.txt` |

## Notas importantes

- **localStorage keys:** Tienen prefijo `buddy_` (no `zova_`) — compatibilidad de datos
- **Java:** Usar el JBR de Android Studio (v21), NO instalar Java aparte
- **speechSynthesis:** No disponible en Android WebView → Groq TTS funciona en modo texto-only en Android
- **Export:** En Android siempre usa `showExportModal()` (IS_CAPACITOR = true)
- **Xiaomi:** Requiere "Instalar via USB" + "Depuración USB" en Opciones de desarrollador

## Providers y costes

| Provider | Modelo | Coste aprox. |
|----------|--------|-------------|
| OpenAI Realtime | gpt-4o-realtime | ~$0.06/min |
| Gemini Live | gemini-2.0-flash | ~$0.01/min |
| Ultravox | ultravox-70B | ~$0.005/min |
| Groq pipeline | Whisper + Llama 3 | ~$0.001/min |
