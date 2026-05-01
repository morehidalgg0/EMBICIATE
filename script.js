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
        const seccionHero = document.getElementById('hero');
        if (seccionHero && CONFIG.imagenes.hero_fondo) {
            seccionHero.style.backgroundImage = `url('${CONFIG.imagenes.hero_fondo}')`;
        }

        // 4. Configurar Enlace de WhatsApp
        const btnWa = document.getElementById('btn-whatsapp');
        if (btnWa && CONFIG.whatsapp_numero) {
            const numero = CONFIG.whatsapp_numero.replace(/\D/g, ''); // limpia caracteres no numericos
            const mensaje = encodeURIComponent(CONFIG.whatsapp_mensaje);
            btnWa.href = `https://wa.me/${numero}?text=${mensaje}`;
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
