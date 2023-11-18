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
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'aed',
      automatic_payment_methods: {enabled: true},
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Route to confirm a payment intent
app.post('/confirm-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

    res.status(200).json({ paymentIntent: paymentIntent });
  } catch (error) {
    console.error('Error confirming payment intent:', error.message);
    res.status(500).json({ error: 'Failed to confirm payment intent' });
  }
});

// Route to capture a payment intent
app.post('/capture-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    res.status(200).json({ paymentIntent: paymentIntent });
  } catch (error) {
    console.error('Error capturing payment intent:', error.message);
    res.status(500).json({ error: 'Failed to capture payment intent' });
  }
});

// Route to cancel a payment intent
app.post('/cancel-payment-intent', async (req, res) => {
  const { paymentIntentId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);

    res.status(200).json({ paymentIntent: paymentIntent });
  } catch (error) {
    console.error('Error cancelling payment intent:', error.message);
    res.status(500).json({ error: 'Failed to cancel payment intent' });
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
app.post('/create-invoice', async (req, res) => {
  const { customerId, priceId, quantity } = req.body;

  try {
    // Retrieve customer's Stripe ID from your database
    const customer = await db.models.user.findOne({ where: { stripe_customer_id: customerId } })

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Fetch price from stripe
    const price = await stripe.prices.retrieve(priceId);

    if (!price) {
      return res.status(404).json({ error: 'Price not found' });
    }

    // Create an invoice for the customer
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'charge_automatically',
    });

    // Create an invoice item for the product
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      price: priceId,
      quantity: quantity,
    });

    // Finalize the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(
      invoice.id
    );

    const totalAmount = quantity * price.unit_amount / 100;

    // Add the tokens to the user's account in your database
    const token = await db.models.token.create({
      userId: customer.id,
      quantity: quantity,
      price: price.unit_amount / 100,
      totalAmount: totalAmount,
      remainingAmount: totalAmount,
      stripeInvoiceId: invoice.id,
      stripeInvoiceStatus: finalizedInvoice ? finalizedInvoice.status : invoice.status
    });

    res.status(200).json({ token: token, message: 'Invoice created successfully!' });
  } catch (error) {
    console.error('Error creating invoice:', error.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Route to finalize an invoice
app.post('/finalize-invoice', async (req, res) => {
  const { stripeInvoiceId } = req.body;

  try {
    const invoice = await stripe.invoices.finalizeInvoice(stripeInvoiceId, { auto_advance: true });

    res.status(200).json({ invoice: invoice });
  } catch (error) {
    console.error('Error finalizing invoice:', error.message);
    res.status(500).json({ error: 'Failed to finalize invoice' });
  }
});

// Route to pay an invoice
app.post('/pay-invoice', async (req, res) => {
  const { stripeInvoiceId } = req.body;

  try {
    const invoice = await stripe.invoices.pay(stripeInvoiceId, { out_of_band: true });

    res.status(200).json({ invoice: invoice });
  } catch (error) {
    console.error('Error paying invoice:', error.message);
    res.status(500).json({ error: 'Failed to pay invoice' });
  }
});

// Route to send invoice to customer manually
app.post('/send-invoice', async (req, res) => {
  const { stripeInvoiceId } = req.body;

  try {
    const invoice = await stripe.invoices.sendInvoice(stripeInvoiceId);

    res.status(200).json({ invoice: invoice });
  } catch (error) {
    console.error('Error sending invoice:', error.message);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

// Route to fetch details of a product from Stripe
app.get('/fetch-stripe-product-details', async (req, res) => {
  const { productId } = req.body;

  try {
    const product = await stripe.products.retrieve(
      productId
    );

    res.status(200).json({ product: product });
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// Route to fetch all active prices of a product from Stripe
app.get('/fetch-stripe-product-active-prices', async (req, res) => {
  const { productId } = req.body;

  try {
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    res.status(200).json({ prices: prices });
  } catch (error) {
    console.error('Error fetching product prices:', error.message);
    res.status(500).json({ error: 'Failed to fetch product prices' });
  }
});

// Route to fetch a price from Stripe
app.get('/fetch-stripe-price-details', async (req, res) => {
  const { priceId } = req.body;

  try {
    const price = await stripe.prices.retrieve(priceId);

    res.status(200).json({ price: price });
  } catch (error) {
    console.error('Error fetching price:', error.message);
    res.status(500).json({ error: 'Failed to fetch price details' });
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

      // find token by invoice id
      const token = await db.models.token.findOne({
        where: { stripe_invoice_id: invoice.id },
      });

      if (token) {
        token.stripeInvoiceStatus = invoice.status;
        await token.save();
      }

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
