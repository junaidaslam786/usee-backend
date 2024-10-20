import 'dotenv/config';
import db from '@/database';
import createError from 'http-errors';
import { whitelistRegex, whitelistStrings } from './whitelist';

const swaggerDocsPaths = new RegExp('^/docs.*');

const { INTERNAL_API_CODE } = process.env;

export default async function apiSubscription(req, res, next) {
  // eslint-disable-next-line camelcase
  const { apicode } = req.headers;

  // Bypass the api_code check for the auth/login route
  if (req.path === '/' || req.path === '/auth/login' || swaggerDocsPaths.test(req.path)) {
    return next();
  }

  // eslint-disable-next-line camelcase
  if (!apicode) {
    return next(createError(403, 'No API Code provided!'));
  }

  // Internal call handling (no unit deduction)
  // eslint-disable-next-line camelcase
  if (apicode === INTERNAL_API_CODE) {
    return next();
  }

  // API code validation
  const agent = await db.models.agent.findOne({ where: { apiCode: apicode } });
  if (!agent) {
    return next(createError(401, 'Invalid API code!'));
  }

  // Check if the route is in the whitelist (with method)
  const isWhitelisted = whitelistRegex.some((route) => route.path.test(req.path) && route.method === req.method)
    || whitelistStrings.some((route) => route.path === req.path && route.method === req.method);

  if (!isWhitelisted) {
    return next(createError(403, 'Unauthorized API call!'));
  }

  // Unit deduction logic
  const { userId } = agent;
  const subscription = await db.models.subscription.findOne({ where: { name: 'USEE360 Basic' } });
  const feature = await db.models.feature.findOne({ where: { name: 'API Subscription' } });

  try {
    const userSubscription = await db.models.userSubscription.findOne({
      where: { userId, subscriptionId: subscription.id, featureId: feature.id },
    });

    if (!userSubscription) {
      return next(createError(402, 'Please subscribe to API Subscription feature!'));
    }

    // Check if the user has any remaining units (free or paid)
    if (userSubscription.freeRemainingUnits <= 0 && userSubscription.paidRemainingUnits <= 0) {
      return res.status(403).json({
        error: true,
        message: 'Not enough units to access API Subscription feature.',
      });
    }

    // Attach an event listener to capture the final response status
    res.on('finish', async () => {
      // Only deduct units when the response status is 201 (success)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Deduct free units if available
        if (userSubscription.freeRemainingUnits > 0) {
          userSubscription.freeRemainingUnits -= 1;
        }

        // If no free units are available, deduct paid units if available
        if (userSubscription.freeRemainingUnits <= 0 && userSubscription.paidRemainingUnits > 0) {
          userSubscription.paidRemainingUnits -= 1;
        }

        await userSubscription.save();
      }
    });

    return next();
  } catch (error) {
    console.error('Error in apiSubscription middleware:', error);
    return next(createError(500, 'Internal Server Error'));
  }
}
