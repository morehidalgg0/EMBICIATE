// =========================================================================
// 🔒 PANEL DE ADMINISTRACIÓN EMBICIATE — SOLO PARA USO INTERNO
// =========================================================================
// Acceso: presioná Ctrl + Shift + A en cualquier parte del sitio
// Contraseña: cambiala en la línea de abajo (ADMIN_PASSWORD)
// Los cambios se guardan automáticamente en este dispositivo/navegador.
// Para que se vean en otro dispositivo, guardá los cambios también en config.js.
// =========================================================================

(function () {

    const ADMIN_PASSWORD  = 'embiciate2026';   // ← CAMBIÁ ESTO
    const STORAGE_KEY     = 'embiciate_admin_overrides';
    const SESSION_KEY     = 'embiciate_admin_session';

    let authenticated = sessionStorage.getItem(SESSION_KEY) === '1';

    /* ── Atajo de teclado: Ctrl + Shift + A ── */
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            authenticated ? mountPanel() : mountPasswordModal();
        }
    });

    /* ── Contraseña ── */
    function mountPasswordModal() {
        if (document.getElementById('_adm-modal')) return;

        const modal = el('div', { id: '_adm-modal' }, `
            <div id="_adm-modal-box">
                <div id="_adm-modal-logo">🔒</div>
                <h2>Panel Admin</h2>
                <p>Ingresá la contraseña para continuar</p>
                <input id="_adm-pwd" type="password" placeholder="Contraseña" autocomplete="off">
                <div id="_adm-pwd-error" style="display:none">Contraseña incorrecta</div>
                <button id="_adm-pwd-btn">Ingresar</button>
                <button id="_adm-pwd-close" class="_adm-ghost-btn">Cancelar</button>
            </div>
        `);

        document.body.appendChild(modal);
        injectStyles();
        document.getElementById('_adm-pwd').focus();

        const attempt = () => {
            const val = document.getElementById('_adm-pwd').value;
            if (val === ADMIN_PASSWORD) {
                sessionStorage.setItem(SESSION_KEY, '1');
                authenticated = true;
                modal.remove();
                mountPanel();
            } else {
                const err = document.getElementById('_adm-pwd-error');
                err.style.display = 'block';
                document.getElementById('_adm-pwd').value = '';
                document.getElementById('_adm-pwd').focus();
                setTimeout(() => { err.style.display = 'none'; }, 2500);
            }
        };

        document.getElementById('_adm-pwd-btn').addEventListener('click', attempt);
        document.getElementById('_adm-pwd').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') attempt();
        });
        document.getElementById('_adm-pwd-close').addEventListener('click', () => modal.remove());
    }

    /* ── Panel Principal ── */
    function mountPanel() {
        if (document.getElementById('_adm-panel')) return;

        const bikes  = (typeof CONFIG !== 'undefined' && Array.isArray(CONFIG.bicicletas_destacadas))
            ? CONFIG.bicicletas_destacadas : [];
        const saved  = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

        // Merge: saved overrides sobre defaults
        const merged = bikes.map((b, i) => saved[i] ? { ...b, ...saved[i] } : { ...b });

        const cards = merged.map((bike, i) => `
            <div class="_adm-card" data-idx="${i}">
                <div class="_adm-card-header">
                    <span class="_adm-card-num">#${i + 1}</span>
                    <strong class="_adm-card-name">${bike.modelo}</strong>
                    ${saved[i] ? '<span class="_adm-modified-badge">Modificado</span>' : ''}
                </div>

                <div class="_adm-img-preview-wrap">
                    <img class="_adm-img-preview" src="${bike.imagen || ''}" alt=""
                        onerror="this.style.opacity='0.2'" onload="this.style.opacity='1'">
                </div>

                <label>Imagen (ruta o URL)</label>
                <input class="_adm-field" data-field="imagen" value="${bike.imagen || ''}"
                    placeholder="assets/bici-01.png">

                <label>Precio</label>
                <input class="_adm-field" data-field="precio" value="${bike.precio || ''}"
                    placeholder="$299.900">

                <label>Etiqueta / Badge</label>
                <input class="_adm-field" data-field="etiqueta" value="${bike.etiqueta || ''}"
                    placeholder="MTB">

                <label>Especificaciones (una por línea)</label>
                <textarea class="_adm-field _adm-textarea" data-field="specs" rows="3"
                    placeholder="Rodado 29&#10;21 velocidades&#10;Frenos a disco">${Array.isArray(bike.specs) ? bike.specs.join('\n') : ''}</textarea>

                <div class="_adm-card-actions">
                    <button class="_adm-save-card-btn">💾 Guardar esta bici</button>
                    ${saved[i] ? `<button class="_adm-reset-card-btn">↩ Restaurar original</button>` : ''}
                </div>
                <div class="_adm-saved-msg" style="display:none">✅ Guardado</div>
            </div>
        `).join('');

        const panel = el('div', { id: '_adm-panel' }, `
            <div id="_adm-header">
                <div id="_adm-header-left">
                    <span id="_adm-lock">🔒</span>
                    <div>
                        <strong>Panel de Administración</strong>
                        <small>Embiciate — cambios guardados en este navegador</small>
                    </div>
                </div>
                <div id="_adm-header-right">
                    <button id="_adm-reset-all">↩ Restaurar todo</button>
                    <button id="_adm-close-btn">✕ Cerrar</button>
                </div>
            </div>
            <div id="_adm-body">
                <div id="_adm-info-bar">
                    💡 Los cambios se aplican <strong>instantáneamente</strong> en este dispositivo al guardar.
                    Para que se vean en otros dispositivos, actualizá también el archivo <code>config.js</code>.
                </div>
                <div id="_adm-grid">${cards}</div>
            </div>
        `);

        document.body.appendChild(panel);
        injectStyles();

        // Cerrar
        document.getElementById('_adm-close-btn').addEventListener('click', () => panel.remove());

        // Preview de imagen al escribir
        panel.querySelectorAll('._adm-card').forEach((card) => {
            const idx      = parseInt(card.dataset.idx);
            const imgInput = card.querySelector('[data-field="imagen"]');
            const preview  = card.querySelector('._adm-img-preview');

            imgInput.addEventListener('input', () => {
                preview.style.opacity = '0.3';
                preview.src = imgInput.value;
            });
            preview.addEventListener('load', () => { preview.style.opacity = '1'; });
            preview.addEventListener('error', () => { preview.style.opacity = '0.2'; });

            // Guardar esta bici
            card.querySelector('._adm-save-card-btn').addEventListener('click', () => {
                saveCard(card, idx);
            });

            // Restaurar esta bici
            const resetBtn = card.querySelector('._adm-reset-card-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
                    delete all[idx];
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
                    panel.remove();
                    refreshGrid();
                    setTimeout(mountPanel, 100);
                });
            }
        });

        // Restaurar todo
        document.getElementById('_adm-reset-all').addEventListener('click', () => {
            if (confirm('¿Restaurar todos los precios e imágenes al estado original del config.js?')) {
                localStorage.removeItem(STORAGE_KEY);
                panel.remove();
                refreshGrid();
                setTimeout(mountPanel, 100);
            }
        });
    }

    function saveCard(card, idx) {
        const all    = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const fields = {};

        card.querySelectorAll('._adm-field').forEach((input) => {
            const key = input.dataset.field;
            if (key === 'specs') {
                fields[key] = input.value.split('\n').map(s => s.trim()).filter(Boolean);
            } else {
                fields[key] = input.value.trim();
            }
        });

        // Actualizar mensaje de WhatsApp con el nombre actual
        const modelo = fields['modelo'] || card.querySelector('._adm-card-name').textContent;
        fields['mensaje'] = `Hola, me interesa la ${modelo}, ¿tienen stock?`;

        all[idx] = fields;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

        // Feedback visual
        const msg = card.querySelector('._adm-saved-msg');
        msg.style.display = 'block';
        setTimeout(() => { msg.style.display = 'none'; }, 2000);

        // Actualizar el badge "Modificado"
        const header = card.querySelector('._adm-card-header');
        if (!header.querySelector('._adm-modified-badge')) {
            const badge = document.createElement('span');
            badge.className = '_adm-modified-badge';
            badge.textContent = 'Modificado';
            header.appendChild(badge);
        }

        refreshGrid();
    }

    /* Re-renderiza el grid de productos en la página sin recargar */
    function refreshGrid() {
        const grid = document.getElementById('bicicletas-destacadas');
        if (!grid || typeof CONFIG === 'undefined') return;

        const numero    = CONFIG.whatsapp_numero ? CONFIG.whatsapp_numero.replace(/\D/g, '') : '';
        const overrides = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const bikes     = CONFIG.bicicletas_destacadas.map((b, i) =>
            overrides[i] ? { ...b, ...overrides[i] } : b
        );

        const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

        grid.innerHTML = bikes.map((bike, index) => {
            const specs   = Array.isArray(bike.specs) ? bike.specs : [];
            const delay   = index ? ` style="transition-delay: ${Math.min(index * 0.1, 0.3)}s;"` : '';
            const mensaje = encodeURIComponent(bike.mensaje || `Hola Embiciate, quiero consultar por ${bike.modelo}.`);
            const waLink  = numero ? `https://wa.me/${numero}?text=${mensaje}` : '#contacto';
            const imagen  = bike.imagen || '';
            const etiqueta = bike.etiqueta || 'Destacada';

            return `
                <article class="product-card fade-in-up visible"${delay}>
                    <div class="product-img-wrapper">
                        <span class="product-badge">${etiqueta}</span>
                        <img src="${imagen}" alt="Bicicleta ${bike.modelo}" class="product-img" loading="lazy">
                        <div class="product-price-overlay">${bike.precio}</div>
                    </div>
                    <div class="product-content">
                        <h3>${bike.modelo}</h3>
                        <ul class="product-specs">
                            ${specs.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                        <div class="product-cuotas">
                            <span class="cuotas-badge">⚡ 3 cuotas sin interés</span>
                            <span class="cuotas-sub">Visa y Mastercard</span>
                        </div>
                        <div class="product-divider"></div>
                        <a href="${waLink}" target="_blank" rel="noopener" class="product-btn">
                            ${waIcon}
                            Consultar por WhatsApp
                        </a>
                    </div>
                </article>
            `;
        }).join('');
    }

    /* ── Helpers ── */
    function el(tag, attrs, html) {
        const e = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
        e.innerHTML = html;
        return e;
    }

    function injectStyles() {
        if (document.getElementById('_adm-styles')) return;
        const style = document.createElement('style');
        style.id = '_adm-styles';
        style.textContent = `
            /* ── Admin Panel ── */
            #_adm-modal {
                position: fixed; inset: 0; z-index: 99999;
                background: rgba(0,0,0,0.88);
                backdrop-filter: blur(8px);
                display: flex; align-items: center; justify-content: center;
                font-family: 'Outfit', 'Inter', sans-serif;
                animation: _adm-fade .2s ease;
            }
            #_adm-modal-box {
                background: #111; border: 1px solid #333; border-radius: 16px;
                padding: 2.5rem; width: min(380px, 92vw); text-align: center;
                box-shadow: 0 30px 80px rgba(0,0,0,0.6);
            }
            #_adm-modal-logo { font-size: 2.5rem; margin-bottom: 1rem; }
            #_adm-modal-box h2 { color: #fff; font-size: 1.5rem; margin-bottom: .4rem; }
            #_adm-modal-box p  { color: #888; font-size: .9rem; margin-bottom: 1.5rem; }
            #_adm-pwd {
                width: 100%; padding: .8rem 1rem; background: #1a1a1a;
                border: 1px solid #333; border-radius: 8px; color: #fff;
                font-size: 1rem; margin-bottom: .8rem; outline: none;
                font-family: inherit;
                transition: border-color .2s;
            }
            #_adm-pwd:focus { border-color: #ff5500; }
            #_adm-pwd-error {
                color: #ff5555; font-size: .82rem; margin-bottom: .8rem;
                animation: _adm-shake .3s ease;
            }
            #_adm-modal-box button {
                width: 100%; padding: .75rem; border-radius: 8px;
                font-size: .95rem; font-weight: 700; cursor: pointer;
                border: none; font-family: inherit; margin-top: .5rem;
                transition: all .2s;
            }
            #_adm-pwd-btn {
                background: #ff5500; color: #fff;
            }
            #_adm-pwd-btn:hover { background: #ff7733; }
            ._adm-ghost-btn {
                background: transparent !important;
                border: 1px solid #333 !important;
                color: #888 !important;
            }
            ._adm-ghost-btn:hover { border-color: #555 !important; color: #ccc !important; }

            /* ── Main Panel ── */
            #_adm-panel {
                position: fixed; inset: 0; z-index: 99998;
                background: #0a0a0a;
                display: flex; flex-direction: column;
                font-family: 'Outfit', 'Inter', sans-serif;
                animation: _adm-fade .25s ease;
                overflow: hidden;
            }
            #_adm-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 1rem 1.5rem;
                background: #111; border-bottom: 1px solid #222;
                gap: 1rem; flex-shrink: 0; flex-wrap: wrap;
            }
            #_adm-header-left {
                display: flex; align-items: center; gap: .8rem;
            }
            #_adm-lock { font-size: 1.4rem; }
            #_adm-header-left strong { color: #fff; font-size: 1rem; display: block; }
            #_adm-header-left small  { color: #666; font-size: .75rem; }
            #_adm-header-right { display: flex; gap: .6rem; flex-wrap: wrap; }
            #_adm-header-right button {
                padding: .5rem 1rem; border-radius: 8px; border: none;
                font-size: .82rem; font-weight: 700; cursor: pointer;
                font-family: inherit; transition: all .2s;
            }
            #_adm-close-btn {
                background: #ff5500; color: #fff;
            }
            #_adm-close-btn:hover { background: #ff7733; }
            #_adm-reset-all {
                background: transparent; border: 1px solid #444 !important;
                color: #aaa;
            }
            #_adm-reset-all:hover { border-color: #ff5555 !important; color: #ff5555; }

            #_adm-body {
                flex: 1; overflow-y: auto; padding: 1.5rem;
            }
            #_adm-info-bar {
                background: rgba(255,85,0,.08);
                border: 1px solid rgba(255,85,0,.2);
                border-radius: 8px; padding: .8rem 1.2rem;
                color: #ccc; font-size: .82rem; margin-bottom: 1.5rem;
                line-height: 1.5;
            }
            #_adm-info-bar strong { color: #fff; }
            #_adm-info-bar code {
                background: #222; padding: .1rem .4rem; border-radius: 4px;
                font-size: .8rem; color: #d7ff32;
            }

            #_adm-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 1.2rem;
            }

            ._adm-card {
                background: #141414; border: 1px solid #222; border-radius: 12px;
                padding: 1.2rem; display: flex; flex-direction: column; gap: .6rem;
                transition: border-color .2s;
            }
            ._adm-card:hover { border-color: #333; }

            ._adm-card-header {
                display: flex; align-items: center; gap: .6rem; flex-wrap: wrap;
                margin-bottom: .2rem;
            }
            ._adm-card-num {
                background: #222; color: #888; font-size: .72rem; font-weight: 700;
                padding: .15rem .5rem; border-radius: 999px;
            }
            ._adm-card-name { color: #fff; font-size: .95rem; font-weight: 700; flex: 1; }
            ._adm-modified-badge {
                font-size: .65rem; font-weight: 900; text-transform: uppercase;
                background: rgba(215,255,50,.1); border: 1px solid rgba(215,255,50,.3);
                color: #d7ff32; padding: .12rem .5rem; border-radius: 999px;
            }

            ._adm-img-preview-wrap {
                height: 130px; background: #0d0d0d; border-radius: 8px;
                overflow: hidden; display: flex; align-items: center; justify-content: center;
            }
            ._adm-img-preview {
                max-width: 100%; max-height: 100%; object-fit: contain;
                transition: opacity .3s;
            }

            ._adm-card label {
                color: #888; font-size: .72rem; font-weight: 700;
                text-transform: uppercase; letter-spacing: .5px; margin-top: .2rem;
            }
            ._adm-field {
                width: 100%; padding: .55rem .8rem;
                background: #1a1a1a; border: 1px solid #2a2a2a;
                border-radius: 8px; color: #fff; font-size: .88rem;
                font-family: inherit; outline: none; resize: vertical;
                transition: border-color .2s;
            }
            ._adm-field:focus { border-color: #ff5500; }
            ._adm-textarea { min-height: 70px; line-height: 1.5; }

            ._adm-card-actions { display: flex; gap: .5rem; flex-wrap: wrap; margin-top: .4rem; }
            ._adm-save-card-btn {
                flex: 1; padding: .6rem .8rem; background: #ff5500; color: #fff;
                border: none; border-radius: 8px; font-size: .82rem; font-weight: 700;
                cursor: pointer; font-family: inherit; transition: background .2s;
            }
            ._adm-save-card-btn:hover { background: #ff7733; }
            ._adm-reset-card-btn {
                padding: .6rem .8rem; background: transparent;
                border: 1px solid #333; color: #888; border-radius: 8px;
                font-size: .82rem; font-weight: 600; cursor: pointer;
                font-family: inherit; transition: all .2s;
            }
            ._adm-reset-card-btn:hover { border-color: #555; color: #ccc; }
            ._adm-saved-msg {
                text-align: center; color: #25D366; font-size: .82rem;
                font-weight: 700; padding: .3rem;
                animation: _adm-fade .2s ease;
            }

            @keyframes _adm-fade {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes _adm-shake {
                0%, 100% { transform: translateX(0); }
                25%       { transform: translateX(-6px); }
                75%       { transform: translateX(6px); }
            }

            @media (max-width: 600px) {
                #_adm-header { padding: .8rem 1rem; }
                #_adm-body   { padding: 1rem; }
                #_adm-grid   { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(style);
    }

})();
