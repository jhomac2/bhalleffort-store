// ==========================================================
// 1. Catálogo Centralizado de Productos (DATA STORE)
// ==========================================================

const PRODUCTS_DATA = [
    // PRODUCTOS DE INDEX.HTML — ✅ NOMBRES CORREGIDOS
    { id: "P001", name: "Camiseta BHALLEFFORT Edición Limitada", price: 14.99, category: "Ropa", image: "prod-ropa.jpg" },
    { id: "P002", name: "Bloques de Construcción Gigantes (500 pzs)", price: 22.50, category: "Juguetes", image: "prod-juguetes.jpg" },
    { id: "O001", name: "Pantalón Deportivo Morado BHALLEFFORT", price: 19.99, category: "Promoción", image: "prod-oferta.jpg" },
    { id: "P003", name: "Set de Utensilios de Cocina Deluxe", price: 39.99, category: "Hogar", image: "prod-hogar.jpg" },
    
    // PRODUCTOS DE ROPA.HTML
    { id: "R001", name: "Jeans clásicos elasticados", price: 15.00, category: "Ropa", image: "prod-jeans.jpg" },
    { id: "R002", name: "Blusa de seda sin mangas, elegante", price: 8.00, category: "Ropa", image: "prod-blusa.jpg" },
    { id: "R003", name: "Falda de verano con estampado", price: 10.00, category: "Ropa", image: "prod-falda.jpg" },
    { id: "R004", name: "Vestido de cóctel ajustado negro", price: 18.00, category: "Ropa", image: "prod-vestido.jpg" },
    { id: "R005", name: "Camiseta deportiva Dry-Fit", price: 7.00, category: "Ropa", image: "prod-camiseta.jpg" },
    { id: "R006", name: "Chaqueta estilo aviador", price: 25.00, category: "Ropa", image: "prod-chaqueta.jpg" },
    { id: "R007", name: "Pack de 3 pares de calcetines", price: 4.50, category: "Ropa", image: "prod-calcetines.jpg" },

    // PRODUCTOS DE JUGUETES.HTML
    { id: "J001", name: "Set de 50 bloques de madera de colores", price: 20.00, category: "Juguetes", image: "prod-bloques.jpg" },
    { id: "J002", name: "Muñeca articulada con set de accesorios", price: 10.00, category: "Juguetes", image: "prod-muñeca.jpg" },
    { id: "J003", name: "Auto deportivo a control remoto", price: 18.50, category: "Juguetes", image: "prod-rc.jpg" },
    { id: "J004", name: "Pizarra mágica LCD para dibujar", price: 6.00, category: "Juguetes", image: "prod-pizarra.jpg" },
    { id: "J005", name: "Juego de mesa 'Aventura Pirata'", price: 14.00, category: "Juguetes", image: "prod-juego.jpg" },

    // PRODUCTOS DE HOGAR.HTML
    { id: "H001", name: "Toalla de algodón XL de alta absorción", price: 7.50, category: "Hogar", image: "prod-toalla.jpg" },
    { id: "H002", name: "Juego de sábanas King size", price: 25.00, category: "Hogar", image: "prod-sábanas.jpg" },
    { id: "H003", name: "Organizador modular de cocina 3 niveles", price: 11.00, category: "Hogar", image: "prod-organizador.jpg" },
    { id: "H004", name: "Difusor de aromas ultrasónico", price: 16.00, category: "Hogar", image: "prod-difusor.jpg" },
    { id: "H005", name: "Juego de 24 cubiertos de acero inoxidable", price: 22.00, category: "Hogar", image: "prod-cubiertos.jpg" },

    // PRODUCTOS DE PROMOCIONES.HTML (OFERTAS ADICIONALES)
    { id: "O002", name: "Audífonos inalámbricos (OFERTA)", price: 19.99, category: "Promoción", image: "prod-audifonos.jpg" },
    { id: "O003", name: "Set de 2 lámparas LED (OFERTA)", price: 12.00, category: "Promoción", image: "prod-lampara.jpg" },
    { id: "O004", name: "Mochila ejecutiva Antirrobo (OFERTA)", price: 30.00, category: "Promoción", image: "prod-mochila.jpg" },
];

// ==========================================================
// 2. Variables Globales
// ==========================================================

