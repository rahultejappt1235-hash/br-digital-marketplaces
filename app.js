const SUPABASE_URL="https://uryjmibcdfjfxoljrigt.supabase.co;
const KEY="sb_publishable_uYbJw0ARCCkCpQ9QB6FxaQ_JrIxtOOp";
let products=[],activeCategory="all",searchTerm="";
let cart=JSON.parse(localStorage.getItem("br_cart")||"[]");
let wishlist=JSON.parse(localStorage.getItem("br_wishlist")||"[]");

const cats=[["mobiles","Mobiles","📱"],["electronics","Electronics","💻"],["fashion","Fashion","👕"],["home","Home","🛋️"],["beauty","Beauty","💄"],["grocery","Grocery","🛒"],["sports","Sports","⚽"],["toys-games","Toys","🧸"],["books","Books","📘"],["other","More","▦"]];

function norm(x){x=String(x||"").toLowerCase().trim();return ({mobile:"mobiles",clothing:"fashion",toys:"toys-games","toys & games":"toys-games",accessories:"other"})[x]||x||"other"}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function rs(){let e=document.getElementById("categoryGrid");if(e)e.innerHTML=cats.map(c=>`<button class="category" onclick="filterCategory('${c[0]}')"><span class="cat-icon">${c[2]}</span><span>${c[1]}</span></button>`).join("")}
function render(){let g=document.getElementById("productGrid"),s=document.getElementById("connectionState");if(!g)return;
 let a=products.filter(p=>(activeCategory=="all"||norm(p.category)==activeCategory)&&(!searchTerm||[p.product_name,p.description,p.category].join(" ").toLowerCase().includes(searchTerm)));
 if(s)s.classList.remove("show");
 if(!a.length){g.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:30px;color:#667085">Abhi koi product available nahi hai.</div>';return}
 g.innerHTML=a.map(p=>`<article class="product-card"><div class="product-image"><img src="${esc(p.image_url||"https://placehold.co/600x500?text=Product")}" alt="${esc(p.product_name)}"><button class="wish" onclick="toggleWish('${esc(p.id)}')">${wishlist.includes(String(p.id))?"♥":"♡"}</button></div><div class="product-info"><div class="product-name">${esc(p.product_name)}</div><div class="rating"><b>★</b> 4.3</div><div class="price-row"><span class="price">₹${Number(p.price||0).toLocaleString("en-IN")}</span></div><div class="stock">${Number(p.stock||0)>0?"In Stock":"Out of Stock"}</div><button class="add-btn" ${Number(p.stock||0)<=0?"disabled":""} onclick="addToCart('${esc(p.id)}')">🛒 Add to Cart</button></div></article>`).join("")}

async function loadProducts(){let s=document.getElementById("connectionState");if(s){s.textContent="Products load ho rahe hain...";s.classList.add("show")}
 try{let r=await fetch(SUPABASE_URL+"/rest/v1/products?select=id,barcode,product_name,description,image_url,category,price,stock&order=id.desc",{headers:{apikey:KEY,Authorization:"Bearer "+KEY,Accept:"application/json"}});if(!r.ok)throw Error("HTTP "+r.status);products=await r.json();render()}
 catch(e){console.error(e);if(s){s.textContent="Products load nahi ho pa rahe. Supabase Products ki Read Policy check karein.";s.classList.add("show")}}}

function filterCategory(c){activeCategory=norm(c);document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.category==activeCategory));render();document.getElementById("products")?.scrollIntoView({behavior:"smooth"})}
function setSearch(v){searchTerm=String(v||"").toLowerCase().trim();let d=document.getElementById("desktopSearch"),m=document.getElementById("mobileSearch");if(d)d.value=v;if(m)m.value=v;render()}
function clearFilters(){activeCategory="all";setSearch("");document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.category=="all"))}
function scrollToProducts(){document.getElementById("products")?.scrollIntoView({behavior:"smooth"})}
function showAllCategories(){document.getElementById("categories")?.scrollIntoView({behavior:"smooth"})}
function toggleWish(id){id=String(id);wishlist=wishlist.includes(id)?wishlist.filter(x=>x!=id):[...wishlist,id];localStorage.setItem("br_wishlist",JSON.stringify(wishlist));render();badges()}
function addToCart(id){let p=products.find(x=>String(x.id)==String(id));if(!p)return;let x=cart.find(x=>String(x.id)==String(id));if(x)x.qty++;else cart.push({id:p.id,name:p.product_name,price:Number(p.price||0),image:p.image_url,qty:1});localStorage.setItem("br_cart",JSON.stringify(cart));badges()}
function badges(){let n=cart.reduce((s,x)=>s+Number(x.qty||0),0);["cartBadge","bottomCartBadge"].forEach(id=>{let e=document.getElementById(id);if(e)e.textContent=n})}
function openCart(){alert("Cart open ho gaya. Order system agle step mein connect hoga.")}
function closeCart(){}
function goAccount(){alert("Account agle step mein connect hoga.")}
function showOrderMessage(){alert("Orders agle step mein connect hoga.")}
function closeDrawer(){document.getElementById("drawer")?.classList.remove("open")}

document.addEventListener("DOMContentLoaded",()=>{rs();badges();loadProducts();document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>filterCategory(b.dataset.category)));document.getElementById("desktopSearch")?.addEventListener("input",e=>setSearch(e.target.value));document.getElementById("mobileSearch")?.addEventListener("input",e=>setSearch(e.target.value));document.getElementById("menuBtn")?.addEventListener("click",()=>document.getElementById("drawer")?.classList.add("open"))});
