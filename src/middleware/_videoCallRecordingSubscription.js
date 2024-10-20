import db from '@/database';
import { AGENT_TYPE } from '../config/constants';

// eslint-disable-next-line consistent-return
export default async function (req, res, next) {
  const userId = req.user.id;

  // User id for using subscription units of main agent/trader
  const agentId = req.user.agent.agentType === AGENT_TYPE.AGENT ? userId : req.user.agent.agentId;

  const subscription = await db.models.subscription.findOne({
    where: { name: 'USEE360 Basic' },
  });
  const feature = await db.models.feature.findOne({
    where: { name: 'Video Call Recording' },
  });

  try {
    const userSubscription = await db.models.userSubscription.findOne({
      where: { userId: agentId, subscriptionId: subscription.id, featureId: feature.id },
    });

    if (!userSubscription) {
      return res.status(403).json({
        error: true,
        message: 'Please subscribe to Video Call Recording feature to download.',
      });
    }

    // Check if the user has any remaining units (free or paid)
    if (userSubscription.freeRemainingUnits <= 0 && userSubscription.paidRemainingUnits <= 0) {
      return res.status(403).json({
        error: true,
        message: 'Not enough units to access Video Call Recording feature.',
      });
    }

    // Attach an event listener to capture the final response status
    res.on('finish', async () => {
      // Only deduct units when the response status is 201 (success)
      if (res.statusCode !== 200) {
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
    // eslint-disable-next-line no-console
    console.error('Error in deductUnitsMiddleware:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
