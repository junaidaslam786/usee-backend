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

import * as configs from "@/config";
import { authenticationMiddleware, sentryMiddleware } from "@/middleware";

const { NODE_ENV } = process.env;

const app = express();

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


if (NODE_ENV === "development") {
  app.use(cors(configs.corsConfig));
} else {
  app.use(cors({ origin: "*" }));
}

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
if (NODE_ENV !== "development") {
  app.use(sentryMiddleware); // This should be loaded after authentication middleware.
}

// Load router paths
configs.routerConfig(app);

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
