import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

interface PatientsFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | string[];
  professionalId?: string;
  tags?: string | string[];
  ageMin?: number;
  ageMax?: number;
  gender?: string | string[];
  contact?: string;
  language?: string;
  hasInsurance?: boolean;
  paymentMethod?: string | string[];
  dateFrom?: string;
  dateTo?: string;
  dateField?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get('refresh-token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          Cookies.set('auth-token', accessToken, { expires: 1 }); // 1 day
          Cookies.set('refresh-token', newRefreshToken, { expires: 7 }); // 7 days

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          Cookies.remove('auth-token');
          Cookies.remove('refresh-token');
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Generic API methods
export const api = {
  // Authentication
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post<ApiResponse<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>>('/auth/login', credentials),

    logout: () =>
      apiClient.post<ApiResponse>('/auth/logout'),

    me: () =>
      apiClient.get<ApiResponse<any>>('/auth/profile'),

    refresh: (refreshToken: string) =>
      apiClient.post<ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>>('/auth/refresh', { refreshToken }),

    updateProfile: (data: { name?: string; phone?: string; profileImage?: string; preferences?: any }) =>
      apiClient.put<ApiResponse<any>>('/auth/profile', data),
  },

  // Users
  users: {
    list: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
      apiClient.get<ApiResponse<any[]>>('/users', { params }),

    get: (id: string) =>
      apiClient.get<ApiResponse<any>>(`/users/${id}`),

    create: (data: any) =>
      apiClient.post<ApiResponse<any>>('/users', data),

    update: (id: string, data: any) =>
      apiClient.put<ApiResponse<any>>(`/users/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse>(`/users/${id}`),
  },

  // Patients
  patients: {
    list: (params?: PatientsFilters) =>
      apiClient.get<ApiResponse<{
        patients: any[];
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      }>>('/patients', { params }),

    get: (id: string) =>
      apiClient.get<ApiResponse<any>>(`/patients/${id}`),

    create: (data: any) =>
      apiClient.post<ApiResponse<any>>('/patients', data),

    update: (id: string, data: any) =>
      apiClient.put<ApiResponse<any>>(`/patients/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse>(`/patients/${id}`),

    export: (params?: { format?: 'csv' | 'excel'; filters?: any }) =>
      apiClient.get<Blob>('/patients/export', { 
        params, 
        responseType: 'blob' 
      }),

    bulkImport: (file: FormData) =>
      apiClient.post<ApiResponse<any>>('/patients/import', file, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
  },

  // Professionals
  professionals: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      apiClient.get<ApiResponse<any[]>>('/professionals', { params }),

    get: (id: string) =>
      apiClient.get<ApiResponse<any>>(`/professionals/${id}`),

    create: (data: any) =>
      apiClient.post<ApiResponse<any>>('/professionals', data),

    update: (id: string, data: any) =>
      apiClient.put<ApiResponse<any>>(`/professionals/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse>(`/professionals/${id}`),
  },

  // Appointments
  appointments: {
    list: (params?: { page?: number; limit?: number; status?: string; professionalId?: string; patientId?: string }) =>
      apiClient.get<ApiResponse<any[]>>('/appointments', { params }),

    get: (id: string) =>
      apiClient.get<ApiResponse<any>>(`/appointments/${id}`),

    getByPatient: (patientId: string, params?: { limit?: number; status?: string; includeHistory?: boolean }) =>
      apiClient.get<ApiResponse<any[]>>(`/appointments`, { params: { patientId, ...params } }),

    create: (data: any) =>
      apiClient.post<ApiResponse<any>>('/appointments', data),

    update: (id: string, data: any) =>
      apiClient.put<ApiResponse<any>>(`/appointments/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse>(`/appointments/${id}`),
  },

  // Services
  services: {
    list: (params?: { page?: number; limit?: number }) =>
      apiClient.get<ApiResponse<any[]>>('/services', { params }),

    get: (id: string) =>
      apiClient.get<ApiResponse<any>>(`/services/${id}`),

    create: (data: any) =>
      apiClient.post<ApiResponse<any>>('/services', data),

    update: (id: string, data: any) =>
      apiClient.put<ApiResponse<any>>(`/services/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse>(`/services/${id}`),
  },

  // Stats
  stats: {
    dashboard: () =>
      apiClient.get<ApiResponse<any>>('/stats/dashboard'),
  },
};

export default api;
