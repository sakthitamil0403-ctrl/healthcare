import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const getHost = () => {
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
};

const api = axios.create({
    baseURL: `http://${getHost()}:5000/api`
});

api.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.error('Error getting token from AsyncStorage', e);
    }
    return config;
});

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    updateProfile: (data) => api.put('/auth/profile', data)
};

export const appointmentService = {
    getAppointments: () => api.get('/appointments'),
    bookAppointment: (data) => api.post('/appointments', data),
    cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
    rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
    updateAppointmentStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
    bookVoiceAppointment: (formData) => api.post('/appointments/voice-booking', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const patientService = {
    getProfile: (userId) => api.get(`/patients/${userId}`),
    updateProfile: (data) => api.put('/patients/profile', data)
};

export const donorService = {
    getDonors: (params) => api.get('/donors', { params }),
    updateLocation: (coords) => api.post('/donors/location', coords),
    sendEmergencyAlert: (data) => api.post('/donors/emergency-alert', data)
};

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    getAppointments: () => api.get('/admin/appointments'),
    getRecommendations: () => api.get('/admin/recommendations'),
    addDoctor: (data) => api.post('/admin/add-doctor', data)
};

export default api;
