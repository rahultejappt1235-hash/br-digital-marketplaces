const SUPABASE_URL =
  "https://uryjmibcdfjfxolrijgt.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_uYbJw0ARCCkCpQ9QB6FxaQ_JrIxtOOp";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ==========================================
// BR DIGITAL MARKETPLACE
// Frontend Demo - No Supabase Required
// ==========================================

let products = [
  {
    id: 1,
    product_name: "Men's Premium T-Shirt",
    price: 499,
    stock: 20,
    category: "fashion",
    image_url: "https://via.placeholder.com/500x400?text=Premium+T-Shirt"
  },
  {
    id: 2,
    product_name: "Smart Watch",
    price: 999,
    stock: 15,
    category: "electronics",
    image_url: "https://via.placeholder.com/500x400?text=Smart+Watch"
  },
  {
    id: 3,
    product_name: "Sports Shoes",
    price: 799,
    stock: 12,
    category: "fashion",
    image_url: "https://via.placeholder.com/500x400?text=Sports+Shoes"
  },
  {
    id: 4,
    product_name: "Wireless Earbuds",
    price: 699,
    stock: 25,
    category: "electronics",
    image_url: "https://via.placeholder.com/500x400?text=Wireless+Earbuds"
  },
  {
    id: 5,
    product_name: "Ladies Handbag",
    price: 599,
    stock: 10,
    category: "fashion",
    image_url: "https://via.placeholder.com/500x400?text=Ladies+Handbag"
  },
  {
    id: 6,
    product_name: "Mobile Phone Stand",
    price: 199,
    stock: 30,
    category: "accessories",
    image_url: "https://via.placeholder.com/500x400?text=Phone+Stand"
  }
];

let cart = JSON.parse(localStorage.getItem("br_cart") || "[]");


// ==========================================
// RENDER PRODUCTS
// ==========================================

function renderProducts() {

  const grid = document.getElementById("productGrid");

  if (!grid) {
    console.log("productGrid not found");
    return;
  }

  const searchBox = document.getElementById("search");
  const categoryBox = document.getElementById("category");

  const search = searchBox
    ? String(searchBox.value || "").toLowerCase().trim()
    : "";

  const category = categoryBox
    ? String(categoryBox.value || "all").toLowerCase().trim()
    : "all";

  const filtered = products.filter((p) => {

    const name = String(p.product_name || "").toLowerCase();

    const productCategory =
      String(p.category || "").toLowerCase().trim();

    const matchSearch = name.includes(search);

    const matchCategory =
      category === "all" ||
      category === "" ||
      productCategory === category;

    return matchSearch && matchCategory;
  });


  if (filtered.length === 0) {

    grid.innerHTML = `
      <div style="
        padding:30px;
        text-align:center;
        width:100%;
        color:#555;
      ">
        <h3>😔 Product nahi mila</h3>
        <p>Dusra product search karke dekhein.</p>
      </div>
    `;

    return;
  }


  grid.innerHTML = filtered.map((p) => {

    const stock = Number(p.stock || 0);
    const price = Number(p.price || 0);

    return `
      <div class="product-card">

        <div class="product-image">
          <img
            src="${p.image_url}"
            alt="${p.product_name}"
            onerror="this.src='https://via.placeholder.com/500x400?text=Product'"
          >
        </div>

        <h3>${p.product_name}</h3>

        <p class="price">
          ₹${price}
        </p>

        <p class="muted">
          Stock: ${stock}
        </p>

        <button
          class="primary"
          onclick="addToCart(${p.id})"
          ${stock <= 0 ? "disabled" : ""}
        >
          🛒 Add to Cart
        </button>

      </div>
    `;

  }).join("");
}


// ==========================================
// ADD TO CART
// ==========================================

function addToCart(id) {

  const product = products.find((p) => p.id === id);

  if (!product) return;

  const existing = cart.find((p) => p.id === id);

  if (existing) {

    if (existing.quantity < product.stock) {
      existing.quantity++;
    } else {
      alert("❌ Itna stock available nahi hai.");
      return;
    }

  } else {

    cart.push({
      ...product,
      quantity: 1
    });

  }

  saveCart();

  updateCartButton();

  alert("✅ Product cart mein add ho gaya!");

}


