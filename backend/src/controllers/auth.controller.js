import { env } from '../config/env.js';
import { COOKIE_NAMES } from '../constants/index.js';
import * as authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.loginUser(req.body);

  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    accessToken,
    user,
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token not found',
    });
  }

  const { accessToken, user } = await authService.refreshAccessToken(token);

  res.json({
    success: true,
    accessToken,
    user,
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    ...refreshCookieOptions,
    maxAge: 0,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
