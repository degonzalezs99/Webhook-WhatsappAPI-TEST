// import { sendButtons, sendText, sendList } from "./whatsapp.service.js";
// import { getState, setState, resetState } from "../utils/stateManager.js";

// import { getUserByPhone, createUser, updateUser } from "../services/user.service.js";


// export const handleFlow = async (user, input) => {
//   const state = getState(user);
//   const nombre = user?.nombre || "";
//   const isValidOption = (input, validOptions) => { return validOptions.includes(input);};
  
//   const normalize = (text) => (text || "").trim().toUpperCase();
//   input = normalize(input || "");
//   const MAX_RETRIES = 2;
//   const handleRetry = async (user, state, message) => {
   
//     const retries = state.retries || 0;

//     if (retries >= MAX_RETRIES) {
//       await sendText(user, "⚠️ Demasiados intentos. Volvamos a empezar.");
//       resetState(user);
//       return true; // cortar flujo
//     }

//     await sendText(user, message);

//     setState(user, { ...state,retries: retries + 1,});
//     return false; // continuar
//   };


//   console.log("FLOW:", { user,step: state.step,input,state,});

//   switch (state.step) {
//     case "WELCOME":
//       await sendButtons(user, "⚡ ¡Hola! Bienvenido/a a MonterosGas. 🔥 \nCuéntanos, ¿En qué podemos ayudarte?👇", [
//         { id: "VENTAS", title: "🛒 Ventas y Recargas" },
//         { id: "ACCESORIOS", title: "🔧 Accesorios" },
//         { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
//       ]);
//       return setState(user, { step: "MENU" });

//     case "MENU":
//       if (input === "VENTAS") {
//         await sendButtons(user, "¿Deseas una Recarga o Envase Nuevo?", [
//           { id: "RECHARGE", title: "Recarga" },
//           { id: "CONTAINER", title: "Envase Nuevo" },
//         ]);
//         return setState(user, { step: "PRODUCT_TYPE" });
//       }
//       else if (input === "ACCESORIOS") {
//         await sendButtons(user, "¿Que accesorio ocupas?", [
//           { id: "REGULATOR", title: "Regulador" },
//           { id: "MANGUERA", title: "Manguera" },
//           { id: "GAZA", title: "Gaza" },
//         ]);
//         //return setState(user, { step: "PRODUCT" });
//         return setState(user, { ...state,type: "ACCESORIO", product: input, step: "SIZE", retries: 0 });
//       }
//       else if (input === "SERVICIO_CLIENTE") {
//         await sendText(user, "¿Dinos en que podemos ayudarte?");
        
//         return setState(user, { step: "SUPPORT" });
//       }
//       else{
//         await sendText(user, "⚠️ Opción no válida. Por favor, selecciona una opción del menú.");
//       }
//       break;

//     case "PRODUCT_TYPE":
//       if (["CONTAINER", "RECHARGE"].includes(input)) {
//         const isContainer = input === "CONTAINER";

//         await sendList( user,"📦 Selecciona el tamaño","Ver opciones", [
//             {
//               title: isContainer ? "Envases" : "Recargas",
//               rows: isContainer
//                 ? [
//                     { id: "CONTAINER_10L", title: "Envase 10L" },
//                     { id: "CONTAINER_20L", title: "Envase 20L" },
//                     { id: "CONTAINER_25L", title: "Envase 25L" },
//                     { id: "CONTAINER_35L", title: "Envase 35L" },
//                     { id: "CONTAINER_40L", title: "Envase 40L" },
//                     { id: "CONTAINER_50L", title: "Envase 50L" },
//                     { id: "CONTAINER_100L", title: "Envase 100L" },
//                   ]
//                 : [
//                     { id: "RECHARGE_10L", title: "GasLP 10L" },
//                     { id: "RECHARGE_20L", title: "GasLP 20L" },
//                     { id: "RECHARGE_25L_RO", title: "GasLP 25L Rosca" },
//                     { id: "RECHARGE_25L_PR", title: "GasLP 25L Presión" },
//                     { id: "RECHARGE_35L", title: "GasLP 35L" },
//                     { id: "RECHARGE_40L", title: "GasLP 40L" },
//                     { id: "RECHARGE_50L", title: "GasLP 50L" },
//                     { id: "RECHARGE_100L", title: "GasLP 100L" },
//                   ],
//             },
//           ]
//         );
//         return setState(user, {...state,type: input,step: "SIZE",});
//       }
//       break;
    
