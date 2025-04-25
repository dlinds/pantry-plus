const express = require("express");
const axios = require("axios");
require("dotenv").config();
const config = require("./config");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to save environment variables
const saveEnvVariables = (variables) => {
  try {
    // Create .env file content
    let envContent = "";

    // First read existing content if file exists
    if (fs.existsSync(".env")) {
      envContent = fs.readFileSync(".env", "utf8");
    }

    // Update or add new variables
    Object.entries(variables).forEach(([key, value]) => {
      // Check if variable already exists in the file
      const regex = new RegExp(`^${key}=.*`, "m");
      if (regex.test(envContent)) {
        // Replace existing variable
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        // Add new variable
        envContent += `\n${key}=${value}`;
      }
    });

    // Write to .env file
    fs.writeFileSync(".env", envContent.trim());
    return true;
  } catch (error) {
    console.error("Error saving environment variables:", error);
    return false;
  }
};

// In-memory token store - In production, use a proper database
const tokenStore = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  userProfile: null,
};

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

// Debug route to check if the server is running
app.get("/api/debug", (req, res) => {
  res.json({
    message: "API server is running",
    krogerConfig: {
      clientId: config.kroger.clientId,
      apiUrl: config.kroger.apiUrl,
      redirectUri: config.kroger.redirectUri,
    },
  });
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

// Kroger Locations API
app.get("/api/locations", async (req, res) => {
  try {
    const { zipCode, radiusInMiles = 10 } = req.query;

    if (!zipCode) {
      return res.status(400).json({
        error: "Missing required parameter. Please provide 'zipCode'.",
      });
    }

    const token = await getKrogerToken();

    const response = await axios({
      method: "get",
      url: `${config.kroger.apiUrl}/locations`,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params: {
        "filter.zipCode.near": zipCode,
        "filter.radiusInMiles": radiusInMiles,
        "filter.limit": 10,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching locations:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch locations from Kroger API" });
  }
});

// Mock user database - In a real app, you would use a database like MongoDB or PostgreSQL
const userStore = {
  location: null,
};

// User location API
app.post("/api/user/location", (req, res) => {
  try {
    const { locationId, name, address } = req.body;

    if (!locationId || !name || !address) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide locationId, name, and address.",
      });
    }

    // Save to our mock store
    userStore.location = {
      id: locationId,
      name,
      address,
    };

    res.status(200).json({
      message: "Location saved successfully",
      location: userStore.location,
    });
  } catch (error) {
    console.error("Error saving location:", error.message);
    res.status(500).json({ error: "Failed to save location" });
  }
});

app.get("/api/user/location", (req, res) => {
  if (!userStore.location) {
    return res.status(404).json({
      message: "No location found",
    });
  }

  res.status(200).json({
    location: userStore.location,
  });
});

// Settings API
app.post("/api/settings/kroger", (req, res) => {
  try {
    const { clientId, clientSecret } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide clientId and clientSecret.",
      });
    }

    // Save to .env file
    const success = saveEnvVariables({
      KROGER_CLIENT_ID: clientId,
      KROGER_CLIENT_SECRET: clientSecret,
    });

    if (!success) {
      throw new Error("Failed to save credentials to environment file");
    }

    // Update config in memory
    config.kroger.clientId = clientId;
    config.kroger.clientSecret = clientSecret;

    res.status(200).json({
      message: "Kroger API credentials saved successfully",
    });
  } catch (error) {
    console.error("Error saving Kroger credentials:", error.message);
    res.status(500).json({ error: "Failed to save Kroger credentials" });
  }
});

// Test Kroger API connection
app.get("/api/settings/kroger/test", async (req, res) => {
  try {
    // Try to get a token with the current credentials
    const token = await getKrogerToken();

    res.status(200).json({
      success: true,
      message: "Successfully connected to Kroger API",
      token_preview: `${token.substring(0, 10)}...`,
    });
  } catch (error) {
    console.error("Kroger API connection test failed:", error.message);
    res.status(400).json({
      success: false,
      message: "Failed to connect to Kroger API. Check your credentials.",
      error: error.message,
    });
  }
});

// OAuth routes for user authentication
app.get("/api/auth/kroger/authorize", (req, res) => {
  try {
    console.log("Authorize endpoint called");

    // Generate a random state value for CSRF protection
    const state = crypto.randomBytes(16).toString("hex");

    // Build the authorization URL with only valid scopes
    // Common valid scopes: "product.compact" (most basic)
    const authUrl = new URL(`${config.kroger.apiUrl}/connect/oauth2/authorize`);
    authUrl.searchParams.append("client_id", config.kroger.clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", config.kroger.redirectUri);
    authUrl.searchParams.append("scope", "product.compact"); // Start with just this scope
    authUrl.searchParams.append("state", state);

    const authorizationUrl = authUrl.toString();
    console.log("Generated URL:", authorizationUrl);

    res.json({ authorizationUrl, state });
  } catch (error) {
    console.error("Error generating authorization URL:", error.message);
    res.status(500).json({ error: "Failed to generate authorization URL" });
  }
});

app.post("/api/auth/kroger/callback", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await axios({
      method: "post",
      url: `${config.kroger.apiUrl}/connect/oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${config.kroger.clientId}:${config.kroger.clientSecret}`
        ).toString("base64")}`,
      },
      data: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.kroger.redirectUri,
      }).toString(),
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    // Store tokens
    tokenStore.accessToken = access_token;
    tokenStore.refreshToken = refresh_token;
    tokenStore.expiresAt = Date.now() + expires_in * 1000;

    // Fetch user profile with the access token
    const profileResponse = await axios({
      method: "get",
      url: `${config.kroger.apiUrl}/identity/profile`,
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });

    // Store and return user profile
    tokenStore.userProfile = profileResponse.data.data;

    res.json({
      success: true,
      user: tokenStore.userProfile,
    });
  } catch (error) {
    console.error("Error exchanging code for tokens:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    res.status(500).json({ error: "Failed to exchange code for tokens" });
  }
});

app.get("/api/auth/kroger/profile", (req, res) => {
  if (!tokenStore.accessToken || !tokenStore.userProfile) {
    return res.status(401).json({ error: "Not authenticated with Kroger" });
  }

  // Check if token is expired
  if (Date.now() > tokenStore.expiresAt) {
    return res.status(401).json({ error: "Token expired, please login again" });
  }

  res.json({ user: tokenStore.userProfile });
});

app.post("/api/auth/kroger/logout", (req, res) => {
  // Clear token store
  tokenStore.accessToken = null;
  tokenStore.refreshToken = null;
  tokenStore.expiresAt = null;
  tokenStore.userProfile = null;

  res.json({ success: true, message: "Logged out successfully" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
