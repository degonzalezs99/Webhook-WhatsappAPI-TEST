import { formatPhoneForDB } from "../utils/phone.js";


import axios from "axios";


const api = axios.create({
  baseURL: process.env.BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.BACKEND_API_KEY,
  },
  timeout: 8000,
});



// ─────────────────────────────────────────────
// 🛍️ PRODUCTOS
// ─────────────────────────────────────────────

// Obtener todos los productos
export const getProductsAPI = async () => {
  const { data } = await api.get("/api/products/list-products-whatsapp");
  return data;
};

// Obtener producto por ID
export const getProductById = async (id) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
};

// ─────────────────────────────────────────────
// 📋 WORK ORDERS
// ─────────────────────────────────────────────

// Crear orden
export const createWorkOrderAPI = async (orderPayload) => {
  console.log("Payload recibido para crear orden:", orderPayload);
  const { data } = await api.post("/api/workorders/create-workorder-whatsapp", orderPayload);
  return data;
};

// ─────────────────────────────────────────────
// 📋 Lugares
// ─────────────────────────────────────────────

export const getPlaceIDAPI = async (place) => {
  const encoded = encodeURIComponent(place);
  const { data } = await api.get(`/api/places/placeID-whatsapp/${encoded}`);
  return data.id;
};


// ─────────────────────────────────────────────
// 👤 CUSTOMERS
// ─────────────────────────────────────────────

// Buscar cliente por teléfono
export const getCustomerByPhone = async (phone) => {
  try {
    const phoneFormatted = formatPhoneForDB(phone);
    const { data } = await api.get(`/api/customers/by-phone/${phoneFormatted}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) {
      const message = "Cliente no encontrado";
      return message;
    }
    throw error;
  }
};

// Crear cliente nuevo
export const createCustomerAPI = async (customerData) => {
  const { data } = await api.post("/api/customers/create-customer", customerData);
  console.log("Nuevo cliente creado en backend:", data);
  return data;
};



// Actualizar cliente
export const updateCustomer = async (phone, payload) => {
  try {
    // 1. Buscar cliente
    const customer = await getCustomerByPhone(phone);

    if (!customer || customer === "Cliente no encontrado") {
      throw new Error("No se puede actualizar: cliente no existe");
    }

    const customerId = customer.CustomerId;

    // 2. Actualizar usando ID
    const { data } = await api.put(`/api/customers/update-customer/${customerId}`,
      payload
    );

    return data;

  } catch (error) {
    console.error("❌ Error updating customer:", error.message);
    throw error;
  }
};


export const CustomerTest = async (phone) => {
  console.log("Phone received for test:", phone);

  const phoneFormatted = formatPhoneForDB(phone);
  console.log("Formatted phone for test:", phoneFormatted);
  const { data } = await api.get(`/api/customers/by-phone/${phoneFormatted}`);

  return data;
};