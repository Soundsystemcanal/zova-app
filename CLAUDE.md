# Zova — Proyecto Android

> App Android de asistente de voz IA. Funcional en Xiaomi 14T. Leer `buddy/` para el código.

## Resumen rápido

**Zova** es una app Android de voz IA con personas configurables. Single-file HTML + Capacitor. Sin backend. Usa OpenAI Realtime API / Ultravox / Groq. API keys en Android Keystore.

- **App:** `buddy/www/index.html` (~9100 líneas)  
- **Android:** `buddy/android/`  
- **Icono fuente:** `buddy/assets/icon.svg` (micrófono Dark Cosmos) → compilado a `icon.png`
- **ID:** `com.zova.voiceapp`

## Ramas Git

| Rama | Estado | Descripción |
|------|--------|-------------|
| `main` | 🚧 En desarrollo v3 | Nouvelles features widget + mémoire proactive |
| `v2-beta` | 🗂️ Archivée | Export/import, mémoire, profil |

## Estado (2026-06-11)

### v3.3 — 🇨🇳 Providers DeepSeek/Qwen + 🔒 Privacidad (main, non publié) — testé sur Xiaomi 14T (CDP + navegador)
**Bloque 4 — DeepSeek + Qwen (batch/texto, NO voz tiempo real)**
✅ Claves en Keystore — `get/setDeepseekApiKey`, `get/setQwenApiKey` (`SecureStore`, prefijos `buddy_deepseekApiKey`/`buddy_qwenApiKey`) + inputs en el modal API (`#deepseekApiKeyInput`/`#qwenApiKeyInput`)
✅ APIs compatibles OpenAI — `COMPAT_PROVIDERS` registry + helper DRY `postOpenAIFormat()` (fetch `/chat/completions`). DeepSeek `api.deepseek.com/v1` (`deepseek-chat`/`deepseek-reasoner`), Qwen `dashscope-intl.aliyuncs.com/compatible-mode/v1` (`qwen-2.5-72b-instruct`)
✅ `chatCompletion({systemPrompt,userPrompt,temperature,maxTokens,preferReasoning})` — cadena de fallback: DeepSeek-R1 (si `preferReasoning`) → OpenAI → Gemini → DeepSeek-chat → Qwen ; `hasAnyApiKey()` reconoce configs solo-DeepSeek/Qwen
✅ Perfil + consolidación de memoria ruteados a DeepSeek-R1 (`preferReasoning:true` en `updateUserProfile`/`consolidatePersonaMemories`). Plan : `docs/superpowers/plans/2026-06-11-v3.3-deepseek-qwen.md`

**Bloque 5 / Fase B — Privacidad**
✅ Contraste de Config — clase `.config-section-title` (`#f5f3ff` + text-shadow), reemplaza el inline `--text-muted` casi invisible en los 8 títulos de sección
✅ Export perfil `.md` — `profileToMarkdown()` + `exportUserProfileMd()` (botón en sección Profil) vía `exportJsonFile()` (Filesystem+Share)
✅ Borrado total — sección 🔒 Privacidad + `wipeAllAiData()` : barre las 7 capas de memoria (+`buddy_chapters_*`) de TODAS las personas, **preserva** `buddy_personas` + claves API (Keystore). Doble confirmación + refresco de contadores. Plan : `docs/superpowers/plans/2026-06-11-v3.3-faseB-privacidad.md`
✅ Trilingue ES/EN/FR (`config_section_privacy`, `config_wipe_all`, `config_export_profile_md`, `wipe_all_confirm/done`, `config_privacy_hint`)

**Fix — Botón Guardar fiable (móvil)**
✅ `.btn-save` ya no pierde el primer toque — `preventDefault` global en pointerdown/mousedown mantiene el foco del input (evita el reflow del teclado Android que "comía" el tap) ; el click sí se dispara. `showSavedToast()` (feedback ✅) + textarea de "Mis informaciones" 250→140px (botón sobre el teclado). Aplica a TODOS los botones Guardar (persona, API, budget…)

