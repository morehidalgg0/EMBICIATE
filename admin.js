// =========================================================================
// 🔒 PANEL DE ADMINISTRACIÓN EMBICIATE
// Acceso: Ctrl + Shift + A  |  Contraseña: cambiala abajo
// =========================================================================
(function () {

    const ADMIN_PASSWORD = 'embiciate2026';   // ← CAMBIÁ ESTO
    const STORAGE_KEY    = 'embiciate_admin_overrides';
    const SESSION_KEY    = 'embiciate_admin_session';
    let authenticated    = sessionStorage.getItem(SESSION_KEY) === '1';

    // ── Atajo de teclado ─────────────────────────────────────────────────
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
        const m = make('div', { id: '_adm-modal' }, `
            <div id="_adm-box">
                <div style="font-size:2.2rem;margin-bottom:.8rem">🔒</div>
                <h2>Panel Admin</h2>
                <p>Ingresá la contraseña</p>
                <input id="_adm-pwd" type="password" placeholder="Contraseña" autocomplete="off">
                <div id="_adm-err" style="display:none;color:#f66;font-size:.82rem;margin-bottom:.5rem">Contraseña incorrecta</div>
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
        m.querySelector('#_adm-ok').onclick     = tryLogin;
        m.querySelector('#_adm-pwd').onkeydown  = e => { if (e.key === 'Enter') tryLogin(); };
        m.querySelector('#_adm-cancel').onclick = () => m.remove();
    }

    // ── Panel principal ───────────────────────────────────────────────────
    async function mountPanel() {
        if (document.getElementById('_adm-panel')) return;
        injectStyles();

        const bikes  = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.bicicletas_destacadas))
            ? CONFIG.bicicletas_destacadas : [];
        const saved  = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

        const panel = make('div', { id: '_adm-panel' }, `
            <div id="_adm-header">
                <div style="display:flex;align-items:center;gap:.7rem">
                    <span style="font-size:1.3rem">🔒</span>
                    <div>
                        <strong style="color:#fff;display:block">Panel de Administración</strong>
                        <small style="color:#666;font-size:.73rem">Embiciate — cambios guardados en este dispositivo</small>
                    </div>
                </div>
                <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                    <button id="_adm-reset-all">↩ Restaurar todo</button>
                    <button id="_adm-close">✕ Cerrar</button>
                </div>
            </div>
            <div id="_adm-body">
                <div id="_adm-info">
                    💡 Las fotos se guardan en <strong>este navegador</strong> y se muestran de inmediato.<br>
                    Podés subir <strong>varias fotos por bici</strong> — los visitantes van a poder verlas tocando la imagen.
                </div>
                <div id="_adm-grid"></div>
            </div>`);
        document.body.appendChild(panel);

        const grid = panel.querySelector('#_adm-grid');
        for (let i = 0; i < bikes.length; i++) {
            const bike   = saved[i] ? { ...bikes[i], ...saved[i] } : { ...bikes[i] };
            const blobs  = await window.embiciateDB.get(i);
            grid.appendChild(buildCard(i, bike, blobs, !!saved[i]));
        }

        panel.querySelector('#_adm-close').onclick      = () => panel.remove();
        panel.querySelector('#_adm-reset-all').onclick  = async () => {
            if (!confirm('¿Restaurar todos los datos e imágenes al estado original?')) return;
            localStorage.removeItem(STORAGE_KEY);
            for (let i = 0; i < bikes.length; i++) await window.embiciateDB.clear(i);
            panel.remove();
            refreshGrid();
        };
    }

    // ── Construir card de bici en el panel ───────────────────────────────
    function buildCard(idx, bike, blobs, isModified) {
        const card = make('div', { class: '_adm-card', 'data-idx': idx });

        // Cabecera
        card.innerHTML = `
            <div class="_adm-card-head">
                <span class="_adm-num">#${idx + 1}</span>
                <strong>${bike.modelo}</strong>
                ${isModified ? '<span class="_adm-badge-mod">Modificado</span>' : ''}
            </div>`;

        // Zona de imágenes
        card.appendChild(buildImageZone(idx, blobs || []));

        // Campos de texto
        const fields = make('div', { class: '_adm-fields' }, `
            <label>Precio</label>
            <input class="_adm-f" data-field="precio" value="${esc(bike.precio)}" placeholder="$299.900">
            <label>Etiqueta / Badge</label>
            <input class="_adm-f" data-field="etiqueta" value="${esc(bike.etiqueta)}" placeholder="MTB">
            <label>Especificaciones (una por línea)</label>
            <textarea class="_adm-f _adm-ta" data-field="specs" rows="3"
                placeholder="Rodado 29&#10;21 velocidades&#10;Frenos a disco">${Array.isArray(bike.specs) ? bike.specs.join('\n') : ''}</textarea>`);
        card.appendChild(fields);

        // Botones
        const actions = make('div', { class: '_adm-actions' }, `
            <button class="_adm-save">💾 Guardar</button>
            ${isModified ? '<button class="_adm-reset-card">↩ Restaurar</button>' : ''}`);
        card.appendChild(actions);

        const msg = make('div', { class: '_adm-ok-msg', style: 'display:none' }, '✅ Guardado — la página se actualizó');
        card.appendChild(msg);

        // Eventos
        actions.querySelector('._adm-save').onclick = () => saveCard(card, idx, bike.modelo, msg);
        const resetBtn = actions.querySelector('._adm-reset-card');
        if (resetBtn) {
            resetBtn.onclick = async () => {
                const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                delete all[idx];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
                await window.embiciateDB.clear(idx);
                document.getElementById('_adm-panel').remove();
                refreshGrid();
                setTimeout(mountPanel, 120);
            };
        }

        return card;
    }

    // ── Zona de upload de imágenes ────────────────────────────────────────
    function buildImageZone(idx, existingBlobs) {
        const zone = make('div', { class: '_adm-zone', 'data-zone-idx': idx });

        const thumbsEl = make('div', { class: '_adm-thumbs' });
        zone.appendChild(thumbsEl);

        // Estado mutable de blobs
        let blobs = [...existingBlobs];
        renderThumbs(thumbsEl, blobs, onChange);

        function onChange(newBlobs) {
            blobs = newBlobs;
            // Preview instantáneo en el panel
            renderThumbs(thumbsEl, blobs, onChange);
        }

        // Botón de agregar
        const addBtn = make('label', { class: '_adm-add-btn' },
            `📁 Agregar fotos<input type="file" accept="image/*" multiple style="display:none">`);
        zone.appendChild(addBtn);

        addBtn.querySelector('input').onchange = async e => {
            const files = Array.from(e.target.files);
            blobs = blobs.concat(files);
            renderThumbs(thumbsEl, blobs, onChange);
            e.target.value = '';
        };

        // Drag & drop
        zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('_adm-drag'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('_adm-drag'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('_adm-drag');
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
            blobs = blobs.concat(files);
            renderThumbs(thumbsEl, blobs, onChange);
        });

        // Hint
        zone.appendChild(make('p', { class: '_adm-hint' },
            'La primera foto es la principal. Clic en × para borrar una.'));

        // Exponer blobs actuales al momento de guardar
        zone.getBlobs = () => blobs;
        return zone;
    }

    function renderThumbs(container, blobs, onChange) {
        container.innerHTML = '';
        if (blobs.length === 0) {
            container.innerHTML = '<span class="_adm-no-img">Sin fotos guardadas</span>';
            return;
        }
        blobs.forEach((blob, i) => {
            const url  = URL.createObjectURL(blob);
            const wrap = make('div', { class: '_adm-thumb' + (i === 0 ? ' _adm-thumb-main' : '') });
            wrap.innerHTML = `
                <img src="${url}" alt="foto ${i + 1}">
                ${i === 0 ? '<span class="_adm-label-main">Principal</span>' : ''}
                <button class="_adm-del-img" title="Eliminar">×</button>`;
            wrap.querySelector('._adm-del-img').onclick = () => {
                const newBlobs = blobs.filter((_, j) => j !== i);
                onChange(newBlobs);
            };
            container.appendChild(wrap);
        });
    }

    // ── Guardar card ──────────────────────────────────────────────────────
    async function saveCard(card, idx, modeloOriginal, msgEl) {
        const zone  = card.querySelector('[data-zone-idx]');
        const blobs = zone ? zone.getBlobs() : [];

        // Guardar imágenes en IndexedDB
        await window.embiciateDB.save(idx, blobs);

        // Guardar campos de texto en localStorage
        const all    = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const fields = {};
        card.querySelectorAll('._adm-f').forEach(input => {
            const key = input.dataset.field;
            fields[key] = key === 'specs'
                ? input.value.split('\n').map(s => s.trim()).filter(Boolean)
                : input.value.trim();
        });
        const modelo = fields['etiqueta'] ? modeloOriginal : modeloOriginal;
        fields['mensaje'] = `Hola, me interesa la ${modeloOriginal}, ¿tienen stock?`;
        all[idx] = fields;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

        // Actualizar la página al instante
        refreshGrid();

        // Aplicar imágenes al card en la página sin esperar el refresh completo
        setTimeout(async () => {
            const pageCards = document.querySelectorAll('.product-card[data-bike-idx]');
            const pageCard  = [...pageCards].find(c => parseInt(c.dataset.bikeIdx) === idx);
            if (pageCard && blobs.length > 0) window.embiciateDB.applyToCard(pageCard, blobs);
        }, 100);

        // Mensaje de confirmación
        msgEl.style.display = 'block';
        setTimeout(() => { msgEl.style.display = 'none'; }, 2500);
    }

    // ── Re-renderiza el grid de la página ─────────────────────────────────
    function refreshGrid() {
        const grid = document.getElementById('bicicletas-destacadas');
        if (!grid || typeof CONFIG === 'undefined') return;
        const numero    = CONFIG.whatsapp_numero ? CONFIG.whatsapp_numero.replace(/\D/g, '') : '';
        const overrides = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const bikes     = CONFIG.bicicletas_destacadas.map((b, i) => overrides[i] ? { ...b, ...overrides[i] } : b);
        const waIcon    = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;
        grid.innerHTML = bikes.map((bike, index) => {
            const specs   = Array.isArray(bike.specs) ? bike.specs : [];
            const msg     = encodeURIComponent(bike.mensaje || `Hola Embiciate, quiero consultar por ${bike.modelo}.`);
            const waLink  = numero ? `https://wa.me/${numero}?text=${msg}` : '#contacto';
            return `
                <article class="product-card fade-in-up visible" data-bike-idx="${index}">
                    <div class="product-img-wrapper">
                        <span class="product-badge">${bike.etiqueta || 'Destacada'}</span>
                        <img src="${bike.imagen || ''}" alt="${bike.modelo}" class="product-img" loading="lazy">
                        <div class="product-price-overlay">${bike.precio}</div>
                    </div>
                    <div class="product-content">
                        <h3>${bike.modelo}</h3>
                        <ul class="product-specs">${specs.map(s => `<li>${s}</li>`).join('')}</ul>
                        <div class="product-cuotas">
                            <span class="cuotas-badge">⚡ 3 cuotas sin interés</span>
                            <span class="cuotas-sub">Visa y Mastercard</span>
                        </div>
                        <div class="product-divider"></div>
                        <a href="${waLink}" target="_blank" rel="noopener" class="product-btn">
                            ${waIcon} Consultar por WhatsApp
                        </a>
                    </div>
                </article>`;
        }).join('');
        window.embiciateDB.loadCardImages();
    }

    // ── Helpers ───────────────────────────────────────────────────────────
    function make(tag, attrs, content) {
        const el = document.createElement(tag);
        Object.entries(attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
        if (content !== undefined) {
            if (content instanceof HTMLElement) el.appendChild(content);
            else el.innerHTML = content;
        }
        return el;
    }
    function esc(str) { return (str || '').replace(/"/g, '&quot;'); }

    // ── Estilos ───────────────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('_adm-css')) return;
        const s = document.createElement('style');
        s.id = '_adm-css';
        s.textContent = `
        #_adm-modal {
            position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.88);
            backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;
            font-family:'Outfit','Inter',sans-serif;animation:_adm-in .2s ease;
        }
        #_adm-box {
            background:#111;border:1px solid #2a2a2a;border-radius:16px;
            padding:2.5rem;width:min(360px,92vw);text-align:center;
            box-shadow:0 30px 80px rgba(0,0,0,.6);
        }
        #_adm-box h2{color:#fff;font-size:1.4rem;margin:.4rem 0}
        #_adm-box p{color:#888;font-size:.88rem;margin-bottom:1.2rem}
        #_adm-pwd {
            width:100%;padding:.75rem 1rem;background:#1a1a1a;border:1px solid #333;
            border-radius:8px;color:#fff;font-size:1rem;margin-bottom:.6rem;
            outline:none;font-family:inherit;transition:border-color .2s;box-sizing:border-box;
        }
        #_adm-pwd:focus{border-color:#ff5500}
        #_adm-box button {
            width:100%;padding:.7rem;border-radius:8px;font-size:.92rem;font-weight:700;
            cursor:pointer;border:none;font-family:inherit;margin-top:.4rem;transition:all .2s;
        }
        #_adm-ok{background:#ff5500;color:#fff}
        #_adm-ok:hover{background:#ff7733}
        ._adm-ghost{background:transparent!important;border:1px solid #333!important;color:#888!important}
        ._adm-ghost:hover{border-color:#555!important;color:#ccc!important}

        #_adm-panel {
            position:fixed;inset:0;z-index:99998;background:#0a0a0a;
            display:flex;flex-direction:column;font-family:'Outfit','Inter',sans-serif;
            animation:_adm-in .2s ease;overflow:hidden;
        }
        #_adm-header {
            display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;
            gap:.8rem;padding:1rem 1.5rem;background:#111;border-bottom:1px solid #222;flex-shrink:0;
        }
        #_adm-header button {
            padding:.45rem 1rem;border-radius:8px;border:none;font-size:.82rem;
            font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;
        }
        #_adm-close{background:#ff5500;color:#fff}
        #_adm-close:hover{background:#ff7733}
        #_adm-reset-all{background:transparent;border:1px solid #444!important;color:#aaa}
        #_adm-reset-all:hover{border-color:#f55!important;color:#f55}
        #_adm-body{flex:1;overflow-y:auto;padding:1.2rem}
        #_adm-info {
            background:rgba(255,85,0,.07);border:1px solid rgba(255,85,0,.2);
            border-radius:8px;padding:.8rem 1.2rem;color:#bbb;font-size:.81rem;
            line-height:1.6;margin-bottom:1.2rem;
        }
        #_adm-info strong{color:#fff}
        #_adm-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1rem}

        ._adm-card {
            background:#141414;border:1px solid #222;border-radius:12px;
            padding:1.1rem;display:flex;flex-direction:column;gap:.5rem;
        }
        ._adm-card-head {
            display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.3rem;
        }
        ._adm-num {
            background:#222;color:#777;font-size:.7rem;font-weight:700;
            padding:.12rem .5rem;border-radius:999px;
        }
        ._adm-card-head strong{color:#fff;font-size:.92rem;flex:1}
        ._adm-badge-mod {
            font-size:.65rem;font-weight:900;text-transform:uppercase;
            background:rgba(215,255,50,.1);border:1px solid rgba(215,255,50,.3);
            color:#d7ff32;padding:.1rem .45rem;border-radius:999px;
        }

        /* Zona de imágenes */
        ._adm-zone {
            background:#0e0e0e;border:2px dashed #2a2a2a;border-radius:10px;
            padding:.8rem;transition:border-color .2s;
        }
        ._adm-zone._adm-drag{border-color:#ff5500;background:rgba(255,85,0,.05)}
        ._adm-thumbs {
            display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.6rem;min-height:30px;
        }
        ._adm-no-img{color:#555;font-size:.78rem;align-self:center}
        ._adm-thumb {
            position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;
            border:2px solid #333;flex-shrink:0;
        }
        ._adm-thumb-main{border-color:#ff5500}
        ._adm-thumb img{width:100%;height:100%;object-fit:cover}
        ._adm-label-main {
            position:absolute;bottom:0;left:0;right:0;background:rgba(255,85,0,.85);
            color:#fff;font-size:.55rem;font-weight:900;text-align:center;
            padding:.1rem;text-transform:uppercase;letter-spacing:.5px;
        }
        ._adm-del-img {
            position:absolute;top:2px;right:2px;width:18px;height:18px;
            background:rgba(0,0,0,.8);border:none;border-radius:50%;color:#fff;
            font-size:.85rem;line-height:1;cursor:pointer;display:flex;
            align-items:center;justify-content:center;padding:0;
            transition:background .2s;
        }
        ._adm-del-img:hover{background:#f55}
        ._adm-add-btn {
            display:inline-flex;align-items:center;gap:.4rem;cursor:pointer;
            background:#1e1e1e;border:1px solid #333;border-radius:8px;
            padding:.45rem .9rem;color:#ccc;font-size:.8rem;font-weight:600;
            transition:all .2s;font-family:inherit;
        }
        ._adm-add-btn:hover{border-color:#ff5500;color:#ff5500}
        ._adm-hint{color:#555;font-size:.7rem;margin:.4rem 0 0;line-height:1.4}

        /* Campos de texto */
        ._adm-fields{display:flex;flex-direction:column;gap:.3rem}
        ._adm-fields label{color:#777;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;margin-top:.3rem}
        ._adm-f {
            padding:.5rem .75rem;background:#1a1a1a;border:1px solid #2a2a2a;
            border-radius:8px;color:#fff;font-size:.86rem;font-family:inherit;
            outline:none;transition:border-color .2s;width:100%;box-sizing:border-box;
        }
        ._adm-f:focus{border-color:#ff5500}
        ._adm-ta{resize:vertical;min-height:68px;line-height:1.5}

        ._adm-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.3rem}
        ._adm-save {
            flex:1;padding:.55rem .8rem;background:#ff5500;color:#fff;
            border:none;border-radius:8px;font-size:.82rem;font-weight:700;
            cursor:pointer;font-family:inherit;transition:background .2s;
        }
        ._adm-save:hover{background:#ff7733}
        ._adm-reset-card {
            padding:.55rem .8rem;background:transparent;border:1px solid #333;
            color:#888;border-radius:8px;font-size:.82rem;font-weight:600;
            cursor:pointer;font-family:inherit;transition:all .2s;
        }
        ._adm-reset-card:hover{border-color:#555;color:#ccc}
        ._adm-ok-msg{color:#25D366;font-size:.8rem;font-weight:700;text-align:center;padding:.3rem;animation:_adm-in .2s ease}

        /* Galería en product cards */
        .pg-dots {
            position:absolute;bottom:8px;left:50%;transform:translateX(-50%);
            display:flex;gap:5px;z-index:5;pointer-events:auto;
        }
        .pg-dot {
            width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.4);
            cursor:pointer;transition:background .2s,transform .2s;
        }
        .pg-dot.active{background:#fff;transform:scale(1.3)}
        .product-img-wrapper{cursor:pointer}

        @keyframes _adm-in {
            from{opacity:0;transform:translateY(-6px)}
            to{opacity:1;transform:translateY(0)}
        }
        @media(max-width:600px){
            #_adm-body{padding:.8rem}
            #_adm-grid{grid-template-columns:1fr}
        }`;
        document.head.appendChild(s);
    }
})();
