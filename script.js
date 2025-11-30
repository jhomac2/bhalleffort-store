document.addEventListener('DOMContentLoaded', () => {

    // Lista de Productos (Asegúrese de que los precios y nombres sean los correctos)
    const PRODUCTS = [
        { id: 'P001', name: 'Chompa tela pana', price: 5.00, category: 'Ropa', keywords: ['chompa', 'pana', 'abrigo'] },
        { id: 'P002', name: 'Peluche de ballena', price: 12.00, category: 'Juguetes', keywords: ['peluche', 'ballena', 'suave'] },
        { id: 'P003', name: 'Taza de diseño', price: 3.50, category: 'Hogar', keywords: ['taza', 'cafe', 'diseño'] },
        { id: 'R001', name: 'Jeans elasticados', price: 15.00, category: 'Ropa', keywords: ['jeans', 'pantalón', 'elástico'] },
        { id: 'R002', name: 'Blusa de seda', price: 8.00, category: 'Ropa', keywords: ['blusa', 'seda', 'elegante'] },
        { id: 'J001', name: 'Set de bloques de madera', price: 20.00, category: 'Juguetes', keywords: ['bloques', 'madera', 'construcción'] },
        { id: 'J002', name: 'Muñeca articulada', price: 10.00, category: 'Juguetes', keywords: ['muñeca', 'articulada', 'niña'] },
        { id: 'H001', name: 'Toalla de algodón XL', price: 7.50, category: 'Hogar', keywords: ['toalla', 'algodón', 'baño'] },
        { id: 'H002', name: 'Juego de sábanas', price: 25.00, category: 'Hogar', keywords: ['sábanas', 'cama', 'dormitorio'] },
        { id: 'O001', name: 'Reloj inteligente (Oferta)', price: 40.00, oldPrice: 60.00, category: 'Promociones', keywords: ['reloj', 'smartwatch', 'oferta', 'promoción'] },
        // Agregue más productos si los tiene...
    ];

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- 1. FUNCIONES PRINCIPALES DEL CARRITO ---

    // Función para añadir al carrito
    function addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) {
            const existingItem = cart.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            saveCart();
            updateCartBadge();
            // Opcional: mostrar un mensaje de confirmación
        }
    }

    // Función para guardar el carrito en Local Storage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Función para actualizar el contador del carrito
    function updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }

    // Función para renderizar el contenido del modal del carrito
    function renderCartModal() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        const modalActions = document.getElementById('modal-actions');
        
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">El carrito está vacío.</p>';
            modalActions.style.display = 'none';
        } else {
            modalActions.style.display = 'flex';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity-control">
                        <button class="btn-quantity" data-id="${item.id}" data-action="decrease">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="btn-quantity" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <div class="item-price-total">$${itemTotal.toFixed(2)}</div>
                    <button class="btn-remove" data-id="${item.id}">X</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        cartTotalElement.textContent = `$${total.toFixed(2)}`;
        
        // Adjuntar eventos a los botones del modal (quitar, aumentar, disminuir)
        attachCartItemEventListeners();
        // Adjuntar evento al botón de WhatsApp
        attachWhatsappButtonEvent(total);
    }
    
    // Función para adjuntar eventos (aumentar/disminuir/remover)
    function attachCartItemEventListeners() {
        document.querySelectorAll('.btn-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                const action = e.currentTarget.getAttribute('data-action');
                updateQuantity(productId, action);
            });
        });

        document.querySelectorAll('.btn-remove').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                removeFromCart(productId);
            });
        });
    }

    // Función para generar el mensaje de WhatsApp
    function generateWhatsappMessage(total) {
        let message = "¡Hola! Quisiera hacer un pedido con los siguientes artículos:\n\n";
        cart.forEach(item => {
            message += `- ${item.name} (${item.quantity} x $${item.price.toFixed(2)}) = $${(item.price * item.quantity).toFixed(2)}\n`;
        });
        message += `\n*TOTAL ESTIMADO: $${total.toFixed(2)}*\n\n`;
        message += "Por favor, confírmenme el stock y los detalles del envío.";
        
        // Codificar el mensaje para la URL
        return encodeURIComponent(message);
    }

    // Función para adjuntar evento al botón de WhatsApp en el modal
    function attachWhatsappButtonEvent(total) {
        const whatsappButton = document.getElementById('btn-checkout-whatsapp');
        if (whatsappButton) {
            whatsappButton.onclick = () => {
                const phoneNumber = '593960503674'; // Su número de WhatsApp
                const message = generateWhatsappMessage(total);
                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
            };
        }
    }

    // Función para actualizar cantidad (aumentar/disminuir)
    function updateQuantity(productId, action) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (action === 'increase') {
                item.quantity += 1;
            } else if (action === 'decrease') {
                item.quantity -= 1;
            }
            
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                renderCartModal();
                updateCartBadge();
            }
        }
    }

    // Función para remover del carrito
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCartModal();
        updateCartBadge();
    }


    // --- 2. GESTIÓN DEL MODAL (VENTANA EMERGENTE) ---

    const modal = document.getElementById('cart-modal');
    const cartIcon = document.getElementById('cart-icon');
    const closeButton = document.querySelector('.close-button');
    const cancelButton = document.getElementById('btn-cancel-modal');

    // Abre el modal
    cartIcon.addEventListener('click', () => {
        renderCartModal();
        modal.style.display = 'flex';
    });

    // Cierra el modal con la 'X'
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cierra el modal con el botón 'Cancelar'
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Cierra el modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });


    // --- 3. MANEJADOR DE CLICS (CARRITO RÁPIDO) ---
    // ESTO REEMPLAZA EL CÓDIGO VIEJO DE .btn-buy
    document.querySelectorAll('.btn-quick-add').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            addToCart(productId);
            // Si desea, puede añadir aquí una pequeña notificación de "Añadido"
        });
    });


    // --- 4. FUNCIONALIDAD DEL BUSCADOR ---

    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('autocomplete-results');

    // Muestra sugerencias
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }

        const filteredProducts = PRODUCTS.filter(product => 
            product.name.toLowerCase().includes(query) || 
            product.keywords.some(k => k.includes(query))
        ).slice(0, 5); // Limitar a 5 resultados

        renderAutocompleteResults(filteredProducts, query);
    });

    // Renderiza los resultados de la búsqueda
    function renderAutocompleteResults(products, query) {
        resultsContainer.innerHTML = '';

        if (products.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        products.forEach(product => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('autocomplete-item');
            
            // Reemplazar la consulta con un resalte visual
            const nameHtml = product.name.replace(new RegExp(query, 'gi'), match => `<span class="highlight">${match}</span>`);

            resultItem.innerHTML = `${nameHtml} <span class="category-hint">(${product.category})</span>`;
            
            resultItem.addEventListener('click', () => {
                // Redirigir a la página de la categoría o un enlace de producto si existiera
                const pageMap = {
                    'Ropa': 'ropa.html',
                    'Juguetes': 'juguetes.html',
                    'Hogar': 'hogar.html',
                    'Promociones': 'promociones.html'
                };
                const url = pageMap[product.category] || 'index.html';
                window.location.href = url + '#product-' + product.id; // Podría llevar a una ancla
            });
            
            resultsContainer.appendChild(resultItem);
        });

        resultsContainer.style.display = 'block';
    }

    // Ocultar resultados al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });


    // --- 5. FUNCIONALIDAD ZOOM DE IMAGEN (MODAL) ---

    const imageModal = document.getElementById('image-modal');
    const modalImage = document.getElementById('modal-image');
    const imageClose = document.querySelector('.image-close');
    const productImages = document.querySelectorAll('.product-image');

    productImages.forEach(image => {
        image.addEventListener('click', () => {
            imageModal.style.display = 'block';
            modalImage.src = image.src;
        });
    });

    imageClose.addEventListener('click', () => {
        imageModal.style.display = 'none';
    });

    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });

    // Inicialización del badge
    updateCartBadge();
});
