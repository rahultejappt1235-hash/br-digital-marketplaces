const products=[
{id:1,name:"Stylish T-Shirt",price:499,cat:"fashion",img:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",seller:"Local Seller"},
{id:2,name:"Wireless Earbuds",price:899,cat:"electronics",img:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=700&q=80",seller:"Tech Seller"},
{id:3,name:"Kitchen Storage Set",price:699,cat:"home",img:"https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80",seller:"Home Seller"},
{id:4,name:"Premium Grocery Pack",price:599,cat:"grocery",img:"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=80",seller:"Bihar Grocery"},
{id:5,name:"Casual Shoes",price:999,cat:"fashion",img:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",seller:"Local Seller"},
{id:6,name:"Smart Watch",price:1299,cat:"electronics",img:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",seller:"Tech Seller"}
];
let cart=JSON.parse(localStorage.getItem("brCart")||"[]");
function renderProducts() {
  const q = document.getElementById("search").value.toLowerCase();
  const c = document.getElementById("category").value;

  const list = products.filter(p =>
    (c === "all" || p.cat === c) &&
    p.name.toLowerCase().includes(q)
  );

  document.getElementById("productGrid").innerHTML = list.map(p => `
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
 const q=document.getElementById("search").value.toLowerCase(), c=document.getElementById("category").value;
 const list=products.filter(p=>(c==="all"||p.cat===c)&&p.name.toLowerCase().includes(q));
 document.getElementById("productGrid").innerHTML=list.map(p=>`<article class="card"><img src="${p.img}" alt="${p.name}"><div class="card-body"><span class="muted">${p.seller}</span><h3>${p.name}</h3><div class="price">₹${p.price}</div><button class="primary" onclick="addToCart(${p.id})">Add to Cart</button></div></article>`).join("")||"<p>Product nahi mila.</p>";
}
function addToCart(id){const p=products.find(x=>x.id===id);cart.push(p);saveCart();alert("Product cart mein add ho gaya.");}
function saveCart(){localStorage.setItem("brCart",JSON.stringify(cart));document.getElementById("cartCount").textContent=cart.length}
function openCart(){document.getElementById("cartModal").classList.remove("hidden");renderCart()}
function closeCart(){document.getElementById("cartModal").classList.add("hidden")}
function renderCart(){
 const box=document.getElementById("cartItems");let total=0;
 box.innerHTML=cart.length?cart.map((p,i)=>{total+=p.price;return `<div class="cart-row"><span>${p.name}</span><b>₹${p.price}</b><button onclick="removeCart(${i})">×</button></div>`}).join(""):"<p>Cart khali hai.</p>";
 document.getElementById("cartTotal").textContent=total;
}
function removeCart(i){cart.splice(i,1);saveCart();renderCart()}
functasync function checkout() {
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
    // Cart ke har product ka COD order create hoga
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
renderProducts();saveCart();
