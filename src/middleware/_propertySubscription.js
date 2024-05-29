/* eslint-disable no-console */
import db from '@/database';

// eslint-disable-next-line consistent-return
export default async function (req, res, next) {
  const userId = req.user.id; // Assuming you have user id from the request
  const subscription = await db.models.subscription.findOne({
    where: { name: 'USEE360 Basic' },
  });
  const feature = await db.models.feature.findOne({
    where: { name: 'Property Listing' },
  });

  try {
    const userSubscription = await db.models.userSubscription.findOne({
      where: { userId, subscriptionId: subscription.id, featureId: feature.id },
    });

    if (!userSubscription) {
      return res.status(403).json({
        error: true,
        message: 'Please subscribe to property listing feature to view properties.',
      });
    }

    if (userSubscription.freeRemainingUnits > 0) {
      userSubscription.freeRemainingUnits -= 1; // Deduct one unit from freeRemainingUnits
    } else if (userSubscription.paidRemainingUnits > 0) {
      userSubscription.paidRemainingUnits -= 1; // Deduct one unit from paidRemainingUnits
    } else {
      return res.status(403).json({ error: true, message: 'Not enough units to access property listing feature.' });
    }

    await userSubscription.save();

    return next(); // Continue to the actual route handler
  } catch (error) {
    console.error('Error in deductUnitsMiddleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
