# Payment Integration Setup Guide

## Overview
This guide provides step-by-step instructions for setting up and testing the Razorpay payment integration in the Recycle'IT application.

## 🔧 Backend Configuration

### 1. Environment Variables Setup
Create or update the `.env` file in the `Backend` folder:

```bash
# Backend/.env
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string
```

### 2. Backend Dependencies
Ensure these packages are installed in `Backend/package.json`:
```bash
npm install razorpay
npm install crypto  # Usually built-in with Node.js
```

### 3. Backend Components
The following files have been created/configured:

- **`config/razorpayConfig.js`** - Razorpay instance configuration
- **`controllers/paymentController.js`** - Payment processing logic
- **`routes/paymentRoutes.js`** - Payment API endpoints
- **`middleware/auth.js`** - Authentication middleware

### 4. API Endpoints
Available payment endpoints:

```
POST /api/payments/create-order     - Create a new payment order
POST /api/payments/verify          - Verify payment completion
POST /api/payments/webhook         - Handle Razorpay webhooks
GET  /api/payments/:orderId        - Get payment details
GET  /api/payments/history         - Get payment history
POST /api/payments/refund          - Process refunds
```

## 🌐 Frontend Configuration

### 1. Environment Variables Setup
Create or update the `.env` file in the `website` folder:

```bash
# website/.env
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id_here
REACT_APP_APP_NAME=Recycle'IT
REACT_APP_VERSION=1.0.0
```

### 2. Frontend Dependencies
Ensure these packages are installed in `website/package.json`:
```bash
npm install axios
```

### 3. Frontend Components
The following files have been created:

- **`services/paymentService.ts`** - Payment service layer
- **`pages/PaymentPage.tsx`** - Main payment interface
- **`pages/PaymentTest.tsx`** - Payment testing interface
- **`pages/PickupManagement.tsx`** - Updated with payment buttons

## 🚀 Testing the Integration

### 1. Start Backend Server
```bash
cd Backend
npm install
npm start
```

### 2. Start Frontend Server
```bash
cd website
npm install
npm start
```

### 3. Test Payment Flow

1. **Login to the recycler dashboard**
2. **Navigate to "Payment Test" in the sidebar**
3. **Click "Test Payment Integration"**
4. **Complete the Razorpay checkout process**

### 4. Test Production Flow

1. **Navigate to "Pickup Management"**
2. **Find a pickup with status "Scheduled" or "Collected"**
3. **Click "Proceed to Payment" button**
4. **Complete payment on the payment page**

## 📋 Payment Flow Overview

### 1. Order Creation
```typescript
// Frontend creates order
const orderData = {
  amount: 10000, // ₹100 in paise
  serviceType: 'pickup',
  deviceInfo: 'Smartphone',
  pickupAddress: 'User address'
};
```

### 2. Razorpay Integration
```typescript
// Frontend initiates Razorpay checkout
await paymentService.initiatePayment(
  orderData,
  userDetails,
  onSuccess,
  onError
);
```

### 3. Payment Verification
```typescript
// Backend verifies payment signature
const isValid = verifyPaymentSignature(
  orderId,
  paymentId,
  signature,
  razorpaySecret
);
```

## 🔒 Security Features

- **Payment Signature Verification** - Server-side validation
- **Authentication Required** - All payment APIs require valid JWT
- **Amount Validation** - Server validates payment amounts
- **Webhook Verification** - Secure webhook signature validation
- **Environment Variables** - API keys stored securely

## 🛠️ Customization

### Service Fees
Update service fees in `PickupManagement.tsx`:
```typescript
const getServiceFee = (deviceInfo: string): number => {
  const deviceLower = deviceInfo.toLowerCase();
  if (deviceLower.includes('laptop')) return 15000; // ₹150
  if (deviceLower.includes('smartphone')) return 5000; // ₹50
  return 10000; // ₹100 default
};
```

### Payment Options
Modify Razorpay options in `paymentService.ts`:
```typescript
const options: RazorpayOptions = {
  key: RAZORPAY_KEY_ID,
  amount: orderResponse.data.amount,
  currency: 'INR',
  name: 'Recycle\'IT',
  description: 'E-waste Management Service Payment',
  // Add more customization here
};
```

## 🐛 Troubleshooting

### Common Issues

1. **"Payment failed" errors**
   - Check Razorpay API keys in `.env` files
   - Verify backend server is running
   - Check browser console for detailed errors

2. **Authentication errors**
   - Ensure user is logged in
   - Check JWT token in localStorage
   - Verify auth middleware is working

3. **Amount validation errors**
   - Ensure amounts are in paise (multiply by 100)
   - Check minimum amount requirements

### Debug Steps

1. **Check environment variables**
   - Visit `/payment-test` page
   - Verify configuration status

2. **Check API connectivity**
   - Open browser developer tools
   - Monitor network requests
   - Check API responses

3. **Verify Razorpay integration**
   - Check Razorpay dashboard for test transactions
   - Verify webhook configurations

## 📞 Support

For technical support:
- Check Razorpay documentation: https://razorpay.com/docs/
- Review payment service logs in browser console
- Test with Razorpay test credentials first

## 🔄 Next Steps

1. **Get production Razorpay credentials**
2. **Update environment variables with production keys**
3. **Configure production webhook URLs**
4. **Test complete payment flow in production**
5. **Set up payment analytics and monitoring**