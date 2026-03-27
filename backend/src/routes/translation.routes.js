const express = require('express');
const { getTranslation } = require('../controllers/translation.controller');

const router = express.Router();

// Route: GET /api/v1/translations/:lng/:ns.json
router.get('/:lng/:ns.json', getTranslation);

module.exports = router;
