const API_BASE_URL = 'https://api.thamhoi.io.vn';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if required
    if (requireAuth) {
      const token = localStorage.getItem('admin_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return { error: errorData.error || errorData.message || `HTTP ${response.status}` };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// ========== Public APIs (for visitors) ==========

export interface Battalion {
  id: number;
  code: string;
  name: string;
}

export interface Company {
  id: number;
  code: string;
  name: string;
}

export interface Platoon {
  id: number;
  code: string;
  name: string;
}

export interface VisitRequest {
  id: string;
  code: string;
  soldier_name: string;
  visitor_name: string;
  visitor_phone: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  battalion_name?: string;
  company_name?: string;
  platoon_name?: string;
  created_at: string;
  reviewed_at?: string;
}

export interface CreateVisitRequestData {
  battalion_id: number;
  company_id: number;
  platoon_id: number;
  soldier_name: string;
  visitor_name: string;
  visitor_phone: string;
  reason?: string;
}

export const publicApi = {
  // Get all battalions
  getBattalions: () => apiRequest<Battalion[]>('/api/battalions'),

  // Get companies by battalion
  getCompanies: (battalionId: number) =>
    apiRequest<Company[]>(`/api/companies?battalion_id=${battalionId}`),

  // Get platoons by company
  getPlatoons: (companyId: number) =>
    apiRequest<Platoon[]>(`/api/platoons?company_id=${companyId}`),

  // Create visit request
  createVisitRequest: (data: CreateVisitRequestData) =>
    apiRequest<{ id: string; code: string }>('/api/visit-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get visit request by code (public API - không cần đăng nhập)
  getVisitRequestByCode: (code: string) =>
    apiRequest<VisitRequest>(`/api/visit-requests/${code}`),
};

// ========== Admin APIs ==========

export interface Admin {
  id: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  admin: Admin;
  token: string;
}

// Helper function for admin API requests (automatically adds auth token)
function adminRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, options, true);
}

export const adminApi = {
  // Login (no auth required)
  login: (username: string, password: string) =>
    apiRequest<LoginResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Battalions CRUD
  getBattalions: () => adminRequest<Battalion[]>('/api/admin/battalions'),
  getBattalion: (id: number) => adminRequest<Battalion>(`/api/admin/battalions/${id}`),
  createBattalion: (data: { code: string; name: string }) =>
    adminRequest<Battalion>('/api/admin/battalions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBattalion: (id: number, data: { code: string; name: string }) =>
    adminRequest<{ success: boolean }>(`/api/admin/battalions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBattalion: (id: number) =>
    adminRequest<{ success: boolean }>(`/api/admin/battalions/${id}`, {
      method: 'DELETE',
    }),

  // Companies CRUD
  getCompanies: () => adminRequest<Company[]>('/api/admin/companies'),
  getCompany: (id: number) => adminRequest<Company>(`/api/admin/companies/${id}`),
  createCompany: (data: { battalion_id: number; code: string; name: string }) =>
    adminRequest<Company>('/api/admin/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCompany: (id: number, data: { battalion_id: number; code: string; name: string }) =>
    adminRequest<{ success: boolean }>(`/api/admin/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCompany: (id: number) =>
    adminRequest<{ success: boolean }>(`/api/admin/companies/${id}`, {
      method: 'DELETE',
    }),

  // Platoons CRUD
  getPlatoons: () => adminRequest<Platoon[]>('/api/admin/platoons'),
  getPlatoon: (id: number) => adminRequest<Platoon>(`/api/admin/platoons/${id}`),
  createPlatoon: (data: { company_id: number; code: string; name: string }) =>
    adminRequest<Platoon>('/api/admin/platoons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePlatoon: (id: number, data: { company_id: number; code: string; name: string }) =>
    adminRequest<{ success: boolean }>(`/api/admin/platoons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePlatoon: (id: number) =>
    adminRequest<{ success: boolean }>(`/api/admin/platoons/${id}`, {
      method: 'DELETE',
    }),

  // Visit Requests
  getVisitRequests: (filters?: {
    status?: string;
    platoon_id?: number;
    company_id?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.platoon_id) params.append('platoon_id', filters.platoon_id.toString());
    if (filters?.company_id) params.append('company_id', filters.company_id.toString());
    const query = params.toString();
    return adminRequest<VisitRequest[]>(`/api/admin/visit-requests${query ? `?${query}` : ''}`);
  },
  getVisitRequest: (id: string) =>
    adminRequest<VisitRequest>(`/api/admin/visit-requests/${id}`),
  approveVisitRequest: (id: string) =>
    adminRequest<{ success: boolean; message: string }>(`/api/admin/visit-requests/${id}/approve`, {
      method: 'PUT',
    }),
  rejectVisitRequest: (id: string) =>
    adminRequest<{ success: boolean; message: string }>(`/api/admin/visit-requests/${id}/reject`, {
      method: 'PUT',
    }),

  // Statistics
  getOverview: () => adminRequest<any>('/api/admin/overview'),
  getPlatoonStatistics: () => adminRequest<any[]>('/api/admin/statistics/platoons'),
  getCompanyStatistics: () => adminRequest<any[]>('/api/admin/statistics/companies'),
};

