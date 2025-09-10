const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An API error occurred');
    } catch (e) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => fetcher<T>(endpoint),
  post: <T>(endpoint: string, body: any) => fetcher<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  put: <T>(endpoint: string, body: any) => fetcher<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  delete: <T>(endpoint: string) => fetcher<T>(endpoint, {
    method: 'DELETE',
  }),
};