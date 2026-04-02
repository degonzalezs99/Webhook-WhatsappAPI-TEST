import { sendButtons, sendText, sendList } from "./whatsapp.service.js";
import { getState, setState, resetState } from "../utils/stateManager.js";


export const handleFlow = async (user, input) => {
  const state = getState(user);
  const nombre = user?.nombre || "";
  const isValidOption = (input, validOptions) => { return validOptions.includes(input);};
  
  const normalize = (text) => (text || "").trim().toUpperCase();
  input = normalize(input);
  const MAX_RETRIES = 2;
  const handleRetry = async (user, state, message) => {
   
    const retries = state.retries || 0;

    if (retries >= MAX_RETRIES) {
      await sendText(user, "⚠️ Demasiados intentos. Volvamos a empezar.");
      resetState(user);
      return true; // cortar flujo
    }

    await sendText(user, message);

    setState(user, { ...state,retries: retries + 1,});
    return false; // continuar
  };


  console.log("FLOW:", { user,step: state.step,input,state,});

  switch (state.step) {
    case "WELCOME":
      await sendButtons(user, "⚡ ¡Hola! Bienvenido/a a MonterosGas. 🔥 \nCuéntanos, ¿En qué podemos ayudarte?👇", [
        { id: "VENTAS", title: "🛒 Ventas y Recargas" },
        { id: "ACCESORIOS", title: "🔧 Accesorios" },
        { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
      ]);
      return setState(user, { step: "MENU" });

    case "MENU":
      if (input === "VENTAS") {
        await sendButtons(user, "¿Deseas una Recarga o Envase Nuevo?", [
          { id: "RECHARGE", title: "Recarga" },
          { id: "CONTAINER", title: "Envase Nuevo" },
        ]);
        return setState(user, { step: "PRODUCT_TYPE" });
      }
      else if (input === "ACCESORIOS") {
        await sendButtons(user, "¿Que accesorio ocupas?", [
          { id: "REGULATOR", title: "Regulador" },
          { id: "HOSE", title: "Manguera" },
          { id: "GAZA", title: "Gaza" },
        ]);
        //return setState(user, { step: "PRODUCT" });
        return setState(user, { ...state,type: "ACCESORIO",product: input,step: "SIZE", retries: 0 });
      }
      else if (input === "SERVICIO_CLIENTE") {
        await sendText(user, "¿Dinos en que podemos ayudarte?");
        
        return setState(user, { step: "SUPPORT" });
      }
      break;

    case "PRODUCT_TYPE":
      if (["CONTAINER", "RECHARGE"].includes(input)) {
        const isContainer = input === "CONTAINER";

        await sendList( user,"📦 Selecciona el tamaño","Ver opciones", [
            {
              title: isContainer ? "Envases" : "Recargas",
              rows: isContainer
                ? [
                    { id: "CONTAINER_10L", title: "Envase 10L" },
                    { id: "CONTAINER_20L", title: "Envase 20L" },
                    { id: "CONTAINER_25L", title: "Envase 25L" },
                    { id: "CONTAINER_35L", title: "Envase 35L" },
                    { id: "CONTAINER_40L", title: "Envase 40L" },
                  ]
                : [
                    { id: "RECHARGE_10L", title: "GasLP 10L" },
                    { id: "RECHARGE_20L", title: "GasLP 20L" },
                    { id: "RECHARGE_25L_RO", title: "GasLP 25L Rosca" },
                    { id: "RECHARGE_25L_PR", title: "GasLP 25L Presión" },
                    { id: "RECHARGE_35L", title: "GasLP 35L" },
                  ],
            },
          ]
        );
        return setState(user, {...state,type: input,step: "SIZE",});
      }
      break;
    
    case "SIZE":
      if (!input.includes("L")) {
        const stop = await handleRetry(user,state,"⚠️ Selecciona una opción válida de la lista.");
        if (stop) return;
        return;}
      setState(user, { ...state, size: input, step: "QUANTITY",retries: 0 });
      await sendButtons(user, "🔢 ¿Cuántos deseas?", [
          { id: "1", title: "1" },
          { id: "2", title: "2" },
          { id: "3", title: "3" },
        ]);
        break;  

    case "QUANTITY":
      if (!isValidOption(input, ["1", "2", "3"])) {
        const stop = await handleRetry(user,state,"⚠️ Selecciona una cantidad válida.");
        if (stop) return;
        return;
      }
        
      setState(user, { ...state, quantity: input, step: "PAYMENT",retries: 0 });
      await sendButtons(user, "💳 Método de pago", [
          { id: "SINPE", title: "SINPE" },
          { id: "EFECTIVO", title: "EFECTIVO" },
          { id: "TRANSFERENCIA", title: "TRANSFERENCIA" },
        ]);
        break;

    case "PAYMENT":
      if (!isValidOption(input, ["SINPE", "EFECTIVO", "TRANSFERENCIA"])) {
        const stop = await handleRetry(user,state,"⚠️ Selecciona un método de pago válido.");
        if (stop) return;
        return;
      }
      setState(user, { ...state, payment: input, step: "ADDRESS",retries: 0 });
      await sendText(user, "📍 Escríbenos tu dirección exacta (incluye referencias):");
      break;

    case "ADDRESS":
        const order = { ...state, address: input };

        const sizeKey = order.size?.split("_")[1]; 

        // 💰 ejemplo de precios (puedes conectar DB aquí)
        const prices = {
          "10L": 5000,
          "20L": 9000,
          "25L": 12000,
        };

        const price = prices[sizeKey] || 0;
        const total = price * (order.quantity || 1);

        const formatCRC = (n) =>
          new Intl.NumberFormat("es-CR", {style: "currency",currency: "CRC",}).format(n);
        const typeLabel = {
          CONTAINER: "Envase",
          RECHARGE: "Recarga",
          ACCESORIO: "Accesorio",
        };
        const sizeLabel = order.size
          ? order.size.replace("CONTAINER_", "").replace("RECHARGE_", "").replace("_", " ")
          : order.product;

        await sendText(
          user,
          `🧾 *Resumen de tu pedido:*\n\n` +
            `📦 Producto: ${typeLabel[order.type] || order.type} ${sizeLabel}\n` +
            `🔢 Cantidad: ${order.quantity}\n` +
            `💰 Total: ${formatCRC(total)}\n` +
            `📍 Dirección: ${order.address}\n` +
            `💳 Pago: ${order.payment}\n` +
            `⏱️ Tu pedido será procesado inmediatamente al confirmar.` 
        );
        await sendText(user, '⏱️ Tu pedido será procesado inmediatamente al confirmar.');

        await sendButtons(user, "¿Deseas confirmar?", [
          { id: "CONFIRM", title: "✅ Confirmar" },
          { id: "CANCEL", title: "❌ Cancelar" },
        ]);

        return setState(user, { ...order, step: "CONFIRM", retries: 0 });

    case "CONFIRM":
      if (!isValidOption(input, ["CONFIRM", "CANCEL"])) {
        const stop = await handleRetry(user,state,"⚠️ Selecciona una opción válida.");
        if (stop) return;
        return;
      }    
      if (input === "CONFIRM") {
          await sendText(user, "🎉 Orden creada correctamente #1234",);
        } else {
          await sendText(user, "❌ Pedido cancelado");
        }
        return resetState(user);

    case "SUPPORT":
        await sendText(user, "📞 Un agente te contactará pronto.");
        return resetState(user);

    default:
      await sendText(
        user,
        "⚠️ No entendí tu respuesta. Por favor selecciona una opción del menú."
      );
      return;

  }
};