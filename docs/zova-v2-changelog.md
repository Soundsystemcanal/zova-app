# Zova — Changelog

---

# v2.1 — 2026-06-10

## Nouvelles fonctionnalités

### Reconnexion transparente avec contexte
Quand OpenAI Realtime ferme la session (rate limit, overflow contexte — code WS 1000), l'app reconnaît la coupure et rouvre une session sans interruption perceptible. Variable `isReconnecting` : les 12 derniers échanges (`recentTranscriptContext`) sont injectés dans le prompt système de la nouvelle session. La persona ne se réintroduit pas et fait référence à la conversation en cours.

### Chapitrage automatique des sessions longues
Après `stopConversation()`, si la transcription dépasse `MIN_LINES_FOR_CHAPTERS = 40` lignes (~20 min), un LLM (Groq) analyse la session et génère des chapitres thématiques avec titres + résumés. Stockés dans `buddy_chapters_{personaId}`. Consultables via le bouton 📑 dans le header de la persona. Inclus dans l'export de transcription comme table des matières.

### Zova connaît l'application
Le prompt de la persona Zova inclut désormais une section technique (~500 tokens) couvrant : providers et coûts, personas et mémoire, export/import, PIN, widget, budget, FAQ. Migration automatique au démarrage si la version installée ne contient pas cette section.

### Transcript ordonné
Les messages utilisateur apparaissent dans l'ordre chronologique correct. À l'événement `speech_started`, un placeholder "..." est créé immédiatement. Il est rempli à `transcription.completed` au lieu d'insérer un nouveau message.

## Corrections

| Bug | Cause | Fix |
|---|---|---|
| `unknown parameter: session max_response_output_tokens` | Paramètre non supporté par l'API Realtime | Supprimé de la config session |

---

# v2.0 — 2026-06-09

## Vue d'ensemble

Zova v2.0 introduit six grandes améliorations par rapport à v1.1 : un système d'export/import fiable sur Android, une mémoire évolutive à deux couches, une mémoire et un profil adaptatif **par persona**, un export de transcription nettoyé par IA, une interface trilingue complète, et un persona Zova dédié à apprendre à connaître l'utilisateur.

---

## 1. Export / Import fiable (Android 11+)

### Problème résolu
Sur Android 11+, le dossier privé de l'app est inaccessible via le sélecteur de fichiers natif (scoped storage). L'export par clipboard était tronqué à 20 000 caractères.

### Nouveau système d'export

