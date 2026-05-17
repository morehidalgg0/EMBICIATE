const { kv } = require('@vercel/kv')

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  if (!hasKvConfig) {
    return res.status(200).json({
      ok: false,
      storage: 'file-fallback',
      message: 'KV no configurado. Usando fallback local.'
    })
  }

  try {
    const pingKey = 'embiciate:health:lastPing'
    const now = new Date().toISOString()
    await kv.set(pingKey, now)
    const value = await kv.get(pingKey)

    return res.status(200).json({
      ok: true,
      storage: 'vercel-kv',
      message: 'KV conectado correctamente',
      lastPing: value
    })
  } catch (error) {
    return res.status(500).json({
      ok: false,
      storage: 'vercel-kv',
      message: 'Error conectando a KV',
      error: error.message
    })
  }
}
