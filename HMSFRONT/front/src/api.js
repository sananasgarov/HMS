import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, '') 
    : 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post('/api/auth/login', data);
export const logout = () => api.get('/api/auth/logout');
export const register = (data) => api.post('/api/auth/register', data);
export const getReservations = (date) => api.get(`/api/reservations?date=${date}`);
export const createReservation = (data) => api.post('/api/reservations', data);
export const getTableAvailability = (tableId, date) => api.get(`/api/reservations/${tableId}/availability?date=${date}`);
export const getMyRecentReservations = () => api.get('/api/reservations/my-recent');
export const getCohorts = () => api.get('/api/teams/cohorts');
export const getMyTeam = () => api.get('/api/teams/my-team');

export const checkInTable = (tableName, clientTimeStr, clientDateStr) => {
    return api.patch(`/api/reservations/checkin/${tableName}`, { 
        currentTime: clientTimeStr,
        currentDate: clientDateStr
    });
};

export const getHackathonPosts = () => api.get('/api/hackathons');
export const createHackathonPost = (data) => api.post('/api/hackathons', data);
export const updateHackathonPost = (id, data) => api.put(`/api/hackathons/${id}`, data);
export const deleteHackathonPost = (id) => api.delete(`/api/hackathons/${id}`);

export default api;
