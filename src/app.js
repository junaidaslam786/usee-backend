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
import { authenticationMiddleware, sentryMiddleware } from "@/middleware";
import { utilsHelper, mailHelper } from '@/helpers';

import { AGENT_TYPE, USER_TYPE, AGENT_USER_ACCESS_TYPE_VALUE, PRODUCT_STATUS, PRODUCT_CATEGORIES, PROPERTY_ROOT_PATHS, VIRTUAL_TOUR_TYPE, USER_ALERT_MODE, USER_ALERT_TYPE, OFFER_STATUS, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, PRODUCT_LOG_TYPE } from '@/config/constants';

const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const qs = require('qs');
const { NODE_ENV } = process.env;

const app = express();

const cache = require('express-cache-headers');
app.use(cache({ maxAge: 86400 }));

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

// Enviroment variables
// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const TWITTER_CONSUMER_KEY = process.env.TWITTER_API_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_OAUTH_CLIENT_ID = process.env.TWITTER_OAUTH_CLIENT_ID;
const TWITTER_OAUTH_CLIENT_SECRET = process.env.TWITTER_OAUTH_CLIENT_SECRET;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_PRIMARY_CLIENT_SECRET = process.env.LINKEDIN_PRIMARY_CLIENT_SECRET;
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_ENDPOINT_SECRET;

