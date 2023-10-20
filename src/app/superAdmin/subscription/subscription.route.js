// import express from 'express';
// import stripe from '../helpers/stripe'; // Assuming the previous path where you stored stripe instance
// import db from '../models';  // Your sequelize models

// const router = express.Router();

// router.post('/subscribe', async (req, res) => {
//   const { paymentMethodId, planId, customerId } = req.body;

//   if (!paymentMethodId || !planId || !customerId) {
//     return res.status(400).json({ error: 'Required parameters are missing.' });
//   }

//   try {
//     // Retrieve user from your database
//     const user = await db.user.findByPk(customerId);
//     if (!user) {
//       return res.status(404).json({ error: 'User not found.' });
//     }

//     let stripeCustomerId = user.stripeCustomerId;

//     // If user does not have a Stripe customer ID, create a new customer in Stripe
//     if (!stripeCustomerId) {
//       const customer = await stripe.customers.create({
//         payment_method: paymentMethodId,
//         email: user.email,
//         invoice_settings: {
//           default_payment_method: paymentMethodId,
//         },
//       });
//       stripeCustomerId = customer.id;

//       // Update user in your database with the new stripeCustomerId
//       await user.update({ stripeCustomerId });
//     }

//     // Create subscription
//     const subscription = await stripe.subscriptions.create({
//       customer: stripeCustomerId,
//       items: [{ plan: planId }],
//       expand: ['latest_invoice.payment_intent'],
//     });

//     const paymentIntent = subscription.latest_invoice.payment_intent;

//     if (paymentIntent.status === 'succeeded') {
//       // Update your database: mark user as subscribed and store subscription details
//       await db.userSubscription.create({
//         userId: user.id,
//         subscriptionId: subscription.id,
//         planId: planId,
//         currentPeriodEnd: new Date(subscription.current_period_end * 1000),  // Convert from Unix timestamp
//         // ... any other relevant data
//       });

//       return res.json({ success: true });
//     } else {
//       // Handle other payment statuses accordingly
//       return res.status(400).json({ error: 'Payment failed.' });
//     }
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// });

// export default router;
