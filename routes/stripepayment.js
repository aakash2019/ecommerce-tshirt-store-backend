const express = require('express');
const router = express.Router();

const { makePayment } = require('../controllers/stripepayment');

// Routes
router.post("/stripepayment", makePayment);

module.exports = router;