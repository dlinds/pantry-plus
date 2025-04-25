"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.setupDatabase = setupDatabase;
exports.findUserByKrogerId = findUserByKrogerId;
exports.createUser = createUser;
exports.updateOrCreateUser = updateOrCreateUser;
exports.saveUserToken = saveUserToken;
exports.getUserToken = getUserToken;
exports.saveUserLocation = saveUserLocation;
exports.getUserLocation = getUserLocation;
const knex_1 = __importDefault(require("knex"));
const path_1 = __importDefault(require("path"));
// Initialize knex connection
const db = (0, knex_1.default)({
    client: "sqlite3",
    connection: {
        filename: path_1.default.join(__dirname, "database.sqlite"),
    },
    useNullAsDefault: true,
});
exports.db = db;
// Set up tables if they don't exist
async function setupDatabase() {
    try {
        // Check if users table exists
        const hasUsersTable = await db.schema.hasTable("users");
        if (!hasUsersTable) {
            await db.schema.createTable("users", (table) => {
                table.increments("id").primary();
                table.string("kroger_id").unique().notNullable();
                table.string("email").unique();
                table.string("first_name");
                table.string("last_name");
                table.timestamps(true, true);
            });
            console.log("Created users table");
        }
        // Check if tokens table exists
        const hasTokensTable = await db.schema.hasTable("tokens");
        if (!hasTokensTable) {
            await db.schema.createTable("tokens", (table) => {
                table.increments("id").primary();
                table.integer("user_id").unsigned().references("id").inTable("users");
                table.string("access_token").notNullable();
                table.string("refresh_token").notNullable();
                table.timestamp("expires_at").notNullable();
                table.timestamps(true, true);
            });
            console.log("Created tokens table");
        }
        // Check if locations table exists
        const hasLocationsTable = await db.schema.hasTable("locations");
        if (!hasLocationsTable) {
            await db.schema.createTable("locations", (table) => {
                table.increments("id").primary();
                table.integer("user_id").unsigned().references("id").inTable("users");
                table.string("location_id").notNullable();
                table.string("name").notNullable();
                table.json("address").notNullable();
                table.timestamps(true, true);
            });
            console.log("Created locations table");
        }
        console.log("Database setup complete");
    }
    catch (error) {
        console.error("Error setting up database:", error);
    }
}
// Helper functions for user operations
async function findUserByKrogerId(krogerId) {
    return db("users").where("kroger_id", krogerId).first();
}
async function createUser(userData) {
    const [id] = await db("users").insert({
        kroger_id: userData.id,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
    });
    return db("users").where("id", id).first();
}
async function updateOrCreateUser(userData) {
    const existingUser = await findUserByKrogerId(userData.id);
    if (existingUser) {
        await db("users").where("id", existingUser.id).update({
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            updated_at: db.fn.now(),
        });
        return {
            ...existingUser,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            isNew: false,
        };
    }
    else {
        const user = await createUser(userData);
        return { ...user, isNew: true };
    }
}
// Helper functions for token operations
async function saveUserToken(userId, tokenData) {
    // Delete any existing tokens for this user
    await db("tokens").where("user_id", userId).delete();
    // Insert the new token
    return db("tokens").insert({
        user_id: userId,
        access_token: tokenData.accessToken,
        refresh_token: tokenData.refreshToken,
        expires_at: new Date(tokenData.expiresAt),
    });
}
async function getUserToken(userId) {
    const token = await db("tokens").where("user_id", userId).first();
    if (!token)
        return null;
    // Check if token is expired
    if (new Date(token.expires_at) < new Date()) {
        return null;
    }
    return {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresAt: new Date(token.expires_at).getTime(),
    };
}
// Helper functions for location operations
async function saveUserLocation(userId, locationData) {
    // Delete any existing location for this user
    await db("locations").where("user_id", userId).delete();
    // Insert the new location
    return db("locations").insert({
        user_id: userId,
        location_id: locationData.id,
        name: locationData.name,
        address: JSON.stringify(locationData.address),
    });
}
async function getUserLocation(userId) {
    const location = await db("locations").where("user_id", userId).first();
    if (!location)
        return null;
    return {
        id: location.location_id,
        name: location.name,
        address: JSON.parse(location.address),
    };
}
