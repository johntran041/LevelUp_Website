const router = require("express").Router();

const { renderCartPage, addToCart, removeFromCart } = require("../controllers/cartController");

router.get("/", renderCartPage);
router.post("/add/:courseId", addToCart);
router.post('/remove/:courseId', removeFromCart);

module.exports = router;
