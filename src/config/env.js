import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
export const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
export const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;