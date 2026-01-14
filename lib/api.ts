// API service layer for backend communication

const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetcher<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error' };
  }
}

// Auth API
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    fetcher('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  getUser: () => fetcher('/user'),

  updateUser: (data: { name?: string; image?: string; activeWorkspace?: string }) =>
    fetcher('/user', { method: 'PUT', body: JSON.stringify(data) }),
};

// Collections API
export const collectionsApi = {
  list: (workspaceId?: string) =>
    fetcher(`/collections${workspaceId ? `?workspaceId=${workspaceId}` : ''}`),

  get: (id: string) => fetcher(`/collections/${id}`),

  create: (data: { name: string; description?: string; workspaceId?: string }) =>
    fetcher('/collections', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>) =>
    fetcher(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetcher(`/collections/${id}`, { method: 'DELETE' }),

  share: (id: string) =>
    fetcher(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'share' }) }),

  unshare: (id: string) =>
    fetcher(`/collections/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'unshare' }) }),
};

// Requests API
export const requestsApi = {
  list: (params?: { collectionId?: string; workspaceId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.collectionId) searchParams.set('collectionId', params.collectionId);
    if (params?.workspaceId) searchParams.set('workspaceId', params.workspaceId);
    const query = searchParams.toString();
    return fetcher(`/requests${query ? `?${query}` : ''}`);
  },

  get: (id: string) => fetcher(`/requests/${id}`),

  create: (data: {
    name: string;
    method?: string;
    url: string;
    params?: Array<{ key: string; value: string; enabled: boolean }>;
    headers?: Array<{ key: string; value: string; enabled: boolean }>;
    body?: string;
    bodyType?: string;
    collectionId?: string;
    workspaceId?: string;
  }) => fetcher('/requests', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>) =>
    fetcher(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetcher(`/requests/${id}`, { method: 'DELETE' }),
};

// Environments API
export const environmentsApi = {
  list: (workspaceId?: string) =>
    fetcher(`/environments${workspaceId ? `?workspaceId=${workspaceId}` : ''}`),

  get: (id: string) => fetcher(`/environments/${id}`),

  create: (data: {
    name: string;
    variables?: Array<{ key: string; value: string; isSecret?: boolean }>;
    workspaceId?: string;
  }) => fetcher('/environments', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Record<string, unknown>) =>
    fetcher(`/environments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetcher(`/environments/${id}`, { method: 'DELETE' }),
};

// History API
export const historyApi = {
  list: (params?: { workspaceId?: string; limit?: number; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.workspaceId) searchParams.set('workspaceId', params.workspaceId);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    const query = searchParams.toString();
    return fetcher(`/history${query ? `?${query}` : ''}`);
  },

  add: (data: {
    method: string;
    url: string;
    params?: Array<{ key: string; value: string; enabled: boolean }>;
    headers?: Array<{ key: string; value: string; enabled: boolean }>;
    body?: string;
    response: Record<string, unknown>;
    workspaceId?: string;
  }) => fetcher('/history', { method: 'POST', body: JSON.stringify(data) }),

  clear: (workspaceId?: string) =>
    fetcher(`/history${workspaceId ? `?workspaceId=${workspaceId}` : ''}`, { method: 'DELETE' }),
};

// Workspaces API
export const workspacesApi = {
  list: () => fetcher('/workspaces'),

  get: (id: string) => fetcher(`/workspaces/${id}`),

  create: (data: { name: string; description?: string }) =>
    fetcher('/workspaces', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { name?: string; description?: string }) =>
    fetcher(`/workspaces/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetcher(`/workspaces/${id}`, { method: 'DELETE' }),

  addMember: (id: string, data: { email: string; role?: string }) =>
    fetcher(`/workspaces/${id}/members`, { method: 'POST', body: JSON.stringify(data) }),

  removeMember: (id: string, userId: string) =>
    fetcher(`/workspaces/${id}/members`, { method: 'DELETE', body: JSON.stringify({ userId }) }),

  updateMemberRole: (id: string, data: { userId: string; role: string }) =>
    fetcher(`/workspaces/${id}/members`, { method: 'PATCH', body: JSON.stringify(data) }),
};
