export function buildWhatsAppLink(number, message) {
  const clean = (number || '').replace(/\D/g, '')
  if (!clean) return '#'
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export const DEFAULT_WA_NUMBER = '5492235505397'
