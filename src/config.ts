import * as dotenv from "dotenv";

dotenv.config();

const config = {
  PORT: process.env.PORT || "3000",
  API_TOKEN: process.env.API_TOKEN,
  LOG_GROUP_ID: process.env.LOG_GROUP_ID,
  URL: process.env.URL,
  OWNER_USERNAME: process.env.OWNER_USERNAME || "",
  TARGET_SITE: process.env.TARGET_SITE || "example.com",
};

export default config;
