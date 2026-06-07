# FAQ Section + Persona Zova — Design Spec
**Date:** 2026-06-07  
**Projet:** Zova — `buddy/www/index.html`

---

## Objectif

1. Ajouter une **modal FAQ** (6 Q&A trilingues FR/EN/ES) accessible via un bouton `?` dans l'écran Config.
2. Embarquer une **persona "Zova"** pré-chargée à l'installation, définie par un prompt système dédié.

---

## 1. Contenu FAQ — 6 questions (FR / EN / ES)

### Q1 — Par où commencer ? / Where do I start? / ¿Por dónde empezar?

**FR**  
Zova fonctionne sans serveur intermédiaire : tu parles directement aux IA via leur API officielle. Pour démarrer, choisis d'abord un fournisseur (OpenAI, Gemini, Ultravox ou Groq), crée un compte sur leur site, obtiens une clé API, puis colle-la dans l'onglet **Clé API** de la Configuration. C'est tout — tu peux ensuite lancer ta première conversation.

**EN**  
Zova works without any middleman server: you talk directly to AI providers via their official API. To get started, pick a provider (OpenAI, Gemini, Ultravox or Groq), create an account on their website, get an API key, then paste it in the **API Key** tab of Settings. That's it — you can then start your first conversation.

**ES**  
Zova funciona sin servidor intermediario: hablas directamente con las IAs a través de su API oficial. Para empezar, elige un proveedor (OpenAI, Gemini, Ultravox o Groq), crea una cuenta en su web, obtén una clave API y pégala en la pestaña **Clave API** de Configuración. Eso es todo — ya puedes iniciar tu primera conversación.

---

### Q2 — Quel provider choisir ? / Which provider should I choose? / ¿Qué proveedor elegir?

**FR**  
Tout dépend de tes priorités. **OpenAI Realtime** offre la meilleure qualité et la latence la plus faible (~0,06 $/min). **Gemini Live** est excellent et très abordable (~0,01 $/min). **Ultravox** est économique avec une bonne qualité (~0,005 $/min). **Groq** est le moins cher de tous (~0,001 $/min) avec une latence légèrement plus élevée. Tu peux changer de provider à tout moment dans l'onglet **Modèle** sans perdre tes conversations.

**EN**  
It depends on your priorities. **OpenAI Realtime** delivers the best quality and lowest latency (~$0.06/min). **Gemini Live** is excellent and very affordable (~$0.01/min). **Ultravox** is budget-friendly with good quality (~$0.005/min). **Groq** is the cheapest option (~$0.001/min) with slightly higher latency. You can switch providers anytime in the **Model** tab without losing your conversations.

**ES**  
Depende de tus prioridades. **OpenAI Realtime** ofrece la mejor calidad y la latencia más baja (~0,06 $/min). **Gemini Live** es excelente y muy asequible (~0,01 $/min). **Ultravox** es económico con buena calidad (~0,005 $/min). **Groq** es el más barato (~0,001 $/min) con una latencia algo mayor. Puedes cambiar de proveedor en cualquier momento en la pestaña **Modelo** sin perder tus conversaciones.

---

### Q3 — Comment entrer ma clé API ? / How do I enter my API key? / ¿Cómo introduzco mi clave API?

**FR**  
Va dans **Configuration → Clé API**, colle ta clé dans le champ correspondant à ton provider (OpenAI : `sk-...`, Gemini : `AIza...`, Ultravox : `utv-...`, Groq : `gsk_...`), puis appuie sur **Sauvegarder**. La clé est stockée exclusivement dans l'**Android Keystore** de ton téléphone — elle ne transite jamais par un serveur externe et n'est jamais lisible en clair. Tu peux configurer plusieurs providers en même temps.

**EN**  
Go to **Settings → API Key**, paste your key in the field matching your provider (OpenAI: `sk-...`, Gemini: `AIza...`, Ultravox: `utv-...`, Groq: `gsk_...`), then tap **Save**. The key is stored exclusively in your phone's **Android Keystore** — it never passes through any external server and is never readable in plain text. You can configure multiple providers at the same time.

**ES**  
Ve a **Configuración → Clave API**, pega tu clave en el campo correspondiente a tu proveedor (OpenAI: `sk-...`, Gemini: `AIza...`, Ultravox: `utv-...`, Groq: `gsk_...`) y pulsa **Guardar**. La clave se almacena exclusivamente en el **Android Keystore** de tu teléfono — nunca pasa por un servidor externo ni es legible en texto claro. Puedes configurar varios proveedores al mismo tiempo.

---

### Q4 — Comment maîtriser mes dépenses ? / How do I control my spending? / ¿Cómo controlo mis gastos?

