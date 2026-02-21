import { forbidden } from '../utils/apiResponse.js';

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json(forbidden(`Role '${req.user.role}' not allowed`));
  }
  next();
};