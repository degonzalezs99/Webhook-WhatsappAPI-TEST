import axios from "axios";
import { WHATSAPP_TOKEN, PHONE_NUMBER_ID } from "../config/env.js";

const API = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;

export const sendButtons = async (to, body, buttons) => {
  await axios.post(
    API,
    {
      messaging_product: "whatsapp",
      to: typeof to === "string" ? to : to.phone,
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
export const sendList = async (to, body, buttonText, sections) => {
  await axios.post(
    API,
    {
      messaging_product: "whatsapp",
      to: typeof to === "string" ? to : to.phone,
      type: "interactive",
      interactive: {
        type: "list",
        body: { text: body },
        action: {
          button: buttonText,
          sections,
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
  try {
    const response = await axios.post(
      API,
      {
        messaging_product: "whatsapp",
        to: typeof to === "string" ? to : to.phone,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Enviado:", response.data);
  } catch (error) {
    console.error("❌ Error enviando:", error.response?.data || error.message);
  }
};