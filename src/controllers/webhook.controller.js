import { VERIFY_TOKEN } from "../config/env.js";
import { handleFlow } from "../services/flow.service.js";

import { extractWhatsAppData } from "../utils/extractor.js";
import { getUserByPhone, createUser } from "../services/user.service.js";


export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

// export const receiveMessage = async (req, res) => {
//   try {
//     const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
//     if (!message) return res.sendStatus(200);

//     const from = message.from;

//     const text = message.text?.body;
//     const button = message?.interactive?.button_reply?.id;
//     const list = message?.interactive?.list_reply?.id;

//     const input = button || list || text;

//     await handleFlow(from, input);

//     res.sendStatus(200);
//   } catch (error) {
//     console.error(error);
//     res.sendStatus(500);
//   }
// };

export const webhookHandler = async (req, res) => {
  try {
    const data = extractWhatsAppData(req.body);

    if (!data) return res.sendStatus(400);

    const { from, input, name, phoneNumberId } = data;

    // 🔥 Buscar usuario en tu backend
    let user = await getUserByPhone(from);

    // 🔥 Crear si no existe
    if (!user) {
      user = await createUser({
        phone: from,
        name,
        phoneNumberId,
      });
    }

    // 🔥 Ejecutar flujo
    await handleFlow(
      { phone: from, nombre: user.name, phoneNumberId },
      input
    );

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
};