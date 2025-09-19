const express = require('express');
const router = express.Router();
const {
  addTestimonial,
  getTestimonialsByRecycler,
  getAllTestimonials
} = require('../controllers/testimonialController.js');

// @route   POST /api/testimonials
// @desc    Add a new testimonial
router.post('/', addTestimonial);

// @route   GET /api/testimonials
// @desc    Get all testimonials (admin only)
router.get('/', getAllTestimonials);

// @route   GET /api/testimonials/recycler/:recyclerId
// @desc    Get all testimonials for a specific recycler
router.get('/recycler/:recyclerId', getTestimonialsByRecycler);

module.exports = router;
