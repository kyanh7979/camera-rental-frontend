import axios from "axios";
import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (fullName, email, password) => {
  const response = await api.post("/auth/register", { fullName, email, password });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post("/auth/reset-password", { token, newPassword });
  return response.data;
};

export const resetPasswordNoAuth = async (token, newPassword) => {
  const response = await axios.post("http://localhost:8080/api/auth/reset-password", { token, newPassword });
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await api.put("/auth/change-password", { currentPassword, newPassword });
  return response.data;
};
