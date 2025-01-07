import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  jwt: {
    access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    access_token_expiration: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refresh_token_expiration: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  },
};
