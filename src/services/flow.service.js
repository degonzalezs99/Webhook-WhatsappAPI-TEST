import { sendButtons, sendText } from "./whatsapp.service.js";
import { getState, setState, resetState } from "../utils/stateManager.js";

export const handleFlow = async (user, input) => {
  const state = getState(user);

  switch (state.step) {
    case "WELCOME":
      await sendButtons(user, "⚡ ¡Hola! Bienvenido/a a MonterosGas. 🔥 \nCuéntanos, ¿En qué podemos ayudarte?👇", [
        { id: "VENTAS", title: "🛒 Ventas" },
        { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
      ]);
      return setState(user, { step: "MENU" });

    case "MENU":
      if (input === "VENTAS") {
        await sendButtons(user, "¿Ya eres cliente?", [
          { id: "EXISTING", title: "Sí" },
          { id: "NEW", title: "No" },
        ]);
        return setState(user, { step: "CLIENT_TYPE" });
      }
      break;

    case "CLIENT_TYPE":
      if (input === "NEW") {
        await sendText(user, "📦 ¿Qué producto deseas?");
        return setState(user, { step: "PRODUCT" });
      }
      break;

    case "PRODUCT":
      setState(user, { ...state, product: input, step: "QUANTITY" });
      await sendText(user, "📊 ¿Cantidad?");
      break;

    case "QUANTITY":
      setState(user, { ...state, quantity: input, step: "ADDRESS" });
      await sendText(user, "📍 Dirección");
      break;

    case "ADDRESS":
      setState(user, { ...state, address: input, step: "PAYMENT" });
      //await sendText(user, "💳 Método de pago");
      await sendButtons(user, "💳 Método de pago", [
          { id: "SINPE", title: "SINPE" },
          { id: "EFECTIVO", title: "EFECTIVO" },
          { id: "TRANSFERENCIA", title: "TRANSFERENCIA" },
        ]);
      break;

    case "PAYMENT":
      const order = { ...state, payment: input };

      await sendText(
        user,
        `🧾 Pedido:\n${order.product} x${order.quantity}\n📍 ${order.address}`
      );

      await sendButtons(user, "¿Confirmas?", [
        { id: "CONFIRM", title: "✅ Sí" },
        { id: "CANCEL", title: "❌ No" },
      ]);

      return setState(user, { ...order, step: "CONFIRM" });

    case "CONFIRM":
      if (input === "CONFIRM") {
        await sendText(user, "🎉 Orden creada #1234");
      } else {
        await sendText(user, "❌ Cancelado");
      }
      return resetState(user);
  }
};