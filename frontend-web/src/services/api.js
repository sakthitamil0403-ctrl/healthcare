import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    updateProfile: (data) => api.put('/auth/profile', data),
    fetchMe: () => api.get('/auth/me')
};

export const appointmentService = {
    getAppointments: () => api.get('/appointments'),
    bookAppointment: (data) => api.post('/appointments', data),
    bookVoiceAppointment: (formData) => api.post('/appointments/voice-booking', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
    rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
    updateAppointmentStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
};

export const donorService = {
    getDonors: () => api.get('/donors'),
    getNearbyDonors: (params) => api.get('/donors/nearby', { params }),
    updateLocation: (coords) => api.post('/donors/location', coords),
    sendEmergencyAlert: (data) => api.post('/donors/emergency-alert', data)
};

export const milkService = {
    getNearbyDonors: (params) => api.get('/milk/nearby', { params }),
    requestMilk: (data) => api.post('/milk/request-milk', data)
};

export const doctorService = {
    getDoctors: () => api.get('/doctors')
};

export const patientService = {
    getProfile: (userId) => api.get(`/patients/${userId}`),
    updateProfile: (data) => api.put('/patients/profile', data)
};

export const adminService = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    getAppointments: () => api.get('/admin/appointments'),
    getRecommendations: () => api.get('/admin/recommendations'),
    addDoctor: (data) => api.post('/admin/add-doctor', data)
};

export default api;
