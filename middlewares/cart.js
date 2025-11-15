const { getCartCount } = require('../controllers/cartController');

module.exports = async function cartCountMiddleware(req, res, next) {
  try {
    res.locals.cartCount = await getCartCount(req);
  } catch (err) {
    console.error('Error fetching cart count:', err);
    res.locals.cartCount = 0;
  }
  next();
};
