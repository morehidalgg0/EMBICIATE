const state = {
  productos: [],
  config: {},
  categoria: 'todos',
  marca: 'todos'
}

const fallbackProductos = Array.from(document.querySelectorAll('.product')).map((card) => ({
  nombre: card.querySelector('h3')?.textContent || 'Producto',
  descripcion: card.querySelector('.specs')?.textContent || '',
  precio: Number((card.querySelector('.price')?.textContent || '').replace(/\D/g, '')) || 0,
  categoria: card.dataset.category === 'electrica' ? 'Electrica' : card.dataset.category === 'urbana' ? 'Urbana' : 'MTB',
  marca: '',
  specs: {},
  imagen_url: '',
  stock: 0,
  activo: true
}))

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value || 0))
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  })[char])
}

function whatsappNumber() {
  return String(state.config.whatsapp || '5492235505397').replace(/\D/g, '')
}

function whatsappHref(message) {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`
}

function listFromConfig(value) {
  if (Array.isArray(value)) return value
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean)
}

function imageUrls(producto) {
  const fromSpecs = Array.isArray(producto.specs?.imagenes) ? producto.specs.imagenes : []
  return [...new Set([producto.imagen_url, ...fromSpecs].map((url) => String(url || '').trim()).filter(Boolean))]
}

function specsText(producto) {
  if (producto.descripcion) return producto.descripcion
  if (!producto.specs || typeof producto.specs !== 'object') return ''
  return Object.entries(producto.specs)
    .filter(([key, value]) => key !== 'imagenes' && value)
    .map(([, value]) => typeof value === 'object' ? JSON.stringify(value) : value)
    .join(' | ')
}

function productEmoji(producto) {
  const cat = normalize(producto.categoria)
  if (cat === 'electrica') return '⚡'
  if (cat === 'urbana') return '🚲'
  if (cat === 'accesorios') return '🎒'
  return '🚵'
}

function productCard(producto) {
  const category = normalize(producto.categoria)
  const brand = normalize(producto.marca)
  const nombre = escapeHtml(producto.nombre)
  const descripcion = escapeHtml(specsText(producto))
  const images = imageUrls(producto)
  const imagenUrl = escapeHtml(images[0])
  const image = images[0]
    ? `<img src="${imagenUrl}" alt="${nombre}" loading="lazy" width="270" height="210" style="width:100%;height:210px;object-fit:cover;display:block;">`
    : productEmoji(producto)

  return `
    <article class="product" data-category="${escapeHtml(category)}" data-brand="${escapeHtml(brand)}">
      <div class="placeholder">${image}</div>
      <div class="product-info">
        <h3>${nombre}</h3>
        <p class="specs">${descripcion}</p>
        <p class="price">${formatPrice(producto.precio)}</p>
        <div class="product-actions">
          <button class="product-detail" data-product-detail="${escapeHtml(producto.id || producto.nombre)}" type="button">Ver ficha</button>
          <a class="product-wa" href="${whatsappHref(`Hola, quiero consultar por ${producto.nombre}`)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
        </div>
      </div>
    </article>
  `
}

function applyConfig() {
  const title = document.querySelector('[data-config="hero_titulo"]')
  const subtitle = document.querySelector('[data-config="hero_subtitulo"]')
  document.querySelectorAll('[data-config="direccion"]').forEach((el) => {
    if (state.config.direccion) el.textContent = state.config.direccion
  })
  document.querySelectorAll('[data-config="horarios"]').forEach((el) => {
    if (state.config.horarios) el.textContent = state.config.horarios
  })

  const legacyHeroTitle = 'La bici <span>que buscás</span> está acá'
  const legacyHeroSubtitle = 'Rodados, accesorios, financiación y asesoramiento real para que salgas pedaleando con la bici correcta.'
  const defaultHeroTitle = 'Encontrá tu bici ideal <span>en el día</span>'
  const defaultHeroSubtitle = 'Asesoramiento real, stock local y hasta 12 cuotas fijas. Salí pedaleando hoy mismo.'

  if (title) title.innerHTML = state.config.hero_titulo && state.config.hero_titulo !== legacyHeroTitle ? state.config.hero_titulo : defaultHeroTitle
  if (subtitle) subtitle.textContent = state.config.hero_subtitulo && state.config.hero_subtitulo !== legacyHeroSubtitle ? state.config.hero_subtitulo : defaultHeroSubtitle

  const logo = document.getElementById('site-logo')
  if (logo && state.config.logo_url) {
    logo.innerHTML = `<img class="logo-img" src="${escapeHtml(state.config.logo_url)}" alt="Embiciate" width="240" height="72">`
  }

  document.querySelectorAll('[data-config]').forEach((node) => {
    const key = node.dataset.config
    if (['hero_titulo', 'hero_subtitulo', 'direccion', 'horarios'].includes(key)) return
    if (state.config[key]) node.textContent = state.config[key]
  })

  const badges = document.getElementById('hero-badges')
  const heroBadges = listFromConfig(state.config.hero_badges)
  if (badges && heroBadges.length) {
    badges.innerHTML = heroBadges.map((badge) => `<div class="badge">${escapeHtml(badge)}</div>`).join('')
  }

  const hero = document.getElementById('inicio')
  const heroImage = state.config.hero_fondo_imagen || state.config.hero_imagen || '/images/hero.jpg'
  if (hero && heroImage) {
    hero.style.setProperty('--hero-bg-image', `url("${heroImage.replace(/"/g, '%22')}")`)
  }

  const map = document.getElementById('mapa-ubicacion')
  const mapLink = document.getElementById('mapa-link')
  if (map && state.config.mapa_embed_url) map.src = state.config.mapa_embed_url
  if (mapLink && state.config.ubicacion_url) mapLink.href = state.config.ubicacion_url

  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
    link.href = whatsappHref('Hola, quiero consultar por bicicletas')
  })
}

