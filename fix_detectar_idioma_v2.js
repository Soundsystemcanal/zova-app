// ═══════════════════════════════════════════════════════════════════════
// DETECTAR IDIOMA v2 — Todos los idiomas europeos
// Estrategia: script Unicode → language_code Telegram → diacríticos → keywords
// ═══════════════════════════════════════════════════════════════════════

const telegramData  = $('Telegram Trigger').first().json;
const mensaje       = (telegramData.message?.text || '').trim();
const mensajeLower  = mensaje.toLowerCase();
const chatId        = telegramData.message?.chat?.id;
// Normalizar código Telegram: 'fr-FR' → 'fr', 'zh-hans' → 'zh'
const telegramCode  = (telegramData.message?.from?.language_code || '').toLowerCase().split('-')[0];

// ── Mapa completo de idiomas europeos (+ frecuentes en Tenerife) ──────────────
const mapaIdiomas = {
  // Ibéricos
  'es': { es: 'español',       en: 'Spanish'      },
  'ca': { es: 'catalán',       en: 'Catalan'       },
  'gl': { es: 'gallego',       en: 'Galician'      },
  'eu': { es: 'euskera',       en: 'Basque'        },
  // Romances occidentales
  'pt': { es: 'portugués',     en: 'Portuguese'    },
  'fr': { es: 'francés',       en: 'French'        },
  'it': { es: 'italiano',      en: 'Italian'       },
  'ro': { es: 'rumano',        en: 'Romanian'      },
  'la': { es: 'latín',         en: 'Latin'         },
  'co': { es: 'corso',         en: 'Corsican'      },
  'oc': { es: 'occitano',      en: 'Occitan'       },
  'sc': { es: 'sardo',         en: 'Sardinian'     },
  'rm': { es: 'romanche',      en: 'Romansh'       },
  // Germánicas
  'en': { es: 'inglés',        en: 'English'       },
  'de': { es: 'alemán',        en: 'German'        },
  'nl': { es: 'neerlandés',    en: 'Dutch'         },
  'lb': { es: 'luxemburgués',  en: 'Luxembourgish' },
  'af': { es: 'afrikáans',     en: 'Afrikaans'     },
  'yi': { es: 'yidis',         en: 'Yiddish'       },
  // Escandinavas
  'sv': { es: 'sueco',         en: 'Swedish'       },
  'no': { es: 'noruego',       en: 'Norwegian'     },
  'nb': { es: 'noruego bokmål',en: 'Norwegian Bokmål' },
  'nn': { es: 'nynorsk',       en: 'Norwegian Nynorsk' },
  'da': { es: 'danés',         en: 'Danish'        },
  'is': { es: 'islandés',      en: 'Icelandic'     },
  'fo': { es: 'feroés',        en: 'Faroese'       },
  // Bálticas
  'lv': { es: 'letón',         en: 'Latvian'       },
  'lt': { es: 'lituano',       en: 'Lithuanian'    },
  // Fino-úgricas
  'fi': { es: 'finés',         en: 'Finnish'       },
  'et': { es: 'estonio',       en: 'Estonian'      },
  'hu': { es: 'húngaro',       en: 'Hungarian'     },
  // Eslavas occidentales
  'pl': { es: 'polaco',        en: 'Polish'        },
  'cs': { es: 'checo',         en: 'Czech'         },
  'sk': { es: 'eslovaco',      en: 'Slovak'        },
  // Eslavas meridionales
  'hr': { es: 'croata',        en: 'Croatian'      },
  'sl': { es: 'esloveno',      en: 'Slovenian'     },
  'bs': { es: 'bosnio',        en: 'Bosnian'       },
  'sr': { es: 'serbio',        en: 'Serbian'       },
  'mk': { es: 'macedonio',     en: 'Macedonian'    },
  'bg': { es: 'búlgaro',       en: 'Bulgarian'     },
  // Eslavas orientales
  'ru': { es: 'ruso',          en: 'Russian'       },
  'uk': { es: 'ucraniano',     en: 'Ukrainian'     },
  'be': { es: 'bielorruso',    en: 'Belarusian'    },
  // Otras europeas
  'el': { es: 'griego',        en: 'Greek'         },
  'sq': { es: 'albanés',       en: 'Albanian'      },
  'mt': { es: 'maltés',        en: 'Maltese'       },
  'cy': { es: 'galés',         en: 'Welsh'         },
  'ga': { es: 'irlandés',      en: 'Irish'         },
  'gd': { es: 'gaélico escocés', en: 'Scottish Gaelic' },
  'br': { es: 'bretón',        en: 'Breton'        },
  // Frecuentes en Tenerife (extra-europeos)
  'tr': { es: 'turco',         en: 'Turkish'       },
  'ar': { es: 'árabe',         en: 'Arabic'        },
  'zh': { es: 'chino',         en: 'Chinese'       },
  'ja': { es: 'japonés',       en: 'Japanese'      },
  'ko': { es: 'coreano',       en: 'Korean'        },
  'he': { es: 'hebreo',        en: 'Hebrew'        },
};

