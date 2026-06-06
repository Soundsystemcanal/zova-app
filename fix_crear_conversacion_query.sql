-- ─────────────────────────────────────────────────────────────────────────────
-- Query corregida para el nodo "Crear Conversación"
--
-- PROBLEMA ORIGINAL: COALESCE bloqueaba actualizaciones de idioma
--   idioma_cliente = COALESCE(conversaciones.idioma_cliente, '{{ nuevo }}')
--   → Si ya existía 'es' (detección incorrecta), nunca se sobreescribía
--
-- FIX: Actualizar siempre con el idioma recién detectado
--   El idioma se re-detecta en cada mensaje → siempre refleja el texto actual
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO conversaciones (autonomo_id, canal, cliente_tel, estado, idioma_cliente)
VALUES (
  '{{ $node["Cargar Perfil Autónomo"].json.id }}',
  'telegram',
  '{{ $node["Telegram Trigger"].json.message.chat.id }}',
  'abierta',
  '{{ $node["Detectar Idioma"].json.codigoIdioma || "es" }}'
)
ON CONFLICT (autonomo_id, cliente_tel)
DO UPDATE SET
  estado = conversaciones.estado,
  idioma_cliente = '{{ $node["Detectar Idioma"].json.codigoIdioma || "es" }}'
RETURNING id, idioma_cliente
