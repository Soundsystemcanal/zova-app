# FAQ Section + Persona Zova Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une modal FAQ trilingue (6 Q&A FR/EN/ES) accessible via un bouton `?` dans Config, et embarquer la persona "Zova" pré-chargée au premier lancement.

**Architecture:** Tout se passe dans un seul fichier `buddy/www/index.html`. On ajoute : (1) du CSS pour la modal FAQ et son accordéon, (2) le HTML de la modal FAQ et du bouton `?`, (3) l'objet JS `FAQ_CONTENT` et la fonction `openFaqModal()`, (4) la constante `DEFAULT_PERSONA_ZOVA` avec injection conditionnelle dans `DOMContentLoaded`.

**Tech Stack:** HTML/CSS/JS vanilla, Capacitor Android, localStorage (`buddy_personas`, `buddy_lang`)

---

## Fichiers impactés

| Fichier | Action | Quoi |
|---|---|---|
| `buddy/www/index.html` | Modifier | CSS + HTML + JS (tout en un) |

---

## Task 1 : CSS — styles de la modal FAQ et de l'accordéon

**Files:**
- Modify: `buddy/www/index.html` — bloc `<style>` existant (avant la balise `</style>` de fermeture)

- [ ] **Step 1 : Localiser la fin du bloc `<style>`**

Chercher la ligne contenant `</style>` juste avant `<!-- ════════ PIN LOCK SCREEN ════════ -->` (autour de la ligne 1920). C'est là qu'on insère le CSS.

- [ ] **Step 2 : Insérer le CSS de la modal FAQ**

Juste avant la ligne `</style>` (fin du bloc style principal), ajouter :

```css
        /* ═══════════════════════════════════════
           FAQ MODAL
           ═══════════════════════════════════════ */
        #faqModal .modal { max-width: 520px; max-height: 80vh; overflow-y: auto; }
        .faq-item { border-bottom: 1px solid var(--border); }
        .faq-item:last-child { border-bottom: none; }
        .faq-q {
            width: 100%;
            background: none;
            border: none;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 0.92rem;
            font-weight: 600;
            text-align: left;
            padding: 14px 0;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            transition: color 0.15s;
        }
        .faq-q:hover { color: var(--accent); }
        .faq-q .faq-arrow {
            font-size: 0.75rem;
            color: var(--text-muted);
            transition: transform 0.2s;
            flex-shrink: 0;
        }
        .faq-item.open .faq-q .faq-arrow { transform: rotate(180deg); }
        .faq-a {
            display: none;
            font-size: 0.85rem;
            color: var(--text-secondary);
            line-height: 1.6;
            padding: 0 0 14px 0;
        }
        .faq-item.open .faq-a { display: block; }
        #openFaqBtn {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--accent);
            color: #fff;
            border: none;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
```

- [ ] **Step 3 : Vérifier visuellement**

Ouvrir `buddy/www/index.html` dans un navigateur desktop et vérifier que le CSS n'a pas cassé l'écran Config. Aucun élément ne doit bouger.

- [ ] **Step 4 : Commit**

```powershell
cd "C:\Users\xavie\OneDrive\Documentos\Cerrador"
git add buddy/www/index.html
git commit -m "feat: add CSS for FAQ modal and accordion"
```

---

## Task 2 : HTML — bouton `?` dans Config et modal FAQ

**Files:**
- Modify: `buddy/www/index.html` — section HTML entre les lignes ~2327 et ~2812

- [ ] **Step 1 : Ajouter `position:relative` au header Config et le bouton `?`**

Trouver la ligne :
```html
    <!-- SCREEN: Config -->
    <div id="screenConfig">
      <h2 style="font-size:1.1rem;font-weight:700;margin-bottom:16px;color:var(--text-primary)" data-i18n="config_title">Configuración</h2>
```

Remplacer par :
```html
    <!-- SCREEN: Config -->
    <div id="screenConfig">
      <div style="position:relative;margin-bottom:16px">
        <h2 style="font-size:1.1rem;font-weight:700;color:var(--text-primary)" data-i18n="config_title">Configuración</h2>
        <button id="openFaqBtn" title="FAQ">?</button>
      </div>
```

- [ ] **Step 2 : Ajouter la modal FAQ dans le HTML**

Trouver la ligne `<div class="modal-overlay" id="backupModal">` (autour de la ligne 2788).
Juste **après** la fermeture de `backupModal` (`</div>` qui termine ce modal, avant `<script>`), insérer :

