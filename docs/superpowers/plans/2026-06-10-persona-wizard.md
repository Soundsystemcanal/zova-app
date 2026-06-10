# Création de persona guidée (wizard) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un mode « création guidée » de persona (wizard texte 5 questions) qui génère un persona complet via l'IA, présenté dans le modal manuel pré-rempli pour validation.

**Architecture :** Tout dans `buddy/www/index.html` (app single-file Capacitor). Une feuille de choix (manuel/guidé) sur « + Nuevo », un modal wizard à 5 étapes, mapping déterministe pour les champs structurés (voix/greeting/créativité) + un seul appel `chatCompletion` pour le texte créatif (nom/description/prompt). Réutilise le modal `#personaModal` existant pour l'aperçu éditable.

**Tech Stack :** HTML/CSS/JS vanilla, Capacitor, helper `chatCompletion()` existant, système i18n `TRANSLATIONS`/`t()` existant.

**Vérification (pas de framework de test) :** après chaque tâche → `npx cap sync android` + build n'est PAS requis à chaque étape ; la vérification de parsing JS se fait via CDP (`typeof fn === 'function'`). Build APK + test manuel uniquement à la tâche finale. Référence CDP : section « Comandos » de `CLAUDE.md`.

---

## Repères dans le fichier (lignes approximatives, à reconfirmer avant édition)

