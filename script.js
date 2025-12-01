// ==========================================================
// 1. Catálogo Centralizado de Productos (DATA STORE)
// ==========================================================

const PRODUCTS_DATA = [
    // PRODUCTOS DE INDEX.HTML
    { id: "P001", name: "Chompa de tela pana (Gris)", price: 5.00, category: "Ropa", image: "img/prod-chompa.jpg" },
    { id: "P002", name: "Peluche de ballena de felpa", price: 12.00, category: "Juguetes", image: "img/prod-ballena.jpg" },
    { id: "O001", name: "Reloj inteligente modelo A3 (OFERTA)", price: 40.00, category: "Promoción", image: "img/prod-reloj.jpg" },
    { id: "P003", name: "Taza de cerámica con asa", price: 3.50, category: "Hogar", image: "img/prod-taza.jpg" },
    
    // PRODUCTOS DE ROPA.HTML
    { id: "R001", name: "Jeans clásicos elasticados", price: 15.00, category: "Ropa", image: "img/prod-jeans.jpg" },
    { id: "R002", name: "Blusa de seda sin mangas, elegante", price: 8.00, category: "Ropa", image: "img/prod-blusa.jpg" },
    { id: "R003", name: "Falda de verano con estampado", price: 10.00, category: "Ropa", image: "img/prod-falda.jpg" },
    { id: "R004", name: "Vestido de cóctel ajustado negro", price: 18.00, category: "Ropa", image: "img/prod-vestido.jpg" },
    { id: "R005", name: "Camiseta deportiva Dry-Fit", price: 7.00, category: "Ropa", image: "img/prod-camiseta.jpg" },
    { id: "R006", name: "Chaqueta estilo aviador", price: 25.00, category: "Ropa", image: "img/prod-chaqueta.jpg" },
    { id: "R007", name: "Pack de 3 pares de calcetines", price: 4.50, category: "Ropa", image: "img/prod-calcetines.jpg" },

    // PRODUCTOS DE JUGUETES.HTML
    { id: "J001", name: "Set de 50 bloques de madera de colores", price: 20.00, category: "Juguetes", image: "img/prod-bloques.jpg" },
    { id: "J002", name: "Muñeca articulada con set de accesorios", price: 10.00, category: "Juguetes", image: "img/prod-muñeca.jpg" },
    { id: "J003", name: "Auto deportivo a control remoto", price: 18.50, category: "Juguetes", image: "img/prod-rc.jpg" },
    { id: "J004", name: "Pizarra mágica LCD para dibujar", price: 6.00, category: "Juguetes", image: "img/prod-pizarra.jpg" },
    { id: "J005", name: "Juego de mesa 'Aventura Pirata'", price: 14.00, category: "Juguetes", image: "img/prod-juego.jpg" },

    // PRODUCTOS DE HOGAR.HTML
    { id: "H001", name: "Toalla de algodón XL de alta absorción", price: 7.50, category: "Hogar", image: "img/prod-toalla.jpg" },
    { id: "H002", name: "Juego de sábanas King size", price: 25.00, category: "Hogar", image: "img/prod-sábanas.jpg" },
    { id: "H003", name: "Organizador modular de cocina 3 niveles", price: 11.00, category: "Hogar", image: "img/prod-organizador.jpg" },
    { id: "H004", name: "Difusor de aromas ultrasónico", price: 16.00, category: "Hogar", image: "img/prod-difusor.jpg" },
    { id: "H005", name: "Juego de 24 cubiertos de acero inoxidable", price: 22.00, category: "Hogar", image: "img/prod-cubiertos.jpg" },

    // PRODUCTOS DE PROMOCIONES.HTML (OFERTAS ADICIONALES)
    { id: "O002", name: "Audífonos inalámbricos (OFERTA)", price: 19.99, category: "Promoción", image: "img/prod-audifonos.jpg" },
    { id: "O003", name: "Set de 2 lámparas LED (OFERTA)", price: 12.00, category: "Promoción", image: "img/prod-lampara.jpg" },
    { id: "O004", name: "Mochila ejecutiva Antirrobo (OFERTA)", price: 30.00, category: "Promoción", image: "img/prod-mochila.jpg" },
];

