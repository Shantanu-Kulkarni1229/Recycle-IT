const Recycler = require('../models/Recycler');
const RecyclerPickup = require('../models/RecyclerPickup');

// Get all recyclers for admin dashboard
const getAllRecyclers = async (req, res) => {
  try {
    const recyclers = await Recycler.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });

    // Calculate statistics for each recycler
    const recyclersWithStats = await Promise.all(
      recyclers.map(async (recycler) => {
        const pickups = await RecyclerPickup.find({ recyclerId: recycler._id });
        
        const totalTransactions = pickups.length;
        const totalAmount = pickups.reduce((sum, pickup) => sum + (pickup.amount || 0), 0);

        return {
          id: recycler._id,
          ownerName: recycler.ownerName,
          companyName: recycler.companyName,
          email: recycler.email,
          phoneNumber: recycler.phoneNumber,
          city: recycler.city,
          state: recycler.state,
          address: recycler.address,
          pincode: recycler.pincode,
          servicesOffered: recycler.servicesOffered,
          certifications: recycler.certifications,
          contactPerson: recycler.contactPerson,
          contactPhone: recycler.contactPhone,
          operatingHours: recycler.operatingHours,
          website: recycler.website,
          description: recycler.description,
          isVerified: recycler.isVerified,
          registrationDate: recycler.createdAt,
          totalTransactions,
          totalAmount,
          status: recycler.isVerified ? 'Verified' : 'Pending'
        };
      })
    );

    res.status(200).json({
      success: true,
      data: recyclersWithStats,
      total: recyclersWithStats.length
    });

  } catch (error) {
    console.error('Error fetching recyclers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recyclers',
      error: error.message
    });
  }
};

// Get all transactions for admin dashboard
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await RecyclerPickup.find({})
      .populate('recyclerId', 'ownerName companyName email phoneNumber')
      .sort({ createdAt: -1 });

    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id,
      recyclerId: transaction.recyclerId._id,
      recyclerName: transaction.recyclerId.ownerName,
      companyName: transaction.recyclerId.companyName,
      recyclerEmail: transaction.recyclerId.email,
      recyclerPhone: transaction.recyclerId.phoneNumber,
      type: transaction.wasteType || 'General Waste',
      amount: transaction.amount || 0,
      date: transaction.createdAt,
      status: transaction.status || 'Pending',
      description: transaction.description || transaction.wasteType || 'No description',
      pickupDate: transaction.pickupDate,
      address: transaction.address,
      contactPerson: transaction.contactPerson,
      contactPhone: transaction.contactPhone,
      specialInstructions: transaction.specialInstructions
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length
    });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalRecyclers = await Recycler.countDocuments();
    const verifiedRecyclers = await Recycler.countDocuments({ isVerified: true });
    const pendingRecyclers = await Recycler.countDocuments({ isVerified: false });
    
    const allTransactions = await RecyclerPickup.find({});
    const totalTransactions = allTransactions.length;
    const completedTransactions = await RecyclerPickup.countDocuments({ status: 'Completed' });
    const pendingTransactions = await RecyclerPickup.countDocuments({ status: 'Pending' });
    const processingTransactions = await RecyclerPickup.countDocuments({ status: 'Processing' });
    
    const totalRevenue = allTransactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRecyclers = await Recycler.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Get recent transactions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTransactions = await RecyclerPickup.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        recyclers: {
          total: totalRecyclers,
          verified: verifiedRecyclers,
          pending: pendingRecyclers,
          recent: recentRecyclers
        },
        transactions: {
          total: totalTransactions,
          completed: completedTransactions,
          pending: pendingTransactions,
          processing: processingTransactions,
          recent: recentTransactions
        },
        revenue: {
          total: totalRevenue,
          // You can add more revenue analytics here
        }
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Get recycler by ID with full details
const getRecyclerById = async (req, res) => {
  try {
    const { id } = req.params;

    const recycler = await Recycler.findById(id).select('-password');
    if (!recycler) {
      return res.status(404).json({
        success: false,
        message: 'Recycler not found'
      });
    }

    const pickups = await RecyclerPickup.find({ recyclerId: id }).sort({ createdAt: -1 });

    const recyclerDetails = {
      ...recycler.toObject(),
      transactions: pickups,
      totalTransactions: pickups.length,
      totalAmount: pickups.reduce((sum, pickup) => sum + (pickup.amount || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: recyclerDetails
    });

  } catch (error) {
    console.error('Error fetching recycler details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recycler details',
      error: error.message
    });
  }
};

// Update recycler verification status
const updateRecyclerVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const recycler = await Recycler.findByIdAndUpdate(
      id,
      { isVerified },
      { new: true }
    ).select('-password');

    if (!recycler) {
      return res.status(404).json({
        success: false,
        message: 'Recycler not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Recycler ${isVerified ? 'verified' : 'unverified'} successfully`,
      data: recycler
    });

  } catch (error) {
    console.error('Error updating recycler verification:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating recycler verification',
      error: error.message
    });
  }
};

module.exports = {
  getAllRecyclers,
  getAllTransactions,
  getDashboardStats,
  getRecyclerById,
  updateRecyclerVerification
};
