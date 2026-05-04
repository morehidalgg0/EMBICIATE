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

        // 3. Cambiar Fondo Hero
        // Ahora el fondo está controlado por CSS para admitir múltiples capas (bicicleta + montañas)
        // const seccionHero = document.getElementById('hero');
        // if (seccionHero && CONFIG.imagenes.hero_fondo) {
        //     seccionHero.style.backgroundImage = `url('${CONFIG.imagenes.hero_fondo}')`;
        // }

        // 4. Configurar Enlace de WhatsApp
        const btnWa = document.getElementById('btn-whatsapp');
        const btnWaHero = document.getElementById('btn-whatsapp-hero');
        if (CONFIG.whatsapp_numero) {
            const numero = CONFIG.whatsapp_numero.replace(/\D/g, ''); // limpia caracteres no numericos
            const mensaje = encodeURIComponent(CONFIG.whatsapp_mensaje);
            const waLink = `https://wa.me/${numero}?text=${mensaje}`;
            if (btnWa) btnWa.href = waLink;
            if (btnWaHero) btnWaHero.href = waLink;
        }
        
        // 5. Hero Slider
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
