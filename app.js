const SUPABASE_URL = "https://urymibcdfjfxolrijgt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uYbJw0ARCCkCpQ9QB6FxaQ_JrIxtOOp";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let products = [];
let activeCategory = "all";
let searchTerm = "";
let cart = JSON.parse(localStorage.getItem("br_cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("br_wishlist") || "[]");

const categories = [
  ["mobiles","Mobiles","📱"],["electronics","Electronics","💻"],["fashion","Fashion","👕"],
  ["home","Home","🛋️"],["beauty","Beauty","💄"],["grocery","Grocery","🛒"],
  ["sports","Sports","⚽"],["toys-games","Toys","🧸"],["books","Books","📘"],["other","More","▦"]
];

function normalizeCategory(v){
  const x=String(v||"").toLowerCase().trim();
  const map={
    mobile:"mobiles",mobiles:"mobiles",electronics:"electronics",
    fashion:"fashion",clothing:"fashion",home:"home",beauty:"beauty",
    grocery:"grocery",sports:"sports","toys & games":"toys-games",
    "toys-games":"toys-games",toys:"toys-games",books:"books",accessories:"other"
  };
  return map[x] || x || "other";
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function money(v){return "₹"+Number(v||0).toLocaleString("en-IN");}
function placeholder(name){return "https://placehold.co/600x500/f3f4f6/111827?text="+encodeURIComponent(name||"Product");}

function renderCategories(){
  const el=document.getElementById("categoryGrid");
  el.innerHTML=categories.map(([value,name,icon])=>`
    <button class="category" onclick="filterCategory('${value}')">
      <span class="cat-icon">${icon}</span><span>${name}</span>
    </button>`).join("");
}

function filteredProducts(){
  return products.filter(p=>{
    const c=normalizeCategory(p.category);
    const hay=[p.product_name,p.description,p.brand,p.category].map(x=>String(x||"").toLowerCase()).join(" ");
    return (activeCategory==="all" || c===activeCategory) && (!searchTerm || hay.includes(searchTerm));
  });
}

function renderProducts(){
  const grid=document.getElementById("productGrid");
  const state=document.getElementById("connectionState");
  const list=filteredProducts();
  state.classList.remove("show");
  if(!list.length){
    grid.innerHTML=`<div style="grid-column:1/-1;padding:30px;text-align:center;color:#667085">Is category/search mein abhi product available nahi hai.</div>`;
    return;
  }
  grid.innerHTML=list.map(p=>{
    const price=Number(p.price||0);
    const old=Number(p.mrp||p.old_price||0);
    const discount=old>price ? Math.round((1-price/old)*100) : 0;
    const liked=wishlist.includes(String(p.id));
    return `<article class="product-card">
      <div class="product-image">
        <img src="${esc(p.image_url||placeholder(p.product_name))}" alt="${esc(p.product_name)}" loading="lazy" onerror="this.src='${placeholder(p.product_name)}'">
        <button class="wish ${liked?"liked":""}" onclick="toggleWish('${esc(p.id)}')" aria-label="Wishlist">${liked?"♥":"♡"}</button>
      </div>
      <div class="product-info">
        <div class="product-name">${esc(p.product_name||"Product")}</div>
        <div class="rating"><b>★</b> ${p.rating ? Number(p.rating).toFixed(1) : "4.3"} ${p.review_count ? "("+esc(p.review_count)+")" : ""}</div>
        <div class="price-row"><span class="price">${money(price)}</span>${old?`<span class="old-price">${money(old)}</span>`:""}${discount?`<span class="discount">${discount}% OFF</span>`:""}</div>
        <div class="stock">${Number(p.stock||0)>0 ? "In Stock" : "Out of Stock"}</div>
        <button class="add-btn" ${Number(p.stock||0)<=0?"disabled":""} onclick="addToCart('${esc(p.id)}')">🛒 Add to Cart</button>
      </div>
    </article>`;
  }).join("");
}

async function loadProducts(){
  const state=document.getElementById("connectionState");
  state.textContent="Products load ho rahe hain...";
  state.classList.add("show");
  try{
    const {data,error}=await supabaseClient.from("products")
      .select("id,barcode,product_name,description,image_url,category,price,stock")
      .order("id",{ascending:false});
    if(error) throw error;
    products=data||[];
    state.classList.remove("show");
    renderProducts();
  }catch(error){
    console.error(error);
    state.textContent="Products abhi load nahi ho pa rahe. Please refresh karke dobara try karein.";
    state.classList.add("show");
    document.getElementById("productGrid").innerHTML="";
  }
}

function setSearch(v){
  searchTerm=String(v||"").toLowerCase().trim();
  document.getElementById("desktopSearch").value=v;
  document.getElementById("mobileSearch").value=v;
  renderProducts();
}
function filterCategory(cat){
  activeCategory=normalizeCategory(cat);
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.category===activeCategory));
  renderProducts();
  document.getElementById("products").scrollIntoView({behavior:"smooth",block:"start"});
}
function clearFilters(){activeCategory="all";searchTerm="";document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b.dataset.category==="all"));setSearch("");}
function showAllCategories(){document.getElementById("categories").scrollIntoView({behavior:"smooth"});}
function scrollToProducts(){document.getElementById("products").scrollIntoView({behavior:"smooth"});}
function toggleWish(id){
  id=String(id);
  wishlist=wishlist.includes(id)?wishlist.filter(x=>x!==id):[...wishlist,id];
  localStorage.setItem("br_wishlist",JSON.stringify(wishlist));
  updateBadges();renderProducts();
}
function addToCart(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p)return;
  const item=cart.find(x=>String(x.id)===String(id));
  if(item)item.qty++;
  else cart.push({id:p.id,name:p.product_name,price:Number(p.price||0),image:p.image_url||placeholder(p.product_name),qty:1});
  saveCart();
}
function saveCart(){localStorage.setItem("br_cart",JSON.stringify(cart));updateBadges();}
function updateBadges(){
  const count=cart.reduce((s,x)=>s+Number(x.qty||0),0);
  document.getElementById("cartBadge").textContent=count;
  document.getElementById("bottomCartBadge").textContent=count;
  document.getElementById("wishBadge").textContent=wishlist.length;
}
function openCart(){renderCart();document.getElementById("cartModal").classList.remove("hidden")}
function closeCart(){document.getElementById("cartModal").classList.add("hidden")}
function renderCart(){
  const box=document.getElementById("cartItems");
  if(!cart.length){box.innerHTML="<p style='text-align:center;color:#667085;padding:30px'>Cart abhi empty hai.</p>";document.getElementById("cartTotal").textContent="0";return;}
  box.innerHTML=cart.map((x,i)=>`<div class="cart-line">
    <img src="${esc(x.image)}" alt="">
    <div><b>${esc(x.name)}</b><div>${money(x.price)}</div>
      <div class="qty"><button onclick="changeQty(${i},-1)">−</button> ${x.qty} <button onclick="changeQty(${i},1)">+</button>
      <button onclick="removeCart(${i})" style="margin-left:8px;border:0;background:none;color:#e11d48">Remove</button></div>
    </div></div>`).join("");
  document.getElementById("cartTotal").textContent=cart.reduce((s,x)=>s+x.price*x.qty,0).toLocaleString("en-IN");
}
function changeQty(i,d){cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);saveCart();renderCart();}
function removeCart(i){cart.splice(i,1);saveCart();renderCart();}
function checkout(){
  if(!cart.length){alert("Cart empty hai.");return;}
  alert("Order page next step mein connect kiya jayega. Cart ka data safe hai.");
}
function goAccount(){alert("Account page next step mein connect kiya jayega.");}
function showOrderMessage(){alert("Orders page next step mein connect kiya jayega.");}
function closeDrawer(){document.getElementById("drawer").classList.remove("open")}

document.getElementById("menuBtn").onclick=()=>document.getElementById("drawer").classList.add("open");
document.getElementById("desktopSearch").addEventListener("input",e=>setSearch(e.target.value));
document.getElementById("mobileSearch").addEventListener("input",e=>setSearch(e.target.value));
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>filterCategory(b.dataset.category)));
renderCategories();updateBadges();loadProducts();
