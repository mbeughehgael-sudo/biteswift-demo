const { listRestaurants, SEED_RESTAURANTS } = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const restaurants = await listRestaurants();
    res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=30');
    res.status(200).json(restaurants);
  } catch (err) {
    // KV not provisioned/connected yet (e.g. right after first deploy) — keep the storefront
    // working with the seed data rather than showing a blank page until it's configured.
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(SEED_RESTAURANTS);
  }
};
