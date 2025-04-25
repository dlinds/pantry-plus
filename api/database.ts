import knex from "knex";
import path from "path";

interface User {
  id: number;
  kroger_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserInput {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

interface UserWithNewFlag extends User {
  isNew: boolean;
}

interface Token {
  id?: number;
  user_id: number;
  access_token: string;
  refresh_token: string;
  expires_at: Date | string;
  created_at?: string;
  updated_at?: string;
}

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface Location {
  id?: number;
  user_id: number;
  location_id: string;
  name: string;
  address: string;
  created_at?: string;
  updated_at?: string;
}

interface LocationData {
  id: string;
  name: string;
  address: Record<string, any>;
}

interface Product {
  id: string;
  description: string;
  aisle_bay_number: string;
  aisle_description: string;
  aisle_number: string;
  aisle_number_of_facings: string;
  aisle_side: string;
  aisle_shelf_number: string;
  aisle_shelf_position_in_bay: string;
  price: number;
  image_url: string;
}

// Initialize knex connection
const db = knex({
  client: "sqlite3",
  connection: {
    filename: path.join(__dirname, "database.sqlite"),
  },
  useNullAsDefault: true,
});

// Set up tables if they don't exist
async function setupDatabase(): Promise<void> {
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

    const hasProductsTable = await db.schema.hasTable("product");
    if (!hasProductsTable) {
      await db.schema.createTable("product", (table) => {
        table.increments("id").primary();
        table.string("product_id").nullable();
        table.string("name").nullable();
        table.string("aisle_bay_number").nullable();
        table.string("aisle_description").nullable();
        table.string("aisle_number").nullable();
        table.string("aisle_number_of_facings").nullable();
        table.string("aisle_side").nullable();
        table.string("aisle_shelf_number").nullable();
        table.string("aisle_shelf_position_in_bay").nullable();

        table.json("image_url").nullable();
        table.json("price").nullable();
        table.timestamps(true, true);
      });
    }

    const hasUserCartItemsTable = await db.schema.hasTable("user_cart_items");
    if (!hasUserCartItemsTable) {
      await db.schema.createTable("user_cart_items", (table) => {
        table.increments("id").primary();
        table.integer("user_id").unsigned().references("id").inTable("users");
        table
          .integer("product_id")
          .unsigned()
          .references("id")
          .inTable("product");
        table.integer("quantity").notNullable();
        table.timestamps(true, true);
      });
      console.log("Created user_cart_items table");
    }

    console.log("Database setup complete");
  } catch (error) {
    console.error("Error setting up database:", error);
  }
}

// Helper functions for user operations
async function findUserByKrogerId(krogerId: string): Promise<User | undefined> {
  return db("users").where("kroger_id", krogerId).first();
}

async function createUser(userData: UserInput): Promise<User | undefined> {
  const [id] = await db("users").insert({
    kroger_id: userData.id,
    email: userData.email,
    first_name: userData.firstName,
    last_name: userData.lastName,
  });
  return db("users").where("id", id).first();
}

async function updateOrCreateUser(
  userData: UserInput
): Promise<UserWithNewFlag> {
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
  } else {
    const user = await createUser(userData);
    return { ...user, isNew: true } as UserWithNewFlag;
  }
}

// Helper functions for token operations
async function saveUserToken(
  userId: number,
  tokenData: TokenData
): Promise<number[]> {
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

async function getUserToken(userId: number): Promise<TokenData | null> {
  const token = await db("tokens").where("user_id", userId).first();

  if (!token) return null;

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
async function saveUserLocation(
  userId: number,
  locationData: LocationData
): Promise<number[]> {
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

async function getUserLocation(userId: number): Promise<LocationData | null> {
  const location = await db("locations").where("user_id", userId).first();

  if (!location) return null;

  return {
    id: location.location_id,
    name: location.name,
    address: JSON.parse(location.address),
  };
}

async function saveUserCartItem(
  userId: number,
  product: Product,
  quantity: number
): Promise<number[]> {
  const newProductToInsert = await db("product").insert({
    product_id: product.id,
    name: product.description,
    aisle_bay_number: product.aisle_bay_number,
    aisle_description: product.aisle_description,
    aisle_number: product.aisle_number,
    aisle_number_of_facings: product.aisle_number_of_facings,
    aisle_side: product.aisle_side,
    aisle_shelf_number: product.aisle_shelf_number,
    aisle_shelf_position_in_bay: product.aisle_shelf_position_in_bay,
    image_url: product.image_url,
    price: product.price,
  });

  return db("user_cart_items").insert({
    user_id: userId,
    product_id: newProductToInsert[0],
    quantity: quantity,
  });
}

async function getUserCartItems(userId: number): Promise<Product[]> {
  const cartItems = await db("user_cart_items")
    .where("user_id", userId)
    .select("*")
    .leftJoin("product", "user_cart_items.product_id", "product.id");

  const filteredNulls = cartItems.filter((item) => item.product_id !== null);

  const filterDuplicateProductIds = filteredNulls.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.product_id === item.product_id)
  );

  return filterDuplicateProductIds;
}

export {
  db,
  setupDatabase,
  findUserByKrogerId,
  createUser,
  updateOrCreateUser,
  saveUserToken,
  getUserToken,
  saveUserLocation,
  getUserLocation,
  saveUserCartItem,
  getUserCartItems,
};
