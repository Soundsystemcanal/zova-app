# Zova v2-beta — Changelog

> Branche : `v2-beta` · Basé sur v1.1 · Dernière mise à jour : 2026-06-09

---

## Vue d'ensemble

La v2-beta introduit trois grandes améliorations : un système d'export/import fiable sur Android, une mémoire évolutive à deux couches, et un persona Zova dédié à apprendre à connaître l'utilisateur.

---

## 1. Export / Import fiable (Android 11+)

### Problème résolu
Sur Android 11+, le dossier privé de l'app (`Android/data/com.zova.voiceapp/files/`) est inaccessible via le sélecteur de fichiers natif (scoped storage). L'export par copie clipboard était tronqué à 20 000 caractères.

### Nouveau système d'export

**Bouton "Exporter"** → action sheet avec deux options :
- **Partager** — écrit dans `Directory.CACHE` puis ouvre le share sheet Android natif (Drive, WhatsApp, email, etc.)
- **Enregistrer dans Zova** — écrit dans `Directory.EXTERNAL` (dossier privé de l'app), récupérable uniquement via l'option "Sauvegardes Zova" à l'import

**Option clés API** — avant l'export, l'app demande si les clés API doivent être incluses dans le fichier :
- Désactivée par défaut (les clés sont sensibles)
- Si activée : les 4 clés (OpenAI, Gemini, Ultravox, Groq) sont incluses dans le JSON
- À l'import : dialogue séparé pour confirmer la restauration des clés

### Nouveau système d'import

**Bouton "Importer"** → action sheet avec deux options :
- **Sauvegardes Zova** — l'app lit directement `Directory.EXTERNAL` et liste les fichiers `.json` disponibles. Aucun sélecteur Android nécessaire → contourne complètement la restriction scoped storage.
- **Autre source** — ouvre le sélecteur natif Android (pour les fichiers depuis Drive, Téléchargements, etc.)

### Fonctions ajoutées

| Fonction | Description |
|---|---|
| `exportJsonFile(content, filename)` | Export universel — action sheet Partager/Enregistrer |
| `showImportSheet(inputId, label)` | Import universel — Sauvegardes Zova/Autre source |
| `showZovaFiles(filter, onPick)` | Liste les fichiers JSON du dossier privé |
| `processBackupJson(jsonStr)` | Applique un backup depuis une string JSON |
| `processPersonaJson(jsonStr)` | Importe un persona depuis une string JSON |

### Contenu du backup
```json
{
  "version": 1,
  "exportDate": "...",
  "theme": "dark",
  "personas": [...],
  "activePersonaId": "...",
  "userInfo": "...",
  "stats": {...},
  "memories": [...],
  "userProfile": {...},
  "apiKeys": { "openai": "...", "gemini": "...", "ultravox": "...", "groq": "..." }
}
```
*(apiKeys uniquement si l'utilisateur le demande à l'export)*

---

## 2. Mémoire évolutive — Architecture 2 couches

### Problème résolu
La v1 avait uniquement 10 résumés épisodiques sans synthèse — les anciennes conversations disparaissaient et l'app ne construisait pas de connaissance durable de l'utilisateur.

### Couche 1 — Mémoire épisodique (améliorée, déjà en place)

- Clé : `buddy_memories`
- Résumés post-session générés par LLM (Groq préféré, fallback OpenAI/Gemini)
- Maximum 10 entrées, les plus récentes en priorité
- Injectés dans le prompt : 4 résumés par conversation

### Couche 2 — Profil utilisateur cumulatif (nouveau)

- Clé : `buddy_userProfile`
- Document JSON unique mis à jour après chaque session
- Structure :
  ```json
  {
    "lastUpdated": "2026-06-09",
    "name": "Xavier",
    "languages": ["FR", "ES"],
    "topics": ["développement Android", "musique"],
    "style": "direct, technique, préfère les réponses courtes",
    "facts": ["Travaille sur Zova", "Utilise Xiaomi 14T"],
    "goals": ["lancer Zova sur GitHub"]
  }
  ```
- Maximum 5 faits, 4 sujets, style en 1 phrase — le LLM consolide sans accumuler indéfiniment

### Injection dans le prompt système

`buildFullInstructions(persona)` injecte dans l'ordre :
1. Le prompt du persona
2. Les résumés épisodiques récents (4 max)
3. **Le profil utilisateur** (nouveau)
4. Les infos utilisateur manuelles (`userInfo`)
5. Les infos spécifiques au persona

### UI Config — nouvelle section "Profil utilisateur"

- Compteur : "3 faits · 2 sujets · màj 2026-06-09"
- **🪪 Voir le profil** — affiche le profil complet formaté
- **🗑️ Effacer le profil** — repart de zéro

### Fonctions ajoutées

| Fonction | Description |
|---|---|
| `getUserProfile()` | Lit `buddy_userProfile` depuis localStorage |
| `setUserProfile(profile)` | Sauvegarde le profil |
| `updateUserProfile(transcript)` | Met à jour le profil via LLM post-session |
| `profileHasContent(p)` | Vérifie si le profil a du contenu |
| `updateProfileCount()` | Met à jour l'affichage du compteur |

---

## 3. Persona Zova — Profile Builder

### Changement de rôle

| | v1 | v2-beta |
|---|---|---|
| **Rôle** | Hôtesse d'onboarding | Assistante personnelle — apprend à connaître l'utilisateur |
| **Mission** | Expliquer l'app | Enrichir le profil progressivement |
| **Questions** | FAQ sur l'app | Questions ciblées sur les infos manquantes du profil |
| **Mémoire** | Aucune | Lit et met à jour le profil à chaque session |

### Comportement

- **Ouverture** : salutation + 1 question ciblée sur une info manquante dans le profil
- **Progression** : identité → contexte de vie → style → objectifs → centres d'intérêt → approfondissement
- **Règle clé** : maximum 1-2 questions par conversation, jamais une liste
- **Priorité** : si l'utilisateur pose une vraie question → réponse complète d'abord, puis profil-building
- **Continuité** : "Tu m'avais dit que X... comment ça avance ?"

### Migration automatique

Au premier lancement, si la persona Zova (id `zova-default-v1`) est encore l'ancienne version (hôtesse d'onboarding), elle est remplacée silencieusement par le nouveau prompt.

---

## 4. Corrections de bugs

| Bug | Cause | Fix |
|---|---|---|
| Export tronqué à 20 000 chars | `clipboard.writeText()` limite Android | `Filesystem.writeFile()` + `Share.share()` |
| Fichier introuvable à l'import | `Directory.EXTERNAL` inaccessible au sélecteur Android 11+ | `showZovaFiles()` lit directement le dossier |
| Emojis/HTML affichés en brut dans les alertes | `customAlert()` utilisait `textContent` | Changé en `innerHTML` |
| Filtre import ne trouvait aucun fichier | Filtre `zova_backup` (underscore) vs nom `zova-backup` (tiret) | Corrigé en `zova-backup` / `zova-persona` |

---

## 5. Dépendances ajoutées

```json
"@capacitor/filesystem": "^8.1.2",
"@capacitor/share": "^8.0.1"
```

---

## Prochaines étapes (v2 release)

- [ ] Tests complets sur Xiaomi 14T (export → import complet avec clés API)
- [ ] Valider le profil utilisateur après 3-4 sessions Zova
- [ ] Build APK release signé pour v2.0
- [ ] Mettre à jour la landing page vers v2.0
- [ ] GitHub Release v2.0.0
