const express = require('express');
const router = express.Router();
const {
  addTestimonial,
  getTestimonialsByRecycler,
  getAllTestimonials
} = require('../controllers/testimonialController.js');

router.post('/', addTestimonial);

router.get('/', getAllTestimonials);

router.get('/recycler/:recyclerId', getTestimonialsByRecycler);

module.exports = router;
