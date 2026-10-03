const { verifySession } = require('./auth');
const { parse } = require('./cookie');

// Returns true if authenticated; otherwise writes a 401 and returns false.
// Callers should `if (!requireAdmin(req, res)) return;` as their first line.
function requireAdmin(req, res) {
  const cookies = parse(req.headers.cookie || '');
  if (verifySession(cookies.admin_session)) return true;
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

module.exports = { requireAdmin };
