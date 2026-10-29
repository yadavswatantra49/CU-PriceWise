// ============================================================
// CU PriceWise — app.js  (Main Application Logic)
// ============================================================

// ── PAGE ROUTING ──────────────────────────────────────────
let _currentPage = 'home';
let _pageHistory = [];
let _selectedStar = 0;

function showPage(page, opts) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (!el) return;
  el.classList.add('active');
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
  _pageHistory.push(page);
  _currentPage = page;
  window.scrollTo(0, 0);

  switch (page) {
    case 'home':       renderHome(); break;
    case 'products':   renderProducts(opts); break;
    case 'categories': renderCategories(); break;
    case 'shops':      renderShops(); break;
    case 'profile':    renderProfile(); break;
    case 'admin':
      if (!CurrentUser || CurrentUser.role !== 'ADMIN') {
        showToast('Admin access required.', 'error');
        showPage('auth'); return;
      }
      renderAdmin(); break;
  }
  return false;
}

// Override history.back
window.addEventListener('popstate', () => {
  const prev = _pageHistory[_pageHistory.length - 2];
  if (prev) showPage(prev);
});

// ── NAV ────────────────────────────────────────────────────
function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

function renderNav() {
  const el = document.getElementById('navActions');
  if (CurrentUser) {
    const initials = CurrentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
    let adminBtn = CurrentUser.role === 'ADMIN'
      ? `<a href="#" onclick="showPage('admin')" class="btn btn-outline btn-sm">Dashboard</a>` : '';
    el.innerHTML = `
      ${adminBtn}
      <a href="#" onclick="showPage('profile')" class="nav-user-badge">
        <div class="nav-avatar">${initials}</div>
        ${CurrentUser.name.split(' ')[0]}
      </a>
      <button class="btn btn-ghost btn-sm" onclick="doLogout()">Sign out</button>
    `;
  } else {
    el.innerHTML = `<button class="btn btn-primary btn-sm" onclick="showPage('auth')">Sign In</button>`;
  }
}

// ── SCROLL TO TOP ──────────────────────────────────────────
window.addEventListener('scroll', () => {
  const btn = document.getElementById('scrollTopBtn');
  if (btn) btn.classList.toggle('visible', window.scrollY > 400);
});

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = '') {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : type === 'warn' ? '⚠️ ' : 'ℹ️ ') + msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── HERO SEARCH ────────────────────────────────────────────
function heroSearchGo() {
  const q = document.getElementById('heroSearch').value.trim();
  showPage('products', { search: q });
}