// Webhook endpoint to handle events from Stripe
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (request, response) => {
  let event = request.body;
  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (STRIPE_ENDPOINT_SECRET) {
    // Get the signature sent by Stripe
    const signature = request.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        STRIPE_ENDPOINT_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return response.sendStatus(400);
    }
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        // console.log("invoice: ", invoice);

        // find token by invoice id
        const token1 = await db.models.token.findOne({
          where: { stripe_invoice_id: invoice.id },
        });

        if (token1) {
          token1.stripeInvoiceStatus = invoice.status;
          token1.stripeInvoiceData = invoice;
          if (invoice.status === "paid") {
            token1.acquiredDate = new Date();
            token1.valid = true;
          }
          await token1.save();
        }
        break;

      case 'customer.created':
        const customer = event.data.object;
        // console.log("customer: ", customer);

        // Save the Stripe customer ID to your database
        const user = await db.models.user.findOne({
          where: { email: customer.email },
        });

        if (user) {
          // console.log("user: ", user);
          user.stripeCustomerId = customer.id;
          await user.save();
        }
        break;

      case 'checkout.session.completed':
        const checkoutSession = event.data.object;
        console.log("checkoutSession: ", checkoutSession);

        // Save the Stripe subscription ID to your database
        const token = await db.models.token.findOne({
          where: { stripe_checkout_session_id: checkoutSession.id },
        });

        if (token) {
          // console.log("token: ", token);
          token.stripeInvoiceId = checkoutSession.invoice;
          token.stripeInvoiceStatus = checkoutSession.payment_status;
          if (checkoutSession.payment_status === "paid") {
            token.acquiredDate = new Date();
            token.valid = true;
          }
          await token.save();
        }
        break;

      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.status(200).end();
  } catch (error) {
    console.error(error);
    response.status(400).json({ success: false, message: error.raw.message });
  }
});

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
app.use(bodyParser.json({ limit: "150mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

// Custom middleware list
app.use(authenticationMiddleware);
// app.use(userSubscriptionMiddleware);
if (NODE_ENV !== "development") {
  app.use(sentryMiddleware); // This should be loaded after authentication middleware.
}

// Load router paths
configs.routerConfig(app);

// SOCIAL MEDIA AUTHENTICATION ROUTES
// Facebook authentication route
app.post('/auth/facebook', (req, res) => {
  const { userType } = req.body;

  if (!userType) {
    return res.status(400).json({ error: true, message: 'User type is required' });
  }

  try {
    const redirectUrl = `${process.env.APP_URL}/auth/facebook/callback`;
    const scope = 'email';
    const state = userType;
    const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${redirectUrl}&scope=${scope}&state=${state}`;

    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Facebook authentication failure' });
  }
});

// Facebook authentication callback route
app.get('/auth/facebook/callback', async (req, res) => {
  const { code, state } = req.query;

  // console.log("FACEBOOK CALLBACK");
  // console.log("CODE: ", code);
  switch (state) {
    case 'agent':
    case 'customer':
      break;
    default:
      return res.status(400).json({ error: true, message: 'Invalid state parameter' });
  }

  try {
    const access_token_response = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${process.env.APP_URL}/auth/facebook/callback&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;

    await axios.get(access_token_response)
      .then(async (response) => {
        const { data } = response;
        // eslint-disable-next-line no-console
        // console.log('DATA', data);

        const { access_token } = data;

        const detailsResponse = `https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`;
        await axios.get(detailsResponse).then(async (response) => {
          const { id, name, email } = response.data;

          console.log("RESPONSE: ", response.data);

          let user = await db.models.user.findOne({
            where: { email: email },
          });
          let agent = null;

          if (!user) {
            const nameArray = name.split(" ");
            const firstName = nameArray[0];
            const lastName = nameArray[1];

            user = await db.models.user.create({
              firstName: firstName,
              lastName: lastName,
              email: email,
              userType: state,
              signupStep: -1,
              status: true,
              active: false,
              facebookId: id,
            });

            // create agent using above user
            if (state === 'agent') {
              agent = await db.models.agent.create({
                userId: user.id,
                agentType: AGENT_TYPE.AGENT,
                createdBy: user.id,
                updatedBy: user.id,
              });
            }
          }

          const token = await user.generateToken('4h', agent);
          const refreshToken = await user.generateToken('4h');

          // res.json({ success: true, user: user, token: token, refreshToken: refreshToken });
          if (state === 'agent') {
            res.redirect(`${process.env.HOME_PANEL_URL}/${state}/register-social?token=${token}&onboarded=${user.status && user.active ? 'true' : 'false'}&userType=agent`);
          } else {
            res.redirect(`${process.env.HOME_PANEL_URL}/${state}/dashboard?token=${token}`);
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Failed to authenticate user' });
  }
});

// Twitter authentication callback route
app.get('/auth/twitter/callback', async (req, res) => {
  const { code, state, oauth_token, oauth_verifier } = req.query;

  // if (state !== 'twitter') {
  //   return res.status(400).json({ error: 'Invalid state parameter' });
  // }

  // try {
    const response = await axios.post(`https://api.twitter.com/oauth/access_token?oauth_verifier=${oauth_verifier}&oauth_token=${oauth_token}`);
    const data = response.data;
    const queryString = response.data;
    const params = new URLSearchParams(queryString);

    const oauth_token2 = params.get('oauth_token');
    console.log("OAUTH TOKEN: ", oauth_token);
    console.log("OAUTH TOKEN2: ", oauth_token2);

    // get user details from twitter api
    const userResponse = await axios.get(`https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true`, {
      headers: {
        Authorization: `Bearer ${oauth_token}`
      }
    });

    const userData = userResponse.data;
    console.log("USER DATA: ", userData);

    const { id, name, email } = userData;

    const user = await db.models.user.findOne({
      where: { email: email },
    });

    if (!user) {
      const nameArray = name.split(" ");
      const firstName = nameArray[0];
      const lastName = nameArray[1];

      user = await db.models.user.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        userType: state,
        signupStep: -1,
        status: true,
        active: false,
        facebookId: id,
      });

      // create agent using above user
      if (state === 'agent') {
        const agent = await db.models.agent.create({
          userId: user.id,
          agentType: AGENT_TYPE.AGENT,
          createdBy: user.id,
          updatedBy: user.id,
        });
      }
    }

    const token = await user.generateToken();
    const refreshToken = await user.generateToken('4h');

    // send a social_user_details cookie to the frontend
    res.cookie('social_user_details', JSON.stringify({ user: user, token: token, refreshToken: refreshToken }), { maxAge: 120000, httpOnly: true });

    // res.json({ success: true, user: user, token: token, refreshToken: refreshToken });
    if (state === 'agent') {
      res.redirect(`${process.env.HOME_PANEL_URL}/${state}/register-social?token=${token}&onboarded=${user.status && user.active ? 'true' : 'false'}&userType=agent`);
    } else {
      res.redirect(`${process.env.HOME_PANEL_URL}/${state}/dashboard?token=${token}`);
    }
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ error: 'Failed to authenticate user' });
  // }
});

