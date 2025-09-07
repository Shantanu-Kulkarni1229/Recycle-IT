// Add this to your RecyclerController.js for testing purposes
// This bypasses email verification

testCreateRecycler: async (req, res) => {
  try {
    const recycler = new Recycler({
      ownerName: "John Smith",
      companyName: "EcoRecycle Solutions",
      email: "recycler@example.com",
      password: "password123",
      phoneNumber: "9876543210",
      address: "123 Green Street",
      city: "Mumbai", 
      state: "Maharashtra",
      pincode: "400001",
      isVerified: true,
      verificationStatus: "Approved"
    });

    await recycler.save();

    res.json({
      success: true,
      message: 'Test recycler created successfully',
      recycler: {
        _id: recycler._id,
        companyName: recycler.companyName,
        email: recycler.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