//     case "SIZE":
//       if (!input.includes("L") && !["MANGUERA", "GAZA", "REGULADOR"].includes(input) ) {
//         const stop = await handleRetry(user,state,"⚠️ Selecciona una opción válida de la lista.");
//         if (stop) return;
//         return;}
//       setState(user, { ...state, size: input, step: "QUANTITY",retries: 0 });
//       await sendButtons(user, "🔢 ¿Cuántos deseas?", [
//           { id: "1", title: "1" },
//           { id: "2", title: "2" },
//           { id: "3", title: "3" },
//           { id: "4", title: "4" },
//           { id: "5", title: "5" },
//           { id: "6", title: "6" },
//           { id: "7", title: "7" },
//           { id: "8", title: "8" },
//           { id: "9", title: "9" },
//           { id: "10", title: "10" },

//         ]);
//         break;  

//     case "QUANTITY":
//       if (!isValidOption(input, ["1", "2", "3","4","5"]) ) {
//         const stop = await handleRetry(user,state,"⚠️ Selecciona una cantidad válida.");
//         if (stop) return;
//         return;
//       }
        
//       setState(user, { ...state, quantity: input, step: "PAYMENT",retries: 0 });
//       await sendButtons(user, "💳 Método de pago", [
//           { id: "SINPE", title: "SINPE" },
//           { id: "EFECTIVO", title: "EFECTIVO" },
//           { id: "TRANSFERENCIA", title: "TRANSFERENCIA" },
//         ]);
//         break;

//     case "PAYMENT":
//       if (!isValidOption(input, ["SINPE", "EFECTIVO", "TRANSFERENCIA"])) {
//         const stop = await handleRetry(user,state,"⚠️ Selecciona un método de pago válido.");
//         if (stop) return;
//         return;
//       }
//       setState(user, { ...state, payment: input, step: "ADDRESS",retries: 0 });
//       await sendText(user, "📍 Escríbenos tu dirección exacta (incluye referencias):");
//       break;

//     case "ADDRESS":
//         const order = { ...state, address: input };

//         const sizeKey = order.size?.split("_")[1]; 

//         // 💰 ejemplo de precios (puedes conectar DB aquí)
//         const prices = {
//           "10L": 5000,
//           "20L": 9000,
//           "25L": 12000,
//         };

//         const price = prices[sizeKey] || 0;
//         const total = price * (order.quantity || 1);

//         const formatCRC = (n) =>
//           new Intl.NumberFormat("es-CR", {style: "currency",currency: "CRC",}).format(n);
//         const typeLabel = {
//           CONTAINER: "Envase",
//           RECHARGE: "Recarga",
//           ACCESORIO: "Accesorio",
//         };
//         const sizeLabel = order.size
//           ? order.size.replace("CONTAINER_", "").replace("RECHARGE_", "").replace("_", " ")
//           : order.product;

//         await sendText(
//           user,
//           `🧾 *Resumen de tu pedido:*\n\n` +
//             `📦 Producto: ${typeLabel[order.type] || order.type} ${sizeLabel}\n` +
//             `🔢 Cantidad: ${order.quantity}\n` +
//             `💰 Total: ${formatCRC(total)}\n` +
//             `📍 Dirección: ${order.address}\n` +
//             `💳 Pago: ${order.payment}\n` +
//             `Tu nombre: ${nombre}\n` 
            
//         );
//         await sendText(user, '⏱️ Tu pedido será procesado inmediatamente al confirmar.');

//         await sendButtons(user, "¿Deseas confirmar?", [
//           { id: "CONFIRM", title: "✅ Confirmar" },
//           { id: "CANCEL", title: "❌ Cancelar" },
//         ]);

