import Stripe from 'stripe';
import createError from 'http-errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// const checkFeatureAccess = (featureName) => {
//     return async (req, res, next) => {
//         const userId = req.user.id; // assuming you store user's id in the request
//         const userSubscription = await UserSubscription.findOne({ where: { userId: userId } });

//         const subscription = await Subscription.findByPk(userSubscription.subscriptionId, {
//             include: [Feature]
//         });

//         const hasAccess = subscription.features.some(feature => feature.name === featureName);

//         if (!hasAccess) {
//             return res.status(403).json({ error: 'You do not have access to this feature.' });
//         }

//         next();
//     };
// }

export default async function stripeSubscription(req, res, next) {
    const user = req.user;

    if (!user) {
        return next(createError(401, 'Not authenticated!'));
    }

    if (user.stripeCustomerId) {
        try {
            const subscriptions = await stripe.subscriptions.list({
                customer: user.stripeCustomerId,
                status: 'active'
            });

            if (!subscriptions.data.length) {
                return next(createError(403, 'Your subscription has ended. Please renew to access the service.'));
            }
        } catch (err) {
            console.error('Error fetching Stripe subscription:', err);
            return next(createError(500, 'Error verifying subscription. Please try again later.'));
        }
    } else {
        return next(createError(403, 'You do not have an active subscription.'));
    }

    return next();
}
