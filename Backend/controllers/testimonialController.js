const Testimonial = require('../models/Testimonial');

// @desc    Add a new testimonial
// @route   POST /api/testimonials
// @access  Public or Authenticated (based on your setup)
const addTestimonial = async (req, res) => {
  try {
    const { recyclerId, userId, feedback, rating } = req.body;

    // Validation
    if (!recyclerId || !userId || !feedback || !rating) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const testimonial = new Testimonial({
      recyclerId,
      userId,
      feedback,
      rating
    });

    await testimonial.save();
    res.status(201).json({ message: 'Testimonial added successfully', testimonial });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all testimonials for a specific recycler
// @route   GET /api/testimonials/recycler/:recyclerId
// @access  Public
const getTestimonialsByRecycler = async (req, res) => {
  try {
    const { recyclerId } = req.params;

    const testimonials = await Testimonial.find({ recyclerId })
      .populate('userId', 'name email') // Get user info along with feedback
      .sort({ createdAt: -1 }); // Latest first

    res.status(200).json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all testimonials (for admin)
// @route   GET /api/testimonials
// @access  Admin
const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('userId', 'name email')
      .populate('recyclerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ testimonials });
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get testimonials for the authenticated recycler
// @route   GET /api/testimonials/my-testimonials
// @access  Recycler (authenticated)
const getMyTestimonials = async (req, res) => {
  try {
    const recyclerId = req.recycler?._id;

    if (!recyclerId) {
      return res.status(401).json({ message: 'Not authorized, recycler not found' });
    }

    const testimonials = await Testimonial.find({ recyclerId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ testimonials });
  } catch (error) {
    console.error('Error fetching my testimonials:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addTestimonial,
  getTestimonialsByRecycler,
  getAllTestimonials,
  getMyTestimonials
};
