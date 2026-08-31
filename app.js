const SUPABASE_URL="https://uryjmibcdfjfxolrijgt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_uYbJw0ARCCkCpQ9QB6FxaQ_JrIxtOOp";

const supabaseClient=supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

// ==========================================
// BR DIGITAL MARKETPLACE - V2
// FULL CART SYSTEM
// ==========================================

let products = [
  {
    id: 1,
    product_name: "Men's Premium T-Shirt",
    price: 499,
    old_price: 799,
    category: "fashion",
    stock: 20,
    rating: "4.3",
    reviews: 128,
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600"
  },
  {
    id: 2,
    product_name: "Men's White Sneakers",
    price: 1299,
    old_price: 1999,
    category: "fashion",
    stock: 20,
    rating: "4.5",
    reviews: 96,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
  },
  {
    id: 3,
    product_name: "Noise ColorFit Pro 4",
    price: 2499,
    old_price: 3999,
    category: "electronics",
    stock: 20,
    rating: "4.4",
    reviews: 203,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
  },
  {
    id: 4,
    product_name: "Boat Rockerz 450",
    price: 1599,
    old_price: 2499,
    category: "electronics",
    stock: 20,
    rating: "4.2",
    reviews: 78,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
  },
  {
    id: 5,
    product_name: "Samsung Galaxy M14 5G",
    price: 10999,
    old_price: 13999,
    category: "electronics",
    stock: 20,
    rating: "4.3",
    reviews: 152,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600"
  },
  {
    id: 6,
    product_name: "Redmi Note 13",
    price: 13999,
    old_price: 16999,
    category: "electronics",
    stock: 20,
    rating: "4.4",
    reviews: 178,
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600"
  },
  {
    id: 7,
    product_name: "Ladies Handbag",
    price: 599,
    old_price: 899,
    category: "fashion",
    stock: 20,
    rating: "4.2",
    reviews: 65,
    image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600"
  },
  {
    id: 8,
    product_name: "Mobile Phone Stand",
    price: 199,
    old_price: 299,
    category: "accessories",
    stock: 20,
    rating: "4.1",
    reviews: 54,
    image_url: "https://images.unsplash.com/photo-1601593346740-925612772716?w=600"
  }
];

let cart=JSON.parse(localStorage.getItem("br_cart")||"[]");

// ==========================================
// PRODUCTS
// ==========================================

function renderProducts(){
  const grid=document.getElementById("productGrid");
  if(!grid)return;

  const search=(document.getElementById("search")?.value||"")
    .toLowerCase().trim();

  const category=(document.getElementById("category")?.value||"all")
    .toLowerCase();

  const filtered=products.filter(p =>
    p.product_name.toLowerCase().includes(search) &&
    (category==="all" || p.category===category)
  );

  if(filtered.length===0){
    grid.innerHTML="<p>😔 Product nahi mila</p>";
    return;
  }

  grid.innerHTML=filtered.map(p=>{

    const off=Math.round(
      ((p.old_price-p.price)*100)/p.old_price
    );

    return `
      <article class="product-card">

        <div class="product-image">
          <img
            src="${p.image_url}"
            alt="${p.product_name}"
            onerror="this.src='https://via.placeholder.com/600x500?text=Product'"
          >
        </div>

        <h3>${p.product_name}</h3>

        <p class="rating">
          ⭐ <b>${p.rating}</b> (${p.reviews})
        </p>

        <div class="price-row">
          <span class="price">
            ₹${p.price.toLocaleString("en-IN")}
          </span>

          <span class="old-price">
            ₹${p.old_price.toLocaleString("en-IN")}
          </span>

          <span class="off">
            ${off}% OFF
          </span>
        </div>

        <button
          class="primary"
          onclick="addToCart(${p.id})"
          ${p.stock<=0?"disabled":""}
        >
          🛒 Add to Cart
        </button>

      </article>
    `;

  }).join("");
}

// ==========================================
// CART SAVE
// ==========================================

function saveCart(){
  localStorage.setItem(
    "br_cart",
    JSON.stringify(cart)
  );
}

// ==========================================
// CART COUNT
// ==========================================

function getCartCount(){
  return cart.reduce(
    (total,item)=>total+Number(item.quantity||0),
    0
  );
}

// ==========================================
// CART TOTAL
// ==========================================

function getCartTotal(){
  return cart.reduce(
    (total,item)=>
      total+
      Number(item.price||0)*
      Number(item.quantity||0),
    0
  );
}

// ==========================================
// UPDATE CART BUTTON
// ==========================================

function updateCartButton(){

  const count=getCartCount();

  const cartCount=document.getElementById("cartCount");
  const bottomCartCount=
    document.getElementById("bottomCartCount");

  if(cartCount){
    cartCount.textContent=count;
  }

  if(bottomCartCount){
    bottomCartCount.textContent=count;
  }

  const cartButton=
    document.getElementById("cartButton");

  if(cartButton){
    cartButton.innerHTML=
      `🛒 Cart <span id="cartCount">${count}</span>`;
  }
}

// ==========================================
// ADD TO CART
// ==========================================

function addToCart(id){

  const product=
    products.find(p=>p.id===id);

  if(!product)return;

  const existing=
    cart.find(item=>item.id===id);

  if(existing){

    if(existing.quantity>=product.stock){
      alert("❌ Itna stock available nahi hai.");
      return;
    }

    existing.quantity++;

  }else{

    cart.push({
      ...product,
      quantity:1
    });

  }

  saveCart();
  updateCartButton();

  alert("✅ Product cart mein add ho gaya!");
}

// ==========================================
// CHANGE QUANTITY
// ==========================================