- `newPersonaBtn` listener : `~5074` — `document.getElementById('newPersonaBtn').addEventListener('click', () => openPersonaModal());`
- `personaModal` HTML : `~2811`
- `openPersonaModal(persona)` : `~4990`
- `updatePersonaVoiceList(keepValue)` : `~4973` ; `getProviderForModel()` + `getRealtimeModel()` utilisés dedans ; `VOICES` : `~4048`
- `TRANSLATIONS` blocs `es`/`en`/`fr` : clés PIN/sécurité vers `~3190`/`~3290`/`~3390` (point d'insertion des clés wizard)
- `chatCompletion({systemPrompt,userPrompt,temperature,maxTokens})` : `~4134`
- `hasAnyApiKey()` : utilisé `~5256`
- `customAlert` / `customConfirm` : `~3788` / `~3825`
- `t(key)` : fonction de traduction existante (recherche `function t(`)
- `LANG` : variable de langue courante

---

## Task 1: Clés i18n du wizard (ES/EN/FR)

**Files:**
- Modify: `buddy/www/index.html` (3 blocs `TRANSLATIONS`)

- [ ] **Step 1: Repérer la fin du bloc de clés sécurité dans chaque langue**

Chercher `pin_security:` dans chaque bloc (`es`, `en`, `fr`). On insère les clés wizard juste après la ligne `pin_locked:` correspondante (ou tout endroit cohérent du même objet de langue).

- [ ] **Step 2: Ajouter les clés dans le bloc `es`**

Insérer après `pin_locked: 'Demasiados intentos. Espera {s}s',` :

```javascript
            // Persona wizard
            wiz_choice_title: 'Crear un persona',
            wiz_guided: '✨ Creación guiada',
            wiz_guided_sub: 'Responde unas preguntas, la IA lo crea',
            wiz_manual: '⚙️ Configuración manual',
            wiz_manual_sub: 'Controla todos los campos',
            wiz_need_key: 'Configura primero una clave API para la creación guiada.',
            wiz_step: 'Paso {n} de 5',
            wiz_back: 'Atrás',
            wiz_next: 'Siguiente',
            wiz_create: '✨ Crear el persona',
            wiz_generating: 'Creando tu persona…',
            wiz_q1_title: '¿De qué quieres hablar?',
            wiz_q1_sub: '¿Para qué te servirá este persona?',
            wiz_q1_ph: 'Ej: un coach de bienestar que me ayude a dormir mejor',
            wiz_q2_title: '¿Qué tono?',
            wiz_q3_title: '¿Cómo se dirige a ti?',
            wiz_q3_tu: 'Informal (tú)',
            wiz_q3_vous: 'Formal (usted)',
            wiz_q3_who: '¿Quién empieza la conversación?',
            wiz_q3_persona: 'El persona saluda primero',
            wiz_q3_user: 'Yo empiezo',
            wiz_q4_title: 'Dale un nombre',
            wiz_q4_ph: 'Ej: Luna',
            wiz_q4_suggest: '✨ Propón uno',
            wiz_q5_title: 'Estilo de respuestas',
            wiz_err: 'Error al generar. Reintenta o continúa en manual.',
            wiz_retry: 'Reintentar',
            wiz_manual_continue: 'Continuar en manual',
            wiz_banner: '✨ Persona generado — revisa y ajusta antes de guardar',
            tone_chaleureux: 'Cálido y cercano', tone_pro: 'Profesional y directo', tone_fun: 'Divertido y enérgico', tone_calme: 'Tranquilo y sereno', tone_expert: 'Experto serio',
            crea_precise: 'Preciso', crea_balanced: 'Equilibrado', crea_creative: 'Creativo', crea_wild: 'Fantasioso',
```

- [ ] **Step 3: Ajouter les clés dans le bloc `en`**

Insérer après `pin_locked: 'Too many attempts. Wait {s}s',` :

```javascript
            // Persona wizard
            wiz_choice_title: 'Create a persona',
            wiz_guided: '✨ Guided creation',
            wiz_guided_sub: 'Answer a few questions, AI builds it',
            wiz_manual: '⚙️ Manual setup',
            wiz_manual_sub: 'Control every field',
            wiz_need_key: 'Set up an API key first for guided creation.',
            wiz_step: 'Step {n} of 5',
            wiz_back: 'Back',
            wiz_next: 'Next',
            wiz_create: '✨ Create the persona',
            wiz_generating: 'Creating your persona…',
            wiz_q1_title: 'What do you want to talk about?',
            wiz_q1_sub: 'What will this persona help you with?',
            wiz_q1_ph: 'E.g. a wellness coach to help me sleep better',
            wiz_q2_title: 'Which tone?',
            wiz_q3_title: 'How does it address you?',
            wiz_q3_tu: 'Casual',
            wiz_q3_vous: 'Formal',
            wiz_q3_who: 'Who starts the conversation?',
            wiz_q3_persona: 'The persona greets first',
            wiz_q3_user: 'I start',
            wiz_q4_title: 'Give it a name',
            wiz_q4_ph: 'E.g. Luna',
            wiz_q4_suggest: '✨ Suggest one',
            wiz_q5_title: 'Response style',
            wiz_err: 'Generation failed. Retry or continue manually.',
            wiz_retry: 'Retry',
            wiz_manual_continue: 'Continue manually',
            wiz_banner: '✨ Persona generated — review and adjust before saving',
            tone_chaleureux: 'Warm & caring', tone_pro: 'Professional & direct', tone_fun: 'Fun & energetic', tone_calme: 'Calm & composed', tone_expert: 'Serious expert',
            crea_precise: 'Precise', crea_balanced: 'Balanced', crea_creative: 'Creative', crea_wild: 'Whimsical',
```

- [ ] **Step 4: Ajouter les clés dans le bloc `fr`**

Insérer après `pin_locked: 'Trop de tentatives. Attends {s}s',` :

```javascript
            // Persona wizard
            wiz_choice_title: 'Créer un persona',
            wiz_guided: '✨ Création guidée',
            wiz_guided_sub: 'Réponds à quelques questions, l\'IA le crée',
            wiz_manual: '⚙️ Configuration manuelle',
            wiz_manual_sub: 'Contrôle tous les champs',
            wiz_need_key: 'Configure d\'abord une clé API pour la création guidée.',
            wiz_step: 'Étape {n} sur 5',
            wiz_back: 'Précédent',
            wiz_next: 'Suivant',
            wiz_create: '✨ Créer le persona',
            wiz_generating: 'Création de ton persona…',
            wiz_q1_title: 'De quoi veux-tu parler ?',
            wiz_q1_sub: 'À quoi va te servir ce persona ?',
            wiz_q1_ph: 'Ex : un coach bien-être pour m\'aider à mieux dormir',
            wiz_q2_title: 'Quel ton ?',
            wiz_q3_title: 'Comment il s\'adresse à toi ?',
            wiz_q3_tu: 'Tutoiement',
            wiz_q3_vous: 'Vouvoiement',
            wiz_q3_who: 'Qui commence la conversation ?',
            wiz_q3_persona: 'Le persona salue en premier',
            wiz_q3_user: 'Je commence',
            wiz_q4_title: 'Donne-lui un nom',
            wiz_q4_ph: 'Ex : Luna',
            wiz_q4_suggest: '✨ Propose-m\'en un',
            wiz_q5_title: 'Style de réponses',
            wiz_err: 'Échec de la génération. Réessaie ou continue en manuel.',
            wiz_retry: 'Réessayer',
            wiz_manual_continue: 'Continuer en manuel',
            wiz_banner: '✨ Persona généré — vérifie et ajuste avant de sauvegarder',
            tone_chaleureux: 'Chaleureux & bienveillant', tone_pro: 'Professionnel & direct', tone_fun: 'Fun & énergique', tone_calme: 'Calme & posé', tone_expert: 'Expert sérieux',
            crea_precise: 'Précis', crea_balanced: 'Équilibré', crea_creative: 'Créatif', crea_wild: 'Fantaisiste',
```

- [ ] **Step 5: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(persona): i18n strings for guided wizard (es/en/fr)"
```

---

## Task 2: Helpers — mapping voix + données du wizard

**Files:**
- Modify: `buddy/www/index.html` — insérer juste APRÈS `updatePersonaVoiceList` (`~4988`, après sa `}` fermante)

- [ ] **Step 1: Ajouter le mapping ton→voix et l'état du wizard**

```javascript
    // ════════════════════════════════════════════════
    //  WIZARD DE CRÉATION DE PERSONA
    // ════════════════════════════════════════════════

    // Mapping ton → voix, par fournisseur. Repli géré par updatePersonaVoiceList.
    const WIZARD_VOICE_MAP = {
        openai:   { chaleureux:'coral', pro:'alloy', fun:'shimmer', calme:'sage',  expert:'echo' },
        gemini:   { chaleureux:'Fenrir', pro:'Kore', fun:'Zephyr',  calme:'Leda',  expert:'Charon' },
        ultravox: { chaleureux:'Jessica', pro:'Tanya', fun:'Jessica', calme:'Tanya', expert:'David' }
    };

    function wizardToneToVoice(tone) {
        const provider = getProviderForModel(getRealtimeModel());
        const table = WIZARD_VOICE_MAP[provider] || WIZARD_VOICE_MAP.openai;
        return table[tone] || table.chaleureux;
    }

    // État courant du wizard (réponses + index d'étape)
    let wizardStep = 0;
    let wizardData = { topic:'', tone:'chaleureux', formal:false, who:'persona', name:'', creativity:'balanced' };

    function resetWizardData() {
        wizardStep = 0;
        wizardData = { topic:'', tone:'chaleureux', formal:false, who:'persona', name:'', creativity:'balanced' };
    }
