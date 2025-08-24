const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendOTPEmail = async (email, otp, type = 'verification') => {
  let subject, text;

  switch(type) {
    case 'verification':
      subject = 'Email Verification OTP';
      text = `Your verification OTP is: ${otp}. This OTP will expire in 10 minutes.`;
      break;
    case 'reset':
      subject = 'Password Reset OTP';
      text = `Your password reset OTP is: ${otp}. This OTP will expire in 10 minutes.`;
      break;
    default:
      subject = 'OTP Notification';
      text = `Your OTP is: ${otp}. This OTP will expire in 10 minutes.`;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendOTPEmail
};