# Création de persona guidée (wizard) — Design

**Date :** 2026-06-10
**Statut :** Validé (design), prêt pour plan d'implémentation
**Fichier impacté :** `buddy/www/index.html` (single-file app)

## Objectif

Réduire la friction de création d'un persona. Aujourd'hui le bouton « + Nuevo » ouvre directement un modal avec ~10 champs, dont un *system prompt* intimidant pour les non-techniciens. On ajoute un **mode guidé** : un wizard texte de 5 questions en langage simple qui génère un persona complet, présenté ensuite dans le modal manuel pré-rempli pour vérification/ajustement.

Le mode manuel existant reste **inchangé** et accessible.

## Décisions validées

- **Modalité :** wizard texte (écrans successifs), pas de voix.
- **Profondeur :** 5 questions.
- **Finalisation :** aperçu éditable — pré-remplit le modal manuel existant, l'utilisateur valide.
- **Image :** non bloquante — avatar par défaut, bouton « Générer une image » déjà présent dans le modal.
- **Génération (Approche B) :** hybride. Les champs structurés viennent d'un mapping déterministe (zéro IA) ; l'IA ne rédige que le texte créatif (nom optionnel, description, system prompt) en **un seul appel**.

## Flux utilisateur

```
[+ Nuevo] → feuille de choix
    ├── ✨ Création guidée  → openPersonaWizard()
    ├── ⚙️ Configuration manuelle → openPersonaModal()  (comportement actuel)
    └── Annuler

Wizard (5 écrans, barre de progression) → génération IA →
    openPersonaModal(personaPréRempli) + bandeau "✨ Persona généré — vérifie et ajuste"
    → utilisateur ajuste → Sauvegarder (logique existante)
```

## Les 5 questions

| # | Écran | Contrôle UI | Sortie |
|---|-------|-------------|--------|
| 1 | De quoi veux-tu parler ? À quoi sert ce persona ? | `textarea` + puces de suggestion cliquables | Entrée IA (description + prompt) |
| 2 | Quel ton ? | Choix unique (puces) : `chaleureux` · `pro` · `fun` · `calme` · `expert` | → voix (déterministe) + ton du prompt (IA) |
| 3 | Comment il s'adresse à toi + qui commence ? | Toggle tutoie/vouvoie + choix qui démarre | → `greeting` (déterministe) + prompt (IA) |
| 4 | Un nom | `input` texte + bouton « ✨ propose-m'en un » | → `name` (ou laissé à l'IA) |
| 5 | Style de réponses | Choix unique : `precise` · `balanced` · `creative` · `wild` | → `creativity` (déterministe, direct) |

**Navigation :** boutons Précédent / Suivant ; le dernier écran a « Créer le persona ». Q1 est obligatoire (au moins un sujet) avant de pouvoir générer. Les autres ont des valeurs par défaut (ton=chaleureux, tutoie=oui, démarre=persona, créativité=balanced).

## Mappings déterministes (sans IA)

```
ton (Q2)        → voix (table ci-dessous) + ton/personnalité du prompt (via l'IA)
qui démarre (Q3)→ greeting : 'persona' | 'user'
style (Q5)      → creativity : 'precise'|'balanced'|'creative'|'wild'  (valeur directe)
réactivité      : 'balanced' (défaut systématique)
modèle          : '' (modèle global par défaut)
```
Note : `ton` et `creativity` sont des axes distincts — le ton pilote la voix et la personnalité, le style (Q5) pilote uniquement le curseur de créativité. Pas de conflit.

### Sélection auto de la voix (ton → voix, par fournisseur)

Le fournisseur effectif est déduit du modèle global courant (défaut : OpenAI). Mapping :

| ton | OpenAI | Gemini | Ultravox |
|-----|--------|--------|----------|
| chaleureux | `coral` | `Fenrir` | `Jessica` |
| pro | `alloy` | `Kore` | `Tanya` |
| fun | `shimmer` | `Zephyr` | `Jessica` |
| calme | `sage` | `Leda` | `Tanya` |
| expert | `echo` | `Charon` | `David` |

**Repli :** on positionne la voix suggérée puis on appelle `updatePersonaVoiceList(suggérée)`, qui retombe sur la première voix valide si la suggestion n'existe pas pour le modèle courant. Aucune valeur invalide possible.

## Génération IA (un seul appel)

Réutilise le helper existant `chatCompletion({ systemPrompt, userPrompt, temperature, maxTokens })`.