// Alias para códigos alternativos de Telegram
const aliasCode = { 'nb': 'no', 'nn': 'no', 'zh-hans': 'zh', 'zh-hant': 'zh',
                    'iw': 'he', 'jw': 'ja', 'in': 'id' };
const normCode = aliasCode[telegramCode] || telegramCode;

// Helper: devolver resultado
const devolver = (codigo, motivo) => {
  const r = mapaIdiomas[codigo] || { es: 'español', en: 'Spanish' };
  const codigoFinal = mapaIdiomas[codigo] ? codigo : 'es';
  return [{
    json: {
      idiomaDetectado:  r.es,
      idiomaNombreEN:   r.en,
      codigoIdioma:     codigoFinal,
      mensajeOriginal:  mensajeLower,
      chatId,
      debugInfo:        motivo
    }
  }];
};

// ── PASO 1: Mensajes numéricos o muy cortos → confiar en Telegram ─────────────
const numPalabras = mensajeLower.trim().split(/\s+/).length;
if (/^\d+$/.test(mensaje) || numPalabras <= 2) {
  const codigo = mapaIdiomas[normCode] ? normCode : 'es';
  return devolver(codigo, `Corto/numérico → Telegram: ${telegramCode}`);
}

// ── PASO 2: Detección por bloque Unicode (máxima confianza) ──────────────────
// Cirílico: ruso, ucraniano, búlgaro, serbio, macedonio, bielorruso
if (/[Ѐ-ӿ]/.test(mensaje)) {
  // Distinguir con language_code
  const eslavoCirilico = ['ru','uk','bg','sr','mk','be'];
  const candidato = eslavoCirilico.includes(normCode) ? normCode : 'ru';
  return devolver(candidato, `Cirílico → ${candidato} (Telegram: ${telegramCode})`);
}
// Griego
if (/[Ͱ-Ͽἀ-῿]/.test(mensaje)) {
  return devolver('el', 'Alfabeto griego detectado');
}
// Árabe
if (/[؀-ۿݐ-ݿ]/.test(mensaje)) {
  return devolver('ar', 'Árabe detectado');
}
// Hebreo
if (/[֐-׿]/.test(mensaje)) {
  return devolver('he', 'Hebreo detectado');
}
// CJK (Chino/Japonés/Coreano)
if (/[一-鿿぀-ヿ가-힯]/.test(mensaje)) {
  const cjkMap = { ja: 'ja', ko: 'ko', zh: 'zh' };
  return devolver(cjkMap[normCode] || 'zh', `CJK → ${normCode}`);
}
// Armenio
if (/[԰-֏]/.test(mensaje)) return devolver('hy', 'Armenio');
// Georgiano
if (/[Ⴀ-ჿ]/.test(mensaje)) return devolver('ka', 'Georgiano');

// ── PASO 3: Texto en script latino — puntuación por señales ──────────────────
let scores = {};
for (const c of Object.keys(mapaIdiomas)) scores[c] = 0;

// 3a. Telegram language_code (peso = 5, señal muy fiable)
if (normCode && mapaIdiomas[normCode]) {
  scores[normCode] += 5;
}

