# Persona Adaptive Profile — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each persona builds its own user profile (domain-specific facts, goals, preferences) stored in `buddy_pprofile_{personaId}`, updated post-session by LLM, injected into the system prompt alongside the global profile.

**Architecture:** Mirror of the per-persona memory system (`buddy_pmem_`) added in the previous session. New CRUD functions → new `updatePersonaProfile()` LLM updater → inject in `buildFullInstructions()` → update Config UI to show active persona profile → include in backup/restore.

**Tech Stack:** Vanilla JS, localStorage, Groq API (llama-3.1-8b-instant), `chatCompletion()` fallback, Capacitor Android WebView. Single file: `buddy/www/index.html`.

---

## Files

- **Modify:** `buddy/www/index.html` — all changes in one file, ~70 lines added, ~15 lines modified

---

### Task 1 — Constants + CRUD functions for persona profile

Add the constant and 5 helper functions right after the existing `getAllPersonaMemoryMap()` function (which ends with a `}` on its own line after the for-loop).

**Files:**
- Modify: `buddy/www/index.html`

- [ ] **Step 1: Locate insertion point**

Find this block (just after `getAllPersonaMemoryMap`):

```javascript
    // Per-persona memory functions
```

The new code goes right before the line `// ════════════════════════════════════════════════` that follows `getAllPersonaMemoryMap`.

- [ ] **Step 2: Add constant + CRUD functions**

Use Edit tool. Find:
```javascript
    const PROFILE_KEY = 'buddy_userProfile';
```

Replace with:
```javascript
    // ════════════════════════════════════════════════
    //  PROFIL PAR PERSONA
    // ════════════════════════════════════════════════

    const PERSONA_PROFILE_PREFIX = 'buddy_pprofile_';

    function getPersonaProfile(personaId) {
        if (!personaId) return null;
        try { return JSON.parse(localStorage.getItem(PERSONA_PROFILE_PREFIX + personaId)) || null; }
        catch { return null; }
    }

    function setPersonaProfile(profile, personaId) {
        if (!personaId || !profile) return;
        localStorage.setItem(PERSONA_PROFILE_PREFIX + personaId, JSON.stringify(profile));
    }

    function clearPersonaProfile(personaId) {
        if (!personaId) return;
        localStorage.removeItem(PERSONA_PROFILE_PREFIX + personaId);
    }

    function getAllPersonaProfileMap() {
        const map = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(PERSONA_PROFILE_PREFIX)) {
                const personaId = key.slice(PERSONA_PROFILE_PREFIX.length);
                try { map[personaId] = JSON.parse(localStorage.getItem(key)) || {}; } catch { /* skip */ }
            }
        }
        return map;
    }

    function personaProfileHasContent(p) {
        if (!p) return false;
        return !!(p.summary || p.facts?.length || p.goals?.length || p.preferences);
    }

    const PROFILE_KEY = 'buddy_userProfile';
```

- [ ] **Step 3: Verify — search for both constants**

Run in PowerShell:
```powershell
Select-String -Path "buddy\www\index.html" -Pattern "PERSONA_PROFILE_PREFIX|PROFILE_KEY" | Select-Object -First 5
```
Expected: `PERSONA_PROFILE_PREFIX` appears once as `const`, `PROFILE_KEY` appears once.

- [ ] **Step 4: Commit**
```
git add buddy/www/index.html
git commit -m "feat: add PERSONA_PROFILE_PREFIX + CRUD helpers for per-persona profile"
```

---

### Task 2 — `updatePersonaProfile(persona, transcript)`

LLM function that updates the persona-specific profile post-session. Mirror of `updateUserProfile()` but with a persona-aware prompt.

**Files:**
- Modify: `buddy/www/index.html`

- [ ] **Step 1: Locate insertion point**

Find the end of the `updateUserProfile()` function — it ends with:
```javascript
        console.warn('[Zova Profile] Failed:', e.message);
        }
    }
```
...followed by the `buildFullInstructions` section divider.

- [ ] **Step 2: Insert the new function after `updateUserProfile()`**

Find:
```javascript
    // ════════════════════════════════════════════════

    function buildFullInstructions(persona) {
```