// Twitter authentication route
app.post('/auth/twitter', async (req, res) => {
  const { userType } = req.body;

  if (!userType) {
    return res.status(400).json({ error: 'User type is required' });
  }

  try {
    const callbackUrl = `${process.env.APP_URL}/auth/twitter/callback`;
    const scope = 'email';
    const state = 'twitter';

    const oauth = new OAuth({
      consumer: {
        key: TWITTER_CONSUMER_KEY,
        secret: TWITTER_CONSUMER_SECRET,
      },
      signature_method: 'HMAC-SHA1',
      hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64'),
    });

    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: {
        oauth_callback: callbackUrl,
      },
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    // Note: Use the "Authorization" key instead of "headers.Authorization" for axios POST requests
    const axiosOptions = {
      url: requestData.url,
      method: requestData.method,
      data: requestData.data,
      headers: { "Authorization": authHeader.Authorization },
    };

    await axios(axiosOptions)
      .then((response) => {
        // Handle successful response and extract the request token
        const queryString = response.data;
        const params = new URLSearchParams(queryString);

        const oauth_token = params.get('oauth_token');

        const url = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
        res.json({ url });
      })
      .catch((error) => {
        console.error(error);
        res.json(error);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// LinkedIn authentication callback route
app.get('/auth/linkedin/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.status(400).json({ error: true, message: error_description });
  }

  switch (state) {
    case 'agent':
    case 'customer':
      break;
    default:
      return res.status(400).json({ error: true, message: 'Invalid state parameter' });
  }

  try {
    const linkedinUrl = `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.APP_URL}/auth/linkedin/callback&client_secret=${LINKEDIN_PRIMARY_CLIENT_SECRET}&code=${code}`;

    const response = await axios.post(linkedinUrl);
    // const response = await axios.post(linkedinUrl, {}, {
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   }
    // });

    if (response.data.error) {
      return res.status(400).json({ error: true, message: decodeURI(response.data.error_description) });
    }

    const data = response.data;
    const { access_token } = data;

    const userResponse = await axios.get(`https://api.linkedin.com/v2/userinfo?oauth2_access_token=${access_token}`);
    const userData = userResponse.data;

    const { sub, name, email } = userData;
    console.log("USER DATA: ", userData);

    let user = await db.models.user.findOne({
      where: { email: email },
    });

    if (!user) {
      const nameArray = name.split(" ");
      const firstName = nameArray[0];
      const lastName = nameArray[1];

      user = await db.models.user.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        userType: state,
        signupStep: -1,
        status: false,
        active: false,
        linkedinId: sub,
      });
    }

    const token = await user.generateToken();
    const refreshToken = await user.generateToken('4h');

    // res.json({ success: true, user: user, token: token, refreshToken: refreshToken, access_token: access_token });
    res.redirect(`${process.env.HOME_PANEL_URL}/${state}/dashboard?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Failed to authenticate user' });
  }
});

// LinkedIn authentication route
app.post('/auth/linkedin', (req, res) => {
  const { userType } = req.body;

  if (!userType) {
    return res.status(400).json({ error: true, message: 'User type is required' });
  }

  try {
    const redirectUrl = `${process.env.APP_URL}/auth/linkedin/callback`;
    const scope = 'openid profile email';
    const state = userType;
    const url = encodeURI(`https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${redirectUrl}&state=${state}&scope=${scope}`);
    // console.log("URL: ", url);
    res.json({ url });
    // res.redirect(url);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'LinkedIn authentication failure' });
  }
});

// Google authentication callback route
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;

  switch (state) {
    case 'agent':
    case 'customer':
      break;
    default:
      return res.status(400).json({ error: true, message: 'Invalid state parameter' });
  }

  try {
    const redirectUrl = `${process.env.APP_URL}/auth/google/callback`;
    // const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scope}&state=${state}&response_type=code`;

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code: code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUrl,
      grant_type: 'authorization_code',
    });

    const data = response.data;
    const { access_token } = data;

    const userResponse = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`);
    const userData = userResponse.data;

    const { id, name, email } = userData;
    console.log("USER DATA: ", userData);

    let user = await db.models.user.findOne({
      where: { email: email },
    });

    if (!user) {
      const nameArray = name ? name.split(" ") : ["", ""];
      const firstName = nameArray[0];
      const lastName = nameArray[1];

      user = await db.models.user.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        userType: state,
        signupStep: -1,
        status: false,
        active: false,
        googleId: id,
      });
    }

    const token = await user.generateToken();
    const refreshToken = await user.generateToken('4h');

    // res.json({ success: true, user: user, token: token, refreshToken: refreshToken });
    res.redirect(`${process.env.HOME_PANEL_URL}/${state}/dashboard?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Google authentication route
app.post('/auth/google', (req, res) => {
  const { userType } = req.body;

  if (!userType) {
    return res.status(400).json({ error: true, message: 'User type is required' });
  }

  try {
    const redirectUrl = `${process.env.APP_URL}/auth/google/callback`;
    const scope = 'email';
    const state = userType;
    const url = encodeURI(`https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scope}&state=${state}&response_type=code`);

    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Google authentication failure' });
  }
});

// Microsoft authentication callback route
app.post('/auth/microsoft/callback', async (req, res) => {
  // const { code, state } = req.query;
  const { access_token, code, id_token, state } = req.body;

  switch (state) {
    case '11111':
    case '00000':
      break;
    default:
      return res.status(400).json({ error: true, message: 'Invalid state parameter' });
  }

  try {
    const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });
    const userData = userResponse.data;

    const { id, displayName, mail } = userData;

    let user = await db.models.user.findOne({
      where: { email: mail },
    });

    if (!user) {
      const nameArray = displayName.split(" ");
      const firstName = nameArray[0];
      const lastName = nameArray[1];

      user = await db.models.user.create({
        firstName: firstName,
        lastName: lastName,
        email: mail,
        userType: state,
        signupStep: -1,
        status: false,
        active: false,
        microsoftId: id,
      });

      // create agent using above user
      if (state === '1') {
        const agent = await db.models.agent.create({
          userId: user.id,
          agentType: AGENT_TYPE.AGENT,
          createdBy: user.id,
          updatedBy: user.id,
        });
      }
    }

    const token = await user.generateToken('1h');
    const refreshToken = await user.generateToken('4h');

    // send a social_user_details cookie to the frontend
    res.cookie('social_user_details', JSON.stringify({ user: user, token: token, refreshToken: refreshToken }), { maxAge: 120000, httpOnly: true });

    // res.json({ success: true, user: user, token: token, refreshToken: refreshToken });
    if (state === '11111') {
      res.redirect(`${process.env.HOME_PANEL_URL}/agent/register-social?token=${token}&onboarded=${user.status && user.active ? 'true' : 'false'}&userType=agent`);
    } else {
      res.redirect(`${process.env.HOME_PANEL_URL}/customer/dashboard?token=${token}`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Microsoft authentication failure' });
  }
});

// Microsoft authentication route
app.post('/auth/microsoft', async (req, res) => {
  const { userType } = req.body;

  if (!userType) {
    return res.status(400).json({ error: true, message: 'User type is required' });
  }

  try {
    const redirectUrl = `${process.env.APP_URL}/auth/microsoft/callback`;
    const scope = 'openid profile email offline_access User.Read';
    const state = userType == '00000' ? '00000' : '11111';
    const response_type = 'id_token token';
    const response_mode = 'form_post';
    const nonce = Math.floor(100000 + Math.random() * 900000);
    const url = encodeURI(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${MICROSOFT_CLIENT_ID}&redirect_uri=${redirectUrl}&scope=${scope}&state=${state}&response_type=${response_type}&response_mode=${response_mode}&nonce=${nonce}`);

    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: 'Microsoft authentication failure' });
  }
});

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
// Create a checkout session on stripe
app.post('/create-checkout-session', async (req, res) => {
  const { customerId, priceId, quantity, couponId } = req.body;

  try {
    // Fetch config value from app configurations table using stripe price id
    const appConfiguration = await db.models.appConfiguration.findOne({
      where: {
        configKey: 'tokenPrice',
        stripePriceId: priceId,
      },
      attributes: ['configValue'] // Fetch only the configValue attribute
    });

    if (!appConfiguration) {
      return res.status(404).json({ error: 'Price ID not found' });
    }

    // Retrieve customer's Stripe ID from your database
    const customer = await db.models.user.findOne({ where: { stripe_customer_id: customerId } })

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const checkoutSessionOptions = {
      customer: customer.stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: quantity,
      }],
      mode: 'payment',
      allow_promotion_codes: true,
      invoice_creation: {
        enabled: true,
      },
      success_url: `${process.env.HOME_PANEL_URL}/agent/wallet`,
      cancel_url: `${process.env.HOME_PANEL_URL}/agent/wallet`,
    }

    if (couponId) {
      checkoutSessionOptions.discounts = [{
        coupon: couponId,
      }];
    }

    const session = await stripe.checkout.sessions.create(checkoutSessionOptions);
    // console.log("SESSION: ", session);

    const totalAmount = quantity * appConfiguration.configValue;

    // Add the tokens to the user's account in your database
    const token = await db.models.token.create({
      userId: customer.id,
      quantity: quantity,
      price: appConfiguration.configValue,
      totalAmount: totalAmount,
      remainingAmount: quantity,
      stripeCheckoutSessionId: session.id,
      stripeCheckoutSessionData: session,
      createdBy: customer.id,
      updatedBy: customer.id,
    });

    res.json({ success: true, message: 'Checkout session created successfully', session: session, token: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create checkout session', message: err?.raw?.message });
  }
});

// Fetch all checkout sessions of a customer
app.get('/fetch-checkout-sessions', async (req, res) => {
  const { customerId } = req.body;

  try {
    const checkoutSessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 3,
    });

    res.json({ checkoutSessions: checkoutSessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch checkout sessions' });
  }
});

// Fetch all line items of a checkout session of a customer
app.get('/fetch-checkout-session-line-items', async (req, res) => {
  const { sessionId } = req.body;

  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(
      sessionId, {}
    );

    res.json({ lineItems: lineItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch checkout session line items' });
  }
});

// Create a success url
app.get('/success', async (req, res) => {
  res.render('success');
});

// Create a PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
  const { customerId, invoiceId, paymentMethodId, amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      // customer: customerId,
      // invoice: invoiceId,
      payment_method: paymentMethodId,
      amount: amount * 100,
      currency: 'aed',
      description: `Payment for Invoice# ${invoiceId}`,
      return_url: 'http://localhost:3000/success',
      // automatic_payment_methods: { enabled: true },
      // payment_method_types: ['card'],
      // setup_future_usage: 'off_session',
      confirm: true,
    });
    console.log("PAYMENT INTENT: ", paymentIntent);

    const invoice = await stripe.invoices.update(invoiceId, {
      payment_intent: paymentIntent.id
    });
    console.log("INVOICE: ", invoice);

    res.json({ success: true, paymentIntent: paymentIntent, invoice: invoice });
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
    user.stripePaymentMethodId = paymentMethod.id;
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
      auto_advance: true,
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
      remainingAmount: quantity,
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
    const invoice = await stripe.invoices.pay(stripeInvoiceId, {});

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

// Endpoint to process refunds
app.post('/refund', async (req, res) => {
  const { body: { customerId, invoiceId, paymentIntentId, amountToRefund, refundStatus } } = req;

  if (!customerId || !invoiceId || !paymentIntentId) {
    return res.status(400).json({ error: "Bad Request", message: "customerId, invoiceId, paymentIntentId and refundStatus are required." });
  }

  const customer = await db.models.user.findOne({ where: { stripe_customer_id: customerId } })

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const invoice = await db.models.token.findOne({ where: { stripe_invoice_id: invoiceId } })
  console.log("INVOICE: ", invoice);

  if (!invoice) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  try {
    let calculatedRefundAmount = null;
    let percentageUsed = parseFloat(invoice.remainingAmount / invoice.quantity);
    calculatedRefundAmount = invoice.totalAmount * percentageUsed;

    // Refund the PaymentIntent
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: (amountToRefund ? amountToRefund : calculatedRefundAmount) * 100,
    });
    console.log("REFUND: ", refund);

    if (!refund) {
      return res.status(404).json({ error: 'Refund is unsuccessful' });
    }

    invoice.refundStatus = refundStatus;
    invoice.refundAmount = calculatedRefundAmount;
    await invoice.save();

    // Add the tokens to the user's account in your database
    // const token = await db.models.token.create({
    //   userId: customer.id,
    //   quantity: invoice.quantity, // from invoice
    //   price: appConfiguration.configValue, // from inoive
    //   totalAmount: -to, // from invoice
    //   remainingAmount: 0, // from invoice
    //   refundStatus: refundStatus,
    //   refundAmount: refund.amount,
    //   createdBy: customer.id,
    //   updatedBy: customer.id,
    // });

    res.json({ success: true, message: 'Refund successful', data: refund });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to refund payment', message: error?.raw?.message });
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

app.get('/fetch-customer-invoices', async (req, res) => {
  const { customerId } = req.query; // or req.body, depending on your client's request

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 10, // You can adjust the limit or make it a parameter
    });

    res.status(200).json({ invoices: invoices.data });
  } catch (error) {
    console.error('Error fetching invoices:', error.message);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Route to fetch a specific invoice for a customer
app.get('/fetch-customer-invoice/:invoiceId', async (req, res) => {
  const { invoiceId } = req.params;

  try {
    // Fetch the specific invoice using the Stripe API
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Check if the invoice exists
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Respond with the invoice details
    res.status(200).json({ invoice: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error.message);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Endpoint to create a coupon
app.post('/create-coupon-amount', async (req, res) => {
  try {
    const { duration = 'once', amountOff, durationInMonths, couponId, name } = req.body;

    // Create a coupon on Stripe
    const coupon = await stripe.coupons.create({
      id: couponId,
      name,
      duration,
      amount_off: amountOff,
      currency: 'aed',
    });

    res.json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.raw.message });
  }
});

// Endpoint to create a coupon
app.post('/create-coupon-percent', async (req, res) => {
  try {
    const { duration = 'once', percentOff, durationInMonths, couponId, name } = req.body;

    // Create a coupon on Stripe
    const coupon = await stripe.coupons.create({
      id: couponId,
      name,
      duration,
      percent_off: percentOff,
    });

    res.json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.raw.message });
  }
});

// Endpoint to list all coupons using the Stripe coupons route
app.get('/list-coupons', async (req, res) => {
  try {
    // Use the official Stripe coupons route to list all coupons
    const coupons = await stripe.coupons.list();

    res.json({ success: true, coupons });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.raw.message });
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
