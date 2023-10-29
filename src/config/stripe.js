export default {
  stripe: {
    apiKey: process.env.STRIPE_SECRET_KEY,
    apiVersion: '2023-10-16',
    basic: {
      auth: {
        username: process.env.STRIPE_SECRET_KEY,
        password: '',
      },
    },
  },
};