// 3b. Caracteres diacríticos exclusivos de cada idioma
// Español
if (/[ñ¿¡]/.test(mensajeLower))                   scores['es'] += 8;
// Alemán
if (/ß/.test(mensajeLower))                         scores['de'] += 8;
if (/[äöüÄÖÜ]/.test(mensajeLower))                 scores['de'] += 4;
// Portugués
if (/[ãõÃÕ]/.test(mensajeLower))                   scores['pt'] += 8;
// Francés
if (/[àâœÀÂŒ]/.test(mensajeLower))                 scores['fr'] += 5;
if (/ç/.test(mensajeLower) && !/[ãõ]/.test(mensajeLower)) scores['fr'] += 4;
if (/[éèêëîïùû]/.test(mensajeLower))               scores['fr'] += 2;
// Italiano (acentos graves sin señales FR/PT)
if (/[àèìòù]/.test(mensajeLower) && !/[ãõàâœ]/.test(mensajeLower)) scores['it'] += 4;
// Escandinavas
if (/[åÅ]/.test(mensajeLower))      { scores['sv'] += 5; scores['no'] += 4; scores['da'] += 4; }
if (/[æÆ]/.test(mensajeLower))      { scores['da'] += 5; scores['no'] += 4; scores['sv'] += 3; }
if (/[øØ]/.test(mensajeLower))      { scores['no'] += 5; scores['da'] += 4; }
if (/[þÞðÐ]/.test(mensajeLower))    scores['is'] += 8; // Islandés
// Polaco
if (/[łŁżŻźŹćĆńŃśŚ]/.test(mensajeLower))           scores['pl'] += 8;
// Checo / Eslovaco
if (/[čšžřČŠŽŘ]/.test(mensajeLower))               { scores['cs'] += 6; scores['sk'] += 5; scores['hr'] += 4; scores['sl'] += 4; }
if (/[ůŮ]/.test(mensajeLower))                      scores['cs'] += 4;
if (/[ľĽ]/.test(mensajeLower))                      scores['sk'] += 6;
// Húngaro
if (/[őŐűŰ]/.test(mensajeLower))                    scores['hu'] += 8;
// Rumano
if (/[țșȚȘăĂîÎ]/.test(mensajeLower))               scores['ro'] += 8;
// Bálticas
if (/[ąęĄĘ]/.test(mensajeLower) && !/[łŁżŻ]/.test(mensajeLower)) { scores['lt'] += 5; scores['lv'] += 4; }
if (/[ūŪģĢķĶļĻņŅ]/.test(mensajeLower))             scores['lv'] += 6;
if (/[ūšžŠŽĖėĮįŲų]/.test(mensajeLower))            scores['lt'] += 6;
// Finés / Estonio
if (/[äöÄÖ]/.test(mensajeLower) && !/[ß]/.test(mensajeLower)) { scores['fi'] += 3; scores['et'] += 3; }
if (/[õÕüÜ]/.test(mensajeLower) && !/[ß]/.test(mensajeLower)) scores['et'] += 4;
// Albanés
if (/[ëËçÇ]/.test(mensajeLower) && !/[àâœã]/.test(mensajeLower)) scores['sq'] += 3;
// Galés
if (/[ŵŵŷŷ]/.test(mensajeLower))                   scores['cy'] += 8;

