import dotenv from "dotenv";
dotenv.config();

interface KrogerConfig {
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  redirectUri: string;
}

interface Config {
  kroger: KrogerConfig;
}

const config: Config = {
  kroger: {
    clientId: process.env.KROGER_CLIENT_ID || "",
    clientSecret: process.env.KROGER_CLIENT_SECRET || "",
    apiUrl: "https://api.kroger.com/v1",
    redirectUri: "http://localhost:3001/auth/callback",
  },
};

export default config;