```html
    <!-- ════════════════════════════════════════
         MODAL : FAQ
         ════════════════════════════════════════ -->
    <div class="modal-overlay" id="faqModal">
        <div class="modal" style="position:relative">
            <button class="modal-close" id="closeFaqBtn">&times;</button>
            <h2 style="margin-bottom:1.2rem">FAQ</h2>
            <div id="faqList"></div>
        </div>
    </div>
```

- [ ] **Step 3 : Vérifier**

Recharger dans le navigateur — le bouton `?` doit apparaître en haut à droite du titre "Configuración". La modal ne s'ouvre pas encore (pas de JS).

- [ ] **Step 4 : Commit**

```powershell
cd "C:\Users\xavie\OneDrive\Documentos\Cerrador"
git add buddy/www/index.html
git commit -m "feat: add FAQ button in Config header and FAQ modal HTML"
```

---

## Task 3 : JS — objet `FAQ_CONTENT` et fonction `openFaqModal()`

**Files:**
- Modify: `buddy/www/index.html` — bloc `<script>` existant

- [ ] **Step 1 : Localiser le point d'insertion**

Chercher la fonction `function detectLang()` (autour de la ligne 2999). On insèrera le bloc FAQ juste **avant** cette fonction.

- [ ] **Step 2 : Insérer l'objet `FAQ_CONTENT` et la fonction `openFaqModal()`**

Juste avant `function detectLang()`, ajouter :

