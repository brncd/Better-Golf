import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import { logger } from './logger';
import { navigationService } from './navigationService';
import { config } from './config';

// Simple error handler for this service
const handleApiError = (error: AxiosError) => {
  return error;
};

class SecureApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Include cookies in requests
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.apiRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          config.url || 'unknown',
          config.data || null
        )
        return config
      },
      (error) => {
        logger.error('Request interceptor error', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling and logging
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.apiResponse(
          response.config.method?.toUpperCase() || 'UNKNOWN',
          response.config.url || 'unknown',
          response.status,
          response.data
        )
        return response
      },
      (error: AxiosError) => {
        const betterGolfError = handleApiError(error)
        
        if (error.response?.status === 401) {
          // Handle unauthorized access (only on client side)
          if (typeof window !== 'undefined') {
            logger.authFailure('Session expired or invalid', error)
            navigationService.redirectToLogin()
          }
        }
        
        return Promise.reject(betterGolfError)
      }
    )
  }

  private redirectToLogin() {
    if (typeof window !== 'undefined') {
      navigationService.redirectToLogin()
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.client.get(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await this.client.post(endpoint, body);
    return response.data;
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await this.client.put(endpoint, body);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete(endpoint);
    return response.data;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.get<any>('/health')
      return true
    } catch (error) {
      logger.error('Health check failed', error)
      return false
    }
  }

  // Health check method for debugging
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/me', { 
        credentials: 'include' 
      });
      return response.ok;
    } catch (error) {
      logger.error('Authentication check failed', error)
      return false
    }
  }
}

export const secureApiClient = new SecureApiService()
export { SecureApiService }