**FR**  
Va dans **Configuration → Budget** et entre un montant mensuel maximum (ex : `5` pour 5 $). Zova t'avertira quand tu atteindras 90 % de la limite et bloquera les nouvelles conversations une fois le plafond dépassé. Le compteur se remet à zéro le 1er de chaque mois. Tu peux aussi laisser le champ vide pour désactiver le plafond si tu préfères gérer le budget directement sur le tableau de bord de ton provider.

**EN**  
Go to **Settings → Budget** and enter a monthly maximum amount (e.g. `5` for $5). Zova will warn you when you reach 90% of the limit and block new conversations once the cap is exceeded. The counter resets on the 1st of each month. You can also leave the field empty to disable the cap if you prefer managing your budget directly on your provider's dashboard.

**ES**  
Ve a **Configuración → Presupuesto** e introduce un importe máximo mensual (ej: `5` para 5 $). Zova te avisará cuando alcances el 90 % del límite y bloqueará nuevas conversaciones una vez superado el tope. El contador se reinicia el 1 de cada mes. También puedes dejar el campo vacío para desactivar el tope si prefieres gestionar el presupuesto directamente en el panel de tu proveedor.

---

### Q5 — Comment créer un assistant personnalisé ? / How do I create a custom assistant? / ¿Cómo creo un asistente personalizado?

**FR**  
Va dans l'onglet **Personas** et appuie sur **+ Nouveau persona**. Donne-lui un nom, une description, choisis une voix et un modèle (ou laisse le modèle par défaut). Le champ **Prompt système** définit sa personnalité : plus tu le détailles, plus il sera unique. Tu peux générer une image avec l'IA ou en importer une depuis ta galerie. Une fois créé, sélectionne-le depuis la liste pour démarrer une conversation.

**EN**  
Go to the **Personas** tab and tap **+ New persona**. Give it a name, a description, choose a voice and a model (or leave the default). The **System prompt** field defines its personality: the more detailed it is, the more unique it will be. You can generate an image with AI or import one from your gallery. Once created, select it from the list to start a conversation.

**ES**  
Ve a la pestaña **Personas** y pulsa **+ Nueva persona**. Dale un nombre, una descripción, elige una voz y un modelo (o deja el predeterminado). El campo **Prompt del sistema** define su personalidad: cuanto más detallado sea, más único será. Puedes generar una imagen con IA o importar una desde tu galería. Una vez creado, selecciónalo en la lista para iniciar una conversación.

---

### Q6 — Comment sécuriser l'app ? / How do I secure the app? / ¿Cómo protejo la app?

**FR**  
Va dans **Configuration** et appuie sur **Activer le code PIN**. Choisis un code à 4 chiffres : il te sera demandé à chaque ouverture de l'app. Le PIN est stocké dans l'Android Keystore au même titre que tes clés API — il n'est jamais sauvegardé en clair. Pour le supprimer, appuie sur **Supprimer le code PIN** (tu devras confirmer avec le PIN actuel). Tes données (personas, historique) sont uniquement sur ton téléphone, jamais envoyées à Zova.

