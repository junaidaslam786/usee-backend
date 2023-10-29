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

import * as configs from "@/config";
import { authenticationMiddleware, stripeSubscriptionMiddleware, sentryMiddleware } from "@/middleware";

const { NODE_ENV } = process.env;

const app = express();

// Initialize stripe
const stripe = Stripe(configs.stripeConfig.stripe.apiKey, {
  apiVersion: configs.stripeConfig.stripe.apiVersion
});

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

// Routes that interact with the Stripe API
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
