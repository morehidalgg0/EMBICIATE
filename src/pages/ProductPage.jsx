import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import WhatsAppButton from '../components/WhatsAppButton'
import { fetchProducts } from '../services/productsApi'

function money(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
      .then((items) => setProduct(items.find((p) => p.slug === slug) || null))
      .catch(() => setProduct(null))
  }, [slug])

  if (!product) {
    return (
      <main className="page product-page">
        <p>Producto no encontrado.</p>
        <Link to="/" className="btn-outline">
          Volver
        </Link>
      </main>
    )
  }

  return (
    <main className="page product-page">
      <Link to="/" className="btn-outline">
        ← Volver al inicio
      </Link>
      <div className="product-detail">
        <img
          src={product.imagen}
          alt={product.nombre}
          onError={(e) => {
            e.currentTarget.src = '/assets/placeholder-bike.svg'
          }}
        />
        <div>
          <h1>{product.nombre}</h1>
          <p className="price">{money(product.precio)}</p>
          <p>{product.descripcion}</p>
          <ul>
            <li>Velocidades: {product.velocidades}</li>
            <li>Rodado: {product.rodado}</li>
            <li>Frenos: {product.frenos}</li>
            <li>
              Cuotas: {product.cuotas.cantidad} de {money(product.cuotas.valor)}
            </li>
          </ul>
          <WhatsAppButton model={product.nombre} />
        </div>
      </div>
    </main>
  )
}
