/**
 * CheckinStatusManager
 * Centralized manager for check-in status to avoid redundant API calls
 * and share state across scenes
 */

import { authApi } from '@/services/api';

class CheckinStatusManager {
  private hasCheckedInToday: boolean = false;
  private isLoading: boolean = false;
  private lastCheckTime: number = 0;
  private cacheValidityMs: number = 60000; // Cache valid for 1 minute
  private listeners: Set<(status: boolean) => void> = new Set();

  /**
   * Get check-in status, using cache if available
   */
  async getCheckinStatus(): Promise<boolean> {
    const now = Date.now();
    
    // Return cached value if it's still valid
    if (now - this.lastCheckTime < this.cacheValidityMs) {
      console.log('CheckinStatusManager: Using cached check-in status:', this.hasCheckedInToday);
      return this.hasCheckedInToday;
    }

    // If already loading, wait for the result
    if (this.isLoading) {
      console.log('CheckinStatusManager: Already loading, waiting...');
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.isLoading) {
            clearInterval(checkInterval);
            resolve(this.hasCheckedInToday);
          }
        }, 100);
      });
    }

    // Fetch fresh status from API
    return this.refreshCheckinStatus();
  }

  /**
   * Force refresh check-in status from API
   */
  async refreshCheckinStatus(): Promise<boolean> {
    this.isLoading = true;
    
    try {
      console.log('CheckinStatusManager: Fetching check-in status from API');
      const response = await authApi.getCheckinStatus();
      
      if (response) {
        this.hasCheckedInToday = response.isCheckedInToday || false;
        this.lastCheckTime = Date.now();
        console.log('CheckinStatusManager: Check-in status updated:', this.hasCheckedInToday);
        
        // Notify all listeners
        this.notifyListeners();
      }
    } catch (error) {
      console.error('CheckinStatusManager: Error fetching check-in status:', error);
      // On error, don't update the cached value
    } finally {
      this.isLoading = false;
    }

    return this.hasCheckedInToday;
  }

  /**
   * Mark user as checked in today
   * Called after successful check-in
   */
  markAsCheckedIn(): void {
    this.hasCheckedInToday = true;
    this.lastCheckTime = Date.now();
    console.log('CheckinStatusManager: Marked as checked in');
    
    // Notify all listeners
    this.notifyListeners();
  }

  /**
   * Get current cached status without API call
   */
  getCachedStatus(): boolean {
    return this.hasCheckedInToday;
  }

  /**
   * Subscribe to check-in status changes
   */
  subscribe(callback: (status: boolean) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.hasCheckedInToday);
      } catch (error) {
        console.error('CheckinStatusManager: Error in listener callback:', error);
      }
    });
  }

  /**
   * Clear cache (useful for testing or logout)
   */
  clearCache(): void {
    this.hasCheckedInToday = false;
    this.lastCheckTime = 0;
    console.log('CheckinStatusManager: Cache cleared');
  }
}

// Export singleton instance
export const checkinStatusManager = new CheckinStatusManager();
