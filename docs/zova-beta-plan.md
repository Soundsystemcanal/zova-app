# Zova — Plan Beta Google Play Store

> Créé le 2026-06-07. Guide de référence pour la mise en beta sur le Play Store.

---

## Résumé de l'application

**Zova** est un assistant vocal IA personnel sur Android. L'utilisateur parle, l'IA répond vocalement en temps réel. Pas de serveur intermédiaire — les API keys sont stockées localement dans l'Android Keystore.

**4 providers :**
| Provider | Qualité | Coût | Latence |
|---|---|---|---|
| OpenAI Realtime | ⭐⭐⭐⭐⭐ | ~$0.06/min | Ultra-faible |
| Gemini Live | ⭐⭐⭐⭐ | ~$0.01/min | Faible |
| Ultravox | ⭐⭐⭐ | ~$0.005/min | Faible |
| Groq pipeline | ⭐⭐⭐ | ~$0.001/min | Modérée |

**Avantages :** aucun backend, multi-provider, coût minimal, personas configurables, single-file.

---

## Audit Sécurité

### 🔴 Haute priorité

1. **API keys dans localStorage (fallback)** — si Keystore échoue, bloquer l'app plutôt que fallback non chiffré
2. **Pas de validation de domaine WebSocket** — whitelister `api.openai.com`, `voice.ultravox.ai`, etc.
3. **Export JSON non chiffré** — avertir l'utilisateur clairement ou proposer export chiffré AES-256

### 🟡 Priorité moyenne

4. **Pas de certificate pinning** — network security config Android pour les domaines critiques
5. **Pas de Content Security Policy** — ajouter `<meta http-equiv="Content-Security-Policy">` dans index.html
6. **Logs de debug verbeux** — désactiver/filtrer les `console.log` en build release

### 🟢 Priorité basse

7. **PIN brute-force** — blocage après 5 tentatives + délai exponentiel
8. **Pas de timeout de session** — verrouillage automatique après X minutes d'inactivité

---

## Plan Beta — Étapes

### Phase 0 — Prérequis (1-2 jours)

- [ ] Créer un compte Google Play Developer ($25 une fois)
- [ ] Générer un keystore de signature release :
  ```powershell
  keytool -genkey -v -keystore zova-release.jks -alias zova -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Stocker le keystore en sécurité (hors du repo Git, jamais committé)
- [ ] Configurer `build.gradle` avec les infos de signature release

---

### Phase 1 — Build release signé (2-3 jours)

- [ ] Configurer `android/app/build.gradle` :
  ```groovy
  signingConfigs {
      release {
          keyAlias 'zova'
          keyPassword '...'
          storeFile file('zova-release.jks')
          storePassword '...'
      }
  }
  buildTypes {
      release {
          signingConfig signingConfigs.release
          minifyEnabled true
          proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
      }
  }
  ```
- [ ] Corriger les issues sécurité haute priorité (items 1 & 2)
- [ ] Désactiver les logs de debug (item 6)
- [ ] Ajouter CSP dans `<head>` de index.html (item 5)
- [ ] Build AAB (requis par Play Store) :
  ```powershell
  cd buddy/android
  ./gradlew bundleRelease
  # → buddy/android/app/build/outputs/bundle/release/app-release.aab
  ```
- [ ] Tester l'AAB sur le Xiaomi 14T en mode release

---

### Phase 2 — Assets Play Store (1-2 jours)

- [ ] Screenshots — 2-8 captures (min 1080×1920) de chaque écran principal
- [ ] Feature graphic — 1024×500 px
- [ ] Icône — déjà prête (`icon.png` 1024×1024 Dark Cosmos) ✅
- [ ] Fiche app :
  - Titre : *Zova — AI Voice Assistant*
  - Description courte (80 chars max)
  - Description longue (4000 chars max)
  - Catégorie : *Productivité*
- [ ] Politique de confidentialité (page simple sur GitHub Pages suffit)
  - Mentionner : aucune donnée collectée, API keys locales uniquement

---

### Phase 3 — Configuration Play Console (1 jour)

- [ ] Créer l'app dans Play Console
- [ ] Renseigner Content rating (questionnaire IARC)
- [ ] Configurer Target audience (18+)
- [ ] Déclarer les permissions : `RECORD_AUDIO`, `INTERNET`, `WAKE_LOCK`
- [ ] Renseigner Data safety :
  - Aucune donnée collectée ✅
  - Données non partagées ✅
  - API keys stockées localement ✅

---

### Phase 4 — Déploiement beta fermé (1 jour)

- [ ] Uploader l'AAB dans Internal Testing (test immédiat, sans review)
- [ ] Ajouter les testeurs (email Google)
- [ ] Tester sur 2-3 appareils différents
- [ ] Corriger les bugs remontés
- [ ] Promouvoir en Closed Testing (Beta) — jusqu'à 1000 testeurs, review ~1-3 jours

---

### Phase 5 — Checklist avant production

- [ ] Tous les bugs sécurité haute/moyenne corrigés
- [ ] Testé sur Android 10, 12, 14, 16
- [ ] Export/backup vérifié
- [ ] PIN lock vérifié
- [ ] Au moins 1 semaine de beta sans crash critique
- [ ] Task 12 : GitHub Release avec QR code → lien Play Store

---

## Timeline estimée

```
Semaine 1 : Phase 0 + Phase 1 (build signé + sécurité)
Semaine 2 : Phase 2 + Phase 3 (assets + Play Console)
Semaine 2 : Phase 4 (Internal Testing → beta fermée)
Semaine 3-4 : Correction bugs beta
Semaine 5 : Production 🚀
```

---

## État des tâches CLAUDE.md

- ✅ Tasks 1–10 — fonctionnalités core
- ⏳ Task 11 — APK/AAB release signé → **Phase 1 de ce plan**
- ⏳ Task 12 — GitHub Releases + QR → **Phase 5 de ce plan**
