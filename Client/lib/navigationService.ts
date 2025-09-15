/**
 * Navigation service for consistent routing across the application
 * Provides a centralized way to handle navigation with proper Next.js router integration
 */

import { logger } from './logger';

export class NavigationService {
  private static router: any = null;

  /**
   * Set the Next.js router instance (should be called from app components)
   */
  static setRouter(router: any) {
    this.router = router;
  }

  /**
   * Navigate to a path using Next.js router if available, fallback to window.location
   */
  static push(path: string) {
    if (typeof window === 'undefined') {
      logger.warn('Navigation attempted on server side', { path });
      return;
    }

    logger.navigation(window.location.pathname, path);

    if (this.router && typeof this.router.push === 'function') {
      this.router.push(path);
    } else {
      // Fallback to window.location for cases where router is not available
      window.location.href = path;
    }
  }

  /**
   * Replace current route using Next.js router if available, fallback to window.location
   */
  static replace(path: string) {
    if (typeof window === 'undefined') {
      logger.warn('Navigation attempted on server side', { path });
      return;
    }

    logger.navigation(window.location.pathname, path);

    if (this.router && typeof this.router.replace === 'function') {
      this.router.replace(path);
    } else {
      // Fallback to window.location for cases where router is not available
      window.location.href = path;
    }
  }

  /**
   * Navigate back using Next.js router if available, fallback to history.back()
   */
  static back() {
    if (typeof window === 'undefined') {
      logger.warn('Navigation back attempted on server side');
      return;
    }

    logger.navigation(window.location.pathname, 'back');

    if (this.router && typeof this.router.back === 'function') {
      this.router.back();
    } else {
      // Fallback to browser history
      window.history.back();
    }
  }

  /**
   * Redirect to login page (used by auth services)
   */
  static redirectToLogin() {
    if (typeof window === 'undefined') return;

    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      logger.authFailure('Redirecting to login due to authentication failure', null);
      this.replace('/login');
    }
  }

  /**
   * Get current pathname
   */
  static getCurrentPath(): string {
    if (typeof window === 'undefined') return '';
    return window.location.pathname;
  }
}

export const navigationService = NavigationService;