```

- [ ] **Step 2: Vérifier le parsing via CDP (après sync)**

Après avoir terminé la tâche, à la tâche finale, on vérifiera `typeof wizardToneToVoice === 'function'`. Ici, simple relecture : la fonction référence `getProviderForModel` et `getRealtimeModel` qui existent déjà.

- [ ] **Step 3: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(persona): wizard voice mapping + state helpers"
```

---

## Task 3: Feuille de choix manuel/guidé + garde clé API

**Files:**
- Modify: `buddy/www/index.html` — listener `newPersonaBtn` (`~5074`) + ajout fonction `openPersonaChoiceSheet`

- [ ] **Step 1: Remplacer le listener du bouton « + Nuevo »**

Remplacer :
```javascript
    document.getElementById('newPersonaBtn').addEventListener('click', () => openPersonaModal());
```
par :
```javascript
    document.getElementById('newPersonaBtn').addEventListener('click', () => openPersonaChoiceSheet());
```

- [ ] **Step 2: Ajouter `openPersonaChoiceSheet()` (juste après `resetWizardData`)**

```javascript
    function openPersonaChoiceSheet() {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay'; // capté par le backButton existant
        overlay.innerHTML = `<div class="dialog-box" style="text-align:left">
            <div class="dialog-title" style="text-align:center">${t('wiz_choice_title')}</div>
            <button id="_pcGuided" class="config-screen-btn" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:56px;margin-bottom:10px">
                <span style="font-weight:700">${t('wiz_guided')}</span>
                <span style="font-size:0.78rem;opacity:0.7">${t('wiz_guided_sub')}</span>
            </button>
            <button id="_pcManual" class="config-screen-btn" style="display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-height:56px">
                <span style="font-weight:700">${t('wiz_manual')}</span>
                <span style="font-size:0.78rem;opacity:0.7">${t('wiz_manual_sub')}</span>
            </button>
            <div class="dialog-buttons" style="margin-top:14px">
                <button class="dialog-btn" id="_pcCancel">${t('btn_cancel')}</button>
            </div>
        </div>`;
        document.body.appendChild(overlay);
        const close = () => overlay.remove();
        overlay.querySelector('#_pcCancel').addEventListener('click', close);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
        overlay.querySelector('#_pcManual').addEventListener('click', () => { close(); openPersonaModal(); });
        overlay.querySelector('#_pcGuided').addEventListener('click', async () => {
            if (!await hasAnyApiKey()) {
                close();
                customAlert(t('wiz_need_key'), { title: t('wiz_choice_title'), icon: '&#128273;' });
                return;
            }
            close();
            openPersonaWizard();
        });
    }
```

