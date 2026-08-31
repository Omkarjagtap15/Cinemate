const logger = require('../utils/logger');

/**
 * SingleFlight Service
 * Implements request coalescing / single-flight promise sharing.
 * Suppresses redundant outbound calls when identical concurrent requests are in flight.
 */
class SingleFlightService {
  constructor() {
    this.inFlight = new Map();
    this.deduplicatedCount = 0;
  }

  /**
   * Execute or join an existing in-flight promise for the given key.
   * @param {string} key - Unique deduplication key (e.g. cache key)
   * @param {Function} fn - Async operation to execute if no request is in flight
   * @returns {Promise<any>}
   */
  async do(key, fn) {
    // If request for key is already in flight, coalesce and return existing promise
    if (this.inFlight.has(key)) {
      this.deduplicatedCount++;
      logger.debug(`[SingleFlight] Coalesced concurrent request for key: ${key} (Total saved: ${this.deduplicatedCount})`);
      return this.inFlight.get(key);
    }

    // Otherwise, create and register the execution promise
    const promise = (async () => {
      try {
        const result = await fn();
        return result;
      } finally {
        // Clean up from in-flight registry once settled
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  getMetrics() {
    return {
      activeInFlightRequests: this.inFlight.size,
      totalDeduplicatedRequests: this.deduplicatedCount,
    };
  }
}

module.exports = new SingleFlightService();
