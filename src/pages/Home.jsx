import { useEffect, useMemo, useState } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ProductCard from '../components/ProductCard'
import UrgenciaBanner from '../components/UrgenciaBanner'
import WhatsAppButton from '../components/WhatsAppButton'
import { fetchProducts } from '../services/productsApi'

const heroImages = ['/assets/morena (2).png', '/assets/morena.png', '/assets/candela.png']

export default function Home() {
  const [products, setProducts] = useState([])
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroImages.length), 3500)
    return () => clearInterval(t)
  }, [])

  const activeProducts = useMemo(() => products.filter((p) => p.activo), [products])

  return (
    <>
      <UrgenciaBanner />
      <Navbar />

      <header id="hero" className="hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${heroImages[slide]}')` }} />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>
            LA BICI <span>QUE BUSCAS</span> ESTA ACA
          </h1>
          <p>Diseno premium, stock real y atencion personalizada en Mar del Plata.</p>
          <WhatsAppButton />
        </div>
      </header>

      <section id="bicicletas" className="section">
        <div className="section-head">
          <h2>Bicicletas destacadas</h2>
          <p>Modelos activos listos para consultar.</p>
        </div>
        <div className="product-grid">
          {activeProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="accesorios" className="section section-dark">
        <div className="access-row">
          <img src="/assets/accs.png" alt="Accesorios" />
          <div>
            <h2>
              Equipamiento <span>Premium</span>
            </h2>
            <p>Cascos, luces, seguridad antirrobo y accesorios para pedalear con confianza.</p>
            <WhatsAppButton />
          </div>
        </div>
      </section>

      <section id="contacto" className="section">
        <div className="contact-box">
          <h2>Estamos cerca tuyo</h2>
          <p>Los Gallegos (Rivadavia 3050 Subsuelo), Mar del Plata.</p>
          <p>Lunes a sabados: 11:00 a 19:00 hs.</p>
          <div className="contact-actions">
            <a
              href="https://share.google/kyp1uH8sStsCnTlP2"
              className="btn-outline"
              target="_blank"
              rel="noreferrer"
            >
              Ver ubicacion
            </a>
            <WhatsAppButton />
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
