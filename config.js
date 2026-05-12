// =========================================================================
// ⚙️ ARCHIVO DE CONFIGURACIÓN DE EMBICIATE
// =========================================================================
// Este archivo está pensado para que vos mismo puedas modificar todos los 
// textos y fotos de la página sin tener que saber programar.
//
// INSTRUCCIONES:
// - Solo cambia los textos que están dentro de las comillas (ej: "Tu texto").
// - Guarda el archivo (Ctrl + S) y actualiza la página en tu navegador (F5).
// =========================================================================

const CONFIG = {
    // ---------------------------------------------------------------------
    // 1. MARCA Y PAGINA INICIAL
    // ---------------------------------------------------------------------
    // Separo en dos partes para darle el color naranja a la primera parte
    marca_color: "EM",
    marca_blanco: "BICIATE",

    bicicletas_titulo: "Nuestro Catálogo",
    bicicletas_intro: "12 modelos disponibles. Consultanos por WhatsApp y te asesoramos con rodado, talle y forma de pago.",
    bicicletas_destacadas: [
        {
            etiqueta: "MTB",
            modelo: "Firebird Aluminio R29",
            precio: "$299.900",
            imagen: "assets/bici-01.png",
            specs: ["Rodado 29", "21 velocidades", "Frenos a disco"],
            mensaje: "Hola, me interesa la Firebird Aluminio R29, ¿tienen stock?"
        },
        {
            etiqueta: "MTB",
            modelo: "Topmega Vendetta R29",
            precio: "$319.900",
            imagen: "assets/bici-02.png",
            specs: ["Rodado 29", "21 velocidades", "Frenos a disco hidráulico"],
            mensaje: "Hola, me interesa la Topmega Vendetta R29, ¿tienen stock?"
        },
        {
            etiqueta: "MTB",
            modelo: "Raleigh Mojave 29",
            precio: "$345.000",
            imagen: "assets/bici-03.png",
            specs: ["Rodado 29", "24 velocidades", "Frenos hidráulicos"],
            mensaje: "Hola, me interesa la Raleigh Mojave 29, ¿tienen stock?"
        },
        {
            etiqueta: "MTB",
            modelo: "South XC 29",
            precio: "$289.900",
            imagen: "assets/bici-04.png",
            specs: ["Rodado 29", "21 velocidades", "Cuadro aluminio"],
            mensaje: "Hola, me interesa la South XC 29, ¿tienen stock?"
        },
        {
            etiqueta: "MTB",
            modelo: "Venzo Hydra R29",
            precio: "$329.900",
            imagen: "assets/bici-05.png",
            specs: ["Rodado 29", "24 velocidades", "Frenos a disco"],
            mensaje: "Hola, me interesa la Venzo Hydra R29, ¿tienen stock?"
        },
        {
            etiqueta: "MTB",
            modelo: "SLP Thunder R29",
            precio: "$279.900",
            imagen: "assets/bici-06.png",
            specs: ["Rodado 29", "21 velocidades", "Frenos V-Brake"],
            mensaje: "Hola, me interesa la SLP Thunder R29, ¿tienen stock?"
        },
        {
            etiqueta: "Urbana",
            modelo: "Topmega City R28",
            precio: "$219.900",
            imagen: "assets/bici-07.png",
            specs: ["Rodado 28", "7 velocidades", "Cuadro bajo dama"],
            mensaje: "Hola, me interesa la Topmega City R28, ¿tienen stock?"
        },
        {
            etiqueta: "Urbana",
            modelo: "Raleigh Urban R28",
            precio: "$239.900",
            imagen: "assets/bici-08.png",
            specs: ["Rodado 28", "6 velocidades", "Portaequipaje incluido"],
            mensaje: "Hola, me interesa la Raleigh Urban R28, ¿tienen stock?"
        },
        {
            etiqueta: "Urbana",
            modelo: "South Paseo R26",
            precio: "$189.900",
            imagen: "assets/bici-09.png",
            specs: ["Rodado 26", "6 velocidades", "Frenos V-Brake"],
            mensaje: "Hola, me interesa la South Paseo R26, ¿tienen stock?"
        },
        {
            etiqueta: "Rodado 24",
            modelo: "Firebird Junior R24",
            precio: "$199.900",
            imagen: "assets/bici-10.png",
            specs: ["Rodado 24", "21 velocidades", "Ideal juvenil"],
            mensaje: "Hola, me interesa la Firebird Junior R24, ¿tienen stock?"
        },
        {
            etiqueta: "Rodado 20",
            modelo: "SLP Kids R20",
            precio: "$149.900",
            imagen: "assets/bici-11.png",
            specs: ["Rodado 20", "1 velocidad", "Para niños 6-10 años"],
            mensaje: "Hola, me interesa la SLP Kids R20, ¿tienen stock?"
        },
        {
            etiqueta: "Fat Bike",
            modelo: "Venzo Fat R26",
            precio: "$389.900",
            imagen: "assets/bici-12.png",
            specs: ["Rodado 26 Fat", "21 velocidades", "Ruedas 4\" todo terreno"],
            mensaje: "Hola, me interesa la Venzo Fat R26, ¿tienen stock?"
        }
    ],

    hero_titulo: "TU PROXIMA BICI<br><span class=\"text-accent\">ESTA ACA</span>",
    hero_precio_principal: "Bicicletas desde <span>$269.900</span>",

    // 2. BICICLETAS (Tarjetas Modelo)
    // ---------------------------------------------------------------------
    // Mountain Bike
    mtb_etiqueta: "Aventura",
    mtb_titulo: "Mountain Bikes",
    mtb_descripcion: "Ideales para terrenos irregulares, sierras y aquellos que buscan adrenalina más allá del asfalto.",

    // Urbana
    urbana_etiqueta: "Ciudad",
    urbana_titulo: "Bicicletas Urbanas",
    urbana_descripcion: "Diseño elegante y máxima comodidad para tus trayectos diarios por la costa o la ciudad.",

    // ---------------------------------------------------------------------
    // 3. ACCESORIOS
    // ---------------------------------------------------------------------
    accs_titulo_color: "Premium",
    accs_descripcion: "Contamos con la mejor calidad en cascos, luces traseras y delanteras, y sistemas de seguridad antirrobo. No dejes nada al azar a la hora de pedalear seguro.",

    // ---------------------------------------------------------------------
    // 4. CONTACTO Y DIRECCIÓN
    // ---------------------------------------------------------------------
    contacto_texto: "Vení a conocer todos nuestros modelos en vivo en nuestro local ubicado en <strong>Mar del Plata</strong>. Te asesoraremos para que encuentres la bicicleta perfecta para vos.",
    direccion: "Los Gallegos (Rivadavia 3050.Subsuelo) , Mar del Plata, Argentina",
    ubicacion_url: "https://share.google/kyp1uH8sStsCnTlP2",
    horarios: "Lunes a Sábados: 09:00 a 21:00 hs",

    // WHATSAPP:
    // Formato: código de país completo (ej: 54 para argentina) seguido del 9 
    // y tu código de área + número completo (sin el 15 y sin espacios/guiones).
    whatsapp_numero: "5492230000000",
    whatsapp_mensaje: "Hola! Me interesa una bicicleta, ¿tienen stock disponible?",
    whatsapp_mensaje_nav: "Hola! Vengo de la página web, quiero hacer una consulta.",
    whatsapp_mensaje_accesorios: "Hola! Me interesa accesorios para bicicleta, ¿tienen stock disponible?",

    // ---------------------------------------------------------------------
    // 5. IMÁGENES Y FOTOS
    // ---------------------------------------------------------------------
    // Tienes dos opciones para cambiar las fotos:
    // Opción A: Ve a la carpeta "assets", elimina la imagen viaja (por ejemplo mtb.png), 
    // y pega tu foto nueva con el nombre exacto "mtb.png".
    // Opción B: Sube tu foto con el nombre que quieras a la carpeta "assets" y 
    // cámbialo en la lista de aquí abajo (ej: "assets/mi_nueva_bici.jpg")
    imagenes: {
        hero_fondo: "assets/morena.png",
        bici_mountain: "assets/....png",
        bici_urbana: "assets/urban.png",
        accesorios: "assets/accs.png"
    },

    // ---------------------------------------------------------------------
    // 6. CARRUSEL DE BICICLETAS (HERO)
    // ---------------------------------------------------------------------
    hero_slider: [
        {
            modelo: "FIREBIRD ALUMINIO >>",
            precio: "$299.900",
            specs: "RODADO 29' • 21 VELOCIDADES • FRENOS A DISCO",
            imagen: "assets/morena (2).png", // Bici para PC (horizontal)
            imagen_mobile: "assets/morena (2).png" // Bici para Celular (vertical). Si no tenés, repetí la de PC.
        },
        {
            modelo: "FIAT 500 >>",
            precio: "$289.900",
            specs: "RODADO 29' • 21 VELOCIDADES • CUADRO ALUMINIO",
            imagen: "assets/nicol.png", 
            imagen_mobile: "assets/nicol.png" 
        },
        {
            modelo: "MOUNTAIN BIKE PRO >>",
            precio: "$345.000",
            specs: "RODADO 29' • 24 VELOCIDADES • FRENOS HIDRÁULICOS",
            imagen: "assets/mtb.png", 
            imagen_mobile: "assets/mtb.png" 
        },
        {
            modelo: "URBANA CLASSIC >>",
            precio: "$189.900",
            specs: "RODADO 28' • 6 VELOCIDADES • ESTILO VINTAGE",
            imagen: "assets/urban.png", 
            imagen_mobile: "assets/urban.png" 
        }
    ]
};
