// ═══════════════════════════════════════════════════════════════════════
// DETECTAR IDIOMA v3
// Cambios vs v2:
//   - ELIMINADO el shortcut "≤2 palabras → confiar en Telegram"
//     (causaba que "hello"/"salut" se detectaran como español)
//   - Telegram language_code: peso reducido 5→3 (tiebreaker, no dominante)
//   - Strong keywords (saludos inequívocos): peso 6
//   - Regular keywords: peso 3
// ═══════════════════════════════════════════════════════════════════════

const telegramData = $('Telegram Trigger').first().json;
const mensaje      = (telegramData.message?.text || '').trim();
const mensajeLower = mensaje.toLowerCase();
const chatId       = telegramData.message?.chat?.id;
const telegramCode = (telegramData.message?.from?.language_code || '').toLowerCase().split('-')[0];

const aliasCode = { 'nb':'no','nn':'no','zh-hans':'zh','zh-hant':'zh','iw':'he','in':'id' };
const normCode  = aliasCode[telegramCode] || telegramCode;

const mapaIdiomas = {
  'es':{ es:'español',        en:'Spanish'       }, 'en':{ es:'inglés',        en:'English'       },
  'fr':{ es:'francés',        en:'French'        }, 'de':{ es:'alemán',        en:'German'        },
  'pt':{ es:'portugués',      en:'Portuguese'    }, 'it':{ es:'italiano',      en:'Italian'       },
  'nl':{ es:'neerlandés',     en:'Dutch'         }, 'pl':{ es:'polaco',        en:'Polish'        },
  'ru':{ es:'ruso',           en:'Russian'       }, 'uk':{ es:'ucraniano',     en:'Ukrainian'     },
  'sv':{ es:'sueco',          en:'Swedish'       }, 'no':{ es:'noruego',       en:'Norwegian'     },
  'da':{ es:'danés',          en:'Danish'        }, 'fi':{ es:'finés',         en:'Finnish'       },
  'cs':{ es:'checo',          en:'Czech'         }, 'sk':{ es:'eslovaco',      en:'Slovak'        },
  'hu':{ es:'húngaro',        en:'Hungarian'     }, 'ro':{ es:'rumano',        en:'Romanian'      },
  'hr':{ es:'croata',         en:'Croatian'      }, 'sl':{ es:'esloveno',      en:'Slovenian'     },
  'bg':{ es:'búlgaro',        en:'Bulgarian'     }, 'el':{ es:'griego',        en:'Greek'         },
  'lv':{ es:'letón',          en:'Latvian'       }, 'lt':{ es:'lituano',       en:'Lithuanian'    },
  'et':{ es:'estonio',        en:'Estonian'      }, 'sq':{ es:'albanés',       en:'Albanian'      },
  'sr':{ es:'serbio',         en:'Serbian'       }, 'bs':{ es:'bosnio',        en:'Bosnian'       },
  'mk':{ es:'macedonio',      en:'Macedonian'    }, 'mt':{ es:'maltés',        en:'Maltese'       },
  'is':{ es:'islandés',       en:'Icelandic'     }, 'ga':{ es:'irlandés',      en:'Irish'         },
  'cy':{ es:'galés',          en:'Welsh'         }, 'ca':{ es:'catalán',       en:'Catalan'       },
  'gl':{ es:'gallego',        en:'Galician'      }, 'eu':{ es:'euskera',       en:'Basque'        },
  'lb':{ es:'luxemburgués',   en:'Luxembourgish' }, 'be':{ es:'bielorruso',    en:'Belarusian'    },
  'tr':{ es:'turco',          en:'Turkish'       }, 'ar':{ es:'árabe',         en:'Arabic'        },
  'zh':{ es:'chino',          en:'Chinese'       }, 'ja':{ es:'japonés',       en:'Japanese'      },
  'he':{ es:'hebreo',         en:'Hebrew'        },
};

const devolver = (codigo, motivo) => {
  const r = mapaIdiomas[codigo] || { es:'español', en:'Spanish' };
  const cod = mapaIdiomas[codigo] ? codigo : 'es';
  return [{ json: { idiomaDetectado: r.es, idiomaNombreEN: r.en, codigoIdioma: cod,
                    mensajeOriginal: mensajeLower, chatId, debugInfo: motivo } }];
};

// ── 1. Sólo numérico puro → Telegram (es un botón del menú) ──────────────────
if (/^\d+$/.test(mensaje)) {
  return devolver(mapaIdiomas[normCode] ? normCode : 'es', `Numérico → Telegram: ${telegramCode}`);
}

