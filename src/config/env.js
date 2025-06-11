import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASS = process.env.DB_PASS;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
export const JWT_SECRET = process.env.JWT_SECRET;
export const API_KEY = process.env.API_KEY;
