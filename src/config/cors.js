export default {
  origin: [
    process.env.CORS_ALLOWED_ORIGIN_FRONTEND,
    process.env.CORS_ALLOWED_ORIGIN_ADMIN,
    process.env.CORS_ALLOWED_ORIGIN_SUPERADMIN,
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'RefreshToken'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'RefreshToken', 'Token'],
};
