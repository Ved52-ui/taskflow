import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

export const authApi = {
  me:       () => api.get('/auth/me'),
  logout:   () => api.post('/auth/logout'),
  loginUrl: () => `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`,
};

export const tasksApi = {
  list:   ()                      => api.get('/api/tasks/'),
  create: (data: unknown)         => api.post('/api/tasks/', data),
  update: (id: string, data: unknown) => api.patch(`/api/tasks/${id}`, data),
  remove: (id: string)            => api.delete(`/api/tasks/${id}`),
};

export const usersApi = {
  list: () => api.get('/api/users/'),
};