import jwt from 'jsonwebtoken';
import { StaffUser } from '../models/StaffUser.js';

const sendTokenResponse = (user, statusCode, res) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_client_onboarding_2026_dev';

  // Ensure expiresIn is safely formatted and never zero or single-second
  let expiresIn = process.env.JWT_EXPIRES_IN;
  if (!expiresIn || expiresIn === '0' || expiresIn === '0s' || expiresIn === '0d' || expiresIn === '1' || expiresIn === '1s') {
    expiresIn = '7d';
  } else if (/^\d+$/.test(expiresIn)) {
    const num = parseInt(expiresIn, 10);
    expiresIn = num <= 30 ? `${num}d` : num;
  }

  const token = jwt.sign(payload, secret, { expiresIn });

  const isProduction = process.env.NODE_ENV === 'production';
  // Use 'none' in production to allow cross-origin requests between frontend & backend with HTTPS
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token, // Provided for dual-layer authentication (Authorization: Bearer fallback)
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
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction
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

