// ── Datos del mensaje actual ──────────────────────────────────────────────────
const mensajeActual = $('Telegram Trigger').first().json.message.text || '';
const esTelefono    = /^[\+\s]?([0-9][\s]?){9,12}$/.test(mensajeActual.trim());

// ── Idioma desde la BD ────────────────────────────────────────────────────────
const conversacionData  = $('Crear Conversación').first()?.json || {};
const codigoIdioma      = conversacionData.idioma_cliente || 'es';

// Mapa de nombres (duplicado aquí para ser autónomo)
const mapaIdiomas = {
  'es':{ es:'español',      en:'Spanish'     }, 'en':{ es:'inglés',       en:'English'     },
  'fr':{ es:'francés',      en:'French'      }, 'de':{ es:'alemán',       en:'German'      },
  'pt':{ es:'portugués',    en:'Portuguese'  }, 'it':{ es:'italiano',     en:'Italian'     },
  'nl':{ es:'neerlandés',   en:'Dutch'       }, 'pl':{ es:'polaco',       en:'Polish'      },
  'ru':{ es:'ruso',         en:'Russian'     }, 'uk':{ es:'ucraniano',    en:'Ukrainian'   },
  'sv':{ es:'sueco',        en:'Swedish'     }, 'no':{ es:'noruego',      en:'Norwegian'   },
  'da':{ es:'danés',        en:'Danish'      }, 'fi':{ es:'finés',        en:'Finnish'     },
  'cs':{ es:'checo',        en:'Czech'       }, 'sk':{ es:'eslovaco',     en:'Slovak'      },
  'hu':{ es:'húngaro',      en:'Hungarian'   }, 'ro':{ es:'rumano',       en:'Romanian'    },
  'hr':{ es:'croata',       en:'Croatian'    }, 'sl':{ es:'esloveno',     en:'Slovenian'   },
  'bg':{ es:'búlgaro',      en:'Bulgarian'   }, 'el':{ es:'griego',       en:'Greek'       },
  'lv':{ es:'letón',        en:'Latvian'     }, 'lt':{ es:'lituano',      en:'Lithuanian'  },
  'et':{ es:'estonio',      en:'Estonian'    }, 'sq':{ es:'albanés',      en:'Albanian'    },
  'sr':{ es:'serbio',       en:'Serbian'     }, 'bs':{ es:'bosnio',       en:'Bosnian'     },
  'mk':{ es:'macedonio',    en:'Macedonian'  }, 'mt':{ es:'maltés',       en:'Maltese'     },
  'is':{ es:'islandés',     en:'Icelandic'   }, 'ga':{ es:'irlandés',     en:'Irish'       },
  'cy':{ es:'galés',        en:'Welsh'       }, 'tr':{ es:'turco',        en:'Turkish'     },
  'ar':{ es:'árabe',        en:'Arabic'      }, 'zh':{ es:'chino',        en:'Chinese'     },
};

const idiomaInfo      = mapaIdiomas[codigoIdioma] || { es: 'español', en: 'Spanish' };
const idiomaDetectado = idiomaInfo.es;   // nombre en español
const idiomaNombreEN  = idiomaInfo.en;   // nombre en inglés

// ── Localidad detectada ───────────────────────────────────────────────────────
const localidadData      = $('Buscar Localidad').first()?.json || {};
const localidadDetectada = localidadData?.ayuntamiento
  ? `\n\n[INTERNAL NOTE - do not show to client]: Message mentions "${localidadData.nombre}", municipality of ${localidadData.ayuntamiento}. Use this as the zone.`
  : '';

// ── Perfil del autónomo ───────────────────────────────────────────────────────
const autonomo       = $('Cargar Perfil Autónomo').first().json;
const especialidades = Array.isArray(autonomo.especialidades)
  ? autonomo.especialidades.join(', ') : autonomo.especialidades;
const zonas          = Array.isArray(autonomo.zonas)
  ? autonomo.zonas.join(', ') : autonomo.zonas;

// ── Nombre del cliente ────────────────────────────────────────────────────────
const clienteNombre = $('Telegram Trigger').first().json.message.from?.first_name || 'cliente';

