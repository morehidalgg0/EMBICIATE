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

    bicicletas_titulo: "Bicicletas Destacadas",
    bicicletas_intro: "Modelos listos para consultar por WhatsApp.",
    bicicletas_destacadas: [
        {
            etiqueta: "Desde",
            modelo: "Modelo 1",
            precio: "$269.900",
            imagen: "assets/placeholder-bike.svg",
            specs: ["Rodado 29", "21 velocidades", "Frenos a disco"],
            mensaje: "Hola Embiciate, quiero consultar por el Modelo 1."
        },
        {
            etiqueta: "Destacada",
            modelo: "Modelo 2",
            precio: "$299.900",
            imagen: "assets/placeholder-bike.svg",
            specs: ["Rodado 29", "21 velocidades", "Frenos a disco"],
            mensaje: "Hola Embiciate, quiero consultar por el Modelo 2."
        },
        {
            etiqueta: "Premium",
            modelo: "Modelo 3",
            precio: "$349.900",
            imagen: "assets/placeholder-bike.svg",
            specs: ["Rodado 29", "21 velocidades", "Frenos a disco"],
            mensaje: "Hola Embiciate, quiero consultar por el Modelo 3."
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
