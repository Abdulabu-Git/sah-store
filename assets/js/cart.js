
function getCart(){ return JSON.parse(localStorage.getItem('sah_cart')||'[]'); }
function setCart(c){ localStorage.setItem('sah_cart', JSON.stringify(c)); updateCartCount(); }
function updateCartCount(){
  const count = getCart().reduce((n,i)=>n+i.qty,0);
  const el = document.getElementById('cart-count'); if(el) el.textContent = count;
}
function addToCart(id){
  const item = CATALOG.find(p=>p.id===id);
  if(!item) return;
  const cart = getCart();
  const existing = cart.find(i=>i.id===id);
  if(existing){ existing.qty += 1; } else { cart.push({id, name:item.name, price:item.price, qty:1}); }
  setCart(cart);
  alert('Added to cart: '+item.name);
}

function renderCartPage(){
  updateCartCount();
  const wrap = document.getElementById('cart-items');
  const cart = getCart();
  if(!wrap) return;
  if(cart.length===0){ wrap.innerHTML = '<p>Your cart is empty. <a href="products.html">Browse products</a>.</p>'; return; }
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  wrap.innerHTML = `
    <div class="table-wrap">
      <table class="table"><thead><tr><th>Item</th><th>Qty</th><th>Unit (₦)</th><th>Subtotal (₦)</th><th></th></tr></thead>
      <tbody>
        ${cart.map((i,idx)=>`
          <tr>
            <td>${i.name}</td>
            <td><input type="number" min="1" value="${i.qty}" onchange="qtyChange(${idx}, this.value)" /></td>
            <td>${i.price.toLocaleString()}</td>
            <td>${(i.price*i.qty).toLocaleString()}</td>
            <td><button class="btn small" onclick="removeItem(${idx})">Remove</button></td>
          </tr>`).join('')}
      </tbody></table>
      <div class="card"><strong>Total: ₦${total.toLocaleString()}</strong></div>
    </div>`;

  const rfqForm = document.getElementById('rfq-form');
  const status = document.getElementById('rfq-status');
  if(rfqForm){
    rfqForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(rfqForm).entries());
      const payload = { ...data, cart };
      // For demo, just display JSON preview
      status.textContent = 'RFQ captured locally. Copy this summary and send via WhatsApp/email:';
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(payload, null, 2);
      status.appendChild(pre);
    });
  }
}

function qtyChange(idx, val){
  const cart = getCart();
  cart[idx].qty = Math.max(1, parseInt(val||1));
  setCart(cart);
  renderCartPage();
}
function removeItem(idx){
  const cart = getCart();
  cart.splice(idx,1);
  setCart(cart);
  renderCartPage();
}

// Inventory mini-app
function loadInventoryUI(){
  const tbody = document.querySelector('#inventory-table tbody');
  if(!tbody) return;
  const data = getInventory();
  tbody.innerHTML = '';
  data.forEach((row, i)=> appendRow(tbody, row, i));
}

function getInventory(){ return JSON.parse(localStorage.getItem('sah_inventory') || '[]'); }
function setInventory(rows){ localStorage.setItem('sah_inventory', JSON.stringify(rows)); }

function appendRow(tbody, row={}, index=null){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td contenteditable="true">${row.product||''}</td>
    <td contenteditable="true">${row.category||''}</td>
    <td contenteditable="true">${row.price||''}</td>
    <td contenteditable="true">${row.qty||''}</td>
    <td contenteditable="true">${row.remarks||''}</td>
    <td><button class="btn small" onclick="deleteRow(this)">Delete</button></td>`;
  tbody.appendChild(tr);
}

function addRow(){
  const tbody = document.querySelector('#inventory-table tbody');
  appendRow(tbody, {});
  saveInventoryFromUI();
}

function deleteRow(btn){
  const tr = btn.closest('tr');
  tr.remove();
  saveInventoryFromUI();
}

function saveInventoryFromUI(){
  const rows = Array.from(document.querySelectorAll('#inventory-table tbody tr')).map(tr=>{
    const [product,category,price,qty,remarks] = Array.from(tr.children).slice(0,5).map(td=>td.textContent.trim());
    return {product,category,price,qty,remarks};
  });
  setInventory(rows);
}

document.addEventListener('input', (e)=>{
  if(e.target.closest('#inventory-table')){ saveInventoryFromUI(); }
});

function exportInventory(){
  const rows = getInventory();
  const header = 'Product,Category,Unit Price (NGN),Stock Qty,Remarks\n';
  const csv = header + rows.map(r=>[r.product,r.category,r.price,r.qty,r.remarks].map(v=>`"${(v||'').replaceAll('"','""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sah-inventory.csv'; a.click();
  URL.revokeObjectURL(url);
}

function importInventory(){
  const input = document.getElementById('csvFile');
  input.onchange = async (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
    const rows = lines.map(line=>{
      const parts = line.match(/(".*?"|[^",]+)(?=,|$)/g).map(s=>s.replaceAll(/^"|"$/g,''));
      return {product:parts[0]||'', category:parts[1]||'', price:parts[2]||'', qty:parts[3]||'', remarks:parts[4]||''};
    });
    setInventory(rows);
    loadInventoryUI();
  };
  input.click();
}
updateCartCount();
