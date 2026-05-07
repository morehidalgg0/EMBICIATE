document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE INYECCIÓN DE DATOS (CONFIG.JS) ---
    if (typeof CONFIG !== 'undefined') {
        
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
            const bikes = CONFIG.bicicletas_destacadas.slice(0, 10);

            bicicletasGrid.innerHTML = bikes.map((bike, index) => {
                const specs = Array.isArray(bike.specs) ? bike.specs : [];
                const delay = index ? ` style="transition-delay: ${Math.min(index * 0.1, 0.3)}s;"` : '';
                const mensaje = encodeURIComponent(bike.mensaje || `Hola Embiciate, quiero consultar por ${bike.modelo}.`);
                const waLink = numero ? `https://wa.me/${numero}?text=${mensaje}` : '#contacto';
                const imagen = bike.imagen || 'assets/placeholder-bike.svg';
                const etiqueta = bike.etiqueta || 'Destacada';

                const waIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.66-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`;

                return `
                    <article class="product-card fade-in-up"${delay}>
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
