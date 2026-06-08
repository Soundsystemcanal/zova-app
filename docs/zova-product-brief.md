# Zova — Product Brief

> Document de référence pour le développement et le branding de l'application.

---

> 🔗 Identité de marque complète : [`docs/zova-brand-identity.md`](zova-brand-identity.md)

---

## 1. Vision

**Zova** est un assistant vocal IA personnel qui vit entièrement sur ton téléphone.  
Pas de serveur intermédiaire. Pas d'abonnement. Ton téléphone parle directement aux meilleures IA du monde — en temps réel, en toute confidentialité.

---

## 2. Positionnement

| | Zova | Assistants classiques (Siri, Alexa…) | Apps IA par abonnement |
|---|---|---|---|
| Serveur intermédiaire | ❌ aucun | ✅ cloud propriétaire | ✅ cloud propriétaire |
| Données envoyées à l'éditeur | ❌ jamais | ✅ oui | ✅ oui |
| Modèle de paiement | Pay-as-you-go (API) | Gratuit / éco fermé | Abonnement mensuel fixe |
| Personnalisation | Totale (prompt, voix, avatar) | Nulle | Partielle |
| Choix du moteur IA | 4 providers | 1 moteur propriétaire | 1 moteur |

**Cible :** utilisateurs tech-savvy, soucieux de leur vie privée, qui veulent un assistant vocal puissant et personnalisé sans contrainte d'abonnement.

---

## 3. Valeurs fondatrices

- **Confidentialité** — les clés API et données restent sur le téléphone (Android Keystore). Zova ne voit rien.
- **Liberté** — choix du provider, du modèle, de la voix, de la personnalité. Pas de lock-in.
- **Transparence des coûts** — tu sais exactement combien tu dépenses, en temps réel.
- **Puissance accessible** — les mêmes API que les pros, sans complexité technique.

---

## 4. Fonctionnalités clés

### 🎙️ Conversation vocale en temps réel
- Parole naturelle, latence ultra-faible (< 500ms sur OpenAI Realtime)
- Aucune commande de déclenchement — parle naturellement

### 🤖 4 providers au choix
| Provider | Qualité | Coût |
|---|---|---|
| OpenAI Realtime | ⭐⭐⭐⭐⭐ | ~0,06 $/min |
| Gemini Live | ⭐⭐⭐⭐ | ~0,01 $/min |
| Ultravox | ⭐⭐⭐ | ~0,005 $/min |
| Groq pipeline | ⭐⭐⭐ | ~0,001 $/min |

### 🎭 Personas personnalisées
- Crée des assistants sur mesure : nom, personnalité, voix, avatar (IA ou photo)
- Prompt système libre — le comportement de l'assistant n'a pas de limite
- **Persona "Zova"** pré-installée : guide de bienvenue chaleureux

### 💰 Contrôle du budget
- Plafond mensuel configurable (ex : $5/mois)
- Alerte à 90 % de la limite
- Compteur remis à zéro le 1er du mois

### 🔒 Sécurité
- Clés API stockées dans l'Android Keystore (chiffrement hardware)
- Code PIN 4 chiffres pour verrouiller l'app
- Zéro donnée envoyée à un serveur Zova (il n'existe pas)

### ❓ FAQ intégrée
- 6 questions-réponses trilingues (FR / EN / ES)
- Modal accordéon accessible depuis la Configuration

### 🌍 Multilingue
- Interface en Français, English, Español
- Détection automatique de la langue du téléphone

---

## 5. Identité visuelle — Dark Cosmos

### Palette
| Rôle | Couleur | Usage |
|---|---|---|
| Background principal | `#0a0a1f` | Fond de l'app |
| Accent violet | `#8b5cf6` | Boutons, éléments actifs, icône mic |
| Accent rose | `#ec4899` | Dégradés, animations vocales |
| Texte principal | `#e2d9f3` | Corps de texte |
| Texte secondaire | `#9a8cb0` | Sous-titres, hints |

### Typo
- Titres : **Syne** (700–800) — géométrique, tech, distinctif
- Corps : **DM Sans** (300–500) — lisible, moderne, accessible

### Icône
- Microphone stylisé avec dégradé violet → rose
- Ondas sonores violettes
- Texte "ZOVA" en blanc
- Fond `#0a0a1f` (Dark Cosmos)

### Mood & tone
- **Mots clés :** intime, puissant, confidentiel, futuriste, humain
- **Pas :** froid, corporatif, toy, gadget
- **Références visuelles :** cosmos nocturne, nébuleuse violette, interface SF discrète

---

## 6. Nom & slogan

**Zova** — court, mémorable, universel, pas de traduction parasite.

**Slogan officiel :** *"Ton IA. Ton téléphone. Tes règles."*

**Valeurs de marque (voir fiche complète) :**
- Souveraineté technologique absolue
- Liberté sans censure (éthique)
- Transparence radicale des coûts

---

## 7. Fiche technique

| Propriété | Valeur |
|---|---|
| Plateforme | Android (Capacitor WebView) |
| App ID | `com.zova.voiceapp` |
| Distribution | APK direct (hors Google Play) |
| Fichier principal | `buddy/www/index.html` (~6900 lignes) |
| Backend | Aucun |
| Stockage sensible | Android Keystore |
| Stockage données | localStorage (buddy_*) |
| Permissions | INTERNET, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS |
| Testé sur | Xiaomi 14T — Android 16 "Baklava" |

---

## 8. Roadmap

| Étape | Description | Statut |
|---|---|---|
| Tasks 1–10 | App fonctionnelle, 4 providers, personas, PIN, backup | ✅ Livré |
| FAQ + Zova | FAQ trilingue, persona guide pré-installée, touch sensitivity | ✅ Livré (2026-06-07) |
| Task 11 | APK release signé (keystore de production) | ⏳ |
| Task 12 | GitHub Releases + QR de téléchargement | ⏳ |
| Task 13 | Landing page publique (GitHub Pages) — présentation + téléchargement APK + QR | ⏳ |
| Futur | Biométrie (empreinte), mode traducteur live, bibliothèque de personas | 💡 |

---

## 9. Pour démarrer (utilisateur)

1. **Télécharger** l'APK et l'installer (autoriser les sources inconnues)
2. **Choisir un provider** — Gemini Live recommandé pour débuter (~0,01 $/min)
3. **Créer un compte** sur le site du provider → récupérer la clé API
4. **Config → Clé API** → coller la clé → Sauvegarder
5. **Config → Budget** → définir un plafond mensuel (ex : $5)
6. **Parler à Zova** — ou créer sa propre persona

---

*Document généré le 2026-06-07 — Projet Zova par Xavier Bourdet*
