import axios from "axios";
import { WHATSAPP_TOKEN, PHONE_NUMBER_ID } from "../config/env.js";

const API = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

export const sendButtons = async (to, body, buttons) => {
  await axios.post(
    API,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: body },
        action: {
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: b,
          })),
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const sendText = async (to, text) => {
  await axios.post(
    API,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      },
    }
  );
};