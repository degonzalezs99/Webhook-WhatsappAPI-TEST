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
        //await sendText(user, "📦 ¿Qué producto deseas?");
        //return setState(user, { step: "PRODUCT" });
        await sendButtons(user, "📦 ¿Qué producto deseas?", [
          { id: "CONTAINER", title: "Envase" },
          { id: "RECHARGE", title: "Recarga" },
          { id: "REGULATOR", title: "Regulador" },
          { id: "HOSE", title: "Manguera" },
          { id: "GAZA", title: "Gaza" },
          { id: "BURNER", title: "Quemadores" },
        ]);
         return setState(user, { step: "PRODUCT_TYPE" });
      }
      else if (input === "EXISTING") {
       await sendButtons(user, "Hola,"+ user.name +"un gusto volvernos a ver."+"\n📦 ¿Qué producto deseas?", [
          { id: "CONTAINER", title: "Envase" },
          { id: "RECHARGE", title: "Recarga" },
          { id: "REGULATOR", title: "Regulador" },
          { id: "HOSE", title: "Manguera" },
          { id: "GAZA", title: "Gaza" },
          { id: "BURNER", title: "Quemadores" },
        ]);
         return setState(user, { step: "PRODUCT_TYPE" });
      }
      break;
      
    case "PRODUCT_TYPE":
      if (input === "CONTAINER") {
        await sendButtons(user, "📦 ¿Qué tipo de envase deseas?", [
          { id: "CONTAINER_10L", title: "Envase 10L" },
          { id: "CONTAINER_20L", title: "Envase 20L" },
          { id: "CONTAINER_25L", title: "Envase 25L" },
          { id: "CONTAINER_35L", title: "Envase 35L" },
          { id: "CONTAINER_40L", title: "Envase 40L" },
          { id: "CONTAINER_50L", title: "Envase 50L" },
          { id: "CONTAINER_100L", title: "Envase 100L" },
        ]);
         return setState(user, { step: "PRODUCT" }); 
      }
      else if (input === "RECHARGE") {
        await sendButtons(user, "📦 ¿Qué tipo de Recarga deseas?", [
          { id: "RECHARGE_10L", title: "GasLP 10L" },
          { id: "RECHARGE_20L", title: "GasLP 20L" },
          { id: "RECHARGE_25LRO", title: "GasLP 25L Rosca" },
          { id: "RECHARGE_25LPR", title: "GasLP 25L Presion" },
          { id: "RECHARGE_35L", title: "GasLP 35L" },
          { id: "RECHARGE_40L", title: "GasLP 40L" },
          { id: "RECHARGE_45L", title: "GasLP 45L" },
          { id: "RECHARGE_50L", title: "GasLP 50L" },
          { id: "RECHARGE_100L", title: "GasLP 100L" },
        ]);
         return setState(user, { step: "PRODUCT" });
      }
      else if (input === "REGULATOR") {
        return setState(user, { step: "PRODUCT" });
      }
      else if (input === "HOSE") {
        return setState(user, { step: "PRODUCT" });
      }
      else if (input === "GAZA") {
        return setState(user, { step: "PRODUCT" });
      }
      else if (input === "BURNER") {
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
        `🧾Su Pedido:\nProducto: ${order.product}\nCantidad: ${order.quantity}\nDirección: ${order.address}`
      );

      await sendButtons(user, "¿Confirmas?", [
        { id: "CONFIRM", title: "✅ Sí" },
        { id: "CANCEL", title: "❌ No" },
      ]);

      return setState(user, { ...order, step: "CONFIRM" });

    case "CONFIRM":
      if (input === "CONFIRM") {
        await sendText(user, "🎉 Gracias, Orden creada #1234");
      } else {
        await sendText(user, "❌ Cancelado");
      }
      return resetState(user);
  }
};