import { config } from './config';
import { logger } from './logger';
import { BetterGolfError, createError, ErrorType } from './errors';

const AUTH_BASE_URL = config.api.baseUrl;

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${AUTH_BASE_URL}${endpoint}`;
  
  logger.apiRequest('POST', url, options.body);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      logger.apiResponse(response.status.toString(), url, errorData);
      throw createError(ErrorType.AUTHENTICATION, errorData.title || errorData.message || 'Authentication failed', errorData);
    }
    
    if (response.status === 204) {
      logger.apiResponse(response.status.toString(), url, 0);
      return {} as T;
    }

    const data = await response.json();
    logger.apiResponse(response.status.toString(), url, data);
    return data;
  } catch (error) {
    if (error instanceof BetterGolfError) {
      throw error;
    }
    logger.error('Auth API Error', { url, endpoint, error: (error as Error).message });
    throw createError(ErrorType.NETWORK, 'Network error occurred', 500);
  }
}

export const authClient = {
  login: <T>(body: { emailOrUsername: string; password: string }) => {
    logger.info('Login attempt', { emailOrUsername: body.emailOrUsername });
    return fetcher<T>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  register: <T>(body: { username: string; email: string; password: string }) => {
    logger.info('Registration attempt', { email: body.email, username: body.username });
    return fetcher<T>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  
  getUserInfo: <T>(token: string) => {
    return fetcher<T>('/manage/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
  
  refresh: <T>(body: { refreshToken: string }) => {
    logger.info('Token refresh attempt');
    return fetcher<T>('/refresh', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};