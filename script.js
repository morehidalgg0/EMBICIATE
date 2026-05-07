// ── IndexedDB: almacenamiento de imágenes por bicicleta ──────────────────
window.embiciateDB = (() => {
    const DB = 'embiciate_db', STORE = 'bike_imgs', VER = 1;
    function open() {
        return new Promise((res, rej) => {
            const r = indexedDB.open(DB, VER);
            r.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
            r.onsuccess  = e => res(e.target.result);
            r.onerror    = e => rej(e.target.error);
        });
    }
    async function save(idx, blobs) {
        const db = await open();
        return new Promise((res, rej) => {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(blobs, 'bike_' + idx);
            tx.oncomplete = res; tx.onerror = rej;
        });
    }
    async function get(idx) {
        const db = await open();
        return new Promise((res, rej) => {
            const r = db.transaction(STORE,'readonly').objectStore(STORE).get('bike_' + idx);
            r.onsuccess = e => res(e.target.result || []);
            r.onerror   = rej;
        });
    }
    async function clear(idx) { return save(idx, []); }
    async function loadCardImages() {
        const cards = document.querySelectorAll('.product-card[data-bike-idx]');
        for (const card of cards) {
            const blobs = await get(parseInt(card.dataset.bikeIdx));
            if (blobs && blobs.length > 0) applyToCard(card, blobs);
        }
    }
    function applyToCard(card, blobs) {
        const img = card.querySelector('.product-img');
        if (!img) return;
        const urls = blobs.map(b => URL.createObjectURL(b));
        img.src = urls[0];
        if (urls.length > 1) setupGallery(card, urls);
    }
    function setupGallery(card, urls) {
        const wrapper = card.querySelector('.product-img-wrapper');
        if (!wrapper || wrapper.querySelector('.pg-dots')) return;
        let cur = 0;
        const dots = document.createElement('div');
        dots.className = 'pg-dots';
        urls.forEach((_, i) => {
            const d = document.createElement('span');
            d.className = 'pg-dot' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => { setSlide(i); });
            dots.appendChild(d);
        });
        wrapper.appendChild(dots);
        const img = card.querySelector('.product-img');
        function setSlide(i) {
            cur = i;
            img.src = urls[i];
            dots.querySelectorAll('.pg-dot').forEach((d, j) => d.classList.toggle('active', j === i));
        }
        wrapper.addEventListener('click', (e) => {
            if (e.target.closest('.pg-dots') || e.target.closest('.product-badge') || e.target.closest('.product-price-overlay')) return;
            setSlide((cur + 1) % urls.length);
        });
    }
    return { save, get, clear, loadCardImages, applyToCard, setupGallery };
})();

