import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.*;

/**
 * CU PriceWise — Campus Price Comparison Platform
 * Chandigarh University Student Project
 *
 * HOW TO RUN:
 *   javac CUPriceWise.java
 *   java  CUPriceWise
 *   Then open http://localhost:8080 in your browser.
 *
 * The HTML files also open directly in the browser (localStorage mode).
 *
 * STRUCTURE (all in one file for simplicity):
 *   - Model classes  : Product, Shop, ShopProduct, Review, User, PriceReport
 *   - DataStore      : In-memory sample data
 *   - PriceEngine    : Core business logic (comparison, value score, search)
 *   - HttpServer     : Serves static files + REST-like JSON API
 */
public class CUPriceWise {

    // =========================================================
    // SECTION 1 — MODEL CLASSES
    // =========================================================

    static class User {
        int id;
        String name, uid, email, passwordHash, role, createdAt;

        User(int id, String name, String uid, String email,
             String passwordHash, String role) {
            this.id           = id;
            this.name         = name;
            this.uid          = uid;
            this.email        = email;
            this.passwordHash = passwordHash;
            this.role         = role;           // "ADMIN" or "STUDENT"
            this.createdAt    = today();
        }

        /** Convert to JSON string */
        String toJson() {
            return String.format(
                "{\"id\":%d,\"name\":\"%s\",\"uid\":\"%s\"," +
                "\"email\":\"%s\",\"role\":\"%s\",\"createdAt\":\"%s\"}",
                id, esc(name), esc(uid), esc(email), esc(role), esc(createdAt)
            );
        }
    }

    static class Shop {
        int     id;
        String  name, location, block, description, hours;
        List<String> categories;
        double  rating;
        int     reviewCount;
        boolean isActive;
        String  image;

        Shop(int id, String name, String location, String block,
             String description, String hours,
             List<String> categories, double rating, int reviewCount) {
            this.id          = id;
            this.name        = name;
            this.location    = location;
            this.block       = block;
            this.description = description;
            this.hours       = hours;
            this.categories  = categories;
            this.rating      = rating;
            this.reviewCount = reviewCount;
            this.isActive    = true;
            this.image       = "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&q=80";
        }

        String toJson() {
            String cats = categories.stream()
                .map(c -> "\"" + esc(c) + "\"")
                .collect(Collectors.joining(","));
            return String.format(
                "{\"id\":%d,\"name\":\"%s\",\"location\":\"%s\"," +
                "\"block\":\"%s\",\"description\":\"%s\",\"hours\":\"%s\"," +
                "\"categories\":[%s],\"rating\":%.1f," +
                "\"reviewCount\":%d,\"isActive\":%b,\"image\":\"%s\"}",
                id, esc(name), esc(location), esc(block), esc(description),
                esc(hours), cats, rating, reviewCount, isActive, image
            );
        }
    }

    static class Product {
        int    id;
        String name, brand, category, description, image, unit;
        boolean isActive;

        Product(int id, String name, String brand, String category,
                String description, String unit, String image) {
            this.id          = id;
            this.name        = name;
            this.brand       = brand;
            this.category    = category;
            this.description = description;
            this.unit        = unit;
            this.image       = image;
            this.isActive    = true;
        }

        String toJson() {
            return String.format(
                "{\"id\":%d,\"name\":\"%s\",\"brand\":\"%s\"," +
                "\"category\":\"%s\",\"description\":\"%s\"," +
                "\"unit\":\"%s\",\"image\":\"%s\",\"isActive\":%b}",
                id, esc(name), esc(brand), esc(category),
                esc(description), esc(unit), esc(image), isActive
            );
        }
    }

    static class ShopProduct {
        int     id, shopId, productId;
        double  price;
        boolean available;
        String  lastUpdated, updatedBy;

        ShopProduct(int id, int shopId, int productId,
                    double price, boolean available, String updatedBy) {
            this.id          = id;
            this.shopId      = shopId;
            this.productId   = productId;
            this.price       = price;
            this.available   = available;
            this.lastUpdated = today();
            this.updatedBy   = updatedBy;
        }

        /** Allow custom date for sample data */
        ShopProduct withDate(String date) {
            this.lastUpdated = date;
            return this;
        }

        String toJson() {
            return String.format(
                "{\"id\":%d,\"shopId\":%d,\"productId\":%d," +
                "\"price\":%.2f,\"available\":%b," +
                "\"lastUpdated\":\"%s\",\"updatedBy\":\"%s\"}",
                id, shopId, productId, price,
                available, lastUpdated, esc(updatedBy)
            );
        }
    }

    static class Review {
        int    id, userId, productId, rating;
        String comment, createdAt;

        Review(int id, int userId, int productId, int rating, String comment) {
            this.id        = id;
            this.userId    = userId;
            this.productId = productId;
            this.rating    = rating;
            this.comment   = comment;
            this.createdAt = today();
        }

        Review withDate(String date) { this.createdAt = date; return this; }

        String toJson() {
            return String.format(
                "{\"id\":%d,\"userId\":%d,\"productId\":%d," +
                "\"rating\":%d,\"comment\":\"%s\",\"createdAt\":\"%s\"}",
                id, userId, productId, rating, esc(comment), esc(createdAt)
            );
        }
    }

    static class PriceReport {
        int    id, userId, shopProductId;
        Double reportedPrice;
        String reportType, comment, status, createdAt;

        PriceReport(int id, int userId, int shopProductId,
                    Double reportedPrice, String reportType, String comment) {
            this.id             = id;
            this.userId         = userId;
            this.shopProductId  = shopProductId;
            this.reportedPrice  = reportedPrice;
            this.reportType     = reportType;
            this.comment        = comment;
            this.status         = "PENDING";
            this.createdAt      = today();
        }

        String toJson() {
            String priceStr = reportedPrice != null
                ? String.format("%.2f", reportedPrice) : "null";
            return String.format(
                "{\"id\":%d,\"userId\":%d,\"shopProductId\":%d," +
                "\"reportedPrice\":%s,\"reportType\":\"%s\"," +
                "\"comment\":\"%s\",\"status\":\"%s\",\"createdAt\":\"%s\"}",
                id, userId, shopProductId, priceStr,
                esc(reportType), esc(comment), esc(status), esc(createdAt)
            );
        }
    }

