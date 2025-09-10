import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, AxiosError } from "axios"
import { config } from "./config"
import { logger } from "./logger"
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
    })

    // Request interceptor to add auth token and logging
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem("token")
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }
        
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
          // Clear token and redirect to login
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          logger.authFailure('Token expired or invalid', error)
          window.location.href = "/auth/login"
        }
        
        return Promise.reject(betterGolfError)
      }
    )
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await this.client.get(endpoint);
    if (!response.data) {
      return {} as T;
    }
    return response.data;
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await this.client.post(endpoint, body);
    if (!response.data) {
      return {} as T;
    }
    return response.data;
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await this.client.put(endpoint, body);
    if (!response.data) {
      return {} as T;
    }
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.client.delete(endpoint);
    if (!response.data) {
      return {} as T;
    }
    return response.data;
  }
}

export const apiClient = new ApiService();