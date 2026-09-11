const SUPABASE_URL="https://uryjmibcdfjfxoljrigt.supabase.co";
const KEY="sb_publishable_uYbJw0ARCCkCpQ9QB6FxaQ_JrIxtOOp";

let products=[],activeCategory="all",searchTerm="";
let cart=JSON.parse(localStorage.getItem("br_cart")||"[]");
let wishlist=JSON.parse(localStorage.getItem("br_wishlist")||"[]");

const ADMIN_UID="05eb5a7a-9bdd-4870-9245-5ac1ce296147";

const cats=[
 ["mobiles","Mobiles","📱"],
 ["electronics","Electronics","💻"],
 ["fashion","Fashion","👕"],
 ["home","Home","🛋️"],
 ["beauty","Beauty","💄"],
 ["grocery","Grocery","🛒"],
 ["sports","Sports","⚽"],
 ["toys-games","Toys","🧸"],
 ["books","Books","📘"],
 ["other","More","▦"]
];

function norm(x){
 x=String(x||"").toLowerCase().trim();
 return ({
  mobile:"mobiles",
  clothing:"fashion",
  toys:"toys-games",
  "toys & games":"toys-games",
  accessories:"other"
 })[x]||x||"other";
}

function esc(x){
 return String(x??"").replace(/[&<>"']/g,m=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  '"':"&quot;",
  "'":"&#039;"
 }[m]));
}

function rs(){
 let e=document.getElementById("categoryGrid");
 if(e){
  e.innerHTML=cats.map(c=>`
   <button class="category" onclick="filterCategory('${c[0]}')">
    <span class="cat-icon">${c[2]}</span>
    <span>${c[1]}</span>
   </button>
  `).join("");
 }
}

function render(){
 let g=document.getElementById("productGrid");
 let s=document.getElementById("connectionState");

 if(!g)return;

 let a=products.filter(p=>
  (activeCategory=="all"||norm(p.category)==activeCategory)&&
  (!searchTerm||
   [p.product_name,p.description,p.category]
   .join(" ")
   .toLowerCase()
   .includes(searchTerm))
 );

 if(s)s.classList.remove("show");

 if(!a.length){
  g.innerHTML=`
   <div style="grid-column:1/-1;text-align:center;padding:30px;color:#667085">
    Abhi koi product available nahi hai.
   </div>`;
  return;
 }

 g.innerHTML=a.map(p=>`
  <article class="product-card">

   <div class="product-image">
    <img
     src="${esc(p.image_url||"https://placehold.co/600x500?text=Product")}"
     alt="${esc(p.product_name)}"
    >

    <button
     class="wish"
     onclick="toggleWish('${esc(p.id)}')">
     ${wishlist.includes(String(p.id))?"♥":"♡"}
    </button>
   </div>

   <div class="product-info">

    <div class="product-name">
     ${esc(p.product_name)}
    </div>

    <div class="rating">
     <b>★</b> 4.3
    </div>

    <div class="price-row">
     <span class="price">
      ₹${Number(p.price||0).toLocaleString("en-IN")}
     </span>
    </div>

    <div class="stock">
     ${Number(p.stock||0)>0?"In Stock":"Out of Stock"}
    </div>

    <button
     class="add-btn"
     ${Number(p.stock||0)<=0?"disabled":""}
     onclick="addToCart('${esc(p.id)}')">
     🛒 Add to Cart
    </button>

   </div>

  </article>
 `).join("");
}

async function loadProducts(){

 let s=document.getElementById("connectionState");

 if(s){
  s.textContent="Products load ho rahe hain...";
  s.classList.add("show");
 }

 try{

  let r=await fetch(
   SUPABASE_URL+
   "/rest/v1/products?select=id,barcode,product_name,description,image_url,category,price,stock&order=id.desc",
   {
    headers:{
     apikey:KEY,
     Authorization:"Bearer "+KEY,
     Accept:"application/json"
    }
   }
  );

  if(!r.ok)throw Error("HTTP "+r.status);

  products=await r.json();

  render();

 }catch(e){

  console.error(e);

  if(s){
   s.textContent=
    "Products load nahi ho pa rahe. Supabase Products ki Read Policy check karein.";
   s.classList.add("show");
  }

 }
}