function changeQuantity(id,change){

  const item=
    cart.find(p=>p.id===id);

  if(!item)return;

  const product=
    products.find(p=>p.id===id);

  const newQuantity=
    Number(item.quantity||0)+change;

  if(newQuantity<=0){
    removeFromCart(id);
    return;
  }

  if(product && newQuantity>product.stock){
    alert(
      "❌ Maximum stock available: "+
      product.stock
    );
    return;
  }

  item.quantity=newQuantity;

  saveCart();
  updateCartButton();
  openCart();
}

// ==========================================
// REMOVE PRODUCT
// ==========================================

function removeFromCart(id){

  cart=
    cart.filter(item=>item.id!==id);

  saveCart();
  updateCartButton();
  openCart();
}

// ==========================================
// OPEN CART
// ==========================================

function openCart(){

  const old=
    document.getElementById("cartModal");

  if(old)old.remove();

  const modal=
    document.createElement("div");

  modal.id="cartModal";

  modal.style.cssText=`
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.65);
    z-index:99999;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:15px;
    box-sizing:border-box;
  `;

  const total=getCartTotal();

  let itemsHTML="";

  if(cart.length===0){

    itemsHTML=`
      <div style="
        text-align:center;
        padding:35px 10px;
      ">

        <div style="font-size:55px">
          🛒
        </div>

        <h3>
          आपका Cart खाली है
        </h3>

        <p>
          पहले कोई product Cart में add करें।
        </p>

        <button
          onclick="
            document
              .getElementById('cartModal')
              .remove()
          "
          style="
            padding:12px 20px;
            border:0;
            border-radius:8px;
            background:#ff7a00;
            color:white;
            font-weight:bold;
          "
        >
          Shopping जारी रखें
        </button>

      </div>
    `;

  }else{

    itemsHTML=cart.map(item=>{

      const itemTotal=
        Number(item.price||0)*
        Number(item.quantity||0);

      return `
        <div style="
          display:flex;
          gap:12px;
          align-items:center;
          padding:14px 0;
          border-bottom:1px solid #e5e5e5;
        ">

          <img
            src="${item.image_url}"
            alt="${item.product_name}"
            style="
              width:75px;
              height:65px;
              object-fit:cover;
              border-radius:8px;
              flex-shrink:0;
            "
          >

          <div style="
            flex:1;
            min-width:0;
          ">

            <b>
              ${item.product_name}
            </b>

            <div style="
              font-size:14px;
              color:#555;
              margin-top:5px;
            ">
              ₹${Number(item.price)
                .toLocaleString("en-IN")}
              × ${item.quantity}
            </div>

            <div style="
              font-weight:bold;
              margin-top:4px;
            ">
              ₹${itemTotal
                .toLocaleString("en-IN")}
            </div>

            <div style="margin-top:8px">

              <button
                onclick="changeQuantity(${item.id},-1)"
                style="
                  padding:5px 11px;
                  border:1px solid #ddd;
                  background:#fff;
                  border-radius:5px;
                "
              >
                −
              </button>

              <b style="margin:0 12px">
                ${item.quantity}
              </b>

              <button
                onclick="changeQuantity(${item.id},1)"
                style="
                  padding:5px 11px;
                  border:1px solid #ddd;
                  background:#fff;
                  border-radius:5px;
                "
              >
                +
              </button>

              <button
                onclick="removeFromCart(${item.id})"
                style="
                  margin-left:10px;
                  padding:5px 9px;
                  border:0;
                  background:#ffecec;
                  color:red;
                  border-radius:5px;
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

  modal.innerHTML=`

    <div style="
      background:white;
      width:100%;
      max-width:520px;
      max-height:90vh;
      overflow:auto;
      border-radius:16px;
      padding:20px;
      box-sizing:border-box;
    ">

      <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-bottom:10px;
      ">

        <h2 style="margin:0">
          🛒 आपका Cart
        </h2>

        <button
          onclick="
            document
              .getElementById('cartModal')
              .remove()
          "
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

      ${
        cart.length>0
        ?`

          <div style="
            margin-top:18px;
            padding-top:14px;
            border-top:2px solid #222;
          ">

            <div style="
              display:flex;
              justify-content:space-between;
              font-size:21px;
              font-weight:bold;
            ">

              <span>
                Total
              </span>

              <span>
                ₹${total.toLocaleString("en-IN")}
              </span>

            </div>

            <button
              onclick="checkoutFromCart()"
              style="
                width:100%;
                padding:15px;
                margin-top:15px;
                background:#ff7a00;
                color:white;
                border:0;
                border-radius:10px;
                font-size:18px;
                font-weight:bold;
              "
            >
              📦 Checkout
            </button>

          </div>

        `
        :""
      }

    </div>
  `;

  document.body.appendChild(modal);
}

// ==========================================
// CHECKOUT
// ==========================================

function checkoutFromCart(){

  if(cart.length===0){
    alert("🛒 Cart khaali hai.");
    return;
  }

  alert(
    "✅ Cart ready hai!\n\n"+
    "Agla Step: Checkout + COD Form."
  );
}

// ==========================================
// SEARCH
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  ()=>{

    renderProducts();
    updateCartButton();

    const search=
      document.getElementById("search");

    if(search){
      search.addEventListener(
        "input",
        renderProducts
      );
    }

    const category=
      document.getElementById("category");

    if(category){
      category.addEventListener(
        "change",
        renderProducts
      );
    }

  }
);

// ==========================================
// CART BUTTON
// ==========================================

document.addEventListener(
  "click",
  e=>{

    const button=
      e.target.closest("button");

    if(!button)return;

    if(
      button.id==="cartButton" ||
      button.innerText.includes("Cart")
    ){

      openCart();

    }

  }
);