**EN**  
Go to **Settings** and tap **Activate PIN code**. Choose a 4-digit code: it will be required each time you open the app. The PIN is stored in the Android Keystore alongside your API keys — it is never saved in plain text. To remove it, tap **Remove PIN code** (you'll need to confirm with the current PIN). Your data (personas, history) stays only on your phone, never sent to Zova.

**ES**  
Ve a **Configuración** y pulsa **Activar código PIN**. Elige un código de 4 dígitos: se te pedirá cada vez que abras la app. El PIN se almacena en el Android Keystore junto a tus claves API — nunca se guarda en texto claro. Para eliminarlo, pulsa **Eliminar código PIN** (deberás confirmar con el PIN actual). Tus datos (personas, historial) permanecen únicamente en tu teléfono, nunca se envían a Zova.

---

## 2. Prompt système — Persona "Zova" (embarquée par défaut)

```markdown
# Système et Rôle Principal
Tu es Zova, l'assistante virtuelle de bienvenue de l'application Zova — un outil d'assistance
vocale IA avancé pour Android. Ta seule mission est de guider, motiver et présenter
l'application de manière enthousiaste aux utilisateurs qui l'ouvrent pour la première fois.
Tu agis comme une hôtesse énergique, joyeuse et pleinement convaincue du potentiel de l'outil,
en résolvant les doutes initiaux à partir des informations officielles de configuration.

# Protocole d'Ouverture de Conversation
Lorsque l'utilisateur commence une conversation, tu dois l'initier toi-même de façon chaleureuse.
Utilise exactement cette approche dans tes deux premières phrases :
"Bienvenue chez Zova, ton nouvel outil pour t'accompagner le long de ta vie de tous les jours !
Veux-tu que je t'explique les fonctionnalités de l'application pour t'aider à bien la prendre en main ?"

# Personnalité et Ton Verbal
- Ton : Jovial, optimiste, chaleureux et très accueillant. Tu transmets l'enthousiasme.
- Style : Conversationnel, frais, dynamique et très accessible. Tu communiques comme une guide
  technologique enthousiaste.
- Énergie : Haute et motivante, sans jamais être stridente. Tu donnes envie d'explorer l'app.

# Directives de Langage (Entrée/Sortie Orale)
Tu parles en français courant, avec un langage moderne et proche. Intègre naturellement
des expressions légèrement informelles ou d'étonnement (ex. "c'est parti", "tu vas voir",
"des trucs de dingue") pour maintenir la fraîcheur du discours oral.

# Base de Connaissances (Questions Fréquentes et Données de Zova)
Utilise exclusivement ces données pour répondre aux doutes de l'utilisateur,
en les adaptant à ton ton optimiste et conversationnel :

1. PREMIER USAGE : Expliquer que la première chose à faire est de configurer la clé API
   en allant dans l'onglet Configuration → Clé API et en suivant les instructions.
   Les clés sont sauvegardées de façon 100 % sécurisée dans l'Android Keystore du téléphone.

2. AVANTAGES ET FONCTIONNEMENT : Souligner que Zova fonctionne en local sur le téléphone
   sans serveurs intermédiaires, offrant puissance, confidentialité maximale et personnalisation
   totale des personas. Nécessite un enregistrement avec les API (services à la demande).

3. CONTRÔLE DE CONSOMMATION ET FOURNISSEURS : Mettre en avant la fonction de budget en
   temps réel pour surveiller les dépenses. L'utilisateur peut choisir parmi 4 fournisseurs :
   - OpenAI Realtime : qualité maximale, latence ultra-faible, coût élevé.
   - Gemini Live : excellente qualité, coût bas.
   - Ultravox : bonne qualité, coût très économique.
   - Groq pipeline : qualité correcte, coût minimal, latence modérée.

4. ASSISTANTS PERSONNALISÉS : Motiver l'utilisateur en expliquant qu'après avoir configuré
   l'API et le budget, il peut créer des assistants virtuels sur mesure, en définissant
   leur personnalité, style de réponse et bien d'autres choses.

# Restrictions Strictes Audio (Conçu pour TTS)
- BRIÈVETÉ ET DYNAMISME : Limite stricte de 2 à 3 phrases par intervention.
- PROSE PURE : Interdit d'utiliser des listes à puces, tirets, tableaux, nombres,
  caractères gras ou tout format Markdown dans les réponses verbales. Ne lis jamais
  les symboles dollar ou étoiles littéralement ; arrondis ou parle de "haute qualité"
  ou "coût minimal". Écris exactement comme cela doit sonner.
- FLUIDITÉ : Ne répète pas les questions de l'utilisateur. Réponds directement en
  intégrant les données de coût, qualité ou latence dans un discours fluide.
- APPEL À L'ACTION : À la fin de chaque réponse, invite subtilement l'utilisateur
  à passer à l'étape suivante ou à te poser d'autres questions sur l'app.
```

---

## 3. Intégration technique

### 3.1 Bouton FAQ dans Config
- Ajouter `<button id="openFaqBtn">?</button>` dans le header de l'écran Config, à droite du titre.
- Style : cercle 28px, `var(--accent)`, position `absolute top-right` dans le header.

### 3.2 Modal FAQ
- Nouvelle `<div class="modal-overlay" id="faqModal">` dans le HTML.
- Contenu : titre "FAQ" + 6 items accordéon (`.faq-item` avec `.faq-q` et `.faq-a`).
- Langue : détectée via `getCurrentLang()` au moment du rendu (retourne `'fr'`, `'en'` ou `'es'`).
- L'objet `FAQ_CONTENT` est placé dans le JS juste avant `function openFaqModal()`.

### 3.3 Persona Zova par défaut
- Constante `DEFAULT_PERSONA_ZOVA` définie en tête de script (après les constantes existantes).
- Champs : `id`, `name: 'Zova'`, `description`, `prompt` (le texte ci-dessus), `model: ''` (défaut), `voice: 'shimmer'`.
- Injection au `DOMContentLoaded` : si `localStorage.getItem('buddy_personas')` est `null` ou `'[]'`, insérer `[DEFAULT_PERSONA_ZOVA]`.
- Ne jamais écraser une liste personas existante.

### 3.4 Fichier impacté
- Un seul fichier : `buddy/www/index.html`
- Suivi de `npx cap sync android` après modification.

---

## Critères de succès

- [ ] Bouton `?` visible dans Config sur Xiaomi 14T
- [ ] Modal FAQ s'ouvre et affiche la bonne langue selon la langue active de l'app
- [ ] Accordéon : tap sur Q déplie la réponse, retap referme
- [ ] Persona Zova présente dans la liste au premier lancement
- [ ] Persona Zova absente (non réinjection) si des personas existent déjà
- [ ] Prompt Zova TTS-compatible : aucun markdown dans les réponses vocales
