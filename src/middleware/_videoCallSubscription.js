import db from '@/database';

// eslint-disable-next-line consistent-return
export default async function (req, res, next) {
  const userId = req.user.id; // Assuming you have user id from the request
  const subscriptionId = '35e0b998-53bc-4777-a207-261fff3489aa'; // Determine the subscription ID based on the request
  const featureId = '159c869a-1b24-4cd3-ac61-425645b730c7'; // Determine the feature ID based on the request

  try {
    const subscription = await db.models.userSubscription.findOne({
      where: { userId, subscriptionId, featureId },
    });

    if (!subscription) {
      return res.status(403).json({ error: true, message: 'No subscription found for this feature.' });
    }

    if (subscription.freeRemainingUnits > 0) {
      subscription.freeRemainingUnits -= 1; // Deduct one unit from freeRemainingUnits
    } else if (subscription.paidRemainingUnits > 0) {
      subscription.paidRemainingUnits -= 1; // Deduct one unit from paidRemainingUnits
    } else {
      return res.status(403).json({ error: true, message: 'Not enough units to access this feature.' });
    }

    await subscription.save();

    return next(); // Continue to the actual route handler
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in deductUnitsMiddleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