Replace with:
```javascript
    async function updatePersonaProfile(persona, transcriptText) {
        if (!transcriptText.trim() || !persona?.id) return;
        const lineCount = transcriptText.split('\n').filter(l => l.trim()).length;
        if (lineCount < MIN_MSGS_FOR_MEMORY) return;

        const today = new Date().toISOString().slice(0, 10);
        const current = getPersonaProfile(persona.id) || {};
        const profileJson = JSON.stringify(current, null, 2);
        const personaDesc = persona.description ? `Description : ${persona.description}` : '';

        const systemPrompt = `Tu es un assistant qui maintient le profil utilisateur du point de vue de ${persona.name}.
${personaDesc}

Profil actuel pour ce persona :
${profileJson}

Règles STRICTES :
- Ne capture que les infos pertinentes pour le rôle de ${persona.name}
- max 6 éléments dans "facts", max 3 dans "goals"
- "summary" = 1 phrase résumant ce que sait ${persona.name} sur l'utilisateur
- "preferences" = 1 phrase sur le style attendu dans ce contexte
- Conserve les infos pertinentes existantes, remplace les obsolètes
- Met "lastUpdated": "${today}"
- Réponds UNIQUEMENT avec le JSON, sans markdown ni commentaire
- Champs obligatoires : summary, facts[], goals[], preferences, lastUpdated`;

        try {
            let updated = null;
            const groqKey = await getGroqApiKey();
            if (groqKey) {
                const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: getModelMemory(),
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: transcriptText.slice(0, 3000) }
                        ],
                        max_tokens: 400,
                        temperature: 0.2
                    })
                });
                if (resp.ok) {
                    const d = await resp.json();
                    const raw = (d.choices?.[0]?.message?.content || '').trim();
                    const m = raw.match(/\{[\s\S]*\}/);
                    if (m) updated = JSON.parse(m[0]);
                }
            }
            if (!updated) {
                const raw = await chatCompletion({ systemPrompt, userPrompt: transcriptText.slice(0, 3000), temperature: 0.2, maxTokens: 400 });
                const m = raw.match(/\{[\s\S]*\}/);
                if (m) updated = JSON.parse(m[0]);
            }
            if (updated && typeof updated === 'object') {
                setPersonaProfile(updated, persona.id);
                updatePersonaProfileCount();
                console.log('[Zova PersonaProfile] Updated for', persona.name, ':', JSON.stringify(updated).slice(0, 80));
            }
        } catch(e) {
            console.warn('[Zova PersonaProfile] Failed:', e.message);
        }
    }

    // ════════════════════════════════════════════════

    function buildFullInstructions(persona) {
```

- [ ] **Step 3: Verify function exists**
```powershell
Select-String -Path "buddy\www\index.html" -Pattern "async function updatePersonaProfile"
```
Expected: 1 match.

- [ ] **Step 4: Commit**
```
git add buddy/www/index.html
git commit -m "feat: add updatePersonaProfile() — LLM post-session persona profile updater"
```

---

### Task 3 — Inject persona profile in `buildFullInstructions()`

After the global profile injection block, inject the persona-specific profile.

**Files:**
- Modify: `buddy/www/index.html`

- [ ] **Step 1: Locate the injection point**

Inside `buildFullInstructions()`, find the line just before `const userInfo = getUserInfo()`:

```javascript
        const userInfo = getUserInfo();
        if (userInfo.trim()) {
            fullInstructions += `\n\n# Informations sur l'utilisateur\nVoici ce que tu sais sur la personne avec qui tu parles. Utilise ces infos naturellement, sans les réciter :\n${userInfo}`;
        }
```

- [ ] **Step 2: Insert persona profile injection before userInfo block**

Find:
```javascript
        const userInfo = getUserInfo();
        if (userInfo.trim()) {
            fullInstructions += `\n\n# Informations sur l'utilisateur\nVoici ce que tu sais sur la personne avec qui tu parles. Utilise ces infos naturellement, sans les réciter :\n${userInfo}`;
        }
        const personaInfo = persona.personaInfo || '';
        if (personaInfo.trim()) {
            fullInstructions += `\n\n# Informations spécifiques que tu connais sur l'utilisateur\n${personaInfo}`;
        }
        return fullInstructions;