- [ ] **Step 3: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(persona): entry choice sheet (guided vs manual) with API key gate"
```

---

## Task 4: Modal wizard — HTML + CSS

**Files:**
- Modify: `buddy/www/index.html` — HTML après le bloc `#personaModal` (`~2942`, après sa `</div>` de `.modal-overlay`) ; CSS dans le `<style>` (près des styles `.modal`)

- [ ] **Step 1: Ajouter le HTML du modal wizard (après la fermeture de `#personaModal`)**

```html
    <!-- ════════ MODAL : WIZARD CRÉATION PERSONA ════════ -->
    <div class="modal-overlay" id="personaWizardModal">
        <div class="modal" style="width:600px;position:relative">
            <button class="modal-close" id="wizCloseBtn">&times;</button>
            <div id="wizProgress" style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:6px"></div>

            <!-- Étape 1 : sujet -->
            <div class="wiz-step" data-step="0">
                <h2 id="wizQ1Title">De quoi veux-tu parler ?</h2>
                <div class="hint" id="wizQ1Sub"></div>
                <textarea id="wizTopic" style="min-height:90px" maxlength="400"></textarea>
                <div class="wiz-chips" id="wizTopicChips"></div>
            </div>

            <!-- Étape 2 : ton -->
            <div class="wiz-step" data-step="1" style="display:none">
                <h2 id="wizQ2Title">Quel ton ?</h2>
                <div class="wiz-chips" id="wizToneChips"></div>
            </div>

            <!-- Étape 3 : adresse + qui commence -->
            <div class="wiz-step" data-step="2" style="display:none">
                <h2 id="wizQ3Title">Comment il s'adresse à toi ?</h2>
                <div class="wiz-chips" id="wizFormalChips"></div>
                <div class="hint" id="wizQ3Who" style="margin-top:16px"></div>
                <div class="wiz-chips" id="wizWhoChips"></div>
            </div>

            <!-- Étape 4 : nom -->
            <div class="wiz-step" data-step="3" style="display:none">
                <h2 id="wizQ4Title">Donne-lui un nom</h2>
                <input type="text" id="wizName" maxlength="40">
                <button class="btn-small" id="wizSuggestName" style="margin-top:8px"></button>
            </div>

            <!-- Étape 5 : style -->
            <div class="wiz-step" data-step="4" style="display:none">
                <h2 id="wizQ5Title">Style de réponses</h2>
                <div class="wiz-chips" id="wizCreaChips"></div>
            </div>

            <div id="wizError" style="color:var(--danger);font-size:0.85rem;min-height:18px;margin-top:10px"></div>

            <div class="modal-buttons">
                <button class="btn-cancel" id="wizBackBtn"></button>
                <button class="btn-save" id="wizNextBtn"></button>
            </div>
        </div>
    </div>
```

- [ ] **Step 2: Ajouter le CSS (dans le `<style>`, près des autres styles de modal)**

```css
        .wiz-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .wiz-chip {
            padding: 9px 14px; border-radius: 20px; cursor: pointer;
            background: var(--bg-hover); border: 1px solid var(--border);
            color: var(--text-primary); font-size: 0.85rem; min-height: 40px;
            display: inline-flex; align-items: center;
        }
        .wiz-chip.selected {
            background: linear-gradient(135deg, var(--accent), var(--accent2, #ec4899));
            border-color: transparent; color: #fff; font-weight: 600;
        }
```

