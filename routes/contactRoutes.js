// routes/contactRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
  debug: true, // Enable debug for troubleshooting
});

// Verify transporter connection at startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take messages");
  }
});

// Contact form endpoint
router.post("/", async (req, res) => {
  console.log("Contact form submission received:", req.body);

  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    console.log("Missing required fields");
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields",
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("Invalid email format:", email);
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  // Prepare email to admin (you)
  const mailOptions = {
    from: process.env.EMAIL_USER, // This is your sending email (tranhoangphuc0401@gmail.com)
    to: "s3929597@rmit.edu.vn", // This is where you'll receive messages
    replyTo: email, // This allows you to reply directly to the user
    subject: `LearnNow Contact: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${message.replace(/\n/g, "<br>")}
      </div>
      <p style="color: #888; margin-top: 20px;">Sent from LearnNow contact form</p>
    `,
  };

  // Send auto-reply to user
  const autoReplyOptions = {
    from: process.env.EMAIL_USER, // Your sending email
    to: email, // The user's email
    subject: "Thank you for contacting LearnNow",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #ee6c4d;">Thank You for Contacting Us!</h2>
        <p>Hello ${name},</p>
        <p>We've received your message regarding "${subject}" and will get back to you as soon as possible.</p>
        <p>For your records, here's a copy of your message:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          ${message.replace(/\n/g, "<br>")}
        </div>
        <p>Best regards,</p>
        <p><strong>The LearnNow Team</strong></p>
      </div>
    `,
  };

  try {
    console.log("Attempting to send admin email...");
    // Send email to admin
    const adminMailInfo = await transporter.sendMail(mailOptions);
    console.log("Admin email sent successfully:", adminMailInfo.response);

    console.log("Attempting to send auto-reply email...");
    // Send auto-reply to user
    const userMailInfo = await transporter.sendMail(autoReplyOptions);
    console.log("Auto-reply email sent successfully:", userMailInfo.response);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Your message has been sent successfully",
    });
  } catch (error) {
    console.error("Error sending email - Full details:", error);

    // More detailed error response
    let errorMessage = "Failed to send your message. Please try again later.";
    if (error.code === "EAUTH") {
      errorMessage = "Authentication failed. Please check email credentials.";
    } else if (error.code === "ESOCKET") {
      errorMessage = "Network error. Please check your internet connection.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Route for rendering the contact page
router.get("/", (req, res) => {
  try {
    const loggedInUserId = req.signedCookies?.userId;
    const loggedInUser = req.user;

    res.render("contactForm", {
      user: loggedInUser,
      loggedInUserId,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error("Error rendering contact page:", error);
    res.status(500).send("Error loading contact page");
  }
});

// Test route to troubleshoot email sending
router.get("/test-email", async (req, res) => {
  try {
    const testResult = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "s3929597@rmit.edu.vn",
      subject: "Email Test from LearnNow",
      text: "This is a test email to verify the email service is working.",
    });

    res.send(`Email test completed: ${JSON.stringify(testResult)}`);
  } catch (error) {
    res.status(500).send(`Email test failed: ${error.message}`);
  }
});

module.exports = router;