function productSpecsRows(producto) {
  const hiddenKeys = ['imagenes']
  return Object.entries(producto.specs || {})
    .filter(([key, value]) => !hiddenKeys.includes(key) && value !== null && value !== '')
    .map(([key, value]) => `<div class="spec-row"><strong>${escapeHtml(key)}</strong><span>${escapeHtml(typeof value === 'object' ? JSON.stringify(value) : value)}</span></div>`)
    .join('')
}

function openProductModal(producto) {
  const modal = document.getElementById('product-modal')
  const title = document.getElementById('modal-title')
  const body = document.getElementById('modal-body')
  if (!modal || !title || !body) return
  const images = imageUrls(producto)
  const firstImage = images[0]
  title.textContent = producto.nombre || 'Producto'
  body.innerHTML = `
    <div>
      <div class="gallery-main" id="gallery-main">${firstImage ? `<img src="${escapeHtml(firstImage)}" alt="${escapeHtml(producto.nombre)}" width="440" height="280" style="width:100%;height:100%;max-height:440px;object-fit:cover;display:block;">` : productEmoji(producto)}</div>
      ${images.length > 1 ? `<div class="gallery-thumbs">${images.map((url) => `<button type="button" data-gallery-image="${escapeHtml(url)}"><img src="${escapeHtml(url)}" alt="" loading="lazy" width="76" height="62" style="width:100%;height:100%;object-fit:cover;display:block;"></button>`).join('')}</div>` : ''}
    </div>
    <div>
      <p class="price">${formatPrice(producto.precio)}</p>
      <p class="specs">${escapeHtml(specsText(producto))}</p>
      <div class="spec-list">${productSpecsRows(producto) || '<p class="specs">Sin datos técnicos cargados.</p>'}</div>
      <a class="product-wa" href="${whatsappHref(`Hola, quiero consultar por ${producto.nombre}`)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
    </div>
  `
  modal.classList.add('open')
  modal.setAttribute('aria-hidden', 'false')
}

function closeProductModal() {
  const modal = document.getElementById('product-modal')
  if (!modal) return
  modal.classList.remove('open')
  modal.setAttribute('aria-hidden', 'true')
}

