// import { VERIFY_TOKEN } from "../config/env.js";
// import { handleFlow } from "../services/flow.service.js";

// import { extractWhatsAppData } from "../utils/extractor.js";
// import { getUserByPhone, createUser } from "../services/user.service.js";


// export const verifyWebhook = (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode === "subscribe" && token === VERIFY_TOKEN) {
//     return res.status(200).send(challenge);
//   }
//   res.sendStatus(403);
// };


// export const webhookHandler = async (req, res) => {
//   try {
//     const data = extractWhatsAppData(req.body);

//     if (!data) return res.sendStatus(400);

//     const { from, input, name, phoneNumberId, messageId } = data;

//     // 🔥 Buscar usuario en tu backend
//     let user = await getUserByPhone(from);

//     // 🔥 Crear si no existe
//     if (!user) {
//       user = await createUser({
//         phone: from,
//         name,
//         phoneNumberId,
//         messageId,
//       });
//     }

//     // 🔥 Ejecutar flujo
//     await handleFlow(
//       { phone: from, nombre: user.name, phoneNumberId },
//       input
//     );
//     return res.sendStatus(200);
//   } catch (error) {
//     console.error("Webhook error:", error);
//     return res.sendStatus(500);
//   }
// };

import { VERIFY_TOKEN } from "../config/env.js";
import { handleFlow } from "../services/flow.service.js";
import { extractWhatsAppData } from "../utils/extractor.js";

export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
};

export const webhookHandler = async (req, res) => {
  try {
    const data = extractWhatsAppData(req.body);
    if (!data) return res.sendStatus(400);

    const { from, input, name, phoneNumberId, messageId } = data;

    // 🔥 El flujo maneja TODO: registro, validación y lógica de negocio
    await handleFlow({ phone: from, nombre: name, phoneNumberId, messageId }, input);

    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
};