// ── 2. Scripts no-latinos → detección directa por Unicode ────────────────────
if (/[Ѐ-ӿ]/.test(mensaje)) {
  const cir = ['ru','uk','bg','sr','mk','be'];
  return devolver(cir.includes(normCode) ? normCode : 'ru', `Cirílico → ${normCode}`);
}
if (/[Ͱ-Ͽἀ-῿]/.test(mensaje)) return devolver('el', 'Griego');
if (/[؀-ۿ]/.test(mensaje))    return devolver('ar', 'Árabe');
if (/[֐-׿]/.test(mensaje))    return devolver('he', 'Hebreo');
if (/[一-鿿぀-ヿ가-힯]/.test(mensaje)) {
  return devolver({'ja':'ja','ko':'ko','zh':'zh'}[normCode] || 'zh', `CJK → ${normCode}`);
}

// ── 3. Puntuación por señales (script latino) ─────────────────────────────────
let scores = {};
for (const c of Object.keys(mapaIdiomas)) scores[c] = 0;

// 3a. Telegram language_code — peso 3 (tiebreaker, NO dominante sobre el texto)
if (normCode && mapaIdiomas[normCode]) scores[normCode] += 3;

// 3b. Diacríticos exclusivos — peso muy alto (8)
if (/[ñ¿¡]/.test(mensajeLower))                                     scores['es'] += 8;
if (/ß/.test(mensajeLower))                                          scores['de'] += 8;
if (/[ãõÃÕ]/.test(mensajeLower))                                     scores['pt'] += 8;
if (/[åÅ]/.test(mensajeLower))       { scores['sv']+=5; scores['no']+=4; scores['da']+=4; }
if (/[æÆ]/.test(mensajeLower))       { scores['da']+=5; scores['no']+=4; scores['sv']+=3; }
if (/[øØ]/.test(mensajeLower))       { scores['no']+=5; scores['da']+=4; }
if (/[þÞðÐ]/.test(mensajeLower))     scores['is'] += 8;
if (/[äöüÄÖÜ]/.test(mensajeLower) && !/ß/.test(mensajeLower)) scores['de'] += 4;
if (/ç/.test(mensajeLower) && !/[ãõ]/.test(mensajeLower))     scores['fr'] += 5;
if (/[àâœÀÂŒ]/.test(mensajeLower))   scores['fr'] += 4;
if (/[éèêëîïùûÉÈ]/.test(mensajeLower)) scores['fr'] += 2;
if (/[àèìòùÀÈÌÒÙ]/.test(mensajeLower) && !/[ãõàâœç]/.test(mensajeLower)) scores['it'] += 4;
if (/[łŁżŻźŹćĆńŃśŚ]/.test(mensajeLower))  scores['pl'] += 8;
if (/[čšžřČŠŽŘ]/.test(mensajeLower))      { scores['cs']+=6; scores['sk']+=5; scores['hr']+=4; }
if (/[ůŮ]/.test(mensajeLower))             scores['cs'] += 4;
if (/[ľĽ]/.test(mensajeLower))             scores['sk'] += 6;
if (/[őŐűŰ]/.test(mensajeLower))           scores['hu'] += 8;
if (/[țșȚȘăĂîÎ]/.test(mensajeLower))      scores['ro'] += 8;
if (/[ūŪģĢķĶļĻņŅ]/.test(mensajeLower))    scores['lv'] += 6;
if (/[ūšžŠŽĖėĮįŲų]/.test(mensajeLower))   scores['lt'] += 6;
if (/[ąęĄĘ]/.test(mensajeLower) && !/[łŁżŻ]/.test(mensajeLower)) { scores['lt']+=3; scores['lv']+=3; }

// 3c. Strong keywords — saludos inequívocos (peso 6)
// Identifican el idioma con una sola palabra
const strongKW = {
  es: ['hola', 'buenas', 'buenos días', 'buenos dias', '¿', '¡hola'],
  en: ['hello', ' hi ', 'hey ', 'good morning', 'good afternoon', 'good evening', 'howdy'],
  fr: ['bonjour', 'bonsoir', 'bonne nuit', 'salut', 'allô', 'allo', 'coucou'],
  de: ['hallo', 'guten tag', 'guten morgen', 'guten abend', 'servus', 'moin', 'grüß gott'],
  it: ['ciao', 'buongiorno', 'buonasera', 'buona sera', 'salve'],
  pt: ['olá', 'ola!', 'bom dia', 'boa tarde', 'boa noite'],
  nl: ['hallo', 'goedemorgen', 'goedemiddag', 'goedenavond', 'hoi ', 'dag '],
  ru: ['привет', 'здравствуйте', 'добрый день', 'добрый вечер'],
  pl: ['cześć', 'dzień dobry', 'dobry wieczór', 'witam'],
  sv: ['hej ', 'hejsan', 'god morgon', 'god kväll', 'hallå'],
  no: ['hei ', 'god morgen', 'god kveld', 'hallo'],
  da: ['hej ', 'godmorgen', 'godaften', 'hejsa'],
  fi: ['hei ', 'hyvää huomenta', 'hyvää päivää', 'terve'],
  et: ['tere ', 'tere hommikust', 'tere päevast'],
  lv: ['labdien', 'labrīt', 'labvakar'],
  lt: ['laba diena', 'labas rytas', 'labas vakaras', 'labas'],
  hu: ['helló', 'jó reggelt', 'jó napot', 'szia'],
  cs: ['dobrý den', 'dobré ráno', 'ahoj ', 'dobrý večer'],
  sk: ['dobrý deň', 'dobré ráno', 'ahoj '],
  ro: ['bună ziua', 'bună dimineaţa', 'bună seara', 'salut '],
  hr: ['dobar dan', 'dobro jutro', 'dobra večer', 'bok '],
  el: ['γεια', 'καλημέρα', 'καλησπέρα'],
  tr: ['merhaba', 'günaydın', 'iyi günler'],
  ar: ['مرحبا', 'السلام', 'صباح'],
};