function renderBrandFilters() {
  const container = document.getElementById('brand-filters')
  if (!container) return
  const brands = [...new Set(state.productos
    .filter((p) => normalize(p.categoria) !== 'accesorios')
    .map((p) => p.marca)
    .filter(Boolean))]
  container.innerHTML = [
    '<button class="filter brand-filter active" data-brand="todos" type="button">Todas las marcas</button>',
    ...brands.map((brand) => `<button class="filter brand-filter" data-brand="${escapeHtml(normalize(brand))}" type="button">${escapeHtml(brand)}</button>`)
  ].join('')
}

function renderProductos() {
  const grid = document.getElementById('productos-grid')
  if (!grid) return
  const productos = state.productos.filter((producto) => {
    if (normalize(producto.categoria) === 'accesorios') return false

    const categoryMatch = state.categoria === 'todos' || normalize(producto.categoria) === state.categoria
    const brandMatch = state.marca === 'todos' || normalize(producto.marca) === state.marca
    return categoryMatch && brandMatch
  })

  grid.innerHTML = productos.length
    ? productos.map(productCard).join('')
    : '<p class="specs">No hay productos para este filtro.</p>'
}

function bindFilters() {
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach((item) => item.classList.remove('active'))
      button.classList.add('active')
      state.categoria = button.dataset.filter
      renderProductos()
    })
  })

  document.getElementById('brand-filters')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-brand]')
    if (!button) return
    document.querySelectorAll('[data-brand]').forEach((item) => item.classList.remove('active'))
    button.classList.add('active')
    state.marca = button.dataset.brand
    renderProductos()
  })

  const handleProductDetailClick = (event) => {
    const button = event.target.closest('[data-product-detail]')
    if (!button) return
    const product = state.productos.find((item) => String(item.id || item.nombre) === button.dataset.productDetail)
    if (product) openProductModal(product)
  }

  document.getElementById('productos-grid')?.addEventListener('click', handleProductDetailClick)
  document.getElementById('accesorios-grid')?.addEventListener('click', handleProductDetailClick)

  document.getElementById('modal-close')?.addEventListener('click', closeProductModal)
  document.getElementById('product-modal')?.addEventListener('click', (event) => {
    if (event.target.id === 'product-modal') closeProductModal()
    const imageButton = event.target.closest('[data-gallery-image]')
    if (!imageButton) return
    const main = document.getElementById('gallery-main')
    if (main) main.innerHTML = `<img src="${escapeHtml(imageButton.dataset.galleryImage)}" alt="">`
  })
}

function addToCart(productId) {
  // TODO: ecommerce
  console.log('addToCart pendiente', productId)
}

function renderAccesorios() {
  const grid = document.getElementById('accesorios-grid')
  if (!grid) return
  const accesorios = state.productos.filter((producto) => normalize(producto.categoria) === 'accesorios')

  grid.innerHTML = accesorios.length
    ? accesorios.map(productCard).join('')
    : '<p class="specs">Próximamente catálogo de accesorios en línea.</p>'
}

async function init() {
  // Inicializar estado usando fallback estático del HTML
  state.productos = fallbackProductos

  // Vincular eventos de filtros y modales para interactividad inmediata (TBT optimizado)
  bindFilters()

  // Renderizar filtros de marcas iniciales y productos fallback
  renderBrandFilters()

  // Cargar datos de Supabase de manera diferida/no bloqueante
  const loadSupabaseData = async () => {
    try {
      const data = await window.EmbiciateDB.getSiteData()
      if (data) {
        state.config = data.config || {}
        if (data.productos && data.productos.length) {
          state.productos = data.productos
        }
      }
    } catch (error) {
      console.error('No se pudo cargar Supabase. Usando fallback local.', error)
    }

    applyConfig()
    renderBrandFilters()
    renderProductos()
    renderAccesorios()
  }

  if (window.requestIdleCallback) {
    window.requestIdleCallback(loadSupabaseData)
  } else {
    setTimeout(loadSupabaseData, 50)
  }
}

window.addToCart = addToCart
init()
