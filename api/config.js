// Kroger API Configuration
module.exports = {
  kroger: {
    clientId: process.env.KROGER_CLIENT_ID || "your_client_id_here",
    clientSecret: process.env.KROGER_CLIENT_SECRET || "your_client_secret_here",
    apiUrl: process.env.KROGER_API_URL || "https://api.kroger.com/v1",
  },
};
