const fs = require('node:fs/promises')
const path = require('node:path')
const { kv } = require('@vercel/kv')

const FILE_PATH = path.join(process.cwd(), 'public', 'products.json')
const KV_KEY = 'embiciate:products'
const hasKvConfig = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

async function readProducts() {
  const seed = await readSeedProducts()

  if (hasKvConfig) {
    const fromKv = await kv.get(KV_KEY)
    if (Array.isArray(fromKv)) {
      const merged = mergeSeedProducts(fromKv, seed)
      if (merged.length !== fromKv.length) await kv.set(KV_KEY, merged)
      return merged
    }
  }

  if (hasKvConfig && seed.length) await kv.set(KV_KEY, seed)
  return seed
}

async function readSeedProducts() {
  try {
    const raw = await fs.readFile(FILE_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mergeSeedProducts(products, seed) {
  if (!Array.isArray(seed) || seed.length === 0) return products
  const currentIds = new Set(products.map((product) => product.id))
  const missing = seed.filter((product) => product.id && !currentIds.has(product.id))
  return missing.length ? [...products, ...missing] : products
}

async function writeProducts(products) {
  if (hasKvConfig) {
    await kv.set(KV_KEY, products)
    return
  }
  await fs.writeFile(FILE_PATH, JSON.stringify(products, null, 2), 'utf-8')
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'GET') {
    const products = await readProducts()
    return res.status(200).json(products)
  }

  if (req.method === 'POST') {
    const products = await readProducts()
    const product = req.body
    products.push(product)
    await writeProducts(products)
    return res.status(201).json(product)
  }

  if (req.method === 'PUT') {
    const products = await readProducts()
    const incoming = req.body
    const index = products.findIndex((p) => p.id === incoming.id)
    if (index === -1) return res.status(404).json({ message: 'Producto no encontrado' })
    products[index] = incoming
    await writeProducts(products)
    return res.status(200).json(incoming)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    const products = await readProducts()
    const next = products.filter((p) => p.id !== id)
    await writeProducts(next)
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ message: 'Metodo no permitido' })
}
