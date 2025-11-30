// ==========================================================
// 1. Catálogo Centralizado de Productos (DATA STORE)
// Estos datos son usados por el JS para gestionar el carrito.
// Asegúrate de que los data-id del HTML coincidan con estos IDs.
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
// 2. Variables Globales y Estado del Carrito
// ==========================================================

let cart = JSON.parse(localStorage.getItem('bhalEffortCart')) || [];
const cartModal = document.getElementById('cart-modal');
const cartBadge = document.getElementById('cart-badge');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const WHATSAPP_NUMBER = '593960503674'; // Tu número de WhatsApp

// ==========================================================
// 3. Funciones del Carrito
// ==========================================================

/**
 * Guarda el carrito en el almacenamiento local.
 */
function saveCart() {
    localStorage.setItem('bhalEffortCart', JSON.stringify(cart));
}

/**
 * Busca un producto por ID en el catálogo.
 * @param {string} id - El ID del producto.
 * @returns {object} El objeto producto.
 */
function getProductData(id) {
    return PRODUCTS_DATA.find(p => p.id === id);
}

/**
 * Calcula el total del carrito.
 * @returns {number} El total.
 */
function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        const product = getProductData(item.id);
        if (product) {
            total += product.price * item.quantity;
        }
    });
    return total;
}

/**
 * Renderiza el contenido del carrito en el modal.
 */
