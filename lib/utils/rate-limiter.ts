/**
 * Simple in-memory rate limiter for API calls
 * In production, consider using Redis or a similar solution
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Check if a request is allowed for the given identifier
   * @param identifier Unique identifier (e.g., IP address, user ID)
   * @returns true if allowed, false if rate limit exceeded
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count < this.maxRequests) {
      // Increment count
      entry.count++;
      return true;
    }

    // Rate limit exceeded
    return false;
  }

  /**
   * Get remaining requests for identifier
   * @param identifier Unique identifier
   * @returns Number of remaining requests
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      return this.maxRequests;
    }

    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Get time until reset for identifier
   * @param identifier Unique identifier
   * @returns Milliseconds until reset, or 0 if no limit
   */
  getResetTime(identifier: string): number {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      return 0;
    }

    return entry.resetTime - now;
  }

  /**
   * Manually reset limit for identifier
   * @param identifier Unique identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Export singleton instance for Google Maps API
// 240 requests per hour = 4 requests per minute per user (generous limit)
export const mapsApiLimiter = new RateLimiter(60000, 4);

// Export class for custom rate limiters
export default RateLimiter;
