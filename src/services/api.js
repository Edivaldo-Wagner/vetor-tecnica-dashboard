// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/", 
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Adiciona o Bearer Token antes de cada chamada HTTP
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clientes
export const getClients = () => api.get("clients/");
export const createClient = (data) => api.post("clients/", data);

// Ordens de Serviço
export const getServiceOrders = () => api.get("service-orders/");
export const createServiceOrder = (data) => api.post("service-orders/", data);

// Registro Financeiro
export const getFinancialRecords = () => api.get("financial-records/");
export const createFinancialRecord = (data) =>
  api.post("financial-records/", data);

// Checklist de inspeção
export const getInspectionCategories = () => api.get("inspection-categories/");
export const createInspectionCategory = (data) =>
  api.post("inspection-categories/", data);
export const toggleInspectionItem = (itemId, isCompleted) =>
  api.patch(`inspection-items/${itemId}/`, { is_completed: isCompleted });

// Minha plataforma
export const getPlatformCompanies = () => api.get("platform-companies/");
export const createPlatformCompany = (companyData) => api.post("platform-companies/", companyData);

export default api;