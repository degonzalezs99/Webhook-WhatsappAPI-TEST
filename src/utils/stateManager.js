const state = {};

export const getState = (user) => {
  return state[user] || { step: "WELCOME" };
};

export const setState = (user, data) => {
  state[user] = data;
};

export const resetState = (user) => {
  state[user] = { step: "WELCOME" };
};