```js
    // ── FAQ ────────────────────────────────────────────
    const FAQ_CONTENT = {
        fr: [
            {
                q: 'Par où commencer ?',
                a: 'Zova fonctionne sans serveur intermédiaire : tu parles directement aux IA via leur API officielle. Pour démarrer, choisis d\'abord un fournisseur (OpenAI, Gemini, Ultravox ou Groq), crée un compte sur leur site, obtiens une clé API, puis colle-la dans l\'onglet Clé API de la Configuration. C\'est tout — tu peux ensuite lancer ta première conversation.'
            },
            {
                q: 'Quel provider choisir ?',
                a: 'Tout dépend de tes priorités. OpenAI Realtime offre la meilleure qualité et la latence la plus faible. Gemini Live est excellent et très abordable. Ultravox est économique avec une bonne qualité. Groq est le moins cher de tous avec une latence légèrement plus élevée. Tu peux changer de provider à tout moment dans l\'onglet Modèle sans perdre tes conversations.'
            },
            {
                q: 'Comment entrer ma clé API ?',
                a: 'Commence par cliquer sur le lien de ton provider dans l\'onglet Clé API pour créer ton compte et récupérer ta clé. Reviens ensuite dans l\'app, colle la clé dans le champ correspondant et appuie sur Sauvegarder. La clé est stockée exclusivement dans l\'Android Keystore de ton téléphone — elle ne transite jamais par un serveur externe.'
            },
            {
                q: 'Comment maîtriser mes dépenses ?',
                a: 'Va dans Configuration → Budget et entre un montant mensuel maximum. Zova t\'avertira quand tu atteindras 90 % de la limite et bloquera les nouvelles conversations une fois le plafond dépassé. Le compteur se remet à zéro le 1er de chaque mois. Tu peux laisser le champ vide pour désactiver le plafond.'
            },
            {
                q: 'Comment créer un assistant personnalisé ?',
                a: 'Va dans l\'onglet Personas et appuie sur + Nouveau persona. Donne-lui un nom, une description, choisis une voix et un modèle. Le champ Prompt système définit sa personnalité : plus tu le détailles, plus il sera unique. Tu peux générer une image avec l\'IA ou en importer une depuis ta galerie.'
            },
            {
                q: 'Comment sécuriser l\'app ?',
                a: 'Va dans Configuration et appuie sur Activer le code PIN. Choisis un code à 4 chiffres : il te sera demandé à chaque ouverture de l\'app. Le PIN est stocké dans l\'Android Keystore au même titre que tes clés API. Tes données sont uniquement sur ton téléphone, jamais envoyées à Zova.'
            }
        ],
        en: [
            {
                q: 'Where do I start?',
                a: 'Zova works without any middleman server: you talk directly to AI providers via their official API. To get started, pick a provider (OpenAI, Gemini, Ultravox or Groq), create an account on their website, get an API key, then paste it in the API Key tab of Settings. That\'s it — you can then start your first conversation.'
            },
            {
                q: 'Which provider should I choose?',
                a: 'It depends on your priorities. OpenAI Realtime delivers the best quality and lowest latency. Gemini Live is excellent and very affordable. Ultravox is budget-friendly with good quality. Groq is the cheapest option with slightly higher latency. You can switch providers anytime in the Model tab without losing your conversations.'
            },
            {
                q: 'How do I enter my API key?',
                a: 'Start by clicking the link for your provider in the API Key tab to create your account and retrieve your key. Then come back to the app, paste the key in the matching field and tap Save. The key is stored exclusively in your phone\'s Android Keystore — it never passes through any external server.'
            },
            {
                q: 'How do I control my spending?',
                a: 'Go to Settings → Budget and enter a monthly maximum amount. Zova will warn you when you reach 90% of the limit and block new conversations once the cap is exceeded. The counter resets on the 1st of each month. You can leave the field empty to disable the cap.'
            },
            {
                q: 'How do I create a custom assistant?',
                a: 'Go to the Personas tab and tap + New persona. Give it a name, a description, choose a voice and a model. The System prompt field defines its personality: the more detailed it is, the more unique it will be. You can generate an image with AI or import one from your gallery.'
            },
            {
                q: 'How do I secure the app?',
                a: 'Go to Settings and tap Activate PIN code. Choose a 4-digit code: it will be required each time you open the app. The PIN is stored in the Android Keystore alongside your API keys. Your data stays only on your phone, never sent to Zova.'
            }
        ],
        es: [
            {
                q: '¿Por dónde empezar?',
                a: 'Zova funciona sin servidor intermediario: hablas directamente con las IAs a través de su API oficial. Para empezar, elige un proveedor (OpenAI, Gemini, Ultravox o Groq), crea una cuenta en su web, obtén una clave API y pégala en la pestaña Clave API de Configuración. Eso es todo — ya puedes iniciar tu primera conversación.'
            },
            {
                q: '¿Qué proveedor elegir?',
                a: 'Depende de tus prioridades. OpenAI Realtime ofrece la mejor calidad y la latencia más baja. Gemini Live es excelente y muy asequible. Ultravox es económico con buena calidad. Groq es el más barato con una latencia algo mayor. Puedes cambiar de proveedor en cualquier momento en la pestaña Modelo sin perder tus conversaciones.'
            },
            {
                q: '¿Cómo introduzco mi clave API?',
                a: 'Empieza haciendo clic en el enlace de tu proveedor en la pestaña Clave API para crear tu cuenta y obtener tu clave. Luego vuelve a la app, pega la clave en el campo correspondiente y pulsa Guardar. La clave se almacena exclusivamente en el Android Keystore de tu teléfono — nunca pasa por un servidor externo.'
            },
            {
                q: '¿Cómo controlo mis gastos?',
                a: 'Ve a Configuración → Presupuesto e introduce un importe máximo mensual. Zova te avisará cuando alcances el 90 % del límite y bloqueará nuevas conversaciones una vez superado el tope. El contador se reinicia el 1 de cada mes. Puedes dejar el campo vacío para desactivar el tope.'
            },
            {
                q: '¿Cómo creo un asistente personalizado?',
                a: 'Ve a la pestaña Personas y pulsa + Nueva persona. Dale un nombre, una descripción, elige una voz y un modelo. El campo Prompt del sistema define su personalidad: cuanto más detallado sea, más único será. Puedes generar una imagen con IA o importar una desde tu galería.'
            },
            {
                q: '¿Cómo protejo la app?',
                a: 'Ve a Configuración y pulsa Activar código PIN. Elige un código de 4 dígitos: se te pedirá cada vez que abras la app. El PIN se almacena en el Android Keystore junto a tus claves API. Tus datos permanecen únicamente en tu teléfono, nunca se envían a Zova.'
            }
        ]
    };

    function openFaqModal() {
        const lang = LANG || 'fr';
        const items = FAQ_CONTENT[lang] || FAQ_CONTENT['fr'];
        const list = document.getElementById('faqList');
        list.innerHTML = items.map((item, i) => `
            <div class="faq-item" data-faq="${i}">
                <button class="faq-q" data-faq="${i}">
                    <span>${item.q}</span>
                    <span class="faq-arrow">&#9660;</span>
                </button>
                <div class="faq-a">${item.a}</div>
            </div>
        `).join('');
        list.querySelectorAll('.faq-q').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq-item');
                item.classList.toggle('open');
            });
        });
        document.getElementById('faqModal').classList.add('active');
    }
```

