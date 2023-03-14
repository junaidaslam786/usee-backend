import db from '@/database';
import { tokenHelper } from '@/helpers';
const {
  ENABLE_CLOUD_MODE,
} = process.env;

export default async function authenticate(req, res, next) {
  // Get authorization header from request
  const authorization = req.headers.authorization || '';
  const refreshToken = req.headers.refreshtoken || '';

  // Firstly, set request user to null
  req.user = null;
  req.dbInstance = db.models;
  req.appUrl = `${ENABLE_CLOUD_MODE ? "https" : req.protocol}://${req.get("host")}`

  // Check for empty Authorization header
  if (!authorization) {
    return next();
  }

  // Make sure the token is bearer token
  if (!authorization.startsWith('Bearer ')) {
    return next();
  }

  // Extract token from header
  const token = authorization.substring(7);
  const tokenData = await tokenHelper.verifyToken(token);

  // Check if token expired
  if (!tokenData) {
    return next({ status: 401, message: 'Your session is expired, login again.' });
  }

  // Find user from database
  const user = await req.dbInstance.user.findOne({
    where: { id: tokenData.id },
    include: [
      {
        attributes: ["id", "name"],
        model: req.dbInstance.role, as: 'role',
        include: [{ 
          model: req.dbInstance.permission, 
          attributes: ["id", "name", "key"],
          through: { attributes: [] }
        }]
      }
    ],
  });

  // Check if user exists
  if (!user) {
    return next({ status: 401, message: 'There is no user' });
  }

  req.permissions = [];
  if (user?.role?.permissions) {
    user.role.permissions.map((perm) => {
      req.permissions.push(perm.key);
    });
  }

  // Check if user exists
  if (!user) {
    return next({ status: 401, message: 'There is no user' });
  }

  // Set request user
  req.user = user;

  // Check if the token renewal time is coming
  const now = new Date();
  const exp = new Date(tokenData.exp * 1000);
  const difference = exp.getTime() - now.getTime();
  const minutes = Math.round(difference / 60000);

  // Check for refresh token and time left
  if (refreshToken && minutes < 15) {
    // Verify refresh token and get refresh token data
    const refreshTokenData = await tokenHelper.verifyToken(refreshToken);

    // Check the user of refresh token
    if (refreshTokenData.id === tokenData.id) {
      // Generate new tokens
      const newToken = user.generateToken();
      const newRefreshToken = user.generateToken('2h');

      // Set response headers
      res.setHeader('Token', newToken);
      res.setHeader('RefreshToken', newRefreshToken);
    }
  }

  // Go to next middleware
  return next();
}
