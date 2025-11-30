document.addEventListener('DOMContentLoaded', () => {
    // ------------------------------------------------------------------
    // 1. LÓGICA DEL CARRITO DE COMPRAS
    // ------------------------------------------------------------------
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartBadge = document.getElementById('cart-badge');
    const whatsappBtn = document.getElementById('btn-checkout-whatsapp');
    
    // Función para actualizar el contador del carrito (badge)
    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }

    // Función para renderizar los productos en el modal del carrito
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 20px;">El carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.innerHTML = `
                    <span class="item-name">${item.name}</span>
                    <div class="item-quantity-control">
                        <button class="remove-one" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="add-one" data-id="${item.id}">+</button>
                    </div>
                    <span class="item-price-total">$${itemTotal.toFixed(2)}</span>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        cartTotalElement.textContent = `Total: $${total.toFixed(2)}`;
        updateCartBadge();
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Manejar eventos de añadir/quitar en el carrito
    cartItemsContainer.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (e.target.classList.contains('add-one')) {
            const item = cart.find(i => i.id === id);
            item.quantity++;
        } else if (e.target.classList.contains('remove-one')) {
            const itemIndex = cart.findIndex(i => i.id === id);
            if (itemIndex > -1) {
                cart[itemIndex].quantity--;
                if (cart[itemIndex].quantity <= 0) {
                    cart.splice(itemIndex, 1); // Eliminar si la cantidad llega a cero
                }
            }
        }
        renderCart();
    });

    // Abrir el modal
    if (cartIcon) {
        cartIcon.onclick = () => {
            renderCart();
            cartModal.style.display = 'block';
        };
    }
    
    // Cerrar el modal
    if (closeModal) {
        closeModal.onclick = () => {
            cartModal.style.display = 'none';
        };
    }

    // Cerrar si se hace click fuera
    window.onclick = (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    };

    // Lógica para añadir producto desde la página (simulación)
    document.querySelectorAll('.btn-buy').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productElement = e.target.closest('.product-card');
            if (!productElement) return;

            const id = productElement.dataset.id || Date.now().toString(); 
            const name = productElement.querySelector('.product-name').textContent;
            const priceText = productElement.querySelector('.current-price').textContent.replace('$', '');
            const price = parseFloat(priceText);

            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }

            updateCartBadge();
            localStorage.setItem('cart', JSON.stringify(cart));
            // Opcional: mostrar un mensaje de éxito o abrir el carrito
        });
    });

    // Generar mensaje de WhatsApp
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('El carrito está vacío. Añade productos primero.');
                return;
            }

            let message = "¡Hola! Me gustaría hacer un pedido con los siguientes artículos:\n\n";
            let total = 0;

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                message += `${index + 1}. ${item.name} - Cantidad: ${item.quantity} - Total: $${itemTotal.toFixed(2)}\n`;
            });

            message += `\n*TOTAL ESTIMADO: $${total.toFixed(2)}*`;
            message += "\n\nPor favor, confírmenme el stock y el costo de envío a mi ubicación.";

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/593960503674?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // Inicializar el badge al cargar la página
    updateCartBadge();


    // ------------------------------------------------------------------
    // 2. LÓGICA DEL MENÚ MÓVIL
    // ------------------------------------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('.main-header');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            // Alternar la clase 'menu-active' en el cuerpo del documento o en un contenedor superior
            document.body.classList.toggle('menu-active');
        });
    }
    
    // ------------------------------------------------------------------
    // 3. LÓGICA DEL BUSCADOR CON AUTOCOMPLETAR (Solo en index.html)
    // ------------------------------------------------------------------
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('autocomplete-results');

    // Lista simplificada de productos para simular la búsqueda
    const productList = [
        { id: '1', name: 'Jeans Clásicos Hombre', category: 'Ropa', url: 'ropa.html#jeans' },
        { id: '2', name: 'Vestido de Verano Floral Mujer', category: 'Ropa', url: 'ropa.html#vestido' },
        { id: '3', name: 'Coche Eléctrico Infantil', category: 'Juguetes', url: 'juguetes.html#coche' },
        { id: '4', name: 'Bloques de Construcción Grande', category: 'Juguetes', url: 'juguetes.html#bloques' },
        { id: '5', name: 'Juego de Sábanas King Size', category: 'Hogar', url: 'hogar.html#sabanas' },
        { id: '6', name: 'Aspiradora Robótica', category: 'Hogar', url: 'hogar.html#aspiradora' },
        { id: '7', name: 'Oferta Sandalias de Playa', category: 'Promociones', url: 'promociones.html#sandalias' },
        { id: '8', name: 'Set de Ollas Antiadherentes', category: 'Hogar', url: 'hogar.html#ollas' },
    ];

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            resultsContainer.innerHTML = '';

            if (query.length < 2) {
                resultsContainer.style.display = 'none';
                return;
            }

            const filteredResults = productList.filter(product => 
                product.name.toLowerCase().includes(query) || 
                product.category.toLowerCase().includes(query)
            ).slice(0, 5); // Limitar a 5 resultados

            if (filteredResults.length > 0) {
                filteredResults.forEach(product => {
                    const resultLink = document.createElement('a');
                    resultLink.href = product.url;
                    
                    // Función simple para resaltar la palabra clave
                    const highlightedName = product.name.replace(new RegExp(`(${query})`, 'gi'), '<span class="highlight">$1</span>');

                    resultLink.innerHTML = `${highlightedName} <small>(${product.category})</small>`;
                    resultsContainer.appendChild(resultLink);
                });
                resultsContainer.style.display = 'block';
            } else {
                resultsContainer.innerHTML = '<a href="#">No se encontraron resultados...</a>';
                resultsContainer.style.display = 'block';
            }
        });
        
        // Ocultar resultados si se hace clic fuera del input
        document.addEventListener('click', (e) => {
            if (e.target !== searchInput && e.target !== resultsContainer && !resultsContainer.contains(e.target)) {
                resultsContainer.style.display = 'none';
            }
        });
    }
});
