"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    kroger: {
        clientId: process.env.KROGER_CLIENT_ID || "",
        clientSecret: process.env.KROGER_CLIENT_SECRET || "",
        apiUrl: "https://api.kroger.com/v1",
        redirectUri: process.env.KROGER_REDIRECT_URI || "http://localhost:3001/auth/callback",
    },
};
exports.default = config;
