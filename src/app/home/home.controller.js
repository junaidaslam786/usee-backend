/**
 * GET /
 * Home page
 */
export const index = (req, res) => res.send('App is online!');

/**
 * GET /health
 * Health check
 */
export const healthCheck = (req, res) => res.json({ success: true });
