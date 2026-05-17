const API_URL = '/api/products'

export async function fetchProducts() {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('No se pudieron cargar productos')
  return res.json()
}

export async function createProduct(product) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
  if (!res.ok) throw new Error('No se pudo crear producto')
  return res.json()
}

export async function updateProduct(product) {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
  if (!res.ok) throw new Error('No se pudo actualizar producto')
  return res.json()
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('No se pudo eliminar producto')
  return res.json()
}
