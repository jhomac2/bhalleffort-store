// ===========================================
// 1. LÓGICA DEL CARRITO DE WHATSAPP
// ===========================================

let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeButton = document.querySelector('.close-button');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotal = document.getElementById('cart-total');
    const sendWhatsappBtn = document.getElementById('send-whatsapp-btn');
    
    // Abrir Modal
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            renderCart();
            cartModal.style.display = 'block';
        });
    }

    // Cerrar Modal
    if (closeButton) closeButton.addEventListener('click', () => cartModal.style.display = 'none');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => cartModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Añadir al Carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const product = {
                id: e.target.getAttribute('data-id'),
                name: e.target.getAttribute('data-name'),
                price: parseFloat(e.target.getAttribute('data-price')),
                quantity: 1
            };
            addToCart(product);
        });
    });

    // Función principal para añadir
    function addToCart(product) {
        const existingProduct = cart.find(item => item.id === product.id);

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            cart.push(product);
        }
        updateCartDisplay();
        showTemporaryMessage(`${product.name} añadido al carrito.`);
    }

    // Renderizar Carrito en el Modal
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Tu lista de compras está vacía.</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <span class="item-name">${item.name} ($${item.price.toFixed(2)})</span>
                    <div class="item-quantity-control">
                        <button data-id="${item.id}" data-action="decrease">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button data-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <span class="item-price-total">$${itemTotal.toFixed(2)}</span>
                    <button data-id="${item.id}" data-action="remove" style="background: none; color: red; border: none; cursor: pointer; margin-left: 10px;">&times;</button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        cartTotal.textContent = `$${total.toFixed(2)}`;
        
        // Añadir listeners para control de cantidad y remover
        cartItemsContainer.querySelectorAll('button[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const action = e.target.getAttribute('data-action');
                updateQuantity(id, action);
            });
        });
    }

    // Actualizar cantidad en el carrito
    function updateQuantity(id, action) {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (action === 'increase') {
            item.quantity++;
        } else if (action === 'decrease' && item.quantity > 1) {
            item.quantity--;
        } else if (action === 'remove' || (action === 'decrease' && item.quantity === 1)) {
            cart = cart.filter(i => i.id !== id);
        }
        
        updateCartDisplay();
        renderCart(); // Re-renderizar modal
    }

    // Actualizar Contador y Mensaje
    function updateCartDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }

    // Mensaje temporal de éxito
    function showTemporaryMessage(message) {
        // En una aplicación real, esto mostraría un mensaje flotante
        console.log(message); 
    }

    // Enviar a WhatsApp
    if (sendWhatsappBtn) {
        sendWhatsappBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Tu lista de compras está vacía.');
                return;
            }

            let message = "¡Hola BHALLEFFORT! Me gustaría cotizar los siguientes productos:\n\n";
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                message += `* ${item.name} - Cantidad: ${item.quantity} - Precio unitario: $${item.price.toFixed(2)}\n`;
            });

            message += `\n*TOTAL ESTIMADO*: $${total.toFixed(2)}\n`;
            message += "\n*Por favor, confírmenme la disponibilidad y el precio final incluyendo envío.*";

            const whatsappNumber = '593960503674'; 
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappURL, '_blank');
            cartModal.style.display = 'none'; // Cerrar modal al enviar
        });
    }
});


// ===========================================
// 2. LÓGICA DE AUTOCOMPLETAR
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('autocomplete-results');

    // Lista de productos para la búsqueda (MANTENER ACTUALIZADA)
    const products = [
        // Categorías
        { name: "Ropa", url: "ropa.html", category: "Categoría" },
        { name: "Juguetes", url: "juguetes.html", category: "Categoría" },
        { name: "Suministros Hogar", url: "hogar.html", category: "Categoría" },

        // Promociones
        { name: "Ofertas", url: "promociones.html", category: "Promoción" },
        { name: "Camiseta Edición Limitada", url: "promociones.html", category: "Ropa/Oferta" },
        { name: "Bloques de Construcción Gigantes", url: "promociones.html", category: "Juguete/Oferta" },

        // Productos de Ropa
        { name: "Pantalón Deportivo Morado", url: "ropa.html", category: "Ropa" },

        // Productos de Hogar
        { name: "Set de Utensilios de Cocina Deluxe", url: "hogar.html", category: "Hogar" },
        { name: "Silla Ergonómica Plegable", url: "hogar.html", category: "Hogar" },
        
        // Información
        { name: "Quienes Somos", url: "quienes-somos.html", category: "Información" },
        { name: "Politicas de Venta", url: "politicas.html", category: "Información" },
        { name: "Contacto y WhatsApp", url: "contacto.html", category: "Información" },
    ];


    // Función para mostrar resultados
    function showResults(query) {
        resultsContainer.innerHTML = '';
        
        if (query.length < 2) {
            return;
        }

        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8); // Mostrar solo las primeras 8 sugerencias

        if (filteredProducts.length === 0) {
            resultsContainer.innerHTML = '<div style="padding: 10px; color: #888; font-size: 14px;">No hay resultados.</div>';
            return;
        }

        filteredProducts.forEach(product => {
            const matchIndex = product.name.toLowerCase().indexOf(query.toLowerCase());
            const beforeMatch = product.name.substring(0, matchIndex);
            const match = product.name.substring(matchIndex, matchIndex + query.length);
            const afterMatch = product.name.substring(matchIndex + query.length);
            
            const resultElement = document.createElement('a');
            resultElement.href = product.url;
            resultElement.innerHTML = `${beforeMatch}<span class="highlight">${match}</span>${afterMatch} <span style="font-style: italic; color: #666; font-size: 12px;">(${product.category})</span>`;
            
            resultsContainer.appendChild(resultElement);
        });
    }

    // Evento al escribir en el input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            showResults(e.target.value.trim());
        });

        // Ocultar resultados al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (resultsContainer && !e.target.closest('.autocomplete-container')) {
                resultsContainer.innerHTML = '';
            }
        });
    }
});


// ===========================================
// 3. LÓGICA DEL MENÚ MÓVIL (si aplica)
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav ul');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            // Esto es solo un ejemplo, ajusta a tu implementación de menú móvil si es diferente
            mainNav.classList.toggle('active');
        });
    }
});