// Prepend/append space to mensaje para detectar palabras sueltas como "hi"
const mensajePad = ' ' + mensajeLower + ' ';
for (const [lang, words] of Object.entries(strongKW)) {
  if (!scores.hasOwnProperty(lang)) continue;
  for (const w of words) {
    if (mensajePad.includes(w)) scores[lang] += 6;
  }
}

// 3d. Regular keywords — frases comunes en el contexto fontanería (peso 3)
const keywords = {
  es: ['necesito', 'quiero', 'tengo', 'ayuda', 'gracias', 'urgente', 'urgencia',
       'problema', 'avería', 'averia', 'agua', 'fontanero', 'precio', 'presupuesto',
       'cuánto', 'roto', 'rota', 'fuga', 'grifo', 'tubería'],
  en: ['i need', 'i want', 'i have', 'help', 'thanks', 'emergency', 'urgent',
       'problem', 'broken', 'leak', 'price', 'quote', 'how much', 'plumber',
       'pipe', 'water', 'fix', 'repair', 'flooding'],
  fr: ["j'ai", 'je ', "c'est", "il y a", 'besoin', 'aide', 'merci', 'urgence',
       'problème', 'probleme', 'fuite', 'plombier', 'prix', 'devis', 'eau',
       'robinet', 'tuyau', 'panne', "d'eau"],
  de: ['ich ', 'mein ', 'brauche', 'möchte', 'hilfe', 'danke', 'notfall',
       'problem', 'leck', 'klempner', 'preis', 'wasser', 'kaputt', 'rohr'],
  it: ["j'ai",'ho un','ho una','ho bisogno','bisogno','voglio','aiuto','grazie',
       'emergenza','problema','perdita','acqua','idraulico','prezzo','preventivo',
       'rotto','rotta','rubinetto','tubo','non funziona'],
  pt: ['preciso', 'quero', 'tenho', 'ajuda', 'obrigado', 'obrigada',
       'emergência','problema','vazamento','cano','encanador','preço','água'],
  nl: ['ik ', 'mijn ', 'nodig', 'help', 'dank', 'probleem', 'lek',
       'loodgieter', 'prijs', 'water', 'kraan', 'buis', 'kapot'],
  pl: ['potrzebuję','pomoc','dziękuję','problem','wyciek','hydraulik',
       'cena','woda','pilne','awaria'],
  sv: ['behöver','hjälp','tack','problem','läcka','rörmokare','pris','vatten','trasig'],
  no: ['trenger','hjelp','takk','problem','lekkasje','rørlegger','pris','vann'],
  da: ['brug for','hjælp','tak','problem','lækage','vvs','pris','vand'],
  ru: ['нужна','помощь','спасибо','срочно','авария','протечка','сантехник'],
};

for (const [lang, words] of Object.entries(keywords)) {
  if (!scores.hasOwnProperty(lang)) continue;
  for (const w of words) {
    if (mensajeLower.includes(w)) scores[lang] += 3;
  }
}

// ── 4. Resolver ───────────────────────────────────────────────────────────────
const maxScore = Math.max(...Object.values(scores));

if (maxScore === 0) {
  // Sin señales → Telegram o español
  return devolver(mapaIdiomas[normCode] ? normCode : 'es',
    `Sin señales → Telegram: ${telegramCode}`);
}

const candidatos = Object.keys(scores).filter(k => scores[k] === maxScore);
let idiomaFinal;

if (candidatos.length === 1) {
  idiomaFinal = candidatos[0];
} else if (candidatos.includes(normCode)) {
  idiomaFinal = normCode; // Telegram desempata en caso de empate real
} else {
  const pref = ['es','en','de','fr','it','nl','pt','ru','sv','no','da','pl',
                'cs','hu','ro','fi','et','lv','lt','hr','sl','sk','bg','uk',
                'el','sq','mt','tr','ca','gl'];
  idiomaFinal = pref.find(l => candidatos.includes(l)) || candidatos[0];
}

// Debug: top 5 scores para verificación
const top5 = Object.entries(scores)
  .filter(([,v]) => v > 0)
  .sort((a,b) => b[1]-a[1])
  .slice(0,5)
  .map(([k,v]) => `${k}:${v}`)
  .join(' ');

return devolver(idiomaFinal, `[${top5}] → ${idiomaFinal} (Telegram:${telegramCode})`);