// 3c. Keywords para los 10 idiomas más frecuentes en Tenerife (peso 2)
const keywords = {
  es: ['hola', 'buenos', 'buenas', 'necesito', 'quiero', 'tengo', 'hay', 'ayuda',
       'gracias', 'urgente', 'urgencia', 'problema', 'avería', 'averia', 'agua',
       'fontanero', 'precio', 'presupuesto', 'cuánto', 'roto', 'fuga', 'grifo'],
  en: ['hello', 'hi', 'hey', 'good morning', 'i need', 'i want', 'i have',
       'help', 'thanks', 'emergency', 'urgent', 'problem', 'broken', 'leak',
       'price', 'quote', 'how much', 'plumber', 'pipe', 'water', 'fix', 'repair'],
  fr: ['bonjour', 'bonsoir', 'salut', "j'ai", 'je ', "c'est", "il y a",
       'besoin', 'aide', 'merci', 'urgence', 'problème', 'probleme', 'fuite',
       'plombier', 'prix', 'devis', 'eau', 'robinet', 'tuyau', 'réparer', 'panne'],
  de: ['hallo', 'guten tag', 'guten morgen', 'ich ', 'mein ', 'meine ',
       'brauche', 'möchte', 'hilfe', 'danke', 'notfall', 'problem', 'leck',
       'klempner', 'preis', 'angebot', 'wasser', 'kaputt', 'rohr', 'hahn'],
  it: ['ciao', 'buongiorno', 'buonasera', 'salve', 'ho un', 'ho una',
       'ho bisogno', 'bisogno', 'voglio', 'aiuto', 'grazie', 'emergenza',
       'problema', 'perdita', 'acqua', 'idraulico', 'prezzo', 'preventivo',
       'rotto', 'rotta', 'rubinetto', 'tubo', 'non funziona', 'urgente'],
  pt: ['olá', 'ola', 'bom dia', 'boa tarde', 'preciso', 'quero', 'tenho',
       'ajuda', 'obrigado', 'obrigada', 'emergência', 'problema', 'vazamento',
       'cano', 'encanador', 'preço', 'orçamento', 'água', 'torneira'],
  nl: ['hallo', 'goedemorgen', 'goedemiddag', 'hoi', 'ik ', 'mijn ',
       'nodig', 'help', 'dank', 'probleem', 'lek', 'loodgieter',
       'prijs', 'offerte', 'water', 'kraan', 'buis', 'spoed', 'kapot'],
  ru: ['привет', 'здравствуйте', 'нужна', 'помощь', 'спасибо', 'срочно',
       'авария', 'протечка', 'водопровод', 'сантехник'],
  pl: ['cześć', 'dzień dobry', 'dobry wieczór', 'potrzebuję', 'pomoc',
       'dziękuję', 'problem', 'wyciek', 'hydraulik', 'cena', 'woda', 'pilne'],
  sv: ['hej', 'god morgon', 'behöver', 'hjälp', 'tack', 'problem',
       'läcka', 'rörmokare', 'pris', 'vatten', 'trasig', 'brådskande'],
  no: ['hei', 'god morgen', 'trenger', 'hjelp', 'takk', 'problem',
       'lekkasje', 'rørlegger', 'pris', 'vann', 'hastverk'],
  da: ['hej', 'godmorgen', 'brug for', 'hjælp', 'tak', 'problem',
       'lækage', 'vvs', 'pris', 'vand', 'akut'],
  de: ['hallo', 'guten tag', 'guten morgen', 'ich ', 'brauche', 'hilfe',
       'danke', 'problem', 'leck', 'klempner', 'preis', 'wasser']
};

for (const [lang, words] of Object.entries(keywords)) {
  if (!scores.hasOwnProperty(lang)) continue;
  for (const w of words) {
    if (mensajeLower.includes(w)) scores[lang] += 2;
  }
}

// ── PASO 4: Resolver ──────────────────────────────────────────────────────────
const maxScore = Math.max(...Object.values(scores));

if (maxScore === 0) {
  // Sin ninguna señal → Telegram o español por defecto
  const fallback = (mapaIdiomas[normCode]) ? normCode : 'es';
  return devolver(fallback, `Sin señales → lang_code: ${telegramCode}`);
}

const candidatos = Object.keys(scores).filter(k => scores[k] === maxScore);

let idiomaFinal;
if (candidatos.length === 1) {
  idiomaFinal = candidatos[0];
} else if (candidatos.includes(normCode)) {
  idiomaFinal = normCode; // Telegram desempata
} else {
  // Desempate: preferencia por idiomas más comunes en Tenerife
  const preferencia = ['es','en','de','fr','it','nl','pt','ru','sv','no','da','pl','cs','hu','ro','fi','et','lv','lt','hr','sl','sk','bg','uk','el','sq','mt','tr'];
  idiomaFinal = preferencia.find(l => candidatos.includes(l)) || candidatos[0];
}

return devolver(
  idiomaFinal,
  `Scores top5: ${Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k}:${v}`).join(' ')} → ${idiomaFinal} (Telegram: ${telegramCode})`
);