// ── MODALS ─────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ── AUTH ────────────────────────────────────────────────────
function switchAuthTab(tab) {
  document.querySelectorAll('#page-auth .tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pwd   = document.getElementById('loginPwd').value;
  const user  = AppData.users.find(u => u.email === email && u.passwordHash === pwd);
  if (!user) {
    document.getElementById('loginAlert').innerHTML = alert_html('error', 'Invalid email or password.');
    return;
  }
  CurrentUser = user;
  sessionStorage.setItem('cu_user', JSON.stringify(user));
  renderNav();
  showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
  showPage('home');
}

function doRegister() {
  const name = document.getElementById('regName').value.trim();
  const uid  = document.getElementById('regUid').value.trim();
  const email= document.getElementById('regEmail').value.trim();
  const pwd  = document.getElementById('regPwd').value;
  const pwd2 = document.getElementById('regPwd2').value;
  const al   = id => document.getElementById('registerAlert').innerHTML = alert_html('error', id);

  if (!name || !uid || !email || !pwd) { al('All fields are required.'); return; }
  if (pwd.length < 6)   { al('Password must be at least 6 characters.'); return; }
  if (pwd !== pwd2)     { al('Passwords do not match.'); return; }
  if (AppData.users.find(u => u.email === email)) { al('Email already registered.'); return; }
  if (AppData.users.find(u => u.uid === uid))     { al('UID already registered.'); return; }

  const id = AppData.nextIds.user++;
  const newUser = { id, name, uid, email, passwordHash: pwd, role: 'STUDENT', created: today() };
  AppData.users.push(newUser);
  persist();
  CurrentUser = newUser;
  sessionStorage.setItem('cu_user', JSON.stringify(newUser));
  renderNav();
  showToast('Account created! Welcome to CU PriceWise 🎉', 'success');
  showPage('home');
}

function doLogout() {
  CurrentUser = null;
  sessionStorage.removeItem('cu_user');
  renderNav();
  showToast('Signed out successfully.', 'success');
  showPage('home');
}

function alert_html(type, msg) {
  return `<div class="alert alert-${type}">${msg}</div>`;
}

// ── HOME ────────────────────────────────────────────────────
function renderHome() {
  // Stats
  const stats = document.getElementById('heroStats');
  const totalProducts = AppData.products.filter(p => p.is_active).length;
  const totalShops    = AppData.shops.filter(s => s.is_active).length;
  const totalListings = AppData.shopProducts.length;
  stats.innerHTML = `
    <div class="hero-stat"><div class="num">${totalShops}</div><div class="lbl">Campus Shops</div></div>
    <div class="hero-stat"><div class="num">${totalProducts}</div><div class="lbl">Products Tracked</div></div>
    <div class="hero-stat"><div class="num">${totalListings}</div><div class="lbl">Price Listings</div></div>
    <div class="hero-stat"><div class="num">₹0</div><div class="lbl">Cost to Use</div></div>
  `;

  // Category grid
  const cats = ["Food & Beverages","Snacks","Stationery","Groceries","Personal Care","Daily Essentials"];
  const catGrid = document.getElementById('homeCategoryGrid');
  catGrid.innerHTML = cats.map(c => {
    const count = AppData.products.filter(p => p.category === c && p.is_active).length;
    return `
      <div class="cat-card" onclick="showPage('products',{category:'${c}'})">
        <div class="cat-icon">${categoryIcon(c)}</div>
        <div class="cat-name">${c}</div>
        <div class="cat-count">${count} product${count!==1?'s':''}</div>
      </div>`;
  }).join('');

  // Cheapest
  const cheapest = searchProducts('','','','','','price_asc').slice(0,4);
  document.getElementById('cheapestGrid').innerHTML = cheapest.map(productCard).join('') || emptyState('No products found');

  // Best rated
  const bestRated = searchProducts('','','','','','rating').filter(p => p.avgRating).slice(0,4);
  document.getElementById('bestRatedGrid').innerHTML = bestRated.map(productCard).join('') || emptyState('No rated products yet');

  // Popular shops
  const topShops = AppData.shops.filter(s => s.is_active).sort((a,b) => b.rating - a.rating).slice(0,3);
  document.getElementById('homeShopGrid').innerHTML = topShops.map(shopCard).join('');

  // Recently updated
  const recent = [...AppData.shopProducts]
    .sort((a,b) => new Date(b.updated) - new Date(a.updated))
    .slice(0, 6);
  document.getElementById('recentPrices').innerHTML = `
    <div class="card"><div class="card-body">
      <table class="data-table">
        <thead><tr><th>Product</th><th>Shop</th><th>Price</th><th>Updated</th></tr></thead>
        <tbody>
          ${recent.map(sp => {
            const p = AppData.products.find(x => x.id === sp.productId);
            const s = AppData.shops.find(x => x.id === sp.shopId);
            if (!p || !s) return '';
            return `<tr>
              <td><a href="#" onclick="showDetail(${p.id})">${p.name} <small style="color:var(--gray)">(${p.unit})</small></a></td>
              <td>${s.name}</td>
              <td><strong>₹${sp.price}</strong></td>
              <td>${formatDate(sp.updated)} ${isOutdated(sp.updated) ? '<span class="outdated-badge">Outdated</span>' : ''}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div></div>`;
}

// ── PRODUCT CARD HTML ──────────────────────────────────────
function productCard(p) {
  const shopCount = p.available.length;
  const outDated  = p.listings.some(l => isOutdated(l.updated));
  return `
  <div class="card product-card">
    <img class="card-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80'">
    <div class="card-body">
      <div class="product-meta">
        <span class="category-badge">${categoryIcon(p.category)} ${p.category}</span>
        ${outDated ? '<span class="outdated-badge">⚠️ Outdated</span>' : ''}
      </div>
      <div class="product-name">${p.name}</div>
      <div class="product-brand">${p.brand} · ${p.unit}</div>
      <div class="rating-row">
        ${p.avgRating ? stars(p.avgRating) + `<span>${p.avgRating.toFixed(1)} (${p.reviewCount})</span>` : '<span class="no-rating">No reviews yet</span>'}
      </div>
      <div class="price-block">
        <div class="price-from">Starting from</div>
        <div class="price-value">${p.lowestPrice !== null ? '₹' + p.lowestPrice : 'N/A'}</div>
        <div class="price-shops">${shopCount} shop${shopCount!==1?'s':''} available</div>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn btn-primary btn-sm" style="width:100%" onclick="showDetail(${p.id})">Compare Prices →</button>
    </div>
  </div>`;
}

// ── SHOP CARD HTML ─────────────────────────────────────────
function shopCard(s) {
  return `
  <div class="card shop-card" onclick="showShopDetail(${s.id})" style="cursor:pointer">
    <img class="card-img" src="${s.image}" alt="${s.name}" onerror="this.src='https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80'">
    <div class="card-body">
      <div class="shop-name">${s.name}</div>
      <div class="shop-loc">📍 ${s.location}</div>
      <div class="rating-row" style="margin-top:6px">
        ${stars(s.rating)} <span style="font-size:.8rem;color:var(--gray)">${s.rating} (${s.reviews} reviews)</span>
      </div>
      <div class="shop-tags">
        ${s.categories.map(c => `<span class="shop-tag">${categoryIcon(c)} ${c}</span>`).join('')}
      </div>
    </div>
  </div>`;
}

// ── EMPTY STATE ────────────────────────────────────────────
function emptyState(msg, icon = '🔍') {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${msg}</h3></div>`;
}

// ── PRODUCTS PAGE ──────────────────────────────────────────
function renderProducts(opts = {}) {
  if (opts) {
    if (opts.search)   { document.getElementById('fSearch').value = opts.search; }
    if (opts.category) { document.getElementById('fCat').value = opts.category; }
    if (opts.sort)     { document.getElementById('fSort').value = opts.sort; }
  }
  // Fill shop filter
  const shopSel = document.getElementById('fShop');
  if (shopSel.options.length <= 1) {
    AppData.shops.filter(s => s.is_active).forEach(s => {
      const o = document.createElement('option');
      o.value = s.id; o.textContent = s.name;
      shopSel.appendChild(o);
    });
  }
  applyFilters();
}

function applyFilters() {
  const q       = document.getElementById('fSearch').value.trim();
  const cat     = document.getElementById('fCat').value;
  const shopId  = document.getElementById('fShop').value;
  const minP    = document.getElementById('fMin').value;
  const maxP    = document.getElementById('fMax').value;
  const sort    = document.getElementById('fSort').value;

  const results = searchProducts(q, cat, shopId, minP, maxP, sort);
  const grid    = document.getElementById('productsGrid');
  const empty   = document.getElementById('productsEmpty');
  const count   = document.getElementById('productsResultCount');

  count.textContent = `${results.length} product${results.length !== 1 ? 's' : ''} found`;
  if (results.length === 0) {
    grid.innerHTML  = '';
    empty.innerHTML = emptyState('No products match your filters', '📦');
  } else {
    grid.innerHTML  = results.map(productCard).join('');
    empty.innerHTML = '';
  }
}

function clearFilters() {
  ['fSearch','fMin','fMax'].forEach(id => document.getElementById(id).value = '');
  ['fCat','fShop','fSort'].forEach(id => document.getElementById(id).selectedIndex = 0);
  applyFilters();
}

// ── PRODUCT DETAIL ─────────────────────────────────────────
function showDetail(productId) {
  const p = getProductWithPrices(productId);
  if (!p) return;
  showPage('detail');

  const revs = AppData.reviews.filter(r => r.productId === productId);
  const valueScore = getProductValueScore(p);

  const savings = p.highestPrice && p.lowestPrice && p.highestPrice !== p.lowestPrice
    ? `Save up to ₹${p.highestPrice - p.lowestPrice} vs most expensive listing`
    : 'Best available price shown';

  // Sort listings: lowest first, unavailable last
  const sorted = [...p.listings].sort((a, b) => {
    if (a.available !== b.available) return b.available - a.available;
    return a.price - b.price;
  });

  let reviewsHtml = revs.length ? revs.map(r => {
    const u = AppData.users.find(x => x.id === r.userId);
    return `<div class="card" style="margin-bottom:12px">
      <div class="card-body">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <div style="font-weight:600;font-size:.9rem">${u ? u.name : 'Student'}</div>
          <div>${stars(r.rating)} <small style="color:var(--gray)">${formatDate(r.created)}</small></div>
        </div>
        <p style="font-size:.875rem;color:var(--navy)">${r.comment}</p>
      </div>
    </div>`;
  }).join('') : `<div class="empty-state" style="padding:30px"><div class="empty-icon">💬</div><p>No reviews yet. Be the first!</p></div>`;

  const reviewBtnHtml = CurrentUser
    ? `<button class="btn btn-outline btn-sm" onclick="openReviewModal(${p.id})">Write a Review</button>`
    : `<button class="btn btn-ghost btn-sm" onclick="showPage('auth')">Sign in to review</button>`;

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-hero">
      <img src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80'">
      <div class="detail-info">
        <span class="badge badge-teal">${categoryIcon(p.category)} ${p.category}</span>
        <h1 class="product-name">${p.name}</h1>
        <p style="color:var(--gray);font-size:.875rem">${p.brand} &nbsp;·&nbsp; ${p.unit}</p>
        <p>${p.description}</p>
        <div class="price-summary">
          <div>
            <div style="font-size:.8rem;color:var(--gray);margin-bottom:4px">Lowest recorded price</div>
            <div class="lowest">${p.lowestPrice !== null ? '₹' + p.lowestPrice : 'N/A'}</div>
          </div>
          <div class="savings-info">
            <div>${savings}</div>
            <div style="margin-top:4px">${p.reviewCount} review${p.reviewCount!==1?'s':''} · Avg rating: ${p.avgRating ? p.avgRating.toFixed(1) + '/5' : 'N/A'}</div>
          </div>
        </div>
        ${p.avgRating ? `
        <div>
          <div class="value-score-badge">🏆 Value Score: ${valueScore}</div>
          <div style="font-size:.75rem;color:var(--gray);margin-top:6px">
            Value Score = (Rating/5) × (Lowest Price / Product Price) × 100 — higher is better value
          </div>
        </div>` : ''}
        <div class="rating-row" style="font-size:1rem">
          ${p.avgRating ? stars(p.avgRating) + `<span style="font-size:.9rem">${p.avgRating.toFixed(1)} out of 5 (${p.reviewCount} reviews)</span>` : '<span class="no-rating">No reviews yet</span>'}
        </div>
      </div>
    </div>

    <!-- Price Comparison -->
    <div class="card" style="margin-bottom:24px">
      <div class="card-body">
        <h3 style="margin-bottom:16px">💰 Price Comparison Across Shops</h3>
        ${sorted.length === 0 ? emptyState('No shops carry this product currently', '🏪') : `
        <div style="overflow-x:auto">
        <table class="compare-table">
          <thead>
            <tr><th>Shop</th><th>Location</th><th>Price</th><th>vs Lowest</th><th>Status</th><th>Last Updated</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${sorted.map(l => {
              const isLowest = l.available && l.price === p.lowestPrice;
              const diff     = l.available && p.lowestPrice ? l.price - p.lowestPrice : null;
              const outdated = isOutdated(l.updated);
              return `<tr class="${isLowest ? 'lowest-row' : ''} ${!l.available ? 'unavail-row' : ''}">
                <td>
                  <strong>${l.shop.name}</strong>
                  ${isLowest ? '<span class="lowest-badge">Lowest</span>' : ''}
                </td>
                <td>
                  <div style="font-size:.8rem">${l.shop.location}</div>
                  <a class="map-link" href="#" onclick="showLocationModal(${l.shop.id})">📍 View location</a>
                </td>
                <td><strong style="font-size:1.05rem">₹${l.price}</strong></td>
                <td>
                  ${diff !== null ? (diff === 0 ? '<span style="color:var(--green);font-weight:700">—</span>' : `<span class="savings-badge">+₹${diff} more</span>`) : '—'}
                </td>
                <td>
                  <span class="avail-dot ${l.available ? 'green' : 'red'}"></span>
                  ${l.available ? 'In Stock' : 'Out of Stock'}
                </td>
                <td>
                  <div>${formatDate(l.updated)}</div>
                  ${outdated ? '<span class="outdated-badge">Outdated</span>' : ''}
                </td>
                <td>
                  ${CurrentUser ? `<button class="btn btn-ghost btn-sm" onclick="openReportModal(${l.id})">🚩</button>` : ''}
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        </div>`}
        <p style="font-size:.75rem;margin-top:12px;color:var(--gray)">
          ⚠️ Prices are reported by admins/students and may not reflect real-time shop pricing. Verify before purchasing.
          Prices marked <strong>Outdated</strong> were last updated more than 30 days ago.
        </p>
      </div>
    </div>

    <!-- Reviews -->
    <div class="card">
      <div class="card-body">
        <div class="section-header" style="margin-bottom:16px">
          <h3>⭐ Student Reviews</h3>
          ${reviewBtnHtml}
        </div>
        ${reviewsHtml}
      </div>
    </div>
  `;
}

// ── CATEGORIES PAGE ─────────────────────────────────────────
function renderCategories() {
  const cats = ["Food & Beverages","Snacks","Stationery","Groceries","Personal Care","Daily Essentials"];
  let html = '';
  cats.forEach(cat => {
    const products = searchProducts('', cat, '', '', '', 'price_asc');
    if (products.length === 0) return;
    html += `
      <section class="section">
        <div class="section-header" style="margin-bottom:16px">
          <h2>${categoryIcon(cat)} ${cat} <span class="badge badge-teal" style="font-size:.8rem;margin-left:8px">${products.length}</span></h2>
          <button class="btn btn-ghost btn-sm" onclick="showPage('products',{category:'${cat}'})">Browse all →</button>
        </div>
        <div class="product-grid">${products.slice(0,4).map(productCard).join('')}</div>
      </section>`;
  });
  document.getElementById('categoriesContent').innerHTML = html || emptyState('No products available');
}

// ── SHOPS PAGE ──────────────────────────────────────────────
function renderShops() {
  const shops = AppData.shops.filter(s => s.is_active).sort((a,b) => b.rating - a.rating);
  document.getElementById('shopsGrid').innerHTML = shops.map(shopCard).join('');
}

// ── SHOP DETAIL ─────────────────────────────────────────────
function showShopDetail(shopId) {
  const shop = AppData.shops.find(s => s.id === shopId);
  if (!shop) return;
  showPage('shopdetail');

  const listings = AppData.shopProducts.filter(sp => sp.shopId === shopId);
  const productIds = [...new Set(listings.map(l => l.productId))];
  const products = productIds.map(id => getProductWithPrices(id)).filter(Boolean);

  // Group by category
  const grouped = {};
  products.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  });

  let productsHtml = '';
  Object.entries(grouped).forEach(([cat, prods]) => {
    productsHtml += `
      <h3 style="margin:20px 0 12px">${categoryIcon(cat)} ${cat}</h3>
      <div class="product-grid">${prods.map(p => {
        const sp = listings.find(l => l.productId === p.id);
        const shopPrice = sp ? sp.price : null;
        return `
          <div class="card product-card">
            <img class="card-img" src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80'">
            <div class="card-body">
              <div class="product-name">${p.name}</div>
              <div class="product-brand">${p.brand} · ${p.unit}</div>
              <div class="rating-row">
                ${p.avgRating ? stars(p.avgRating) + `<span>${p.avgRating.toFixed(1)}</span>` : '<span class="no-rating">No reviews</span>'}
              </div>
              <div class="price-block">
                <div class="price-value">₹${shopPrice || 'N/A'}</div>
                ${p.lowestPrice && shopPrice && shopPrice > p.lowestPrice
                  ? `<div style="font-size:.75rem;color:var(--red)">₹${shopPrice - p.lowestPrice} more than cheapest on campus</div>`
                  : (p.lowestPrice && shopPrice === p.lowestPrice ? `<div style="font-size:.75rem;color:var(--green)">✅ Cheapest on campus!</div>` : '')}
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-outline btn-sm" style="width:100%" onclick="showDetail(${p.id})">Compare →</button>
            </div>
          </div>`;
      }).join('')}</div>`;
  });

  document.getElementById('shopDetailContent').innerHTML = `
    <div class="card" style="margin-bottom:24px;overflow:hidden">
      <img src="${shop.image}" alt="${shop.name}" style="width:100%;height:200px;object-fit:cover">
      <div class="card-body">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div>
            <h2 style="margin-bottom:6px">${shop.name}</h2>
            <div class="shop-loc">📍 ${shop.location}</div>
            <div class="rating-row" style="margin-top:8px">
              ${stars(shop.rating)} <span style="font-size:.85rem;color:var(--gray)">${shop.rating} (${shop.reviews} reviews)</span>
            </div>
          </div>
          <div>
            <div style="font-size:.85rem;color:var(--gray)">⏰ ${shop.hours || 'Hours not available'}</div>
            <button class="btn btn-outline btn-sm" style="margin-top:8px" onclick="showLocationModal(${shop.id})">📍 View on Map</button>
            <span class="badge ${shop.is_active ? 'badge-green' : 'badge-red'}" style="margin-left:8px">${shop.is_active ? 'Open' : 'Closed'}</span>
          </div>
        </div>
        <p style="margin-top:12px">${shop.description}</p>
        <div class="shop-tags" style="margin-top:12px">
          ${shop.categories.map(c => `<span class="shop-tag">${categoryIcon(c)} ${c}</span>`).join('')}
        </div>
      </div>
    </div>
    <h2 style="margin-bottom:4px">Products at ${shop.name}</h2>
    <p style="margin-bottom:20px">All products available at this shop with their current listed prices.</p>
    ${productsHtml || emptyState('No products listed for this shop yet', '📦')}
  `;
}

