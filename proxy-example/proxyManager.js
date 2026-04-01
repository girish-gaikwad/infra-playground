/**
 * Proxy Manager - Handles proxy rotation and selection
 */

class ProxyManager {
  constructor(proxyList = []) {
    this.proxies = proxyList.filter(p => p && p.trim());
    this.currentIndex = 0;
    this.failedProxies = new Set();

    if (this.proxies.length === 0) {
      console.warn('⚠️ No proxies configured - will make direct requests');
    } else {
      console.log(`✅ ProxyManager initialized with ${this.proxies.length} proxies`);
    }
  }

  /**
   * Get next proxy in rotation
   */
  getNextProxy() {
    if (this.proxies.length === 0) {
      return null;
    }

    // Skip failed proxies
    let attempts = 0;
    while (this.failedProxies.has(this.proxies[this.currentIndex]) && attempts < this.proxies.length) {
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
      attempts++;
    }

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

    return proxy;
  }

  /**
   * Mark proxy as failed
   */
  markProxyFailed(proxy) {
    this.failedProxies.add(proxy);
    console.log(`❌ Proxy marked as failed: ${proxy}`);
  }

  /**
   * Mark proxy as working
   */
  markProxyWorking(proxy) {
    this.failedProxies.delete(proxy);
    console.log(`✅ Proxy working: ${proxy}`);
  }

  /**
   * Get health of proxy pool
   */
  getHealth() {
    const totalProxies = this.proxies.length;
    const healthyProxies = totalProxies - this.failedProxies.size;

    return {
      total: totalProxies,
      healthy: healthyProxies,
      failed: this.failedProxies.size,
      healthPercentage: totalProxies > 0 ? ((healthyProxies / totalProxies) * 100).toFixed(2) : 'N/A',
    };
  }

  /**
   * Reset failed proxies (useful after a timeout period)
   */
  resetFailedProxies() {
    const count = this.failedProxies.size;
    this.failedProxies.clear();
    console.log(`🔄 Reset ${count} failed proxies`);
  }
}

module.exports = ProxyManager;
