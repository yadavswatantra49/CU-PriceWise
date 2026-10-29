# CU PriceWise 🏷️
### Campus Price Comparison & Product Discovery Platform
**Chandigarh University — Student Project**

---

## What is CU PriceWise?

CU PriceWise helps Chandigarh University students discover products sold across campus shops and **compare their prices** before purchasing.

Students can answer questions like:
- 🧋 Where is the cheapest cold coffee on campus?
- 📓 Which shop sells notebooks at the lowest price?
- ⭐ Which shop has the best-rated Maggi?
- 💰 Is a slightly pricier product worth it based on quality ratings?

---

## ▶️ How to Run

**No installation required.**

1. Download or clone this folder.
2. Open `index.html` directly in any modern browser (Chrome, Firefox, Edge).
3. That's it — the app runs entirely in the browser.

```
CU PriceWise/
├── index.html   ← Open this file in your browser
├── style.css    ← All styles
├── app.js       ← All application logic
├── data.js      ← All sample data & database layer
└── README.md
```

> **Note:** Data is stored in `localStorage`. It persists between sessions in the same browser. To reset to sample data, clear the site's localStorage (DevTools → Application → Local Storage → Clear).

---

## 🔐 Demo Accounts

| Role    | Email                    | Password  |
|---------|--------------------------|-----------|
| Admin   | admin@cupricewise.in     | admin123  |
| Student | arjun@cumail.in          | pass1234  |

---

## ✨ Features

### For Students
- 🔍 **Search** products by name, brand, or description (partial & case-insensitive)
- 💸 **Price Comparison** — see every shop that sells a product and their prices side by side
- 🏷️ **Lowest Price** highlighted in green with savings calculation
- ⭐ **Ratings & Reviews** — rate products 1–5 stars, write reviews
- 🏆 **Best Value Score** — combined rating + price scoring
- 🗓️ **Outdated warnings** — prices older than 30 days are flagged
- 🗺️ **Shop Locations** — see approximate campus block locations on an illustrated map
- 📍 **Shop Directory** — browse all campus shops and their products
- 🗂️ **Category Browsing** — Food, Stationery, Groceries, Snacks, Personal Care
- 🚩 **Report incorrect prices** for admin review

### For Admins
- 🏪 Add / edit / deactivate campus shops
- 📦 Add / edit / deactivate products
- 💰 Add / update price listings per shop
- ✅ Approve or reject student price reports (auto-applies corrected price)
- ⭐ Manage / delete reviews
- 👤 View all registered users

---

## 📊 Sample Data

The app ships with fictional sample data:
- **6 campus shops** (Campus Mart, Book Corner, Hunger Hub, FreshMart, Stationery World, Quick Bites)
- **17 products** across all categories
- **48 price listings** with multiple shops per product
- **18 student reviews**
- **3 price correction reports**

> ⚠️ All shop names, prices, and ratings are **fictional sample data** for demonstration. Replace them with real CU campus data via the Admin Dashboard.

---

## 🗂️ Categories

| Icon | Category          | Examples                          |
|------|-------------------|-----------------------------------|
| ☕   | Food & Beverages  | Cold coffee, chai, water bottles  |
| 🍪   | Snacks            | Maggi, Lays, Parle-G, Kurkure    |
| 📚   | Stationery        | Notebooks, pens, calculators      |
| 🛒   | Groceries         | Milk, bread, rice                 |
| 🧴   | Personal Care     | Shampoo, toothpaste               |
| 🏠   | Daily Essentials  | Hand wash, household items        |

---

## 🧮 Value Score Formula

```
Value Score = (Average Rating / 5) × (Lowest Campus Price / This Shop's Price) × 100
```

Higher score = better value for money. Only meaningful for products with at least one review.

---

## 🔄 Price Freshness Policy

- Prices updated within **30 days** → shown normally
- Prices older than **30 days** → marked with ⚠️ **Outdated** badge
- Students can report incorrect prices; admins can approve and auto-apply corrections

---

## 🛠️ Technology

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript
- **Storage:** Browser `localStorage` (no server required)
- **Fonts:** Google Fonts — Inter
- **Images:** Unsplash (CDN, no download required)

---

## 📌 Notes for Viva / Presentation

1. All business logic (search, price comparison, value score, outdated detection) is in `app.js`.
2. All data structures (shops, products, prices, reviews) are in `data.js`.
3. The app uses a simple MVC-like separation: data layer (`data.js`), view/controller (`app.js`), styles (`style.css`).
4. `localStorage` simulates a database — in a production app this would be replaced by MySQL + Java Servlets.
5. Password hashing is simulated (plain text for demo); a real app would use BCrypt on the server.
