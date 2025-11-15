const User = require("../models/User");
const Course = require("../models/Course");
const Cart = require("../models/Cart");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cartController = require("../controllers/cartController");

exports.renderCheckoutPage = async (req, res) => {
    try {
        const userId = req.signedCookies?.userId || req.query.id;
        const user = await User.findById(userId).lean();
        if (!user) return res.redirect("/auth/login");

        let cartIds;
        if (userId) {
            // logged-in users, read from DB cart
            const userCart = await Cart.findOne({ userId });
            cartIds = userCart?.items.map((id) => id.toString()) || [];
        } else {
            // guests, session
            cartIds = req.session.cart || [];
        }

        const cartItems = await Course.find({ _id: { $in: cartIds } })
            .populate("author", "firstName lastName email avatar")
            .populate({
                path: "sections",
                populate: {
                    path: "lessons",
                    model: "Lesson"
                }
            });


        // compute total
        const totalCost = cartItems.reduce(
            (sum, c) => sum + (parseFloat(c.price) || 0),
            0
        );

        res.render("checkout", {
            user,
            cardInfo: user.cardPaymentInfo || {},
            cartItems,
            totalCost,
            hasEnoughCoins: user.coin >= totalCost,
        });
    } catch (err) {
        console.error("Error rendering checkout:", err);
        res.status(500).send("Server Error");
    }
};

exports.renderConfirmationPage = async (req, res) => {
    try {
        const userId = req.signedCookies?.userId;
        const user = await User.findById(userId).lean();

        const orderNumber = req.query.orderNumber || "—";
        const isCoinTopUp = req.query.coinTopUp === "true";

        // Load cart for display (DO NOT clear if coin top-up)
        const userCart = await Cart.findOne({ userId });
        const cartIds = userCart?.items.map((id) => id.toString()) || [];
        const cartItems = await Course.find({ _id: { $in: cartIds } })
            .populate("author", "firstName lastName email avatar")
            .populate({
                path: "sections",
                populate: {
                    path: "lessons",
                    model: "Lesson"
                }
            });

        const totalCost = cartItems.reduce(
            (sum, c) => sum + (parseFloat(c.price) || 0),
            0
        );

        //  Only mark purchased and clear cart if not coin top-up
        if (!isCoinTopUp) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { purchasedCourses: { $each: cartIds } },
            });
            await Course.updateMany(
                { _id: { $in: cartIds } },
                { $addToSet: { studentsEnrolled: userId } }
              );
            await Cart.findOneAndUpdate({ userId }, { items: [] });
            req.session.cart = [];
        }

        return res.render("paymentConfirmation", {
            user,
            orderNumber,
            cartItems,
            totalCost,
            purchased: req.query.purchased,
            bonus: req.query.bonus,
            coinTopUp: isCoinTopUp,
        });
    } catch (err) {
        console.error("Error rendering confirmation:", err);
        return res.status(500).send("Server Error");
    }
};

exports.renderAddCoin = async (req, res) => {
    try {
        const userId = req.signedCookies.userId || req.query.id;
        if (!userId) return res.redirect("/auth/login");

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).send("User not found");

        // show cart items
        const cartCourseIds = req.session.cart || [];
        const cartItems = await Course.find({
            _id: { $in: cartCourseIds },
        }).lean();
        const totalCost = cartItems.reduce(
            (sum, c) => sum + (parseFloat(c.price) || 0),
            0
        );

        res.render("addMoreCoin", {
            user,
            cartItems,
            totalCost,
            cardInfo: user.cardPaymentInfo || {},
        });
    } catch (err) {
        console.error("Error rendering Add Coin page:", err);
        res.status(500).send("Internal Server Error");
    }
};

exports.createPaymentIntent = async (req, res) => {
    const { amount } = req.body || {};

    // Validate amount
    if (amount == null) {
        return res.status(400).json({ error: "Amount required" });
    }
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(value) || value <= 0) {
        return res
            .status(400)
            .json({ error: "Amount must be a positive number" });
    }

    // Ensure Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("Stripe secret key not found");
        return res
            .status(500)
            .json({ error: "Payment processing not configured" });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(value),
            currency: "usd",
            metadata: { integration_check: "accept_a_payment" },
        });

        return res.json({
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        });
    } catch (err) {
        console.error("Stripe error:", err);
        return res.status(500).json({
            error: err.message,
            type: err.type || "StripeError",
            code: err.statusCode || 500,
        });
    }
};

//use coin to pay
exports.useCoin = async (req, res) => {
    try {
        const { userId, courseIds, totalCost } = req.body;

        console.log("Coin payment request received:", {
            userId,
            courseIds: courseIds || [],
            totalCost,
        });

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
            return res.status(400).json({ error: "Course IDs are required" });
        }

        if (
            totalCost == null ||
            isNaN(parseFloat(totalCost)) ||
            parseFloat(totalCost) <= 0
        ) {
            return res
                .status(400)
                .json({ error: "Valid total cost is required" });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if user has enough coins
        if (user.coin < parseFloat(totalCost)) {
            return res.status(400).json({
                error: "Insufficient coins",
                userCoins: user.coin,
                requiredCoins: parseFloat(totalCost),
            });
        }

        console.log(
            `User ${userId} has ${user.coin} coins, deducting ${parseFloat(
                totalCost
            )}`
        );

        // Deduct coins from user
        user.coin -= parseFloat(totalCost);
        await user.save();

        console.log(`User coins after deduction: ${user.coin}`);

        if (!user.purchasedCourses) user.purchasedCourses = [];
        user.purchasedCourses = [
            ...new Set([...user.purchasedCourses, ...courseIds]),
        ];
        await user.save();

        // Clear the cart (this depends on your cart implementation)
        try {
            // If using database cart:
            const cartResult = await Cart.findOneAndUpdate(
                { userId: user._id },
                { $set: { items: [] } }
            );

            // If the session is available, clear that too
            if (req.session && req.session.cart) {
                req.session.cart = [];
                console.log("Session cart cleared");
            }
        } catch (cartErr) {
            console.error("Error clearing cart:", cartErr);
        }
        await Course.updateMany(
           { _id: { $in: courseIds } },
            { $addToSet: { studentsEnrolled: user._id } }
             );
        // Success response
        return res.json({
            success: true,
            message: "Payment successful",
            redirectUrl: "/payment/confirmation",
        });
    } catch (err) {
        console.error("Coin payment error:", err);
        return res
            .status(500)
            .json({ error: "Server error processing coin payment" });
    }
};

exports.updateUserCoin = async (req, res) => {
    const { userId, coins } = req.body;
  if (!userId || coins == null) {
    return res.status(400).send("Missing data");
  }

  try {
    await User.findByIdAndUpdate(userId, {
      $inc: { coin: coins }
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Coin update error:", err);
    return res.status(500).json({ error: "Failed to update coins" });
  }
};