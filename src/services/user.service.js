export const getUserByPhone = async (phone) => {
  // luego conectas API o DB
  return null;
};

export const createUser = async (user) => {
  console.log("Creating user:", user);
  return user;
};

export const updateUser = async (phone, data) => {
  console.log(`Updating user ${phone} with:`, data);
  return { phone, ...data };
};