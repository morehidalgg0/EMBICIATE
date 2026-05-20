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

function specsText(producto) {
  if (producto.descripcion) return producto.descripcion
  if (!producto.specs || typeof producto.specs !== 'object') return ''
  return Object.values(producto.specs).filter(Boolean).join(' | ')
}

function productEmoji(producto) {
  const cat = normalize(producto.categoria)
  if (cat === 'electrica') return '⚡'
  if (cat === 'urbana') return '🚲'
  return '🚵'
}

function productCard(producto) {
  const category = normalize(producto.categoria)
  const brand = normalize(producto.marca)
  const nombre = escapeHtml(producto.nombre)
  const descripcion = escapeHtml(specsText(producto))
  const imagenUrl = escapeHtml(producto.imagen_url)
  const image = producto.imagen_url
    ? `<img src="${imagenUrl}" alt="${nombre}" loading="lazy" style="width:100%;height:210px;object-fit:cover;display:block;">`
    : productEmoji(producto)

  return `
    <article class="product" data-category="${escapeHtml(category)}" data-brand="${escapeHtml(brand)}">
      <div class="placeholder">${image}</div>
      <div class="product-info">
        <h3>${nombre}</h3>
        <p class="specs">${descripcion}</p>
        <p class="price">${formatPrice(producto.precio)}</p>
        <a class="product-wa" href="${whatsappHref(`Hola, quiero consultar por ${producto.nombre}`)}" target="_blank" rel="noopener noreferrer">Consultar por WhatsApp</a>
      </div>
    </article>
  `
}

function applyConfig() {
  const title = document.querySelector('[data-config="hero_titulo"]')
  const subtitle = document.querySelector('[data-config="hero_subtitulo"]')
  const address = document.querySelector('[data-config="direccion"]')
  const hours = document.querySelector('[data-config="horarios"]')

  if (title && state.config.hero_titulo) title.innerHTML = state.config.hero_titulo
  if (subtitle && state.config.hero_subtitulo) subtitle.textContent = state.config.hero_subtitulo
  if (address && state.config.direccion) address.textContent = state.config.direccion
  if (hours && state.config.horarios) hours.textContent = state.config.horarios

  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
    link.href = whatsappHref('Hola, quiero consultar por bicicletas')
  })
}

function renderBrandFilters() {
  const container = document.getElementById('brand-filters')
  if (!container) return
  const brands = [...new Set(state.productos.map((p) => p.marca).filter(Boolean))]
  container.innerHTML = [
    '<button class="filter brand-filter active" data-brand="todos" type="button">Todas las marcas</button>',
    ...brands.map((brand) => `<button class="filter brand-filter" data-brand="${escapeHtml(normalize(brand))}" type="button">${escapeHtml(brand)}</button>`)
  ].join('')
}

function renderProductos() {
  const grid = document.getElementById('productos-grid')
  if (!grid) return
  const productos = state.productos.filter((producto) => {
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
}

function addToCart(productId) {
  // TODO: ecommerce
  console.log('addToCart pendiente', productId)
}

async function init() {
  try {
    const data = await window.EmbiciateDB.getSiteData()
    state.config = data.config || {}
    state.productos = (data.productos || []).length ? data.productos : fallbackProductos
  } catch (error) {
    console.error('No se pudo cargar Supabase. Usando fallback local.', error)
    state.productos = fallbackProductos
  }

  applyConfig()
  renderBrandFilters()
  bindFilters()
  renderProductos()
}

window.addToCart = addToCart
init()
