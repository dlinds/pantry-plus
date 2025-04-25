"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const config_1 = __importDefault(require("./config"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Initialize the database
(0, database_1.setupDatabase)().catch(console.error);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Debug route to check if the server is running
app.get("/api/debug", (_req, res) => {
    res.json({
        message: "API server is running",
        krogerConfig: {
            clientId: config_1.default.kroger.clientId,
            apiUrl: config_1.default.kroger.apiUrl,
            redirectUri: config_1.default.kroger.redirectUri,
        },
    });
});
// Helper function to save environment variables
const saveEnvVariables = (variables) => {
    try {
        // Create .env file content
        let envContent = "";
        // First read existing content if file exists
        if (fs_1.default.existsSync(".env")) {
            envContent = fs_1.default.readFileSync(".env", "utf8");
        }
        // Update or add new variables
        Object.entries(variables).forEach(([key, value]) => {
            // Check if variable already exists in the file
            const regex = new RegExp(`^${key}=.*`, "m");
            if (regex.test(envContent)) {
                // Replace existing variable
                envContent = envContent.replace(regex, `${key}=${value}`);
            }
            else {
                // Add new variable
                envContent += `\n${key}=${value}`;
            }
        });
        // Write to .env file
        fs_1.default.writeFileSync(".env", envContent.trim());
        return true;
    }
    catch (error) {
        console.error("Error saving environment variables:", error);
        return false;
    }
};
// Kroger API functions
const getKrogerToken = async () => {
    try {
        const credentials = Buffer.from(`${config_1.default.kroger.clientId}:${config_1.default.kroger.clientSecret}`).toString("base64");
        const response = await (0, axios_1.default)({
            method: "post",
            url: `${config_1.default.kroger.apiUrl}/connect/oauth2/token`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${credentials}`,
            },
            data: "grant_type=client_credentials&scope=product.compact",
        });
        return response.data.access_token;
    }
    catch (error) {
        console.error("Error getting Kroger token:", error.message);
        throw error;
    }
};
// Helper function to fetch user profile from Kroger API
const fetchKrogerUserProfile = async (accessToken) => {
    try {
        const response = await (0, axios_1.default)({
            method: "get",
            url: `${config_1.default.kroger.apiUrl}/identity/profile`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });
        return response.data.data;
    }
    catch (error) {
        console.error("Error fetching user profile:", error.message);
        throw error;
    }
};
// Routes
app.get("/", (_req, res) => {
    res.json({ message: "Welcome to Pantry Plus API" });
});
// Kroger API endpoints
app.get("/api/products", async (req, res) => {
    try {
        const { term, locationId } = req.query;
        if (!term || !locationId) {
            return res.status(400).json({
                error: "Missing required parameters. Please provide 'term' and 'locationId'.",
            });
        }
        const token = await getKrogerToken();
        const response = await (0, axios_1.default)({
            method: "get",
            url: `${config_1.default.kroger.apiUrl}/products`,
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
    }
    catch (error) {
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
        const response = await (0, axios_1.default)({
            method: "get",
            url: `${config_1.default.kroger.apiUrl}/locations`,
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
    }
    catch (error) {
        console.error("Error fetching locations:", error.message);
        res
            .status(500)
            .json({ error: "Failed to fetch locations from Kroger API" });
    }
});
// User location API
app.post("/api/user/location", async (req, res) => {
    try {
        const { krogerId, locationId, name, address } = req.body;
        if (!krogerId || !locationId || !name || !address) {
            return res.status(400).json({
                error: "Missing required fields. Please provide krogerId, locationId, name, and address.",
            });
        }
        // Get user by Kroger ID
        const user = await (0, database_1.findUserByKrogerId)(krogerId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Save location to database
        await (0, database_1.saveUserLocation)(user.id, {
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
    }
    catch (error) {
        console.error("Error saving location:", error.message);
        res.status(500).json({ error: "Failed to save location" });
    }
});
app.get("/api/user/location", async (req, res) => {
    try {
        const { krogerId } = req.query;
        if (!krogerId) {
            return res.status(400).json({
                error: "Missing required parameter: krogerId",
            });
        }
        // Get user by Kroger ID
        const user = await (0, database_1.findUserByKrogerId)(krogerId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        // Get user location
        const location = await (0, database_1.getUserLocation)(user.id);
        if (!location) {
            return res.status(404).json({
                message: "No location found",
            });
        }
        res.status(200).json({
            location,
        });
    }
    catch (error) {
        console.error("Error fetching location:", error.message);
        res.status(500).json({ error: "Failed to fetch location" });
    }
});
// Settings API
app.post("/api/settings/kroger", (req, res) => {
    try {
        const { clientId, clientSecret } = req.body;
        if (!clientId || !clientSecret) {
            return res.status(400).json({
                error: "Missing required fields. Please provide clientId and clientSecret.",
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
        config_1.default.kroger.clientId = clientId;
        config_1.default.kroger.clientSecret = clientSecret;
        res.status(200).json({
            message: "Kroger API credentials saved successfully",
        });
    }
    catch (error) {
        console.error("Error saving Kroger credentials:", error.message);
        res.status(500).json({ error: "Failed to save Kroger credentials" });
    }
});
// Test Kroger API connection
app.get("/api/settings/kroger/test", async (_req, res) => {
    try {
        // Try to get a token with the current credentials
        const token = await getKrogerToken();
        res.status(200).json({
            success: true,
            message: "Successfully connected to Kroger API",
            token_preview: `${token.substring(0, 10)}...`,
        });
    }
    catch (error) {
        console.error("Kroger API connection test failed:", error.message);
        res.status(400).json({
            success: false,
            message: "Failed to connect to Kroger API. Check your credentials.",
            error: error.message,
        });
    }
});
// OAuth routes for user authentication
app.get("/api/auth/kroger/authorize", (_req, res) => {
    try {
        console.log("Authorize endpoint called");
        // Generate a random state value for CSRF protection
        const state = crypto_1.default.randomBytes(16).toString("hex");
        // Build the authorization URL with only valid scopes
        // Common valid scopes: "product.compact" (most basic)
        const authUrl = new URL(`${config_1.default.kroger.apiUrl}/connect/oauth2/authorize`);
        authUrl.searchParams.append("client_id", config_1.default.kroger.clientId);
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("redirect_uri", config_1.default.kroger.redirectUri);
        authUrl.searchParams.append("scope", "product.compact"); // Start with just this scope
        authUrl.searchParams.append("state", state);
        const authorizationUrl = authUrl.toString();
        console.log("Generated URL:", authorizationUrl);
        res.json({ authorizationUrl, state });
    }
    catch (error) {
        console.error("Error generating authorization URL:", error.message);
        res.status(500).json({ error: "Failed to generate authorization URL" });
    }
});
app.post("/api/auth/kroger/callback", async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res
                .status(400)
                .json({ error: "Authorization code is required" });
        }
        // Exchange the authorization code for tokens
        const tokenResponse = await (0, axios_1.default)({
            method: "post",
            url: `${config_1.default.kroger.apiUrl}/connect/oauth2/token`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${config_1.default.kroger.clientId}:${config_1.default.kroger.clientSecret}`).toString("base64")}`,
            },
            data: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: config_1.default.kroger.redirectUri,
            }).toString(),
        });
        const { access_token, refresh_token, expires_in } = tokenResponse.data;
        // Fetch user profile with the access token
        const userProfile = await fetchKrogerUserProfile(access_token);
        // Store user in database (create or update)
        const user = await (0, database_1.updateOrCreateUser)({
            id: userProfile.id,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.email,
        });
        // Store tokens in database
        await (0, database_1.saveUserToken)(user.id, {
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
    }
    catch (error) {
        console.error("Error exchanging code for tokens:", error.message);
        if ("response" in error) {
            console.error("Response data:", error.response?.data);
        }
        res.status(500).json({ error: "Failed to exchange code for tokens" });
    }
});
app.get("/api/auth/kroger/profile", async (req, res) => {
    try {
        const { krogerId } = req.query;
        if (!krogerId) {
            return res.status(400).json({ error: "Kroger ID is required" });
        }
        // Find user in database
        const user = await (0, database_1.findUserByKrogerId)(krogerId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Get tokens from database
        const tokens = await (0, database_1.getUserToken)(user.id);
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
    }
    catch (error) {
        console.error("Error fetching user profile:", error.message);
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});
app.post("/api/auth/kroger/logout", async (req, res) => {
    try {
        const { krogerId } = req.body;
        if (!krogerId) {
            return res.status(400).json({ error: "Kroger ID is required" });
        }
        // Find user in database
        const user = await (0, database_1.findUserByKrogerId)(krogerId);
        if (user) {
            // Delete tokens from database
            await (0, database_1.db)("tokens").where("user_id", user.id).delete();
        }
        res.json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Error logging out:", error.message);
        res.status(500).json({ error: "Failed to log out" });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
