document.addEventListener('DOMContentLoaded', () => {
    // --- 1. VARIABLES Y SELECTORES ---
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartBadge = document.getElementById('cart-badge');
    const buyButtons = document.querySelectorAll('.btn-buy');
    const btnCancel = document.getElementById('btn-cancel');
    const btnCheckoutWhatsapp = document.getElementById('btn-checkout-whatsapp');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    // Estado del carrito (se carga desde localStorage si existe)
    let cart = JSON.parse(localStorage.getItem('bhalleffortCart')) || [];

    // Lista de productos de ejemplo (debería cargarse de una base de datos real)
    const PRODUCTS = [
        // Índice (index.html)
        { id: 'P001', name: 'Jeans Clásicos Mezclilla', price: 24.99, category: 'Ropa' },
        { id: 'P002', name: 'Set 100 Bloques de Construcción', price: 19.50, category: 'Juguetes' },
        { id: 'P003', name: 'Aspiradora Robótica Inteligente', price: 199.99, category: 'Hogar' },
        { id: 'P004', name: 'Set de 3 Sartenes Antiadherentes', price: 39.99, category: 'Promociones' },

        // Ropa (ropa.html)
        { id: 'R001', name: 'Vestido Casual de Lino', price: 32.00, category: 'Ropa' },
        { id: 'R002', name: 'Camisa Algodón Slim Fit', price: 19.99, category: 'Ropa' },
        { id: 'R003', name: 'Conjunto Deportivo Infantil', price: 15.50, category: 'Ropa' },

        // Juguetes (juguetes.html)
        { id: 'J001', name: 'Pista de Carreras Flexible', price: 25.99, category: 'Juguetes' },
        { id: 'J002', name: 'Muñeca Interactiva con Sonido', price: 39.99, category: 'Juguetes' },
        { id: 'J003', name: 'Mesa de Actividades Didácticas', price: 55.00, category: 'Juguetes' },

        // Hogar (hogar.html)
        { id: 'H001', name: 'Organizador de Especieros Tres Niveles', price: 18.99, category: 'Hogar' },
        { id: 'H002', name: 'Set de 6 Toallas Algodón Egipcio', price: 42.50, category: 'Hogar' },
        { id: 'H003', name: 'Manta Decorativa Lana Tejida', price: 29.99, category: 'Hogar' },

        // Promociones (promociones.html)
        { id: 'O001', name: 'Reloj Inteligente Deportivo 40% OFF', price: 29.99, category: 'Promociones' },
        { id: 'O002', name: 'Zapatos Deportivos Infantiles', price: 17.99, category: 'Promociones' },
        { id: 'O003', name: 'Set 2 Cortinas Opacas Térmicas', price: 29.99, category: 'Promociones' },
    ];

    // --- 2. FUNCIONES DEL CARRITO ---

    // Función para guardar el carrito en localStorage
    const saveCart = () => {
        localStorage.setItem('bhalleffortCart', JSON.stringify(cart));
        updateCartBadge();
    };

    // Función para actualizar el contador de items en el ícono del carrito
    const updateCartBadge = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        // Ocultar el badge si no hay items
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    };

    // Función para calcular y mostrar el total del carrito
    const calculateTotal = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        return total;
    };

    // Función para dibujar los items del carrito en el modal
    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">El carrito está vacío.</p>';
            cartTotalElement.textContent = 'Total: $0.00';
            btnCheckoutWhatsapp.disabled = true;
            btnCancel.disabled = true;
            return;
        }

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="btn-quantity decrease-btn" data-id="${item.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="btn-quantity increase-btn" data-id="${item.id}">+</button>
                    <button class="btn-remove" data-id="${item.id}">X</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        calculateTotal();
        btnCheckoutWhatsapp.disabled = false;
        btnCancel.disabled = false;
    };

    // Función para añadir un producto al carrito
    const addToCart = (productId) => {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        saveCart();
        alert(`${product.name} añadido al carrito.`);
    };

    // Manejar clics dentro del modal (aumentar, disminuir, remover)
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id;

        if (!productId) return;

        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;

        if (target.classList.contains('increase-btn')) {
            cart[itemIndex].quantity += 1;
        } else if (target.classList.contains('decrease-btn')) {
            cart[itemIndex].quantity -= 1;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1); // Remover si la cantidad llega a cero
            }
        } else if (target.classList.contains('btn-remove')) {
            cart.splice(itemIndex, 1); // Remover item
        }

        saveCart();
        renderCart();
    });

    // --- 3. EVENT LISTENERS ---

    // 3.1. Abrir modal del carrito
    cartIcon.addEventListener('click', (e) => {
        e.preventDefault(); // Evita que el enlace de carrito navegue si es un <a>
        renderCart();
        cartModal.style.display = 'flex';
    });

    // 3.2. Cerrar modal
    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Cerrar si se hace clic fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // 3.3. Botones "Añadir al Carrito"
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                const productId = card.dataset.id;
                addToCart(productId);
            }
        });
    });

    // 3.4. Vaciar Carrito
    btnCancel.addEventListener('click', () => {
        if (confirm('¿Está seguro de que desea vaciar el carrito?')) {
            cart = [];
            saveCart();
            renderCart();
        }
    });

    // 3.5. Botón de Checkout por WhatsApp
    btnCheckoutWhatsapp.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('El carrito está vacío. Agregue productos para hacer un pedido.');
            return;
        }

        let message = "¡Hola! Quisiera realizar el siguiente pedido:\n\n";
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `${index + 1}. ${item.name} | Cantidad: ${item.quantity} | Subtotal: $${itemTotal.toFixed(2)}\n`;
        });

        message += `\n*TOTAL FINAL: $${total.toFixed(2)}*\n\n`;
        message += "Por favor, confírmenme el total incluyendo el costo de envío. ¡Gracias!";

        // El número de WhatsApp del negocio de BHALLEFFORT
        const whatsappNumber = '593960503674'; 
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
        cartModal.style.display = 'none'; // Cerrar modal después de enviar
    });

    // 3.6. Menú móvil (Toggle)
    menuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // 3.7. Funcionalidad del Buscador con Autocompletado (SOLO en index.html)
    const searchInput = document.getElementById('search-input');
    const autocompleteResults = document.getElementById('autocomplete-results');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            autocompleteResults.innerHTML = '';

            if (query.length < 2) {
                autocompleteResults.style.display = 'none';
                return;
            }

            const filteredProducts = PRODUCTS.filter(p => 
                p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query)
            ).slice(0, 5); // Mostrar máximo 5 resultados

            if (filteredProducts.length > 0) {
                filteredProducts.forEach(product => {
                    const resultItem = document.createElement('div');
                    resultItem.classList.add('autocomplete-item');
                    resultItem.innerHTML = `<i class="fas fa-search"></i> ${product.name} <span class="category-hint">(${product.category})</span>`;
                    
                    // Al hacer clic, se podría redirigir a una página de detalle o la categoría
                    resultItem.addEventListener('click', () => {
                        searchInput.value = product.name;
                        autocompleteResults.style.display = 'none';
                        // Simular búsqueda o redirección (Ejemplo: ir a la categoría)
                        const categoryFile = product.category.toLowerCase().replace(/ /g, '-');
                        if (categoryFile.includes('ropa')) window.location.href = 'ropa.html';
                        else if (categoryFile.includes('juguetes')) window.location.href = 'juguetes.html';
                        else if (categoryFile.includes('hogar')) window.location.href = 'hogar.html';
                        else if (categoryFile.includes('promociones')) window.location.href = 'promociones.html';
                        else window.location.href = 'index.html';
                    });
                    autocompleteResults.appendChild(resultItem);
                });
                autocompleteResults.style.display = 'block';
            } else {
                autocompleteResults.style.display = 'none';
            }
        });

        // Ocultar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (e.target !== searchInput && e.target !== autocompleteResults) {
                autocompleteResults.style.display = 'none';
            }
        });
        
        // Manejar el botón de búsqueda
        const searchButton = document.getElementById('search-button');
        if(searchButton) {
             searchButton.addEventListener('click', () => {
                const query = searchInput.value.toLowerCase();
                // Redireccionar a la categoría o a una página de resultados
                if (query.includes('ropa')) window.location.href = 'ropa.html';
                else if (query.includes('juguetes')) window.location.href = 'juguetes.html';
                else if (query.includes('hogar')) window.location.href = 'hogar.html';
                else if (query.includes('promociones')) window.location.href = 'promociones.html';
                else alert(`Realizando búsqueda de: "${query}". (En una tienda real, esto lo llevaría a una página de resultados)`);
            });
        }
    }


    // 4. INICIALIZACIÓN
    updateCartBadge(); // Asegura que el contador se muestre al cargar la página
});