- [ ] **Step 3: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(persona): wizard modal markup + chip styles"
```

---

## Task 5: Navigation du wizard (état, étapes, puces)

**Files:**
- Modify: `buddy/www/index.html` — ajouter après `openPersonaChoiceSheet`

- [ ] **Step 1: Ajouter `openPersonaWizard`, le rendu d'étape et les écouteurs**

```javascript
    const WIZ_TONES = ['chaleureux','pro','fun','calme','expert'];
    const WIZ_CREAS = ['precise','balanced','creative','wild'];
    const WIZ_TOPIC_SUGGESTIONS = {
        fr: ['Coach bien-être','Tuteur de langue','Assistant code','Confident','Brainstorming','Cuisine'],
        en: ['Wellness coach','Language tutor','Coding assistant','Confidant','Brainstorming','Cooking'],
        es: ['Coach de bienestar','Tutor de idiomas','Asistente de código','Confidente','Lluvia de ideas','Cocina']
    };

    function openPersonaWizard() {
        resetWizardData();
        // Titres/sous-titres i18n
        document.getElementById('wizQ1Title').textContent = t('wiz_q1_title');
        document.getElementById('wizQ1Sub').textContent = t('wiz_q1_sub');
        document.getElementById('wizTopic').value = '';
        document.getElementById('wizTopic').placeholder = t('wiz_q1_ph');
        document.getElementById('wizQ2Title').textContent = t('wiz_q2_title');
        document.getElementById('wizQ3Title').textContent = t('wiz_q3_title');
        document.getElementById('wizQ3Who').textContent = t('wiz_q3_who');
        document.getElementById('wizQ4Title').textContent = t('wiz_q4_title');
        document.getElementById('wizName').value = '';
        document.getElementById('wizName').placeholder = t('wiz_q4_ph');
        document.getElementById('wizSuggestName').textContent = t('wiz_q4_suggest');
        document.getElementById('wizQ5Title').textContent = t('wiz_q5_title');
        document.getElementById('wizError').textContent = '';

        // Puces sujet (suggestions)
        const sugg = WIZ_TOPIC_SUGGESTIONS[LANG] || WIZ_TOPIC_SUGGESTIONS.fr;
        document.getElementById('wizTopicChips').innerHTML = sugg.map(s =>
            `<span class="wiz-chip" data-topic="${s}">${s}</span>`).join('');
        document.querySelectorAll('#wizTopicChips .wiz-chip').forEach(c =>
            c.addEventListener('click', () => {
                const ta = document.getElementById('wizTopic');
                ta.value = ta.value ? ta.value + ', ' + c.dataset.topic : c.dataset.topic;
                wizardData.topic = ta.value;
                updateWizNav();
            }));

        // Puces ton
        document.getElementById('wizToneChips').innerHTML = WIZ_TONES.map(tn =>
            `<span class="wiz-chip" data-tone="${tn}">${t('tone_'+tn)}</span>`).join('');
        bindChoiceChips('#wizToneChips', 'tone', 'tone');

        // Puces tutoie/vouvoie
        document.getElementById('wizFormalChips').innerHTML =
            `<span class="wiz-chip" data-formal="false">${t('wiz_q3_tu')}</span>` +
            `<span class="wiz-chip" data-formal="true">${t('wiz_q3_vous')}</span>`;
        document.querySelectorAll('#wizFormalChips .wiz-chip').forEach(c =>
            c.addEventListener('click', () => {
                wizardData.formal = c.dataset.formal === 'true';
                markSelected('#wizFormalChips', c);
            }));

        // Puces qui commence
        document.getElementById('wizWhoChips').innerHTML =
            `<span class="wiz-chip" data-who="persona">${t('wiz_q3_persona')}</span>` +
            `<span class="wiz-chip" data-who="user">${t('wiz_q3_user')}</span>`;
        document.querySelectorAll('#wizWhoChips .wiz-chip').forEach(c =>
            c.addEventListener('click', () => {
                wizardData.who = c.dataset.who;
                markSelected('#wizWhoChips', c);
            }));

        // Puces créativité
        document.getElementById('wizCreaChips').innerHTML = WIZ_CREAS.map(cr =>
            `<span class="wiz-chip" data-crea="${cr}">${t('crea_'+cr)}</span>`).join('');
        bindChoiceChips('#wizCreaChips', 'crea', 'creativity');

        // Pré-sélections par défaut
        preselect('#wizToneChips', 'tone', wizardData.tone);
        preselect('#wizFormalChips', 'formal', String(wizardData.formal));
        preselect('#wizWhoChips', 'who', wizardData.who);
        preselect('#wizCreaChips', 'crea', wizardData.creativity);

        renderWizStep();
        document.getElementById('personaWizardModal').classList.add('active');
    }

    function bindChoiceChips(sel, attr, field) {
        document.querySelectorAll(sel + ' .wiz-chip').forEach(c =>
            c.addEventListener('click', () => {
                wizardData[field] = c.dataset[attr];
                markSelected(sel, c);
            }));
    }
    function markSelected(sel, chip) {
        document.querySelectorAll(sel + ' .wiz-chip').forEach(x => x.classList.remove('selected'));
        chip.classList.add('selected');
    }
    function preselect(sel, attr, value) {
        document.querySelectorAll(sel + ' .wiz-chip').forEach(c => {
            if (c.dataset[attr] === value) c.classList.add('selected');
        });
    }

    function renderWizStep() {
        document.querySelectorAll('#personaWizardModal .wiz-step').forEach(s => {
            s.style.display = parseInt(s.dataset.step, 10) === wizardStep ? '' : 'none';
        });
        document.getElementById('wizProgress').textContent = t('wiz_step').replace('{n}', wizardStep + 1);
        document.getElementById('wizError').textContent = '';
        const backBtn = document.getElementById('wizBackBtn');
        backBtn.textContent = t('wiz_back');
        backBtn.style.visibility = wizardStep === 0 ? 'hidden' : 'visible';
        updateWizNav();
    }

    function updateWizNav() {
        const nextBtn = document.getElementById('wizNextBtn');
        if (wizardStep === 4) {
            nextBtn.textContent = t('wiz_create');
        } else {
            nextBtn.textContent = t('wiz_next');
        }
        // Q1 obligatoire
        nextBtn.disabled = (wizardStep === 0 && !document.getElementById('wizTopic').value.trim());
        nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
    }

    function closePersonaWizard() {
        document.getElementById('personaWizardModal').classList.remove('active');
    }
