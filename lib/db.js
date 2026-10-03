const { kv } = require('@vercel/kv');

// Seed data — mirrors the restaurants that used to be hardcoded directly in index.html.
// Only used to populate the KV store the very first time the app runs.
const SEED_RESTAURANTS = [
  {
    id: 1,
    name: "Gourmet Burger Craft",
    category: "Burger",
    rating: 4.9,
    reviews: "1.2k",
    time: "18-25 min",
    deliveryFee: "Free",
    image: "images/burger-hero.jpg",
    tag: "Bestseller",
    menu: [
      { id: 101, name: "Truffle Swiss Smash Burger", desc: "Double Angus beef patty, melted swiss cheese, wild truffle aioli & caramelized onions.", price: 9000, image: "images/burger-hero.jpg" },
      { id: 102, name: "Crispy Bacon Fire Burger", desc: "Smoked bacon, spicy jalapeño relish, cheddar, and chipotle mayo.", price: 8100, image: "images/item-102.jpg" },
      { id: 103, name: "Loaded Truffle Fries", desc: "Hand-cut fries tossed in truffle oil, parmesan cheese, and fresh parsley.", price: 4200, image: "images/item-103.jpg" },
      { id: 104, name: "Classic Artisan Milkshake", desc: "Madagascar vanilla bean soft serve blended with rich whole milk.", price: 3600, image: "images/item-104.jpg" }
    ]
  },
  {
    id: 2,
    name: "Napoli Wood-Fired Pizza",
    category: "Pizza",
    rating: 4.8,
    reviews: "980",
    time: "20-28 min",
    deliveryFee: "1,200 FCFA",
    image: "images/pizza-hero.jpg",
    tag: "Authentic Italian",
    menu: [
      { id: 201, name: "Margherita D.O.P.", desc: "San Marzano tomatoes, fresh fior di latte mozzarella, basil leaves, extra virgin olive oil.", price: 9900, image: "images/item-201.jpg" },
      { id: 202, name: "Spicy Pepperoni Diablo", desc: "Calabrian hot honey, artisan spicy salami, mozzarella, and crushed tomatoes.", price: 11400, image: "images/item-202.jpg" },
      { id: 203, name: "Garlic Parmesan Focaccia", desc: "Fresh baked crust brushed with roasted garlic butter and rosemary.", price: 4500, image: "images/item-203.jpg" }
    ]
  },
  {
    id: 3,
    name: "Sakura Ramen & Sushi Bar",
    category: "Asian",
    rating: 4.9,
    reviews: "2.1k",
    time: "15-22 min",
    deliveryFee: "Free",
    image: "images/asian-hero.jpg",
    tag: "Chef's Choice",
    menu: [
      { id: 301, name: "Tonkotsu Black Ramen", desc: "24-hour simmered pork broth, chashu pork belly, ajitama egg, black garlic oil.", price: 10500, image: "images/asian-hero.jpg" },
      { id: 302, name: "Dragon Roll (8 pcs)", desc: "Tempura shrimp, avocado inside, topped with fresh unagi eel and sweet soy reduction.", price: 11400, image: "images/item-302.jpg" },
      { id: 303, name: "Spicy Tuna Crispy Rice", desc: "Pan-crisped sushi rice cakes topped with spicy minced ahi tuna and jalapeño.", price: 8700, image: "images/item-303.jpg" }
    ]
  },
  {
    id: 4,
    name: "Greenleaf Organic Bowls",
    category: "Healthy",
    rating: 4.7,
    reviews: "640",
    time: "15-20 min",
    deliveryFee: "600 FCFA",
    image: "images/healthy-hero.jpg",
    tag: "Superfoods",
    menu: [
      { id: 401, name: "Avocado Power Green Bowl", desc: "Quinoa, kale, avocado, roasted chickpeas, cucumber, lemon tahini dressing.", price: 8400, image: "images/item-401.jpg" },
      { id: 402, name: "Teriyaki Salmon Poké Bowl", desc: "Fresh sashimi grade salmon, edamame, pickled ginger, sesame seeds, sushi rice.", price: 10200, image: "images/item-402.jpg" }
    ]
  },
  {
    id: 5,
    name: "Le Petit Paris Bakery",
    category: "Dessert",
    rating: 4.9,
    reviews: "850",
    time: "12-18 min",
    deliveryFee: "Free",
    image: "images/dessert-hero.jpg",
    tag: "Artisanal Pastries",
    menu: [
      { id: 501, name: "Almond Butter Croissant", desc: "Flaky all-butter croissant filled with sweet almond frangipane cream and sliced almonds.", price: 3300, image: "images/item-501.jpg" },
      { id: 502, name: "Madagascar Vanilla Eclair", desc: "Choux pastry filled with rich vanilla bean custard and dipped in dark chocolate glaze.", price: 3600, image: "images/item-502.jpg" }
    ]
  }
];