// ── LOCATION MODAL ──────────────────────────────────────────
// Campus block positions (as % of a simple map)
const BLOCK_POSITIONS = {
  "Block 10":         { x: 60, y: 30 },
  "Library Block":    { x: 30, y: 20 },
  "SAC Block":        { x: 50, y: 55 },
  "Hostel Zone":      { x: 75, y: 70 },
  "Engineering Block A": { x: 20, y: 45 },
  "MBA Block":        { x: 40, y: 70 }
};

function showLocationModal(shopId) {
  const shop = AppData.shops.find(s => s.id === shopId);
  if (!shop) return;
  document.getElementById('locationModalTitle').textContent = `📍 ${shop.name}`;

  const blockKey = shop.block || shop.location.split(',')[0].trim();
  const pos = BLOCK_POSITIONS[blockKey] || { x: 50, y: 50 };

  // All shops on map
  const allPins = AppData.shops.filter(s => s.is_active).map(s => {
    const bk  = s.block || s.location.split(',')[0].trim();
    const p   = BLOCK_POSITIONS[bk] || { x: 50, y: 50 };
    const isThis = s.id === shopId;
    return `<div class="map-pin" style="left:${p.x}%;top:${p.y}%;font-size:${isThis?'2rem':'1.4rem'};z-index:${isThis?2:1}"
      title="${s.name}" onclick="showToast('${s.name} — ${s.location}')">
      ${isThis ? '🔴' : '📍'}
    </div>`;
  }).join('');

  document.getElementById('locationModalBody').innerHTML = `
    <div class="location-map-wrap">
      <div class="campus-map">
        <!-- Campus Labels -->
        <div style="position:absolute;top:8px;left:8px;font-size:.7rem;font-weight:600;color:var(--teal);background:rgba(255,255,255,.9);padding:3px 8px;border-radius:4px">CU Campus Map (Illustrative)</div>
        <div style="position:absolute;top:18%;left:28%;font-size:.6rem;color:var(--gray);background:rgba(255,255,255,.7);padding:1px 4px;border-radius:3px">Library</div>
        <div style="position:absolute;top:25%;left:58%;font-size:.6rem;color:var(--gray);background:rgba(255,255,255,.7);padding:1px 4px;border-radius:3px">Block 10</div>
        <div style="position:absolute;top:52%;left:48%;font-size:.6rem;color:var(--gray);background:rgba(255,255,255,.7);padding:1px 4px;border-radius:3px">SAC</div>
        <div style="position:absolute;top:40%;left:18%;font-size:.6rem;color:var(--gray);background:rgba(255,255,255,.7);padding:1px 4px;border-radius:3px">Eng Block A</div>
        <div style="position:absolute;top:67%;left:38%;font-size:.6rem;color:var(--gray);background:rgba(255,255,255,.7);padding:1px 4px;border-radius:3px">MBA Block</div>
        <div style="position:absolute;top:67%;left:73%;font-size:.6rem;color:var(--gray);background:rgba(255,255,255,.7);padding:1px 4px;border-radius:3px">Hostel Zone</div>
        ${allPins}
      </div>
      <p style="font-size:.7rem;color:var(--gray);margin-top:8px">
        🔴 = ${shop.name} &nbsp; 📍 = other shops. Map is illustrative and not to scale.
      </p>
    </div>
    <div class="card"><div class="card-body">
      <h3 style="margin-bottom:8px">${shop.name}</h3>
      <p>📍 <strong>${shop.location}</strong></p>
      <p style="margin-top:6px">⏰ ${shop.hours || 'Hours not listed'}</p>
      <p style="margin-top:6px">${shop.description}</p>
      <div class="alert alert-info" style="margin-top:12px">
        ℹ️ This map shows the approximate campus block location. Ask on campus for precise directions.
      </div>
    </div></div>
  `;
  openModal('locationModal');
}

