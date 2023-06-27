import jwt from 'jsonwebtoken';

export const generateToken = (data, expiresIn = '4h') => {
  const options = {
    expiresIn,
  };
  return jwt.sign(data, process.env.JWT_SECRET_KEY, options);
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch(error) {
    // console.log('jwtexpire', error);
    return '';
  }
};