### v3.2 — 🪄 Création de persona guidée (main, non publié) — testé sur Xiaomi 14T (CDP + génération réelle)
✅ Feuille de choix — « + Nuevo » ouvre `openPersonaChoiceSheet()` (`.dialog-overlay`) : Création guidée ✨ ou Configuration manuelle ⚙️ (mode manuel inchangé)
✅ Wizard 5 étapes — `openPersonaWizard()` : sujet (texte + puces de suggestion) → ton → tutoie/vouvoie + qui commence → nom (ou « l'IA choisit ») → style de réponses ; barre de progression, retour Android recule d'une étape (garde dans le handler `backButton`)
✅ Mapping déterministe — `WIZARD_VOICE_MAP` (ton→voix par fournisseur, repli via `updatePersonaVoiceList`), style→`creativity`, qui commence→`greeting`, réactivité=balanced ; aucune valeur structurée laissée à l'IA
✅ Génération IA — `generatePersonaFromWizard()` : 1 seul appel `chatCompletion` → JSON `{name,description,prompt}`, parsing robuste `wizParseJson()` (JSON.parse → regex `{…}` → repli dégradé), verrou `wizGenerating` anti-runs concurrents (reset à la fermeture)
✅ Aperçu éditable — `applyWizardResult()` ouvre le modal manuel pré-rempli (ordre : `openPersonaModal()` PUIS écrasement des champs PUIS `updatePersonaVoiceList`) + bandeau `#wizardBanner` ; gestion d'erreur Réessayer / Continuer en manuel
✅ Trilingue ES/EN/FR (clés `wiz_*`, `tone_*`, `crea_*`). Spec+plan : `docs/superpowers/specs|plans/2026-06-10-persona-wizard*`

### v3.1 — 🔐 Sécurité renforcée (main) — testé sur Xiaomi 14T (CDP)
✅ Biométrie native — `@aparajita/capacitor-biometric-auth` (BiometricPrompt Android), remplace l'ancien `navigator.credentials` factice ; auto-prompt à l'ouverture, bouton 🤙 masqué si pas d'empreinte enrôlée  
✅ Lockout PIN — 5 essais tolérés puis délai exponentiel (30 s → 15 min max), persistant via localStorage (`buddy_pin_fails` / `buddy_pin_lockuntil`), clavier gelé + compte à rebours ; biométrie reste autorisée pendant le verrou  
✅ `allowBackup=false` + `dataExtractionRules` (Android 12+) — empêche l'extraction des données (mémoires, transcripts, profil) via ADB backup / transfert d'appareil  
✅ Confirmation deep link — `zova://import` ne s'importe plus en silence : `confirmPersonaImport()` affiche un aperçu + avertit si le persona embarque un prompt système custom  
✅ Export sélectif — `buildBackupData(includePersonal)` : choix d'inclure ou non souvenirs+profils, indépendamment des clés API  
✅ Backup chiffré — `encryptBackup()`/`decryptBackup()` WebCrypto AES-256-GCM + PBKDF2-SHA256 (250k itér.), enveloppe `{type:'zova-backup-encrypted', salt, iv, ciphertext}`, fichier `*.enc.json` ; `customPrompt()` ajouté pour la saisie mot de passe  

### v3 — ✅ Testé et approuvé (main)
✅ Widget 2×2 — avatar photo, nom persona, dernière session, AUTO_START  
✅ Widget AUTO_START — PIN-aware (MutationObserver sur #pinScreen)  
✅ Follow-ups — engagements user extraits post-session (LLM), affichés dans Config  
✅ Bridge proactif — phrase d'accroche naturelle générée post-session, injectée dans prompt  
✅ Sélection intelligente souvenirs — score pertinence (keyword overlap) + récence  
✅ Commande "souviens-toi que…" — détection en temps réel (14 patterns FR/EN/ES), toast 🧠  
✅ Carte post-session — durée + coût + mémoire + suivis + objectifs (3 lignes async)  
✅ Objectifs long terme — `buddy_goals_{id}`, tracking progression cross-session  
✅ Consolidation mémoire — ≥6 souvenirs → fusion LLM des plus anciens, max 2 récents + 1 condensé  
✅ Insights — coût $ affiché pour toutes sessions (OpenAI, Ultravox, Groq via `statCost()`)  

### v2.1 (tag v2.1 / APK release)
✅ APK release firmado (`buddy/Zova-v2.1.apk`, signé v2 scheme, versionCode 3)  
✅ GitHub Releases + QR (`buddy/assets/qr-download.png` → v2.1 APK direct download)  

### v1.1 (main — état avant v3)
✅ App funcional en Xiaomi 14T (Android 16 "Baklava")  
✅ Tasks 1–10 completos  
✅ WakeLock + Reconnexión auto + PIN 4 dígitos  
✅ Export/backup funcional (modal JSON copiable)  
✅ Icono Dark Cosmos v3 (mic violeta→rosa, ondas, ZOVA, bg #0a0a1f)  
✅ FAQ trilingue (6 Q&A FR/EN/ES) — modal accordéon via bouton `?` dans Config  
✅ Persona "Zova" pré-chargée (guide de bienvenue, voix shimmer)  
✅ Touch sensitivity — 300ms delay éliminé, min-height 44px  
✅ QR offline — lib bundlée `window.ZovaQR`, SVG, payload allégé (sans image, prompt≤1200)  
✅ Partage persona — `exportJsonFile()` (JSON complet) au lieu de `Share.share({url})`  
✅ Avatar persona cliquable → ouvre modal édition (bouton ✎ supprimé)  
✅ Bouton insights visible — couleur accent  
✅ Bouton copie — flag `_copyBtnLocked`, feedback visuel avant `await clipboard`  
✅ Pill LOCAL — discret, inline sous le nom persona (plus fixe/superposé)  
✅ Widget 2×1 — fonctionnel sur MIUI (fix `<View>`→`<TextView>`, fix crash FGS)  
✅ Reconnexion transparente — contexte restauré, pas de re-greeting (`isReconnecting` + `recentTranscriptContext`)  
✅ Transcript ordonné — placeholder créé à `speech_started`, rempli à `transcription.completed`  
✅ Persona Zova v3 — section doc app intégrée dans le prompt (providers, personas, mémoire, export, widget, chapitrage)  
✅ Export transcript — chapitres inclus comme table des matières si disponibles  
✅ Task 11 — APK release firmado (`buddy/Zova-v2.1.apk`, signé v2 scheme, versionCode 3)  
✅ Task 12 — GitHub Releases + QR (`buddy/assets/qr-download.png` → v2.1 APK direct download)  

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

# Debug WebView en vivo (inspeccionar DOM de la app instalada — APK debug)
# 1. $pid = adb shell pidof com.buddy.voiceapp
# 2. adb forward tcp:9222 localabstract:webview_devtools_remote_$pid
# 3. Invoke-WebRequest http://localhost:9222/json  → webSocketDebuggerUrl
# 4. node %TEMP%\zova-cdp\eval.js "<wsUrl>" "<expresión JS>"  (script CDP con paquete ws)

# Regenerar todos los iconos (Dark Cosmos bg)
node -e "require('sharp')('assets/icon.svg').resize(1024,1024).png().toFile('assets/icon.png').then(()=>console.log('OK'))"
npx @capacitor/assets generate --iconBackgroundColor '#0a0a1f' --iconBackgroundColorDark '#0a0a1f' --splashBackgroundColor '#0a0a1f' --splashBackgroundColorDark '#0a0a1f'
```

## Arquitectura

```
index.html (single-file app)
├── CSS: Dark Cosmos theme (violet #8b5cf6, pink #ec4899, bg #0a0a1f)
│       Touch sensitivity: touch-action:manipulation, min-height 44px, tap feedback
│       Animations: toastIn/toastOut (mémoire toast + carte post-session)
├── HTML: 4 screens (Home, Personas, Stats, Config) + modales
│       Modales: apiKey, persona, myInfo, stats, insights, backup, FAQ
│       Config: section Suivis (follow-ups) + section Objectifs par persona
└── JS:
    ├── i18n: ES/EN/FR (auto-detect + selector)
    ├── FAQ_CONTENT: objet trilingue 6 Q&A, openFaqModal() avec accordéon
    ├── DEFAULT_PERSONA_ZOVA: "Profile Builder" — apprend à connaître l'user (id: zova-default-v1)
    ├── SecureStorage: Android Keystore via capacitor-secure-storage-plugin
    ├── Providers: OpenAI Realtime, Gemini Live, Ultravox, Groq pipeline
    ├── WakeLock: screen-on durante conversación
    ├── Reconnect: auto-retry 3x si WS cierra inesperadamente
    ├── PIN lock: 4 dígitos (Keystore) + lockout exponentiel + biométrie native (BiometricAuthNative)
    ├── Backup crypto: encryptBackup()/decryptBackup() — WebCrypto AES-256-GCM + PBKDF2
    ├── customPrompt(): dialogue avec champ saisie (mot de passe)
    ├── Persona wizard: openPersonaChoiceSheet()/openPersonaWizard()/generatePersonaFromWizard() — création guidée 5 étapes (voir État v3.2)
    ├── Mémoire v3 — 7 couches (voir section Mémoire v3)
    ├── checkMemoryCommand(): 14 patterns FR/EN/ES → saveMemoryFact() → toast 🧠
    ├── showPostSessionSummary(): carte durée+coût+3 lignes async dans transcript
    └── Export/Import: exportJsonFile() + showImportSheet() + showZovaFiles() (backup chiffré détecté à l'import)
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

## Mémoire (v3)

| Couche | Clé localStorage | Description |
|--------|-----------------|-------------|
| Épisodique globale | `buddy_memories` | Résumés de sessions (max 10), sélection intelligente |
| Épisodique par persona | `buddy_pmem_{id}` | Résumés propres à chaque persona (max 10) |
| Profil utilisateur global | `buddy_userProfile` | JSON cumulatif commun à toutes personas |
| Profil utilisateur par persona | `buddy_pprofile_{id}` | Profil adapté au domaine de la persona |
| Follow-ups | `buddy_followups_{id}` | Engagements user détectés post-session (max 5) |
| Bridge proactif | `buddy_bridge_{id}` | Phrase d'accroche naturelle générée post-session |
| Objectifs long terme | `buddy_goals_{id}` | Objectifs + progression cross-session (max 10) |

### Fonctions post-session (toutes async, déclenchées dans `stopConversation()`)
- `generateMemory(persona, transcript)` — résumé épisodique
- `updateUserProfile(transcript)` — profil global
- `updatePersonaProfile(persona, transcript)` — profil par persona
- `generateChapters(persona, transcript)` — chapitrage si >20min
- `extractFollowUpsAndBridge(persona, transcript)` — 1 appel LLM → followups + bridge
- `extractAndUpdateGoals(persona, transcript)` — objectifs + progression
- `consolidatePersonaMemories(persona)` — fusion si ≥6 souvenirs

### Sélection mémoire intelligente
- `selectRelevantMemories(memories, persona, n)` — score = 60% pertinence (keyword overlap) + 40% récence
- Toujours garde le souvenir le plus récent, retrie chronologiquement

### Commande temps réel
- `checkMemoryCommand(text, persona)` — 14 patterns ("souviens-toi que", "remember that", "recuerda que"…)
- → `saveMemoryFact(fact, persona)` → `showMemoryToast(fact)` — toast 🧠 2.8s

### buildFullInstructions(persona) — ordre d'injection
1. Bridge proactif (si dispo) ou accroche statique
2. Follow-ups — "Engagements de l'utilisateur"
3. Objectifs actifs avec % progression
4. Mémoires pertinentes sélectionnées (max `MEMORIES_IN_PROMPT=4`)
5. Profil par persona + profil global
6. `recentTranscriptContext` (si reconnexion)

### UI Config
- Section "Suivis" — compteur + voir/effacer follow-ups
- Section "Objectifs" — compteur + voir/effacer objectifs
- Section "Profil [nom]" — voir/effacer profil par persona
- Lien "Voir le profil général" — profil global commun

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
| QR "indisponible" | api.qrserver.com bloqué hors réseau | Lib `qrcode` bundlée (24KB, `window.ZovaQR`), SVG via `toString()` — 100% offline |
| "amount of data too big" pour QR | Champ `image` (data URL = milliers de bytes) dépassait capacité QR v40 | Exclure `image:null`, tronquer `prompt` à 1200 chars, `errorCorrectionLevel:'L'` |
| Widget non visible dans liste | `android:previewLayout` manquant (requis Android 12+) | Ajouté `previewLayout="@layout/widget_zova"` dans `widget_info.xml` |
| Widget crash à l'ajout ("No se ha podido añadir") | `<View>` plain non supporté par RemoteViews → inflation silencieuse échouée | Remplacé `<View>` séparateur par `<TextView>` vide dans `widget_zova.xml` |
| App crash au démarrage écran noir | `ZovaForegroundService.startForeground(type=microphone)` lance SecurityException sur Android 14+ si RECORD_AUDIO pas encore accordé au runtime | try/catch autour de `startForeground()` → `stopSelf()` si permission absente |
| APK debug refusé à l'install | Signature release déjà installée ≠ signature debug | `adb uninstall` puis `adb install` (données perdues — reconfigurer l'app) |
| Option "Supprimer" invisible dans menu "..." | Le menu (z-index:10 dans la carte) passait DERRIÈRE les cartes suivantes de la grille | `.welcome-card:has(.welcome-card-menu.open) { z-index: 50 }` |
| Bouton "..." invisible sur tactile | `opacity:0` + visible uniquement au `:hover` (inexistant sur mobile) | `@media (hover: none) { opacity: 1 }` |
| Dialog OK hors écran (contenu long) | `.dialog-box` sans max-height | `max-height:80vh` + `.dialog-message` scrollable |
| Bouton retour Android sans effet | Aucun listener `backButton` Capacitor | Listener : ferme dialogs → modales → retour Home → minimize |
| Duplication empile "(copie) (copie)" | Double-tap + copie devient active puis re-dupliquée | Verrou 1s + nommage "X (copie N)" (suffixes nettoyés) |
| Conversation s'arrête après quelques échanges (OpenAI) | API ferme session (rate limit / context overflow) avec code 1000 → reconnexion sans mémoire + re-greeting | `isReconnecting` flag + `recentTranscriptContext` (12 derniers tours) injecté dans `buildFullInstructions()` au reconnect ; `session.updated` ne re-greet pas si `isReconnecting` |
| Transcript désordonné (user après IA) | `transcription.completed` arrive après que l'IA a déjà streamé → insert hors ordre | Placeholder `Moi: ...` créé à `speech_started` (avant réponse IA), rempli à `transcription.completed` |
| Header carte PSS invisible | `pss-header` utilisait `--text-muted` (#4a4060) quasi invisible sur fond sombre | → `--text-secondary` (#9a8cb0) |
| Carte PSS — ligne 🎯 reste en "Analyse..." 16s | `extractAndUpdateGoals` faisait `return` sans appeler `updatePssLine` si session trop courte | Appel `updatePssLine('pssGoals','🎯 —')` dans chaque early-return |
| Insights — coût $0 pour OpenAI/Ultravox | `openPersonaInsightsModal()` utilisait `s.costDollars \|\| 0` au lieu de `statCost(s)` | → `statCost(s)` (calcule depuis tokens si `costDollars` absent) |

## Notas importantes

- **localStorage keys:** Tienen prefijo `buddy_` (no `zova_`) — compatibilidad de datos
- **Java:** Usar el JBR de Android Studio (v21), NO instalar Java aparte
- **speechSynthesis:** No disponible en Android WebView → Groq TTS funciona en modo texto-only
- **Export v2:** `exportJsonFile()` → action sheet Partager/Enregistrer dans Zova
- **Import v2:** `showImportSheet()` → Sauvegardes Zova (lit EXTERNAL) ou sélecteur
- **Xiaomi:** Requiere "Instalar via USB" + "Depuración USB" en Opciones de desarrollador
- **Keystore:** `buddy/android/app/keystore.properties` + `buddy/zova-release-keystore.jks` — JAMAIS committer
- **RemoteViews (widget):** Soporta FrameLayout, LinearLayout, RelativeLayout, TextView, Button, ImageView, ProgressBar — NO `<View>` plain (inflation silenciosa falla en MIUI)
- **FGS + RECORD_AUDIO (Android 14+):** `startForeground(type=microphone)` lanza SecurityException si el permiso no está concedido en runtime. El try/catch en `ZovaForegroundService.onStartCommand()` evita el crash en fresh install
- **appId mismatch:** `capacitor.config.json` dice `com.zova.voiceapp` pero el package nativo es `com.buddy.voiceapp` — no cambiar, es histórico y funciona
- **Debug vs Release APK:** Signatures diferentes → hay que `adb uninstall` antes de instalar debug si hay release instalado (se pierden los datos de la app)
- **Biometría (v3.1):** Plugin `@aparajita/capacitor-biometric-auth`. El JS nativo se registra como `BiometricAuthNative` (no `BiometricAuth`) → acceder vía `window.Capacitor.Plugins.BiometricAuthNative.internalAuthenticate()`/`.checkBiometry()` (sin bundler, mismo patrón que `SecureStoragePlugin`). Requiere `USE_BIOMETRIC` en el manifest
- **allowBackup (v3.1):** `android:allowBackup="false"` + `@xml/data_extraction_rules` (excluye todo de cloud-backup y device-transfer, Android 12+)
- **Backup chiffré (v3.1):** WebCrypto AES-256-GCM + PBKDF2-SHA256 (250k iter). Sin contraseña el `.enc.json` es irrecuperable. Detección a l'import por `data.type === 'zova-backup-encrypted'`
- **Verificación en dispositivo:** WebView debug vía CDP (ver Comandos). Confirmar que las funciones nuevas existen (`typeof fn === 'function'`) prueba que el script parseó sin error de sintaxis

## Providers y costes

| Provider | Modelo | Coste aprox. |
|----------|--------|-------------|
| OpenAI Realtime | gpt-4o-realtime | ~$0.06/min |
| Gemini Live | gemini-2.0-flash | ~$0.01/min |
| Ultravox | ultravox-70B | ~$0.005/min |
| Groq pipeline | Whisper + Llama 3 | ~$0.001/min |
