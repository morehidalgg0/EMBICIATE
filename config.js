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
    
    hero_titulo: "ELEGI TU BICI<br>HOY",
    hero_subtitulo: "Tu próxima bici está acá: calidad premium y cuotas sin interés para empezar hoy.",
    
    // ---------------------------------------------------------------------
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
    horarios: "Lunes a Sábados: 09:00 a 21:00 hs",
    
    // WHATSAPP:
    // Formato: código de país completo (ej: 54 para argentina) seguido del 9 
    // y tu código de área + número completo (sin el 15 y sin espacios/guiones).
    whatsapp_numero: "5492235505397",
    whatsapp_mensaje: "Hola Embiciate, vengo de ver su página web y quiero hacerles una consulta:",

    // ---------------------------------------------------------------------
    // 5. IMÁGENES Y FOTOS
    // ---------------------------------------------------------------------
    // Tienes dos opciones para cambiar las fotos:
    // Opción A: Ve a la carpeta "assets", elimina la imagen viaja (por ejemplo mtb.png), 
    // y pega tu foto nueva con el nombre exacto "mtb.png".
    // Opción B: Sube tu foto con el nombre que quieras a la carpeta "assets" y 
    // cámbialo en la lista de aquí abajo (ej: "assets/mi_nueva_bici.jpg")
    imagenes: {
        hero_fondo: "assets/...png",
        bici_mountain: "assets/fondo.png",
        bici_urbana: "assets/urban.png",
        accesorios: "assets/accs.png"
    }
};
