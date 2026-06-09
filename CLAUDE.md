# Zova — Proyecto Android

> App Android de asistente de voz IA. Funcional en Xiaomi 14T. Leer `buddy/` para el código.

## Resumen rápido

**Zova** es una app Android de voz IA con personas configurables. Single-file HTML + Capacitor. Sin backend. Usa OpenAI Realtime API / Ultravox / Groq. API keys en Android Keystore.

- **App:** `buddy/www/index.html` (~7500 líneas)  
- **Android:** `buddy/android/`  
- **Icono fuente:** `buddy/assets/icon.svg` (micrófono Dark Cosmos) → compilado a `icon.png`
- **ID:** `com.zova.voiceapp`

## Ramas Git

| Rama | Estado | Descripción |
|------|--------|-------------|
| `main` | ✅ Estable v1.1 | Versión pública, APK release firmado |
| `v2-beta` | 🚧 Activa | Nuevas features (export/import, memoria, perfil) |

## Estado (2026-06-09)

### v1.1 (main)
✅ App funcional en Xiaomi 14T (Android 16 "Baklava")  
✅ Tasks 1–10 completos  
✅ WakeLock + Reconnexión auto + PIN 4 dígitos  
✅ Export/backup funcional (modal JSON copiable)  
✅ Icono Dark Cosmos v3 (mic violeta→rosa, ondas, ZOVA, bg #0a0a1f)  
✅ FAQ trilingue (6 Q&A FR/EN/ES) — modal accordéon via bouton `?` dans Config  
✅ Persona "Zova" pré-chargée (guide de bienvenue, voix shimmer)  
✅ Touch sensitivity — 300ms delay éliminé, min-height 44px  
⏳ Task 11 — APK release firmado  
⏳ Task 12 — GitHub Releases + QR  

### v2-beta (v2-beta)
✅ Export/Import fiable — contorna scoped storage Android 11+  
✅ Backup complet (personas + mémoire + profil + clés API optionnelles)  
✅ Mémoire évolutive 2 couches (épisodique + profil utilisateur cumulatif)  
✅ Persona Zova "Profile Builder" — apprend à connaître l'utilisateur  
✅ customAlert() supporte HTML (innerHTML)  

## Comandos esenciales

```powershell
# Variables de entorno (necesarias en cada sesión PowerShell)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\xavie\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools"

# Sincronizar HTML → Android (después de cada cambio en index.html)
cd C:\Users\xavie\OneDrive\Documentos\Cerrador\buddy
npx cap sync android

# Build + instalar APK debug en dispositivo
cd android
.\gradlew assembleDebug
adb install app\build\outputs\apk\debug\app-debug.apk

# Verificar dispositivo conectado
adb devices

# Regenerar todos los iconos (Dark Cosmos bg)
node -e "require('sharp')('assets/icon.svg').resize(1024,1024).png().toFile('assets/icon.png').then(()=>console.log('OK'))"
npx @capacitor/assets generate --iconBackgroundColor '#0a0a1f' --iconBackgroundColorDark '#0a0a1f' --splashBackgroundColor '#0a0a1f' --splashBackgroundColorDark '#0a0a1f'
```

## Arquitectura

```
index.html (single-file app)
├── CSS: Dark Cosmos theme (violet #8b5cf6, pink #ec4899, bg #0a0a1f)
│       Touch sensitivity: touch-action:manipulation, min-height 44px, tap feedback
├── HTML: 4 screens (Home, Personas, Stats, Config) + modales
│       Modales: apiKey, persona, myInfo, stats, insights, backup, FAQ
└── JS:
    ├── i18n: ES/EN/FR (auto-detect + selector)
    ├── FAQ_CONTENT: objet trilingue 6 Q&A, openFaqModal() avec accordéon
    ├── DEFAULT_PERSONA_ZOVA: "Profile Builder" — apprend à connaître l'user (id: zova-default-v1)
    ├── SecureStorage: Android Keystore via capacitor-secure-storage-plugin
    ├── Providers: OpenAI Realtime, Gemini Live, Ultravox, Groq pipeline
    ├── WakeLock: screen-on durante conversación
    ├── Reconnect: auto-retry 3x si WS cierra inesperadamente
    ├── PIN lock: 4 dígitos, stored en Keystore
    ├── Mémoire épisodique: résumés post-session (buddy_memories, max 10)
    ├── Profil utilisateur: JSON cumulatif mis à jour post-session (buddy_userProfile)
    └── Export/Import: exportJsonFile() + showImportSheet() + showZovaFiles()
```

## Export/Import (v2-beta)

### Export
- `exportJsonFile(content, filename)` → action sheet :
  - "Partager" → `Directory.CACHE` + `Share.share()` (share sheet Android)
  - "Enregistrer dans Zova" → `Directory.EXTERNAL` (dossier privé app)
- Backup inclut : personas, thème, stats, userInfo, mémoires, profil, (clés API optionnel)

### Import
- `showImportSheet(inputId, label)` → action sheet :
  - "Sauvegardes Zova" → `showZovaFiles()` lit `Directory.EXTERNAL` directement
  - "Autre source" → sélecteur de fichiers natif Android
- `processBackupJson(jsonStr)` + `processPersonaJson(jsonStr)` : import depuis string

## Mémoire (v2-beta)

| Couche | Clé | Description |
|--------|-----|-------------|
| Épisodique | `buddy_memories` | Résumés de sessions (max 10), injectés dans prompt |
| Profil cumulatif | `buddy_userProfile` | JSON évolutif (nom, style, sujets, faits, objectifs) |

- `generateMemory(persona, transcript)` — résumé épisodique post-session (Groq)
- `updateUserProfile(transcript)` — mise à jour profil post-session (Groq)
- `buildFullInstructions(persona)` — injecte les deux dans le système prompt
- UI Config : "Mémoire épisodique" + "Profil utilisateur" (voir/effacer)

## Bugs Android ya resueltos

| Síntoma | Causa | Fix |
|---------|-------|-----|
| Persona no abría diálogo | `window.speechSynthesis` undefined → crash | Guard `if (window.speechSynthesis)` |
| No iniciaba conversación | Faltaba RECORD_AUDIO en AndroidManifest | Añadido |
| Export no funcionaba | `a.download` inútil en WebView | `showExportModal()` puis Filesystem+Share |
| Gradle build error | `proguard-android.txt` deprecated | → `proguard-android-optimize.txt` |
| Template literal non fermé | backtick dans prompt crashait le parser JS | Retiré le backslash |
| Export tronqué à 20 000 chars | clipboard.writeText() limite Android | Filesystem.writeFile() + Share |
| Fichier export introuvable à l'import | Directory.EXTERNAL inaccessible au sélecteur (Android 11+) | showZovaFiles() lit directement le dossier |
| Emojis/HTML affichés en brut dans alerts | customAlert utilisait textContent | → innerHTML |

## Notas importantes

- **localStorage keys:** Tienen prefijo `buddy_` (no `zova_`) — compatibilidad de datos
- **Java:** Usar el JBR de Android Studio (v21), NO instalar Java aparte
- **speechSynthesis:** No disponible en Android WebView → Groq TTS funciona en modo texto-only
- **Export v2:** `exportJsonFile()` → action sheet Partager/Enregistrer dans Zova
- **Import v2:** `showImportSheet()` → Sauvegardes Zova (lit EXTERNAL) ou sélecteur
- **Xiaomi:** Requiere "Instalar via USB" + "Depuración USB" en Opciones de desarrollador
- **Keystore:** `buddy/android/app/keystore.properties` + `buddy/zova-release-keystore.jks` — JAMAIS committer

## Providers y costes

| Provider | Modelo | Coste aprox. |
|----------|--------|-------------|
| OpenAI Realtime | gpt-4o-realtime | ~$0.06/min |
| Gemini Live | gemini-2.0-flash | ~$0.01/min |
| Ultravox | ultravox-70B | ~$0.005/min |
| Groq pipeline | Whisper + Llama 3 | ~$0.001/min |
