const AUTH_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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
  login: <T>(body: { email: string; password: string }) => fetcher<T>('/login?useCookies=false&useSessionCookies=false', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  register: <T>(body: { email: string; password: string }) => fetcher<T>('/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  // Get current user info
  getUserInfo: <T>() => fetcher<T>('/manage/info', {
    method: 'GET',
  }),
  // Refresh token
  refresh: <T>(body: { refreshToken: string }) => fetcher<T>('/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
  }),
};