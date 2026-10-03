import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`, 
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

export const getUsers = () => api.get("users/");

// Clientes
export const getClients = () => api.get("clients/");
export const createClient = (data) => api.post("clients/", data);

// Membros da Equipa / Técnicos
export const getTeamMembers = () => api.get("team-members/");
export const createTeamMember = (data) => api.post("team-members/", data);

// Ordens de Serviço
export const getServiceOrders = () => api.get("service-orders/");
export const createServiceOrder = (data) => api.post("service-orders/", data);

// Registro Financeiro
export const getFinancialRecords = () => api.get("financial-records/");
export const createFinancialRecord = (data) =>
  api.post("financial-records/", data);

// Minha plataforma
export const getPlatformCompanies = () => api.get("platform-companies/");
export const createPlatformCompany = (companyData) => api.post("platform-companies/", companyData);

// Equipamentos
export const getEquipments = (clientId = null) => {
  const url = clientId ? `equipments/?client=${clientId}` : "equipments/";
  return api.get(url);
};
export const createEquipment = (data) => api.post("equipments/", data);
export const deleteEquipment = (id) => api.delete(`equipments/${id}/`);

// Modelos de Inspeção & Checklists
export const getInspectionTemplates = () => api.get("inspection-templates/");
export const createInspectionTemplate = (data) => api.post("inspection-templates/", data);

export const getInspectionCategories = () => api.get("inspection-categories/");
export const createInspectionCategory = (data) => api.post("inspection-categories/", data);

export const createInspectionItem = (data) => api.post("inspection-items/", data);
export const toggleInspectionItem = (itemId, isCompleted) =>
  api.patch(`inspection-items/${itemId}/`, { is_completed: isCompleted });

// Execução / Preenchimento de Checklists na O.S.
export const saveOrderExecution = (data) =>
  api.post(`service-orders/${data.serviceOrderId}/execute/`, data);

export const updateServiceOrderStatus = (id, status) =>
  api.patch(`service-orders/${id}/`, { status });

export default api;