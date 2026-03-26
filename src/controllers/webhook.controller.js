import { VERIFY_TOKEN } from "../config/env.js";
import { handleFlow } from "../services/flow.service.js";

export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

export const receiveMessage = async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;

    const text = message.text?.body;
    const button = message?.interactive?.button_reply?.id;
    const list = message?.interactive?.list_reply?.id;

    const input = button || list || text;

    await handleFlow(from, input);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};