// ==========================================
// SAVE CART
// ==========================================

function saveCart() {
  localStorage.setItem("br_cart", JSON.stringify(cart));
}


// ==========================================
// CART COUNT
// ==========================================

function updateCartButton() {

  const count = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const buttons = document.querySelectorAll("button");

  buttons.forEach((button) => {

    if (
      button.innerText.includes("Cart") ||
      button.id === "cartButton"
    ) {
      button.innerHTML = `🛒 Cart ${count}`;
    }

  });
}


// ==========================================
// OPEN CART
// ==========================================

function openCart() {

  const old = document.getElementById("cartModal");

  if (old) old.remove();

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );


  let itemsHTML = "";

  if (cart.length === 0) {

    itemsHTML = `
      <div style="text-align:center;padding:30px">
        <h3>🛒 Cart khaali hai</h3>
        <p>Pehle koi product cart mein add karein.</p>
      </div>
    `;

  } else {

    itemsHTML = cart.map((item) => {

      return `
        <div style="
          display:flex;
          gap:12px;
          align-items:center;
          padding:12px 0;
          border-bottom:1px solid #ddd;
        ">

          <img
            src="${item.image_url}"
            style="
              width:70px;
              height:60px;
              object-fit:cover;
              border-radius:8px;
            "
          >

          <div style="flex:1">

            <b>${item.product_name}</b>

            <div>
              ₹${item.price} × ${item.quantity}
            </div>

            <div style="margin-top:5px">

              <button
                onclick="changeQuantity(${item.id}, -1)"
                style="padding:5px 10px"
              >
                −
              </button>

              <b style="margin:0 10px">
                ${item.quantity}
              </b>

              <button
                onclick="changeQuantity(${item.id}, 1)"
                style="padding:5px 10px"
              >
                +
              </button>

              <button
                onclick="removeFromCart(${item.id})"
                style="
                  margin-left:10px;
                  padding:5px 8px;
                  color:red;
                "
              >
                🗑️
              </button>

            </div>

          </div>

        </div>
      `;

    }).join("");

  }


  const modal = document.createElement("div");

  modal.id = "cartModal";

  modal.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.6);
    z-index:9999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:15px;
  `;


  modal.innerHTML = `
    <div style="
      background:white;
      width:100%;
      max-width:500px;
      max-height:90vh;
      overflow:auto;
      border-radius:16px;
      padding:20px;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
      ">

        <h2>🛒 Your Cart</h2>

        <button
          onclick="document.getElementById('cartModal').remove()"
          style="
            font-size:24px;
            border:0;
            background:none;
          "
        >
          ✕
        </button>

      </div>

      ${itemsHTML}

      <h2 style="margin-top:20px">
        Total: ₹${total}
      </h2>

      ${
        cart.length > 0
          ? `
            <button
              onclick="showCODForm()"
              style="
                width:100%;
                padding:15px;
                background:#ff7a00;
                color:white;
                border:0;
                border-radius:10px;
                font-size:18px;
                font-weight:bold;
              "
            >
              📦 Cash on Delivery Order
            </button>
          `
          : ""
      }

    </div>
  `;


  document.body.appendChild(modal);

}


// ==========================================
// QUANTITY
// ==========================================

function changeQuantity(id, change) {

  const item = cart.find((p) => p.id === id);

  if (!item) return;

  const product = products.find((p) => p.id === id);

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter((p) => p.id !== id);
  }

  if (
    product &&
    item.quantity > product.stock
  ) {
    item.quantity = product.stock;
    alert("❌ Maximum stock available.");
  }

  saveCart();

  updateCartButton();

  openCart();

}


// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeFromCart(id) {

  cart = cart.filter((p) => p.id !== id);

  saveCart();

  updateCartButton();

  openCart();

}


// ==========================================
// COD FORM
// ==========================================

function showCODForm() {

  const modal = document.getElementById("cartModal");

  if (!modal) return;


  modal.innerHTML = `
    <div style="
      background:white;
      width:100%;
      max-width:500px;
      max-height:90vh;
      overflow:auto;
      border-radius:16px;
      padding:20px;
    ">

      <h2>📦 Cash on Delivery</h2>

      <p>
        Delivery ke liye apni details bharein.
      </p>

      <input
        id="customerName"
        placeholder="👤 Full Name"
        style="
          width:100%;
          padding:14px;
          margin:8px 0;
          box-sizing:border-box;
          border:1px solid #ddd;
          border-radius:8px;
        "
      >

      <input
        id="customerPhone"
        placeholder="📱 Mobile Number"
        type="tel"
        style="
          width:100%;
          padding:14px;
          margin:8px 0;
          box-sizing:border-box;
          border:1px solid #ddd;
          border-radius:8px;
        "
      >

      <textarea
        id="customerAddress"
        placeholder="🏠 Complete Delivery Address"
        rows="4"
        style="
          width:100%;
          padding:14px;
          margin:8px 0;
          box-sizing:border-box;
          border:1px solid #ddd;
          border-radius:8px;
        "
      ></textarea>

      <input
        id="customerPincode"
        placeholder="📍 Pincode"
        type="number"
        style="
          width:100%;
          padding:14px;
          margin:8px 0;
          box-sizing:border-box;
          border:1px solid #ddd;
          border-radius:8px;
        "
      >

      <button
        onclick="placeCODOrder()"
        style="
          width:100%;
          padding:15px;
          margin-top:10px;
          background:#ff7a00;
          color:white;
          border:0;
          border-radius:10px;
          font-size:18px;
          font-weight:bold;
        "
      >
        ✅ Place COD Order
      </button>

      <button
        onclick="openCart()"
        style="
          width:100%;
          padding:12px;
          margin-top:10px;
          background:#eee;
          border:0;
          border-radius:10px;
        "
      >
        ← Back to Cart
      </button>

    </div>
  `;

}


// ==========================================
// PLACE COD ORDER
// ==========================================

function placeCODOrder() {

  const name =
    document.getElementById("customerName").value.trim();

  const phone =
    document.getElementById("customerPhone").value.trim();

  const address =
    document.getElementById("customerAddress").value.trim();

  const pincode =
    document.getElementById("customerPincode").value.trim();


  if (!name || !phone || !address || !pincode) {

    alert("⚠️ Please sabhi details bharein.");

    return;
  }


  if (phone.length < 10) {

    alert("⚠️ Valid mobile number enter karein.");

    return;
  }


  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );


  let message = `🛒 *BR DIGITAL MARKETPLACE - NEW ORDER*

