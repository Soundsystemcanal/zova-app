const telegramData = $('Telegram Trigger').first().json;
const mensaje = (telegramData.message?.text || '').trim();
const mensajeLower = mensaje.toLowerCase();
const chatId = telegramData.message?.chat?.id;

// Telegram language_code: 'fr-FR' → 'fr'
const telegramLangCode = (telegramData.message?.from?.language_code || '').split('-')[0];

const mapaIdiomas = {
  'es': { nombre: 'español',   codigo: 'es' },
  'en': { nombre: 'inglés',    codigo: 'en' },
  'fr': { nombre: 'francés',   codigo: 'fr' },
  'de': { nombre: 'alemán',    codigo: 'de' },
  'pt': { nombre: 'portugués', codigo: 'pt' },
  'it': { nombre: 'italiano',  codigo: 'it' },
  'sv': { nombre: 'sueco',     codigo: 'sv' },
  'no': { nombre: 'noruego',   codigo: 'no' },
  'da': { nombre: 'danés',     codigo: 'da' },
  'ru': { nombre: 'ruso',      codigo: 'ru' }
};

const devolver = (codigo, motivo) => {
  const r = mapaIdiomas[codigo] || mapaIdiomas['es'];
  return [{ json: { idiomaDetectado: r.nombre, codigoIdioma: r.codigo,
    mensajeOriginal: mensajeLower, chatId, debugInfo: motivo } }];
};

// ── 1. Mensajes numéricos o selección de menú → confiar en Telegram ──────────
if (/^\d+$/.test(mensaje)) {
  return devolver(telegramLangCode || 'es', `Numérico → lang_code: ${telegramLangCode}`);
}

// ── 2. Cirílico → ruso directo ────────────────────────────────────────────────
if (/[а-яА-ЯёЁ]/.test(mensaje)) {
  return devolver('ru', 'Cirílico detectado');
}

// ── 3. Texto muy corto (≤2 palabras) → confiar en Telegram ───────────────────
const palabras = mensajeLower.trim().split(/\s+/);
if (palabras.length <= 2 && telegramLangCode && mapaIdiomas[telegramLangCode]) {
  return devolver(telegramLangCode, `Texto corto → lang_code: ${telegramLangCode}`);
}

// ── 4. Puntuación por señales ─────────────────────────────────────────────────
let scores = { es: 0, en: 0, fr: 0, de: 0, pt: 0, it: 0, sv: 0, no: 0, da: 0, ru: 0 };

// 4a. Telegram language_code (peso 4 — el teléfono del usuario es fiable)
if (telegramLangCode && scores.hasOwnProperty(telegramLangCode)) {
  scores[telegramLangCode] += 4;
}

// 4b. Caracteres diacríticos exclusivos (muy alta confianza)
if (/[ñ¿¡]/.test(mensajeLower))                                scores.es += 8;
if (/ß/.test(mensajeLower))                                     scores.de += 8;
if (/[ãõ]/.test(mensajeLower))                                  scores.pt += 8;
if (/[åÅ]/.test(mensajeLower))  { scores.sv += 5; scores.no += 4; scores.da += 4; }
if (/[æÆ]/.test(mensajeLower))  { scores.da += 5; scores.no += 4; scores.sv += 3; }
if (/[øØ]/.test(mensajeLower))  { scores.no += 5; scores.da += 4; }
if (/[äöüÄÖÜ]/.test(mensajeLower) && !/ß/.test(mensajeLower))  scores.de += 3;

// Diacríticos franceses (ç, à, â, œ) — no confundir con PT si hay ã/õ
if (/ç/.test(mensajeLower) && !/[ãõ]/.test(mensajeLower))       scores.fr += 5;
if (/[àâœ]/.test(mensajeLower))                                  scores.fr += 4;
if (/[éèêëîïùûÀÂ]/.test(mensajeLower))                          scores.fr += 2;

// Diacríticos italianos (à è ì ò ù) sin las señales FR/PT
if (/[àèìòù]/.test(mensajeLower) && !/[ãõàâœç]/.test(mensajeLower)) scores.it += 4;

