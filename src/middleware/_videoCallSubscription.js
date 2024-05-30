import db from '@/database';

// eslint-disable-next-line consistent-return
export default async function (req, res, next) {
  const userId = req.user.id; // Assuming you have user id from the request
  const { properties } = req.body;

  const subscription = await db.models.subscription.findOne({
    where: { name: 'USEE360 Basic' },
  });
  const feature = await db.models.feature.findOne({
    where: { name: 'Video Call' },
  });

  try {
    const userSubscription = await db.models.userSubscription.findOne({
      where: { userId, subscriptionId: subscription.id, featureId: feature.id },
    });

    if (!userSubscription) {
      return res.status(403).json({
        error: true,
        message: 'Please subscribe to video call feature to book an appointment.',
      });
    }

    const propertySubscription = await db.models.productSubscription.findOne({
      where: { userSubscriptionId: userSubscription.id, productId: properties[0] },
    });

    if (!propertySubscription) {
      return res.status(403).json({
        error: true,
        message: 'Please subscribe to video call feature to book an appointment for this property.',
      });
    }
    if (propertySubscription.freeRemainingUnits > 0) {
      propertySubscription.freeRemainingUnits -= 1; // Deduct one unit from freeRemainingUnits
    } else if (propertySubscription.paidRemainingUnits > 0) {
      propertySubscription.paidRemainingUnits -= 1; // Deduct one unit from paidRemainingUnits
    } else {
      return res.status(403).json({ error: true, message: 'Not enough units to access video call feature.' });
    }

    await propertySubscription.save();

    return next(); // Continue to the actual route handler
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in deductUnitsMiddleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