// ── REVIEWS ─────────────────────────────────────────────────
function openReviewModal(productId) {
  if (!CurrentUser) { showPage('auth'); return; }
  document.getElementById('reviewProductId').value = productId;
  document.getElementById('reviewComment').value = '';
  document.getElementById('reviewAlert').innerHTML = '';
  _selectedStar = 0;
  updateStarPicker(0);
  openModal('reviewModal');
}

function pickStar(v) {
  _selectedStar = v;
  updateStarPicker(v);
}

function updateStarPicker(v) {
  document.querySelectorAll('.star-pick').forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.v) <= v);
  });
}

function submitReview() {
  const productId = parseInt(document.getElementById('reviewProductId').value);
  const comment   = document.getElementById('reviewComment').value.trim();
  const rating    = _selectedStar;
  const al        = msg => document.getElementById('reviewAlert').innerHTML = alert_html('error', msg);

  if (!rating)   { al('Please select a star rating.'); return; }
  if (!comment)  { al('Please write a short comment.'); return; }

  // Check duplicate
  const existing = AppData.reviews.find(r => r.userId === CurrentUser.id && r.productId === productId);
  if (existing) {
    // Update existing
    existing.rating = rating; existing.comment = comment; existing.created = today();
    persist();
    closeModal('reviewModal');
    showToast('Your review has been updated!', 'success');
    showDetail(productId);
    return;
  }
  const id = AppData.nextIds.review++;
  AppData.reviews.push({ id, userId: CurrentUser.id, productId, rating, comment, created: today() });
  persist();
  closeModal('reviewModal');
  showToast('Review submitted! Thank you 🎉', 'success');
  showDetail(productId);
}