- [ ] **Step 3 : Câbler le bouton `?` et le bouton fermer**

Chercher le bloc `document.addEventListener('DOMContentLoaded', () => {` (autour de la ligne 3080).
À l'intérieur, avant la fermeture `});`, ajouter :

```js
        // FAQ
        const openFaqBtn = document.getElementById('openFaqBtn');
        if (openFaqBtn) openFaqBtn.addEventListener('click', openFaqModal);
        const closeFaqBtn = document.getElementById('closeFaqBtn');
        if (closeFaqBtn) closeFaqBtn.addEventListener('click', () => {
            document.getElementById('faqModal').classList.remove('active');
        });
        document.getElementById('faqModal')?.addEventListener('click', (e) => {
            if (e.target === document.getElementById('faqModal')) {
                document.getElementById('faqModal').classList.remove('active');
            }
        });
```

- [ ] **Step 4 : Tester dans le navigateur**

1. Recharger `index.html`.
2. Aller dans l'onglet Config → un bouton `?` violet doit être visible en haut à droite du titre.
3. Taper sur `?` → la modal FAQ s'ouvre avec 6 questions en FR (langue par défaut).
4. Taper sur une question → la réponse se déplie.
5. Retaper → elle se referme.
6. Changer la langue en ES ou EN → fermer la modal → rouvrir → vérifier que les questions sont dans la bonne langue.
7. Cliquer hors de la modal → elle se ferme.

- [ ] **Step 5 : Commit**

```powershell
cd "C:\Users\xavie\OneDrive\Documentos\Cerrador"
git add buddy/www/index.html
git commit -m "feat: add FAQ_CONTENT, openFaqModal and wire up ? button"
```

---

## Task 4 : JS — constante `DEFAULT_PERSONA_ZOVA` et injection au premier lancement

**Files:**
- Modify: `buddy/www/index.html` — bloc `<script>`, zone des constantes (autour de la ligne 3274)

- [ ] **Step 1 : Localiser le point d'insertion**

Trouver la ligne `const DEFAULT_PROMPT = (name) => \`# Identité` (autour de la ligne 3274). On insèrera `DEFAULT_PERSONA_ZOVA` juste **avant** cette ligne.

- [ ] **Step 2 : Insérer la constante `DEFAULT_PERSONA_ZOVA`**

```js
    const DEFAULT_PERSONA_ZOVA = {
        id: 'zova-default-v1',
        name: 'Zova',
        description: 'Ton guide de bienvenue — elle t\'aide à configurer l\'app de A à Z',
        voice: 'shimmer',
        model: '',
        translateLang: '',
        prompt: `# Système et Rôle Principal
Tu es Zova, l'assistante virtuelle de bienvenue de l'application Zova — un outil d'assistance vocale IA avancé pour Android. Ta seule mission est de guider, motiver et présenter l'application de manière enthousiaste aux utilisateurs qui l'ouvrent pour la première fois. Tu agis comme une hôtesse énergique, joyeuse et pleinement convaincue du potentiel de l'outil, en résolvant les doutes initiaux à partir des informations officielles de configuration.

# Protocole d'Ouverture de Conversation
Lorsque l'utilisateur commence une conversation, tu dois l'initier toi-même de façon chaleureuse. Utilise exactement cette approche dans tes deux premières phrases :
"Bienvenue chez Zova, ton nouvel outil pour t'accompagner le long de ta vie de tous les jours ! Veux-tu que je t'explique les fonctionnalités de l'application pour t'aider à bien la prendre en main ?"

# Personnalité et Ton Verbal
- Ton : Jovial, optimiste, chaleureux et très accueillant. Tu transmets l'enthousiasme.
- Style : Conversationnel, frais, dynamique et très accessible.
- Énergie : Haute et motivante, sans jamais être stridente.

# Directives de Langage
Tu parles en français courant, avec un langage moderne et proche. Intègre naturellement des expressions légèrement informelles ("c'est parti", "tu vas voir", "des trucs de dingue").