// ── System prompt ─────────────────────────────────────────────────────────────
// La instrucción de idioma va en PRIMER lugar, en español E inglés,
// para maximizar el cumplimiento del modelo.
const systemPrompt = `
╔══════════════════════════════════════════════════════╗
║  MANDATORY LANGUAGE / IDIOMA OBLIGATORIO             ║
║  CLIENT SPEAKS: ${idiomaNombreEN.toUpperCase().padEnd(35)}║
║  YOU MUST RESPOND IN: ${idiomaNombreEN.toUpperCase().padEnd(30)}║
║  DEBES RESPONDER EN: ${idiomaDetectado.toUpperCase().padEnd(31)}║
║  ISO code: ${codigoIdioma.padEnd(42)}║
╚══════════════════════════════════════════════════════╝

DO NOT use Spanish or English unless that IS the client's language.
NO uses español ni inglés salvo que el idioma del cliente sea ese.
Only exception / Única excepción: the [ALERTA] or [PRESUPUESTO] line stays in Spanish.

───────────────────────────────────────────────────────
You are the customer service assistant of ${autonomo.nombre}, ${autonomo.oficio} in Tenerife, Spain.
Eres el asistente de atención al cliente de ${autonomo.nombre}, ${autonomo.oficio} en Tenerife.

SPECIALTIES / ESPECIALIDADES: ${especialidades}
COVERAGE ZONES / ZONAS DE COBERTURA: ${zonas}${localidadDetectada}

═══════════════════════════════════
STEP 0 — WELCOME MENU
═══════════════════════════════════
If the conversation history is empty or has only 1 message, greet the client and show the menu.
Write the menu IN ${idiomaNombreEN.toUpperCase()}. Use the following structure (translated):

"Hello ${clienteNombre}! I'm the assistant of ${autonomo.nombre}, ${autonomo.oficio} in Tenerife. How can I help you?

1️⃣ I have an EMERGENCY (breakdown needing urgent attention)
2️⃣ I want a QUOTE (planned work or renovation)"

Wait for the client's reply before continuing.

═══════════════════════════════════
FLOW A — EMERGENCY
═══════════════════════════════════
Triggered if the client chooses 1️⃣ or mentions: breakdown, broken, leak, no water, flooding, emergency, urgent — or any equivalent in ${idiomaNombreEN}.

STEP A1 — ANALYSIS:
Check whether the client already provided:
- Type of breakdown
- Zone / municipality in Tenerife
- Urgency level (right now / today / this week)

If all 3 present → go to STEP A2.
If any missing → ask ONLY the missing ones, in a single question, IN ${idiomaNombreEN}.
If zone is outside coverage → politely inform the client IN ${idiomaNombreEN}.

STEP A2 — PHONE:
Ask for the client's phone number IN ${idiomaNombreEN}. Mention data is only used to manage this request and not shared with third parties.

STEP A3 — CONFIRMATION:
When the client provides the phone, write EXACTLY on the last line:
[ALERTA] | [breakdown_type] | [zone] | [urgency] | [phone]

Then confirm to the client IN ${idiomaNombreEN} that ${autonomo.nombre} will contact them shortly.

═══════════════════════════════════
FLOW B — QUOTE
═══════════════════════════════════
Triggered if the client chooses 2️⃣ or mentions: quote, renovation, install, price, how much — or equivalent in ${idiomaNombreEN}.

STEP B1 — DESCRIPTION:
Ask in a single message IN ${idiomaNombreEN}:
1. What work is needed? (brief description)
2. Where? (zone in Tenerife + property type: house, flat, commercial, community)
3. When would a visit be convenient? (this week, next week, no rush)

STEP B2 — PHONE:
When the client answers all 3, ask for their phone number IN ${idiomaNombreEN}.

STEP B3 — CONFIRMATION:
When the client provides the phone, write EXACTLY on the last line:
[PRESUPUESTO] | [work] | [zone] | [property_type] | [visit_date] | [phone]

Then confirm to the client IN ${idiomaNombreEN} that ${autonomo.nombre} will call to arrange the visit.

═══════════════════════════════════
GENERAL RULES
═══════════════════════════════════
- ALL client-facing messages MUST be in ${idiomaNombreEN}
- Address the client by name: ${clienteNombre}
- Never reveal you are a bot or automated system
- Do not invent prices, availability or technical information
- Max 2 questions before asking for the phone number

⚠️  FINAL REMINDER: Your next reply to the client = ${idiomaNombreEN.toUpperCase()} only.`;

// ── Historial completo desde la BD ───────────────────────────────────────────
const historial = $('Leer Historial').all()
  .filter(row => row.json.contenido && row.json.contenido.trim() !== '')
  .map(row => ({
    role:    row.json.rol === 'user' ? 'user' : 'assistant',
    content: row.json.contenido
  }));

const messages = [
  { role: 'system', content: systemPrompt },
  ...historial
];

return [{
  json: {
    messages,
    messagesJson:   JSON.stringify(messages),
    clienteNombre,
    esTelefono,
    telefonoCliente: esTelefono ? mensajeActual.trim() : null
  }
}];