let cart = JSON.parse(localStorage.getItem('bhalEffortCart')) || [];
const cartBadge = document.getElementById('cart-badge');
const cartModal = document.getElementById('cart-modal');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const WHATSAPP_NUMBER = '593963923399';
const SEARCH_INPUT = document.getElementById('search-input');
const AUTOCOMPLETE_RESULTS = document.getElementById('autocomplete-results');
const NOTIFICATION = document.getElementById('notification');

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
        cartItemsContainer.innerHTML = '<p style="text-align:center; padding:20px;">Tu carrito está vacío</p>';
    } else {
        cart.forEach(item => {
            const product = getProductData(item.id);
            if (product) {
                const subtotal = product.price * item.quantity;
                const itemHTML = `
                    <div style="display: flex; align-items: center; border-bottom: 1px solid #eee; padding: 10px 0;">
                        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 5px;">
                        <div style="flex: 1;">
                            <strong>${product.name}</strong><br>
                            <small>$${product.price} x ${item.quantity}</small>
                        </div>
                        <div style="text-align: right; min-width: 80px;">
                            <span style="font-weight: bold;">$${subtotal.toFixed(2)}</span>
                            <button class="btn-remove" data-id="${item.id}" style="background: none; border: none; color: #e74c3c; cursor: pointer; margin-left: 8px;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += itemHTML;
            }
        });
    }
    cartTotalElement.textContent = '$' + calculateTotal().toFixed(2);
    if (cartBadge) {
        cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0) || 0;
    }
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

    // ✅ Mostrar notificación temporal
    showNotification(`✅ ${getProductData(id).name} añadido al carrito`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

// ==========================================================
// 4. Notificación temporal
// ==========================================================

function showNotification(message) {
    if (NOTIFICATION) {
        NOTIFICATION.textContent = message;
        NOTIFICATION.style.display = 'block';
        setTimeout(() => {
            NOTIFICATION.style.display = 'none';
        }, 2000);
    }
}

// ==========================================================
// 5. WhatsApp
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
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// ==========================================================
// 6. Búsqueda
// ==========================================================

function searchProducts(query) {
    if (!query.trim()) {
        if (AUTOCOMPLETE_RESULTS) AUTOCOMPLETE_RESULTS.innerHTML = '';
        return;
    }

    const results = PRODUCTS_DATA.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    );

    if (AUTOCOMPLETE_RESULTS) {
        AUTOCOMPLETE_RESULTS.innerHTML = '';

        if (results.length === 0) {
            AUTOCOMPLETE_RESULTS.innerHTML = '<div style="padding:10px; color:#666;">No se encontraron resultados</div>';
            return;
        }

        results.slice(0, 5).forEach(product => {
            const resultItem = document.createElement('div');
            resultItem.style.padding = '10px';
            resultItem.style.cursor = 'pointer';
            resultItem.style.borderBottom = '1px solid #eee';
            resultItem.textContent = `${product.name} (${product.category})`;
            resultItem.addEventListener('click', () => {
                let page = '';
                switch (product.category) {
                    case 'Ropa': page = 'ropa.html'; break;
                    case 'Juguetes': page = 'juguetes.html'; break;
                    case 'Hogar': page = 'hogar.html'; break;
                    case 'Promoción': page = 'promociones.html'; break;
                    default: page = 'index.html';
                }
                window.location.href = page;
                if (SEARCH_INPUT) SEARCH_INPUT.value = '';
                if (AUTOCOMPLETE_RESULTS) AUTOCOMPLETE_RESULTS.innerHTML = '';
            });
            AUTOCOMPLETE_RESULTS.appendChild(resultItem);
        });
        AUTOCOMPLETE_RESULTS.style.display = 'block';
    }
}

// ==========================================================
// 7. Eventos
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    // Búsqueda
    if (SEARCH_INPUT && AUTOCOMPLETE_RESULTS) {
        SEARCH_INPUT.addEventListener('input', () => {
            searchProducts(SEARCH_INPUT.value);
        });
        SEARCH_INPUT.addEventListener('blur', () => {
            setTimeout(() => {
                if (AUTOCOMPLETE_RESULTS) AUTOCOMPLETE_RESULTS.style.display = 'none';
            }, 200);
        });
    }

    // Carrito y WhatsApp
    document.body.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('.btn-buy');
        if (btnAdd && btnAdd.hasAttribute('data-id')) {
            const id = btnAdd.getAttribute('data-id');
            addToCart(id, 1);
            return;
        }

        // Abrir carrito (solo al hacer clic en el ícono)
        if (e.target.closest('#cart-icon')) {
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

    // Fallback para PC
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartModal.style.display = 'block';
        });
    }

    // Botón de WhatsApp en header
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank');
        });
    }
});
