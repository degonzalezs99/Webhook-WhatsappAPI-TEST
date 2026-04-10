import axios from "axios";

const api = axios.create({
  baseURL: "https://monterosgas.com/bck",
  headers: {
    "Content-Type": "application/json",
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
    const { data } = await api.get(`/api/customers/phone/${phone}`);
    return data;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

// Crear cliente nuevo
export const createCustomer = async (customerPayload) => {
  const { data } = await api.post("/api/customers", customerPayload);
  return data;
};

// Actualizar cliente
export const updateCustomer = async (phone, payload) => {
  const { data } = await api.patch(`/api/customers/phone/${phone}`, payload);
  return data;
};