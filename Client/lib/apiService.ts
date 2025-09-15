import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios"
import { config } from "./config"
import { logger } from "./logger"
import { navigationService } from "./navigationService"
import { handleApiError, BetterGolfError } from "./errors"

class ApiService {
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

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.apiRequest(
          config.method?.toUpperCase() || 'UNKNOWN',
          config.url || 'unknown',
          config.data
        )
        
        return config
      },
      (error: AxiosError) => {
        logger.apiError('REQUEST', 'unknown', error)
        return Promise.reject(handleApiError(error))
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
}

export const apiClient = new ApiService();