function filterCategory(c){

 activeCategory=norm(c);

 document.querySelectorAll(".filter")
 .forEach(x=>
  x.classList.toggle(
   "active",
   x.dataset.category==activeCategory
  )
 );

 render();

 document.getElementById("products")
 ?.scrollIntoView({behavior:"smooth"});
}

function setSearch(v){

 searchTerm=String(v||"")
 .toLowerCase()
 .trim();

 let d=document.getElementById("desktopSearch");
 let m=document.getElementById("mobileSearch");

 if(d)d.value=v;
 if(m)m.value=v;

 render();
}

function clearFilters(){

 activeCategory="all";

 setSearch("");

 document.querySelectorAll(".filter")
 .forEach(x=>
  x.classList.toggle(
   "active",
   x.dataset.category=="all"
  )
 );
}

function scrollToProducts(){
 document.getElementById("products")
 ?.scrollIntoView({behavior:"smooth"});
}

function showAllCategories(){
 document.getElementById("categories")
 ?.scrollIntoView({behavior:"smooth"});
}

function toggleWish(id){

 id=String(id);

 wishlist=wishlist.includes(id)
  ?wishlist.filter(x=>x!=id)
  :[...wishlist,id];

 localStorage.setItem(
  "br_wishlist",
  JSON.stringify(wishlist)
 );

 render();
 badges();
}

function addToCart(id){

 let p=products.find(
  x=>String(x.id)==String(id)
 );

 if(!p)return;

 let x=cart.find(
  x=>String(x.id)==String(id)
 );

 if(x){
  x.qty++;
 }else{
  cart.push({
   id:p.id,
   name:p.product_name,
   price:Number(p.price||0),
   image:p.image_url,
   qty:1
  });
 }

 localStorage.setItem(
  "br_cart",
  JSON.stringify(cart)
 );

 badges();
}

function badges(){

 let n=cart.reduce(
  (s,x)=>s+Number(x.qty||0),
  0
 );

 ["cartBadge","bottomCartBadge"]
 .forEach(id=>{
  let e=document.getElementById(id);
  if(e)e.textContent=n;
 });
}

/* =========================
   CART SYSTEM
========================= */

function openCart(){

  const modal = document.getElementById("cartModal");

  if(!modal) return;

  modal.classList.remove("hidden");

  renderCart();

}


function closeCart(){

  const modal = document.getElementById("cartModal");

  if(!modal) return;

  modal.classList.add("hidden");

}


function renderCart(){

  const box = document.getElementById("cartItems");
  const totalBox = document.getElementById("cartTotal");

  if(!box || !totalBox) return;


  if(!cart.length){

    box.innerHTML = `
      <div style="
        text-align:center;
        padding:30px 10px;
        color:#667085;
      ">
        <div style="font-size:45px;">🛒</div>
        <h3>Cart khali hai</h3>
        <p>Product add karke yahan dekhiye.</p>
      </div>
    `;

    totalBox.textContent = "0";

    return;
  }


  box.innerHTML = cart.map((item,index)=>`

    <div class="cart-row">

      <div style="
        display:flex;
        align-items:center;
        gap:10px;
        flex:1;
      ">

        ${
          item.image
          ?
          `<img
             src="${esc(item.image)}"
             style="
               width:55px;
               height:55px;
               object-fit:cover;
               border-radius:10px;
               border:1px solid #e1eaf5;
             "
           >`
          :
          `<div style="font-size:35px;">📦</div>`
        }

        <div>

          <strong>
            ${esc(item.name)}
          </strong>

          <div style="
            color:#667085;
            font-size:13px;
            margin-top:4px;
          ">
            ₹${Number(item.price).toLocaleString("en-IN")}
            × ${item.qty}
          </div>

        </div>

      </div>


      <div style="text-align:right;">

        <strong>
          ₹${(
            Number(item.price) *
            Number(item.qty)
          ).toLocaleString("en-IN")}
        </strong>

        <br>

        <button
          onclick="removeFromCart(${index})"
          style="
            border:0;
            background:#ffe9e7;
            color:#d92d20;
            border-radius:8px;
            padding:5px 9px;
            margin-top:5px;
            cursor:pointer;
          "
        >
          Remove
        </button>

      </div>

    </div>

  `).join("");


  const total = cart.reduce(
    (sum,item)=>
      sum +
      Number(item.price || 0) *
      Number(item.qty || 0),
    0
  );


  totalBox.textContent =
    total.toLocaleString("en-IN");

}