# Base de Connaissances
Utilise exclusivement ces données pour répondre :
1. PREMIER USAGE : La première chose à faire est de configurer la clé API dans Configuration → Clé API. Les clés sont sauvegardées de façon 100 % sécurisée dans l'Android Keystore.
2. AVANTAGES : Zova fonctionne en local sur le téléphone sans serveurs intermédiaires — confidentialité maximale et personnalisation totale.
3. FOURNISSEURS : 4 providers au choix — OpenAI Realtime (qualité maximale), Gemini Live (excellent et abordable), Ultravox (économique), Groq (coût minimal).
4. BUDGET : Fonction de plafond mensuel dans Configuration → Budget pour maîtriser les dépenses.
5. PERSONAS : Après la config API, tu peux créer des assistants virtuels sur mesure avec leur propre personnalité.

# Restrictions Audio (TTS)
- Limite stricte de 2 à 3 phrases par réponse.
- Aucun markdown, aucune liste, aucun tiret, aucun symbole dans les réponses — texte pur uniquement.
- Ne répète pas les questions. Réponds directement.
- Termine chaque réponse par une invitation à poser la prochaine question.`
    };
```

- [ ] **Step 3 : Ajouter l'injection dans `DOMContentLoaded`**

Dans le bloc `document.addEventListener('DOMContentLoaded', () => {` (autour de la ligne 3080), juste **avant** les listeners FAQ ajoutés à la Task 3, insérer :

```js
        // Persona Zova par défaut — injectée uniquement si aucune persona n'existe
        (function injectDefaultPersona() {
            const raw = localStorage.getItem('buddy_personas');
            if (!raw || raw === '[]' || raw === 'null') {
                localStorage.setItem('buddy_personas', JSON.stringify([DEFAULT_PERSONA_ZOVA]));
            }
        })();
```

- [ ] **Step 4 : Tester l'injection**

1. Ouvrir les DevTools → Application → localStorage → supprimer `buddy_personas` si elle existe.
2. Recharger la page.
3. Aller dans l'onglet Personas → "Zova" doit apparaître dans la liste.
4. Recharger à nouveau → toujours une seule "Zova" (pas de doublon).
5. Créer une deuxième persona manuellement → recharger → "Zova" n'est PAS réinjectée (la liste n'est pas `[]`).

- [ ] **Step 5 : Commit**

```powershell
cd "C:\Users\xavie\OneDrive\Documentos\Cerrador"
git add buddy/www/index.html
git commit -m "feat: add DEFAULT_PERSONA_ZOVA and inject on first launch"
```

---

## Task 5 : Sync Android et validation sur Xiaomi 14T

**Files:**
- Run: commandes PowerShell

- [ ] **Step 1 : Définir les variables d'environnement**

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\xavie\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools"
```

- [ ] **Step 2 : Synchroniser vers Android**

```powershell
cd C:\Users\xavie\OneDrive\Documentos\Cerrador\buddy
npx cap sync android
```

Résultat attendu : `✔ Copying web assets` + `✔ Updating Android plugins` sans erreur.

- [ ] **Step 3 : Vérifier le device connecté**

```powershell
adb devices
```

Résultat attendu : une ligne avec le device Xiaomi en `device` (pas `unauthorized`).

- [ ] **Step 4 : Lancer l'app via Android Studio ou adb**

Ouvrir Android Studio → Run 'app' sur le Xiaomi 14T.

- [ ] **Step 5 : Checklist de validation sur device**

- [ ] Onglet Config → bouton `?` violet visible en haut à droite du titre
- [ ] Tap `?` → modal FAQ s'ouvre
- [ ] 6 questions affichées dans la langue active de l'app
- [ ] Tap sur une question → réponse visible
- [ ] Retap → réponse masquée
- [ ] Changer langue (ES/EN/FR) → rouvrir FAQ → langue correcte
- [ ] Tap hors modal → fermeture
- [ ] Onglet Personas → persona "Zova" présente avec description
- [ ] Créer une nouvelle persona → recharger → Zova toujours présente, pas dupliquée
- [ ] Vider `buddy_personas` via backup → recharger → Zova réapparaît

- [ ] **Step 6 : Commit final**

```powershell
cd "C:\Users\xavie\OneDrive\Documentos\Cerrador"
git add buddy/www/index.html
git commit -m "feat: FAQ trilingue + persona Zova default — validated on Xiaomi 14T"
```

---

## Récapitulatif des commits attendus

```
feat: add CSS for FAQ modal and accordion
feat: add FAQ button in Config header and FAQ modal HTML
feat: add FAQ_CONTENT, openFaqModal and wire up ? button
feat: add DEFAULT_PERSONA_ZOVA and inject on first launch
feat: FAQ trilingue + persona Zova default — validated on Xiaomi 14T
```