    // =========================================================
    // SECTION 2 — DATA STORE  (in-memory, replaces MySQL for demo)
    // =========================================================

    static class DataStore {
        List<User>         users        = new ArrayList<>();
        List<Shop>         shops        = new ArrayList<>();
        List<Product>      products     = new ArrayList<>();
        List<ShopProduct>  shopProducts = new ArrayList<>();
        List<Review>       reviews      = new ArrayList<>();
        List<PriceReport>  reports      = new ArrayList<>();

        // Auto-increment counters
        int nextUserId = 6, nextShopId = 7, nextProductId = 18;
        int nextSpId = 49, nextReviewId = 19, nextReportId = 4;

        void seed() {
            // ── USERS ──────────────────────────────────────────────
            users.add(new User(1, "Admin CU",     "admin001",   "admin@cupricewise.in", hashPwd("admin123"),  "ADMIN"));
            users.add(new User(2, "Arjun Sharma",  "22CSE10001", "arjun@cumail.in",     hashPwd("pass1234"),  "STUDENT"));
            users.add(new User(3, "Priya Mehta",   "22CSE10042", "priya@cumail.in",     hashPwd("pass1234"),  "STUDENT"));
            users.add(new User(4, "Rahul Verma",   "22EEE10077", "rahul@cumail.in",     hashPwd("pass1234"),  "STUDENT"));
            users.add(new User(5, "Sneha Patel",   "22MBA10033", "sneha@cumail.in",     hashPwd("pass1234"),  "STUDENT"));

            // ── SHOPS ──────────────────────────────────────────────
            shops.add(new Shop(1, "CU Campus Mart",
                "Block 10, Ground Floor", "Block 10",
                "General convenience store with groceries, snacks and daily essentials.",
                "8:00 AM – 10:00 PM",
                Arrays.asList("Groceries","Snacks","Daily Essentials"), 4.2, 87));

            shops.add(new Shop(2, "The Book Corner",
                "Library Block, Near Entrance", "Library Block",
                "Stationery, books, academic supplies and printing services.",
                "9:00 AM – 7:00 PM",
                Arrays.asList("Stationery","Books"), 4.5, 63));

            shops.add(new Shop(3, "Hunger Hub",
                "Student Activity Centre, Level 1", "SAC Block",
                "Hot beverages, packaged foods, instant noodles and cold drinks.",
                "7:30 AM – 11:00 PM",
                Arrays.asList("Food & Beverages","Snacks"), 4.0, 142));

            shops.add(new Shop(4, "FreshMart",
                "Hostel Zone, Block H4", "Hostel Zone",
                "Fresh groceries, dairy, personal care and essential household items.",
                "7:00 AM – 10:30 PM",
                Arrays.asList("Groceries","Daily Essentials","Personal Care"), 3.9, 55));

            shops.add(new Shop(5, "Stationery World",
                "Engineering Block A, Near Canteen", "Engineering Block A",
                "Pens, notebooks, drafting tools and all academic needs.",
                "9:00 AM – 6:30 PM",
                Arrays.asList("Stationery"), 4.3, 41));

            shops.add(new Shop(6, "Quick Bites",
                "MBA Block, Ground Floor", "MBA Block",
                "Fast snacks, energy drinks, biscuits and cold beverages.",
                "8:00 AM – 9:00 PM",
                Arrays.asList("Snacks","Food & Beverages"), 3.7, 29));

            // ── PRODUCTS ───────────────────────────────────────────
            // Food & Beverages
            products.add(new Product(1,  "Cold Coffee",          "Campus Brewed",    "Food & Beverages",
                "Chilled cold coffee, freshly made with milk and instant coffee.",
                "300 ml cup", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80"));
            products.add(new Product(2,  "Masala Chai",          "Campus Brewed",    "Food & Beverages",
                "Hot spiced chai made fresh with ginger and cardamom.",
                "200 ml cup", "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80"));
            products.add(new Product(3,  "Mineral Water Bottle", "Aquafina",         "Food & Beverages",
                "Purified mineral water, 1 litre sealed bottle.",
                "1 L bottle", "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80"));
            // Snacks
            products.add(new Product(4,  "Maggi Noodles",        "Nestle",           "Snacks",
                "Classic Maggi 2-minute noodles, Masala flavour.",
                "70 g pack",  "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80"));
            products.add(new Product(5,  "Lays Classic Salted",  "Lays",             "Snacks",
                "Crispy salted potato chips.",
                "26 g pack",  "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80"));
            products.add(new Product(6,  "Parle-G Biscuits",     "Parle",            "Snacks",
                "Classic glucose biscuits, family pack.",
                "100 g pack", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80"));
            products.add(new Product(7,  "Kurkure Masala Munch", "Kurkure",          "Snacks",
                "Spicy puffed corn snack.",
                "50 g pack",  "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80"));
            // Stationery
            products.add(new Product(8,  "A4 Notebook",          "Classmate",        "Stationery",
                "200-page ruled A4 notebook, hard cover.",
                "200 pages",  "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=400&q=80"));
            products.add(new Product(9,  "Ball Point Pen",       "Reynolds",         "Stationery",
                "Smooth writing blue ballpoint pen.",
                "1 piece",    "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=400&q=80"));
            products.add(new Product(10, "Scientific Calculator","Casio",            "Stationery",
                "Casio FX-991 scientific calculator.",
                "1 piece",    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80"));
            products.add(new Product(11, "Highlighter Set",      "Staedtler",        "Stationery",
                "Neon highlighters, set of 4 colours.",
                "Set of 4",   "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&q=80"));
            // Groceries
            products.add(new Product(12, "Milk (Full Cream)",    "Amul",             "Groceries",
                "Full cream pasteurised milk.",
                "500 ml pouch","https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80"));
            products.add(new Product(13, "Whole Wheat Bread",    "Britannia",        "Groceries",
                "100% whole wheat sliced bread.",
                "400 g loaf", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80"));
            products.add(new Product(14, "Basmati Rice",         "India Gate",       "Groceries",
                "Premium aged basmati rice.",
                "1 kg pack",  "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80"));
            // Personal Care
            products.add(new Product(15, "Head & Shoulders Shampoo","Head & Shoulders","Personal Care",
                "Anti-dandruff shampoo, classic clean.",
                "180 ml bottle","https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80"));
            products.add(new Product(16, "Colgate Toothpaste",   "Colgate",          "Personal Care",
                "Strong Teeth toothpaste with calcium.",
                "150 g tube", "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80"));
            products.add(new Product(17, "Dettol Hand Wash",     "Dettol",           "Daily Essentials",
                "Antibacterial liquid hand wash.",
                "200 ml pump","https://images.unsplash.com/photo-1584038877214-a08a8e5a9f4c?w=400&q=80"));

            // ── SHOP-PRODUCT PRICE LISTINGS ────────────────────────
            // Cold Coffee (product 1)
            shopProducts.add(new ShopProduct(1, 1, 1, 40, true,  "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(2, 3, 1, 35, true,  "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(3, 6, 1, 45, true,  "student").withDate("2026-10-15"));
            // Masala Chai (product 2)
            shopProducts.add(new ShopProduct(4, 1, 2, 15, true,  "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(5, 3, 2, 12, true,  "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(6, 4, 2, 15, true,  "admin").withDate("2026-10-27"));
            shopProducts.add(new ShopProduct(7, 6, 2, 18, true,  "student").withDate("2026-09-10"));
            // Water Bottle (product 3)
            shopProducts.add(new ShopProduct(8,  1, 3, 20, true,  "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(9,  3, 3, 22, true,  "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(10, 4, 3, 20, true,  "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(11, 5, 3, 25, false, "student").withDate("2026-10-01"));
            shopProducts.add(new ShopProduct(12, 6, 3, 22, true,  "admin").withDate("2026-10-20"));
            // Maggi (product 4)
            shopProducts.add(new ShopProduct(13, 1, 4, 14, true, "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(14, 3, 4, 15, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(15, 4, 4, 14, true, "admin").withDate("2026-10-27"));
            shopProducts.add(new ShopProduct(16, 6, 4, 16, true, "admin").withDate("2026-10-25"));
            // Lays (product 5)
            shopProducts.add(new ShopProduct(17, 1, 5, 20, true, "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(18, 3, 5, 20, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(19, 6, 5, 22, true, "student").withDate("2026-10-10"));
            // Parle-G (product 6)
            shopProducts.add(new ShopProduct(20, 1, 6, 10, true, "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(21, 3, 6, 10, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(22, 4, 6, 12, true, "admin").withDate("2026-10-27"));
            shopProducts.add(new ShopProduct(23, 6, 6, 10, true, "admin").withDate("2026-10-26"));
            // Kurkure (product 7)
            shopProducts.add(new ShopProduct(24, 1, 7, 20, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(25, 3, 7, 20, true, "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(26, 6, 7, 22, true, "student").withDate("2026-09-20"));
            // A4 Notebook (product 8)
            shopProducts.add(new ShopProduct(27, 2, 8, 85, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(28, 5, 8, 80, true, "admin").withDate("2026-10-29"));
            // Pen (product 9)
            shopProducts.add(new ShopProduct(29, 2, 9, 10, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(30, 5, 9,  8, true, "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(31, 1, 9, 12, true, "student").withDate("2026-10-20"));
            // Calculator (product 10)
            shopProducts.add(new ShopProduct(32, 2, 10, 1200, true, "admin").withDate("2026-10-25"));
            shopProducts.add(new ShopProduct(33, 5, 10, 1150, true, "admin").withDate("2026-10-28"));
            // Highlighter (product 11)
            shopProducts.add(new ShopProduct(34, 2, 11, 90, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(35, 5, 11, 85, true, "admin").withDate("2026-10-29"));
            // Milk (product 12)
            shopProducts.add(new ShopProduct(36, 1, 12, 32, true, "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(37, 4, 12, 30, true, "admin").withDate("2026-10-29"));
            // Bread (product 13)
            shopProducts.add(new ShopProduct(38, 1, 13, 45, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(39, 4, 13, 42, true, "admin").withDate("2026-10-29"));
            // Rice (product 14)
            shopProducts.add(new ShopProduct(40, 1, 14, 120, true, "admin").withDate("2026-10-27"));
            shopProducts.add(new ShopProduct(41, 4, 14, 110, true, "admin").withDate("2026-10-28"));
            // Shampoo (product 15)
            shopProducts.add(new ShopProduct(42, 1, 15, 145, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(43, 4, 15, 140, true, "admin").withDate("2026-10-29"));
            // Toothpaste (product 16)
            shopProducts.add(new ShopProduct(44, 1, 16, 68, true, "admin").withDate("2026-10-27"));
            shopProducts.add(new ShopProduct(45, 4, 16, 65, true, "admin").withDate("2026-10-28"));
            // Hand Wash (product 17)
            shopProducts.add(new ShopProduct(46, 1, 17, 90, true, "admin").withDate("2026-10-28"));
            shopProducts.add(new ShopProduct(47, 4, 17, 88, true, "admin").withDate("2026-10-29"));
            shopProducts.add(new ShopProduct(48, 6, 17, 95, true, "student").withDate("2026-09-15"));

            // ── REVIEWS ────────────────────────────────────────────
            reviews.add(new Review(1, 2, 1, 5, "Best cold coffee on campus! Hunger Hub makes it perfectly.").withDate("2026-10-20"));
            reviews.add(new Review(2, 3, 1, 4, "Good taste, slightly too sweet but worth the price.").withDate("2026-10-22"));
            reviews.add(new Review(3, 4, 1, 3, "Average. Campus Mart version is a bit watery.").withDate("2026-10-25"));
            reviews.add(new Review(4, 2, 2, 5, "Hunger Hub chai is the real deal. Perfect morning fix.").withDate("2026-10-18"));
            reviews.add(new Review(5, 3, 2, 4, "Fresh and hot. Good value at Rs.12.").withDate("2026-10-21"));
            reviews.add(new Review(6, 5, 3, 4, "Standard Aquafina, always available at Campus Mart.").withDate("2026-10-15"));
            reviews.add(new Review(7, 2, 4, 4, "Maggi is Maggi. Campus Mart price is fair.").withDate("2026-10-10"));
            reviews.add(new Review(8, 3, 4, 5, "Always stocked, quick and cheap!").withDate("2026-10-12"));
            reviews.add(new Review(9, 4, 5, 3, "Same price everywhere, nothing special.").withDate("2026-10-08"));
            reviews.add(new Review(10,5, 6, 5, "Parle-G is a lifesaver during late night studies.").withDate("2026-10-14"));
            reviews.add(new Review(11,2, 8, 5, "Book Corner has the best notebooks. Strong binding.").withDate("2026-10-05"));
            reviews.add(new Review(12,3, 8, 4, "Stationery World is Rs.5 cheaper. Good quality too.").withDate("2026-10-07"));
            reviews.add(new Review(13,4, 9, 5, "Reynolds pen from Stationery World at Rs.8 is unbeatable!").withDate("2026-10-09"));
            reviews.add(new Review(14,5,10, 4, "Casio calculator, same model. Stationery World cheaper.").withDate("2026-10-11"));
            reviews.add(new Review(15,2,12, 4, "FreshMart milk is always fresh. Slightly cheaper than Campus Mart.").withDate("2026-10-16"));
            reviews.add(new Review(16,3,13, 4, "FreshMart bread is softer and cheaper.").withDate("2026-10-17"));
            reviews.add(new Review(17,4,15, 3, "Both shops carry the same H&S. FreshMart is a bit cheaper.").withDate("2026-10-19"));
            reviews.add(new Review(18,5,16, 4, "FreshMart beats Campus Mart by Rs.3. Always go there.").withDate("2026-10-22"));

            // ── PRICE REPORTS ──────────────────────────────────────
            reports.add(new PriceReport(1, 2, 3, 50.0, "WRONG_PRICE",  "Quick Bites now charges Rs.50 for cold coffee."));
            reports.add(new PriceReport(2, 3, 7, 20.0, "WRONG_PRICE",  "MBA Quick Bites chai is now Rs.20."));
            reports.add(new PriceReport(3, 4, 11,null, "UNAVAILABLE",  "Stationery World does not stock water bottles."));
            reports.get(2).status = "APPROVED";
        }
    }

    // =========================================================
    // SECTION 3 — BUSINESS LOGIC: PriceEngine
    // =========================================================

    static class PriceEngine {

        /**
         * Find the lowest available price for a product across all shops.
         * Only considers active shops with the product in stock.
         */
        static double lowestPrice(int productId, DataStore db) {
            return db.shopProducts.stream()
                .filter(sp -> sp.productId == productId && sp.available)
                .filter(sp -> db.shops.stream()
                    .anyMatch(s -> s.id == sp.shopId && s.isActive))
                .mapToDouble(sp -> sp.price)
                .min()
                .orElse(-1);
        }

        /**
         * Find the highest available price for a product across all shops.
         */
        static double highestPrice(int productId, DataStore db) {
            return db.shopProducts.stream()
                .filter(sp -> sp.productId == productId && sp.available)
                .filter(sp -> db.shops.stream()
                    .anyMatch(s -> s.id == sp.shopId && s.isActive))
                .mapToDouble(sp -> sp.price)
                .max()
                .orElse(-1);
        }

        /**
         * Calculate potential savings: highest price minus lowest price.
         * Returns 0 if there is only one listing or no data.
         */
        static double potentialSavings(int productId, DataStore db) {
            double lo = lowestPrice(productId, db);
            double hi = highestPrice(productId, db);
            if (lo < 0 || hi < 0) return 0;
            return hi - lo;
        }

        /**
         * Calculate average rating from all reviews for a product.
         * Returns -1 if no reviews exist.
         */
        static double averageRating(int productId, DataStore db) {
            List<Review> revs = db.reviews.stream()
                .filter(r -> r.productId == productId)
                .collect(Collectors.toList());
            if (revs.isEmpty()) return -1;
            return revs.stream().mapToInt(r -> r.rating).average().orElse(-1);
        }

        /**
         * Best Value Score formula:
         *   Score = (avgRating / 5) × (lowestCampusPrice / thisPrice) × 100
         *
         * Higher score = better value for money.
         * Only meaningful when both rating and price data exist.
         * Compare products of the same unit/variant only.
         */
        static double valueScore(int productId, double thisPrice, DataStore db) {
            double avg = averageRating(productId, db);
            double lo  = lowestPrice(productId, db);
            if (avg < 0 || lo <= 0 || thisPrice <= 0) return 0;
            return (avg / 5.0) * (lo / thisPrice) * 100.0;
        }

        /**
         * Check if a price listing is outdated (not updated in > 30 days).
         */
        static boolean isOutdated(String dateStr) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                Date updated = sdf.parse(dateStr);
                long diffMs   = new Date().getTime() - updated.getTime();
                long diffDays = diffMs / (1000L * 60 * 60 * 24);
                return diffDays > 30;
            } catch (Exception e) { return false; }
        }

        /**
         * Get all price listings for a product, enriched with shop info,
         * sorted: available+lowest first, unavailable last.
         */
        static List<Map<String, Object>> priceComparison(int productId, DataStore db) {
            double lowest = lowestPrice(productId, db);

            List<ShopProduct> listings = db.shopProducts.stream()
                .filter(sp -> sp.productId == productId)
                .collect(Collectors.toList());

            // Sort: available first, then by price ascending
            listings.sort((a, b) -> {
                if (a.available != b.available)
                    return Boolean.compare(b.available, a.available);
                return Double.compare(a.price, b.price);
            });

            List<Map<String, Object>> result = new ArrayList<>();
            for (ShopProduct sp : listings) {
                Shop shop = db.shops.stream()
                    .filter(s -> s.id == sp.shopId)
                    .findFirst().orElse(null);
                if (shop == null) continue;

                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("shopProductId", sp.id);
                entry.put("shopId",        sp.shopId);
                entry.put("shopName",      shop.name);
                entry.put("location",      shop.location);
                entry.put("block",         shop.block);
                entry.put("price",         sp.price);
                entry.put("available",     sp.available);
                entry.put("lastUpdated",   sp.lastUpdated);
                entry.put("updatedBy",     sp.updatedBy);
                entry.put("isLowest",      sp.available && sp.price == lowest);
                entry.put("savingsVsThis", sp.available && lowest >= 0
                                            ? sp.price - lowest : null);
                entry.put("isOutdated",   isOutdated(sp.lastUpdated));
                result.add(entry);
            }
            return result;
        }

        /**
         * Search products by name/brand/description (case-insensitive, partial match).
         * Optionally filter by category. Returns enriched product info.
         */
        static List<Map<String, Object>> search(
                String query, String category,
                String sortBy, DataStore db) {

            String q = query == null ? "" : query.trim().toLowerCase();

            List<Product> filtered = db.products.stream()
                .filter(p -> p.isActive)
                .filter(p -> q.isEmpty()
                    || p.name.toLowerCase().contains(q)
                    || p.brand.toLowerCase().contains(q)
                    || p.description.toLowerCase().contains(q))
                .filter(p -> category == null || category.isEmpty()
                    || p.category.equals(category))
                .collect(Collectors.toList());

            // Enrich each product with pricing + rating data
            List<Map<String, Object>> enriched = filtered.stream()
                .map(p -> enrichProduct(p, db))
                .collect(Collectors.toList());

            // Sort
            if ("price_asc".equals(sortBy)) {
                enriched.sort((a, b) -> {
                    Object va = a.get("lowestPrice"), vb = b.get("lowestPrice");
                    double da = va instanceof Number ? ((Number) va).doubleValue() : 999999d;
                    double db2 = vb instanceof Number ? ((Number) vb).doubleValue() : 999999d;
                    return Double.compare(da, db2);
                });
            } else if ("rating".equals(sortBy)) {
                enriched.sort((a, b) -> {
                    Object va = a.get("avgRating"), vb = b.get("avgRating");
                    double da = va instanceof Number ? ((Number) va).doubleValue() : -1d;
                    double db2 = vb instanceof Number ? ((Number) vb).doubleValue() : -1d;
                    return Double.compare(db2, da);
                });
            } else if ("value".equals(sortBy)) {
                enriched.sort((a, b) -> {
                    Object va = a.get("valueScore"), vb = b.get("valueScore");
                    double da = va instanceof Number ? ((Number) va).doubleValue() : 0d;
                    double db2 = vb instanceof Number ? ((Number) vb).doubleValue() : 0d;
                    return Double.compare(db2, da);
                });
            } else {
                enriched.sort((a, b) -> {
                    String na = a.get("name") instanceof String ? (String) a.get("name") : "";
                    String nb = b.get("name") instanceof String ? (String) b.get("name") : "";
                    return na.compareTo(nb);
                });
            }
            return enriched;
        }

        /** Attach price/rating summary fields to a product map. */
        static Map<String, Object> enrichProduct(Product p, DataStore db) {
            double lo      = lowestPrice(p.id, db);
            double hi      = highestPrice(p.id, db);
            double avg     = averageRating(p.id, db);
            int    revCnt  = (int) db.reviews.stream()
                                .filter(r -> r.productId == p.id).count();
            long   shopCnt = db.shopProducts.stream()
                                .filter(sp -> sp.productId == p.id && sp.available).count();
            double vScore  = avg >= 0 && lo > 0 ? (avg/5.0)*(lo/lo)*100 : 0;

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",          p.id);
            m.put("name",        p.name);
            m.put("brand",       p.brand);
            m.put("category",    p.category);
            m.put("description", p.description);
            m.put("unit",        p.unit);
            m.put("image",       p.image);
            m.put("lowestPrice", lo >= 0 ? lo : null);
            m.put("highestPrice",hi >= 0 ? hi : null);
            m.put("savings",     lo >= 0 && hi >= 0 ? hi - lo : 0);
            m.put("avgRating",   avg >= 0 ? Math.round(avg * 10.0) / 10.0 : null);
            m.put("reviewCount", revCnt);
            m.put("shopCount",   shopCnt);
            m.put("valueScore",  Math.round(vScore * 10.0) / 10.0);
            return m;
        }
    }

    // =========================================================
    // SECTION 4 — HTTP SERVER + API HANDLERS
    // =========================================================

    static DataStore DB = new DataStore();

    // Simple session store: sessionToken -> userId
    static Map<String, Integer> sessions = new HashMap<>();

    public static void main(String[] args) throws Exception {
        DB.seed();

        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Static file handler (serves HTML, CSS, JS)
        server.createContext("/",            new StaticHandler());

        // Auth
        server.createContext("/api/login",    ex -> handleLogin(ex));
        server.createContext("/api/register", ex -> handleRegister(ex));
        server.createContext("/api/logout",   ex -> handleLogout(ex));

        // Products
        server.createContext("/api/products", ex -> handleProducts(ex));

        // Shops
        server.createContext("/api/shops",    ex -> handleShops(ex));

        // Reviews
        server.createContext("/api/reviews",  ex -> handleReviews(ex));

        // Reports
        server.createContext("/api/reports",  ex -> handleReports(ex));

        // Admin
        server.createContext("/api/admin/prices",   ex -> handleAdminPrices(ex));
        server.createContext("/api/admin/approve",  ex -> handleAdminApprove(ex));
        server.createContext("/api/admin/shops",    ex -> handleAdminShops(ex));
        server.createContext("/api/admin/products", ex -> handleAdminProducts(ex));

        server.setExecutor(null);
        server.start();

        System.out.println("==============================================");
        System.out.println("  CU PriceWise server running!");
        System.out.println("  Open: http://localhost:" + port);
        System.out.println("  Admin login : admin@cupricewise.in / admin123");
        System.out.println("  Student login: arjun@cumail.in / pass1234");
        System.out.println("==============================================");
    }

    // ── STATIC FILE SERVER ─────────────────────────────────────
    static class StaticHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange ex) throws IOException {
            String path = ex.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";

            // Serve from current directory
            File file = new File("." + path);
            if (!file.exists() || file.isDirectory()) {
                respond(ex, 404, "text/plain", "404 Not Found");
                return;
            }
            String mime = guessMime(path);
            byte[] bytes = Files.readAllBytes(file.toPath());
            ex.getResponseHeaders().set("Content-Type", mime);
            ex.sendResponseHeaders(200, bytes.length);
            ex.getResponseBody().write(bytes);
            ex.getResponseBody().close();
        }

        String guessMime(String path) {
            if (path.endsWith(".html")) return "text/html; charset=utf-8";
            if (path.endsWith(".css"))  return "text/css; charset=utf-8";
            if (path.endsWith(".js"))   return "application/javascript; charset=utf-8";
            if (path.endsWith(".png"))  return "image/png";
            if (path.endsWith(".ico"))  return "image/x-icon";
            return "application/octet-stream";
        }
    }

    // ── AUTH HANDLERS ──────────────────────────────────────────

    static void handleLogin(HttpExchange ex) throws IOException {
        if (!"POST".equals(ex.getRequestMethod())) { respond(ex,405,"text/plain","Method Not Allowed"); return; }
        Map<String,String> body = parseBody(ex);
        String email = body.getOrDefault("email","");
        String pwd   = body.getOrDefault("password","");

        User user = DB.users.stream()
            .filter(u -> u.email.equals(email) && u.passwordHash.equals(hashPwd(pwd)))
            .findFirst().orElse(null);

        if (user == null) { respondJson(ex, 401, "{\"error\":\"Invalid email or password.\"}"); return; }

        // Create session token
        String token = UUID.randomUUID().toString();
        sessions.put(token, user.id);
        respondJson(ex, 200, "{\"token\":\"" + token + "\",\"user\":" + user.toJson() + "}");
    }

    static void handleRegister(HttpExchange ex) throws IOException {
        if (!"POST".equals(ex.getRequestMethod())) { respond(ex,405,"text/plain","Method Not Allowed"); return; }
        Map<String,String> body = parseBody(ex);
        String name  = body.getOrDefault("name","").trim();
        String uid   = body.getOrDefault("uid","").trim();
        String email = body.getOrDefault("email","").trim();
        String pwd   = body.getOrDefault("password","");

        if (name.isEmpty() || uid.isEmpty() || email.isEmpty() || pwd.isEmpty()) {
            respondJson(ex, 400, "{\"error\":\"All fields are required.\"}"); return; }
        if (pwd.length() < 6) {
            respondJson(ex, 400, "{\"error\":\"Password must be at least 6 characters.\"}"); return; }
        if (DB.users.stream().anyMatch(u -> u.email.equals(email))) {
            respondJson(ex, 400, "{\"error\":\"Email already registered.\"}"); return; }
        if (DB.users.stream().anyMatch(u -> u.uid.equals(uid))) {
            respondJson(ex, 400, "{\"error\":\"UID already registered.\"}"); return; }

        int id = DB.nextUserId++;
        User newUser = new User(id, name, uid, email, hashPwd(pwd), "STUDENT");
        DB.users.add(newUser);

        String token = UUID.randomUUID().toString();
        sessions.put(token, id);
        respondJson(ex, 201, "{\"token\":\"" + token + "\",\"user\":" + newUser.toJson() + "}");
    }

    static void handleLogout(HttpExchange ex) throws IOException {
        String token = getToken(ex);
        if (token != null) sessions.remove(token);
        respondJson(ex, 200, "{\"message\":\"Logged out.\"}");
    }

    // ── PRODUCTS HANDLER ────────────────────────────────────────
    static void handleProducts(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String path   = ex.getRequestURI().getPath();   // /api/products or /api/products/5

        // GET /api/products/{id}  — product detail + price comparison
        if ("GET".equals(method) && path.matches("/api/products/\\d+")) {
            int id = Integer.parseInt(path.substring(path.lastIndexOf('/') + 1));
            Product p = DB.products.stream().filter(x -> x.id == id).findFirst().orElse(null);
            if (p == null) { respondJson(ex, 404, "{\"error\":\"Product not found.\"}"); return; }

            Map<String, Object> enriched = PriceEngine.enrichProduct(p, DB);
            List<Map<String, Object>> comparison = PriceEngine.priceComparison(id, DB);
            List<Review> revs = DB.reviews.stream()
                .filter(r -> r.productId == id).collect(Collectors.toList());

            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"product\":").append(mapToJson(enriched)).append(",");
            sb.append("\"listings\":").append(listToJson(comparison)).append(",");
            sb.append("\"reviews\":").append("[");
            sb.append(revs.stream().map(Review::toJson).collect(Collectors.joining(",")));
            sb.append("]}");
            respondJson(ex, 200, sb.toString());
            return;
        }

        // GET /api/products  — search with filters
        if ("GET".equals(method)) {
            Map<String,String> params = parseQuery(ex.getRequestURI().getQuery());
            String query    = params.get("q");
            String category = params.get("category");
            String sortBy   = params.get("sort");
            List<Map<String, Object>> results = PriceEngine.search(query, category, sortBy, DB);
            respondJson(ex, 200, "[" + results.stream().map(CUPriceWise::mapToJson).collect(Collectors.joining(",")) + "]");
            return;
        }

        // POST /api/products  — admin: add product
        if ("POST".equals(method)) {
            if (!isAdmin(ex)) { respondJson(ex, 403, "{\"error\":\"Admin only.\"}"); return; }
            Map<String,String> body = parseBody(ex);
            int id = DB.nextProductId++;
            Product p = new Product(id,
                body.getOrDefault("name",""),
                body.getOrDefault("brand",""),
                body.getOrDefault("category",""),
                body.getOrDefault("description",""),
                body.getOrDefault("unit",""),
                body.getOrDefault("image","https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400&q=80"));
            DB.products.add(p);
            respondJson(ex, 201, p.toJson());
            return;
        }

        respond(ex, 405, "text/plain", "Method Not Allowed");
    }

    // ── SHOPS HANDLER ────────────────────────────────────────────
    static void handleShops(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();
        String path   = ex.getRequestURI().getPath();

        // GET /api/shops/{id}/products
        if ("GET".equals(method) && path.matches("/api/shops/\\d+/products")) {
            int id = Integer.parseInt(path.split("/")[3]);
            List<ShopProduct> listings = DB.shopProducts.stream()
                .filter(sp -> sp.shopId == id).collect(Collectors.toList());
            List<String> jsonList = new ArrayList<>();
            for (ShopProduct sp : listings) {
                Product p = DB.products.stream()
                    .filter(x -> x.id == sp.productId).findFirst().orElse(null);
                if (p == null) continue;
                Map<String,Object> enriched = PriceEngine.enrichProduct(p, DB);
                enriched.put("shopPrice", sp.price);
                enriched.put("available", sp.available);
                jsonList.add(mapToJson(enriched));
            }
            respondJson(ex, 200, "[" + String.join(",", jsonList) + "]");
            return;
        }

        // GET /api/shops/{id}
        if ("GET".equals(method) && path.matches("/api/shops/\\d+")) {
            int id = Integer.parseInt(path.substring(path.lastIndexOf('/') + 1));
            Shop s = DB.shops.stream().filter(x -> x.id == id).findFirst().orElse(null);
            if (s == null) { respondJson(ex, 404, "{\"error\":\"Shop not found.\"}"); return; }
            respondJson(ex, 200, s.toJson());
            return;
        }

        // GET /api/shops  — list all active shops
        if ("GET".equals(method)) {
            String json = DB.shops.stream()
                .filter(s -> s.isActive)
                .sorted(Comparator.comparingDouble((Shop s) -> s.rating).reversed())
                .map(Shop::toJson)
                .collect(Collectors.joining(",", "[", "]"));
            respondJson(ex, 200, json);
            return;
        }

        // POST /api/shops  — admin: add shop
        if ("POST".equals(method)) {
            if (!isAdmin(ex)) { respondJson(ex, 403, "{\"error\":\"Admin only.\"}"); return; }
            Map<String,String> body = parseBody(ex);
            int id = DB.nextShopId++;
            Shop shop = new Shop(id,
                body.getOrDefault("name",""),
                body.getOrDefault("location",""),
                body.getOrDefault("block",""),
                body.getOrDefault("description",""),
                body.getOrDefault("hours",""),
                Arrays.asList(body.getOrDefault("categories","").split(",")),
                0, 0);
            DB.shops.add(shop);
            respondJson(ex, 201, shop.toJson());
            return;
        }

        respond(ex, 405, "text/plain", "Method Not Allowed");
    }

    // ── REVIEWS HANDLER ──────────────────────────────────────────
    static void handleReviews(HttpExchange ex) throws IOException {
        if (!"POST".equals(ex.getRequestMethod())) { respond(ex,405,"text/plain","Method Not Allowed"); return; }
        Integer userId = getUser(ex);
        if (userId == null) { respondJson(ex, 401, "{\"error\":\"Sign in to submit a review.\"}"); return; }

        Map<String,String> body = parseBody(ex);
        int    productId = Integer.parseInt(body.getOrDefault("productId","0"));
        int    rating    = Integer.parseInt(body.getOrDefault("rating","0"));
        String comment   = body.getOrDefault("comment","").trim();

        if (rating < 1 || rating > 5) { respondJson(ex,400,"{\"error\":\"Rating must be 1–5.\"}"); return; }
        if (comment.isEmpty())        { respondJson(ex,400,"{\"error\":\"Comment is required.\"}"); return; }

        // Update existing review if present
        Optional<Review> existing = DB.reviews.stream()
            .filter(r -> r.userId == userId && r.productId == productId)
            .findFirst();
        if (existing.isPresent()) {
            Review r = existing.get();
            r.rating = rating; r.comment = comment; r.createdAt = today();
            respondJson(ex, 200, r.toJson()); return;
        }

        int id = DB.nextReviewId++;
        Review rev = new Review(id, userId, productId, rating, comment);
        DB.reviews.add(rev);
        respondJson(ex, 201, rev.toJson());
    }

    // ── REPORTS HANDLER ──────────────────────────────────────────
    static void handleReports(HttpExchange ex) throws IOException {
        if (!"POST".equals(ex.getRequestMethod())) { respond(ex,405,"text/plain","Method Not Allowed"); return; }
        Integer userId = getUser(ex);
        if (userId == null) { respondJson(ex,401,"{\"error\":\"Sign in to submit a report.\"}"); return; }

        Map<String,String> body  = parseBody(ex);
        int    spId  = Integer.parseInt(body.getOrDefault("shopProductId","0"));
        String type  = body.getOrDefault("reportType","OTHER");
        String comm  = body.getOrDefault("comment","").trim();
        String prStr = body.getOrDefault("reportedPrice","");
        Double price = prStr.isEmpty() ? null : Double.parseDouble(prStr);

        if (comm.isEmpty()) { respondJson(ex,400,"{\"error\":\"Comment is required.\"}"); return; }

        int id = DB.nextReportId++;
        PriceReport rpt = new PriceReport(id, userId, spId, price, type, comm);
        DB.reports.add(rpt);
        respondJson(ex, 201, rpt.toJson());
    }

    // ── ADMIN: PRICE LISTINGS ────────────────────────────────────
    static void handleAdminPrices(HttpExchange ex) throws IOException {
        if (!isAdmin(ex)) { respondJson(ex,403,"{\"error\":\"Admin only.\"}"); return; }

        if ("GET".equals(ex.getRequestMethod())) {
            String json = DB.shopProducts.stream()
                .map(ShopProduct::toJson)
                .collect(Collectors.joining(",","[","]"));
            respondJson(ex,200,json); return;
        }

        if ("POST".equals(ex.getRequestMethod())) {
            Map<String,String> body = parseBody(ex);
            int    shopId    = Integer.parseInt(body.getOrDefault("shopId","0"));
            int    productId = Integer.parseInt(body.getOrDefault("productId","0"));
            double price     = Double.parseDouble(body.getOrDefault("price","0"));
            boolean avail    = "true".equals(body.getOrDefault("available","true"));

            // Upsert: update if exists, insert if not
            Optional<ShopProduct> existing = DB.shopProducts.stream()
                .filter(sp -> sp.shopId == shopId && sp.productId == productId)
                .findFirst();
            if (existing.isPresent()) {
                ShopProduct sp = existing.get();
                sp.price = price; sp.available = avail;
                sp.lastUpdated = today(); sp.updatedBy = "admin";
                respondJson(ex, 200, sp.toJson());
            } else {
                int id = DB.nextSpId++;
                ShopProduct sp = new ShopProduct(id, shopId, productId, price, avail, "admin");
                DB.shopProducts.add(sp);
                respondJson(ex, 201, sp.toJson());
            }
        }
    }

    // ── ADMIN: APPROVE PRICE REPORT ──────────────────────────────
    static void handleAdminApprove(HttpExchange ex) throws IOException {
        if (!isAdmin(ex) || !"POST".equals(ex.getRequestMethod())) {
            respondJson(ex,403,"{\"error\":\"Admin only.\"}"); return; }

        Map<String,String> body   = parseBody(ex);
        int    reportId = Integer.parseInt(body.getOrDefault("reportId","0"));
        String status   = body.getOrDefault("status","REJECTED");

        PriceReport rpt = DB.reports.stream()
            .filter(r -> r.id == reportId).findFirst().orElse(null);
        if (rpt == null) { respondJson(ex,404,"{\"error\":\"Report not found.\"}"); return; }

        rpt.status = status;

        // If approved and has a corrected price, apply it to the listing
        if ("APPROVED".equals(status) && rpt.reportedPrice != null) {
            DB.shopProducts.stream()
                .filter(sp -> sp.id == rpt.shopProductId)
                .findFirst()
                .ifPresent(sp -> {
                    sp.price = rpt.reportedPrice;
                    sp.lastUpdated = today();
                    sp.updatedBy = "student-report";
                });
        }
        respondJson(ex, 200, rpt.toJson());
    }

    // ── ADMIN: SHOPS / PRODUCTS (toggle active) ──────────────────
    static void handleAdminShops(HttpExchange ex) throws IOException {
        if (!isAdmin(ex) || !"POST".equals(ex.getRequestMethod())) {
            respondJson(ex,403,"{\"error\":\"Admin only.\"}"); return; }
        Map<String,String> body = parseBody(ex);
        int id = Integer.parseInt(body.getOrDefault("id","0"));
        DB.shops.stream().filter(s -> s.id == id).findFirst()
            .ifPresent(s -> s.isActive = !s.isActive);
        respondJson(ex, 200, "{\"message\":\"Updated.\"}");
    }

    static void handleAdminProducts(HttpExchange ex) throws IOException {
        if (!isAdmin(ex) || !"POST".equals(ex.getRequestMethod())) {
            respondJson(ex,403,"{\"error\":\"Admin only.\"}"); return; }
        Map<String,String> body = parseBody(ex);
        int id = Integer.parseInt(body.getOrDefault("id","0"));
        DB.products.stream().filter(p -> p.id == id).findFirst()
            .ifPresent(p -> p.isActive = !p.isActive);
        respondJson(ex, 200, "{\"message\":\"Updated.\"}");
    }

    // =========================================================
    // SECTION 5 — UTILITY METHODS
    // =========================================================

    /** Simple SHA-256 password hash (hex string). */
    static String hashPwd(String pwd) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(pwd.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) { return pwd; }
    }

    /** Today's date as yyyy-MM-dd string. */
    static String today() {
        return new SimpleDateFormat("yyyy-MM-dd").format(new Date());
    }

    /** Escape double-quotes and backslashes in JSON strings. */
    static String esc(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    /** Parse URL query string into a key-value map. */
    static Map<String, String> parseQuery(String query) {
        Map<String, String> params = new HashMap<>();
        if (query == null || query.isEmpty()) return params;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                try {
                    params.put(URLDecoder.decode(kv[0], "UTF-8"),
                               URLDecoder.decode(kv[1], "UTF-8"));
                } catch (Exception ignored) {}
            }
        }
        return params;
    }

    /** Parse application/x-www-form-urlencoded or simple key=value POST body. */
    static Map<String, String> parseBody(HttpExchange ex) throws IOException {
        InputStream is = ex.getRequestBody();
        String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        return parseQuery(raw);
    }

    /** Extract Bearer token from Authorization header. */
    static String getToken(HttpExchange ex) {
        String auth = ex.getRequestHeaders().getFirst("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) return auth.substring(7);
        return null;
    }

    /** Return the logged-in user ID from the session token, or null. */
    static Integer getUser(HttpExchange ex) {
        String token = getToken(ex);
        return token != null ? sessions.get(token) : null;
    }

    /** Return true if the request comes from an authenticated Admin user. */
    static boolean isAdmin(HttpExchange ex) {
        Integer userId = getUser(ex);
        if (userId == null) return false;
        return DB.users.stream()
            .anyMatch(u -> u.id == userId && "ADMIN".equals(u.role));
    }

    /** Send a plain text or HTML response. */
    static void respond(HttpExchange ex, int code, String mime, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", mime + "; charset=utf-8");
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.sendResponseHeaders(code, bytes.length);
        OutputStream os = ex.getResponseBody();
        os.write(bytes);
        os.close();
    }

    /** Send a JSON response. */
    static void respondJson(HttpExchange ex, int code, String json) throws IOException {
        respond(ex, code, "application/json", json);
    }

    /** Serialize a Map<String,Object> to a compact JSON object string. */
    static String mapToJson(Map<String, Object> m) {
        StringBuilder sb = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> e : m.entrySet()) {
            if (!first) sb.append(",");
            sb.append("\"").append(esc(e.getKey())).append("\":");
            sb.append(valueToJson(e.getValue()));
            first = false;
        }
        sb.append("}");
        return sb.toString();
    }

    /** Serialize a List<Map<String,Object>> to a JSON array string. */
    static String listToJson(List<Map<String, Object>> list) {
        return list.stream().map(CUPriceWise::mapToJson).collect(Collectors.joining(",","[","]"));
    }

    /** Convert a single value to its JSON representation. */
    static String valueToJson(Object v) {
        if (v == null)              return "null";
        if (v instanceof Boolean)   return v.toString();
        if (v instanceof Number)    return v.toString();
        if (v instanceof String)    return "\"" + esc((String) v) + "\"";
        if (v instanceof List) {
            @SuppressWarnings("unchecked")
            List<Object> list = (List<Object>) v;
            return list.stream().map(CUPriceWise::valueToJson)
                       .collect(Collectors.joining(",","[","]"));
        }
        if (v instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String,Object> map = (Map<String,Object>) v;
            return mapToJson(map);
        }
        return "\"" + esc(v.toString()) + "\"";
    }
}