// 4c. Keywords ampliadas (peso 2 por match)
const keywords = {
  es: ['hola', 'buenos', 'buenas', 'necesito', 'quiero', 'tengo', 'hay', 'ayuda',
       'gracias', 'urgente', 'urgencia', 'problema', 'avería', 'averia', 'agua',
       'fontanero', 'precio', 'presupuesto', 'cuánto', 'cuanto', 'roto', 'rota',
       'fuga', 'gotera', 'tubería', 'tuberia', 'grifo', 'desagüe'],
  en: ['hello', 'hi', 'hey', 'good morning', 'i need', 'i want', 'i have', 'help',
       'thanks', 'emergency', 'urgent', 'problem', 'broken', 'leak', 'price',
       'quote', 'how much', 'plumber', 'pipe', 'water', 'tap', 'drain', 'fix'],
  fr: ['bonjour', 'bonsoir', 'bonne nuit', 'salut', 'allô', 'allo', 'coucou',
       "j'ai", "j'ai", 'je ', "c'est", "il y a", "qu'est", 'mon ', 'ma ',
       'besoin', 'veux', 'aide', 'merci', 'urgence', 'problème', 'probleme',
       'fuite', 'plombier', 'prix', 'devis', 'combien', 'eau', 'robinet',
       'tuyau', 'réparer', 'reparer', 'panne', 'urgent', 'dégât', 'degat',
       "s'il vous", 'svp', "d'eau", "d'urgence", 'appeler', 'rappeler'],
  de: ['hallo', 'guten tag', 'guten morgen', 'guten abend', 'servus', 'moin',
       'brauche', 'möchte', 'mochte', 'ich habe', 'ich ', 'mein ', 'meine ',
       'hilfe', 'danke', 'notfall', 'problem', 'leck', 'undicht', 'klempner',
       'preis', 'angebot', 'wasser', 'kaputt', 'rohr', 'hahn', 'reparieren'],
  pt: ['olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'oi ',
       'preciso', 'quero', 'tenho', 'tem ', 'ajuda', 'obrigado', 'obrigada',
       'emergência', 'emergencia', 'problema', 'vazamento', 'cano', 'encanador',
       'preço', 'orçamento', 'água', 'torneira', 'canos', 'conserto', 'quebrado'],
  it: ['ciao', 'buongiorno', 'buonasera', 'buona sera', 'salve', 'buon giorno',
       'ho un', 'ho una', 'ho bisogno', 'bisogno', 'voglio', 'aiuto',
       'grazie', 'emergenza', 'problema', 'perdita', 'perdita d', 'acqua',
       'idraulico', 'prezzo', 'preventivo', 'quanto', 'rotto', 'rotta',
       "c'è", 'mi serve', 'non funziona', 'rubinetto', 'tubo', 'guasto',
       'urgente', 'subito', 'chiamare', 'il mio', 'la mia', 'ho il',
       'perdita acqua', 'perdita di', 'tubatura', 'scarico', 'riparazione'],
  sv: ['hej', 'god morgon', 'god kväll', 'hejsan', 'hallå',
       'behöver', 'vill ', 'hjälp', 'tack', 'problem', 'läcka',
       'rörmokare', 'pris', 'offert', 'vatten', 'trasig', 'rör', 'kran'],
  no: ['hei', 'god morgen', 'god kveld', 'hallo',
       'trenger', 'vil ', 'hjelp', 'takk', 'problem', 'lekkasje',
       'rørlegger', 'pris', 'tilbud', 'vann', 'rør', 'kran'],
  da: ['hej', 'godmorgen', 'godaften', 'brug for', 'vil ', 'hjælp',
       'tak', 'problem', 'lækage', 'vvs', 'pris', 'tilbud', 'vand', 'rør']
};

for (const [lang, words] of Object.entries(keywords)) {
  for (const word of words) {
    if (mensajeLower.includes(word)) {
      scores[lang] += 2;
    }
  }
}

// ── 5. Resolver ───────────────────────────────────────────────────────────────
const maxScore = Math.max(...Object.values(scores));

if (maxScore === 0) {
  // Sin señales → confiar en Telegram language_code o defaultear ES
  return devolver(
    (telegramLangCode && mapaIdiomas[telegramLangCode]) ? telegramLangCode : 'es',
    `Sin señales → lang_code: ${telegramLangCode}`
  );
}

const candidatos = Object.keys(scores).filter(k => scores[k] === maxScore);

let idiomaFinal;
if (candidatos.length === 1) {
  idiomaFinal = candidatos[0];
} else if (candidatos.includes(telegramLangCode)) {
  idiomaFinal = telegramLangCode;  // desempate con Telegram
} else {
  // Desempate por orden de preferencia: es > en > fr > it > de > pt
  const preferencia = ['es', 'en', 'fr', 'it', 'de', 'pt', 'sv', 'no', 'da', 'ru'];
  idiomaFinal = preferencia.find(l => candidatos.includes(l)) || candidatos[0];
}

return devolver(
  idiomaFinal,
  `Scores: ${JSON.stringify(scores)} → ${idiomaFinal} (telegram: ${telegramLangCode})`
);
