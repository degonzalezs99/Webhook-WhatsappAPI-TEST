import { sendButtons, sendText, sendList } from "./whatsapp.service.js";
import { getState, setState, resetState } from "../utils/stateManager.js";
import { getUserByPhone, createCustomer, updateUser, createWorkorder, getProductPrice, getIDPlace, getProductID } from "../services/user.service.js";
import { formatPhoneForDB } from "../utils/phone.js";
import { create } from "domain";

 
export const handleFlow = async (user, input) => {
  const state = getState(user);
  const isValidOption = (input, validOptions) => validOptions.includes(input);
  // let newCustomer = 'Existe';
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
  if (!state?.initialized) {
    
    const existingUser = await getUserByPhone(user.phone);
    console.log("Existing user:", existingUser);

    if (existingUser.FullName) {
      // ✅ Usuario encontrado, actualizamos nombre en memoria y arrancamos
      user.nombre = existingUser.FullName;
      await sendButtons(user, `⚡ ¡Hola ${existingUser.FullName}! Bienvenido/a de nuevo a MonterosGas. 🔥\n¿En qué podemos ayudarte?`,
        [
          { id: "VENTAS", title: "🛒 Ventas y Recargas" },
          { id: "ACCESORIOS", title: "🔧 Accesorios" },
          { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
        ]
      );
      return setState(user, { ...state, step: "MENU", initialized: true, FullName: existingUser.FullName, invoiceEmail: existingUser.EmailJuridical, invoiceActividad: existingUser.EconomicActivity, invoiceCedula: existingUser.JuridicalId, address:existingUser.Address, isNewCustomer: false,});

    } else if (existingUser === "Cliente no encontrado") {
      // ❌ Usuario nuevo → pedimos nombre
      await sendText(user, `👋 ¡Hola! Bienvenido/a a *MonterosGas*. 🔥\nParece que es tu primera vez con nosotros.\n\n¿Cuál es tu nombre?`);
      return setState(user, { ...state, step: "REGISTER_NAME", initialized: true });
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
      setState(user, {...state, step: "REGISTER_CONFIRM_NAME", tempName: input, retries: 0 });

      await sendButtons(user, `¿Tu nombre es *${input}*?`,
        [
          { id: "SI", title: "✅ Sí, correcto" },
          { id: "NO", title: "✏️ Corregir" },
        ]);
      break;
    }

    case "REGISTER_CONFIRM_NAME": {
      if (input === "SI") {
        //newCustomer = 'NUEVO USUARIO';
        await sendButtons(user,`¡Perfecto, ${state.tempName}! 🎉 Te vamos a registrar.\n\n¿En qué podemos ayudarte?`,
          [
            { id: "VENTAS", title: "🛒 Ventas y Recargas" },
            { id: "ACCESORIOS", title: "🔧 Accesorios" },
            { id: "SERVICIO_CLIENTE", title: "👨‍💼 Soporte" },
          ]
        );
        return setState(user, {...state, step: "MENU", isNewCustomer: true, retries: 0 });
      
      } else if (input === "NO") {
        await sendText(user, "Sin problema, ¿Cuál es tu nombre?");
        return setState(user, { ...state, step: "REGISTER_NAME", retries: 0 });
      }
      break;
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
      //const nombre = state.tempName || user?.nombre || "";
      if (input === "VENTAS") {
        await sendButtons(user, "¿Deseas una Recarga o Envase Nuevo?", [
          { id: "RECHARGE", title: "Recarga" },
          { id: "CONTAINER", title: "Envase Nuevo" },
        ]);
        return setState(user, {...state, step: "PRODUCT_TYPE" });
      } else if (input === "ACCESORIOS") {
        await sendButtons(user, "¿Qué accesorio ocupas?", [
          { id: "REGULATOR", title: "Regulador" },
          { id: "MANGUERA", title: "Manguera" },
          { id: "GAZA", title: "Gaza" },
        ]);
        return setState(user, { ...state, type: "ACCESORIO", product: input, step: "SIZE", retries: 0 });
      } else if (input === "SERVICIO_CLIENTE") {
        await sendText(user, "¿Dinos en qué podemos ayudarte?");
        return setState(user, {...state, step: "SUPPORT" });
      } else {
        await sendText(user, "⚠️ Opción no válida. Por favor, selecciona una opción del menú.");
      }
      break;
    }

    case "PRODUCT_TYPE": {
      if (["CONTAINER", "RECHARGE"].includes(input)) {
        const isContainer = input === "CONTAINER";
        await sendList( user, "📦 Selecciona el tamaño","Ver opciones",
          [
            {
              title: isContainer ? "Envases" : "Recargas",
              rows: isContainer
                ? [
                    { id: "CONTAINER_10L", title: "Envase 10L" },
                    { id: "CONTAINER_20L", title: "Envase 20L" },
                    { id: "CONTAINER_25L", title: "Envase 25L Llave" },
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
     
      await sendList(user, "🔢 ¿Cuántos deseas?","Ver opciones",
          [
            {
              title: "Cantidad",
              rows: [
                { id: "1", title: "1" },
                { id: "2", title: "2" },
                { id: "3", title: "3" },
                { id: "4", title: "4" },
                { id: "5", title: "5" },
                { id: "6", title: "6" },
                { id: "7", title: "7" },
              ]
            }
          ]
        );
      break;
    }

    case "QUANTITY": {
      if (!isValidOption(input, ["1", "2", "3", "4", "5","6","7"])) {
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
      if (!isValidOption(input, [ "SINPE", "EFECTIVO", "TRANSFERENCIA"])) {
        const stop = await handleRetry(user, state, "⚠️ Selecciona un método de pago válido.");
        if (stop) return;
        return;
      }

       if (!state.isNewCustomer) {
      setState(user, { ...state,payment: input, step: "ADDRESS_CONFIRM", retries: 0 });      
      await sendButtons(user,   `📍 *Tenemos tu dirección:*\n`+
                  `${state.address}\n¿Deseas usar esta dirección para tu pedido?`,
      [
        { id: "ADDRESS_OK", title: "✅ Correcto" },
        { id: "ADDRESS_INCORRECT", title: "❌ Corregir" },
      ]);
      break;

      }else if (state.isNewCustomer){
        setState(user, { ...state, payment: input, step: "CITY_DETAIL", retries: 0 });
        await sendButtons(user, `📍 Dinos de donde eres:`,
          [
            { id: "NARANJO", title: "📍 NARANJO" },
            { id: "PALMARES", title: "📍 PALMARES" },
            { id: "OTHER_CITY", title: "📍 OTROS CANTONES" },
          ]
        );
        break;
      }
    }

    case "ADDRESS_CONFIRM": {

      if (input === "ADDRESS_OK") {
        setState(user, { ...state,  step: "INVOICE", retries: 0 });
        //return await sendText(user, "📍Vamos a usar tu direccion.");
        return await sendButtons(user, "📍Vamos a usar tu direccion.;\n🧾 ¿Deseas factura electrónica?", [
        { id: "INVOICE_SI", title: "✅ Sí, la quiero" },
        { id: "INVOICE_NO", title: "❌ No, gracias" },
      ]);
        
      }
      else if (input === "ADDRESS_INCORRECT") {
        setState(user, { ...state, step: "CITY_DETAIL", retries: 0 });
        await sendButtons(user, `📍 Dinos de donde eres:`,
          [
            { id: "NARANJO", title: "📍 NARANJO" },
            { id: "PALMARES", title: "📍 PALMARES" },
            { id: "OTHER_CITY", title: "📍 OTROS CANTONES" },
          ]
        );
        break;


      }

    }




    case "CITY_DETAIL": {
      setState(user, { ...state, canton: input, retries: 0 });
      if (input === "NARANJO") {
        await sendList(user, "📍 Escoge una opcion de Naranjo:","Ver opciones",
          [
            {
              title: "Naranjo",
              rows: [
                { id: "Cirri", title: "Cirri" },
                { id: "Llano Bonito", title: "Llano Bonito" },
                { id: "Muro", title: "Muro" },
                { id: "Naranjo Centro", title: "Naranjo Centro" },
                { id: "Palmitos", title: "Palmitos" },
                { id: "Rosario", title: "Rosario" },
                { id: "San Jerónimo", title: "San Jerónimo" },
                { id: "San Juan", title: "San Juan" },
                { id: "San Juanillo", title: "San Juanillo" },
                { id: "San Miguel", title: "San Miguel" },
              ]
            }
          ]
        );
        return setState(user, {...state, step: "CITY_ADDRESS" });
      }
      else if (input === "PALMARES") {
        await sendList(user, "📍 Escoge una opcion de Palmares:","Ver opciones",
          [
            {
              title: "Palmares",
              rows: [
                { id: "Bajo de la Plaza", title: "Bajo de la Plaza" },
                { id: "Candelaria", title: "Candelaria" },
                { id: "Cañuela", title: "Cañuela" },
                { id: "Concepción", title: "Concepción" },
                { id: "Dulce Nombre", title: "Dulce Nombre" },
                { id: "Lourdes", title: "Lourdes" },
                { id: "Palmares", title: "Palmares" },
                { id: "San Antonio", title: "San Antonio" },
                { id: "San Roque", title: "San Roque" },
                { id: "Tres Marías", title: "Tres Marías" },
              ]
            }
          ]
        );
        return setState(user, {...state, step: "CITY_ADDRESS" });
        
      } 
      else if (input === "OTHER_CITY") {
       await sendList(user, "📍 Escoge otro Cantón:","Ver opciones",
          [
            {
              title: "Otro Cantón",
              rows: [
                { id: "Grecia ", title: "Grecia" },
                { id: "San Rafael", title: "San Rafael" },
                { id: "San Ramón", title: "San Ramón" },
                { id: "Sarchí", title: "Sarchí (Valverde Vega)" },
                { id: "Robles", title: "Robles" },
                { id: "Lourdes", title: "Lourdes" },
                { id: "Otro", title: "Otro Cantón" },
              ]
            }
          ]
        );
        return setState(user, {...state, step: "CITY_ADDRESS" });
      } else {
        await sendText(user, "⚠️ Opción no válida. Por favor, selecciona una opción del menú.");
      }
    }

    case "CITY_ADDRESS": {
      setState(user, { ...state, city: input, step: "ADDRESS", retries: 0 });
      await sendText(user, "📍 Escríbenos tu dirección exacta:");
      break;
    }

    case "ADDRESS": {
      let addressFlow = state.canton + ", " + state.city + ", " + input;
      if (state.isNewCustomer) {
        setState(user, { ...state, address: addressFlow, step: "INVOICE", retries: 0 });
      }else{
        setState(user, { ...state, step: "INVOICE", retries: 0 });
      }
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

      if (!state.isNewCustomer) {
      setState(user, { ...state, invoice: true, step: "INVOICE_USER", retries: 0 });      
      await sendButtons(user,   `🧾 *Tenemos tus datos de factura electrónica:*\n`+
                  `📧 Email: ${state.invoiceEmail}\n`+
                  `🏢 Actividad: ${state.invoiceActividad}\n`+
                  `🪪 Cédula: ${state.invoiceCedula}`, 
      [
        { id: "INVOICE_FACT_SI", title: "✅ Correctos" },
        { id: "INVOICE_FACT_NO", title: "❌ Corregir" },
      ]);
      break;
      }else if (state.isNewCustomer){
          setState(user, { ...state, invoice: true, step: "INVOICE_EMAIL", retries: 0 });
          await sendText(user, "📧 Ingresa tu correo electrónico para la factura:");
          break;
      }
    }

     case "INVOICE_USER": {
      // Validación básica de email
      if (input === "INVOICE_FACT_SI"){
          setState(user, { ...state, invoice: true, step: "INVOICE_ACTIVIDAD", retries: 0 });
          await sendText(user, "Datos de Facturacion, Correctos!");
          return await buildSummaryAndConfirm(user, { ...state, invoice: true }, state.address);

      } else if (input === "INVOICE_FACT_NO"){
          setState(user, { ...state, invoice: true, step: "INVOICE_EMAIL", retries: 0 });
          await sendText(user, "No hay problema.\n📧 Ingresa tu correo electrónico para la factura:");
          break;
      }
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
      await sendText(user, "🏢 ¿Cuál es tu actividad económica?");
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

      // ✅ Guardamos datos de factura en BD para futuros pedidos, si el usuario ya existía. Si es nuevo, se guardarán junto con la creación del cliente en el paso de confirmación final.
      //if (newCustomer !== 'NUEVO USUARIO') {
      if (!state.isNewCustomer) {
        await updateUser(user.phone, {
          EmailJuridical: updatedState.invoiceEmail,
          EconomicActivity: updatedState.invoiceActividad,
          JuridicalId: input,
          });
      }

      await sendText(user, "✅ Datos de facturación guardados correctamente.");
      return await buildSummaryAndConfirm(user, updatedState, updatedState.address);
    }

    case "CONFIRM": {
      if (!isValidOption(input, ["CONFIRM", "CANCEL"])) {
        const stop = await handleRetry(user, state, "⚠️ Selecciona una opción válida.");
        if (stop) return;
        return;
      }
      //let fullAdress = `${state.canton}, ${state.address}`;

      if (input === "CONFIRM") {
        try {
          console.log("Es cliente Nuevo:", state.isNewCustomer);
          if (state.isNewCustomer){
            await createCustomer({
                FullName: state.tempName,
                PhoneNumber: formatPhoneForDB(user.phone), 
                Address: state.address,
                PlaceId: await getIDPlace(state.city), 
                EmailJuridical: state.invoiceEmail,
                JuridicalId: state.invoiceCedula,
                EconomicActivity: state.invoiceActividad,
                Createdby: 1,
                CreatedAt: new Date(),
                Active: true,
            });
          } 
          // 1. Buscar cliente
          const customer = await getUserByPhone(user.phone);

          if (!customer || customer === "Cliente no encontrado") {
            throw new Error("Cliente no existe, no se puede crear orden");
          }
          // 2. Obtener ID
          const customerId = customer.CustomerId;
          // 3. Calcular total con producto real (NO confiar en frontend)
          const typeLabel = { CONTAINER: "Envase", RECHARGE: "Recarga", ACCESORIO: "Accesorio" };
          const sizeLabel = state.size
            ? state.size.replace("CONTAINER_", "").replace("RECHARGE_", "").replace("_", " ")
            : state.product;

          let productName = `${typeLabel[state.type] || state.type} ${sizeLabel}`;



          const precioProducto = Number(await getProductPrice(productName));
          const totalCalculado = precioProducto * parseInt(state.quantity);


   
          let productId = await getProductID(productName);
          let placeId = await getIDPlace(state.city);



          console.log("➡️ Producto seleccionado:", productName);
          console.log("➡️ Precio obtenido:", precioProducto);
          console.log("➡️ Total calculado:", totalCalculado);
          console.log("➡️ Product ID:", productId, parseInt(state.quantity));
          console.log("➡️ varios:", placeId,user.messageId, user.phoneNumberId);
          console.log("➡️ State:", state);

          // 3. Crear orden con ID de cliente-Payload 
          const orderPayload = {
              WorkorderType: "productos",
              Status: "En Proceso",
              Costumer: state.FullName, 
              WhatsappMessageId: user.messageId,
              WhatsappId: user.phoneNumberId,
              PlaceId: placeId,
              Address: state.address,
              PhoneNumber: formatPhoneForDB(user.phone),
              BillType: state.invoice ? "factura" : "tiquete",
              PaymentMethod: state.payment,
              PayType: "contado",
              TotalAmount: totalCalculado, 
              RequestAt: new Date(),
              DeliveryAt: null,
              Active: true,
              CustomerID: customerId,
              Items: [
                {
                  ProductId: productId,
                  Quantity: parseInt(state.quantity),
                  UnitPrice: precioProducto, 
                },
              ],
            };

          console.log("Payload para nueva orden:", orderPayload);

          const newOrder = await createWorkorder({...orderPayload     });
        
          await sendText(user,
            `🎉 ¡Orden creada! Tu número de pedido es *#${newOrder.workorderId || newOrder._workorderId || newOrder.orderId}*.`
          );

        } catch (error) {
          console.error("Error creando orden:", error.message);
          await sendText(
            user,
            "⚠️ Hubo un problema al procesar tu orden. Por favor contáctanos directamente."
          );
          return resetState(user);
        }

      } else {
        await sendText(user, "❌ Pedido cancelado. ¡Cuando gustes vuelve!");
        resetState(user);
        return;
      }

      return resetState(user);
    }

    case "SUPPORT": {
      await sendText(user, "📞 Un agente te contactará pronto. ¡Gracias!");
      return resetState(user);
    }

    case "SALIR": {
      await sendText(user, "✅ Gracias por comunicarte con MonterosGas. ¡Hasta pronto!");
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
  let precioProducto = 0;
  let productName = "";

  const typeLabel = { CONTAINER: "Envase", RECHARGE: "Recarga", ACCESORIO: "Accesorio" };
  const sizeLabel = order.size
    ? order.size.replace("CONTAINER_", "").replace("RECHARGE_", "").replace("_", " ")
    : order.product;

  productName = `${typeLabel[order.type] || order.type} ${sizeLabel}`;

  try {
    precioProducto = Number(await getProductPrice(productName));

  } catch (err) {
    console.error("Error obteniendo precio:", err.message);
  }

  const total = precioProducto * (order.quantity || 1);
  
  // Formateo de moneda local
  const formatCRC = (n) =>
    new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(n);
  console.log("➡️ Resumen", order );

  let summary =
    `🧾 *Resumen de tu pedido:*\n\n` +
    `📦 Producto: ${productName}\n` +
    `🔢 Cantidad: ${order.quantity}\n` +
    `💰 Total: ${formatCRC(total)}\n` +
    `📍 Dirección: ${order.address}\n` +
    `💳 Pago: ${order.payment}\n` +
    `👤 Nombre: ${order.FullName}\n`;

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