// Carga catalog-data.json desde el servidor y lo expone globalmente
window.embiciateCatalog = {};
(async () => {
    try {
        const r = await fetch('catalog-data.json?v=' + Date.now());
        if (r.ok) window.embiciateCatalog = await r.json();
    } catch(e) {}
})();

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- LÓGICA DE INYECCIÓN DE DATOS (CONFIG.JS) ---
    if (typeof CONFIG !== 'undefined') {

        // Aplicar overrides del panel admin sobre CONFIG (tiene prioridad el servidor)
        const _siteCfg = (window.embiciateCatalog || {}).site || {};
        if (Object.keys(_siteCfg).length > 0) Object.assign(CONFIG, _siteCfg);

        // Datos de contacto extra del panel admin
        setTimeout(() => {
            const contactInfo = document.querySelector('.contact-info');
            const extraCtc = ((window.embiciateCatalog||{}).site||{}).contacto_extra || [];
            extraCtc.forEach(item => {
                if (!item.label && !item.value) return;
                const d = document.createElement('div');
                d.className = 'info-item';
                d.innerHTML = `<span class="icon">${item.icon||'📍'}</span><p>${item.value||''}</p>`;
                if (contactInfo) contactInfo.appendChild(d);
            });
            
            // Pagos
            const visa = document.querySelector('.pago-logo--visa');
            const mc = document.querySelector('.pago-logo--mc');
            const badges = document.querySelectorAll('.pagos-badge');
            const descs = document.querySelectorAll('.pagos-desc');
            
            if (visa && _siteCfg.pago_img_visa) visa.src = _siteCfg.pago_img_visa;
            if (mc && _siteCfg.pago_img_mc) mc.src = _siteCfg.pago_img_mc;
            if (badges.length > 0 && _siteCfg.pago_badge_1) badges[0].innerHTML = _siteCfg.pago_badge_1;
            if (descs.length > 0 && _siteCfg.pago_desc_1) descs[0].innerHTML = _siteCfg.pago_desc_1;
            if (badges.length > 1 && _siteCfg.pago_badge_2) badges[1].innerHTML = _siteCfg.pago_badge_2;
            if (descs.length > 1 && _siteCfg.pago_desc_2) descs[1].innerHTML = _siteCfg.pago_desc_2;
            
        }, 200);

        // 1. Reemplazar Textos
        const elementosTexto = document.querySelectorAll('[data-txt]');
        elementosTexto.forEach(el => {
            const llave = el.getAttribute('data-txt');
            if (CONFIG[llave] !== undefined) {
                el.innerHTML = CONFIG[llave];
            }
        });

        // 2. Reemplazar Imágenes
        const elementosImagen = document.querySelectorAll('[data-img]');
        elementosImagen.forEach(el => {
            const llave = el.getAttribute('data-img');
            if (CONFIG.imagenes && CONFIG.imagenes[llave]) {
                el.src = CONFIG.imagenes[llave];
            }
        });

        // 3. Renderizar Bicicletas Destacadas
        const bicicletasGrid = document.getElementById('bicicletas-destacadas');
        if (bicicletasGrid && Array.isArray(CONFIG.bicicletas_destacadas)) {
            const numero = CONFIG.whatsapp_numero ? CONFIG.whatsapp_numero.replace(/\D/g, '') : '';
            // Esperar a que catalog-data.json haya cargado (máx 1.5s)
            await new Promise(r => setTimeout(r, 100));
            const serverData = window.embiciateCatalog || {};
            const bikes = CONFIG.bicicletas_destacadas.map((bike, i) => {
                const sv = serverData[i] || {};
                return { ...bike, ...sv };
            });

            bicicletasGrid.innerHTML = bikes.map((bike, index) => {
                const specs = Array.isArray(bike.specs) ? bike.specs : [];
                const delay = index ? ` style="transition-delay: ${Math.min(index * 0.1, 0.3)}s;"` : '';
                const mensaje = encodeURIComponent(bike.mensaje || `Hola Embiciate, quiero consultar por ${bike.modelo}.`);
                const waLink = numero ? `https://wa.me/${numero}?text=${mensaje}` : '#contacto';
                // Primera imagen: del servidor si existe, si no la de config
                const serverImgs = (window.embiciateCatalog[index] || {}).imagenes || [];
                const imagen = serverImgs[0] || bike.imagen || '';
                const etiqueta = bike.etiqueta || 'Destacada';

                const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

                return `
                    <article class="product-card fade-in-up" data-bike-idx="${index}"${delay}>
                        <div class="product-img-wrapper">
                            <span class="product-badge">${etiqueta}</span>
                            <img src="${imagen}" alt="Bicicleta ${bike.modelo}" class="product-img" loading="lazy">
                            <div class="product-price-overlay">${bike.precio}</div>
                        </div>
                        <div class="product-content">
                            <h3>${bike.modelo}</h3>
                            <ul class="product-specs">
                                ${specs.map(spec => `<li>${spec}</li>`).join('')}
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

            // Aplicar galerías desde catalog-data.json (imágenes del servidor)
            const serverData2 = window.embiciateCatalog || {};
            Object.keys(serverData2).forEach(idx => {
                const imgs = (serverData2[idx] || {}).imagenes;
                if (!imgs || imgs.length < 2) return;
                const card = document.querySelector(`.product-card[data-bike-idx="${idx}"]`);
                if (card) window.embiciateDB.setupGallery(card, imgs);
            });

            // Cargar imágenes guardadas localmente (IndexedDB, fallback)
            window.embiciateDB.loadCardImages();

            // Renderizar bicis extra agregadas desde el panel admin
            const extraBikes = serverData.extra_bikes || [];
            extraBikes.forEach((bike, extraIdx) => {
                if (!bike.modelo) return;
                const specs  = Array.isArray(bike.specs) ? bike.specs : [];
                const msg    = encodeURIComponent(bike.mensaje || `Hola Embiciate, quiero consultar por ${bike.modelo}.`);
                const waLink = numero ? `https://wa.me/${numero}?text=${msg}` : '#contacto';
                const img0   = (bike.imagenes||[])[0] || bike.imagen || '';
                const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;
                const art = document.createElement('article');
                art.className = 'product-card fade-in-up visible';
                art.dataset.bikeIdx = 'extra-' + extraIdx;
                art.innerHTML = `
                    <div class="product-img-wrapper">
                        <span class="product-badge">${bike.etiqueta||'Nuevo'}</span>
                        <img src="${img0}" alt="${bike.modelo}" class="product-img" loading="lazy">
                        <div class="product-price-overlay">${bike.precio||''}</div>
                    </div>
                    <div class="product-content">
                        <h3>${bike.modelo}</h3>
                        <ul class="product-specs">${specs.map(s=>`<li>${s}</li>`).join('')}</ul>
                        <div class="product-cuotas"><span class="cuotas-badge">⚡ 3 cuotas sin interés</span><span class="cuotas-sub">Visa y Mastercard</span></div>
                        <div class="product-divider"></div>
                        <a href="${waLink}" target="_blank" rel="noopener" class="product-btn">${waIcon} Consultar por WhatsApp</a>
                    </div>`;
                bicicletasGrid.appendChild(art);
                if ((bike.imagenes||[]).length > 1) window.embiciateDB.setupGallery(art, bike.imagenes);
            });

            // ── Mapa global de bici data (para el modal) ──────────────────
            window._bikeMap = {};
            bikes.forEach((b, i) => {
                const sImgs = (serverData[i]||{}).imagenes || [];
                window._bikeMap[i] = { ...b, _images: sImgs.length ? sImgs : [b.imagen].filter(Boolean) };
            });
            extraBikes.forEach((b, i) => {
                window._bikeMap['extra-' + i] = { ...b, _images: b.imagenes || [] };
            });

            // ── Click en card → modal de detalle ─────────────────────────
            bicicletasGrid.querySelectorAll('.product-card[data-bike-idx]').forEach(card => {
                const bData = window._bikeMap[card.dataset.bikeIdx];
                if (!bData) return;
                card.querySelector('.product-img-wrapper').style.cursor = 'zoom-in';
                card.querySelector('.product-img-wrapper').addEventListener('click', e => {
                    if (e.target.closest('.pg-dots') || e.target.closest('.product-btn')) return;
                    const imgs = bData._images.length ? bData._images
                        : [card.querySelector('.product-img')?.src].filter(Boolean);
                    openBikeModal(bData, imgs);
                });
            });
        }

        // 4. Cambiar Fondo Hero
        // Ahora el fondo está controlado por CSS para admitir múltiples capas (bicicleta + montañas)
        // const seccionHero = document.getElementById('hero');
        // if (seccionHero && CONFIG.imagenes.hero_fondo) {
        //     seccionHero.style.backgroundImage = `url('${CONFIG.imagenes.hero_fondo}')`;
        // }

        // 5. Configurar Enlace de WhatsApp
        const btnWa = document.getElementById('btn-whatsapp');
        const btnWaHero = document.getElementById('btn-whatsapp-hero');
        const btnUbicacion = document.getElementById('btn-ubicacion');
        if (btnUbicacion && CONFIG.ubicacion_url) {
            btnUbicacion.href = CONFIG.ubicacion_url;
        }

        if (CONFIG.whatsapp_numero) {
            const numero = CONFIG.whatsapp_numero.replace(/\D/g, ''); // limpia caracteres no numericos
            const mensaje = encodeURIComponent(CONFIG.whatsapp_mensaje);
            const waLink = `https://wa.me/${numero}?text=${mensaje}`;
            if (btnWa) btnWa.href = waLink;
            if (btnWaHero) btnWaHero.href = waLink;
        }
        
        // 6. Hero Slider
        if (CONFIG.hero_slider && CONFIG.hero_slider.length > 0) {
            let currentIndex = 0;
            let sliderInterval;
            const heroBikeLayer = document.getElementById('hero-bike-layer');
            const heroBikeImgMobile = document.getElementById('hero-bike-img-mobile'); // Nuevo elemento mobile
            const heroPriceCard = document.getElementById('hero-price-card');
            const sliderModelo = document.getElementById('slider-modelo');
            const sliderPrecio = document.getElementById('slider-precio');
            const sliderSpecs = document.getElementById('slider-specs');
            const btnPrev = document.getElementById('slider-prev');
            const btnNext = document.getElementById('slider-next');

            if (heroBikeLayer && heroPriceCard && sliderModelo && sliderPrecio && sliderSpecs) {
                // Aseguramos que tengan la clase de transición
                heroBikeLayer.classList.add('slider-fade');
                heroPriceCard.classList.add('slider-fade');

                // Configurar la primera bici al cargar la página (para que sea responsiva de entrada)
                const getSlideImage = (bike) => {
                    const isMobile = window.matchMedia('(max-width: 768px)').matches;
                    return (isMobile && bike.imagen_mobile) ? bike.imagen_mobile : bike.imagen;
                };

                const renderSlide = (bike) => {
                    const imgSrc = getSlideImage(bike);
                    heroBikeLayer.style.backgroundImage = `url('${imgSrc}')`;
                    if (heroBikeImgMobile) {
                        heroBikeImgMobile.src = imgSrc;
                        heroBikeImgMobile.alt = bike.modelo ? `Bicicleta ${bike.modelo.replace(/>/g, '').trim()}` : 'Bicicleta destacada';
                    }
                    sliderModelo.innerHTML = bike.modelo;
                    sliderPrecio.innerHTML = bike.precio;
                    sliderSpecs.innerHTML = bike.specs;
                };

                renderSlide(CONFIG.hero_slider[0]);

                const changeSlide = (direction) => {
                    // Calculamos el próximo índice
                    currentIndex = (currentIndex + direction + CONFIG.hero_slider.length) % CONFIG.hero_slider.length;
                    const nextBike = CONFIG.hero_slider[currentIndex];

                    // Efecto de desvanecimiento
                    heroBikeLayer.classList.add('fade-out');
                    heroPriceCard.classList.add('fade-out');
                    if (heroBikeImgMobile) heroBikeImgMobile.classList.add('fade-out');

                    // Esperamos a que la opacidad baje a 0 (500ms)
                    setTimeout(() => {
                        // Cambiamos los datos
                        renderSlide(nextBike);

                        // Efecto de reaparición
                        heroBikeLayer.classList.remove('fade-out');
                        heroPriceCard.classList.remove('fade-out');
                        if (heroBikeImgMobile) heroBikeImgMobile.classList.remove('fade-out');
                    }, 500);
                };

                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        renderSlide(CONFIG.hero_slider[currentIndex]);
                    }, 150);
                });

                const startSlider = () => {
                    sliderInterval = setInterval(() => changeSlide(1), 5000);
                };

                const resetSlider = () => {
                    clearInterval(sliderInterval);
                    startSlider();
                };

                // Listeners de flechas
                if (btnPrev) {
                    btnPrev.addEventListener('click', () => {
                        changeSlide(-1);
                        resetSlider();
                    });
                }
                
                if (btnNext) {
                    btnNext.addEventListener('click', () => {
                        changeSlide(1);
                        resetSlider();
                    });
                }

                startSlider();
            }
        }
        
    } else {
        console.warn("No se encontró el archivo de config.js o la variable CONFIG");
    }

    // --- LÓGICA DE NAVEGACIÓN Y EFECTOS ---

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Close menu on link click
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const fadeInElements = document.querySelectorAll('.fade-in-up');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInElements.forEach(element => {
        observer.observe(element);
    });
});

