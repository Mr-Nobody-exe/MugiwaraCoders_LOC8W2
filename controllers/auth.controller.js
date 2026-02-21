import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { success, error } from '../utils/apiResponse.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json(error('Email already registered', 409));

  const user = await User.create({ name, email, password, phone });
  const token = signToken(user._id);

  res.status(201).json(success(
    { token, user: { id: user._id, name, email, role: user.role } },
    'Registered successfully',
    201
  ));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json(error('Invalid credentials', 401));
  }

  const token = signToken(user._id);
  res.json(success({ token, user: { id: user._id, name: user.name, role: user.role } }, 'Login successful'));
});