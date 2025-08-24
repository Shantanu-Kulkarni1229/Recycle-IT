# Recycle IT Backend

A Node.js backend application for the Recycle IT platform, managing users and recyclers with secure authentication and document verification.

## Features

- User and Recycler Authentication
- Email Verification with OTP
- Password Reset Functionality
- Document Upload and Verification
- JWT-based Authentication
- MongoDB Database Integration
- Input Validation
- Error Handling

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for Authentication
- Bcrypt for Password Hashing
- Nodemailer for Email Services
- Multer for File Upload
- Express Validator for Input Validation

## Project Structure

```
├── controllers/
│   ├── UserController.js
│   └── RecyclerController.js
├── models/
│   ├── User.js
│   └── Recycler.js
├── routes/
│   ├── userRoutes.js
│   └── recyclerRoutes.js
├── middleware/
│   └── auth.js
├── utils/
│   └── emailService.js
├── uploads/
│   └── documents/
├── .env
├── .env.example
├── package.json
└── server.js
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file based on `.env.example`
4. Create uploads directory:
   ```bash
   mkdir -p uploads/documents
   ```
5. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Documentation

### User Endpoints

#### Public Routes
- `POST /api/users/register` - Register new user
- `POST /api/users/verify-otp` - Verify email OTP
- `POST /api/users/login` - User login
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password with OTP
- `POST /api/users/resend-otp` - Resend verification OTP

#### Protected Routes (Requires Authentication)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Recycler Endpoints

#### Public Routes
- `POST /api/recyclers/register` - Register new recycler
- `POST /api/recyclers/verify-otp` - Verify email OTP
- `POST /api/recyclers/login` - Recycler login
- `POST /api/recyclers/forgot-password` - Request password reset
- `POST /api/recyclers/reset-password` - Reset password with OTP
- `POST /api/recyclers/resend-otp` - Resend verification OTP

#### Protected Routes (Requires Authentication)
- `GET /api/recyclers/profile` - Get recycler profile
- `PUT /api/recyclers/profile` - Update recycler profile
- `POST /api/recyclers/upload-documents` - Upload verification documents
- `GET /api/recyclers/assigned-ewaste` - Get assigned e-waste items
- `PUT /api/recyclers/inspection-status` - Update e-waste inspection status
- `DELETE /api/recyclers/delete` - Delete recycler account

#### Admin Routes
- `PUT /api/recyclers/verify/:id` - Update recycler verification status

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Upload

Document upload endpoints accept multipart/form-data with the following specifications:
- Maximum 5 files per request
- Supported formats: JPEG, PNG, PDF
- Maximum file size: 5MB

## Error Handling

The API returns consistent error responses in the following format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT
- `EMAIL_SERVICE` - Email service provider
- `EMAIL_USER` - Email username
- `EMAIL_PASSWORD` - Email password/app password
- `EMAIL_FROM` - Sender email address

## License

MIT