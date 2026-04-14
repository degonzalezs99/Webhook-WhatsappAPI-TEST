import {
  getCustomerByPhone,
  createCustomerAPI,
  updateCustomer,
  createWorkOrderAPI,
  getProductsAPI,
  getPlaceIDAPI,

} from "./backendApi.js";

// ─────────────────────────────────────────────
// CUSTOMER
// ─────────────────────────────────────────────

// Buscar cliente por teléfono
export const getUserByPhone = async (phone) => {
  return await getCustomerByPhone(phone);
};
// Crear cliente nuevo
export const createCustomer = async (customerData) => {
  try {
    return await createCustomerAPI(customerData);
    
  } catch (error) {
    console.error("❌ Error creando cliente:", error.response?.data || error.message);
    throw error;
  }
};
// Actualizar cliente
export const updateUser = async (phone, payload) => {
  try {
    return await updateCustomer(phone, payload);
  } catch (error) {
    console.error("❌ Error actualizando cliente:", error.response?.data || error.message);
    throw error;
  }
};

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────

// Obtener lista de productos
export const getProducts = async () => {
  return await getProductsAPI();
};
// Obtener precio de producto por ID
export const getProductPrice = async (productName) => {
  const products = await getProducts();

  const product = products.find(p => p.ProductName === productName);

  if (!product) {
    throw new Error(`❌ Producto ${productName} no encontrado`);
  }

  const price = Number(product.SalePrice || 0);

  if (!price) {
    throw new Error(`❌ Producto ${productName} no tiene precio`);
  }

  return price;
};

// ─────────────────────────────────────────────
// PLACES
// ─────────────────────────────────────────────

// Obtener ID de lugar por nombre
export const getIDPlace = async (place) => {
  try {
    return await getPlaceIDAPI(place);
  } catch (error) {
    console.error("❌ Error obteniendo ID de lugar:", error.response?.data || error.message);
    throw error;
  }
};

// ─────────────────────────────────────────────
// WORKORDERS
// ─────────────────────────────────────────────

// Crear orden de trabajo
export const createWorkorder = async (data) => {
  try {
    // 🔥 1. Traer producto real (NO confiar en frontend)
    const products = await getProducts();

    const product = products.find(p => p.ProductName === data.productName);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const unitPrice = product.Price;
    const productId = product.ProductId;
    const quantity = Number(data.quantity);

    // 🔥 2. Calcular total
    const totalAmount = unitPrice * quantity;

    // 🔥 3. Construir payload correcto
    const payload = {
      WorkorderType: data.type || "PRODUCTO",
      Status: "PENDIENTE",

      // ✅ ID del cliente
      Costumer: data.customerId,

      PhoneNumber: formatPhoneForDB(data.customerPhone),

      Address: data.address,
      PaymentMethod: data.paymentMethod,
      PayType: data.paymentMethod,

      // 🔥 WhatsApp tracking
      WhatsappMessageId: data.messageId,
      WhatsappId: data.phoneNumberId,

      Place: data.place || "1",

      TotalAmount: totalAmount,

      RequestAt: new Date(),

      Active: true,

      // 🔥 DETALLE DE PRODUCTOS
      Items: [
        {
          ProductId: productId,
          Quantity: quantity,
          UnitPrice: unitPrice,
        },
      ],
    };

    return await createWorkOrderAPI(payload);

  } catch (error) {
    console.error("❌ Error creando orden:", error.response?.data || error.message);
    throw error;
  }
};

