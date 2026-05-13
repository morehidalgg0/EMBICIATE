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
    const GH_API_BASE    = `${location.origin}/api/github`;
    const GH_HEADERS     = {
        Accept: 'application/vnd.github+json'
    };

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
                        <button id="_adm-token-test" type="button">Probar conexión</button>
                    </div>
                    <div id="_adm-token-test-result" style="display:none"></div>
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
                    <button class="_adm-tab" data-tab="pagos">💳 Pagos</button>
                </div>
                <div id="_adm-tab-catalogo" class="_adm-tab-content"><div id="_adm-grid"></div></div>
                <div id="_adm-tab-hero"     class="_adm-tab-content" style="display:none"></div>
                <div id="_adm-tab-contacto" class="_adm-tab-content" style="display:none"></div>
                <div id="_adm-tab-accesorios" class="_adm-tab-content" style="display:none"></div>
                <div id="_adm-tab-pagos" class="_adm-tab-content" style="display:none"></div>
            </div>`);
        document.body.appendChild(panel);

        panel.querySelector('#_adm-close').onclick = () => panel.remove();

        // Token management
        panel.querySelector('#_adm-token-save').onclick = () => {
            const val = normalizeGitHubToken(panel.querySelector('#_adm-token-input').value);
            if (val) {
                localStorage.setItem(TOKEN_KEY, val);
                panel.querySelector('#_adm-token-input').value = val;
                panel.querySelector('#_adm-token-status').textContent = '✅ Configurado';
                panel.querySelector('#_adm-token-status').style.color = '#25D366';
            } else {
                localStorage.removeItem(TOKEN_KEY);
                panel.querySelector('#_adm-token-status').textContent = '⚠️ No configurado';
            }
        };

        panel.querySelector('#_adm-token-test').onclick = async () => {
            const result = panel.querySelector('#_adm-token-test-result');
            const tokenInput = panel.querySelector('#_adm-token-input');
            const token = normalizeGitHubToken(tokenInput.value || localStorage.getItem(TOKEN_KEY) || '');
            result.style.display = 'block';
            result.style.color = '#888';
            result.textContent = '⏳ Probando conexión con GitHub...';
            if (!token) {
                result.style.color = '#f55';
                result.textContent = '❌ Pegá y guardá un token primero.';
                return;
            }
            try {
                localStorage.setItem(TOKEN_KEY, token);
                tokenInput.value = token;
                await ghGetSha('catalog-data.json', token);
                panel.querySelector('#_adm-token-status').textContent = '✅ Conexión OK';
                panel.querySelector('#_adm-token-status').style.color = '#25D366';
                result.style.color = '#25D366';
                result.textContent = '✅ Conexión OK. El token puede leer el catálogo; ya podés publicar cambios.';
            } catch (err) {
                result.style.color = '#f55';
                result.textContent = '❌ ' + friendlyGitHubError(err);
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

        // Extra bikes (admin-added)
        const extraBikes = serverData.extra_bikes || [];
        extraBikes.forEach((eb, i) => grid.appendChild(buildExtraBikeCard(i, eb, extraBikes)));
        const addBikeBtn = el('button', { class: '_adm-add-bike-btn' }, '➕ Agregar nueva bici');
        panel.querySelector('#_adm-tab-catalogo').appendChild(addBikeBtn);
        addBikeBtn.onclick = () => {
            const i = extraBikes.length;
            extraBikes.push({});
            grid.appendChild(buildExtraBikeCard(i, {}, extraBikes));
            addBikeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        // Build other tabs
        const site = serverData.site || {};
        panel.querySelector('#_adm-tab-hero').appendChild(buildHeroTab(site));
        panel.querySelector('#_adm-tab-contacto').appendChild(buildContactoTab(site));
        panel.querySelector('#_adm-tab-accesorios').appendChild(buildAccesoriosTab(site));
        panel.querySelector('#_adm-tab-pagos').appendChild(buildPagosTab(site));
    }

    // ── Card de bici en el panel ──────────────────────────────────────────
    function buildCard(idx, bike, publishedImages) {
        const card = el('div', { class: '_adm-card', 'data-idx': idx });
        const isDeleted = bike.deleted === true;

        card.innerHTML = `
            <div class="_adm-card-head" style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <span class="_adm-num">#${idx + 1}</span>
                    <strong>${bike.modelo}</strong>
                    ${publishedImages.length > 0 ? `<span class="_adm-badge-pub">✅ ${publishedImages.length} foto${publishedImages.length > 1 ? 's' : ''}</span>` : '<span class="_adm-badge-none">Sin fotos</span>'}
                </div>
                <button class="_adm-del-btn" style="background:#222;border:1px solid #444;color:#f55;padding:.3rem .6rem;border-radius:6px;cursor:pointer;font-size:.8rem">${isDeleted ? '👁️ Mostrar' : '🗑️ Ocultar'}</button>
            </div>`;
        if (isDeleted) card.style.opacity = '0.5';

        // Zona de imágenes
        card.appendChild(buildImageZone(idx, publishedImages));

        // Campos de texto
        const fields = el('div', { class: '_adm-fields' }, `
            <label>Nombre del modelo</label>
            <input class="_adm-f" data-field="modelo" value="${esc(bike.modelo||'')}" placeholder="Firebird Aluminio R29">
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

        const delBtn = card.querySelector('._adm-del-btn');
        if (delBtn) {
            delBtn.onclick = () => isDeleted ? showBike(card, idx, progress, okMsg) : hideBike(card, idx, progress, okMsg);
        }
        saveBtn.onclick = () => publishCard(card, idx, bike.modelo, publishedImages, progress, okMsg);
        return card;
    }

    // ── Zona de imágenes ─────────────────────────────────────────────────
    function buildImageZone(idx, publishedImages) {
        const zone = el('div', { class: '_adm-zone' });
        let newFiles = [];

        // Fotos ya publicadas
        let pubPrimaryIdx = 0;
        if (publishedImages.length > 0) {
            const pubSection = el('div', { class: '_adm-pub-section' });
            pubSection.innerHTML = `<p class="_adm-pub-label">📡 Fotos publicadas — clic para elegir la principal:</p>`;
            const pubThumbsEl = el('div', { class: '_adm-thumbs' });
            function renderPubThumbs() {
                pubThumbsEl.innerHTML = '';
                publishedImages.forEach((url, i) => {
                    const w = el('div', { class: '_adm-thumb' + (i === pubPrimaryIdx ? ' _adm-thumb-main' : ''), title: i===pubPrimaryIdx?'Foto principal':'Clic para marcar como principal' },
                        `<img src="${url}" alt="foto ${i+1}" onerror="this.style.opacity='.3'">
                         <span class="${i===pubPrimaryIdx?'_adm-label-main':'_adm-label-set'}">${i===pubPrimaryIdx?'★ Principal':'Marcar principal'}</span>`);
                    w.onclick = () => { pubPrimaryIdx = i; renderPubThumbs(); };
                    pubThumbsEl.appendChild(w);
                });
            }
            renderPubThumbs();
            pubSection.appendChild(pubThumbsEl);
            zone.appendChild(pubSection);
            zone.getPublishedImages = () => {
                const arr = [...publishedImages];
                if (pubPrimaryIdx > 0) arr.unshift(arr.splice(pubPrimaryIdx, 1)[0]);
                return arr;
            };
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
            let imagenesFinales = (zone && zone.getPublishedImages) ? zone.getPublishedImages() : currentImages;
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

    async function hideBike(card, idx, progressEl, okEl) {
        if (!confirm(`¿Estás seguro de que querés ocultar esta bici?`)) return;
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return alert('⚠️ Falta Token');
        progressEl.style.display = 'block';
        progressEl.textContent = '⏳ Ocultando bici...';
        okEl.style.display = 'none';
        try {
            const current = { ...(window.embiciateCatalog || {}) };
            current[idx] = { ...(current[idx] || {}), deleted: true };
            await ghCommitFile('catalog-data.json', btoa(unescape(encodeURIComponent(JSON.stringify(current, null, 2)))), token, `admin: oculta bici #${idx + 1}`, false);
            window.embiciateCatalog = current;
            card.style.opacity = '0.5';
            const btn = card.querySelector('._adm-del-btn');
            if (btn) { btn.innerHTML = '👁️ Mostrar'; btn.onclick = () => showBike(card, idx, progressEl, okEl); }
            progressEl.style.display = 'none';
            okEl.style.display = 'block';
            okEl.style.color = '#25D366';
            okEl.textContent = '✅ Bici ocultada.';
            setTimeout(() => { okEl.style.display = 'none'; }, 3000);
        } catch (e) {
            progressEl.style.display = 'none';
            okEl.style.display = 'block';
            okEl.style.color = '#f55';
            okEl.textContent = '❌ Error: ' + friendlyGitHubError(e);
        }
    }

    async function showBike(card, idx, progressEl, okEl) {
        if (!confirm(`¿Mostrar esta bici de nuevo en la página?`)) return;
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return alert('⚠️ Falta Token');
        progressEl.style.display = 'block';
        progressEl.textContent = '⏳ Mostrando bici...';
        okEl.style.display = 'none';
        try {
            const current = { ...(window.embiciateCatalog || {}) };
            const entry = { ...(current[idx] || {}) };
            delete entry.deleted;
            if (Object.keys(entry).length === 0) {
                delete current[idx];
            } else {
                current[idx] = entry;
            }
            await ghCommitFile('catalog-data.json', btoa(unescape(encodeURIComponent(JSON.stringify(current, null, 2)))), token, `admin: muestra bici #${idx + 1}`, false);
            window.embiciateCatalog = current;
            card.style.opacity = '1';
            const btn = card.querySelector('._adm-del-btn');
            if (btn) { btn.innerHTML = '🗑️ Ocultar'; btn.onclick = () => hideBike(card, idx, progressEl, okEl); }
            progressEl.style.display = 'none';
            okEl.style.display = 'block';
            okEl.style.color = '#25D366';
            okEl.textContent = '✅ Bici visible de nuevo.';
            setTimeout(() => { okEl.style.display = 'none'; }, 3000);
        } catch (e) {
            progressEl.style.display = 'none';
            okEl.style.display = 'block';
            okEl.style.color = '#f55';
            okEl.textContent = '❌ Error: ' + friendlyGitHubError(e);
        }
    }

    // ── GitHub API ────────────────────────────────────────────────────────
    async function ghGetSha(path, token) {
        const res = await ghFetch(ghContentsUrl(path, { ref: GH_BRANCH, t: Date.now() }), token, {
            headers: { 'If-None-Match': '', 'Cache-Control': 'no-cache' }
        });
        if (res.status === 404) return null;
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(githubStatusMessage(res.status, data.message));
        }
        return (await res.json()).sha;
    }

    async function ghCommitFile(path, base64Content, token, message, isBinary) {
        const sha  = await ghGetSha(path, token);
        const body = { message, content: base64Content, branch: GH_BRANCH };
        if (sha) body.sha = sha;
        const res = await ghFetch(ghContentsUrl(path), token, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(githubStatusMessage(res.status, data.message));
        }
        return res.json();
    }

    async function ghFetch(url, token, options = {}) {
        const cleanToken = normalizeGitHubToken(token);
        if (!cleanToken) throw new Error('Falta Token de GitHub');
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        const requestOptions = {
            ...options,
            signal: controller.signal,
            headers: {
                ...GH_HEADERS,
                Authorization: `Bearer ${cleanToken}`,
                ...(options.headers || {})
            }
        };
        try {
            return await fetch(url, requestOptions);
        } catch (err) {
            try {
                return await ghXhr(url, requestOptions);
            } catch (xhrErr) {
                throw new Error(friendlyGitHubError(xhrErr, err));
            }
        } finally {
            clearTimeout(timer);
        }
    }

    function ghXhr(url, options) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(options.method || 'GET', url, true);
            xhr.timeout = 20000;
            Object.entries(options.headers || {}).forEach(([key, value]) => xhr.setRequestHeader(key, value));
            xhr.onload = () => resolve({
                status: xhr.status,
                ok: xhr.status >= 200 && xhr.status < 300,
                json: async () => xhr.responseText ? JSON.parse(xhr.responseText) : {}
            });
            xhr.onerror = () => reject(new Error('XHR network error'));
            xhr.ontimeout = () => reject(new Error('XHR timeout'));
            xhr.send(options.body || null);
        });
    }

    function encodePath(path) {
        return path.split('/').map(encodeURIComponent).join('/');
    }

    function ghContentsUrl(path, params = {}) {
        const qs = new URLSearchParams({ path });
        Object.entries(params).forEach(([key, value]) => qs.set(key, value));
        return `${GH_API_BASE}?${qs.toString()}`;
    }

    function normalizeGitHubToken(token) {
        return (token || '')
            .replace(/^Bearer\s+/i, '')
            .replace(/^token\s+/i, '')
            .replace(/^["']|["']$/g, '')
            .replace(/\s+/g, '')
            .trim();
    }

    function githubStatusMessage(status, message) {
        if (status === 401) return 'Token inválido o vencido. Generá uno nuevo y pegalo nuevamente.';
        if (status === 403) return 'GitHub rechazó el cambio. Revisá que el token tenga permiso de escritura sobre Contents/repositorio.';
        if (status === 404) return `No encontré el repo ${GH_OWNER}/${GH_REPO} o el archivo indicado.`;
        if (status === 409) return 'El archivo cambió en GitHub mientras editabas. Recargá la página e intentá de nuevo.';
        if (status === 422) return 'GitHub no aceptó el contenido enviado. Probá recargar la página y publicar otra vez.';
        return message || `GitHub error ${status}`;
    }

    function friendlyGitHubError(err, originalErr) {
        if (err.name === 'AbortError' || /timeout/i.test(err.message || '')) return 'GitHub tardó demasiado en responder. Revisá la conexión e intentá de nuevo.';
        if (/Failed to fetch|NetworkError|Load failed/i.test(err.message || '')) {
            return `No se pudo conectar con GitHub desde ${location.protocol}//${location.host || 'archivo local'}. Probá en Chrome/Safari normal, sin modo privado ni bloqueadores, y abrí la web desde https://.`;
        }
        if (/XHR network error/i.test(err.message || '')) {
            const fetchMsg = originalErr && originalErr.message ? ` Fetch: ${originalErr.message}.` : '';
            return `El navegador bloqueó la conexión autenticada con GitHub desde ${location.protocol}//${location.host || 'archivo local'}.${fetchMsg} Probá desactivar bloqueadores/protección del navegador o usar Chrome/Safari normal.`;
        }
        return err.message || String(err);
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
            const row = el('div', { class: '_adm-slide-row', style: 'border:1px solid #333;padding:.8rem;border-radius:8px;margin-bottom:.8rem' });
            row.innerHTML = `<span class="_adm-num" style="display:block;margin-bottom:.5rem">#${i+1} Slider</span>`;
            const zone = buildSingleImg(`hero-slide-${i}`, slide.imagen || '');
            row.appendChild(zone);
            const fields = el('div', { class: '_adm-fields', style: 'margin-top:.6rem' }, `
                <label>Modelo de Bici</label>
                <input class="_adm-f _adm-slide-f" data-field="modelo" value="${esc(slide.modelo || '')}">
                <label>Precio</label>
                <input class="_adm-f _adm-slide-f" data-field="precio" value="${esc(slide.precio || '')}">
                <label>Especificaciones</label>
                <input class="_adm-f _adm-slide-f" data-field="specs" value="${esc(slide.specs || '')}">
            `);
            row.appendChild(fields);
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
            const rows = sliderWrap.querySelectorAll('._adm-slide-row');
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                row.querySelectorAll('._adm-slide-f').forEach(inp => {
                    newSlider[i][inp.dataset.field] = inp.value.trim();
                });
                const zone = row.querySelector('._adm-single-zone');
                const f = zone && zone.getFile ? zone.getFile() : null;
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
            <label>Mensaje WhatsApp barra de navegación</label>
            <input class="_adm-f" data-sfield="whatsapp_mensaje_nav" value="${esc(site.whatsapp_mensaje_nav||cfg.whatsapp_mensaje_nav||'')}" placeholder="Hola! Vengo de la página web...">
            <label>Mensaje WhatsApp sección Accesorios</label>
            <input class="_adm-f" data-sfield="whatsapp_mensaje_accesorios" value="${esc(site.whatsapp_mensaje_accesorios||cfg.whatsapp_mensaje_accesorios||'')}" placeholder="Hola! Me interesa accesorios...">
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
        // Extra contact items
        let extraContacts = [...(site.contacto_extra || [])];
        const ecSection = el('div', { class: '_adm-fields', style: 'margin-top:.8rem' });
        ecSection.innerHTML = `<span style="color:#ff7733;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px">Datos adicionales de contacto</span>`;
        const ecList = el('div', {});
        function renderEC() {
            ecList.innerHTML = '';
            extraContacts.forEach((item, i) => {
                const row = el('div', { style: 'display:flex;gap:.4rem;margin-bottom:.4rem;align-items:center' });
                row.innerHTML = `
                    <input class="_adm-f" style="flex:0 0 52px;text-align:center" data-ec="icon-${i}" placeholder="📍" value="${esc(item.icon||'')}">
                    <input class="_adm-f" style="flex:1" data-ec="label-${i}" placeholder="Etiqueta" value="${esc(item.label||'')}">
                    <input class="_adm-f" style="flex:2" data-ec="val-${i}" placeholder="Valor" value="${esc(item.value||'')}">
                    <button data-ec-del="${i}" style="flex-shrink:0;background:#1a1a1a;border:1px solid #444;color:#f66;border-radius:6px;padding:.4rem .6rem;cursor:pointer">×</button>`;
                row.querySelector(`[data-ec-del="${i}"]`).onclick = () => { extraContacts.splice(i,1); renderEC(); };
                ecList.appendChild(row);
            });
        }
        renderEC();
        ecSection.appendChild(ecList);
        const addEcBtn = el('button', { style: 'width:100%;margin-top:.4rem;padding:.5rem;background:#1a1a1a;border:1px dashed #444;color:#888;border-radius:8px;cursor:pointer;font-family:inherit;font-size:.82rem' }, '➕ Agregar dato de contacto');
        addEcBtn.onclick = () => { extraContacts.push({ icon:'📍', label:'', value:'' }); renderEC(); };
        ecSection.appendChild(addEcBtn);
        wrap.appendChild(ecSection);

        const btn = el('button', { class: '_adm-save', style: 'margin-top:.8rem' }, '🚀 Publicar cambios de Contacto');
        wrap.appendChild(btn); wrap.appendChild(prog); wrap.appendChild(ok);
        btn.onclick = async () => {
            const overrides = {};
            wrap.querySelectorAll('[data-sfield]').forEach(inp => { overrides[inp.dataset.sfield] = inp.value.trim(); });
            overrides.contacto_extra = extraContacts.map((_,i) => ({
                icon:  ecList.querySelector(`[data-ec="icon-${i}"]`)?.value?.trim()  || '📍',
                label: ecList.querySelector(`[data-ec="label-${i}"]`)?.value?.trim() || '',
                value: ecList.querySelector(`[data-ec="val-${i}"]`)?.value?.trim()   || ''
            })).filter(c => c.label || c.value);
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

    // ── Tab: Pagos ────────────────────────────────────────────────────────
    function buildPagosTab(site) {
        const wrap = el('div', { class: '_adm-section' });
        const prog = el('div', { class: '_adm-progress', style: 'display:none' });
        const ok   = el('div', { class: '_adm-ok-msg',  style: 'display:none' });
        wrap.innerHTML = `<h3 class="_adm-section-title">💳 Sección de Pagos</h3>`;
        
        const imgVisa = buildSingleImg('pago-visa', site.pago_img_visa || 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg');
        const imgMc = buildSingleImg('pago-mc', site.pago_img_mc || 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg');
        wrap.appendChild(el('div', {style:'margin-bottom:.5rem;color:#888;font-size:.8rem;font-weight:700'}, 'Logo Visa'));
        wrap.appendChild(imgVisa);
        wrap.appendChild(el('div', {style:'margin-bottom:.5rem;color:#888;font-size:.8rem;font-weight:700'}, 'Logo Mastercard'));
        wrap.appendChild(imgMc);

        const fields = el('div', { class: '_adm-fields' }, `
            <label>Badge destacado (ej: ⚡ 3 cuotas sin interés)</label>
            <input class="_adm-f" data-sfield="pago_badge_1" value="${esc(site.pago_badge_1||'⚡ 3 cuotas sin interés')}">
            <label>Descripción destacado (ej: Con Visa y Mastercard)</label>
            <input class="_adm-f" data-sfield="pago_desc_1" value="${esc(site.pago_desc_1||'Con Visa y Mastercard')}">
            <label>Badge resto de tarjetas (ej: Resto de tarjetas)</label>
            <input class="_adm-f" data-sfield="pago_badge_2" value="${esc(site.pago_badge_2||'Resto de tarjetas')}">
            <label>Descripción resto (ej: Hasta 12 cuotas fijas)</label>
            <input class="_adm-f" data-sfield="pago_desc_2" value="${esc(site.pago_desc_2||'Hasta 12 cuotas fijas')}">
        `);
        wrap.appendChild(fields);

        const btn = el('button', { class: '_adm-save', style: 'margin-top:.8rem' }, '🚀 Publicar cambios de Pagos');
        wrap.appendChild(btn); wrap.appendChild(prog); wrap.appendChild(ok);
        
        btn.onclick = async () => {
            const overrides = {};
            wrap.querySelectorAll('[data-sfield]').forEach(inp => { overrides[inp.dataset.sfield] = inp.value.trim(); });
            
            // Subir logos si se cambiaron
            const fVisa = imgVisa.getFile ? imgVisa.getFile() : null;
            if (fVisa) {
                const ext  = fVisa.name.split('.').pop() || 'png';
                const path = `assets/pago-visa.${ext}`;
                const b64  = (await blobToBase64(fVisa)).split(',')[1];
                prog.style.display = 'block'; prog.textContent = '⏳ Subiendo logo Visa...';
                await ghCommitFile(path, b64, localStorage.getItem(TOKEN_KEY), 'admin: logo pago visa', true);
                overrides.pago_img_visa = path;
            }
            const fMc = imgMc.getFile ? imgMc.getFile() : null;
            if (fMc) {
                const ext  = fMc.name.split('.').pop() || 'png';
                const path = `assets/pago-mc.${ext}`;
                const b64  = (await blobToBase64(fMc)).split(',')[1];
                prog.style.display = 'block'; prog.textContent = '⏳ Subiendo logo Mastercard...';
                await ghCommitFile(path, b64, localStorage.getItem(TOKEN_KEY), 'admin: logo pago mc', true);
                overrides.pago_img_mc = path;
            }
            
            await publishSiteSection(overrides, prog, ok);
        };
        return wrap;
    }

    // ── Nueva bici (extra) ────────────────────────────────────────────────
    function buildExtraBikeCard(extraIdx, bike, allExtras) {
        const card = el('div', { class: '_adm-card', 'data-extra-idx': extraIdx });
        card.innerHTML = `<div class="_adm-card-head"><span class="_adm-num">NUEVA #${extraIdx+1}</span><strong>${esc(bike.modelo||'Nueva bici')}</strong><span class="_adm-badge-none">Extra</span></div>`;
        card.appendChild(buildImageZone('extra-' + extraIdx, bike.imagenes || []));
        const fields = el('div', { class: '_adm-fields' }, `
            <label>Nombre del modelo</label>
            <input class="_adm-f" data-field="modelo" value="${esc(bike.modelo||'')}" placeholder="Nombre del modelo">
            <label>Precio</label>
            <input class="_adm-f" data-field="precio" value="${esc(bike.precio||'')}" placeholder="$299.900">
            <label>Etiqueta / Badge</label>
            <input class="_adm-f" data-field="etiqueta" value="${esc(bike.etiqueta||'')}" placeholder="MTB">
            <label>Especificaciones (una por línea)</label>
            <textarea class="_adm-f _adm-ta" data-field="specs" rows="3">${Array.isArray(bike.specs)?bike.specs.join('\n'):''}</textarea>`);
        card.appendChild(fields);
        const actions = el('div', { class: '_adm-actions' });
        const saveBtn = el('button', { class: '_adm-save' }, '🚀 Publicar bici');
        actions.appendChild(saveBtn); card.appendChild(actions);
        const prog = el('div', { class: '_adm-progress', style: 'display:none' });
        const ok   = el('div', { class: '_adm-ok-msg',  style: 'display:none' });
        
        const delBtn = el('button', { style: 'background:#222;border:1px solid #444;color:#f55;padding:.3rem .6rem;border-radius:6px;cursor:pointer;font-size:.8rem;margin-bottom:.5rem' }, '🗑️ Eliminar Bici Extra');
        delBtn.onclick = async () => {
            if (!confirm('¿Seguro que querés eliminar esta bici extra?')) return;
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return alert('⚠️ Falta Token');
            prog.style.display = 'block'; prog.textContent = '⏳ Eliminando...';
            try {
                allExtras.splice(extraIdx, 1);
                const current = { ...(window.embiciateCatalog||{}) };
                current.extra_bikes = allExtras;
                await ghCommitFile('catalog-data.json', btoa(unescape(encodeURIComponent(JSON.stringify(current,null,2)))), token, `admin: elimina bici extra #${extraIdx+1}`, false);
                window.embiciateCatalog = current;
                card.remove();
            } catch(e) {
                ok.style.display='block'; ok.style.color='#f55'; ok.textContent = '❌ Error: '+e.message;
            }
        };
        actions.prepend(delBtn);

        card.appendChild(prog); card.appendChild(ok);
        saveBtn.onclick = () => publishExtraBike(card, extraIdx, allExtras, prog, ok);
        return card;
    }

    async function publishExtraBike(card, extraIdx, allExtras, progressEl, okEl) {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) { alert('⚠️ Configurá el Token de GitHub primero.'); return; }
        const zone     = card.querySelector('._adm-zone');
        const newFiles = zone ? zone.getNewFiles() : [];
        progressEl.style.display = 'block'; progressEl.textContent = '⏳ Publicando...';
        okEl.style.display = 'none';
        try {
            let imagenes = (allExtras[extraIdx] || {}).imagenes || [];
            if (newFiles.length > 0) {
                imagenes = [];
                for (let i = 0; i < newFiles.length; i++) {
                    const f = newFiles[i], ext = f.name.split('.').pop()||'jpg';
                    const path = `assets/extra-${extraIdx}-${i}.${ext}`;
                    progressEl.textContent = `⏳ Subiendo foto ${i+1}/${newFiles.length}...`;
                    await ghCommitFile(path, (await blobToBase64(f)).split(',')[1], token, `admin: extra bike ${extraIdx} img ${i}`, true);
                    imagenes.push(path);
                }
            }
            const fields = {};
            card.querySelectorAll('._adm-f').forEach(inp => {
                const k = inp.dataset.field;
                fields[k] = k==='specs' ? inp.value.split('\n').map(s=>s.trim()).filter(Boolean) : inp.value.trim();
            });
            if (imagenes.length) fields.imagenes = imagenes;
            fields.mensaje = `Hola, me interesa la ${fields.modelo||'bici'}, ¿tienen stock?`;
            allExtras[extraIdx] = fields;
            const current = { ...(window.embiciateCatalog||{}) };
            current.extra_bikes = allExtras;
            progressEl.textContent = '⏳ Actualizando catálogo...';
            await ghCommitFile('catalog-data.json', btoa(unescape(encodeURIComponent(JSON.stringify(current,null,2)))), token, `admin: extra bici #${extraIdx+1}`, false);
            window.embiciateCatalog = current;
            progressEl.style.display = 'none';
            okEl.style.display = 'block'; okEl.innerHTML = '✅ ¡Publicado! Visible en ~1-2 minutos.';
            setTimeout(() => { okEl.style.display='none'; }, 5000);
        } catch(err) {
            progressEl.style.display='none'; okEl.style.display='block';
            okEl.style.color='#f55'; okEl.textContent='❌ Error: '+err.message;
        }
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
        #_adm-token-test{padding:.5rem 1rem;background:#1a1a1a;color:#ddd;border:1px solid #333;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;white-space:nowrap}
        #_adm-token-test:hover{border-color:#ff7733;color:#fff}
        #_adm-token-test-result{font-size:.75rem;margin:.55rem 0 0;line-height:1.5}
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
        ._adm-add-bike-btn{display:block;width:100%;margin-top:1rem;padding:.7rem;background:transparent;border:2px dashed #333;color:#888;border-radius:10px;cursor:pointer;font-family:inherit;font-size:.9rem;font-weight:700;transition:all .2s}
        ._adm-add-bike-btn:hover{border-color:#ff5500;color:#ff5500}
        @media(max-width:600px){
            #_adm-body{padding:.8rem}
            #_adm-grid{grid-template-columns:1fr}
            #_adm-header{padding:.8rem 1rem}
        }`;;
        document.head.appendChild(s);
    }
})();
