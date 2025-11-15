const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

router.get('/', sitemapController.renderSitemap);

module.exports = router;