```

Replace with:
```javascript
        // Inject persona-specific user profile (domain-focused)
        const personaProf = persona?.id ? getPersonaProfile(persona.id) : null;
        if (personaProfileHasContent(personaProf)) {
            const lines = [];
            if (personaProf.summary) lines.push(`Résumé : ${personaProf.summary}`);
            if (personaProf.facts?.length) lines.push(`Ce que tu sais : ${personaProf.facts.join(' | ')}`);
            if (personaProf.goals?.length) lines.push(`Objectifs dans ce contexte : ${personaProf.goals.join(', ')}`);
            if (personaProf.preferences) lines.push(`Style attendu : ${personaProf.preferences}`);
            fullInstructions += `\n\n# Profil ${persona.name} de l'utilisateur\nCe que tu as appris sur cet utilisateur dans vos échanges. Utilise-le naturellement :\n${lines.join('\n')}`;
        }

        const userInfo = getUserInfo();
        if (userInfo.trim()) {
            fullInstructions += `\n\n# Informations sur l'utilisateur\nVoici ce que tu sais sur la personne avec qui tu parles. Utilise ces infos naturellement, sans les réciter :\n${userInfo}`;
        }
        const personaInfo = persona.personaInfo || '';
        if (personaInfo.trim()) {
            fullInstructions += `\n\n# Informations spécifiques que tu connais sur l'utilisateur\n${personaInfo}`;
        }
        return fullInstructions;
```

- [ ] **Step 3: Verify**
```powershell
Select-String -Path "buddy\www\index.html" -Pattern "Profil.*de l'utilisateur" | Select-Object LineNumber, Line
```
Expected: 2 matches — one for global profile (`# Profil de l'utilisateur`), one for persona profile (`# Profil ${persona.name} de l'utilisateur`).

- [ ] **Step 4: Commit**
```
git add buddy/www/index.html
git commit -m "feat: inject persona-specific profile in buildFullInstructions()"
```

---

### Task 4 — Call `updatePersonaProfile()` at session end

Add the parallel non-blocking call in `stopConversation()`.

**Files:**
- Modify: `buddy/www/index.html`

- [ ] **Step 1: Find the post-session calls block**

```javascript
        // Générer la mémoire épisodique + mettre à jour le profil utilisateur
        if (hadConversation && !isTranscripteurMode && activeModelId !== 'gpt-realtime-translate') {
            const persona = getPersonas().find(p => p.id === getActiveId());
            const transcriptText = getTranscriptText(false);
            generateMemory(persona, transcriptText);    // async, non-bloquant
            updateUserProfile(transcriptText);          // async, non-bloquant
        }
```

- [ ] **Step 2: Add `updatePersonaProfile()` call**

Find:
```javascript
        // Générer la mémoire épisodique + mettre à jour le profil utilisateur
        if (hadConversation && !isTranscripteurMode && activeModelId !== 'gpt-realtime-translate') {
            const persona = getPersonas().find(p => p.id === getActiveId());
            const transcriptText = getTranscriptText(false);
            generateMemory(persona, transcriptText);    // async, non-bloquant
            updateUserProfile(transcriptText);          // async, non-bloquant
        }
```

Replace with:
```javascript
        // Générer la mémoire épisodique + mettre à jour les profils utilisateur
        if (hadConversation && !isTranscripteurMode && activeModelId !== 'gpt-realtime-translate') {
            const persona = getPersonas().find(p => p.id === getActiveId());
            const transcriptText = getTranscriptText(false);
            generateMemory(persona, transcriptText);         // async, non-bloquant
            updateUserProfile(transcriptText);               // async, non-bloquant
            updatePersonaProfile(persona, transcriptText);   // async, non-bloquant — persona profile
        }
```

- [ ] **Step 3: Verify**
```powershell
Select-String -Path "buddy\www\index.html" -Pattern "updatePersonaProfile\(persona" | Select-Object LineNumber
```
Expected: 2 matches (definition + call site).

- [ ] **Step 4: Commit**
```
git add buddy/www/index.html
git commit -m "feat: call updatePersonaProfile() at session end alongside existing profile updates"
```

---

### Task 5 — Config UI updates

Update the "Profil utilisateur" section to: dynamic title, show persona profile count, view/clear persona profile, small link to access global profile.