// ── PRICE REPORTS ───────────────────────────────────────────
function openReportModal(shopProductId) {
  if (!CurrentUser) { showPage('auth'); return; }
  document.getElementById('reportSpId').value = shopProductId;
  document.getElementById('reportComment').value = '';
  document.getElementById('reportPrice').value = '';
  document.getElementById('reportAlert').innerHTML = '';
  openModal('reportModal');
}

function submitReport() {
  const spId    = parseInt(document.getElementById('reportSpId').value);
  const type    = document.getElementById('reportType').value;
  const price   = document.getElementById('reportPrice').value;
  const comment = document.getElementById('reportComment').value.trim();
  if (!comment) {
    document.getElementById('reportAlert').innerHTML = alert_html('error', 'Please add a comment.');
    return;
  }
  const id = AppData.nextIds.report++;
  AppData.priceReports.push({
    id, userId: CurrentUser.id, shopProductId: spId,
    reportedPrice: price ? parseFloat(price) : null,
    type, comment, status: 'PENDING', created: today()
  });
  persist();
  closeModal('reportModal');
  showToast('Report submitted! Admins will review it.', 'success');
}

// ── PROFILE PAGE ────────────────────────────────────────────
function renderProfile() {
  if (!CurrentUser) { showPage('auth'); return; }
  const myReviews = AppData.reviews.filter(r => r.userId === CurrentUser.id);
  const myReports = AppData.priceReports.filter(r => r.userId === CurrentUser.id);

  document.getElementById('profileContent').innerHTML = `
    <div class="card" style="margin-bottom:24px">
      <div class="card-body" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        <div class="nav-avatar" style="width:64px;height:64px;font-size:1.4rem;flex-shrink:0">
          ${CurrentUser.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)}
        </div>
        <div>
          <h2 style="margin-bottom:4px">${CurrentUser.name}</h2>
          <div style="font-size:.85rem;color:var(--gray)">UID: ${CurrentUser.uid} &nbsp;·&nbsp; ${CurrentUser.email}</div>
          <span class="badge ${CurrentUser.role === 'ADMIN' ? 'badge-navy' : 'badge-teal'}" style="margin-top:8px">${CurrentUser.role}</span>
        </div>
      </div>
    </div>

    <div class="tab-bar" id="profileTabBar">
      <button class="tab-btn active" onclick="profileTab('reviews')">My Reviews (${myReviews.length})</button>
      <button class="tab-btn" onclick="profileTab('reports')">My Reports (${myReports.length})</button>
    </div>

    <div id="profileReviews" class="tab-panel active">
      ${myReviews.length ? myReviews.map(r => {
        const p = AppData.products.find(x => x.id === r.productId);
        return `<div class="card" style="margin-bottom:12px"><div class="card-body">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <strong>${p ? p.name : 'Product'}</strong>
            <div>${stars(r.rating)} <small style="color:var(--gray)">${formatDate(r.created)}</small></div>
          </div>
          <p style="margin-top:6px;font-size:.875rem">${r.comment}</p>
          ${p ? `<button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="showDetail(${p.id})">View product →</button>` : ''}
        </div></div>`;
      }).join('') : emptyState('No reviews yet', '⭐')}
    </div>

    <div id="profileReports" class="tab-panel">
      ${myReports.length ? myReports.map(r => {
        const sp = AppData.shopProducts.find(x => x.id === r.shopProductId);
        const p  = sp ? AppData.products.find(x => x.id === sp.productId) : null;
        const s  = sp ? AppData.shops.find(x => x.id === sp.shopId) : null;
        return `<div class="card" style="margin-bottom:12px"><div class="card-body">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <strong>${p ? p.name : 'Product'} @ ${s ? s.name : 'Shop'}</strong>
            <span class="badge ${r.status === 'PENDING' ? 'badge-amber' : r.status === 'APPROVED' ? 'badge-green' : 'badge-red'}">${r.status}</span>
          </div>
          <div style="font-size:.8rem;color:var(--gray);margin:4px 0">${r.type.replace('_',' ')} · ${formatDate(r.created)}</div>
          <p style="font-size:.875rem">${r.comment}</p>
          ${r.reportedPrice ? `<div style="font-size:.8rem;margin-top:4px">Reported price: <strong>₹${r.reportedPrice}</strong></div>` : ''}
        </div></div>`;
      }).join('') : emptyState('No reports submitted', '🚩')}
    </div>
  `;
}

