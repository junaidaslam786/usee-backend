import db from "@/database";

export default async function (req, res, next) {
  const userId = req.user.id; // Assuming you have user id from the request
  const subscriptionId = "35e0b998-53bc-4777-a207-261fff3489aa"; // Determine the subscription ID based on the request
  const featureId = "02d5274e-0739-4032-87fa-620211a31700"; // Determine the feature ID based on the request

  try {
    const subscription = await db.models.userSubscription.findOne({
      where: { userId, subscriptionId, featureId }
    });

    if (!subscription) {
      return res.status(403).json({ error: 'No subscription found for this feature.' });
    }

    if (subscription.freeRemainingUnits > 0) {
      subscription.freeRemainingUnits -= 1; // Deduct one unit from freeRemainingUnits
    } else if (subscription.paidRemainingUnits > 0) {
      subscription.paidRemainingUnits -= 1; // Deduct one unit from paidRemainingUnits
    } else {
      return res.status(403).json({ error: 'Not enough units to access this feature.' });
    }

    await subscription.save();

    return next(); // Continue to the actual route handler
  } catch (error) {
    console.error('Error in deductUnitsMiddleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
