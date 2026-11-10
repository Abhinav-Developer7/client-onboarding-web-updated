import jwt from 'jsonwebtoken';
import { StaffUser } from '../models/StaffUser.js';

const sendTokenResponse = (user, statusCode, res) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_client_onboarding_2026_dev';
  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  });
};

/**
 * Staff Login
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await StaffUser.findOne({ email: email.toLowerCase() });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Staff Logout
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Get current authenticated staff user
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role
    }
  });
};

/**
 * Register / Seed Staff Member
 * POST /api/auth/register-staff
 */
export const registerStaff = async (req, res, next) => {
  try {
    const { email, password, fullName, role } = req.body;

    const existingUser = await StaffUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A staff member with this email already exists'
      });
    }

    const newUser = await StaffUser.create({
      email,
      password,
      fullName,
      role: role || 'staff'
    });

    sendTokenResponse(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

