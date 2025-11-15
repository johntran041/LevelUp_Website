const User = require('../models/User');
const Course = require('../models/Course');
const Cart = require('../models/Cart');  

async function getCartCount(req) {
  const userId = req.signedCookies?.userId;
  if (userId) {
    const userCart = await Cart.findOne({ userId });
    return userCart ? userCart.items.length : 0;
  } else {
    return Array.isArray(req.session.cart)
      ? req.session.cart.length
      : 0;
  }
}
exports.getCartCount = getCartCount;

exports.renderCartPage = async (req, res) => {
  try {
    const userId = req.signedCookies?.userId;
    const user = userId ? await User.findById(userId) : null;

    let cartItems = [];

    if (userId) {
      const userCart = await Cart.findOne({ userId })
      .populate({
        path: 'items',
        populate: [
          {
            path: 'author',
            select: 'firstName lastName email avatar'
          },
          {
            path: 'sections',
            populate: {
              path: 'lessons',
              model: 'Lesson'
            }
          }
        ]
      });
      if (userCart) cartItems = userCart.items;
    } else {
      const sessionIds = req.session.cart || [];
      if (sessionIds.length) {
        cartItems = await Course.find({ _id: { $in: sessionIds } })
          .populate('author', 'firstName lastName email avatar')
          .populate({
            path: 'sections',
            populate: {
              path: 'lessons',
              model: 'Lesson',
            },
          });
      }
    }

    res.render('cart', {
      cartItems,
      user: user || {},
      cartCount: await getCartCount(req),
    });
  } catch (err) {
    console.error('Error rendering cart page:', err);
    res.status(500).send('Internal Server Error');
  }
};




exports.addToCart = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.signedCookies?.userId;

    if (userId) {
      // This will upsert a cart if none exists, and only add courseId if it isn’t already in the array
      await Cart.updateOne(
        { userId },
        { $addToSet: { items: courseId } },
        { upsert: true }
      );
      const cart = await Cart.findOne({ userId });
      return res.json({ success: true, cartCount: cart.items.length });
    }

    // Session‐based cart for guests
    req.session.cart = req.session.cart || [];
    if (!req.session.cart.includes(courseId)) {
      req.session.cart.push(courseId);
    }
    return res.json({ success: true, cartCount: req.session.cart.length });

  } catch (err) {
    console.error("Error adding to cart:", err);
    return res.status(500).json({ success: false });
  }
};



exports.removeFromCart = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId   = req.signedCookies?.userId;

    if (userId) {
      await Cart.updateOne(
        { userId },
        { $pull: { items: courseId } }
      );
    } else {
      // Session-based cart
      req.session.cart = (req.session.cart || []).filter(id => id !== courseId);
      // immediately write session
      //  back
      req.session.save(err => {
        if (err) console.error('session save error:', err);
      });
    }

    const cartCount = await getCartCount(req);

    // If AJAX / JSON client
    if (req.xhr || (req.headers.accept || '').includes('json')) {
      return res.json({ success: true, cartCount });
    }

    // or will do a full page reload
    res.redirect('/cart');
  } catch (err) {
    console.error('Error removing from cart:', err);
    if (req.xhr || (req.headers.accept || '').includes('json')) {
      return res.status(500).json({ success: false });
    }
    res.status(500).send('Internal Server Error');
  }
};



exports.mergeCart = async (userId, sessionCart, req) => {
  if (!sessionCart || !sessionCart.length) return;

  let userCart = await Cart.findOne({ userId });
  if (!userCart) {
    userCart = new Cart({ userId, items: sessionCart });
  } else {
    for (const id of sessionCart) {
      if (!userCart.items.includes(id)) userCart.items.push(id);
    }
  }

  await userCart.save();

  // Clear session cart after merging
  if (req.session && req.session.cart) {
    req.session.cart = [];
    req.session.save(err => {
      if (err) console.error("Failed to clear session cart:", err);
    });
  }

  return userCart;
};


// Clear cart items after successful purchase
exports.clearCart = async (userId, options = {}) => {
  const { onlyIfCoursePurchased = false, courseIds = [] } = options;
  if (onlyIfCoursePurchased && !courseIds.length) return false;
  if (!userId) return false;

  try {
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    );
    return true;
  } catch (err) {
    console.error('Error clearing cart:', err);
    throw err;
  }
};



// // Helper function to get cart count
// exports.getCartCount = async (req) => {
//   const userId = req.signedCookies?.userId;
  
//   if (userId) {
//     // For logged-in users
//     const userCart = await Cart.findOne({ userId });
//     return userCart ? userCart.items.length : 0;
//   } else {
//     // For non-logged in users
//     return req.session.cart ? req.session.cart.length : 0;
//   }
// };

