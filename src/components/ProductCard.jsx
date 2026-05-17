import { Link } from 'react-router-dom'
import WhatsAppButton from './WhatsAppButton'

function money(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

export default function ProductCard({ product }) {
  return (
    <article className="product-card">
      <img
        src={product.imagen}
        alt={product.nombre}
        className="product-image"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/assets/placeholder-bike.svg'
        }}
      />
      <div className="product-body">
        <h3>{product.nombre}</h3>
        <p className="price">{money(product.precio)}</p>
        <p className="specs">Rodado {product.rodado} · {product.velocidades} velocidades · {product.frenos}</p>
        <p className="cuotas">{product.cuotas.cantidad} cuotas de {money(product.cuotas.valor)}</p>
        <div className="product-actions">
          <Link to={`/productos/${product.slug}`} className="btn-outline">
            Ver detalle
          </Link>
          <WhatsAppButton model={product.nombre} />
        </div>
      </div>
    </article>
  )
}
