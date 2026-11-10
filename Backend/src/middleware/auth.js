import jwt from 'jsonwebtoken';
import { StaffUser } from '../models/StaffUser.js';

export const protectStaff = async (req, res, next) => {
  let token = null;

  // 1. Prefer Authorization Bearer header if provided
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Fall back to cookie if no Bearer header provided
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_client_onboarding_2026_dev';

  try {
    const decoded = jwt.verify(token, secret);
    const user = await StaffUser.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User session is invalid or has been deactivated.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // If token failed, check if an alternate token was supplied (e.g. cookie was expired but header is fresh)
    const alternateToken =
      token === req.cookies?.token && req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (alternateToken && alternateToken !== token) {
      try {
        const decoded = jwt.verify(alternateToken, secret);
        const user = await StaffUser.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          req.user = user;
          return next();
        }
      } catch (_) {}
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }
};

