const filtros = document.querySelectorAll('.filtro');
const cards = document.querySelectorAll('.producto-card');

filtros.forEach(btn => {
  btn.addEventListener('click', () => {
    filtros.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    cards.forEach(card => {
      const match = cat === 'todos' || card.dataset.cat === cat;
      card.classList.toggle('hidden', !match);
    });
  });
});

const verMas = document.getElementById('ver-mas');
const hiddenCards = document.querySelectorAll('.producto-card.initially-hidden');

if (verMas) {
  verMas.addEventListener('click', () => {
    hiddenCards.forEach(c => c.classList.remove('initially-hidden', 'hidden'));
    verMas.style.display = 'none';
    verMas.setAttribute('aria-expanded', 'true');
  });
}

document.querySelectorAll('.btn-whatsapp').forEach(btn => {
  btn.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: 'AW-000000000/000000000'
      });
    }
  });
});