//         return setState(user, { ...order, step: "CONFIRM", retries: 0 });

//     case "CONFIRM":
//       if (!isValidOption(input, ["CONFIRM", "CANCEL"])) {
//         const stop = await handleRetry(user,state,"⚠️ Selecciona una opción válida.");
//         if (stop) return;
//         return;
//       }    
//       if (input === "CONFIRM") {
//           await sendText(user, "🎉 Orden creada correctamente #1234",);
//         } else {
//           await sendText(user, "❌ Pedido cancelado");
//         }
//         return resetState(user);

//     case "SUPPORT":
//         await sendText(user, "📞 Un agente te contactará pronto.");
//         return resetState(user);

//     default:
//       await sendText(
//         user,
//         "⚠️ No entendí tu respuesta. Por favor selecciona una opción del menú."
//       );
//       return;

//   }
// };
import { sendButtons, sendText, sendList } from "./whatsapp.service.js";
import { getState, setState, resetState } from "../utils/stateManager.js";
import { getUserByPhone, createUser, updateUser } from "../services/user.service.js";

export const handleFlow = async (user, input) => {
  const state = getState(user);
  const isValidOption = (input, validOptions) => validOptions.includes(input);

  const normalize = (text) => (text || "").trim().toUpperCase();
  input = normalize(input || "");

  const MAX_RETRIES = 2;
  const handleRetry = async (user, state, message) => {
    const retries = state.retries || 0;
    if (retries >= MAX_RETRIES) {
      await sendText(user, "⚠️ Demasiados intentos. Volvamos a empezar.");
      resetState(user);
      return true;
    }
    await sendText(user, message);
    setState(user, { ...state, retries: retries + 1 });
    return false;
  };

  console.log("FLOW:", { user, step: state.step, input, state });

  // ─────────────────────────────────────────────
  // 🔐 VALIDACIÓN DE USUARIO EN EL FLUJO
  // ─────────────────────────────────────────────

  // Si no hay step aún, verificamos si el usuario existe en BD
  if (!state.step) {
    const existingUser = await getUserByPhone(user.phone);

    if (existingUser) {
      // ✅ Usuario encontrado, actualizamos nombre en memoria y arrancamos
      user.nombre = existingUser.name;
      await sendButtons(
        user,
        `⚡ ¡Hola ${existingUser.name}! Bienvenido/a de nuevo a MonterosGas. 🔥\n¿En qué podemos ayudarte?`,
        [
          { id: "VENTAS", title: "🛒 Ventas y Recargas" },
          { id: "ACCESORIOS", title: "🔧 Accesorios" },
          { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
        ]
      );
      return setState(user, { step: "MENU" });
    } else {
      // ❌ Usuario nuevo → pedimos nombre
      await sendText(
        user,
        `👋 ¡Hola! Bienvenido/a a *MonterosGas*. 🔥\nParece que es tu primera vez con nosotros.\n\n¿Cuál es tu nombre?`
      );
      return setState(user, { step: "REGISTER_NAME" });
    }
  }

  switch (state.step) {

    // ─────────────────────────────────────────────
    // 📋 REGISTRO DE NUEVO USUARIO
    // ─────────────────────────────────────────────

    case "REGISTER_NAME": {
      if (!input || input.length < 2) {
        const stop = await handleRetry(user, state, "⚠️ Por favor ingresa un nombre válido.");
        if (stop) return;
        return;
      }

      // Guardamos nombre en estado temporalmente
      setState(user, { step: "REGISTER_CONFIRM_NAME", tempName: input, retries: 0 });

      await sendButtons(
        user,
        `¿Tu nombre es *${input}*?`,
        [
          { id: "SI", title: "✅ Sí, correcto" },
          { id: "NO", title: "✏️ Corregir" },
        ]
      );
      break;
    }

    case "REGISTER_CONFIRM_NAME": {
      if (input === "NO") {
        await sendText(user, "Sin problema, ¿Cuál es tu nombre?");
        return setState(user, { step: "REGISTER_NAME", retries: 0 });
      }

      if (input !== "SI") {
        const stop = await handleRetry(user, state, "⚠️ Selecciona una opción válida.");
        if (stop) return;
        return;
      }

      // ✅ Creamos el usuario en BD
      const newUser = await createUser({
        phone: user.phone,
        name: state.tempName,
        phoneNumberId: user.phoneNumberId,
      });

      user.nombre = newUser.name;

      await sendButtons(
        user,
        `¡Perfecto, ${newUser.name}! 🎉 Ya estás registrado/a.\n\n¿En qué podemos ayudarte?`,
        [
          { id: "VENTAS", title: "🛒 Ventas y Recargas" },
          { id: "ACCESORIOS", title: "🔧 Accesorios" },
          { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
        ]
      );
      return setState(user, { step: "MENU" });
    }

    // ─────────────────────────────────────────────
    // 🏠 MENÚ PRINCIPAL
    // ─────────────────────────────────────────────

    case "WELCOME":
      await sendButtons(
        user,
        `⚡ ¡Hola! Bienvenido/a a MonterosGas. 🔥\nCuéntanos, ¿En qué podemos ayudarte?👇`,
        [
          { id: "VENTAS", title: "🛒 Ventas y Recargas" },
          { id: "ACCESORIOS", title: "🔧 Accesorios" },
          { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
        ]
      );
      return setState(user, { step: "MENU" });

    case "MENU": {
      const nombre = state.tempName || user?.nombre || "";

      if (input === "VENTAS") {
        await sendButtons(user, "¿Deseas una Recarga o Envase Nuevo?", [
          { id: "RECHARGE", title: "Recarga" },
          { id: "CONTAINER", title: "Envase Nuevo" },
        ]);
        return setState(user, { step: "PRODUCT_TYPE" });
      } else if (input === "ACCESORIOS") {
        await sendButtons(user, "¿Qué accesorio ocupas?", [
          { id: "REGULATOR", title: "Regulador" },
          { id: "MANGUERA", title: "Manguera" },
          { id: "GAZA", title: "Gaza" },
        ]);
        return setState(user, { ...state, type: "ACCESORIO", product: input, step: "SIZE", retries: 0 });
      } else if (input === "SERVICIO_CLIENTE") {
        await sendText(user, "¿Dinos en qué podemos ayudarte?");
        return setState(user, { step: "SUPPORT" });
      } else {
        await sendText(user, "⚠️ Opción no válida. Por favor, selecciona una opción del menú.");
      }
      break;
    }

    case "PRODUCT_TYPE": {
      if (["CONTAINER", "RECHARGE"].includes(input)) {
        const isContainer = input === "CONTAINER";
        await sendList(
          user,
          "📦 Selecciona el tamaño",
          "Ver opciones",
          [
            {
              title: isContainer ? "Envases" : "Recargas",
              rows: isContainer
                ? [
                    { id: "CONTAINER_10L", title: "Envase 10L" },
                    { id: "CONTAINER_20L", title: "Envase 20L" },
                    { id: "CONTAINER_25L", title: "Envase 25L" },
                    { id: "CONTAINER_35L", title: "Envase 35L" },
                    { id: "CONTAINER_40L", title: "Envase 40L" },
                    { id: "CONTAINER_50L", title: "Envase 50L" },
                    { id: "CONTAINER_100L", title: "Envase 100L" },
                  ]
                : [
                    { id: "RECHARGE_10L", title: "GasLP 10L" },
                    { id: "RECHARGE_20L", title: "GasLP 20L" },
                    { id: "RECHARGE_25L_RO", title: "GasLP 25L Rosca" },
                    { id: "RECHARGE_25L_PR", title: "GasLP 25L Presión" },
                    { id: "RECHARGE_35L", title: "GasLP 35L" },
                    { id: "RECHARGE_40L", title: "GasLP 40L" },
                    { id: "RECHARGE_50L", title: "GasLP 50L" },
                    { id: "RECHARGE_100L", title: "GasLP 100L" },
                  ],
            },
          ]
        );
        return setState(user, { ...state, type: input, step: "SIZE" });
      }
      break;
    }

    case "SIZE": {
      if (!input.includes("L") && !["MANGUERA", "GAZA", "REGULADOR"].includes(input)) {
        const stop = await handleRetry(user, state, "⚠️ Selecciona una opción válida de la lista.");
        if (stop) return;
        return;
      }
      setState(user, { ...state, size: input, step: "QUANTITY", retries: 0 });
      await sendButtons(user, "🔢 ¿Cuántos deseas?", [
        { id: "1", title: "1" }, { id: "2", title: "2" },
        { id: "3", title: "3" }, { id: "4", title: "4" },
        { id: "5", title: "5" }, { id: "6", title: "6" },
        { id: "7", title: "7" }, 
      ]);
      break;
    }




    case "QUANTITY": {
      if (!isValidOption(input, ["1", "2", "3", "4", "5"])) {
        const stop = await handleRetry(user, state, "⚠️ Selecciona una cantidad válida.");
        if (stop) return;
        return;
      }
      setState(user, { ...state, quantity: input, step: "PAYMENT", retries: 0 });
      await sendButtons(user, "💳 Método de pago", [
        { id: "SINPE", title: "SINPE" },
        { id: "EFECTIVO", title: "EFECTIVO" },
        { id: "TRANSFERENCIA", title: "TRANSFERENCIA" },
      ]);
      break;
    }

    case "PAYMENT": {
      if (!isValidOption(input, ["SINPE", "EFECTIVO", "TRANSFERENCIA"])) {
        const stop = await handleRetry(user, state, "⚠️ Selecciona un método de pago válido.");
        if (stop) return;
        return;
      }
      setState(user, { ...state, payment: input, step: "ADDRESS", retries: 0 });
      await sendText(user, "📍 Escríbenos tu dirección exacta (incluye referencias):");
      break;
    }

    case "ADDRESS": {
      setState(user, { ...state, address: input, step: "INVOICE", retries: 0 });

      // 🧾 Preguntamos si desea factura electrónica
      await sendButtons(user, "🧾 ¿Deseas factura electrónica?", [
        { id: "INVOICE_SI", title: "✅ Sí, la quiero" },
        { id: "INVOICE_NO", title: "❌ No, gracias" },
      ]);
      break;
    }

    // ─────────────────────────────────────────────
    // 🧾 FLUJO DE FACTURA ELECTRÓNICA
    // ─────────────────────────────────────────────

    case "INVOICE": {
      if (!isValidOption(input, ["INVOICE_SI", "INVOICE_NO"])) {
        const stop = await handleRetry(user, state, "⚠️ Por favor selecciona si deseas factura electrónica.");
        if (stop) return;
        return;
      }

      if (input === "INVOICE_NO") {
        // Sin factura → directo al resumen
        return await buildSummaryAndConfirm(user, { ...state, invoice: false }, state.address);
      }

      // Con factura → pedimos datos
      setState(user, { ...state, invoice: true, step: "INVOICE_EMAIL", retries: 0 });
      await sendText(user, "📧 Ingresa tu correo electrónico para la factura:");
      break;
    }

    case "INVOICE_EMAIL": {
      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.toLowerCase())) {
        const stop = await handleRetry(user, state, "⚠️ El correo no parece válido. Ejemplo: correo@dominio.com");
        if (stop) return;
        return;
      }

      setState(user, { ...state, invoiceEmail: input.toLowerCase(), step: "INVOICE_ACTIVIDAD", retries: 0 });
      await sendText(user, "🏢 ¿Cuál es tu actividad económica? (Ej: Comercio, Servicios, Construcción...)");
      break;
    }

    case "INVOICE_ACTIVIDAD": {
      if (!input || input.length < 3) {
        const stop = await handleRetry(user, state, "⚠️ Por favor ingresa una actividad económica válida.");
        if (stop) return;
        return;
      }

      setState(user, { ...state, invoiceActividad: input, step: "INVOICE_CEDULA", retries: 0 });
      await sendText(user, "🪪 Ingresa tu número de cédula o identificación:");
      break;
    }

    case "INVOICE_CEDULA": {
      // Validación: solo números, entre 9 y 12 dígitos (física/jurídica CR)
      const cedulaRegex = /^\d{9,12}$/;
      if (!cedulaRegex.test(input)) {
        const stop = await handleRetry(user, state, "⚠️ Ingresa una cédula válida (solo números, 9-12 dígitos).");
        if (stop) return;
        return;
      }

      const updatedState = { ...state, invoiceCedula: input, retries: 0 };

      // ✅ Guardamos datos de factura en BD para futuros pedidos
      await updateUser(user.phone, {
        invoiceEmail: updatedState.invoiceEmail,
        invoiceActividad: updatedState.invoiceActividad,
        invoiceCedula: input,
      });

      await sendText(user, "✅ Datos de facturación guardados correctamente.");
      return await buildSummaryAndConfirm(user, updatedState, updatedState.address);
    }

    // ─────────────────────────────────────────────
    // ✅ CONFIRMACIÓN FINAL
    // ─────────────────────────────────────────────

    case "CONFIRM": {
      if (!isValidOption(input, ["CONFIRM", "CANCEL"])) {
        const stop = await handleRetry(user, state, "⚠️ Selecciona una opción válida.");
        if (stop) return;
        return;
      }

      if (input === "CONFIRM") {
        await sendText(user, "🎉 ¡Orden creada correctamente! Tu número de pedido es *#1234*.");

        if (state.invoice) {
          await sendText(
            user,
            `🧾 *Datos de tu factura electrónica:*\n\n` +
            `📧 Email: ${state.invoiceEmail}\n` +
            `🏢 Actividad: ${state.invoiceActividad}\n` +
            `🪪 Cédula: ${state.invoiceCedula}`
          );
        }
      } else {
        await sendText(user, "❌ Pedido cancelado. ¡Cuando gustes vuelve!");
      }

      return resetState(user);
    }

    case "SUPPORT": {
      await sendText(user, "📞 Un agente te contactará pronto. ¡Gracias!");
      return resetState(user);
    }

    default:
      await sendText(user, "⚠️ No entendí tu respuesta. Por favor selecciona una opción del menú.");
      return;
  }
};

// ─────────────────────────────────────────────
// 🧾 Helper: construye resumen y pide confirmación
// ─────────────────────────────────────────────
const buildSummaryAndConfirm = async (user, order, address) => {
  const prices = { "10L": 5000, "20L": 9000, "25L": 12000 };
  const sizeKey = order.size?.split("_")[1];
  const price = prices[sizeKey] || 0;
  const total = price * (order.quantity || 1);

  const formatCRC = (n) =>
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(n);

  const typeLabel = { CONTAINER: "Envase", RECHARGE: "Recarga", ACCESORIO: "Accesorio" };
  const sizeLabel = order.size
    ? order.size.replace("CONTAINER_", "").replace("RECHARGE_", "").replace("_", " ")
    : order.product;

  let summary =
    `🧾 *Resumen de tu pedido:*\n\n` +
    `📦 Producto: ${typeLabel[order.type] || order.type} ${sizeLabel}\n` +
    `🔢 Cantidad: ${order.quantity}\n` +
    `💰 Total: ${formatCRC(total)}\n` +
    `📍 Dirección: ${address}\n` +
    `💳 Pago: ${order.payment}\n` +
    `👤 Nombre: ${user.nombre}\n`;

  if (order.invoice) {
    summary +=
      `\n🧾 *Factura electrónica:* ✅\n` +
      `📧 Email: ${order.invoiceEmail}\n` +
      `🏢 Actividad: ${order.invoiceActividad}\n` +
      `🪪 Cédula: ${order.invoiceCedula}\n`;
  }

  await sendText(user, summary);
  await sendText(user, "⏱️ Tu pedido será procesado inmediatamente al confirmar.");
  await sendButtons(user, "¿Deseas confirmar?", [
    { id: "CONFIRM", title: "✅ Confirmar" },
    { id: "CANCEL", title: "❌ Cancelar" },
  ]);

  return setState(user, { ...order, address, step: "CONFIRM", retries: 0 });
};