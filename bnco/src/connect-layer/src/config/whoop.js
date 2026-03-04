// src/config/whoop.js - WHOOP API configuration
// Centralized WHOOP Developer API config for bnco connect-layer

const whoopConfig = {
  clientId: process.env.WHOOP_CLIENT_ID,
  clientSecret: process.env.WHOOP_CLIENT_SECRET,
  redirectUri: process.env.WHOOP_REDIRECT_URI,
  webhookSecret: process.env.WHOOP_WEBHOOK_SECRET,
  baseUrl: 'https://api.prod.whoop.com',
  oauthUrl: 'https://api.prod.whoop.com/oauth/oauth2',
  apiUrl: 'https://api.prod.whoop.com/developer/v1',
};

module.exports = whoopConfig;