**Files:**
- Modify: `buddy/www/index.html`

- [ ] **Step 1: Update HTML — dynamic title element**

Find:
```html
        <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">👤 <span data-i18n="config_section_profile">Profil utilisateur</span></div>
        <div id="profileCount" style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px"></div>
        <button class="config-screen-btn" id="viewProfileBtn">🪪 <span data-i18n="config_view_profile">Voir le profil</span></button>
        <button class="config-screen-btn" id="clearProfileBtn" style="color:var(--danger)">🗑️ <span data-i18n="config_clear_profile">Effacer le profil</span></button>
```

Replace with:
```html
        <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">👤 <span id="profileSectionTitle" data-i18n="config_section_profile">Profil utilisateur</span></div>
        <div id="profileCount" style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px"></div>
        <button class="config-screen-btn" id="viewProfileBtn">🪪 <span data-i18n="config_view_profile">Voir le profil</span></button>
        <button class="config-screen-btn" id="clearProfileBtn" style="color:var(--danger)">🗑️ <span data-i18n="config_clear_profile">Effacer le profil</span></button>
        <button id="viewGlobalProfileBtn" style="background:none;border:none;color:var(--text-muted);font-size:0.78rem;cursor:pointer;padding:4px 0;text-align:left;width:100%;">↓ <span id="viewGlobalProfileLabel">Voir / effacer le profil général</span></button>
```

- [ ] **Step 2: Update `updateProfileCount()` — show active persona profile count + dynamic title**

Find:
```javascript
    function updateProfileCount() {
        const p = getUserProfile();
        const el = document.getElementById('profileCount');
        if (!el) return;
        if (!profileHasContent(p)) {
            el.textContent = t('profile_none');
        } else {
            const facts = p.facts?.length || 0;
            const topics = p.topics?.length || 0;
            const updated = p.lastUpdated || '';
            el.textContent = t('profile_has').replace('{f}', facts).replace('{t}', topics) + (updated ? ' · ' + updated : '');
        }
    }
    updateProfileCount();
```

Replace with:
```javascript
    function updatePersonaProfileCount() {
        const activeId = getActiveId();
        const activePersona = activeId ? getPersonas().find(p => p.id === activeId) : null;
        const personaProf = activeId ? getPersonaProfile(activeId) : null;
        const el = document.getElementById('profileCount');
        const titleEl = document.getElementById('profileSectionTitle');
        if (titleEl && activePersona) {
            titleEl.textContent = `Profil ${activePersona.name}`;
            titleEl.removeAttribute('data-i18n');
        } else if (titleEl) {
            titleEl.textContent = t('config_section_profile');
            titleEl.setAttribute('data-i18n', 'config_section_profile');
        }
        if (!el) return;
        if (!personaProfileHasContent(personaProf)) {
            el.textContent = t('profile_none');
        } else {
            const facts = personaProf.facts?.length || 0;
            const updated = personaProf.lastUpdated || '';
            el.textContent = `${facts} info${facts > 1 ? 's' : ''}` + (updated ? ' · màj ' + updated : '');
        }
    }
    // Keep backward compat alias for existing calls in setLang/applyTheme
    function updateProfileCount() { updatePersonaProfileCount(); }
    updatePersonaProfileCount();
```

- [ ] **Step 3: Update `viewProfileBtn` listener — show persona profile**

