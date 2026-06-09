# Profil Adaptatif par Persona — Design Spec

> Zova v2-beta · 2026-06-09

---

## Contexte

Zova dispose d'un profil utilisateur global (`buddy_userProfile`) mis à jour après chaque session. Ce profil capture des informations transversales (nom, langue, style, faits de vie). L'objectif de cette feature est que chaque persona construise **son propre profil de l'utilisateur**, adapté à son domaine spécifique, indépendamment des autres personas.

---

## Approche retenue : Couche séparée complète (Option A)

Clé localStorage dédiée par persona : `buddy_pprofile_{personaId}` — symétrique avec `buddy_pmem_{personaId}` (mémoires per-persona).

**Raison du choix** : isolation totale, backup simple, chaque persona vit et meurt indépendamment, pas de contamination entre personas.

---

## 1. Modèle de données

**Clé** : `buddy_pprofile_{personaId}`

**Structure JSON** (contenu adaptatif, schéma garanti) :
```json
{
  "lastUpdated": "2026-06-09",
  "summary": "Développeur Android intermédiaire, travaille sur Zova",
  "facts": ["Utilise Capacitor + HTML single-file", "Stack React/TypeScript"],
  "goals": ["Lancer Zova sur GitHub"],
  "preferences": "Veut des réponses courtes et directes"
}
```

**Limites** :
- `facts[]` : max 6 éléments
- `goals[]` : max 3 éléments
- `summary` : ≤ 1 phrase
- `preferences` : ≤ 1 phrase

Le LLM consolide sans accumuler — les infos obsolètes sont remplacées.

**Relation global / persona** :
- `buddy_userProfile` → identité, langue, style général, faits de vie — partagé entre tous
- `buddy_pprofile_{id}` → expertise domaine, objectifs et contexte spécifiques à CE persona

---

## 2. Fonctions

### Nouvelles fonctions de base

```javascript
getPersonaProfile(personaId)      // lit buddy_pprofile_{id}, retourne null si absent
setPersonaProfile(profile, id)    // sauvegarde
clearPersonaProfile(id)           // localStorage.removeItem(PERSONA_PROFILE_PREFIX + id)
getAllPersonaProfileMap()          // itère localStorage, retourne { id: profile, ... }
```

Constante : `PERSONA_PROFILE_PREFIX = 'buddy_pprofile_'`

### `updatePersonaProfile(persona, transcript)`

Appelée post-session en parallèle de `updateUserProfile()` et `generateMemory()`.

**Prompt LLM** :
```
Tu maintiens le profil utilisateur du point de vue de [persona.name],
dont le rôle est : [persona.description].

Profil actuel pour ce persona :
[profileJson]

Règles STRICTES :
- Ne capture que les infos pertinentes pour le rôle de [persona.name]
- max 6 éléments dans "facts", max 3 dans "goals"
- "summary" = 1 phrase, "preferences" = 1 phrase
- Conserve les infos existantes pertinentes, remplace les obsolètes
- lastUpdated = "[today]"
- Réponds UNIQUEMENT avec le JSON, sans markdown ni commentaire
- Champs obligatoires : summary, facts[], goals[], preferences, lastUpdated
```

- Même pipeline : Groq préféré → fallback `chatCompletion()`
- max_tokens: 400, temperature: 0.2

### `buildFullInstructions(persona)` — modification

Après l'injection du profil global, ajouter le profil persona :

```
# Profil [persona.name] de l'utilisateur
Ce que tu as appris sur cet utilisateur dans vos échanges :
Résumé : [summary]
Ce que tu sais : [facts joints par " | "]
Objectifs dans ce contexte : [goals joints par ", "]
Style attendu : [preferences]
```

Injecté seulement si `personaProfileHasContent(profile)` retourne true.

### `personaProfileHasContent(p)`

```javascript
return p && (p.summary || p.facts?.length || p.goals?.length || p.preferences);
```

### Session end — `stopConversation()`

```javascript
const transcriptText = getTranscriptText(false);
generateMemory(persona, transcriptText);       // existant
updateUserProfile(transcriptText);             // existant
updatePersonaProfile(persona, transcriptText); // NOUVEAU — parallèle, non-bloquant
```

---

## 3. Config UI

### Section "Profil utilisateur" → renommée dynamiquement

- Titre : **"Profil [persona.name]"** si une persona active existe, sinon "Profil utilisateur"
- Compteur : `"Aucun profil"` / `"3 infos · màj 2026-06-09"`

### Boutons mis à jour

| Bouton | Comportement |
|--------|-------------|
| 🪪 Voir le profil | Affiche summary + facts + goals + preferences du profil persona actif |
| 🗑️ Effacer | Efface `buddy_pprofile_{activeId}` avec confirmation mentionnant le nom du persona |

### Accès au profil général

Petit lien texte sous les boutons :
```
↓ Voir / effacer le profil général
```
Ouvre la même vue mais pour `buddy_userProfile` (comportement actuel des boutons).

---

## 4. Backup / Restore

### `buildBackupData()`

```javascript
{
  version: 2,  // déjà mis à jour lors de la feature mémoires per-persona
  ...
  personaMemories: getAllPersonaMemoryMap(),   // existant
  personaProfiles: getAllPersonaProfileMap(),  // NOUVEAU
  userProfile: getUserProfile()               // global, inchangé
}
```

### `processBackupJson()`

```javascript
if (data.personaProfiles && typeof data.personaProfiles === 'object') {
    Object.entries(data.personaProfiles).forEach(([id, profile]) => {
        if (profile && typeof profile === 'object')
            localStorage.setItem(PERSONA_PROFILE_PREFIX + id, JSON.stringify(profile));
    });
}
```

---

## 5. Ce qui ne change pas

- `buddy_userProfile` (profil global) continue d'être mis à jour après chaque session — il sert de socle commun
- `updateUserProfile()` inchangée
- Les clés localStorage avec préfixe `buddy_` restent compatibles avec les anciens backups

---

## Fichiers impactés

- `buddy/www/index.html` (seul fichier modifié)
  - ~50 lignes ajoutées (fonctions + update buildFullInstructions + Config UI)
  - ~5 lignes modifiées (stopConversation, buildBackupData, processBackupJson)
