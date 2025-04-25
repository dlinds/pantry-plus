import express, { Request, Response } from "express";
import axios from "axios";
import "dotenv/config";
import config from "./config";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import cors from "cors";
import {
  db,
  setupDatabase,
  updateOrCreateUser,
  findUserByKrogerId,
  saveUserToken,
  getUserToken,
  saveUserLocation,
  getUserLocation,
} from "./database";

interface KrogerUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface LocationRequestBody {
  krogerId: string;
  locationId: string;
  name: string;
  address: Record<string, any>;
}

interface EnvVariables {
  [key: string]: string;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize the database
setupDatabase().catch(console.error);

// Middleware
app.use(cors());
app.use(express.json());

// Debug route to check if the server is running
app.get("/api/debug", (_req: Request, res: Response) => {
  res.json({
    message: "API server is running",
    krogerConfig: {
      clientId: config.kroger.clientId,
      apiUrl: config.kroger.apiUrl,
      redirectUri: config.kroger.redirectUri,
    },
  });
});

// Helper function to save environment variables
const saveEnvVariables = (variables: EnvVariables): boolean => {
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

// Kroger API functions
const getKrogerToken = async (): Promise<string> => {
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
    console.error("Error getting Kroger token:", (error as Error).message);
    throw error;
  }
};

// Helper function to fetch user profile from Kroger API
const fetchKrogerUserProfile = async (
  accessToken: string
): Promise<KrogerUserProfile> => {
  try {
    console.log("Fetching user profile with access token:", accessToken);
    const krogerApiUrl = `https://api.kroger.com/v1/identity/profile`;
    console.log("Kroger API URL:", krogerApiUrl);

    const response = await axios({
      method: "GET",
      url: krogerApiUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    console.log(
      "User profile response:",
      JSON.stringify(response.data, null, 2)
    );

    // Check if response has expected structure
    if (!response.data || !response.data.data) {
      console.error(
        "Unexpected response format from Kroger API:",
        response.data
      );
      throw new Error("Invalid response format from Kroger API");
    }

    const profileData = response.data.data;
    console.log("Profile data extracted:", profileData);

    // Handle different response formats from Kroger API
    return {
      id: profileData.id || profileData.sub || "",
      firstName: profileData.firstName || profileData.given_name || "",
      lastName: profileData.lastName || profileData.family_name || "",
      email: profileData.email || "",
    };
  } catch (error) {
    console.error("Error fetching user profile:", (error as Error).message);
    if (error && typeof error === "object" && "response" in error) {
      console.error("Response status:", (error as any).response?.status);
      console.error(
        "Response data:",
        JSON.stringify((error as any).response?.data, null, 2)
      );
    }
    throw error;
  }
};

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pantry Plus API" });
});

// Kroger API endpoints
app.get("/api/products", async (req: Request, res: Response) => {
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
    console.error("Error fetching products:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch products from Kroger API" });
  }
});

// Kroger Locations API
app.get("/api/locations", async (req: Request, res: Response) => {
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
    console.error("Error fetching locations:", (error as Error).message);
    res
      .status(500)
      .json({ error: "Failed to fetch locations from Kroger API" });
  }
});

// User location API
app.post("/api/user/location", async (req: Request, res: Response) => {
  try {
    const { krogerId, locationId, name, address } =
      req.body as LocationRequestBody;

    console.log("Received location request:", req.body);

    if (!krogerId || !locationId || !name || !address) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide krogerId, locationId, name, and address.",
      });
    }

    // Get user by Kroger ID
    const user = await findUserByKrogerId(krogerId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Save location to database
    await saveUserLocation(user.id, {
      id: locationId,
      name,
      address,
    });

    res.status(200).json({
      message: "Location saved successfully",
      location: {
        id: locationId,
        name,
        address,
      },
    });
  } catch (error) {
    console.error("Error saving location:", (error as Error).message);
    res.status(500).json({ error: "Failed to save location" });
  }
});

