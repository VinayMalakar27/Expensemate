import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.36.172.102:5000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

// Har request mein token automatically add hoga
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

// Expense APIs
export const getStats = () => api.get('/expenses/stats');
export const getExpenses = () => api.get('/expenses');
export const addExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const getAnalytics = (period) => api.get(`/expenses/analytics?period=${period}`);

// AI APIs
export const getAIInsights = () => api.get('/ai/insights');
export const sendAIChat = (message, chatHistory) =>
  api.post('/ai/chat', { message, chatHistory });
export const getBudgetSuggestions = () => api.get('/ai/budget-suggestions');

export default api;