```

- [ ] **Step 2: Câbler les boutons de navigation (après `closePersonaWizard`)**

```javascript
    // Élément statique → lier une seule fois (évite les écouteurs dupliqués)
    document.getElementById('wizTopic').addEventListener('input', (e) => {
        wizardData.topic = e.target.value; updateWizNav();
    });
    document.getElementById('wizCloseBtn').addEventListener('click', closePersonaWizard);
    document.getElementById('wizBackBtn').addEventListener('click', () => {
        if (wizardStep > 0) { wizardStep--; renderWizStep(); }
    });
    document.getElementById('wizNextBtn').addEventListener('click', () => {
        if (document.getElementById('wizNextBtn').disabled) return;
        wizardData.topic = document.getElementById('wizTopic').value.trim();
        wizardData.name = document.getElementById('wizName').value.trim();
        if (wizardStep < 4) { wizardStep++; renderWizStep(); }
        else { generatePersonaFromWizard(); }
    });
    document.getElementById('wizSuggestName').addEventListener('click', () => {
        // Laisser vide → l'IA proposera un nom à la génération
        document.getElementById('wizName').value = '';
        wizardData.name = '';
        document.getElementById('wizSuggestName').textContent = '✓ ' + t('wiz_q4_suggest');
    });
```

- [ ] **Step 3: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(persona): wizard navigation, chips and step state"
```

---

## Task 6: Génération IA + pré-remplissage du modal

**Files:**
- Modify: `buddy/www/index.html` — ajouter après les écouteurs de navigation (Task 5) ; bandeau dans `#personaModal` HTML (`~2814`, juste après `<h2 id="personaModalTitle">`)

- [ ] **Step 1: Ajouter le bandeau « persona généré » dans `#personaModal`**

Juste après la ligne `<h2 id="personaModalTitle">Nouveau persona</h2>` :
```html
            <div id="wizardBanner" style="display:none;background:rgba(139,92,246,0.15);border:1px solid var(--accent);border-radius:10px;padding:10px 12px;margin-bottom:12px;font-size:0.85rem"></div>
```

