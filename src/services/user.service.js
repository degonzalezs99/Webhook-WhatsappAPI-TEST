import {
  getCustomerByPhone,
  createCustomerAPI,
  updateCustomer,
  createWorkOrderAPI,
  getProductsAPI,

} from "./backendApi.js";

export const getUserByPhone = async (phone) => {
  return await getCustomerByPhone(phone);
};

export const getProducts = async () => {
  return await getProductsAPI();
};


export const createCustomer = async (customerData) => {
  try {
    return await createCustomerAPI(customerData);
    
  } catch (error) {
    console.error("❌ Error creando cliente:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (phone, payload) => {
  try {
    return await updateCustomer(phone, payload);
  } catch (error) {
    console.error("❌ Error actualizando cliente:", error.response?.data || error.message);
    throw error;
  }
};


export const createWorkorder = async (data) => {
  try {
    // 🔥 1. Traer producto real (NO confiar en frontend)
    const products = await getProducts();

    const product = products.find(p => p.ProductId === data.productId);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const unitPrice = product.Price;
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
          ProductId: data.productId,
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

export const getProductPrice = async (productId) => {
  const products = await getProducts();

  const product = products.find(p => p.ProductId === productId);

  if (!product) {
    throw new Error(`❌ Producto ${productId} no encontrado`);
  }

  const price = Number(product.Price || product.UnitPrice || 0);

  if (!price) {
    throw new Error(`❌ Producto ${productId} no tiene precio`);
  }

  return price;
};