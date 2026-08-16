const SUPABASE_URL =
  "https://uryjmibcdfjfxolrijgt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_uYbJw0ARCCkCpQ9QB6FxaQ_JrIxtOOp";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

let products = [];
let cart = [];
async function testSupabase() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Products?select=*`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      }
    );

    const text = await response.text();

    console.log("SUPABASE STATUS:", response.status);
    console.log("SUPABASE RESPONSE:", text);

  } catch (error) {
    console.error("SUPABASE FETCH TEST ERROR:", error);
  }
}

testSupabase();
try {
  cart = JSON.parse(localStorage.getItem("brCart") || "[]");
} catch (e) {
  cart = [];
  localStorage.removeItem("brCart");
}

if (!Array.isArray(cart)) {
  cart = [];
}

cart = cart.map(item => ({
  ...item,
  quantity: Number(item.quantity) || 1,
  price: Number(item.price) || 0
}));


async function loadProducts() {
  console.log("Loading products...");

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/Products?select=*`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        }
      }
    );

    const data = await response.json();

    console.log("SUPABASE STATUS:", response.status);
    console.log("SUPABASE DATA:", data);

    if (!response.ok) {
      throw new Error(data.message || data.error || "Supabase request failed");
    }

    products = (data || []).map(p => ({
      ...p,

      image_url: p.image_url ?? p.Image_url ?? "",
      category: p.category ?? p.Category ?? "",
      price: Number(p.price ?? p.Price) || 0,
      stock: Number(p.stock ?? p.Stock) || 0,
      product_name: p.product_name ?? p.Product_name ?? ""
    }));

    console.log("FINAL PRODUCTS:", products);

    renderProducts();

  } catch (error) {
    console.error("SUPABASE ERROR:", error);

    document.getElementById("productGrid").innerHTML = `
      <p style="color:red;">
        Products load nahi ho paye.<br>
        Error: ${error.message}
      </p>
    `;
  }
}


  

  

  

function renderProducts() {
  const search =
    document.getElementById("search").value.toLowerCase();

  const category =
    document.getElementById("category").value;

  const grid = document.getElementById("productGrid");

  const filtered = products.filter((p) => {
  const name = String(p.product_name || "").toLowerCase();

  const matchSearch = name.includes(search);

  const productCategory = String(p.category || "").toLowerCase();

  const matchCategory =
    category === "all" ||
    productCategory === category;

  return matchSearch && matchCategory;
});

  grid.innerHTML = filtered.map((p) => `
    <div class="product-card">
      <div class="product-image">
        <img
          src="${p.image_url || ""}"
          alt="${p.product_name || "Product"}"
        >
      </div>

      <h3>${p.product_name || "Product"}</h3>

      <p class="price">
        ₹${p.price || 0}
      </p>

      <p class="muted">
        Stock: ${p.stock || 0}
      </p>

      <button
        class="primary"
        onclick="addToCart(${p.id})"
        ${p.stock <= 0 ? "disabled" : ""}
      >
        🛒 Add to Cart
      </button>
    </div>
  `).join("");
}

function addToCart(id) {
  const product = products.find((p) => p.id === id);

  if (!product) return;

  const existing = cart.find((p) => p.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.product_name,
      price: Number(product.price || 0),
      image: product.image_url,
      quantity: 1
    });
  }

  localStorage.setItem("brCart", JSON.stringify(cart));

  updateCartCount();

  alert("✅ Product Cart में Add हो गया!");
}

function updateCartCount() {
  const count = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  document.getElementById("cartCount").textContent = count;
}

function openCart() {
  document
    .getElementById("cartModal")
    .classList.remove("hidden");

  const box = document.getElementById("cartItems");

  if (cart.length === 0) {
    box.innerHTML = "<p>Cart khali hai.</p>";
    document.getElementById("cartTotal").textContent = "0";
    return;
  }

  box.innerHTML = cart.map((item) => `
    <div class="cart-row">
      <span>
        ${item.name} × ${item.quantity}
      </span>

      <strong>
        ₹${item.price * item.quantity}
      </strong>
    </div>
  `).join("");

  const total = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  document.getElementById("cartTotal").textContent = total;
}

function closeCart() {
  document
    .getElementById("cartModal")
    .classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  loadProducts();
});
