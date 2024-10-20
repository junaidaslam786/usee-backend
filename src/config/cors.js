export default {
  origin: [
    process.env.CORS_ALLOWED_ORIGIN_FRONTEND,
    process.env.CORS_ALLOWED_ORIGIN_ADMIN,
    process.env.CORS_ALLOWED_ORIGIN_SUPERADMIN,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'RefreshToken', 'Apicode'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'RefreshToken', 'Token'],
  maxAge: 86400, // Cache preflight response for 24 hours
};