function profileTab(tab) {
  document.querySelectorAll('#profileTabBar .tab-btn').forEach((b,i) => {
    b.classList.toggle('active', (tab === 'reviews' && i === 0) || (tab === 'reports' && i === 1));
  });
  document.getElementById('profileReviews').classList.toggle('active', tab === 'reviews');
  document.getElementById('profileReports').classList.toggle('active', tab === 'reports');
}

// ── ADMIN DASHBOARD ─────────────────────────────────────────
function switchAdminPanel(panel) {
  document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(el => el.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('admin-' + panel).classList.add('active');
  renderAdminPanel(panel);
}

function renderAdmin() {
  renderAdminPanel('shops');
}

function renderAdminPanel(panel) {
  switch(panel) {
    case 'shops':    renderAdminShops(); break;
    case 'products': renderAdminProducts(); break;
    case 'prices':   renderAdminPrices(); break;
    case 'reports':  renderAdminReports(); break;
    case 'reviews':  renderAdminReviews(); break;
    case 'users':    renderAdminUsers(); break;
  }
}

function renderAdminShops() {
  document.getElementById('adminShopsTable').innerHTML = `
    <table class="data-table">
      <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${AppData.shops.map(s => `<tr>
          <td>${s.id}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.location}</td>
          <td><span class="badge ${s.is_active ? 'badge-green' : 'badge-red'}">${s.is_active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="openShopModal(${s.id})">Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="toggleShopStatus(${s.id})">${s.is_active ? 'Deactivate' : 'Activate'}</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderAdminProducts() {
  document.getElementById('adminProductsTable').innerHTML = `
    <table class="data-table">
      <thead><tr><th>ID</th><th>Name</th><th>Brand</th><th>Category</th><th>Unit</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${AppData.products.map(p => `<tr>
          <td>${p.id}</td>
          <td><strong>${p.name}</strong></td>
          <td>${p.brand}</td>
          <td>${categoryIcon(p.category)} ${p.category}</td>
          <td>${p.unit}</td>
          <td><span class="badge ${p.is_active ? 'badge-green' : 'badge-red'}">${p.is_active ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="openProductModal(${p.id})">Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="toggleProductStatus(${p.id})">${p.is_active ? 'Deactivate' : 'Activate'}</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderAdminPrices() {
  document.getElementById('adminPricesTable').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Shop</th><th>Product</th><th>Price</th><th>Stock</th><th>Updated</th><th>By</th><th>Actions</th></tr></thead>
      <tbody>
        ${AppData.shopProducts.map(sp => {
          const s = AppData.shops.find(x => x.id === sp.shopId);
          const p = AppData.products.find(x => x.id === sp.productId);
          return `<tr>
            <td>${s ? s.name : '?'}</td>
            <td>${p ? p.name : '?'}</td>
            <td><strong>₹${sp.price}</strong></td>
            <td><span class="badge ${sp.available ? 'badge-green' : 'badge-red'}">${sp.available ? 'In Stock' : 'Out'}</span></td>
            <td>${formatDate(sp.updated)} ${isOutdated(sp.updated) ? '<span class="outdated-badge">Old</span>' : ''}</td>
            <td><span class="badge ${sp.updatedBy === 'admin' ? 'badge-navy' : 'badge-teal'}">${sp.updatedBy}</span></td>
            <td><button class="btn btn-ghost btn-sm" onclick="openPriceModal(${sp.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deletePriceListing(${sp.id})">Del</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function renderAdminReports() {
  document.getElementById('adminReportsTable').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Reporter</th><th>Product @ Shop</th><th>Type</th><th>Reported Price</th><th>Comment</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        ${AppData.priceReports.map(r => {
          const u  = AppData.users.find(x => x.id === r.userId);
          const sp = AppData.shopProducts.find(x => x.id === r.shopProductId);
          const p  = sp ? AppData.products.find(x => x.id === sp.productId) : null;
          const s  = sp ? AppData.shops.find(x => x.id === sp.shopId) : null;
          return `<tr>
            <td>${u ? u.name : '?'}</td>
            <td>${p ? p.name : '?'} @ ${s ? s.name : '?'}</td>
            <td><span class="badge badge-amber">${r.type.replace('_',' ')}</span></td>
            <td>${r.reportedPrice ? '₹' + r.reportedPrice : '—'}</td>
            <td style="max-width:180px;font-size:.8rem">${r.comment}</td>
            <td><span class="badge ${r.status === 'PENDING' ? 'badge-amber' : r.status === 'APPROVED' ? 'badge-green' : 'badge-red'}">${r.status}</span></td>
            <td>
              ${r.status === 'PENDING' ? `
                <button class="btn btn-ghost btn-sm" onclick="updateReportStatus(${r.id},'APPROVED')">✅ Approve</button>
                <button class="btn btn-ghost btn-sm" onclick="updateReportStatus(${r.id},'REJECTED')">❌ Reject</button>
              ` : '—'}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function renderAdminReviews() {
  document.getElementById('adminReviewsTable').innerHTML = `
    <table class="data-table">
      <thead><tr><th>Student</th><th>Product</th><th>Rating</th><th>Comment</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>
        ${AppData.reviews.map(r => {
          const u = AppData.users.find(x => x.id === r.userId);
          const p = AppData.products.find(x => x.id === r.productId);
          return `<tr>
            <td>${u ? u.name : '?'}</td>
            <td>${p ? p.name : '?'}</td>
            <td>${stars(r.rating)} ${r.rating}</td>
            <td style="max-width:200px;font-size:.8rem">${r.comment}</td>
            <td>${formatDate(r.created)}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteReview(${r.id})">Delete</button></td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function renderAdminUsers() {
  document.getElementById('adminUsersTable').innerHTML = `
    <table class="data-table">
      <thead><tr><th>ID</th><th>Name</th><th>UID</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
      <tbody>
        ${AppData.users.map(u => `<tr>
          <td>${u.id}</td>
          <td><strong>${u.name}</strong></td>
          <td>${u.uid}</td>
          <td>${u.email}</td>
          <td><span class="badge ${u.role === 'ADMIN' ? 'badge-navy' : 'badge-teal'}">${u.role}</span></td>
          <td>${formatDate(u.created)}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

// ── ADMIN: SHOP CRUD ────────────────────────────────────────
function openShopModal(shopId) {
  const shop = shopId ? AppData.shops.find(s => s.id === shopId) : null;
  document.getElementById('shopModalTitle').textContent = shop ? 'Edit Shop' : 'Add Shop';
  document.getElementById('shopModalId').value   = shopId || '';
  document.getElementById('smName').value         = shop ? shop.name : '';
  document.getElementById('smLocation').value     = shop ? shop.location : '';
  document.getElementById('smDesc').value         = shop ? shop.description : '';
  document.getElementById('smHours').value        = shop ? (shop.hours || '') : '';
  document.getElementById('smCats').value         = shop ? shop.categories.join(', ') : '';
  document.getElementById('smActive').value       = shop ? String(shop.is_active) : 'true';
  openModal('shopModal');
}

function saveShop() {
  const id = document.getElementById('shopModalId').value;
  const data = {
    name:       document.getElementById('smName').value.trim(),
    location:   document.getElementById('smLocation').value.trim(),
    description:document.getElementById('smDesc').value.trim(),
    hours:      document.getElementById('smHours').value.trim(),
    categories: document.getElementById('smCats').value.split(',').map(c=>c.trim()).filter(Boolean),
    is_active:  document.getElementById('smActive').value === 'true',
    image:      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80',
    block:      document.getElementById('smLocation').value.split(',')[0].trim()
  };
  if (!data.name || !data.location) { showToast('Name and location are required.', 'error'); return; }
  if (id) {
    const shop = AppData.shops.find(s => s.id === parseInt(id));
    Object.assign(shop, data);
  } else {
    const newId = AppData.nextIds.shop++;
    AppData.shops.push({ id: newId, rating: 0, reviews: 0, ...data });
  }
  persist();
  closeModal('shopModal');
  showToast('Shop saved!', 'success');
  renderAdminShops();
}

function toggleShopStatus(shopId) {
  const shop = AppData.shops.find(s => s.id === shopId);
  if (shop) { shop.is_active = !shop.is_active; persist(); renderAdminShops(); }
}

// ── ADMIN: PRODUCT CRUD ─────────────────────────────────────
function openProductModal(productId) {
  const p = productId ? AppData.products.find(x => x.id === productId) : null;
  document.getElementById('productModalTitle').textContent = p ? 'Edit Product' : 'Add Product';
  document.getElementById('productModalId').value = productId || '';
  document.getElementById('pmName').value    = p ? p.name : '';
  document.getElementById('pmBrand').value   = p ? p.brand : '';
  document.getElementById('pmCat').value     = p ? p.category : 'Food & Beverages';
  document.getElementById('pmUnit').value    = p ? p.unit : '';
  document.getElementById('pmDesc').value    = p ? p.description : '';
  document.getElementById('pmImage').value   = p ? p.image : '';
  openModal('productModal');
}

function saveProduct() {
  const id = document.getElementById('productModalId').value;
  const data = {
    name:       document.getElementById('pmName').value.trim(),
    brand:      document.getElementById('pmBrand').value.trim(),
    category:   document.getElementById('pmCat').value,
    unit:       document.getElementById('pmUnit').value.trim(),
    description:document.getElementById('pmDesc').value.trim(),
    image:      document.getElementById('pmImage').value.trim() ||
                'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80',
    is_active:  true
  };
  if (!data.name || !data.brand) { showToast('Name and brand are required.', 'error'); return; }
  if (id) {
    const p = AppData.products.find(x => x.id === parseInt(id));
    Object.assign(p, data);
  } else {
    const newId = AppData.nextIds.product++;
    AppData.products.push({ id: newId, ...data });
  }
  persist();
  closeModal('productModal');
  showToast('Product saved!', 'success');
  renderAdminProducts();
}

function toggleProductStatus(productId) {
  const p = AppData.products.find(x => x.id === productId);
  if (p) { p.is_active = !p.is_active; persist(); renderAdminProducts(); }
}

// ── ADMIN: PRICE CRUD ───────────────────────────────────────
function openPriceModal(spId) {
  const sp = spId ? AppData.shopProducts.find(x => x.id === spId) : null;

  // Populate selects
  const shopSel = document.getElementById('pmShop');
  const prodSel = document.getElementById('pmProduct');
  shopSel.innerHTML = AppData.shops.filter(s=>s.is_active).map(s =>
    `<option value="${s.id}" ${sp && sp.shopId===s.id?'selected':''}>${s.name}</option>`
  ).join('');
  prodSel.innerHTML = AppData.products.filter(p=>p.is_active).map(p =>
    `<option value="${p.id}" ${sp && sp.productId===p.id?'selected':''}>${p.name} (${p.unit})</option>`
  ).join('');

  document.getElementById('priceModalId').value  = spId || '';
  document.getElementById('pmPrice').value        = sp ? sp.price : '';
  document.getElementById('pmAvail').value        = sp ? String(sp.available) : 'true';
  openModal('priceModal');
}

function savePrice() {
  const id      = document.getElementById('priceModalId').value;
  const shopId  = parseInt(document.getElementById('pmShop').value);
  const productId = parseInt(document.getElementById('pmProduct').value);
  const price   = parseFloat(document.getElementById('pmPrice').value);
  const avail   = document.getElementById('pmAvail').value === 'true';

  if (isNaN(price) || price < 0) { showToast('Enter a valid price.', 'error'); return; }

  if (id) {
    const sp = AppData.shopProducts.find(x => x.id === parseInt(id));
    sp.price = price; sp.available = avail;
    sp.updated = today(); sp.updatedBy = 'admin';
  } else {
    // Check duplicate
    const dup = AppData.shopProducts.find(x => x.shopId === shopId && x.productId === productId);
    if (dup) {
      dup.price = price; dup.available = avail;
      dup.updated = today(); dup.updatedBy = 'admin';
    } else {
      const newId = AppData.nextIds.shopProduct++;
      AppData.shopProducts.push({ id: newId, shopId, productId, price, available: avail, updated: today(), updatedBy: 'admin' });
    }
  }
  persist();
  closeModal('priceModal');
  showToast('Price listing saved!', 'success');
  renderAdminPrices();
}

function deletePriceListing(spId) {
  if (!confirm('Delete this price listing?')) return;
  AppData.shopProducts = AppData.shopProducts.filter(x => x.id !== spId);
  persist();
  renderAdminPrices();
  showToast('Listing deleted.', 'success');
}

function updateReportStatus(reportId, status) {
  const r = AppData.priceReports.find(x => x.id === reportId);
  if (r) {
    r.status = status;
    // If approved and has a reported price, update the actual listing
    if (status === 'APPROVED' && r.reportedPrice) {
      const sp = AppData.shopProducts.find(x => x.id === r.shopProductId);
      if (sp) { sp.price = r.reportedPrice; sp.updated = today(); sp.updatedBy = 'student-report'; }
    }
    persist();
    renderAdminReports();
    showToast(`Report ${status.toLowerCase()}!`, 'success');
  }
}

function deleteReview(reviewId) {
  if (!confirm('Delete this review?')) return;
  AppData.reviews = AppData.reviews.filter(x => x.id !== reviewId);
  persist();
  renderAdminReviews();
  showToast('Review deleted.', 'success');
}

// ── UTILITY ─────────────────────────────────────────────────
function today() {
  return new Date().toISOString().slice(0,10);
}

// ── INIT ─────────────────────────────────────────────────────
(function init() {
  renderNav();
  showPage('home');
})();
