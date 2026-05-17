import { Link } from 'react-router-dom'
import WhatsAppButton from './WhatsAppButton'

export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="#hero" className="logo-wrap">
        <img src="/assets/logo.png" alt="Embiciate" className="logo" />
      </a>
      <div className="nav-links">
        <a href="#hero">Inicio</a>
        <a href="#bicicletas">Bicicletas</a>
        <a href="#accesorios">Accesorios</a>
        <a href="#contacto">Contacto</a>
        <Link to="/admin" className="admin-link">
          Admin
        </Link>
      </div>
      <WhatsAppButton compact />
    </nav>
  )
}