Find:
```javascript
    document.getElementById('viewProfileBtn').addEventListener('click', () => {
        const p = getUserProfile();
        if (!profileHasContent(p)) {
            customAlert(t('profile_none'), { title: '👤 ' + t('config_section_profile'), icon: '👤' });
            return;
        }
        const lines = [];
        const nameL  = LANG === 'es' ? 'Nombre' : LANG === 'en' ? 'Name' : 'Nom';
        const langL  = LANG === 'es' ? 'Idiomas' : LANG === 'en' ? 'Languages' : 'Langues';
        const styleL = LANG === 'es' ? 'Estilo' : LANG === 'en' ? 'Style' : 'Style';
        const topicL = LANG === 'es' ? 'Temas' : LANG === 'en' ? 'Topics' : 'Sujets';
        const factsL = LANG === 'es' ? 'Datos' : LANG === 'en' ? 'Facts' : 'Infos';
        const goalsL = LANG === 'es' ? 'Objetivos' : LANG === 'en' ? 'Goals' : 'Objectifs';
        const updL   = LANG === 'es' ? 'Actualizado' : LANG === 'en' ? 'Updated' : 'Mis à jour';
        if (p.name) lines.push(`<b>${nameL} :</b> ${p.name}`);
        if (p.languages?.length) lines.push(`<b>${langL} :</b> ${p.languages.join(', ')}`);
        if (p.style) lines.push(`<b>${styleL} :</b> ${p.style}`);
        if (p.topics?.length) lines.push(`<b>${topicL} :</b> ${p.topics.join(', ')}`);
        if (p.facts?.length) lines.push(`<b>${factsL} :</b><br>• ${p.facts.join('<br>• ')}`);
        if (p.goals?.length) lines.push(`<b>${goalsL} :</b> ${p.goals.join(', ')}`);
        if (p.lastUpdated) lines.push(`<small style="opacity:0.6">${updL} : ${p.lastUpdated}</small>`);
        customAlert(lines.join('<br><br>'), { title: '👤 ' + t('config_section_profile'), icon: '🪪' });
    });
```

Replace with:
```javascript
    document.getElementById('viewProfileBtn').addEventListener('click', () => {
        const activeId = getActiveId();
        const activePersona = activeId ? getPersonas().find(p => p.id === activeId) : null;
        const personaProf = activeId ? getPersonaProfile(activeId) : null;
        if (!personaProfileHasContent(personaProf)) {
            customAlert(t('profile_none'), { title: `👤 Profil ${activePersona?.name || ''}`, icon: '👤' });
            return;
        }
        const lines = [];
        const summL  = LANG === 'es' ? 'Resumen' : LANG === 'en' ? 'Summary' : 'Résumé';
        const factsL = LANG === 'es' ? 'Lo que sabe' : LANG === 'en' ? 'What it knows' : 'Ce qu\'il sait';
        const goalsL = LANG === 'es' ? 'Objetivos' : LANG === 'en' ? 'Goals' : 'Objectifs';
        const prefL  = LANG === 'es' ? 'Estilo' : LANG === 'en' ? 'Style' : 'Style attendu';
        const updL   = LANG === 'es' ? 'Actualizado' : LANG === 'en' ? 'Updated' : 'Mis à jour';
        if (personaProf.summary) lines.push(`<b>${summL} :</b> ${personaProf.summary}`);
        if (personaProf.facts?.length) lines.push(`<b>${factsL} :</b><br>• ${personaProf.facts.join('<br>• ')}`);
        if (personaProf.goals?.length) lines.push(`<b>${goalsL} :</b> ${personaProf.goals.join(', ')}`);
        if (personaProf.preferences) lines.push(`<b>${prefL} :</b> ${personaProf.preferences}`);
        if (personaProf.lastUpdated) lines.push(`<small style="opacity:0.6">${updL} : ${personaProf.lastUpdated}</small>`);
        customAlert(lines.join('<br><br>'), { title: `👤 Profil ${activePersona?.name || ''}`, icon: '🪪' });
    });
```

- [ ] **Step 4: Update `clearProfileBtn` listener — clear persona profile**

Find:
```javascript
    document.getElementById('clearProfileBtn').addEventListener('click', async () => {
        if (!await customConfirm(
            LANG === 'es' ? 'Borrar el perfil? Zova comenzará de cero para conocerte.' :
            LANG === 'en' ? 'Clear the profile? Zova will start over to get to know you.' :
            'Effacer le profil ? Zova repartira de zéro pour apprendre à te connaître.',
            { title: '🗑️ ' + t('config_clear_profile'), confirmLabel: LANG === 'es' ? 'Borrar' : LANG === 'en' ? 'Clear' : 'Effacer', danger: true }
        )) return;
        localStorage.removeItem(PROFILE_KEY);
        updateProfileCount();
        customAlert(
            LANG === 'es' ? 'Perfil borrado.' : LANG === 'en' ? 'Profile cleared.' : 'Profil effacé.',
            { title: '👤', icon: '✅' }
        );
    });
```

