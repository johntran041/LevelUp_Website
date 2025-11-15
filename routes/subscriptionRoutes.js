// routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Subscription endpoint
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  // Basic validation
  if (!email || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  try {
    // Extract first name from email (if possible)
    const firstName = email.split("@")[0].split(".")[0];
    // Capitalize first letter
    const capitalizedName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1);

    // Prepare welcome email
    const mailOptions = {
      from: '"Level Up" <no-reply@levelup.com>',
      to: email,
      subject: "🎉 Welcome to Level Up!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <h2 style="color: #ee6c4d;">Welcome to Level Up!</h2>
          <p>Hi ${capitalizedName || "there"},</p>
          <p>Thank you for subscribing to <strong>Level Up</strong>!</p>
          <p>We're thrilled to have you with us. Our mission is to help you unlock your full potential through easy-to-follow lessons, resources, and a vibrant learning community. With your subscription, you'll be the first to know about new content, special events, and exclusive tips to boost your learning journey.</p>
          <p>If you have any questions or need support, feel free to reach out — we're here to help!</p>
          <p>Welcome aboard, and let's Level Up together! 🚀</p>
          <p>— The Level Up Team</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">This email was sent to ${email} because you subscribed to Level Up updates.</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Store subscriber in database (would be implemented here)
    // ...

    // Send success response
    res.status(200).json({
      success: true,
      message: "Subscription successful! Please check your email.",
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process subscription. Please try again.",
    });
  }
});

module.exports = router;
