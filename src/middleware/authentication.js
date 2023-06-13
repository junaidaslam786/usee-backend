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
      },
      {
        model: req.dbInstance.agent,
      },
      {
        model: req.dbInstance.agentAccessLevel,
      }
    ],
    paranoid: false
  });

  if (!user) {
    return next({ status: 401, message: 'There is no user with this email address!' });
  }

  if (!user.status) {
    return next({ status: 401, message: 'Account is disabled, please contact admin!' });
  }

  if (user.deletedAt) {
    return next({ status: 401, message: 'Account is deleted, please contact admin!' });
  }
    
  req.permissions = [];
  if (user?.role?.permissions) {
    user.role.permissions.map((perm) => {
      req.permissions.push(perm.key);
    });
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
      const newRefreshToken = user.generateToken('4h');

      // Set response headers
      res.setHeader('Token', newToken);
      res.setHeader('RefreshToken', newRefreshToken);
    }
  }

  // Go to next middleware
  return next();
}