Replace with:
```javascript
    document.getElementById('clearProfileBtn').addEventListener('click', async () => {
        const activeId = getActiveId();
        const activePersona = activeId ? getPersonas().find(p => p.id === activeId) : null;
        const personaLabel = activePersona ? ` (${activePersona.name})` : '';
        if (!await customConfirm(
            LANG === 'es' ? `Borrar el perfil de este persona${personaLabel}? Empezará de cero.` :
            LANG === 'en' ? `Clear the profile for this persona${personaLabel}? It will start over.` :
            `Effacer le profil de ce persona${personaLabel} ? Il repartira de zéro.`,
            { title: '🗑️ ' + t('config_clear_profile'), confirmLabel: LANG === 'es' ? 'Borrar' : LANG === 'en' ? 'Clear' : 'Effacer', danger: true }
        )) return;
        if (activeId) clearPersonaProfile(activeId);
        updatePersonaProfileCount();
        customAlert(
            LANG === 'es' ? 'Perfil borrado.' : LANG === 'en' ? 'Profile cleared.' : 'Profil effacé.',
            { title: '👤', icon: '✅' }
        );
    });

    // Small link to access the global profile
    document.getElementById('viewGlobalProfileBtn').addEventListener('click', () => {
        const p = getUserProfile();
        if (!profileHasContent(p)) {
            customAlert(t('profile_none'), { title: '👤 ' + t('config_section_profile'), icon: '👤' });
            return;
        }
        const lines = [];
        const nameL  = LANG === 'es' ? 'Nombre' : LANG === 'en' ? 'Name' : 'Nom';
        const langL  = LANG === 'es' ? 'Idiomas' : LANG === 'en' ? 'Languages' : 'Langues';
        const styleL = LANG === 'es' ? 'Estilo' : LANG === 'en' ? 'Style' : 'Style';
        const topicL = LANG === 'es' ? 'Temas' : LANG === 'en' ? 'Topics' : 'Sujets';
        const factsL = LANG === 'es' ? 'Datos' : LANG === 'en' ? 'Facts' : 'Infos';
        const goalsL = LANG === 'es' ? 'Objetivos' : LANG === 'en' ? 'Goals' : 'Objectifs';
        const updL   = LANG === 'es' ? 'Actualizado' : LANG === 'en' ? 'Updated' : 'Mis à jour';
        if (p.name) lines.push(`<b>${nameL} :</b> ${p.name}`);
        if (p.languages?.length) lines.push(`<b>${langL} :</b> ${p.languages.join(', ')}`);
        if (p.style) lines.push(`<b>${styleL} :</b> ${p.style}`);
        if (p.topics?.length) lines.push(`<b>${topicL} :</b> ${p.topics.join(', ')}`);
        if (p.facts?.length) lines.push(`<b>${factsL} :</b><br>• ${p.facts.join('<br>• ')}`);
        if (p.goals?.length) lines.push(`<b>${goalsL} :</b> ${p.goals.join(', ')}`);
        if (p.lastUpdated) lines.push(`<small style="opacity:0.6">${updL} : ${p.lastUpdated}</small>`);
        const clearGlobal = async () => {
            if (!await customConfirm(
                LANG === 'es' ? 'Borrar el perfil general?' : LANG === 'en' ? 'Clear global profile?' : 'Effacer le profil général ?',
                { confirmLabel: LANG === 'es' ? 'Borrar' : LANG === 'en' ? 'Clear' : 'Effacer', danger: true }
            )) return;
            localStorage.removeItem(PROFILE_KEY);
            customAlert(LANG === 'es' ? 'Perfil general borrado.' : LANG === 'en' ? 'Global profile cleared.' : 'Profil général effacé.', { icon: '✅' });
        };
        customAlert(
            lines.join('<br><br>') + `<br><br><button onclick="(${clearGlobal.toString()})()" style="background:none;border:1px solid var(--danger);color:var(--danger);border-radius:8px;padding:6px 12px;cursor:pointer;font-size:0.82rem;">🗑️ ${LANG === 'es' ? 'Borrar perfil general' : LANG === 'en' ? 'Clear global profile' : 'Effacer profil général'}</button>`,
            { title: '👤 ' + t('config_section_profile'), icon: '🌐' }
        );
    });
```

