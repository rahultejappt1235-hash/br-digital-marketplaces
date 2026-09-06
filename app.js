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
