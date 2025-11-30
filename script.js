// Datos de productos (puedes añadir más fácilmente aquí)
const products = [
  {
    id: 1,
    name: "Chompa de tela pana (Gris)",
    category: "Ropa",
    price: 5.00,
    image: "img/prod-chompa.jpg",
    specs: "Material: Tela pana 100% • Tamaño: Único (ajustable) • Color: Gris neutro • Ideal para clima fresco."
  },
  {
    id: 2,
    name: "Peluche de ballena de felpa",
    category: "Juguetes",
    price: 12.00,
    image: "img/prod-ballena.jpg",
    specs: "Material: Felpa ultra suave • Relleno: Fibra siliconada • Tamaño: 30 cm • Apto para todas las edades."
  },
  {
    id: 3,
    name: "Reloj inteligente modelo A3",
    category: "Promoción",
    price: 40.00,
    originalPrice: 60.00,
    image: "img/prod-reloj.jpg",
    specs: "Pantalla: 1.4\" AMOLED • Batería: 7 días • Resistente al agua • Compatible Android/iOS."
  },
  {
    id: 4,
    name: "Taza de cerámica con asa",
    category: "Hogar",
    price: 3.50,
    image: "img/prod-taza.jpg",
    specs: "Material: Cerámica artesanal • Capacidad: 350 ml • Lavable en lavavajillas • Diseño exclusivo BHALLEFFORT."
  }
];

// Carrito (almacenado en localStorage)
let cart = JSON.parse(localStorage.getItem('bhalleffort-cart')) || [];

// Render productos
const productList = document.getElementById('productList');
products.forEach(p => {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <img src="${p.image}" alt="${p.name}" class="product-img" data-id="${p.id}">
    <div class="category">${p.category}</div>
    <h3 class="title">${p.name}</h3>
    <p class="price">$${p.price.toFixed(2)}</p>
    <div class="buttons">
      <button class="btn btn-zoom" data-id="${p.id}">🔍 Detalles</button>
      <button class="btn btn-cart" data-id="${p.id}">🛒 Añadir</button>
    </div>
  `;
  productList.appendChild(card);
});

// Abrir modal de detalles
document.querySelectorAll('.btn-zoom, .product-img').forEach(el => {
  el.addEventListener('click', (e) => {
    const id = e.target.dataset.id || e.currentTarget.dataset.id;
    const prod = products.find(p => p.id == id);
    if (prod) {
      document.getElementById('modalImage').src = prod.image;
      document.getElementById('modalTitle').innerText = prod.name;
      document.getElementById('modalPrice').innerText = `$${prod.price.toFixed(2)}`;
      document.getElementById('modalSpecs').innerText = prod.specs;
      document.getElementById('detailModal').style.display = 'flex';
    }
  });
});

// Cerrar modal
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('detailModal').style.display = 'none';
});

// Añadir al carrito
document.querySelectorAll('.btn-cart').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    const prod = products.find(p => p.id == id);
    if (prod) {
      cart.push(prod);
      localStorage.setItem('bhalleffort-cart', JSON.stringify(cart));
      updateCartCount();
      // Feedback visual suave
      btn.textContent = '✔ Añadido';
      setTimeout(() => btn.textContent = '🛒 Añadir', 1500);
    }
  });
});

// Actualizar contador del carrito
function updateCartCount() {
  document.getElementById('cartCount').textContent = cart.length;
}
updateCartCount();

// Redirigir a WhatsApp al hacer clic en el carrito
document.getElementById('cartIcon').addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Tu carrito está vacío. ¡Agrega productos primero!');
    return;
  }

  let message = 'Hola, quiero comprar:\n';
  let total = 0;
  cart.forEach(item => {
    message += `- ${item.name} x1\n`;
    total += item.price;
  });
  message += `\nTotal: $${total.toFixed(2)}\n\n¡Listo para coordinar envío!`;

  const whatsappURL = `https://wa.me/51999999999?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, '_blank');
});