👤 Customer: ${name}
📱 Mobile: ${phone}

🏠 Address:
${address}

📍 Pincode: ${pincode}

📦 Products:
`;


  cart.forEach((item) => {

    message += `
• ${item.product_name}
  Qty: ${item.quantity}
  Price: ₹${item.price}
`;

  });


  message += `
💰 *Total: ₹${total}*

💳 Payment: Cash on Delivery
`;


  // ========================================
  // IMPORTANT:
  // YAHAN APNA WHATSAPP NUMBER DAALEIN
  // Country code ke saath, + nahi
  // Example: 919876543210
  // ========================================

  const whatsappNumber = "919229864665";

const whatsappURL =
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

alert(
  "✅ Order details ready hain. WhatsApp par order bheja ja raha hai."
);

window.location.href = whatsappURL;

cart = [];

saveCart();
updateCartButton();

const modal =
  document.getElementById("cartModal");

if (modal) modal.remove();
}

// ==========================================
// SEARCH
// ==========================================

const searchInput =
  document.getElementById("search");

if (searchInput) {

  searchInput.addEventListener(
    "input",
    renderProducts
  );

}


// ==========================================
// CATEGORY
// ==========================================

const categoryInput =
  document.getElementById("category");

if (categoryInput) {

  categoryInput.addEventListener(
    "change",
    renderProducts
  );

}


// ==========================================
// CART BUTTON
// ==========================================

document.addEventListener("click", function (e) {

  const button = e.target.closest("button");

  if (!button) return;

  if (
    button.id === "cartButton" ||
    button.innerText.includes("Cart")
  ) {

    openCart();

  }

});


// ==========================================
// INITIAL LOAD
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    renderProducts();

    updateCartButton();

  }
);


// Also run immediately
renderProducts();
updateCartButton();
