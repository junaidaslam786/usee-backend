import "dotenv/config";

import cors from "cors";
import logger from "morgan";
import express from "express";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import compression from "compression";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import * as Sentry from "@sentry/node";
import Stripe from 'stripe';
import db from "@/database";

import * as configs from "@/config";
import { authenticationMiddleware, stripeSubscriptionMiddleware, sentryMiddleware } from "@/middleware";
import user from "./database/models/user";

const { NODE_ENV } = process.env;

const app = express();

// Initialize stripe
const stripe = Stripe(configs.stripeConfig.stripe.apiKey, {
  apiVersion: configs.stripeConfig.stripe.apiVersion
});

// Create a Stripe product
// const product = stripe.products.create({
//   name: "Video Call",
//   type: 'good',
//   description: "Service for video call",
//   attributes: ['color', 'size'],
// });
// console.log("PRODUCT: ", product);

// Initialize sentry
if (NODE_ENV !== "development") {
  // configuration
  Sentry.init(configs.sentryConfig(app));

  // handlers
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Required middleware list
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.use(cors({
//   origin: '*'
// }));

app.use(cors(configs.corsConfig));
// if (NODE_ENV === "development") {
//   app.use(cors(configs.corsConfig));
// } else {
//   app.use(cors({ origin: "*" }));
// }

app.use(express.static("assets"));
app.use(express.static("uploads"));
app.use(compression(configs.compressionConfig));
app.use(cookieParser());
app.use(fileUpload());
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// Custom middleware list
app.use(authenticationMiddleware);
// app.use(stripeSubscriptionMiddleware);
if (NODE_ENV !== "development") {
  app.use(sentryMiddleware); // This should be loaded after authentication middleware.
}

// Load router paths
configs.routerConfig(app);

// TRADER ROUTES
// Get app configuration by key 
app.get('/config/:configKey', async (req, res) => {
  try {
    const { configKey } = req.params;

    const config = await db.models.appConfiguration.findOne({ where: { configKey } });
    res.status(200).json(config);
  } catch (error) {
    throw new Error(`Fetching configuration by key failed: ${error.message}`);
  }
});

// ROUTES THAT INTERACT WITH THE STRIPE API
// Create a PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/charge', async (req, res) => {
  try {
    // const token = req.body.stripeToken; // Get the Stripe token from the request
    const charge = await stripe.charges.create({ // Create a new charge
      amount: req.body.amount, // Amount to charge in cents
      currency: 'usd', // Currency
      description: 'Package of 50 tokens', // Description of the charge
      source: stripe.token.create(), // Source token
    });
    res.status(200).json(charge); // Send the charge data as a response
  } catch (err) {
    res.status(500).json(err); // Send any errors as a response
  }
});

// Route to handle customer creation and save to the database
app.post('/create-customer', async (req, res) => {
  const { email, token, userId } = req.body;

  try {
    const user = await db.models.user.findOne({
      where: { id: userId },
    });

    // Create a PaymentMethod using the provided card details
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: token,
      },
    });

    // Create a Customer in Stripe
    const customer = await stripe.customers.create({
      name: user.fullName,
      email: email,
      payment_method: paymentMethod.id,
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    user.stripeCustomerId = customer.id;
    await user.save();

    res.status(200).json({ customerId: customer.id, message: 'Stripe customer created successfully!' });
  } catch (error) {
    console.error('Error creating customer:', error.message);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Route to create an invoice for a customer with a specific product
// 
app.post('/create-invoice', async (req, res) => {
  const { customerId, productId, priceId, quantity, amount } = req.body;

  try {
    // Retrieve customer's Stripe ID from your database
    const customer = await db.models.user.findOne({ where: { stripe_customer_id: customerId } })

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Create an invoice for the customer
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
    });
    // console.log("INVOICE: ", invoice);

    // Create an invoice item for the product
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      price: priceId,
      quantity: quantity,
    });
    // console.log("INVOICE ITEM: ", invoiceItem);

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      invoice.id
    );

    // Add the tokens to the user's account in your database
    const token = await db.models.token.create({
      userId: customer.id,
      quantity: quantity,
      price: amount,
      totalAmount: quantity * amount,
      stripeInvoiceId: invoice.id,
      stripeInvoiceStatus: invoice.status
    });

    res.status(200).json({ token: token, message: 'Invoice created successfully!' });
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Webhook endpoint to handle events from Stripe
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, 'your_stripe_webhook_secret');
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      // Handle successful payment, e.g., update your database
      break;
    case 'customer.created':
      const customer = event.data.object;

      // Save the Stripe customer ID to your database
      const user = await db.models.user.findOne({
        where: { email: customer.email },
      });
      if (user) {
        user.stripeCustomerId = customer.id;
        await user.save();
      }
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send('Success');
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Sentry error logging - error handler
if (NODE_ENV !== "development") {
  app.use(Sentry.Handlers.errorHandler());
}

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).json(err);
});

// process.env.TZ = "Asia/Dubai";
// console.log(new Date().toString());

export default app;
