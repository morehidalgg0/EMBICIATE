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
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const adminPass = useMemo(() => import.meta.env.VITE_ADMIN_PASS || 'embiciate2026', [])

  async function load() {
    try {
      const data = await fetchProducts()
      setProducts(data)
    } catch {
      setError('No se pudo cargar el listado de productos.')
    }
  }

  useEffect(() => {
    if (auth) load()
  }, [auth])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setCuotasField(key, value) {
    setForm((prev) => ({ ...prev, cuotas: { ...prev.cuotas, [key]: Number(value) } }))
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  function onNombreChange(value) {
    setForm((prev) => ({
      ...prev,
      nombre: value,
      slug: prev.slug && editingId ? prev.slug : slugify(value)
    }))
  }

  function onImageUpload(file) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen válida.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setField('imagen', String(reader.result || ''))
      setError('')
    }
    reader.onerror = () => setError('No se pudo leer la imagen.')
    reader.readAsDataURL(file)
  }

  function startEdit(p) {
    setEditingId(p.id)
    setForm({
      ...emptyProduct,
      ...p,
      cuotas: {
        cantidad: p?.cuotas?.cantidad ?? 3,
        valor: p?.cuotas?.valor ?? 0
      }
    })
    setError('')
  }

  function resetForm() {
    setEditingId('')
    setForm(emptyProduct)
    setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingId) await updateProduct(form)
      else await createProduct({ ...form, id: form.id || crypto.randomUUID() })
      await load()
      resetForm()
    } catch {
      setError('No se pudo guardar. Revisá los datos e intentá de nuevo.')
    } finally {
      setSaving(false)
    }
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
          <p>Ingresá tu contraseña para administrar productos.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Contraseña" />
          <button
            className="wa-button"
            onClick={() => {
              if (pass === adminPass) {
                setAuth(true)
                setError('')
              } else {
                setError('Contraseña incorrecta.')
              }
            }}
          >
            Ingresar
          </button>
          {error ? <small className="error-text">{error}</small> : null}
        </div>
      </main>
    )
  }

  return (
    <main className="page admin-page">
      <div className="admin-header">
        <h1>Panel de administracion</h1>
        <p>Agregá, editá y activá productos desde celular o computadora en segundos.</p>
      </div>

      {error ? <div className="admin-alert">{error}</div> : null}

      <form className="admin-form" onSubmit={onSubmit}>
        <div className="admin-grid two-col">
          <label>
            ID interno
            <input value={form.id} onChange={(e) => setField('id', e.target.value)} placeholder="firebird-r29" required />
          </label>
          <label>
            Nombre
            <input value={form.nombre} onChange={(e) => onNombreChange(e.target.value)} placeholder="Firebird Rodado 29" required />
          </label>
          <label>
            Slug (URL)
            <input value={form.slug} onChange={(e) => setField('slug', slugify(e.target.value))} placeholder="firebird-rodado-29" required />
          </label>
          <label>
            Precio
            <input type="number" value={form.precio} onChange={(e) => setField('precio', Number(e.target.value))} placeholder="269900" required />
          </label>
        </div>

        <label>
          Descripcion
          <textarea value={form.descripcion} onChange={(e) => setField('descripcion', e.target.value)} placeholder="Descripcion del modelo" required />
        </label>

        <div className="admin-upload-card">
          <div>
            <strong>Foto del producto</strong>
            <p>Podés pegar una URL o subir una imagen desde tu celular/computadora.</p>
          </div>
          <label>
            URL de imagen
            <input value={form.imagen} onChange={(e) => setField('imagen', e.target.value)} placeholder="/assets/firebird.jpg o https://..." required />
          </label>
          <label className="upload-dropzone">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => onImageUpload(e.target.files?.[0])}
            />
            <span>📷 Tocar para subir imagen (móvil o PC)</span>
          </label>
          <div className="admin-preview-wrap">
            <img
              src={form.imagen || '/assets/placeholder-bike.svg'}
              alt="Preview"
              className="admin-image-preview"
              onError={(e) => {
                e.currentTarget.src = '/assets/placeholder-bike.svg'
              }}
            />
          </div>
        </div>

        <div className="admin-grid three-col">
          <label>
            Velocidades
            <input type="number" value={form.velocidades} onChange={(e) => setField('velocidades', Number(e.target.value))} placeholder="21" required />
          </label>
          <label>
            Rodado
            <input type="number" value={form.rodado} onChange={(e) => setField('rodado', Number(e.target.value))} placeholder="29" required />
          </label>
          <label>
            Frenos
            <input value={form.frenos} onChange={(e) => setField('frenos', e.target.value)} placeholder="disco hidraulico" required />
          </label>
        </div>

        <div className="admin-grid two-col">
          <label>
            Cuotas (cantidad)
            <input type="number" value={form.cuotas.cantidad} onChange={(e) => setCuotasField('cantidad', e.target.value)} placeholder="3" required />
          </label>
          <label>
            Valor por cuota
            <input type="number" value={form.cuotas.valor} onChange={(e) => setCuotasField('valor', e.target.value)} placeholder="89967" required />
          </label>
        </div>

        <label className="checkbox-row">
          <input type="checkbox" checked={form.activo} onChange={(e) => setField('activo', e.target.checked)} /> Mostrar en web
        </label>
        <div className="form-actions">
          <button type="submit" className="wa-button" disabled={saving}>
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar producto'}
          </button>
          <button type="button" className="btn-outline" onClick={resetForm}>Limpiar</button>
        </div>
      </form>

      <div className="admin-list">
        {products.map((p) => (
          <article key={p.id} className="admin-item">
            <div className="admin-item-main">
              <img
                src={p.imagen || '/assets/placeholder-bike.svg'}
                alt={p.nombre}
                className="admin-thumb"
                onError={(e) => {
                  e.currentTarget.src = '/assets/placeholder-bike.svg'
                }}
              />
              <div>
                <strong>{p.nombre}</strong>
                <p>/{p.slug}</p>
                <small className={p.activo ? 'pill on' : 'pill off'}>{p.activo ? 'Visible' : 'Oculto'}</small>
              </div>
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
