const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * API client utility — wraps fetch with auth token and error handling
 */
class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getPublicWorkers() {
    return this.request<any[]>('/auth/public/workers');
  }

  async workerLogin(userId: string, workerId: string) {
    return this.request<{ token: string; user: any }>('/auth/worker-login', {
      method: 'POST',
      body: JSON.stringify({ userId, workerId }),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  async registerWorker(data: { name: string; email?: string; workerId?: string; password?: string }) {
    return this.request<{ user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'worker' }),
    });
  }

  async updateWorker(id: string, data: { name?: string; email?: string; workerId?: string; password?: string }) {
    return this.request<{ user: any }>(`/auth/workers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorker(id: string) {
    return this.request<any>(`/auth/workers/${id}`, {
      method: 'DELETE',
    });
  }

  async getWorkers() {
    return this.request<any[]>('/auth/workers');
  }

  // Products
  async getProducts(params?: { search?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    const qs = query.toString();
    return this.request<any[]>(`/products${qs ? `?${qs}` : ''}`);
  }

  async createProduct(data: { name: string; category: string; price: number; imageUrl?: string }) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: { name?: string; category?: string; price?: number; imageUrl?: string; available?: boolean }) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<any>(`/products/${id}`, { method: 'DELETE' });
  }

  async toggleProduct(id: string) {
    return this.request<any>(`/products/${id}/toggle`, { method: 'PATCH' });
  }

  // Orders
  async createOrder(data: {
    items: any[];
    total: number;
    paymentMethod: string;
    extraCharge?: number;
    extraChargeLabel?: string;
  }) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(params?: { search?: string; date?: string; paymentMethod?: string; page?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.date) query.set('date', params.date);
    if (params?.paymentMethod) query.set('paymentMethod', params.paymentMethod);
    if (params?.page) query.set('page', params.page.toString());
    const qs = query.toString();
    return this.request<any>(`/orders${qs ? `?${qs}` : ''}`);
  }

  async getMyOrders() {
    return this.request<any[]>('/orders/my');
  }

  async getOrder(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  // Reports
  async getDashboardStats() {
    return this.request<any>('/reports/dashboard');
  }

  async getDailyReport(date?: string) {
    const qs = date ? `?date=${date}` : '';
    return this.request<any>(`/reports/daily${qs}`);
  }

  async getMonthlyReport(month?: number, year?: number) {
    const query = new URLSearchParams();
    if (month) query.set('month', month.toString());
    if (year) query.set('year', year.toString());
    const qs = query.toString();
    return this.request<any>(`/reports/monthly${qs ? `?${qs}` : ''}`);
  }

  async getChartDaily() {
    return this.request<any[]>('/reports/chart/daily');
  }

  async getChartPayment() {
    return this.request<any[]>('/reports/chart/payment');
  }

  // Raw Materials (Inventory)
  async getRawMaterials(search?: string) {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<any[]>(`/raw-materials${qs}`);
  }

  async createRawMaterial(data: {
    name: string;
    quantity: number;
    unit: string;
    sellerName: string;
    price: number;
    minStockLevel?: number;
    notes?: string;
  }) {
    return this.request<any>('/raw-materials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRawMaterial(
    id: string,
    data: {
      name?: string;
      quantity?: number;
      unit?: string;
      sellerName?: string;
      price?: number;
      minStockLevel?: number;
      notes?: string;
    }
  ) {
    return this.request<any>(`/raw-materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRawMaterial(id: string) {
    return this.request<any>(`/raw-materials/${id}`, {
      method: 'DELETE',
    });
  }

  async dispatchRawMaterial(data: { materialId: string; quantity: number; notes?: string }) {
    return this.request<{ material: any; log: any }>('/raw-materials/dispatch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInventoryLogs() {
    return this.request<any[]>('/raw-materials/logs');
  }

  // Worker's own dispatch history only (no owner role required)
  async getMyInventoryLogs() {
    return this.request<any[]>('/raw-materials/my-logs');
  }

  // Owner updates their own profile (name, email, password)
  async updateProfile(data: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    return this.request<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
