// Manejo del menú hover
document.querySelectorAll('.menu-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    const panelId = item.getAttribute('data-panel');
    hideAllPanels();
    document.getElementById(panelId + 'Panel').classList.add('active');
  });
});

// Ocultar paneles cuando sale el mouse del menú
document.querySelector('.menu').addEventListener('mouseleave', () => {
  hideAllPanels();
  document.getElementById('homePanel').classList.add('active');
});

function hideAllPanels() {
  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.remove('active');
  });
}

// Carousel horizontal
const track = document.querySelector('.carousel-track');
const btnLeft = document.querySelector('.left');
const btnRight = document.querySelector('.right');
let position = 0;

btnLeft.addEventListener('click', () => {
  if (position > 0) {
    position -= 1;
    updateCarousel();
  }
});

btnRight.addEventListener('click', () => {
  const maxPosition = Math.ceil(track.children.length / 4) - 1;
  if (position < maxPosition) {
    position += 1;
    updateCarousel();
  }
});

function updateCarousel() {
  const cardWidth = 250 + 30; // ancho + gap
  track.style.transform = `translateX(-${position * cardWidth}px)`;
}
