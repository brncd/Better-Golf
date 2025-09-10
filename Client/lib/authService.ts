const AUTH_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5100';

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${AUTH_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.title || 'An API error occurred');
    } catch (e) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const authClient = {
  login: <T>(body: any) => fetcher<T>('/login', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  register: <T>(body: any) => fetcher<T>('/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};