function removeFromCart(index){

  if(index < 0 || index >= cart.length) return;

  cart.splice(index,1);

  localStorage.setItem(
    "br_cart",
    JSON.stringify(cart)
  );

  badges();

  renderCart();

}


function clearCart(){

  cart=[];

  localStorage.setItem(
    "br_cart",
    "[]"
  );

  badges();

  renderCart();

}

function goAccount(){
 alert("Account login system agle step mein connect hoga.");
}

function showOrderMessage(){
 alert("Orders system agle step mein connect hoga.");
}

function closeDrawer(){
 document.getElementById("drawer")
 ?.classList.remove("open");
}


/* =========================
   ADMIN SYSTEM
========================= */

function adminPanel(){

 closeDrawer();

 document.getElementById("brAdminPanel")?.remove();

 const d=document.createElement("div");

 d.id="brAdminPanel";

 d.innerHTML=`

 <div style="
 position:fixed;
 inset:0;
 background:#f7f8fa;
 z-index:99999;
 overflow:auto;
 font-family:Arial,sans-serif;
 ">

  <div style="
   background:#fff;
   border-bottom:1px solid #ddd;
   padding:16px;
   display:flex;
   gap:12px;
   align-items:center;
   position:sticky;
   top:0;
  ">

   <button
    id="adminBack"
    style="
     padding:10px 14px;
     border:0;
     border-radius:10px;
     font-size:20px;
    ">
    ←
   </button>

   <div>
    <b style="font-size:20px">
     ⚙️ BR Digital Admin
    </b>

    <div style="
     color:#667085;
     font-size:13px;
     margin-top:3px;
    ">
     Marketplace Control Panel
    </div>
   </div>

  </div>


  <div
   id="adminBody"
   style="
    max-width:900px;
    margin:auto;
    padding:20px;
   "
  >

   <div style="
    background:#fff;
    padding:20px;
    border-radius:16px;
    box-shadow:0 2px 12px #00000010;
   ">

    <h2>Admin Login</h2>

    <p style="color:#667085">
     Supabase Admin account se login karein.
    </p>

    <input
     id="adminEmail"
     type="email"
     placeholder="Admin Email"
     style="
      width:100%;
      box-sizing:border-box;
      padding:14px;
      margin:8px 0;
      border:1px solid #ddd;
      border-radius:10px;
     "
    >

    <input
     id="adminPassword"
     type="password"
     placeholder="Password"
     style="
      width:100%;
      box-sizing:border-box;
      padding:14px;
      margin:8px 0;
      border:1px solid #ddd;
      border-radius:10px;
     "
    >

    <button
     id="adminLogin"
     style="
      width:100%;
      padding:14px;
      border:0;
      border-radius:10px;
      background:#ff7900;
      color:#fff;
      font-weight:bold;
      font-size:16px;
     "
    >
     Login to Admin
    </button>

    <div
     id="adminMsg"
     style="
      margin-top:12px;
      color:#d92d20;
     "
    ></div>

   </div>

  </div>

 </div>
 `;

 document.body.appendChild(d);

 document.getElementById("adminBack").onclick=()=>{
  d.remove();
 };

 document.getElementById("adminLogin").onclick=
  adminLogin;
}