- [ ] **Step 2: Masquer le bandeau à chaque ouverture du modal**

Dans `openPersonaModal` (`~4990`), au début du corps (après `editingPersonaId = ...`), ajouter :
```javascript
        var _wb = document.getElementById('wizardBanner'); if (_wb) _wb.style.display = 'none';
```

- [ ] **Step 3: Ajouter `generatePersonaFromWizard()` et `applyWizardResult()`**

```javascript
    function wizParseJson(raw) {
        try { return JSON.parse(raw); } catch (e) {}
        const m = raw && raw.match(/\{[\s\S]*\}/);
        if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
        return null;
    }

    async function generatePersonaFromWizard() {
        const langName = LANG === 'es' ? 'español' : LANG === 'en' ? 'english' : 'français';
        const d = wizardData;
        const nextBtn = document.getElementById('wizNextBtn');
        const errEl = document.getElementById('wizError');
        nextBtn.disabled = true; nextBtn.style.opacity = '0.5';
        nextBtn.textContent = t('wiz_generating');
        errEl.textContent = '';

        const toneLabel = t('tone_' + d.tone);
        const nameRule = d.name
            ? `utilise impérativement le nom "${d.name}"`
            : `invente un nom court, mémorable et adapté au rôle`;
        const addressRule = d.formal ? 'vouvoie l\'utilisateur' : 'tutoie l\'utilisateur';

        const systemPrompt = `Tu es un expert en conception de personas pour un assistant vocal IA temps réel.
À partir des informations fournies, génère un persona complet.
Réponds UNIQUEMENT avec un JSON valide, sans aucun texte avant ou après, au format EXACT :
{"name":"<nom>","description":"<une phrase>","prompt":"<system prompt markdown>"}

Pour "prompt" : structure markdown avec titres # — Identité, Personnalité (ton, humour, énergie, expressivité vocale), Langue, Règles de conversation orale, Outils disponibles. Conversation VOCALE : phrases courtes, pas de listes ni markdown dans les réponses parlées, langage naturel. Le persona ${addressRule}. Section Outils : recherche web si utile, météo, date/heure. Rédige le prompt en ${langName}.
Pour "name" : ${nameRule}.
Pour "description" : une seule phrase en ${langName}.`;

        const userPrompt = `Sujet / rôle : ${d.topic}
Ton souhaité : ${toneLabel}
Adresse : ${d.formal ? 'vouvoiement' : 'tutoiement'}
Qui commence : ${d.who === 'persona' ? 'le persona salue en premier' : 'l\'utilisateur commence'}
${d.name ? 'Nom imposé : ' + d.name : 'Nom : à proposer'}`;

        try {
            const raw = await chatCompletion({ systemPrompt, userPrompt, temperature: 0.7, maxTokens: 1500 });
            let parsed = wizParseJson(raw);
            if (!parsed || !parsed.prompt) {
                // Dégradé : toute la réponse devient le prompt
                parsed = {
                    name: d.name || (d.topic.split(/[ ,]/)[0] || 'Assistant'),
                    description: d.topic.slice(0, 80),
                    prompt: (raw || '').trim()
                };
            }
            if (d.name) parsed.name = d.name; // le nom utilisateur prime
            applyWizardResult(parsed);
        } catch (err) {
            errEl.innerHTML = t('wiz_err') +
                `<div style="margin-top:8px;display:flex;gap:8px">
                    <button class="btn-small" id="wizRetryBtn">${t('wiz_retry')}</button>
                    <button class="btn-small" id="wizManualBtn">${t('wiz_manual_continue')}</button>
                 </div>`;
            document.getElementById('wizRetryBtn').addEventListener('click', generatePersonaFromWizard);
            document.getElementById('wizManualBtn').addEventListener('click', () => {
                closePersonaWizard();
                openPersonaModal();
                document.getElementById('pDescription').value = wizardData.topic;
                document.getElementById('pCreativity').value = wizardData.creativity;
                document.getElementById('pGreeting').value = wizardData.who;
                updatePersonaVoiceList(wizardToneToVoice(wizardData.tone));
            });
        } finally {
            nextBtn.disabled = false; nextBtn.style.opacity = '1';
            nextBtn.textContent = t('wiz_create');
        }
    }

    function applyWizardResult(p) {
        closePersonaWizard();
        openPersonaModal(); // mode création (editingPersonaId = null)
        document.getElementById('pName').value = p.name || '';
        document.getElementById('pDescription').value = p.description || '';
        document.getElementById('pPrompt').value = p.prompt || '';
        document.getElementById('pCreativity').value = wizardData.creativity;
        document.getElementById('pReactivity').value = 'balanced';
        document.getElementById('pGreeting').value = wizardData.who;
        updatePersonaVoiceList(wizardToneToVoice(wizardData.tone));
        const banner = document.getElementById('wizardBanner');
        banner.textContent = t('wiz_banner');
        banner.style.display = '';
    }
```

