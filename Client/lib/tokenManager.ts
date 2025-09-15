import { logger } from './logger';

export interface TokenInfo {
  token: string;
  expiresAt: number;
  isExpired: boolean;
  timeUntilExpiry: number;
}

export class TokenManager {
  private static readonly TOKEN_KEY = 'authToken';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  private static refreshPromise: Promise<string | null> | null = null;

  /**
   * Get token information including expiry status
   */
  static getTokenInfo(): TokenInfo | null {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      
      return {
        token,
        expiresAt,
        isExpired: now >= expiresAt,
        timeUntilExpiry: expiresAt - now
      };
    } catch (error) {
      logger.error('Failed to parse token', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Check if token needs refresh (within threshold of expiry)
   */
  static needsRefresh(): boolean {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo || tokenInfo.isExpired) return false;
    
    return tokenInfo.timeUntilExpiry <= this.REFRESH_THRESHOLD;
  }

  /**
   * Get current token, refreshing if necessary
   */
  static async getValidToken(): Promise<string | null> {
    const tokenInfo = this.getTokenInfo();
    
    if (!tokenInfo) return null;
    
    if (tokenInfo.isExpired) {
      logger.warn('Token is expired, clearing storage');
      this.clearToken();
      return null;
    }

    if (this.needsRefresh()) {
      logger.info('Token needs refresh, attempting refresh...');
      return await this.refreshToken();
    }

    return tokenInfo.token;
  }

  /**
   * Refresh token with deduplication
   */
  static async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      logger.info('Token refresh already in progress, waiting...');
      try {
        return await this.refreshPromise;
      } catch (error) {
        return null;
      }
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshPromise;
      return newToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private static async performTokenRefresh(): Promise<string | null> {
    const currentToken = localStorage.getItem(this.TOKEN_KEY);
    if (!currentToken) return null;

    try {
      // Note: The current API doesn't have a refresh endpoint
      // For now, we'll implement a simple token validation approach
      // In a production environment, you would call a refresh endpoint here
      
      const tokenInfo = this.getTokenInfo();
      if (!tokenInfo || tokenInfo.isExpired) {
        this.clearToken();
        return null;
      }

      // For now, return the current token if it's still valid
      // TODO: Implement actual refresh endpoint call when available
      logger.info('Token refresh not implemented in API, using current valid token');
      return currentToken;
      
    } catch (error) {
      logger.error('Token refresh failed', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Store new token
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.TOKEN_KEY, token);
    logger.authSuccess('Token stored successfully');
  }

  /**
   * Clear token from storage
   */
  static clearToken(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('user');
    logger.authSuccess('Token cleared from storage');
  }

  /**
   * Parse user data from token
   */
  static parseUserFromToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                   payload.role || [];
      const email = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 
                   payload.email || '';
      const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 
                      payload.unique_name || payload.name || '';

      return {
        email,
        username,
        roles: Array.isArray(roles) ? roles : [roles]
      };
    } catch (error) {
      logger.error('Failed to parse user from token', error);
      return null;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  static scheduleTokenRefresh(): void {
    const tokenInfo = this.getTokenInfo();
    if (!tokenInfo || tokenInfo.isExpired) return;

    const refreshTime = Math.max(0, tokenInfo.timeUntilExpiry - this.REFRESH_THRESHOLD);
    
    setTimeout(async () => {
      logger.info('Scheduled token refresh triggered');
      await this.refreshToken();
      
      // Schedule next refresh if token is still valid
      this.scheduleTokenRefresh();
    }, refreshTime);
    
    logger.info(`Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
  }
}
