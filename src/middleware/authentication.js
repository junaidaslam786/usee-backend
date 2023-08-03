import db from "@/database";

const { ENABLE_CLOUD_MODE } = process.env;

export default async function authenticate(req, res, next) {
  // Firstly, set request user to null
  req.user = null;
  req.dbInstance = db.models;
  req.appUrl = `${ENABLE_CLOUD_MODE ? "https" : req.protocol}://${req.get("host")}`;

  // Go to next middleware
  return next();
}