app.get("/api/user/location", async (req: Request, res: Response) => {
  try {
    const { krogerId } = req.query;

    if (!krogerId) {
      return res.status(400).json({
        error: "Missing required parameter: krogerId",
      });
    }

    // Get user by Kroger ID
    const user = await findUserByKrogerId(krogerId as string);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get user location
    const location = await getUserLocation(user.id);

    if (!location) {
      return res.status(404).json({
        message: "No location found",
      });
    }

    res.status(200).json({
      location,
    });
  } catch (error) {
    console.error("Error fetching location:", (error as Error).message);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});

// Settings API
app.post("/api/settings/kroger", (req: Request, res: Response) => {
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
    console.error("Error saving Kroger credentials:", (error as Error).message);
    res.status(500).json({ error: "Failed to save Kroger credentials" });
  }
});

// Test Kroger API connection
app.get("/api/settings/kroger/test", async (_req: Request, res: Response) => {
  try {
    // Try to get a token with the current credentials
    const token = await getKrogerToken();

    res.status(200).json({
      success: true,
      message: "Successfully connected to Kroger API",
      token_preview: `${token.substring(0, 10)}...`,
    });
  } catch (error) {
    console.error(
      "Kroger API connection test failed:",
      (error as Error).message
    );
    res.status(400).json({
      success: false,
      message: "Failed to connect to Kroger API. Check your credentials.",
      error: (error as Error).message,
    });
  }
});

// OAuth routes for user authentication
app.get("/api/auth/kroger/authorize", (_req: Request, res: Response) => {
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
    authUrl.searchParams.append("scope", "product.compact profile.compact"); // Include profile scope
    authUrl.searchParams.append("state", state);

    const authorizationUrl = authUrl.toString();
    console.log("Generated URL:", authorizationUrl);

    res.json({ authorizationUrl, state });
  } catch (error) {
    console.error(
      "Error generating authorization URL:",
      (error as Error).message
    );
    res.status(500).json({ error: "Failed to generate authorization URL" });
  }
});

interface AuthCallbackRequest extends Request {
  body: {
    code: string;
  };
}

app.post(
  "/api/auth/kroger/callback",
  async (req: AuthCallbackRequest, res: Response) => {
    try {
      console.log("Received callback request with body:", req.body);
      const { code } = req.body;

      if (!code) {
        console.log("No code provided in request body");
        return res
          .status(400)
          .json({ error: "Authorization code is required" });
      }

      console.log("Attempting to exchange code for tokens");
      console.log("Using client ID:", config.kroger.clientId);
      console.log("Using redirect URI:", config.kroger.redirectUri);

      // Create and log the exact token request parameters
      const tokenRequestData = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.kroger.redirectUri,
        scope: "product.compact profile.compact",
      }).toString();

      console.log("Token request data:", tokenRequestData);

      // Exchange the authorization code for tokens
      const tokenResponse = await axios({
        method: "POST",
        url: `${config.kroger.apiUrl}/connect/oauth2/token`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${config.kroger.clientId}:${config.kroger.clientSecret}`
          ).toString("base64")}`,
        },
        data: tokenRequestData,
      });

      console.log("Token exchange successful");
      console.log(
        "Token response:",
        JSON.stringify(tokenResponse.data, null, 2)
      );
      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      // Fetch user profile with the access token
      const userProfile = await fetchKrogerUserProfile(access_token);

      // Store user in database (create or update)
      const user = await updateOrCreateUser({
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
      });

      console.log("User stored in database", user);

      // Store tokens in database
      await saveUserToken(user.id, {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + expires_in * 1000,
      });

      res.json({
        success: true,
        user: {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
        },
      });
    } catch (error) {
      console.error(
        "Error exchanging code for tokens:",
        (error as Error).message
      );
      if (error && typeof error === "object" && "response" in error) {
        console.error("Response status:", (error as any).response?.status);
        console.error("Response data:", (error as any).response?.data);
      }
      res.status(500).json({ error: "Failed to exchange code for tokens" });
    }
  }
);

