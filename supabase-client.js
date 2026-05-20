(function () {
  const cfg = window.EMBICIATE_CONFIG || {}
  const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY)

  async function getSiteData() {
    const { data, error } = await client.rpc('get_site_data')
    if (error) throw error
    return data || { config: {}, productos: [] }
  }

  async function getProductos(options = {}) {
    let query = client.from('productos').select('*').order('created_at', { ascending: false })
    if (options.onlyActive) query = query.eq('activo', true)
    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async function getConfig() {
    const { data, error } = await client.from('config').select('*')
    if (error) throw error
    return Object.fromEntries((data || []).map((row) => [row.clave, row.valor]))
  }

  async function createProducto(producto) {
    const { data, error } = await client.from('productos').insert(producto).select().single()
    if (error) throw error
    return data
  }

  async function updateProducto(id, producto) {
    const { data, error } = await client.from('productos').update(producto).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  async function deleteProducto(id) {
    const { error } = await client.from('productos').delete().eq('id', id)
    if (error) throw error
    return true
  }

  async function uploadProductImage(file) {
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `productos/${crypto.randomUUID()}.${ext.toLowerCase()}`
    const { error } = await client.storage.from('product-images').upload(path, file, {
      cacheControl: '31536000',
      upsert: false
    })
    if (error) throw error

    const { data } = client.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function updateConfig(config) {
    const rows = Object.entries(config).map(([clave, valor]) => ({ clave, valor }))
    const { data, error } = await client.from('config').upsert(rows, { onConflict: 'clave' }).select()
    if (error) throw error
    return data
  }

  async function getOrdenes() {
    const { data, error } = await client.from('ordenes').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  window.EmbiciateDB = {
    client,
    getSiteData,
    getProductos,
    getConfig,
    createProducto,
    updateProducto,
    deleteProducto,
    uploadProductImage,
    updateConfig,
    getOrdenes
  }
})()
