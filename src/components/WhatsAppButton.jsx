import { buildWhatsAppLink, DEFAULT_WA_NUMBER } from '../utils/whatsapp'

export default function WhatsAppButton({ model, compact = false }) {
  const message = model
    ? `Hola! Me interesa la ${model}, ¿está disponible?`
    : 'Hola! Vengo de la pagina web de Embiciate y quiero hacer una consulta.'

  return (
    <a
      className={compact ? 'wa-button wa-compact' : 'wa-button'}
      href={buildWhatsAppLink(DEFAULT_WA_NUMBER, message)}
      target="_blank"
      rel="noreferrer"
    >
      {compact ? 'WhatsApp' : 'Consultar por WhatsApp'}
    </a>
  )
}