interface ProfileQueryRequest extends Request {
  query: {
    krogerId?: string;
  };
}

app.get(
  "/api/auth/kroger/profile",
  async (req: ProfileQueryRequest, res: Response) => {
    try {
      const { krogerId } = req.query;

      if (!krogerId) {
        return res.status(400).json({ error: "Kroger ID is required" });
      }

      // Find user in database
      const user = await findUserByKrogerId(krogerId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get tokens from database
      const tokens = await getUserToken(user.id);

      if (!tokens) {
        return res.status(401).json({ error: "No valid token found for user" });
      }

      // Use the token to fetch the latest profile data
      const userProfile = await fetchKrogerUserProfile(tokens.accessToken);

      res.json({
        user: {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
        },
      });
    } catch (error) {
      console.error("Error fetching user profile:", (error as Error).message);
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  }
);

interface LogoutRequestBody {
  krogerId: string;
}

app.post("/api/auth/kroger/logout", async (req: Request, res: Response) => {
  try {
    const { krogerId } = req.body as LogoutRequestBody;

    if (!krogerId) {
      return res.status(400).json({ error: "Kroger ID is required" });
    }

    // Find user in database
    const user = await findUserByKrogerId(krogerId);

    if (user) {
      // Delete tokens from database
      await db("tokens").where("user_id", user.id).delete();
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", (error as Error).message);
    res.status(500).json({ error: "Failed to log out" });
  }
});

// Add a GET endpoint for the Kroger redirect
app.get("/auth/callback", (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    console.log("Received Kroger redirect with code:", code);
    console.log("Received Kroger redirect with state:", state);

    // Render a simple page that passes the code to our frontend
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
          <script>
            // Post the code to our API endpoint
            async function sendCodeToBackend() {
              try {
                const response = await fetch('/api/auth/kroger/callback', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    code: '${code}',
                    state: '${state}'
                  }),
                });
                
                const data = await response.json();
                if (data.success) {
                  // Redirect to account page
                  window.location.href = '/account';
                } else {
                  document.getElementById('status').innerText = 'Error: ' + (data.error || 'Unknown error');
                }
              } catch (error) {
                document.getElementById('status').innerText = 'Error: ' + error.message;
              }
            }
            
            // Execute when page loads
            window.onload = sendCodeToBackend;
          </script>
        </head>
        <body>
          <div style="text-align: center; margin-top: 100px;">
            <h1>Completing Authentication</h1>
            <p>Please wait while we complete your authentication...</p>
            <div id="status"></div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error handling Kroger redirect:", (error as Error).message);
    res.status(500).send("Authentication error. Please try again.");
  }
});

// Auto sign-in endpoint to validate a stored user
app.post("/api/auth/kroger/validate", async (req: Request, res: Response) => {
  try {
    const { krogerId } = req.body;

    if (!krogerId) {
      return res.status(400).json({
        success: false,
        error: "Kroger ID is required",
      });
    }

    // Find user in database
    const user = await findUserByKrogerId(krogerId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get tokens from database
    const tokens = await getUserToken(user.id);

    if (!tokens) {
      return res.status(401).json({
        success: false,
        error: "No valid token found for user",
      });
    }

    // Try to fetch the latest profile data to verify the token is still valid
    try {
      const userProfile = await fetchKrogerUserProfile(tokens.accessToken);

      // Return the validated user profile
      return res.json({
        success: true,
        user: {
          id: userProfile.id,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          email: userProfile.email,
        },
      });
    } catch (error) {
      // If token has expired, try to refresh it (in a real app)
      // For now, just return that validation failed
      console.error("Error validating user token:", (error as Error).message);
      return res.status(401).json({
        success: false,
        error: "User session expired",
      });
    }
  } catch (error) {
    console.error("Error validating user:", (error as Error).message);
    return res.status(500).json({
      success: false,
      error: "Failed to validate user session",
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