// ── Modal de detalle de bicicleta ─────────────────────────────────────────
function openBikeModal(bike, images) {
    if (document.getElementById('_bm')) return;
    const cfg    = typeof CONFIG !== 'undefined' ? CONFIG : {};
    const numero = (cfg.whatsapp_numero || '').replace(/\D/g, '');
    const msg    = encodeURIComponent(bike.mensaje || `Hola, me interesa la ${bike.modelo}, ¿tienen stock?`);
    const waLink = numero ? `https://wa.me/${numero}?text=${msg}` : '#contacto';
    const specs  = Array.isArray(bike.specs) ? bike.specs : [];
    const imgs   = images.length ? images : [''];
    let cur      = 0;

    const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

    const modal = document.createElement('div');
    modal.id = '_bm';
    modal.innerHTML = `
        <div id="_bm-ov"></div>
        <div id="_bm-box">
            <button id="_bm-x">×</button>
            <div id="_bm-gallery">
                <div id="_bm-img-wrap">
                    <img id="_bm-img" src="${imgs[0]}" alt="${bike.modelo}">
                    ${imgs.length > 1 ? '<button id="_bm-prev">&#8249;</button><button id="_bm-next">&#8250;</button>' : ''}
                </div>
                ${imgs.length > 1 ? `<div id="_bm-thumbs">${imgs.map((u,i)=>`<img class="_bm-th${i===0?' _bm-th-a':''}" data-i="${i}" src="${u}" alt="">`).join('')}</div>` : ''}
                <div id="_bm-counter">${imgs.length > 1 ? `1 / ${imgs.length}` : ''}</div>
            </div>
            <div id="_bm-info">
                <span id="_bm-badge">${bike.etiqueta || 'Destacada'}</span>
                <h2 id="_bm-title">${bike.modelo}</h2>
                <div id="_bm-price">${bike.precio || ''}</div>
                <div id="_bm-cuotas">⚡ 3 cuotas sin interés · Visa y Mastercard</div>
                ${specs.length ? `<ul id="_bm-specs">${specs.map(s=>`<li>${s}</li>`).join('')}</ul>` : ''}
                <a id="_bm-wa" href="${waLink}" target="_blank" rel="noopener">${waIcon} Consultar por WhatsApp</a>
            </div>
        </div>`;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Inject styles once
    if (!document.getElementById('_bm-css')) {
        const s = document.createElement('style');
        s.id = '_bm-css';
        s.textContent = `
        #_bm{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;font-family:'Outfit','Inter',sans-serif;animation:_bm-in .25s ease}
        #_bm-ov{position:absolute;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(6px)}
        #_bm-box{position:relative;z-index:1;display:flex;gap:0;max-width:900px;width:95vw;max-height:90vh;background:#111;border-radius:18px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,.7);animation:_bm-up .3s ease}
        #_bm-x{position:absolute;top:12px;right:14px;z-index:10;width:34px;height:34px;background:rgba(0,0,0,.6);border:none;color:#fff;font-size:1.3rem;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
        #_bm-x:hover{background:#ff5500}
        #_bm-gallery{flex:0 0 55%;display:flex;flex-direction:column;background:#0a0a0a;position:relative}
        #_bm-img-wrap{flex:1;position:relative;min-height:300px;display:flex;align-items:center;justify-content:center;overflow:hidden}
        #_bm-img{max-width:100%;max-height:420px;object-fit:contain;transition:opacity .2s}
        #_bm-prev,#_bm-next{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.55);border:none;color:#fff;font-size:2rem;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;z-index:2}
        #_bm-prev{left:8px} #_bm-next{right:8px}
        #_bm-prev:hover,#_bm-next:hover{background:#ff5500}
        #_bm-thumbs{display:flex;gap:6px;padding:8px 12px;overflow-x:auto;scrollbar-width:none}
        #_bm-thumbs::-webkit-scrollbar{display:none}
        ._bm-th{width:56px;height:56px;object-fit:cover;border-radius:6px;border:2px solid transparent;cursor:pointer;transition:border-color .2s;opacity:.65;flex-shrink:0}
        ._bm-th-a{border-color:#ff5500;opacity:1}
        #_bm-counter{text-align:center;color:#555;font-size:.75rem;padding:4px 0 8px}
        #_bm-info{flex:1;padding:2rem 1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:.7rem}
        #_bm-badge{display:inline-block;background:rgba(255,85,0,.15);border:1px solid rgba(255,85,0,.3);color:#ff7733;font-size:.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.8px;padding:.2rem .7rem;border-radius:999px}
        #_bm-title{color:#fff;font-size:1.5rem;font-weight:900;margin:0;line-height:1.2}
        #_bm-price{color:#ff5500;font-size:1.8rem;font-weight:900;letter-spacing:-1px}
        #_bm-cuotas{background:rgba(215,255,50,.07);border:1px solid rgba(215,255,50,.15);color:#d7ff32;font-size:.8rem;font-weight:700;padding:.45rem .9rem;border-radius:8px}
        #_bm-specs{color:#aaa;font-size:.88rem;line-height:1.8;padding-left:1.2rem;margin:0}
        #_bm-specs li::marker{color:#ff5500}
        #_bm-wa{display:flex;align-items:center;gap:.6rem;background:#25D366;color:#fff;padding:.75rem 1.2rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:.95rem;margin-top:auto;transition:background .2s;justify-content:center}
        #_bm-wa:hover{background:#1ebe5d}
        @media(max-width:640px){
            #_bm-box{flex-direction:column;width:98vw;max-height:96vh}
            #_bm-gallery{flex:0 0 auto}
            #_bm-img{max-height:260px}
            #_bm-info{padding:1.2rem 1rem}
            #_bm-title{font-size:1.2rem}
        }
        @keyframes _bm-in{from{opacity:0}to{opacity:1}}
        @keyframes _bm-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`;
        document.head.appendChild(s);
    }

    // Controls
    const imgEl    = modal.querySelector('#_bm-img');
    const thumbs   = modal.querySelectorAll('._bm-th');
    const counter  = modal.querySelector('#_bm-counter');

    function setSlide(i) {
        cur = ((i % imgs.length) + imgs.length) % imgs.length;
        imgEl.style.opacity = '0';
        setTimeout(() => { imgEl.src = imgs[cur]; imgEl.style.opacity = '1'; }, 100);
        thumbs.forEach((t, j) => t.classList.toggle('_bm-th-a', j === cur));
        if (counter) counter.textContent = `${cur + 1} / ${imgs.length}`;
        const activeThumb = modal.querySelector(`._bm-th[data-i="${cur}"]`);
        if (activeThumb) activeThumb.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    }

    const prevBtn = modal.querySelector('#_bm-prev');
    const nextBtn = modal.querySelector('#_bm-next');
    if (prevBtn) prevBtn.onclick = () => setSlide(cur - 1);
    if (nextBtn) nextBtn.onclick = () => setSlide(cur + 1);
    thumbs.forEach((t, i) => { t.onclick = () => setSlide(i); });

    const close = () => {
        modal.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', onKey);
    };
    modal.querySelector('#_bm-x').onclick = close;
    modal.querySelector('#_bm-ov').onclick = close;

    function onKey(e) {
        if (e.key === 'Escape')      close();
        if (e.key === 'ArrowLeft')   setSlide(cur - 1);
        if (e.key === 'ArrowRight')  setSlide(cur + 1);
    }
    document.addEventListener('keydown', onKey);
}

