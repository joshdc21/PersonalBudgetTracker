const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (name !== undefined && typeof name !== 'string') {
      res.status(400);
      throw new Error('Name must be a string');
    }
    if (email !== undefined && typeof email !== 'string') {
      res.status(400);
      throw new Error('Email must be a string');
    }
    if (password !== undefined && typeof password !== 'string') {
      res.status(400);
      throw new Error('Password must be a string');
    }

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email and password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (email !== undefined && typeof email !== 'string') {
      res.status(400);
      throw new Error('Email must be a string');
    }
    if (password !== undefined && typeof password !== 'string') {
      res.status(400);
      throw new Error('Password must be a string');
    }

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (email !== undefined && typeof email !== 'string') {
      res.status(400);
      throw new Error('Email must be a string');
    }

    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const user = await User.findOne({ email });

    if (!user) {
      // To prevent user enumeration, return success even if user not found
      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email (if it exists).'
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Try sending email if configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@budgettracker.com',
          to: user.email,
          subject: 'Password Reset Request',
          text: `You requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.`,
        });
      } catch (err) {
        console.error('SMTP sending error:', err);
      }
    } else {
      // Print to server console for development/test visibility
      console.log('--- PASSWORD RESET URL ---');
      console.log(resetUrl);
      console.log('--------------------------');
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email (if it exists).',
      // Include token in test mode to facilitate test verification
      token: process.env.NODE_ENV === 'test' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (token !== undefined && typeof token !== 'string') {
      res.status(400);
      throw new Error('Token must be a string');
    }
    if (password !== undefined && typeof password !== 'string') {
      res.status(400);
      throw new Error('Password must be a string');
    }

    if (!token || !password) {
      res.status(400);
      throw new Error('Please provide token and password');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired password reset token');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    next(error);
  }
};
