const express = require("express");
const router = express.Router();
const upload = require("../middlewares/MessageUpload");

router.post("/", upload.single("file"), (req, res) => {
  console.log("Uploaded file:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  return res.status(200).json({
    message: "File uploaded successfully",
    fileUrl
  });
});


module.exports = router;