async function adminLogin(){

 const email=
  document.getElementById("adminEmail")
  .value.trim();

 const password=
  document.getElementById("adminPassword")
  .value;

 const msg=
  document.getElementById("adminMsg");

 if(!email||!password){

  msg.textContent=
   "Email aur password dono bhariye.";

  return;
 }

 msg.textContent=
  "Login ho raha hai...";

 try{

  const r=await fetch(
   SUPABASE_URL+
   "/auth/v1/token?grant_type=password",
   {
    method:"POST",

    headers:{
     "Content-Type":"application/json",
     apikey:KEY
    },

    body:JSON.stringify({
     email:email,
     password:password
    })
   }
  );

  const data=await r.json();

  if(!r.ok){

   throw Error(
    data.error_description||
    data.msg||
    "Login failed"
   );

  }

  const uid=data.user?.id;

  if(uid!==ADMIN_UID){

   throw Error(
    "Ye account Admin nahi hai."
   );

  }

  const pr=await fetch(
   SUPABASE_URL+
   "/rest/v1/admin_permissions?admin_id=eq."+
   encodeURIComponent(ADMIN_UID)+
   "&select=*",
   {
    headers:{
     apikey:KEY,
     Authorization:"Bearer "+data.access_token,
     Accept:"application/json"
    }
   }
  );

  const permissions=await pr.json();

  if(!pr.ok){

   throw Error(
    "Admin permissions read nahi ho pa rahi."
   );

  }

  if(!permissions.length){

   throw Error(
    "Is Admin UID ke liye permissions row nahi mili."
   );

  }

  showAdminDashboard(
   permissions[0]
  );

 }catch(e){

  console.error(e);

  msg.textContent=e.message;

 }
}


function showAdminDashboard(p){

 const body=
  document.getElementById("adminBody");

 if(!body)return;

 const items=[
  ["🏪","Sellers","manage_sellers"],
  ["📦","Products","manage_products"],
  ["🛒","Orders","manage_orders"],
  ["💳","Payments","manage_payment"],
  ["🔄","Returns","manage_returns"],
  ["🚚","Couriers","manage_couriers"],
  ["🛵","Delivery","manage_delivery"],
  ["👥","Users","manage_users"]
 ];

 body.innerHTML=`

 <div style="
  background:linear-gradient(135deg,#ff5a00,#ff9d00);
  color:#fff;
  border-radius:18px;
  padding:22px;
 ">

  <div style="font-size:13px">
   BR Digital Marketplace
  </div>

  <h1 style="margin:7px 0">
   Admin Dashboard
  </h1>

  <div>
   Admin access verified ✅
  </div>

 </div>


 <div style="
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
  margin-top:18px;
 ">

 ${items.map(x=>`

  <div style="
   background:#fff;
   border-radius:16px;
   padding:18px;
   box-shadow:0 2px 10px #00000008;
  ">

   <div style="font-size:28px">
    ${x[0]}
   </div>

   <b style="font-size:18px">
    ${x[1]}
   </b>

   <div style="
    margin-top:6px;
    color:${p[x[2]]===true
      ?" #039855"
      :"#98a2b3"};
   ">
    ${p[x[2]]===true
      ?"Permission ON"
      :"Permission OFF"}
   </div>

  </div>

 `).join("")}

 </div>

 `;

}


/* =========================
   ADMIN BUTTON
========================= */

function bindAdminButton(){

 [
  ...document.querySelectorAll(
   "a,button,[role='button']"
  )
 ]
 .forEach(el=>{

  let t=
   (el.textContent||"")
   .trim()
   .toLowerCase();

  if(
   t==="admin"||
   t==="⚙️ admin"||
   t.endsWith("admin")
  ){

   el.addEventListener(
    "click",
    function(e){

     e.preventDefault();
     e.stopPropagation();

     adminPanel();

    },
    true
   );

  }

 });

}


/* =========================
   START
========================= */

document.addEventListener(
 "DOMContentLoaded",
 ()=>{

  rs();

  badges();

  loadProducts();

  document
  .querySelectorAll(".filter")
  .forEach(b=>
   b.addEventListener(
    "click",
    ()=>filterCategory(
     b.dataset.category
    )
   )
  );

  document
  .getElementById("desktopSearch")
  ?.addEventListener(
   "input",
   e=>setSearch(e.target.value)
  );

  document
  .getElementById("mobileSearch")
  ?.addEventListener(
   "input",
   e=>setSearch(e.target.value)
  );

  document
  .getElementById("menuBtn")
  ?.addEventListener(
   "click",
   ()=>{
    document
    .getElementById("drawer")
    ?.classList.add("open");
   }
  );

  bindAdminButton();

 }
);
