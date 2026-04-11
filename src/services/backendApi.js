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
export const getProducts = async () => {
  const { data } = await api.get("/api/products");
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
export const createWorkOrder = async (orderPayload) => {
  const { data } = await api.post("/api/workorders", orderPayload);
  return data;
};

// Obtener orden por ID
export const getWorkOrderById = async (id) => {
  const { data } = await api.get(`/api/workorders/${id}`);
  return data;
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
    if (error.response?.status === 404) return null;
    throw error;
  }
};

// Crear cliente nuevo
export const createCustomerAPI = async (customerData) => {
  const { data } = await api.post("/api/customers/create-customer", customerData);
  return data;
};

// Actualizar cliente
export const updateCustomer = async (phone, payload) => {
  const { data } = await api.patch(`/api/customers/phone/${phone}`, payload);
  return data;
};


export const CustomerTest = async (phone) => {
  console.log("Phone received for test:", phone);

  const phoneFormatted = formatPhoneForDB(phone);
  console.log("Formatted phone for test:", phoneFormatted);
  const { data } = await api.get(`/api/customers/by-phone/${phoneFormatted}`);

  return data;
};