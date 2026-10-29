// ============================================================
// CU PriceWise — Central Data Store
// All sample data lives here. Replace with real data anytime.
// ============================================================

const DB = {

  // ── SHOPS ──────────────────────────────────────────────────
  shops: [
    {
      id: 1, name: "CU Campus Mart",
      location: "Block 10, Ground Floor",
      block: "Block 10",
      description: "General convenience store with groceries, snacks and daily essentials.",
      hours: "8:00 AM – 10:00 PM",
      categories: ["Groceries", "Snacks", "Daily Essentials"],
      rating: 4.2, reviews: 87, is_active: true,
      image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80"
    },
    {
      id: 2, name: "The Book Corner",
      location: "Library Block, Near Entrance",
      block: "Library Block",
      description: "Stationery, books, academic supplies and printing services.",
      hours: "9:00 AM – 7:00 PM",
      categories: ["Stationery", "Books"],
      rating: 4.5, reviews: 63, is_active: true,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
    },
    {
      id: 3, name: "Hunger Hub",
      location: "Student Activity Centre, Level 1",
      block: "SAC Block",
      description: "Hot beverages, packaged foods, instant noodles and cold drinks.",
      hours: "7:30 AM – 11:00 PM",
      categories: ["Food & Beverages", "Snacks"],
      rating: 4.0, reviews: 142, is_active: true,
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"
    },
    {
      id: 4, name: "FreshMart",
      location: "Hostel Zone, Block H4",
      block: "Hostel Zone",
      description: "Fresh groceries, dairy, personal care and essential household items.",
      hours: "7:00 AM – 10:30 PM",
      categories: ["Groceries", "Daily Essentials", "Personal Care"],
      rating: 3.9, reviews: 55, is_active: true,
      image: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80"
    },
    {
      id: 5, name: "Stationery World",
      location: "Engineering Block A, Near Canteen",
      block: "Engineering Block A",
      description: "Pens, notebooks, drafting tools, printer cartridges and all academic needs.",
      hours: "9:00 AM – 6:30 PM",
      categories: ["Stationery"],
      rating: 4.3, reviews: 41, is_active: true,
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80"
    },
    {
      id: 6, name: "Quick Bites",
      location: "MBA Block, Ground Floor",
      block: "MBA Block",
      description: "Fast snacks, energy drinks, biscuits and cold beverages.",
      hours: "8:00 AM – 9:00 PM",
      categories: ["Snacks", "Food & Beverages"],
      rating: 3.7, reviews: 29, is_active: true,
      image: "https://images.unsplash.com/photo-1452967712862-0cca1839ff27?w=400&q=80"
    }
  ],

  // ── PRODUCTS ───────────────────────────────────────────────
  products: [
    // Food & Beverages
    { id: 1,  name: "Cold Coffee",          brand: "Campus Brewed",    category: "Food & Beverages",  description: "Chilled cold coffee, freshly made with milk and instant coffee.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80", unit: "300 ml cup", is_active: true },
    { id: 2,  name: "Masala Chai",          brand: "Campus Brewed",    category: "Food & Beverages",  description: "Hot spiced chai made fresh with ginger and cardamom.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80", unit: "200 ml cup", is_active: true },
    { id: 3,  name: "Mineral Water Bottle", brand: "Aquafina",         category: "Food & Beverages",  description: "Purified mineral water, 1 litre sealed bottle.", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80", unit: "1 L bottle", is_active: true },
    { id: 4,  name: "Maggi Noodles",        brand: "Nestle",           category: "Snacks",            description: "Classic Maggi 2-minute noodles, Masala flavour.", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80", unit: "70 g pack", is_active: true },
    { id: 5,  name: "Lays Classic Salted",  brand: "Lays",             category: "Snacks",            description: "Crispy salted potato chips.", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80", unit: "26 g pack", is_active: true },
    { id: 6,  name: "Parle-G Biscuits",     brand: "Parle",            category: "Snacks",            description: "Classic glucose biscuits, family pack.", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80", unit: "100 g pack", is_active: true },
    { id: 7,  name: "Kurkure Masala Munch", brand: "Kurkure",          category: "Snacks",            description: "Spicy puffed corn snack.", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80", unit: "50 g pack", is_active: true },

    // Stationery
    { id: 8,  name: "A4 Notebook",          brand: "Classmate",        category: "Stationery",        description: "200-page ruled A4 notebook, hard cover.", image: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=400&q=80", unit: "200 pages", is_active: true },
    { id: 9,  name: "Ball Point Pen",       brand: "Reynolds",         category: "Stationery",        description: "Smooth writing blue ballpoint pen.", image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80", unit: "1 piece", is_active: true },
    { id: 10, name: "Scientific Calculator","brand": "Casio",          category: "Stationery",        description: "Casio FX-991 scientific calculator.", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80", unit: "1 piece", is_active: true },
    { id: 11, name: "Highlighter Set",      brand: "Staedtler",        category: "Stationery",        description: "Neon highlighters, set of 4 colours.", image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80", unit: "Set of 4", is_active: true },

    // Groceries
    { id: 12, name: "Milk (Full Cream)",    brand: "Amul",             category: "Groceries",         description: "Full cream pasteurised milk.", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80", unit: "500 ml pouch", is_active: true },
    { id: 13, name: "Whole Wheat Bread",    brand: "Britannia",        category: "Groceries",         description: "100% whole wheat sliced bread.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", unit: "400 g loaf", is_active: true },
    { id: 14, name: "Basmati Rice",         brand: "India Gate",       category: "Groceries",         description: "Premium aged basmati rice.", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80", unit: "1 kg pack", is_active: true },

    // Daily Essentials / Personal Care
    { id: 15, name: "Head & Shoulders Shampoo", brand: "Head & Shoulders", category: "Personal Care", description: "Anti-dandruff shampoo, classic clean.", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80", unit: "180 ml bottle", is_active: true },
    { id: 16, name: "Colgate Toothpaste",   brand: "Colgate",          category: "Personal Care",     description: "Strong Teeth toothpaste with calcium.", image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80", unit: "150 g tube", is_active: true },
    { id: 17, name: "Dettol Hand Wash",     brand: "Dettol",           category: "Daily Essentials",  description: "Antibacterial liquid hand wash.", image: "https://images.unsplash.com/photo-1584038877214-a08a8e5a9f4c?w=400&q=80", unit: "200 ml pump", is_active: true }
  ],

  // ── SHOP_PRODUCTS (prices per shop) ────────────────────────
  shopProducts: [
    // Cold Coffee — 3 shops
    { id: 1,  shopId: 1, productId: 1,  price: 40, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 2,  shopId: 3, productId: 1,  price: 35, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 3,  shopId: 6, productId: 1,  price: 45, available: true, updated: "2026-10-15", updatedBy: "student" },

    // Masala Chai — 4 shops
    { id: 4,  shopId: 1, productId: 2,  price: 15, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 5,  shopId: 3, productId: 2,  price: 12, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 6,  shopId: 4, productId: 2,  price: 15, available: true, updated: "2026-10-27", updatedBy: "admin" },
    { id: 7,  shopId: 6, productId: 2,  price: 18, available: true, updated: "2026-09-10", updatedBy: "student" },

    // Water Bottle — 5 shops
    { id: 8,  shopId: 1, productId: 3,  price: 20, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 9,  shopId: 3, productId: 3,  price: 22, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 10, shopId: 4, productId: 3,  price: 20, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 11, shopId: 5, productId: 3,  price: 25, available: false, updated: "2026-10-01", updatedBy: "student" },
    { id: 12, shopId: 6, productId: 3,  price: 22, available: true, updated: "2026-10-20", updatedBy: "admin" },

    // Maggi — 4 shops
    { id: 13, shopId: 1, productId: 4,  price: 14, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 14, shopId: 3, productId: 4,  price: 15, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 15, shopId: 4, productId: 4,  price: 14, available: true, updated: "2026-10-27", updatedBy: "admin" },
    { id: 16, shopId: 6, productId: 4,  price: 16, available: true, updated: "2026-10-25", updatedBy: "admin" },

    // Lays — 3 shops
    { id: 17, shopId: 1, productId: 5,  price: 20, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 18, shopId: 3, productId: 5,  price: 20, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 19, shopId: 6, productId: 5,  price: 22, available: true, updated: "2026-10-10", updatedBy: "student" },

    // Parle-G — 4 shops
    { id: 20, shopId: 1, productId: 6,  price: 10, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 21, shopId: 3, productId: 6,  price: 10, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 22, shopId: 4, productId: 6,  price: 12, available: true, updated: "2026-10-27", updatedBy: "admin" },
    { id: 23, shopId: 6, productId: 6,  price: 10, available: true, updated: "2026-10-26", updatedBy: "admin" },

    // Kurkure — 3 shops
    { id: 24, shopId: 1, productId: 7,  price: 20, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 25, shopId: 3, productId: 7,  price: 20, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 26, shopId: 6, productId: 7,  price: 22, available: true, updated: "2026-09-20", updatedBy: "student" },

    // A4 Notebook — 2 shops
    { id: 27, shopId: 2, productId: 8,  price: 85, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 28, shopId: 5, productId: 8,  price: 80, available: true, updated: "2026-10-29", updatedBy: "admin" },

    // Ball Point Pen — 3 shops
    { id: 29, shopId: 2, productId: 9,  price: 10, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 30, shopId: 5, productId: 9,  price: 8,  available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 31, shopId: 1, productId: 9,  price: 12, available: true, updated: "2026-10-20", updatedBy: "student" },

    // Scientific Calculator — 2 shops
    { id: 32, shopId: 2, productId: 10, price: 1200, available: true, updated: "2026-10-25", updatedBy: "admin" },
    { id: 33, shopId: 5, productId: 10, price: 1150, available: true, updated: "2026-10-28", updatedBy: "admin" },

    // Highlighter Set — 2 shops
    { id: 34, shopId: 2, productId: 11, price: 90, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 35, shopId: 5, productId: 11, price: 85, available: true, updated: "2026-10-29", updatedBy: "admin" },

    // Milk — 2 shops
    { id: 36, shopId: 1, productId: 12, price: 32, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 37, shopId: 4, productId: 12, price: 30, available: true, updated: "2026-10-29", updatedBy: "admin" },

    // Bread — 2 shops
    { id: 38, shopId: 1, productId: 13, price: 45, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 39, shopId: 4, productId: 13, price: 42, available: true, updated: "2026-10-29", updatedBy: "admin" },

    // Rice — 2 shops
    { id: 40, shopId: 1, productId: 14, price: 120, available: true, updated: "2026-10-27", updatedBy: "admin" },
    { id: 41, shopId: 4, productId: 14, price: 110, available: true, updated: "2026-10-28", updatedBy: "admin" },

    // Shampoo — 2 shops
    { id: 42, shopId: 1, productId: 15, price: 145, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 43, shopId: 4, productId: 15, price: 140, available: true, updated: "2026-10-29", updatedBy: "admin" },

    // Toothpaste — 2 shops
    { id: 44, shopId: 1, productId: 16, price: 68, available: true, updated: "2026-10-27", updatedBy: "admin" },
    { id: 45, shopId: 4, productId: 16, price: 65, available: true, updated: "2026-10-28", updatedBy: "admin" },

    // Hand Wash — 3 shops
    { id: 46, shopId: 1, productId: 17, price: 90, available: true, updated: "2026-10-28", updatedBy: "admin" },
    { id: 47, shopId: 4, productId: 17, price: 88, available: true, updated: "2026-10-29", updatedBy: "admin" },
    { id: 48, shopId: 6, productId: 17, price: 95, available: true, updated: "2026-09-15", updatedBy: "student" }
  ],

  // ── REVIEWS ────────────────────────────────────────────────
  reviews: [
    { id: 1,  userId: 2, productId: 1,  rating: 5, comment: "Best cold coffee on campus! Hunger Hub makes it perfectly.",     created: "2026-10-20" },
    { id: 2,  userId: 3, productId: 1,  rating: 4, comment: "Good taste, slightly too sweet but worth the price.",            created: "2026-10-22" },
    { id: 3,  userId: 4, productId: 1,  rating: 3, comment: "Average. Campus Mart version is a bit watery.",                  created: "2026-10-25" },
    { id: 4,  userId: 2, productId: 2,  rating: 5, comment: "Hunger Hub chai is the real deal. Perfect morning fix.",         created: "2026-10-18" },
    { id: 5,  userId: 3, productId: 2,  rating: 4, comment: "Fresh and hot. Good value at ₹12.",                             created: "2026-10-21" },
    { id: 6,  userId: 5, productId: 3,  rating: 4, comment: "Standard Aquafina, always available at Campus Mart.",            created: "2026-10-15" },
    { id: 7,  userId: 2, productId: 4,  rating: 4, comment: "Maggi is Maggi. Campus Mart price is fair.",                    created: "2026-10-10" },
    { id: 8,  userId: 3, productId: 4,  rating: 5, comment: "Always stocked, quick and cheap!",                              created: "2026-10-12" },
    { id: 9,  userId: 4, productId: 5,  rating: 3, comment: "Same price everywhere, nothing special.",                       created: "2026-10-08" },
    { id: 10, userId: 5, productId: 6,  rating: 5, comment: "Parle-G is a lifesaver during late night studies.",              created: "2026-10-14" },
    { id: 11, userId: 2, productId: 8,  rating: 5, comment: "Book Corner has the best notebooks. Strong binding.",            created: "2026-10-05" },
    { id: 12, userId: 3, productId: 8,  rating: 4, comment: "Stationery World is ₹5 cheaper. Good quality too.",             created: "2026-10-07" },
    { id: 13, userId: 4, productId: 9,  rating: 5, comment: "Reynolds pen from Stationery World at ₹8 is unbeatable!",      created: "2026-10-09" },
    { id: 14, userId: 5, productId: 10, rating: 4, comment: "Casio calculator, same model everywhere. Stationery World cheaper.", created: "2026-10-11" },
    { id: 15, userId: 2, productId: 12, rating: 4, comment: "FreshMart milk is always fresh. Slightly cheaper than Campus Mart.", created: "2026-10-16" },
    { id: 16, userId: 3, productId: 13, rating: 4, comment: "FreshMart bread is softer and cheaper.",                        created: "2026-10-17" },
    { id: 17, userId: 4, productId: 15, rating: 3, comment: "Both shops carry the same H&S. FreshMart is a bit cheaper.",    created: "2026-10-19" },
    { id: 18, userId: 5, productId: 16, rating: 4, comment: "FreshMart beats Campus Mart by ₹3. Always go there.",          created: "2026-10-22" }
  ],

  // ── USERS (stored/augmented via localStorage) ──────────────
  defaultUsers: [
    { id: 1, name: "Admin CU",       uid: "admin001",     email: "admin@cupricewise.in",  passwordHash: "admin123",   role: "ADMIN",   created: "2026-08-01" },
    { id: 2, name: "Arjun Sharma",   uid: "22CSE10001",   email: "arjun@cumail.in",       passwordHash: "pass1234",   role: "STUDENT", created: "2026-08-10" },
    { id: 3, name: "Priya Mehta",    uid: "22CSE10042",   email: "priya@cumail.in",       passwordHash: "pass1234",   role: "STUDENT", created: "2026-08-12" },
    { id: 4, name: "Rahul Verma",    uid: "22EEE10077",   email: "rahul@cumail.in",       passwordHash: "pass1234",   role: "STUDENT", created: "2026-08-15" },
    { id: 5, name: "Sneha Patel",    uid: "22MBA10033",   email: "sneha@cumail.in",       passwordHash: "pass1234",   role: "STUDENT", created: "2026-08-20" }
  ],

  // ── PRICE REPORTS ──────────────────────────────────────────
  priceReports: [
    { id: 1, userId: 2, shopProductId: 3,  reportedPrice: 50, type: "WRONG_PRICE",   comment: "Quick Bites now charges ₹50 for cold coffee.", status: "PENDING",  created: "2026-10-28" },
    { id: 2, userId: 3, shopProductId: 7,  reportedPrice: 20, type: "WRONG_PRICE",   comment: "MBA Quick Bites chai is now ₹20.",              status: "PENDING",  created: "2026-10-27" },
    { id: 3, userId: 4, shopProductId: 11, reportedPrice: 20, type: "UNAVAILABLE",   comment: "Stationery World doesn't stock water bottles.",  status: "APPROVED", created: "2026-10-01" }
  ]
};

// ── UTILITY: localStorage persistence ──────────────────────
const Store = {
  _key: "cu_pricewise_v1",
  load() {
    try {
      const raw = localStorage.getItem(this._key);
      if (raw) return JSON.parse(raw);
    } catch(e) {}
    return null;
  },
  save(data) {
    try { localStorage.setItem(this._key, JSON.stringify(data)); } catch(e) {}
  },
  init() {
    let stored = this.load();
    if (!stored) {
      stored = {
        users: [...DB.defaultUsers],
        shops: [...DB.shops],
        products: [...DB.products],
        shopProducts: [...DB.shopProducts],
        reviews: [...DB.reviews],
        priceReports: [...DB.priceReports],
        nextIds: { user: 6, shop: 7, product: 18, shopProduct: 49, review: 19, report: 4 }
      };
      this.save(stored);
    }
    return stored;
  }
};

// ── APP STATE ──────────────────────────────────────────────
let AppData = Store.init();
let CurrentUser = null;
try {
  const cu = sessionStorage.getItem("cu_user");
  if (cu) CurrentUser = JSON.parse(cu);
} catch(e) {}

// ── HELPERS ────────────────────────────────────────────────
function persist() { Store.save(AppData); }

function getProductWithPrices(productId) {
  const p = AppData.products.find(x => x.id === productId);
  if (!p) return null;
  const listings = AppData.shopProducts
    .filter(sp => sp.productId === productId)
    .map(sp => ({
      ...sp,
      shop: AppData.shops.find(s => s.id === sp.shopId)
    }));
  const available = listings.filter(l => l.available && l.shop && l.shop.is_active);
  const prices = available.map(l => l.price);
  const lowestPrice = prices.length ? Math.min(...prices) : null;
  const highestPrice = prices.length ? Math.max(...prices) : null;
  const revs = AppData.reviews.filter(r => r.productId === productId);
  const avgRating = revs.length ? (revs.reduce((s, r) => s + r.rating, 0) / revs.length) : null;
  return { ...p, listings, available, lowestPrice, highestPrice, avgRating, reviewCount: revs.length };
}

function getProductValueScore(p) {
  if (!p.avgRating || !p.lowestPrice) return 0;
  return ((p.avgRating / 5) * (p.lowestPrice > 0 ? 1 / p.lowestPrice : 0) * 10000).toFixed(1);
}

function isOutdated(dateStr) {
  const updated = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - updated) / (1000 * 60 * 60 * 24);
  return diffDays > 30;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function stars(rating, max = 5) {
  if (!rating) return '<span class="no-rating">No ratings yet</span>';
  let html = '';
  for (let i = 1; i <= max; i++) {
    if (i <= Math.floor(rating)) html += '<span class="star filled">★</span>';
    else if (i - rating < 1) html += '<span class="star half">★</span>';
    else html += '<span class="star">★</span>';
  }
  return html;
}

function categoryIcon(cat) {
  const map = {
    "Food & Beverages": "☕",
    "Snacks": "🍪",
    "Stationery": "📚",
    "Groceries": "🛒",
    "Personal Care": "🧴",
    "Daily Essentials": "🏠"
  };
  return map[cat] || "📦";
}

function searchProducts(query, category, shopId, minPrice, maxPrice, sort) {
  let results = AppData.products.filter(p => p.is_active);
  if (query) {
    const q = query.toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }
  if (category) results = results.filter(p => p.category === category);

  let enriched = results.map(p => getProductWithPrices(p.id));

  if (shopId) {
    enriched = enriched.filter(p =>
      p.listings.some(l => l.shopId === parseInt(shopId))
    );
  }
  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    enriched = enriched.filter(p => p.lowestPrice !== null && p.lowestPrice >= parseFloat(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    enriched = enriched.filter(p => p.lowestPrice !== null && p.lowestPrice <= parseFloat(maxPrice));
  }

  switch (sort) {
    case "price_asc":  enriched.sort((a, b) => (a.lowestPrice||999999) - (b.lowestPrice||999999)); break;
    case "price_desc": enriched.sort((a, b) => (b.lowestPrice||0) - (a.lowestPrice||0)); break;
    case "rating":     enriched.sort((a, b) => (b.avgRating||0) - (a.avgRating||0)); break;
    case "value":      enriched.sort((a, b) => getProductValueScore(b) - getProductValueScore(a)); break;
    default:           enriched.sort((a, b) => a.name.localeCompare(b.name));
  }
  return enriched;
}
