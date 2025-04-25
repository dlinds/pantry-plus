# Pantry Plus API

This is the backend API for Pantry Plus, which integrates with the Kroger API to fetch product information.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Configure Kroger API credentials:

   - Create a .env file in the api directory with the following:
     ```
     KROGER_CLIENT_ID=your_client_id_here
     KROGER_CLIENT_SECRET=your_client_secret_here
     KROGER_API_URL=https://api.kroger.com/v1
     ```
   - Or update the values directly in config.js

3. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Get Products

```
GET /api/products?term={searchTerm}&locationId={locationId}
```

Parameters:

- `term`: Search term for products (required)
- `locationId`: Kroger location ID (required)

## Kroger API Registration

To use the Kroger API:

1. Register as a developer at https://developer.kroger.com/
2. Create a new application to obtain your client credentials
3. Subscribe to the Products API
4. Use the client ID and secret from your developer account