function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">El carrito está vacío. ¡Añade productos!</p>';
    } else {
        cart.forEach(item => {
            const product = getProductData(item.id);
            if (product) {
                const subtotal = product.price * item.quantity;
                total += subtotal;

                const cartItemHTML = `
                    <div class="cart-item">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                        <div class="cart-item-info">
                            <h4>${product.name}</h4>
                            <p>$${product.price.toFixed(2)} x ${item.quantity}</p>
                        </div>
                        <div class="cart-item-actions">
                            <span class="cart-item-subtotal">$${subtotal.toFixed(2)}</span>
                            <button class="btn-remove" data-id="${item.id}" aria-label="Eliminar producto"><i class="fas fa-trash-alt"></i></button>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItemHTML;
            }
        });
    }

    cartTotalElement.textContent = `$${calculateTotal().toFixed(2)}`;
    cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    saveCart();
}

/**
 * Añade un producto al carrito.
 * @param {string} id - ID del producto.
 * @param {number} quantity - Cantidad a añadir.
 */
function addToCart(id, quantity = 1) {
    const existingItemIndex = cart.findIndex(item => item.id === id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ id: id, quantity: quantity });
    }
    renderCart();
    alert(`"${getProductData(id).name}" añadido al carrito.`);
    cartModal.style.display = 'block';
}

/**
 * Elimina un producto del carrito.
 * @param {string} id - ID del producto.
 */
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

/**
 * Vacía completamente el carrito.
 */
function clearCart() {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        renderCart();
    }
}

// ==========================================================
// 4. Generación del Mensaje de WhatsApp
// ==========================================================

function generateWhatsappMessage() {
    let message = `¡Hola BhalEffort! Quisiera realizar el siguiente pedido:\n\n`;
    let subtotal = 0;

    cart.forEach(item => {
        const product = getProductData(item.id);
        if (product) {
            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;
            message += `- ${item.quantity} x ${product.name} ($${product.price.toFixed(2)} c/u)\n`;
        }
    });

    const shippingCost = subtotal >= 50 ? 0.00 : 3.50;
    const finalTotal = subtotal + shippingCost;

    message += `\nSubtotal: $${subtotal.toFixed(2)}`;
    message += `\nCosto de Envío: $${shippingCost.toFixed(2)} (${shippingCost === 0 ? '¡GRATIS!' : 'Regular'})`;
    message += `\n*TOTAL FINAL: $${finalTotal.toFixed(2)}*`;
    message += `\n\nPor favor, confírmenme la disponibilidad y los pasos para el pago. ¡Gracias!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// ==========================================================
// 5. Carga Dinámica de Componentes (Header y Footer)
// ==========================================================

function loadComponent(filename, elementId) {
    fetch(`components/${filename}.html`)
        .then(response => {
            if (!response.ok) {
                console.warn(`⚠️ Componente no encontrado: components/${filename}.html`);
                return '';
            }
            return response.text();
        })
        .then(data => {
            if (document.getElementById(elementId)) {
                document.getElementById(elementId).innerHTML = data;
                // Reiniciar menú móvil si existe
                const menuToggle = document.querySelector('.menu-toggle');
                const mainNav = document.querySelector('.main-nav');
                if (menuToggle && mainNav) {
                    menuToggle.onclick = () => mainNav.classList.toggle('active');
                }
            }
        })
        .catch(err => console.error(`Error al cargar ${filename}:`, err));
}

// ==========================================================
// 6. Gestión de Eventos (Event Listeners)
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Cargar componentes comunes
    loadComponent('header', 'header-placeholder');
    loadComponent('footer', 'footer-placeholder');

    // Renderizar carrito al iniciar
    renderCart();

    // --------------------------------------------------
    // A. Gestión de Eventos del Carrito (Delegación de eventos)
    // --------------------------------------------------
    document.body.addEventListener('click', (event) => {
        // 1. AÑADIR AL CARRITO
        const quickAddButton = event.target.closest('.btn-quick-add');
        const buyNowButton = event.target.closest('.btn-buy');

        if (quickAddButton) {
            const id = quickAddButton.getAttribute('data-id');
            addToCart(id, 1);
            return;
        }

        if (buyNowButton) {
            const id = buyNowButton.getAttribute('data-id');
            addToCart(id, 1);
            return;
        }

        // 2. ABRIR MODAL DEL CARRITO
        if (event.target.closest('#cart-icon')) {
            cartModal.style.display = 'block';
            return;
        }
        
        // 3. CERRAR MODAL
        if (event.target.closest('.close-button') || event.target.closest('#btn-cancel-modal')) {
            cartModal.style.display = 'none';
            return;
        }

        // 4. ELIMINAR DEL CARRITO
        const removeButton = event.target.closest('.btn-remove');
        if (removeButton) {
            const id = removeButton.getAttribute('data-id');
            removeFromCart(id);
            return;
        }
        
        // 5. VACIAR CARRITO
        if (event.target.closest('#btn-clear-cart')) {
            clearCart();
            return;
        }
        
        // 6. FINALIZAR PEDIDO
        if (event.target.closest('#btn-checkout-whatsapp')) {
            if (cart.length > 0) {
                generateWhatsappMessage();
            } else {
                alert('Tu carrito está vacío. Añade productos para finalizar el pedido.');
            }
            return;
        }
    });

    // Cerrar modal del carrito al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
    
    // --------------------------------------------------
    // B. Zoom de Imagen
    // --------------------------------------------------
    document.body.addEventListener('click', (event) => {
        const image = event.target.closest('.product-image');
        if (image) {
            modalImage.src = image.src;
            imageModal.style.display = 'block';
            return;
        }
        if (event.target.closest('.image-close') || event.target === imageModal) {
            imageModal.style.display = 'none';
            return;
        }
    });
    
    // --------------------------------------------------
    // C. Búsqueda con Autocompletado
    // --------------------------------------------------
    const searchInput = document.getElementById('search-input');
    const autocompleteResults = document.getElementById('autocomplete-results');

    if (searchInput && autocompleteResults) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            autocompleteResults.innerHTML = '';

            if (query.length < 2) return;

            const filteredProducts = PRODUCTS_DATA.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            ).slice(0, 5);

            if (filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'autocomplete-item';
                    resultItem.textContent = `${product.name} (${product.category})`;
                    resultItem.addEventListener('click', () => {
                        searchInput.value = '';
                        autocompleteResults.innerHTML = '';
                        alert(`Buscaste: ${product.name}`);
                    });
                    autocompleteResults.appendChild(resultItem);
                });
            } else {
                autocompleteResults.innerHTML = '<div class="autocomplete-item no-results">No se encontraron resultados</div>';
            }
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                autocompleteResults.innerHTML = '';
            }, 200);
        });
    }
});
