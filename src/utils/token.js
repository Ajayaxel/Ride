import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Generate Access Token
 * @param {object} payload - Payload to be signed
 * @returns {string} Signed JWT Access Token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiry,
  });
};

/**
 * Generate Refresh Token
 * @param {object} payload - Payload to be signed
 * @returns {string} Signed JWT Refresh Token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiry,
  });
};

/**
 * Verify Access Token
 * @param {string} token - JWT Token to verify
 * @returns {object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtAccessSecret);
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT Token to verify
 * @returns {object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.jwtRefreshSecret);
};