const SEED_PROMOS = [
  { code: 'FIRSTBITE', type: 'percent', value: 50, active: true }
];

let seedingPromise = null;

async function ensureSeeded() {
  if (await kv.get('seeded')) return;
  // Guard against concurrent cold-start requests racing to seed at the same time.
  if (!seedingPromise) {
    seedingPromise = (async () => {
      for (const r of SEED_RESTAURANTS) {
        await kv.set(`restaurant:${r.id}`, r);
      }
      await kv.set('restaurants:index', SEED_RESTAURANTS.map((r) => r.id));
      for (const p of SEED_PROMOS) {
        await kv.set(`promo:${p.code}`, p);
      }
      await kv.set('promos:index', SEED_PROMOS.map((p) => p.code));
      await kv.set('orders:index', []);
      await kv.set('seeded', true);
    })();
  }
  await seedingPromise;
}

// ---- Restaurants ----
async function listRestaurants() {
  await ensureSeeded();
  const ids = (await kv.get('restaurants:index')) || [];
  const items = await Promise.all(ids.map((id) => kv.get(`restaurant:${id}`)));
  return items.filter(Boolean);
}

async function getRestaurant(id) {
  await ensureSeeded();
  return kv.get(`restaurant:${id}`);
}

async function upsertRestaurant(restaurant) {
  await ensureSeeded();
  if (!restaurant.id) restaurant.id = Date.now();
  if (!Array.isArray(restaurant.menu)) restaurant.menu = [];
  await kv.set(`restaurant:${restaurant.id}`, restaurant);
  const ids = (await kv.get('restaurants:index')) || [];
  if (!ids.includes(restaurant.id)) {
    ids.push(restaurant.id);
    await kv.set('restaurants:index', ids);
  }
  return restaurant;
}

async function deleteRestaurant(id) {
  await ensureSeeded();
  await kv.del(`restaurant:${id}`);
  const ids = (await kv.get('restaurants:index')) || [];
  await kv.set('restaurants:index', ids.filter((x) => x !== id));
}

// ---- Orders ----
async function listOrders() {
  await ensureSeeded();
  const ids = (await kv.get('orders:index')) || [];
  const items = await Promise.all(ids.map((id) => kv.get(`order:${id}`)));
  return items.filter(Boolean).sort((a, b) => b.placedAt - a.placedAt);
}

async function getOrder(id) {
  await ensureSeeded();
  return kv.get(`order:${id}`);
}

async function createOrder(order) {
  await ensureSeeded();
  await kv.set(`order:${order.id}`, order);
  const ids = (await kv.get('orders:index')) || [];
  ids.push(order.id);
  await kv.set('orders:index', ids);
  return order;
}

async function updateOrder(id, patch) {
  await ensureSeeded();
  const existing = await kv.get(`order:${id}`);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  await kv.set(`order:${id}`, updated);
  return updated;
}

// ---- Promo codes ----
async function listPromos() {
  await ensureSeeded();
  const codes = (await kv.get('promos:index')) || [];
  const items = await Promise.all(codes.map((c) => kv.get(`promo:${c}`)));
  return items.filter(Boolean);
}

async function getPromo(code) {
  await ensureSeeded();
  if (!code) return null;
  return kv.get(`promo:${code.toUpperCase()}`);
}

async function upsertPromo(promo) {
  await ensureSeeded();
  const code = String(promo.code || '').toUpperCase().trim();
  if (!code) throw new Error('Promo code is required');
  const saved = { ...promo, code };
  await kv.set(`promo:${code}`, saved);
  const codes = (await kv.get('promos:index')) || [];
  if (!codes.includes(code)) {
    codes.push(code);
    await kv.set('promos:index', codes);
  }
  return saved;
}

async function deletePromo(code) {
  await ensureSeeded();
  code = String(code || '').toUpperCase().trim();
  await kv.del(`promo:${code}`);
  const codes = (await kv.get('promos:index')) || [];
  await kv.set('promos:index', codes.filter((c) => c !== code));
}

module.exports = {
  SEED_RESTAURANTS,
  listRestaurants,
  getRestaurant,
  upsertRestaurant,
  deleteRestaurant,
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  listPromos,
  getPromo,
  upsertPromo,
  deletePromo
};