**Bouton "Exporter"** → action sheet :
- **Partager** — `Directory.CACHE` + share sheet Android natif (Drive, WhatsApp, email…)
- **Enregistrer dans Zova** — `Directory.EXTERNAL` (dossier privé, récupérable à l'import)

**Option clés API** — désactivée par défaut, inclut OpenAI/Gemini/Ultravox/Groq si activée.

### Nouveau système d'import

**Bouton "Importer"** → action sheet :
- **Sauvegardes Zova** — lit directement `Directory.EXTERNAL`, aucun sélecteur Android
- **Autre source** — sélecteur natif Android (Drive, Téléchargements…)

### Contenu du backup v2
```json
{
  "version": 2,
  "personas": [...],
  "memories": [...],
  "personaMemories": { "id": [...] },
  "personaProfiles": { "id": { "summary": "...", "facts": [...], ... } },
  "userProfile": { "name": "...", "facts": [...] },
  "userInfo": "...",
  "stats": {},
  "apiKeys": { "openai": "...", ... }
}
```

---

## 2. Mémoire évolutive — Architecture 2 couches

### Couche 1 — Mémoire épisodique
- Clé : `buddy_memories` (global) + `buddy_pmem_{personaId}` (par persona)
- Résumés post-session générés par LLM (Groq préféré, fallback OpenAI/Gemini)
- Maximum 10 entrées global, 5 par persona

### Couche 2 — Profil utilisateur cumulatif
- Clé : `buddy_userProfile` (global)
- Document JSON unique mis à jour après chaque session
- Structure : name, languages, topics, style, facts[], goals[], lastUpdated

---

## 3. Mémoire et profil adaptatif par persona (v2.0)

### Mémoire par persona (`buddy_pmem_{id}`)
Chaque persona accumule ses propres résumés de sessions, séparément du pool global. `buildFullInstructions()` utilise en priorité les mémoires de la persona active.

**Accroche de reprise** : si des mémoires per-persona existent, une instruction est injectée dans le système prompt pour que la persona ouvre naturellement la conversation avec une référence à la dernière session.

### Profil adaptatif par persona (`buddy_pprofile_{id}`)
Chaque persona construit son propre profil de l'utilisateur, adapté à son domaine :
- Coach fitness → niveau, objectifs physiques, contraintes
- Assistant code → stack, projets, expérience
- Tuteur langue → niveau, difficultés, objectifs

Structure garantie :
```json
{
  "lastUpdated": "2026-06-09",
  "summary": "...",
  "facts": ["...", "..."],
  "goals": ["..."],
  "preferences": "..."
}
```

**UI Config** : titre dynamique "Profil [NomPersona]", compteur "N infos · màj YYYY-MM-DD", boutons voir/effacer opèrent sur le profil persona actif. Lien discret "Voir / effacer le profil général" pour accéder au profil global.

---

## 4. Export transcription nettoyé par IA

Après chaque conversation, bouton "Exporter" dans l'onglet Transcription :
- **Brut** — partage le texte tel quel
- **Nettoyer + partager** — Groq corrige les erreurs STT, ajoute la ponctuation, supprime les hésitations, conserve le format "Nom : texte", répond dans la même langue que la transcription

---

## 5. Interface trilingue FR/EN/ES

Toutes les chaînes de l'app traduites : Config, modaux, PIN, dialogs, alertes, boutons. Détection automatique via `navigator.language`. Sélecteur manuel dans Config.

---

## 6. Persona Zova "Profile Builder"

| | v1 | v2 |
|---|---|---|
| **Rôle** | Hôtesse d'onboarding | Assistante personnelle évolutive |
| **Mission** | Expliquer l'app | Apprendre à connaître l'utilisateur |
| **Mémoire** | Aucune | Mémoire + profil adaptés |

Migration automatique : si l'ancienne persona Zova est détectée au premier lancement, elle est remplacée silencieusement.

---

## 7. Autres améliorations

| Amélioration | Description |
|---|---|
| Écran premier lancement | Choix entre restore backup ou config API manuelle |
| WakeLock | Écran allumé pendant toute la conversation |
| Reconnexion auto | 3 tentatives si coupure WebSocket |
| PIN 4 chiffres | Verrouillage de l'app via Android Keystore |
| Touch sensitivity | Délai 300ms supprimé, min-height 44px |
| Transcript robuste | Fix capture manquante OpenAI Realtime + Gemini Live |

---

## Corrections de bugs

| Bug | Cause | Fix |
|---|---|---|
| Export tronqué 20k chars | `clipboard.writeText()` limite Android | `Filesystem.writeFile()` + `Share.share()` |
| Import introuvable | `Directory.EXTERNAL` inaccessible scoped storage | `showZovaFiles()` lit directement |
| HTML brut dans les alertes | `customAlert()` utilisait `textContent` | → `innerHTML` |
| Filtre import cassé | `zova_backup` vs `zova-backup` | Corrigé |
| Transcript IA manquant (OpenAI) | Pas d'event `audio_transcript.delta` sur courtes réponses | Flag `hadAiTranscriptThisTurn` + fallback `response.done` |
| Transcript IA manquant (Gemini) | Packets tardifs après `turnComplete` | `lastGeminiAiMsg` ref 2.5s |

---

## Clés localStorage

| Clé | Contenu |
|---|---|
| `buddy_memories` | Mémoires épisodiques globales (max 10) |
| `buddy_pmem_{id}` | Mémoires épisodiques par persona (max 5) |
| `buddy_userProfile` | Profil utilisateur global cumulatif |
| `buddy_pprofile_{id}` | Profil adaptatif par persona |
| `buddy_personas` | Liste des personas |
| `buddy_activeId` | ID de la persona active |
| `buddy_userInfo` | Infos manuelles sur l'utilisateur |
| `buddy_stats` | Statistiques d'usage |
| `buddy_theme` | Thème (dark/light) |
| `buddy_lang` | Langue (fr/en/es) |
