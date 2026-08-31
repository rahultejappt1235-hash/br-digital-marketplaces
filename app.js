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

let products=[
  ["Men's Premium T-Shirt",499,799,"fashion","Premium+T-Shirt"],
  ["Men's White Sneakers",1299,1999,"fashion","White+Sneakers"],
  ["Noise ColorFit Pro 4",2499,3999,"electronics","Smart+Watch"],
  ["Boat Rockerz 450",1599,2499,"electronics","Headphones"],
  ["Samsung Galaxy M14 5G",10999,13999,"electronics","Samsung+M14"],
  ["Redmi Note 13",13999,16999,"electronics","Redmi+Note+13"],
  ["Ladies Handbag",599,899,"fashion","Handbag"],
  ["Mobile Phone Stand",199,299,"accessories","Phone+Stand"]
].map((x,i)=>({
  id:i+1,
  product_name:x[0],
  price:x[1],
  old_price:x[2],
  category:x[3],
  stock:20,
  rating:(4.1+i%5/10).toFixed(1),
  reviews:50+i*17,
  image_url:"https://via.placeholder.com/600x500?text="+x[4]
}));

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
