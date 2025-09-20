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

// Generic email sending function
const sendEmail = async (to, subject, text = '', html = null) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@recycleit.com',
    to,
    subject,
    ...(html && { html }) // Only include HTML if provided
  };

  // If no HTML is provided, use text
  if (!html && text) {
    mailOptions.text = text;
  } else if (html && !text) {
    // If only HTML is provided, create a plain text version by stripping HTML tags
    mailOptions.text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  } else if (html && text) {
    // If both are provided, use both
    mailOptions.text = text;
  }

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email: ' + error.message);
  }
};

module.exports = {
  sendOTPEmail,
  sendEmail
};