- [ ] **Step 5: Verify HTML element added**
```powershell
Select-String -Path "buddy\www\index.html" -Pattern "viewGlobalProfileBtn" | Measure-Object
```
Expected: 2 matches (HTML definition + JS listener).

- [ ] **Step 6: Commit**
```
git add buddy/www/index.html
git commit -m "feat: Config UI — dynamic persona profile title, view/clear persona profile, global profile link"
```

---

### Task 6 — Backup & restore

Include `personaProfiles` map in backup, restore on import.

**Files:**
- Modify: `buddy/www/index.html`

- [ ] **Step 1: Update `buildBackupData()`**

Find:
```javascript
        return {
            version: 2,
            exportDate: new Date().toISOString(),
            theme: getTheme(),
            personas: getPersonas(),
            activePersonaId: getActiveId(),
            userInfo: getUserInfo(),
            stats: getStats(),
            memories: getMemories(),
            personaMemories: getAllPersonaMemoryMap(), // per-persona memories map
            userProfile: getUserProfile()
        };
```

Replace with:
```javascript
        return {
            version: 2,
            exportDate: new Date().toISOString(),
            theme: getTheme(),
            personas: getPersonas(),
            activePersonaId: getActiveId(),
            userInfo: getUserInfo(),
            stats: getStats(),
            memories: getMemories(),
            personaMemories: getAllPersonaMemoryMap(),   // per-persona memories map
            personaProfiles: getAllPersonaProfileMap(),  // per-persona profile map
            userProfile: getUserProfile()
        };
```

- [ ] **Step 2: Update `processBackupJson()`**

Find:
```javascript
            if (data.personaMemories && typeof data.personaMemories === 'object') {
                Object.entries(data.personaMemories).forEach(([personaId, mems]) => {
                    if (Array.isArray(mems)) localStorage.setItem(PERSONA_MEMORY_PREFIX + personaId, JSON.stringify(mems));
                });
            }
            if (data.userProfile) setUserProfile(data.userProfile);
```

Replace with:
```javascript
            if (data.personaMemories && typeof data.personaMemories === 'object') {
                Object.entries(data.personaMemories).forEach(([personaId, mems]) => {
                    if (Array.isArray(mems)) localStorage.setItem(PERSONA_MEMORY_PREFIX + personaId, JSON.stringify(mems));
                });
            }
            if (data.personaProfiles && typeof data.personaProfiles === 'object') {
                Object.entries(data.personaProfiles).forEach(([personaId, profile]) => {
                    if (profile && typeof profile === 'object') setPersonaProfile(profile, personaId);
                });
            }
            if (data.userProfile) setUserProfile(data.userProfile);
```

- [ ] **Step 3: Verify both keys in backup function**
```powershell
Select-String -Path "buddy\www\index.html" -Pattern "personaProfiles" | Select-Object LineNumber, Line
```
Expected: 3 matches — `buildBackupData`, `processBackupJson`, `getAllPersonaProfileMap` call.

- [ ] **Step 4: Commit**
```
git add buddy/www/index.html
git commit -m "feat: include personaProfiles in backup/restore"
```

---

### Task 7 — Sync, build, install

- [ ] **Step 1: Cap sync**
```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\xavie\AppData\Local\Android\Sdk"
$env:PATH = "$env:PATH;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools"
cd C:\Users\xavie\OneDrive\Documentos\Cerrador\buddy
npx cap sync android
```
Expected: `Sync finished in ...`

- [ ] **Step 2: Gradle build release**
```powershell
cd android
.\gradlew assembleRelease
```
Expected: `BUILD SUCCESSFUL`

- [ ] **Step 3: Install on device**
```powershell
adb install -r app\build\outputs\apk\release\app-release.apk
```
Expected: `Success`

- [ ] **Step 4: Final commit message**
```
git add buddy/www/index.html
git commit -m "feat: per-persona adaptive profile — full implementation

Each persona now builds its own user profile (buddy_pprofile_{id})
adapted to its domain. A fitness coach tracks fitness level and goals;
a coding assistant tracks stack and projects; a language tutor tracks
level and difficulties.

Updated post-session alongside global profile (non-blocking).
Injected in buildFullInstructions() after global profile.
Config shows active persona's profile with dynamic title.
Global profile accessible via discreet link.
Backup/restore includes personaProfiles map.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
