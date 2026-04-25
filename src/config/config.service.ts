import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./src/config/.env.dev") });
function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing env variable: ${key}`);
  }
  return value;
}

export const PORT = getEnv("PORT");
export const DB_URI = getEnv("DB_URI");
export const REDIS_URI = getEnv("REDIS_URI");
export const SALT = getEnv("SALT");
export const ENCRYPTION_SECRET_KEY = getEnv("ENCRYPTION_SECRET_KEY");
// Tokens
export const TOKEN_ACCESS_USER_SECRET_KEY = getEnv(
  "TOKEN_ACCESS_USER_SECRET_KEY",
);
export const TOKEN_REFRESH_USER_SECRET_KEY = getEnv(
  "TOKEN_REFRESH_USER_SECRET_KEY",
);
export const TOKEN_ACCESS_ADMIN_SECRET_KEY = getEnv(
  "TOKEN_ACCESS_ADMIN_SECRET_KEY",
);
export const TOKEN_REFRESH_ADMIN_SECRET_KEY = getEnv(
  "TOKEN_REFRESH_ADMIN_SECRET_KEY",
);
export const ACCESS_EXPIRES = Number(getEnv("ACCESS_EXPIRES"));
export const REFRESH_EXPIRES = Number(getEnv("REFRESH_EXPIRES"));

export const CLIENT_ID = getEnv("CLIENT_ID");
export const USER_EMAIL = getEnv("USER_EMAIL");
export const USER_PASSWORD = getEnv("USER_PASSWORD");
export const WHITE_LIST = getEnv("WHITE_LIST").split(",");
