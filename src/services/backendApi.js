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
// Buscar cliente por teléfono
export const getCustomerByPhone = async (phone) => {
  try {
    const encodedPhone = encodeURIComponent(phone);

    const { data } = await api.get(`/api/customers/by-phone/${encodedPhone}`);

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

// Actualizar cliente
// export const CustomerTest = async (phone, payload) => {
//   //const { data } = await api.patch(`/api/customers/phone/+506 2563-2562`, payload);
//   const { data } = await api.patch(`https://monterosgas.com/bck/api/customers/by-phone/%2B506%202563-2562`, payload);
//   return data;
// };

export const CustomerTest = async () => {
  const phone = encodeURIComponent("+506 2563-2562");

  const { data } = await api.get(`/api/customers/by-phone/${phone}`);

  console.log("📦 DATA:", data);

  return data;
};