const express = require('express');
const router = express.Router();
const {
  addTestimonial,
  getTestimonialsByRecycler,
  getAllTestimonials,
  getMyTestimonials
} = require('../controllers/testimonialController.js');
const { protect } = require('../middleware/auth.js');

router.post('/', addTestimonial);

router.get('/', getAllTestimonials);

router.get('/my-testimonials', protect, getMyTestimonials);

router.get('/recycler/:recyclerId', getTestimonialsByRecycler);

module.exports = router;
