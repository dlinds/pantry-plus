const express = require("express");
const axios = require("axios");
require("dotenv").config();
const config = require("./config");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Kroger API functions
const getKrogerToken = async () => {
  try {
    const credentials = Buffer.from(
      `${config.kroger.clientId}:${config.kroger.clientSecret}`
    ).toString("base64");

    const response = await axios({
      method: "post",
      url: `${config.kroger.apiUrl}/connect/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      data: "grant_type=client_credentials&scope=product.compact",
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error getting Kroger token:", error.message);
    throw error;
  }
};

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Pantry Plus API" });
});

// Kroger API endpoints
app.get("/api/products", async (req, res) => {
  try {
    const { term, locationId } = req.query;

    if (!term || !locationId) {
      return res.status(400).json({
        error:
          "Missing required parameters. Please provide 'term' and 'locationId'.",
      });
    }

    const token = await getKrogerToken();

    const response = await axios({
      method: "get",
      url: `${config.kroger.apiUrl}/products`,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params: {
        "filter.term": term,
        "filter.locationId": locationId,
        "filter.limit": 50,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products from Kroger API" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
