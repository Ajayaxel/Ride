import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ride',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_key_change_me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key_change_me',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY || '1d',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

// Simple validation to ensure critical configurations exist
if (!process.env.MONGO_URI) {
  console.warn('⚠️ WARNING: MONGO_URI environment variable is not defined in .env. Falling back to localhost.');
}

export default env;
