const { requireAdmin } = require('../../lib/requireAdmin');
const { listRestaurants, upsertRestaurant } = require('../../lib/db');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    const restaurants = await listRestaurants();
    return res.status(200).json(restaurants);
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!body.name || !body.category) {
      return res.status(400).json({ error: 'name and category are required' });
    }
    const restaurant = {
      id: Date.now(),
      name: body.name,
      category: body.category,
      rating: Number(body.rating) || 5.0,
      reviews: body.reviews || '0',
      time: body.time || '20-30 min',
      deliveryFee: body.deliveryFee || 'Free',
      image: body.image || '',
      tag: body.tag || '',
      menu: Array.isArray(body.menu) ? body.menu : []
    };
    const saved = await upsertRestaurant(restaurant);
    return res.status(201).json(saved);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
};
