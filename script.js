(() => {
    const STORAGE_KEY = "dave-williams-cart";
    const WHATSAPP_NUMBER = "2348034216803";
    const cart = document.querySelector("#shopping-cart");
    const overlay = document.querySelector("#cart-overlay");
    const toggleButton = document.querySelector("#cart-toggle");
    const closeButton = document.querySelector("#cart-close");
    const itemsContainer = document.querySelector("#cart-items");
    const countElement = document.querySelector("#cart-count");
    const totalElement = document.querySelector("#cart-total");
    const checkoutButton = document.querySelector("#checkout-btn");

    if (!cart || !overlay || !toggleButton || !closeButton || !itemsContainer ||
        !countElement || !totalElement || !checkoutButton) return;

    const formatPrice = (price) => `₦${price.toLocaleString("en-NG")}`;
    const loadCart = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (!Array.isArray(saved)) return [];
            return saved.filter((item) => item && typeof item.name === "string" &&
                Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0);
        } catch {
            return [];
        }
    };
    let cartItems = loadCart();

    const saveCart = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        } catch {
            // Keep the in-memory cart working if browser storage is unavailable.
        }
    };
    const openCart = () => {
        cart.classList.add("open");
        overlay.classList.add("open");
        document.body.classList.add("cart-open");
        cart.setAttribute("aria-hidden", "false");
        toggleButton.setAttribute("aria-expanded", "true");
        closeButton.focus();
    };
    const closeCart = () => {
        cart.classList.remove("open");
        overlay.classList.remove("open");
        document.body.classList.remove("cart-open");
        cart.setAttribute("aria-hidden", "true");
        toggleButton.setAttribute("aria-expanded", "false");
    };
    const createItemElement = (item, index) => {
        const row = document.createElement("div");
        row.className = "cart-item";
        const image = document.createElement("img");
        image.src = item.image;
        image.alt = item.name;
        const info = document.createElement("div");
        info.className = "cart-info";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const price = document.createElement("p");
        price.textContent = formatPrice(item.price);
        const quantity = document.createElement("div");
        quantity.className = "quantity";
        quantity.innerHTML = `<button type="button" data-action="decrease" data-index="${index}" aria-label="Decrease ${item.name} quantity">−</button><span aria-label="Quantity">${item.quantity}</span><button type="button" data-action="increase" data-index="${index}" aria-label="Increase ${item.name} quantity">+</button><button type="button" class="remove" data-action="remove" data-index="${index}">Remove</button>`;
        info.append(name, price, quantity);
        row.append(image, info);
        return row;
    };
    const renderCart = () => {
        itemsContainer.replaceChildren();
        if (cartItems.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "Your cart is empty.";
            itemsContainer.append(empty);
        } else {
            cartItems.forEach((item, index) => itemsContainer.append(createItemElement(item, index)));
        }
        const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        countElement.textContent = itemCount;
        totalElement.textContent = formatPrice(total);
        checkoutButton.classList.toggle("disabled", itemCount === 0);
        checkoutButton.setAttribute("aria-disabled", String(itemCount === 0));
        checkoutButton.removeAttribute("href");
        if (itemCount > 0) {
            const lines = cartItems.map((item) => `• ${item.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`);
            const message = ["Hello Dave Williams Collections, I would like to order:", "", ...lines, "", `Total: ${formatPrice(total)}`].join("\n");
            checkoutButton.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        }
        saveCart();
    };

    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", () => {
            const name = button.dataset.name;
            const price = Number(button.dataset.price);
            const image = button.dataset.image || "";
            if (!name || !Number.isFinite(price) || price <= 0) return;
            const existing = cartItems.find((item) => item.name === name);
            if (existing) existing.quantity += 1;
            else cartItems.push({ name, price, image, quantity: 1 });
            renderCart();
            openCart();
        });
    });
    itemsContainer.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const index = Number(button.dataset.index);
        const item = cartItems[index];
        if (!item) return;
        if (button.dataset.action === "increase") item.quantity += 1;
        if (button.dataset.action === "decrease") item.quantity -= 1;
        if (button.dataset.action === "remove" || item.quantity <= 0) cartItems.splice(index, 1);
        renderCart();
    });
    toggleButton.addEventListener("click", openCart);
    closeButton.addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && cart.classList.contains("open")) closeCart();
    });
    renderCart();
})();
