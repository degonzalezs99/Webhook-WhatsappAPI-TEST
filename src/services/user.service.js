import {
  getCustomerByPhone,
  createCustomerAPI,
  updateCustomer,
} from "./backendApi.js";

export const getUserByPhone = async (phone) => {
  return await getCustomerByPhone(phone);
};

export const createCustomer = async (customerData) => {
  return await createCustomerAPI(customerData);
};

export const updateUser = async (phone, payload) => {
  return await updateCustomer(phone, payload);

};