
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));

document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav
  const navToggle = $('.nav-toggle');
  const nav = $('.nav');
  if(navToggle){
    navToggle.addEventListener('click', () => {
      const open = nav.style.display === 'flex';
      nav.style.display = open ? 'none' : 'flex';
    });
  }
  // Year
  const yearEl = $('#year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  // Search + filter on products page
  const search = $('#search');
  const cat = $('#category-filter');
  if(search || cat){
    [search, cat].forEach(el => el && el.addEventListener('input', renderProducts));
  }
});

// --- Product catalog (sample placeholder) ---
const CATALOG = [
  {id:'coke-50', name:'Coca-Cola (50cl)', category:'Soft Drink', price:120},
  {id:'fanta-50', name:'Fanta (50cl)', category:'Soft Drink', price:120},
  {id:'sprite-50', name:'Sprite (50cl)', category:'Soft Drink', price:120},
  {id:'eva-75', name:'Eva Water (75cl)', category:'Water', price:90},
  {id:'table-water-1.5', name:'Table Water (1.5L)', category:'Water', price:200},
  {id:'tomatoes-basket', name:'Fresh Tomatoes (Basket)', category:'Farm Produce', price:8000},
  {id:'pepper-basket', name:'Red Pepper (Basket)', category:'Farm Produce', price:6000},
  {id:'onion-bag', name:'Onions (Bag)', category:'Farm Produce', price:15000}
];

function renderProducts(){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  const term = (document.getElementById('search')?.value || '').toLowerCase();
  const cat = document.getElementById('category-filter')?.value || '';
  const items = CATALOG.filter(p => (!cat || p.category===cat) && (!term || p.name.toLowerCase().includes(term)));
  grid.innerHTML = items.map(p => `
    <div class="product">
      <h3>${p.name}</h3>
      <div class="muted">${p.category}</div>
      <div class="price">₦${p.price.toLocaleString()}</div>
      <button class="btn primary" onclick="addToCart('${p.id}')">Add to Cart</button>
    </div>
  `).join('');
}

// Contact form (no backend; just acknowledge)
function bindContactForm(){
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = 'Thanks! Your message has been noted. We will contact you shortly.';
    form.reset();
  });
}
