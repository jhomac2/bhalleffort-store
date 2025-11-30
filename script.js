document.addEventListener('DOMContentLoaded', () => {
    // ======================================================
    // 1. LÓGICA DEL MENÚ MÓVIL Y BUSCADOR
    // ======================================================
    const menuToggle = document.querySelector('.menu-toggle');
    const searchInput = document.getElementById('search-input');
    const productsGrid = document.getElementById('products-grid');
    const productCards = productsGrid ? productsGrid.querySelectorAll('.product-card') : [];

    // Menú Móvil
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('menu-active');
        });
    }

    // Buscador (Filtro) - solo funciona en la página principal
    if (searchInput && productsGrid) {
        searchInput.addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            productCards.forEach(card => {
                const name = card.querySelector('.product-name').textContent.toLowerCase();
                const category = card.dataset.category.toLowerCase();
                
                // Muestra la tarjeta si el término está en el nombre o la categoría
                if (name.includes(searchTerm) || category.includes(searchTerm)) {
                    card.style.display = ''; // Mostrar
                } else {
                    card.style.display = 'none'; // Ocultar
                }
            });
        });
    }

    // ======================================================
    // 2. LÓGICA DEL CARRITO (YA IMPLEMENTADA)
    // ======================================================
    
    // Variables y Selectores
    let cart = []; 
    const cartBadge = document.getElementById('cart-badge');
    const cartIcon = document.getElementById('cart-icon');
    const modal = document.getElementById('cart-modal');
    const closeModalButtons = document.querySelectorAll('.close-button, #close-modal-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const whatsappButton = document.getElementById('send-whatsapp-btn');
    const whatsappNumber = "593960503674"; 

    // --- Funciones del Carrito ---
    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    }

    function addToCart(product) {
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartBadge();
    }

    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 20px;">Tu lista está vacía.</p>';
            cartTotalElement.textContent = '$0.00';
            whatsappButton.disabled = true;
            return;
        }

        whatsappButton.disabled = false;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span class="item-name">${item.name}</span>
                <div class="item-quantity-control">
                    <button data-id="${item.id}" data-action="decrease">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button data-id="${item.id}" data-action="increase">+</button>
                    <span>($${item.price.toFixed(2)})</span>
                </div>
                <span class="item-price-total">$${itemTotal.toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        cartTotalElement.textContent = `$${total.toFixed(2)}`;
    }

    function handleQuantityChange(id, action) {
        const item = cart.find(i => i.id === id);
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== id);
            }
        }
        renderCartItems();
        updateCartBadge();
    }

    // --- Event Listeners del Carrito ---
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const product = {
                id: e.target.dataset.id,
                name: e.target.dataset.name,
                price: parseFloat(e.target.dataset.price),
            };
            addToCart(product);
        });
    });

    cartIcon.addEventListener('click', () => {
        renderCartItems();
        modal.style.display = 'block';
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const id = e.target.dataset.id;
            const action = e.target.dataset.action;
            if (id && action) {
                handleQuantityChange(id, action);
            }
        }
    });

    whatsappButton.addEventListener('click', () => {
        if (cart.length === 0) return;

        let message = "¡Hola BHALLEFFORT! Deseo realizar el siguiente pedido:\n\n";
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `${index + 1}. [${item.name}] - Cant: ${item.quantity} - Total: $${itemTotal.toFixed(2)}\n`;
        });
        
        message += "\n----------------------------------";
        message += `\nTotal estimado: $${total.toFixed(2)}`;
        message += "\n----------------------------------";
        message += "\n*Por favor, confírmenme la disponibilidad y los pasos para la transferencia. ¡Gracias!*";

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        window.open(whatsappUrl, '_blank');
        modal.style.display = 'none';
    });

});