**Contrat de sortie : JSON strict.**
```json
{ "name": "...", "description": "...", "prompt": "..." }
```

- Le `systemPrompt` reprend le style du `createPromptBtn` existant (prompt markdown structuré : Identité, Personnalité, Langue, Règles de conversation orale, Outils), avec en plus la consigne de produire `name` (si non fourni) + `description` courte, et de **ne renvoyer que du JSON**.
- Le `userPrompt` agrège : sujet (Q1), ton (Q2), tutoiement + qui démarre (Q3), nom fourni ou « propose un nom » (Q4), langue de l'app (`LANG`).
- Si l'utilisateur a saisi un nom (Q4), on le **garde** et on l'injecte dans le contexte ; sinon l'IA le propose.

**Parsing robuste :**
1. `JSON.parse` direct.
2. Si échec : extraire le premier bloc `{...}` via regex et reparser.
3. Si toujours échec : traiter toute la réponse comme `prompt`, dériver `name` de Q4 ou Q1, `description` = sujet tronqué. (Dégradé mais jamais bloquant.)

## Pré-remplissage du modal

Après génération, ouvrir le modal manuel avec les valeurs :
`name`, `description`, `prompt` (de l'IA) ; `voice` (mapping ton), `creativity` (Q5), `greeting` (Q3), `reactivity='balanced'`, `model=''`, `personaInfo=''`, `image=null`.

Implémentation : soit construire un objet persona temporaire passé à `openPersonaModal(temp)` **sans** l'enregistrer (mais `openPersonaModal` traite un objet comme une édition → il faut un mode « création pré-remplie »), soit ouvrir le modal en création puis écrire les valeurs dans les champs. **Choix : ouvrir en création (`editingPersonaId=null`) puis remplir les champs**, pour que « Sauvegarder » crée un nouveau persona (pas une édition). Ajouter un bandeau dismissible en haut du modal.

## Composants à ajouter (dans `index.html`)

- **HTML :** `#personaChoiceSheet` (feuille de choix) ; `#personaWizardModal` (5 étapes, progression, navigation) ; bandeau « persona généré » dans `#personaModal`.
- **CSS :** styles wizard (étapes, barre de progression, puces de choix/suggestion) — réutilise les variables et le style modal existants.
- **JS :**
  - `openPersonaChoiceSheet()` — branché sur `newPersonaBtn` (remplace l'appel direct à `openPersonaModal`).
  - `openPersonaWizard()` / `closePersonaWizard()` — état d'étape, navigation, collecte des réponses.
  - `generatePersonaFromWizard()` — construit prompts, appelle `chatCompletion`, parse, mappe voix, ouvre le modal pré-rempli.
  - `wizardToneToVoice(tone, provider)` — table de mapping ci-dessus.
- **i18n :** toutes les chaînes du wizard ajoutées à `TRANSLATIONS` (ES/EN/FR), suivant le système `data-i18n` existant.

## Gestion des erreurs / cas limites

- **Pas de clé API :** le mode guidé requiert l'IA. Au choix « Création guidée », vérifier `hasAnyApiKey()` ; si absente → `customAlert` « Configure d'abord une clé API » + proposer le mode manuel. (Même check que `createPromptBtn`.)
- **Q1 vide :** bouton « Créer le persona » désactivé tant que le sujet est vide.
- **Échec réseau / API pendant la génération :** message d'erreur dans le wizard + bouton « Réessayer » et « Continuer en manuel » (ouvre le modal avec ce qu'on a déjà : voix/réglages mappés, prompt vide à compléter).
- **JSON IA invalide :** parsing dégradé (voir ci-dessus), jamais bloquant.
- **Bouton retour Android :** le listener `backButton` existant doit fermer le wizard/feuille de choix comme les autres modales (ajouter à la chaîne de fermeture).

## Hors périmètre (YAGNI)

- Interview vocale (modalité voix) — écartée.
- Génération d'image automatique — l'image reste manuelle/optionnelle.
- Édition d'un persona existant via wizard — le wizard ne sert qu'à la **création**.
- Templates hors-ligne sans IA.

## Vérification

- Build + install sur Xiaomi 14T, test via CDP : présence des nouvelles fonctions (`typeof openPersonaWizard === 'function'`, etc.) prouve que le script parse.
- Test manuel : parcours guidé complet (5 écrans) → génération → modal pré-rempli → sauvegarde → le persona apparaît et est utilisable.
- Test dégradé : couper la connexion → vérifier le repli « Continuer en manuel ».