// ==========================================================
// 2. Variables Globales
// ==========================================================

let cart = JSON.parse(localStorage.getItem('bhalEffortCart')) || [];
const cartBadge = document.querySelector('.cart .badge'); // ✅ Usamos tu estructura HTML real
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const WHATSAPP_NUMBER = '593960503674';

// ==========================================================
// 3. Funciones del Carrito
// ==========================================================

function saveCart() {
    localStorage.setItem('bhalEffortCart', JSON.stringify(cart));
}

function getProductData(id) {
    return PRODUCTS_DATA.find(p => p.id === id);
}

function calculateTotal() {
    return cart.reduce((total, item) => {
        const product = getProductData(item.id);
        return product ? total + product.price * item.quantity : total;
    }, 0);
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center; color:#666;">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const product = getProductData(item.id);
            if (product) {
                const subtotal = product.price * item.quantity;
                const itemHTML = `
                    <div style="display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                        <div style="flex: 1;">
                            <strong>${product.name}</strong><br>
                            <small>$${product.price} x ${item.quantity}</small>
                        </div>
                        <div>$${subtotal.toFixed(2)}</div>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
            }
        });
    }
    cartTotalElement.textContent = '$' + calculateTotal().toFixed(2);
    cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0) || 0;
    saveCart();
}

function addToCart(id, quantity = 1) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cart.push({ id, quantity });
    }
    renderCart();
    cartModal.style.display = 'block';
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

// ==========================================================
// 4. Mensaje de WhatsApp PERSONALIZADO
// ==========================================================

function generateWhatsappMessage() {
    let message = `¡Hola BHalleffort! 💙\n\nQuisiera realizar un pedido con los siguientes productos:\n\n`;
    let subtotal = 0;

    cart.forEach(item => {
        const product = getProductData(item.id);
        if (product) {
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            message += `• ${item.quantity} x ${product.name} → $${product.price.toFixed(2)}\n`;
        }
    });

    const shippingCost = subtotal >= 50 ? 0.00 : 3.50;
    const finalTotal = subtotal + shippingCost;

    message += `\n📦 Subtotal: $${subtotal.toFixed(2)}`;
    message += `\n🚚 Envío: $${shippingCost.toFixed(2)} ${shippingCost === 0 ? "(¡GRATIS por compras +$50!)" : ""}`;
    message += `\n💰 TOTAL FINAL: $${finalTotal.toFixed(2)}\n\n`;
    message += `📌 Por favor, confírmenme disponibilidad y pasos para pago.\n¡Gracias por su atención! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`; // ✅ SIN ESPACIOS
    window.open(whatsappURL, '_blank');
}

// ==========================================================
// 5. Eventos
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    document.body.addEventListener('click', (e) => {
        // Añadir al carrito
        const btnAdd = e.target.closest('.btn-buy');
        if (btnAdd && btnAdd.hasAttribute('data-id')) {
            const id = btnAdd.getAttribute('data-id');
            addToCart(id, 1);
            return;
        }

        // Abrir carrito (tu HTML usa .cart como contenedor)
        if (e.target.closest('.cart')) {
            cartModal.style.display = 'block';
            return;
        }

        // Cerrar modal
        if (
            e.target.closest('#btn-cancel-modal') ||
            e.target.closest('#btn-cancel-cart') ||
            e.target === cartModal
        ) {
            cartModal.style.display = 'none';
            return;
        }

        // Confirmar compra
        if (e.target.closest('#btn-checkout-whatsapp')) {
            if (cart.length === 0) {
                alert('El carrito está vacío.');
                return;
            }
            generateWhatsappMessage();
            return;
        }

        // Eliminar producto
        const removeBtn = e.target.closest('.btn-remove');
        if (removeBtn && removeBtn.hasAttribute('data-id')) {
            const id = removeBtn.getAttribute('data-id');
            removeFromCart(id);
            return;
        }
    });
});
