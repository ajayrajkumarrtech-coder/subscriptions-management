import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils.js';

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already exists', 400);
  }

  const user = await User.create({ name, email, password });
  return formatUser(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const payload = { id: user._id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    user: formatUser(user),
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const { verifyRefreshToken } = await import('../utils/tokenUtils.js');
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  const accessToken = generateAccessToken({ id: user._id, role: user.role });
  return { accessToken, user: formatUser(user) };
};
