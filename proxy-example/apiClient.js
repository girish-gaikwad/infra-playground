const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * API Client with Proxy Support and Rate Limiting
 */

class APIClient {
  constructor(proxyManager, options = {}) {
    this.proxyManager = proxyManager;
    this.requestDelayMs = options.requestDelayMs || 1000;
    this.maxRetries = options.maxRetries || 3;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.successCount = 0;
    this.failureCount = 0;
  }

  /**
   * Wait between requests to respect rate limiting
   */
  async waitForRateLimit() {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const waitTime = Math.max(0, this.requestDelayMs - timeSinceLastRequest);

    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Make HTTP request through proxy
   */
  makeRequest(url, proxy, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: timeout,
      };

      // If proxy is provided, configure it
      if (proxy) {
        const proxyUrl = new URL(proxy);
        options.hostname = proxyUrl.hostname;
        options.port = proxyUrl.port;
        options.path = url; // Full URL when using proxy
        delete options.headers['Host']; // Let the proxy set this
        
        // ⚠️ IMPORTANT: Disable certificate verification for proxy connection
        // We verify the target API's certificate, not the proxy's
        options.rejectUnauthorized = false;
      }

      const req = httpModule.get(options, (res) => {
        let data = '';

        res.on('data', chunk => {
          data += chunk;
        });

        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            proxy: proxy,
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.abort();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
   * Make request with retry logic and proxy rotation
   */
  async requestWithRetry(url) {
    this.requestCount++;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Wait for rate limiting
        await this.waitForRateLimit();

        // Get a proxy
        const proxy = this.proxyManager ? this.proxyManager.getNextProxy() : null;

        console.log(`📡 Request #${this.requestCount} (Attempt ${attempt}/${this.maxRetries}) ${proxy ? `via ${proxy}` : 'directly'}`);

        // Make the request
        const response = await this.makeRequest(url, proxy);

        // Check for rate limit responses
        if (response.statusCode === 429) {
          const retryAfter = response.headers['retry-after'] || (attempt * 5);
          console.log(`⏳ Rate limited! Waiting ${retryAfter}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          continue;
        }

        // Check for other error responses
        if (response.statusCode >= 400) {
          if (proxy) {
            this.proxyManager.markProxyFailed(proxy);
          }
          throw new Error(`HTTP ${response.statusCode}: ${response.body.substring(0, 100)}`);
        }

        // Success!
        if (proxy) {
          this.proxyManager.markProxyWorking(proxy);
        }

        this.successCount++;
        console.log(`✅ Success on attempt ${attempt}`);

        return {
          success: true,
          statusCode: response.statusCode,
          data: response.body,
          proxy: response.proxy,
          attempt: attempt,
        };

      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed: ${error.message}`);

        if (attempt === this.maxRetries) {
          this.failureCount++;
          return {
            success: false,
            error: error.message,
            attempt: attempt,
            attemptsExhausted: true,
          };
        }

        // Exponential backoff before retry
        const backoffTime = Math.min(30000, this.requestDelayMs * Math.pow(this.backoffMultiplier, attempt - 1));
        console.log(`⏳ Backing off for ${backoffTime}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalRequests: this.requestCount,
      successful: this.successCount,
      failed: this.failureCount,
      successRate: this.requestCount > 0 ? ((this.successCount / this.requestCount) * 100).toFixed(2) + '%' : 'N/A',
      proxyHealth: this.proxyManager ? this.proxyManager.getHealth() : null,
    };
  }
}

module.exports = APIClient;