- [ ] **Step 4: Commit**

```bash
git add buddy/www/index.html
git commit -m "feat(persona): wizard AI generation, robust JSON parse, prefill modal"
```

---

## Task 7: Build, sync et vérification (CDP + manuel)

**Files:** aucun changement de code — build/test uniquement.

- [ ] **Step 1: Sync web → Android**

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; $env:ANDROID_HOME = "C:\Users\xavie\AppData\Local\Android\Sdk"
cd C:\Users\xavie\OneDrive\Documentos\Cerrador\buddy
npx cap sync android
```
Attendu : `Sync finished`.

- [ ] **Step 2: Build + install APK debug**

```powershell
cd C:\Users\xavie\OneDrive\Documentos\Cerrador\buddy\android
.\gradlew assembleDebug
& "$env:ANDROID_HOME\platform-tools\adb.exe" install -r app\build\outputs\apk\debug\app-debug.apk
```
Attendu : `BUILD SUCCESSFUL` puis `Success`.

- [ ] **Step 3: Lancer + vérifier le parsing JS via CDP**

Lancer l'app, forward CDP (cf. CLAUDE.md « Comandos »), puis évaluer :
```javascript
JSON.stringify({
  choice: typeof openPersonaChoiceSheet,
  wizard: typeof openPersonaWizard,
  gen: typeof generatePersonaFromWizard,
  voice: typeof wizardToneToVoice,
  apply: typeof applyWizardResult
})
```
Attendu : toutes les valeurs = `"function"` (preuve que le script parse sans erreur de syntaxe).

- [ ] **Step 4: Test manuel sur le Xiaomi**

Checklist :
1. « + Nuevo » → la feuille de choix s'affiche (guidé / manuel / annuler).
2. « Configuration manuelle » → ouvre le modal vide comme avant (non régressé).
3. « Création guidée » sans clé API → alerte « configure une clé » (tester en retirant les clés, optionnel).
4. Parcours guidé : saisir un sujet (le bouton Suivant s'active), choisir ton/adresse/qui commence/style, étape nom → laisser vide ou saisir.
5. « Créer le persona » → spinner « Création… » → le modal s'ouvre pré-rempli (nom, description, prompt non vides ; voix cohérente avec le ton ; bandeau ✨ visible).
6. Sauvegarder → le persona apparaît dans la liste et est utilisable en conversation.
7. Dégradé : couper le réseau avant « Créer » → message d'erreur + « Continuer en manuel » ouvre le modal avec sujet/voix/réglages pré-remplis.
8. Bouton retour Android ferme le wizard et la feuille de choix.

- [ ] **Step 5: Commit (si ajustements)**

```bash
git add buddy/www/index.html buddy/android
git commit -m "chore(persona): sync wizard to android + verified on device"
```

---

## Notes d'implémentation

- **DRY :** réutilise `chatCompletion`, `openPersonaModal`, `updatePersonaVoiceList`, `getProviderForModel`, `hasAnyApiKey`, `t()`, `customAlert`.
- **YAGNI :** pas de génération d'image auto, pas d'interview vocale, pas d'édition via wizard.
- **Cohérence des noms :** `wizardData` (objet d'état), `wizardStep` (index), `wizardToneToVoice`, `openPersonaWizard`, `generatePersonaFromWizard`, `applyWizardResult`, `openPersonaChoiceSheet`, `wizParseJson` — utilisés de façon identique dans toutes les tâches.
- **backButton :** le wizard est un `.modal-overlay.active` (capté par le handler existant) ; la feuille de choix est un `.dialog-overlay` (capté aussi). Aucune modif du handler nécessaire.
