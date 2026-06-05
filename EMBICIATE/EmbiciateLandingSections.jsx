const WHATSAPP_NUMBER = "5492235505397";

const featuredBikes = [
  {
    model: "Modelo 1",
    price: "$269.900",
    image: "/placeholder-bike.svg",
    specs: ["Rodado 29", "21 velocidades", "Frenos a disco"],
  },
  {
    model: "Modelo 2",
    price: "$299.900",
    image: "/placeholder-bike.svg",
    specs: ["Rodado 29", "21 velocidades", "Frenos a disco"],
  },
  {
    model: "Modelo 3",
    price: "$349.900",
    image: "/placeholder-bike.svg",
    specs: ["Rodado 29", "21 velocidades", "Frenos a disco"],
  },
];

const whatsappHref = (model) => {
  const message = encodeURIComponent(
    `Hola Embiciate, quiero consultar por ${model}. Tienen stock disponible?`
  );

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
};

export default function EmbiciateLandingSections() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>
            LA BICI
            <br />
            <span className="text-accent">QUE BUSCAS</span>
            <br />
            ESTA ACA
          </h1>

          <div className="hero-price-highlight">
            Bicicletas desde <span>$269.900</span>
          </div>

          <a
            href={whatsappHref("bicicletas desde $269.900")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-hero btn-full-width-mobile mt-2"
          >
            <span className="wa-icon" aria-hidden="true" />
            <span className="btn-text-content">
              <strong>ESCRIBINOS POR WHATSAPP</strong>
              <span>Y LLEVATELA HOY</span>
            </span>
          </a>
        </div>
      </section>

      <section id="bicicletas" className="section">
        <div className="container">
          <div className="section-heading">
            <h2 className="section-title">Bicicletas Destacadas</h2>
            <p className="section-intro">
              Modelos listos para consultar por WhatsApp.
            </p>
          </div>

          <div className="product-grid">
            {featuredBikes.slice(0, 10).map((bike) => (
              <article className="product-card" key={bike.model}>
                <div className="product-img-wrapper">
                  <img
                    src={bike.image}
                    alt={`Bicicleta ${bike.model}`}
                    className="product-img"
                  />
                </div>

                <div className="product-content">
                  <div className="product-topline">
                    <span className="badge">Destacada</span>
                    <span className="product-price">{bike.price}</span>
                  </div>

                  <h3>{bike.model}</h3>

                  <ul className="product-specs">
                    {bike.specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>

                  <a
                    href={whatsappHref(bike.model)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary product-btn"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
