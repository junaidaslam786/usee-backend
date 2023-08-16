export default {
  origin: [process.env.CORS_ALLOWED_ORIGIN_FRONTEND, process.env.CORS_ALLOWED_ORIGIN_ADMIN],
  credentials: true,
  // origin: 'http://localhost:3001',
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'RefreshToken'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'RefreshToken', 'Token'],
};
