import {
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
} from "./backendApi.js";

export const getUserByPhone = async (phone) => {
  return await getCustomerByPhone(phone);
};

export const createUser = async ({ phone, name, phoneNumberId }) => {
  return await createCustomer({ phone, name, phoneNumberId });
};

export const updateUser = async (phone, payload) => {
  return await updateCustomer(phone, payload);
  
};