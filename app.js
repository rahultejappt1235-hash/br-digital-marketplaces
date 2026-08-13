const products = [
  { id: 1, name: "Stylish T-Shirt", price: 499, cat: "fashion" },
  { id: 2, name: "Wireless Earbuds", price: 899, cat: "electronics" },
  { id: 3, name: "Kitchen Storage Set", price: 699, cat: "home" },
  { id: 4, name: "Premium Grocery Pack", price: 599, cat: "grocery" },
  { id: 5, name: "Casual Shoes", price: 999, cat: "fashion" },
  { id: 6, name: "Smart Watch", price: 1299, cat: "electronics" }
];

let cart = JSON.parse(localStorage.getItem("brCart") || "[]");

function renderProducts() {
  const search = document.getElementById("search");
  const category = document.getElementById("category");
  const grid = document.getElementById("productGrid");

  if (!search || !category || !grid) return;

  const q = search.value.toLowerCase().trim();
  const c = category.value;

  const list = products.filter(p =>
    (c === "all" || p.cat === c) &&
    p.name.toLowerCase().includes(q)
  );

  if (!list.length) {
    grid.innerHTML = "<p>No products found.</p>";
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-image">
        <div class="product-placeholder">🛍️</div>
      </div>

      <h3>${p.name}</h3>
      <p class="price">₹${p.price}</p>

      <button class="primary" onclick="addToCart(${p.id})">
        🛒 Add to Cart
      </button>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  alert("✅ Product cart mein add ho gaya!");
}

function saveCart() {
  localStorage.setItem("brCart", JSON.stringify(cart));

  const cartBtn = document.querySelector(".cart-btn");
  if (cartBtn) {
    cartBtn.innerHTML = `🛒 Cart ${cart.length}`;
  }
}

function openCart() {
  document.getElementById("cartModal").classList.remove("hidden");
  renderCart();
}

function closeCart() {
  document.getElementById("cartModal").classList.add("hidden");
}

function renderCart() {
  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("cartTotal");

  if (!box || !totalBox) return;

  if (!cart.length) {
    box.innerHTML = "<p>Cart khali hai.</p>";
    totalBox.textContent = "0";
    return;
  }

  box.innerHTML = cart.map((p, i) => `
    <div class="cart-item">
      <strong>${p.name}</strong>
      <span>₹${p.price} × ${p.quantity || 1}</span>
      <button onclick="removeCart(${i})">×</button>
    </div>
  `).join("");

  const total = cart.reduce(
    (sum, p) => sum + p.price * (p.quantity || 1),
    0
  );

  totalBox.textContent = total;
}

function removeCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

async function checkout() {
  if (!cart.length) {
    alert("Cart khali hai.");
    return;
  }

  const name = prompt("Customer ka naam:");
  if (!name) return;

  const phone = prompt("Mobile number:");
  if (!phone) return;

  const address = prompt("Delivery address:");
  if (!address) return;

  try {
    const orders = [];

    for (const item of cart) {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product_id: item.id,
          quantity: item.quantity || 1,
          customer_name: name,
          customer_phone: phone,
          delivery_address: address
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Order place nahi hua.");
      }

      orders.push(data.order);
    }

    alert(
      "✅ COD Order successfully place ho gaya!\n\n" +
      "Customer: " + name + "\n" +
      "Mobile: " + phone + "\n" +
      "Address: " + address + "\n\n" +
      "Order ID: " +
      orders.map(o => o.order_id || o.id).join(", ")
    );

    cart = [];
    saveCart();
    closeCart();
    renderProducts();

  } catch (error) {
    alert("❌ Order Error: " + error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  saveCart();
});
