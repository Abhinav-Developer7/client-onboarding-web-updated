import jwt from 'jsonwebtoken';
import { StaffUser } from '../models/StaffUser.js';

export const protectStaff = async (req, res, next) => {
  let token = req.cookies?.token;

  // Optional fallback to Authorization header if cookies are not used by an external test runner
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_client_onboarding_2026_dev');
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
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.'
    });
  }
};

