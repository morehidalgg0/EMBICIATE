import { useEffect, useMemo, useState } from 'react'
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../services/productsApi'

const emptyProduct = {
  id: '',
  nombre: '',
  slug: '',
  precio: 0,
  descripcion: '',
  imagen: '/assets/placeholder-bike.svg',
  velocidades: 0,
  rodado: 29,
  frenos: '',
  cuotas: { cantidad: 3, valor: 0 },
  activo: true
}

export default function Admin() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyProduct)
  const [editingId, setEditingId] = useState('')
  const [pass, setPass] = useState('')
  const [auth, setAuth] = useState(false)

  const adminPass = useMemo(() => import.meta.env.VITE_ADMIN_PASS || 'embiciate2026', [])

  async function load() {
    const data = await fetchProducts()
    setProducts(data)
  }

  useEffect(() => {
    if (auth) load()
  }, [auth])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm(p)
  }

  function resetForm() {
    setEditingId('')
    setForm(emptyProduct)
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (editingId) await updateProduct(form)
    else await createProduct({ ...form, id: form.id || crypto.randomUUID() })
    await load()
    resetForm()
  }

  async function onDelete(id) {
    if (!confirm('Eliminar producto?')) return
    await deleteProduct(id)
    await load()
  }

  async function toggleActivo(product) {
    await updateProduct({ ...product, activo: !product.activo })
    await load()
  }

  if (!auth) {
    return (
      <main className="page admin-page">
        <div className="admin-login">
          <h1>Admin Embiciate</h1>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Contraseña" />
          <button className="wa-button" onClick={() => setAuth(pass === adminPass)}>
            Ingresar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page admin-page">
      <h1>Panel de administracion</h1>
      <form className="admin-form" onSubmit={onSubmit}>
        <input value={form.id} onChange={(e) => setField('id', e.target.value)} placeholder="id" required />
        <input value={form.nombre} onChange={(e) => setField('nombre', e.target.value)} placeholder="nombre" required />
        <input value={form.slug} onChange={(e) => setField('slug', e.target.value)} placeholder="slug" required />
        <input type="number" value={form.precio} onChange={(e) => setField('precio', Number(e.target.value))} placeholder="precio" required />
        <textarea value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} placeholder="descripcion" required />
        <input value={form.imagen} onChange={(e) => setField('imagen', e.target.value)} placeholder="/assets/archivo.jpg" required />
        <input type="number" value={form.velocidades} onChange={(e) => setField('velocidades', Number(e.target.value))} placeholder="velocidades" required />
        <input type="number" value={form.rodado} onChange={(e) => setField('rodado', Number(e.target.value))} placeholder="rodado" required />
        <input value={form.frenos} onChange={(e) => setField('frenos', e.target.value)} placeholder="frenos" required />
        <input
          type="number"
          value={form.cuotas.cantidad}
          onChange={(e) => setForm((prev) => ({ ...prev, cuotas: { ...prev.cuotas, cantidad: Number(e.target.value) } }))}
          placeholder="cuotas cantidad"
          required
        />
        <input
          type="number"
          value={form.cuotas.valor}
          onChange={(e) => setForm((prev) => ({ ...prev, cuotas: { ...prev.cuotas, valor: Number(e.target.value) } }))}
          placeholder="cuotas valor"
          required
        />
        <label className="checkbox-row">
          <input type="checkbox" checked={form.activo} onChange={(e) => setField('activo', e.target.checked)} /> Activo
        </label>
        <div className="form-actions">
          <button type="submit" className="wa-button">{editingId ? 'Guardar cambios' : 'Agregar producto'}</button>
          <button type="button" className="btn-outline" onClick={resetForm}>Limpiar</button>
        </div>
      </form>

      <div className="admin-list">
        {products.map((p) => (
          <article key={p.id} className="admin-item">
            <div>
              <strong>{p.nombre}</strong>
              <p>{p.slug}</p>
            </div>
            <div className="admin-actions">
              <button className="btn-outline" onClick={() => startEdit(p)}>Editar</button>
              <button className="btn-outline" onClick={() => toggleActivo(p)}>{p.activo ? '👁️ Ocultar' : '👁️ Mostrar'}</button>
              <button className="btn-outline danger" onClick={() => onDelete(p.id)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
