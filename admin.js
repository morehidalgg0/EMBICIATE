// =========================================================================
// 🔒 PANEL DE ADMINISTRACIÓN EMBICIATE
// Acceso: Ctrl + Shift + A  |  Contraseña: cambiala abajo
//
// Las fotos se suben a GitHub y quedan visibles en TODOS los dispositivos.
// =========================================================================
(function () {

    const ADMIN_PASSWORD = 'embiciate2026';      // ← CAMBIÁ ESTO
    const SESSION_KEY    = 'embiciate_admin_session';
    const TOKEN_KEY      = 'embiciate_gh_token';
    const GH_OWNER       = 'morehidalgg0';
    const GH_REPO        = 'EMBICIATE';
    const GH_BRANCH      = 'main';

    let authenticated = sessionStorage.getItem(SESSION_KEY) === '1';

    // ── Atajo de teclado: Ctrl + Shift + A ───────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            authenticated ? mountPanel() : mountPasswordModal();
        }
    });

    // ── Modal de contraseña ───────────────────────────────────────────────
    function mountPasswordModal() {
        if (document.getElementById('_adm-modal')) return;
        injectStyles();
        const m = el('div', { id: '_adm-modal' }, `
            <div id="_adm-box">
                <div style="font-size:2rem;margin-bottom:.6rem">🔒</div>
                <h2>Panel Admin</h2>
                <p>Solo para administradoras de Embiciate</p>
                <input id="_adm-pwd" type="password" placeholder="Contraseña" autocomplete="off">
                <div id="_adm-err" style="display:none">Contraseña incorrecta</div>
                <button id="_adm-ok">Ingresar</button>
                <button id="_adm-cancel" class="_adm-ghost">Cancelar</button>
            </div>`);
        document.body.appendChild(m);
        m.querySelector('#_adm-pwd').focus();
        const tryLogin = () => {
            if (m.querySelector('#_adm-pwd').value === ADMIN_PASSWORD) {
                sessionStorage.setItem(SESSION_KEY, '1');
                authenticated = true;
                m.remove();
                mountPanel();
            } else {
                const err = m.querySelector('#_adm-err');
                err.style.display = 'block';
                m.querySelector('#_adm-pwd').value = '';
                setTimeout(() => { err.style.display = 'none'; }, 2000);
            }
        };
        m.querySelector('#_adm-ok').onclick    = tryLogin;
        m.querySelector('#_adm-pwd').onkeydown = e => { if (e.key === 'Enter') tryLogin(); };
        m.querySelector('#_adm-cancel').onclick = () => m.remove();
    }

    // ── Panel principal ───────────────────────────────────────────────────
    async function mountPanel() {
        if (document.getElementById('_adm-panel')) return;
        injectStyles();

        const bikes      = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.bicicletas_destacadas))
            ? CONFIG.bicicletas_destacadas : [];
        const serverData = window.embiciateCatalog || {};
        const token      = localStorage.getItem(TOKEN_KEY) || '';

        const panel = el('div', { id: '_adm-panel' }, `
            <div id="_adm-header">
                <div style="display:flex;align-items:center;gap:.7rem">
                    <span style="font-size:1.3rem">🔒</span>
                    <div>
                        <strong style="color:#fff;display:block">Panel Admin — Embiciate</strong>
                        <small style="color:#666;font-size:.72rem">Los cambios se publican para todos los dispositivos</small>
                    </div>
                </div>
                <button id="_adm-close">✕ Cerrar</button>
            </div>
            <div id="_adm-body">
                <div id="_adm-token-section">
                    <div id="_adm-token-label">🔑 Token de GitHub <span id="_adm-token-status">${token ? '✅ Configurado' : '⚠️ No configurado'}</span></div>
                    <div id="_adm-token-row">
                        <input id="_adm-token-input" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" value="${token}" autocomplete="off">
                        <button id="_adm-token-save">Guardar token</button>
                    </div>
                    <p id="_adm-token-help">
                        Necesitás un <strong>Personal Access Token</strong> de GitHub con permiso de escritura.<br>
                        <a href="https://github.com/settings/tokens/new?description=Embiciate+Admin&scopes=repo" target="_blank" rel="noopener">👉 Crear token en GitHub</a>
                        (permiso <strong>repo</strong> completo)
                    </p>
                </div>
                <div id="_adm-tabs-bar">
                    <button class="_adm-tab active" data-tab="catalogo">🚲 Catálogo</button>
                    <button class="_adm-tab" data-tab="hero">🏠 Hero</button>
                    <button class="_adm-tab" data-tab="contacto">📞 Contacto</button>
                    <button class="_adm-tab" data-tab="accesorios">🛡️ Accesorios</button>
                </div>
                <div id="_adm-tab-catalogo" class="_adm-tab-content"><div id="_adm-grid"></div></div>
                <div id="_adm-tab-hero"     class="_adm-tab-content" style="display:none"></div>
                <div id="_adm-tab-contacto" class="_adm-tab-content" style="display:none"></div>
                <div id="_adm-tab-accesorios" class="_adm-tab-content" style="display:none"></div>
            </div>`);
        document.body.appendChild(panel);

        panel.querySelector('#_adm-close').onclick = () => panel.remove();

        // Token management
        panel.querySelector('#_adm-token-save').onclick = () => {
            const val = panel.querySelector('#_adm-token-input').value.trim();
            if (val) {
                localStorage.setItem(TOKEN_KEY, val);
                panel.querySelector('#_adm-token-status').textContent = '✅ Configurado';
                panel.querySelector('#_adm-token-status').style.color = '#25D366';
            } else {
                localStorage.removeItem(TOKEN_KEY);
                panel.querySelector('#_adm-token-status').textContent = '⚠️ No configurado';
            }
        };

        // Tab switching
        panel.querySelectorAll('._adm-tab').forEach(btn => {
            btn.onclick = () => {
                panel.querySelectorAll('._adm-tab').forEach(b => b.classList.remove('active'));
                panel.querySelectorAll('._adm-tab-content').forEach(c => c.style.display = 'none');
                btn.classList.add('active');
                panel.querySelector('#_adm-tab-' + btn.dataset.tab).style.display = 'block';
            };
        });

        // Build bike cards
        const grid = panel.querySelector('#_adm-grid');
        bikes.forEach((bike, i) => {
            const merged = { ...bike, ...(serverData[i] || {}) };
            grid.appendChild(buildCard(i, merged, (serverData[i] || {}).imagenes || []));
        });

        // Build other tabs
        const site = serverData.site || {};
        panel.querySelector('#_adm-tab-hero').appendChild(buildHeroTab(site));
        panel.querySelector('#_adm-tab-contacto').appendChild(buildContactoTab(site));
        panel.querySelector('#_adm-tab-accesorios').appendChild(buildAccesoriosTab(site));
    }

    // ── Card de bici en el panel ──────────────────────────────────────────
    function buildCard(idx, bike, publishedImages) {
        const card = el('div', { class: '_adm-card', 'data-idx': idx });

        card.innerHTML = `
            <div class="_adm-card-head">
                <span class="_adm-num">#${idx + 1}</span>
                <strong>${bike.modelo}</strong>
                ${publishedImages.length > 0 ? `<span class="_adm-badge-pub">✅ ${publishedImages.length} foto${publishedImages.length > 1 ? 's' : ''} publicada${publishedImages.length > 1 ? 's' : ''}</span>` : '<span class="_adm-badge-none">Sin fotos</span>'}
            </div>`;

        // Zona de imágenes
        card.appendChild(buildImageZone(idx, publishedImages));

        // Campos de texto
        const fields = el('div', { class: '_adm-fields' }, `
            <label>Precio</label>
            <input class="_adm-f" data-field="precio" value="${esc(bike.precio)}" placeholder="$299.900">
            <label>Etiqueta / Badge</label>
            <input class="_adm-f" data-field="etiqueta" value="${esc(bike.etiqueta)}" placeholder="MTB">
            <label>Especificaciones (una por línea)</label>
            <textarea class="_adm-f _adm-ta" data-field="specs" rows="3"
                placeholder="Rodado 29&#10;21 velocidades&#10;Frenos a disco">${Array.isArray(bike.specs) ? bike.specs.join('\n') : ''}</textarea>`);
        card.appendChild(fields);

        const actions = el('div', { class: '_adm-actions' });
        const saveBtn = el('button', { class: '_adm-save' }, '🚀 Publicar cambios');
        actions.appendChild(saveBtn);
        card.appendChild(actions);

        const progress = el('div', { class: '_adm-progress', style: 'display:none' }, '⏳ Subiendo a GitHub...');
        card.appendChild(progress);
        const okMsg = el('div', { class: '_adm-ok-msg', style: 'display:none' }, '');
        card.appendChild(okMsg);

        saveBtn.onclick = () => publishCard(card, idx, bike.modelo, publishedImages, progress, okMsg);
        return card;
    }

    // ── Zona de imágenes ─────────────────────────────────────────────────
    function buildImageZone(idx, publishedImages) {
        const zone = el('div', { class: '_adm-zone' });
        let newFiles = [];

        // Fotos ya publicadas
        if (publishedImages.length > 0) {
            const pubSection = el('div', { class: '_adm-pub-section' });
            pubSection.innerHTML = `<p class="_adm-pub-label">📡 Fotos publicadas actualmente:</p>`;
            const thumbs = el('div', { class: '_adm-thumbs' });
            publishedImages.forEach((url, i) => {
                const w = el('div', { class: '_adm-thumb' + (i === 0 ? ' _adm-thumb-main' : '') },
                    `<img src="${url}" alt="foto ${i+1}" onerror="this.style.opacity='.3'">
                     ${i === 0 ? '<span class="_adm-label-main">Principal</span>' : ''}`);
                thumbs.appendChild(w);
            });
            pubSection.appendChild(thumbs);
            zone.appendChild(pubSection);
        }

        // Nuevas fotos a subir
        const newSection = el('div', { class: '_adm-new-section' });
        const newThumbsEl = el('div', { class: '_adm-thumbs _adm-new-thumbs' });
        newSection.appendChild(newThumbsEl);

        const addBtn = el('label', { class: '_adm-add-btn' },
            `📁 ${publishedImages.length > 0 ? 'Reemplazar fotos' : 'Subir fotos'}<input type="file" accept="image/*" multiple style="display:none">`);
        newSection.appendChild(addBtn);

        // Drag & drop
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('_adm-drag'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('_adm-drag'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('_adm-drag');
            addFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
        });

        addBtn.querySelector('input').onchange = e => {
            addFiles(Array.from(e.target.files));
            e.target.value = '';
        };

        function addFiles(files) {
            newFiles = newFiles.concat(files);
            renderNewThumbs();
        }

        function renderNewThumbs() {
            newThumbsEl.innerHTML = '';
            newFiles.forEach((file, i) => {
                const url = URL.createObjectURL(file);
                const w   = el('div', { class: '_adm-thumb' + (i === 0 && publishedImages.length === 0 ? ' _adm-thumb-main' : '') },
                    `<img src="${url}" alt="nueva foto ${i+1}">
                     ${i === 0 && publishedImages.length === 0 ? '<span class="_adm-label-main">Principal</span>' : ''}
                     <button class="_adm-del-img" data-i="${i}" title="Quitar">×</button>`);
                w.querySelector('._adm-del-img').onclick = () => {
                    newFiles.splice(i, 1);
                    renderNewThumbs();
                };
                newThumbsEl.appendChild(w);
            });
        }

        const hint = el('p', { class: '_adm-hint' },
            publishedImages.length > 0
                ? 'Subir nuevas fotos <strong>reemplaza</strong> las actuales. La primera es la principal.'
                : 'Arrastrá o seleccioná las fotos. La primera será la principal del catálogo.');
        hint.style.marginTop = '.5rem';
        newSection.appendChild(hint);
        zone.appendChild(newSection);

        // Exponer archivos nuevos al momento de guardar
        zone.getNewFiles = () => newFiles;
        return zone;
    }

    // ── Publicar cambios en GitHub ────────────────────────────────────────
    async function publishCard(card, idx, modelo, currentImages, progressEl, okEl) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
            alert('⚠️ Primero configurá el Token de GitHub en la parte superior del panel.');
            return;
        }

        const zone     = card.querySelector('._adm-zone');
        const newFiles = zone ? zone.getNewFiles() : [];

        progressEl.style.display = 'block';
        progressEl.textContent   = '⏳ Publicando cambios...';
        okEl.style.display       = 'none';

        try {
            // 1. Subir imágenes nuevas si las hay
            let imagenesFinales = currentImages;
            if (newFiles.length > 0) {
                progressEl.textContent = `⏳ Subiendo ${newFiles.length} foto(s)...`;
                imagenesFinales = [];
                for (let i = 0; i < newFiles.length; i++) {
                    const file    = newFiles[i];
                    const ext     = file.name.split('.').pop().toLowerCase() || 'jpg';
                    const path    = `assets/bici-${idx}-${i}.${ext}`;
                    const base64  = (await blobToBase64(file)).split(',')[1];
                    progressEl.textContent = `⏳ Subiendo foto ${i + 1} de ${newFiles.length}...`;
                    await ghCommitFile(path, base64, token, `admin: foto bici #${idx+1}`, true);
                    imagenesFinales.push(path);
                }
            }

            // 2. Leer campos de texto
            const overrides = {};
            card.querySelectorAll('._adm-f').forEach(input => {
                const k = input.dataset.field;
                overrides[k] = k === 'specs'
                    ? input.value.split('\n').map(s => s.trim()).filter(Boolean)
                    : input.value.trim();
            });
            if (imagenesFinales.length > 0) overrides.imagenes = imagenesFinales;

            // 3. Actualizar catalog-data.json en GitHub
            progressEl.textContent = '⏳ Actualizando catálogo...';
            const current = { ...(window.embiciateCatalog || {}) };
            current[idx]  = { ...(current[idx] || {}), ...overrides };

            const jsonContent = JSON.stringify(current, null, 2);
            await ghCommitFile('catalog-data.json', btoa(unescape(encodeURIComponent(jsonContent))), token,
                `admin: actualiza bici #${idx + 1} (${modelo})`, false);

            // 4. Actualizar estado local
            window.embiciateCatalog = current;

            progressEl.style.display = 'none';
            okEl.style.display = 'block';
            okEl.innerHTML = `✅ ¡Publicado! Los cambios se verán en todos los dispositivos en <strong>~1–2 minutos</strong>.`;
            setTimeout(() => { okEl.style.display = 'none'; }, 6000);

        } catch (err) {
            progressEl.style.display = 'none';
            okEl.style.display = 'block';
            okEl.style.color = '#f55';
            okEl.textContent = '❌ Error: ' + err.message;
            console.error(err);
        }
    }

    // ── GitHub API ────────────────────────────────────────────────────────
    async function ghGetSha(path, token) {
        const res = await fetch(
            `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}?ref=${GH_BRANCH}`,
            { headers: { Authorization: `token ${token}` } }
        );
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`GitHub API ${res.status}`);
        return (await res.json()).sha;
    }

    async function ghCommitFile(path, base64Content, token, message, isBinary) {
        const sha  = await ghGetSha(path, token);
        const body = { message, content: base64Content, branch: GH_BRANCH };
        if (sha) body.sha = sha;
        const res = await fetch(
            `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
            { method: 'PUT', headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(body) }
        );
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || `GitHub error ${res.status}`);
        }
        return res.json();
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    function blobToBase64(blob) {
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload  = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(blob);
        });
    }

    function el(tag, attrs, content) {
        const e = document.createElement(tag);
        Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
        if (content !== undefined) e.innerHTML = content;
        return e;
    }

    function esc(str) { return (str || '').replace(/"/g, '&quot;'); }

    // ── Tab: Hero ─────────────────────────────────────────────────────────
    function buildHeroTab(site) {
        const cfg   = typeof CONFIG !== 'undefined' ? CONFIG : {};
        const wrap  = el('div', { class: '_adm-section' });
        const prog  = el('div', { class: '_adm-progress', style: 'display:none' });
        const ok    = el('div', { class: '_adm-ok-msg',  style: 'display:none' });

        wrap.innerHTML = `<h3 class="_adm-section-title">🏠 Sección Hero</h3>`;

        // Hero slider: images
        const sliderCfg = site.hero_slider || cfg.hero_slider || [];
        const sliderWrap = el('div', {});
        sliderWrap.innerHTML = `<p class="_adm-pub-label" style="margin-bottom:.6rem">Imágenes del slider principal (${sliderCfg.length} slides)</p>`;
        sliderCfg.forEach((slide, i) => {
            const row = el('div', { class: '_adm-slide-row' });
            row.innerHTML = `<span class="_adm-num">#${i+1} ${esc(slide.modelo)}</span>`;
            const zone = buildSingleImg(`hero-slide-${i}`, slide.imagen || '');
            row.appendChild(zone);
            sliderWrap.appendChild(row);
        });
        wrap.appendChild(sliderWrap);

        // Text fields
        const fields = el('div', { class: '_adm-fields' }, `
            <label>Banner de urgencia (franja superior)</label>
            <input class="_adm-f" data-sfield="urgencia_texto" value="${esc(site.urgencia_texto || '')}" placeholder="⚡ Stock limitado — Consultá disponibilidad...">
            <label>Título H1 del Hero</label>
            <input class="_adm-f" data-sfield="hero_h1" value="${esc(site.hero_h1 || '')}" placeholder="LA BICI QUE BUSCÁS ESTÁ ACÁ">
            <label>Texto de precio destacado</label>
            <input class="_adm-f" data-sfield="hero_precio_texto" value="${esc(site.hero_precio_texto || '')}" placeholder="Bicicletas desde $269.900">
        `);
        wrap.appendChild(fields);

        const btn = el('button', { class: '_adm-save', style: 'margin-top:.8rem' }, '🚀 Publicar cambios del Hero');
        wrap.appendChild(btn);
        wrap.appendChild(prog);
        wrap.appendChild(ok);

        btn.onclick = async () => {
            const overrides = {};
            wrap.querySelectorAll('[data-sfield]').forEach(inp => { overrides[inp.dataset.sfield] = inp.value.trim(); });
            // Slider images
            const newSlider = sliderCfg.map((slide, i) => ({ ...slide }));
            const zones = sliderWrap.querySelectorAll('._adm-single-zone');
            for (let i = 0; i < zones.length; i++) {
                const f = zones[i].getFile ? zones[i].getFile() : null;
                if (f) {
                    const ext  = f.name.split('.').pop() || 'jpg';
                    const path = `assets/hero-${i}.${ext}`;
                    const b64  = (await blobToBase64(f)).split(',')[1];
                    prog.style.display = 'block'; prog.textContent = `⏳ Subiendo imagen ${i+1}...`;
                    await ghCommitFile(path, b64, localStorage.getItem(TOKEN_KEY), `admin: hero slide ${i}`, true);
                    newSlider[i].imagen = path; newSlider[i].imagen_mobile = path;
                }
            }
            if (newSlider.length) overrides.hero_slider = newSlider;
            await publishSiteSection(overrides, prog, ok);
        };
        return wrap;
    }

    // ── Tab: Contacto ─────────────────────────────────────────────────────
    function buildContactoTab(site) {
        const cfg  = typeof CONFIG !== 'undefined' ? CONFIG : {};
        const wrap = el('div', { class: '_adm-section' });
        const prog = el('div', { class: '_adm-progress', style: 'display:none' });
        const ok   = el('div', { class: '_adm-ok-msg',  style: 'display:none' });
        wrap.innerHTML = `<h3 class="_adm-section-title">📞 Contacto y Datos</h3>`;
        const fields = el('div', { class: '_adm-fields' }, `
            <label>Número de WhatsApp (con código de país, ej: 5492230000000)</label>
            <input class="_adm-f" data-sfield="whatsapp_numero" value="${esc(site.whatsapp_numero||cfg.whatsapp_numero||'')}" placeholder="5492230000000">
            <label>Mensaje predeterminado de WhatsApp</label>
            <input class="_adm-f" data-sfield="whatsapp_mensaje" value="${esc(site.whatsapp_mensaje||cfg.whatsapp_mensaje||'')}" placeholder="Hola! quiero consultar...">
            <label>Dirección</label>
            <input class="_adm-f" data-sfield="direccion" value="${esc(site.direccion||cfg.direccion||'')}" placeholder="Güemes 1234, Mar del Plata">
            <label>Horarios</label>
            <input class="_adm-f" data-sfield="horarios" value="${esc(site.horarios||cfg.horarios||'')}" placeholder="Lunes a Sábados: 09:00 a 21:00 hs">
            <label>URL de ubicación (Google Maps)</label>
            <input class="_adm-f" data-sfield="ubicacion_url" value="${esc(site.ubicacion_url||cfg.ubicacion_url||'')}" placeholder="https://share.google/...">
            <label>Texto de la sección contacto</label>
            <textarea class="_adm-f _adm-ta" data-sfield="contacto_texto" rows="3" placeholder="Vení a conocer todos nuestros modelos...">${esc(site.contacto_texto||cfg.contacto_texto||'')}</textarea>
        `);
        wrap.appendChild(fields);
        const btn = el('button', { class: '_adm-save', style: 'margin-top:.8rem' }, '🚀 Publicar cambios de Contacto');
        wrap.appendChild(btn); wrap.appendChild(prog); wrap.appendChild(ok);
        btn.onclick = async () => {
            const overrides = {};
            wrap.querySelectorAll('[data-sfield]').forEach(inp => { overrides[inp.dataset.sfield] = inp.value.trim(); });
            await publishSiteSection(overrides, prog, ok);
        };
        return wrap;
    }

    // ── Tab: Accesorios ───────────────────────────────────────────────────
    function buildAccesoriosTab(site) {
        const cfg  = typeof CONFIG !== 'undefined' ? CONFIG : {};
        const wrap = el('div', { class: '_adm-section' });
        const prog = el('div', { class: '_adm-progress', style: 'display:none' });
        const ok   = el('div', { class: '_adm-ok-msg',  style: 'display:none' });
        wrap.innerHTML = `<h3 class="_adm-section-title">🛡️ Sección Accesorios</h3>`;
        const imgZone = buildSingleImg('accesorios', (site.accesorios_imagen || (cfg.imagenes||{}).accesorios || ''));
        wrap.appendChild(imgZone);
        const fields = el('div', { class: '_adm-fields' }, `
            <label>Palabra en color del título (ej: Premium)</label>
            <input class="_adm-f" data-sfield="accs_titulo_color" value="${esc(site.accs_titulo_color||cfg.accs_titulo_color||'Premium')}">
            <label>Descripción</label>
            <textarea class="_adm-f _adm-ta" data-sfield="accs_descripcion" rows="4">${esc(site.accs_descripcion||cfg.accs_descripcion||'')}</textarea>
        `);
        wrap.appendChild(fields);
        const btn = el('button', { class: '_adm-save', style: 'margin-top:.8rem' }, '🚀 Publicar cambios de Accesorios');
        wrap.appendChild(btn); wrap.appendChild(prog); wrap.appendChild(ok);
        btn.onclick = async () => {
            const overrides = {};
            wrap.querySelectorAll('[data-sfield]').forEach(inp => { overrides[inp.dataset.sfield] = inp.value.trim(); });
            const f = imgZone.getFile ? imgZone.getFile() : null;
            if (f) {
                const ext  = f.name.split('.').pop() || 'jpg';
                const path = `assets/accesorios-admin.${ext}`;
                const b64  = (await blobToBase64(f)).split(',')[1];
                prog.style.display = 'block'; prog.textContent = '⏳ Subiendo imagen...';
                await ghCommitFile(path, b64, localStorage.getItem(TOKEN_KEY), 'admin: accesorios imagen', true);
                overrides.accesorios_imagen = path;
                overrides['imagenes.accesorios'] = path;
            }
            await publishSiteSection(overrides, prog, ok);
        };
        return wrap;
    }

    // ── Upload zona de imagen simple (una sola foto) ───────────────────────
    function buildSingleImg(key, currentUrl) {
        const zone = el('div', { class: '_adm-zone _adm-single-zone', style: 'margin-bottom:.6rem' });
        let file = null;
        zone.innerHTML = `
            <p class="_adm-pub-label">Imagen actual:</p>
            <div style="display:flex;align-items:center;gap:.8rem;flex-wrap:wrap">
                <img class="_adm-single-preview" src="${currentUrl}" alt="" style="height:72px;width:auto;border-radius:6px;border:1px solid #333;object-fit:cover" onerror="this.style.opacity='.2'">
                <label class="_adm-add-btn">📁 Cambiar imagen<input type="file" accept="image/*" style="display:none"></label>
            </div>`;
        zone.querySelector('input').onchange = e => {
            file = e.target.files[0];
            if (file) { zone.querySelector('._adm-single-preview').src = URL.createObjectURL(file); }
            e.target.value = '';
        };
        zone.getFile = () => file;
        return zone;
    }

    // ── Publicar datos de sitio en catalog-data.json["site"] ──────────────
    async function publishSiteSection(overrides, progressEl, okEl) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) { alert('⚠️ Configurá el Token de GitHub primero.'); return; }
        progressEl.style.display = 'block';
        progressEl.textContent   = '⏳ Actualizando sitio en GitHub...';
        okEl.style.display = 'none';
        try {
            const current = { ...(window.embiciateCatalog || {}) };
            current.site  = { ...(current.site || {}), ...overrides };
            const json    = JSON.stringify(current, null, 2);
            await ghCommitFile('catalog-data.json', btoa(unescape(encodeURIComponent(json))),
                token, 'admin: actualiza configuración del sitio', false);
            window.embiciateCatalog = current;
            progressEl.style.display = 'none';
            okEl.style.display = 'block';
            okEl.innerHTML = '✅ ¡Publicado! Visible en todos los dispositivos en <strong>~1–2 minutos</strong>.';
            setTimeout(() => { okEl.style.display = 'none'; }, 6000);
        } catch(err) {
            progressEl.style.display = 'none';
            okEl.style.display = 'block'; okEl.style.color = '#f55';
            okEl.textContent = '❌ Error: ' + err.message;
        }
    }

    // ── Estilos ───────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('_adm-css')) return;
        const s = document.createElement('style');
        s.id = '_adm-css';
        s.textContent = `
        #_adm-modal{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.9);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-family:'Outfit','Inter',sans-serif}
        #_adm-box{background:#111;border:1px solid #2a2a2a;border-radius:16px;padding:2.2rem;width:min(350px,92vw);text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.7)}
        #_adm-box h2{color:#fff;font-size:1.3rem;margin:.3rem 0}
        #_adm-box p{color:#888;font-size:.85rem;margin-bottom:1rem}
        #_adm-pwd{width:100%;padding:.7rem 1rem;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#fff;font-size:1rem;margin-bottom:.5rem;outline:none;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
        #_adm-pwd:focus{border-color:#ff5500}
        #_adm-err{color:#f66;font-size:.8rem;margin-bottom:.4rem}
        #_adm-box button{width:100%;padding:.68rem;border-radius:8px;font-size:.9rem;font-weight:700;cursor:pointer;border:none;font-family:inherit;margin-top:.4rem;transition:all .2s}
        #_adm-ok{background:#ff5500;color:#fff}
        #_adm-ok:hover{background:#ff7733}
        ._adm-ghost{background:transparent!important;border:1px solid #333!important;color:#888!important}
        ._adm-ghost:hover{border-color:#555!important;color:#ccc!important}

        #_adm-panel{position:fixed;inset:0;z-index:99998;background:#0a0a0a;display:flex;flex-direction:column;font-family:'Outfit','Inter',sans-serif;overflow:hidden}
        #_adm-header{display:flex;align-items:center;justify-content:space-between;gap:.8rem;padding:1rem 1.5rem;background:#111;border-bottom:1px solid #222;flex-shrink:0;flex-wrap:wrap}
        #_adm-close{padding:.45rem 1rem;border-radius:8px;border:none;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;background:#ff5500;color:#fff;transition:background .2s}
        #_adm-close:hover{background:#ff7733}
        #_adm-body{flex:1;overflow-y:auto;padding:1.2rem}

        #_adm-token-section{background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:1rem 1.2rem;margin-bottom:1.2rem}
        #_adm-token-label{color:#ccc;font-size:.82rem;font-weight:700;margin-bottom:.5rem}
        #_adm-token-status{margin-left:.5rem;font-size:.75rem}
        #_adm-token-row{display:flex;gap:.5rem;flex-wrap:wrap}
        #_adm-token-input{flex:1;min-width:160px;padding:.5rem .8rem;background:#1a1a1a;border:1px solid #333;border-radius:8px;color:#fff;font-size:.82rem;font-family:inherit;outline:none;transition:border-color .2s}
        #_adm-token-input:focus{border-color:#ff5500}
        #_adm-token-save{padding:.5rem 1rem;background:#ff5500;color:#fff;border:none;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;white-space:nowrap}
        #_adm-token-save:hover{background:#ff7733}
        #_adm-token-help{color:#666;font-size:.75rem;margin:.5rem 0 0;line-height:1.6}
        #_adm-token-help strong{color:#aaa}
        #_adm-token-help a{color:#ff7733;text-decoration:none}
        #_adm-token-help a:hover{text-decoration:underline}

        #_adm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1rem}
        ._adm-card{background:#141414;border:1px solid #222;border-radius:12px;padding:1.1rem;display:flex;flex-direction:column;gap:.5rem}
        ._adm-card-head{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.2rem}
        ._adm-num{background:#222;color:#777;font-size:.7rem;font-weight:700;padding:.12rem .5rem;border-radius:999px}
        ._adm-card-head strong{color:#fff;font-size:.9rem;flex:1}
        ._adm-badge-pub{font-size:.65rem;font-weight:900;background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.3);color:#25D366;padding:.1rem .5rem;border-radius:999px}
        ._adm-badge-none{font-size:.65rem;font-weight:900;background:rgba(255,85,0,.1);border:1px solid rgba(255,85,0,.25);color:#ff7733;padding:.1rem .5rem;border-radius:999px}

        ._adm-zone{background:#0e0e0e;border:2px dashed #2a2a2a;border-radius:10px;padding:.8rem;transition:border-color .2s;margin-bottom:.2rem}
        ._adm-zone._adm-drag{border-color:#ff5500;background:rgba(255,85,0,.04)}
        ._adm-pub-label{color:#555;font-size:.72rem;margin:0 0 .4rem;font-weight:600}
        ._adm-pub-section{margin-bottom:.6rem}
        ._adm-new-section{}
        ._adm-thumbs{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.5rem}
        ._adm-thumb{position:relative;width:68px;height:68px;border-radius:8px;overflow:hidden;border:2px solid #2a2a2a;flex-shrink:0}
        ._adm-thumb-main{border-color:#ff5500}
        ._adm-thumb img{width:100%;height:100%;object-fit:cover}
        ._adm-label-main{position:absolute;bottom:0;left:0;right:0;background:rgba(255,85,0,.85);color:#fff;font-size:.5rem;font-weight:900;text-align:center;padding:.1rem;text-transform:uppercase;letter-spacing:.5px}
        ._adm-del-img{position:absolute;top:2px;right:2px;width:17px;height:17px;background:rgba(0,0,0,.8);border:none;border-radius:50%;color:#fff;font-size:.8rem;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:background .2s}
        ._adm-del-img:hover{background:#f55}
        ._adm-add-btn{display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;background:#1e1e1e;border:1px solid #333;border-radius:8px;padding:.42rem .85rem;color:#ccc;font-size:.78rem;font-weight:600;transition:all .2s;font-family:inherit}
        ._adm-add-btn:hover{border-color:#ff5500;color:#ff5500}
        ._adm-hint{color:#555;font-size:.7rem;line-height:1.4;margin:0}
        ._adm-hint strong{color:#888}

        ._adm-fields{display:flex;flex-direction:column;gap:.3rem}
        ._adm-fields label{color:#777;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:.2rem}
        ._adm-f{padding:.5rem .75rem;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;color:#fff;font-size:.85rem;font-family:inherit;outline:none;transition:border-color .2s;width:100%;box-sizing:border-box}
        ._adm-f:focus{border-color:#ff5500}
        ._adm-ta{resize:vertical;min-height:66px;line-height:1.5}

        ._adm-actions{margin-top:.3rem}
        ._adm-save{width:100%;padding:.6rem;background:#ff5500;color:#fff;border:none;border-radius:8px;font-size:.85rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s}
        ._adm-save:hover{background:#ff7733}
        ._adm-progress{color:#888;font-size:.8rem;padding:.3rem;text-align:center}
        ._adm-ok-msg{color:#25D366;font-size:.8rem;font-weight:700;text-align:center;padding:.3rem;line-height:1.5}
        ._adm-ok-msg strong{color:#fff}

        /* Galería en product cards */
        .pg-dots{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:5px;z-index:5}
        .pg-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.4);cursor:pointer;transition:background .2s,transform .2s}
        .pg-dot.active{background:#fff;transform:scale(1.3)}
        .product-img-wrapper{cursor:pointer}

        #_adm-tabs-bar{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:1rem}
        ._adm-tab{padding:.45rem 1rem;border-radius:8px;border:1px solid #2a2a2a;background:#141414;color:#888;font-size:.8rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
        ._adm-tab.active,._adm-tab:hover{background:#ff5500;color:#fff;border-color:#ff5500}
        ._adm-tab-content{}
        ._adm-section{background:#141414;border:1px solid #222;border-radius:12px;padding:1.2rem;max-width:700px}
        ._adm-section-title{color:#fff;font-size:1rem;margin:0 0 1rem;font-weight:800}
        ._adm-slide-row{background:#0e0e0e;border:1px solid #222;border-radius:8px;padding:.7rem;margin-bottom:.6rem}
        ._adm-slide-row ._adm-num{display:block;margin-bottom:.4rem}
        @media(max-width:600px){
            #_adm-body{padding:.8rem}
            #_adm-grid{grid-template-columns:1fr}
            #_adm-header{padding:.8rem 1rem}
        }`;;
        document.head.appendChild(s);
    }
})();
