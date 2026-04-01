require('dotenv').config();
const express = require('express');
const ProxyManager = require('./proxyManager');
const APIClient = require('./apiClient');

const app = express();
app.use(express.json());

// Initialize proxy manager and API client
const proxyList = process.env.PROXIES
  ? process.env.PROXIES.split(',').map(p => p.trim())
  : [];

const proxyManager = new ProxyManager(proxyList);

const apiClient = new APIClient(proxyManager, {
  requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS) || 1000,
  maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
  backoffMultiplier: parseFloat(process.env.BACKOFF_MULTIPLIER) || 2,
});

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    status: 'Proxy API Server Running 🚀',
    endpoints: {
      'GET /': 'This endpoint',
      'POST /api/fetch': 'Fetch URL through proxy (body: { url: "..." })',
      'POST /api/batch': 'Fetch multiple URLs (body: { urls: [...] })',
      'GET /api/stats': 'Get request statistics',
      'GET /api/proxy/health': 'Get proxy pool health',
      'POST /api/proxy/reset': 'Reset failed proxies',
    },
  });
});

/**
 * POST /api/fetch - Fetch a single URL through proxy
 * Body: { url: "https://api.github.com/users/github" }
 */
app.post('/api/fetch', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`\n🔗 API Request: Fetching ${url}`);
    const result = await apiClient.requestWithRetry(url);

    if (result.success) {
      try {
        const data = JSON.parse(result.data);
        return res.json({
          success: true,
          url,
          statusCode: result.statusCode,
          proxy: result.proxy,
          attempt: result.attempt,
          data,
        });
      } catch (e) {
        return res.json({
          success: true,
          url,
          statusCode: result.statusCode,
          proxy: result.proxy,
          attempt: result.attempt,
          data: result.data.substring(0, 500),
        });
      }
    } else {
      return res.status(500).json({
        success: false,
        error: result.error,
        attemptsExhausted: result.attemptsExhausted,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
});

/**
 * POST /api/batch - Fetch multiple URLs with proxy rotation
 * Body: { urls: ["url1", "url2", ...], concurrent: 1 }
 */
app.post('/api/batch', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    console.log(`\n📦 Batch Request: Processing ${urls.length} URLs`);

    const results = [];

    for (let i = 0; i < urls.length; i++) {
      console.log(`[${i + 1}/${urls.length}] Processing ${urls[i]}`);
      const result = await apiClient.requestWithRetry(urls[i]);
      results.push({
        url: urls[i],
        ...result,
      });
    }

    res.json({
      success: true,
      totalRequests: urls.length,
      results,
      stats: apiClient.getStats(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/stats - Get detailed statistics
 */
app.get('/api/stats', (req, res) => {
  const stats = apiClient.getStats();
  res.json({
    statistics: {
      totalRequests: stats.totalRequests,
      successful: stats.successful,
      failed: stats.failed,
      successRate: stats.successRate,
    },
    proxyHealth: stats.proxyHealth,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/proxy/health - Get proxy pool health
 */
app.get('/api/proxy/health', (req, res) => {
  const health = proxyManager.getHealth();
  res.json({
    health,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/proxy/reset - Reset all failed proxies
 */
app.post('/api/proxy/reset', (req, res) => {
  proxyManager.resetFailedProxies();
  res.json({
    message: 'Failed proxies have been reset',
    health: proxyManager.getHealth(),
  });
});

/**
 * GET /api/config - Get current configuration
 */
app.get('/api/config', (req, res) => {
  res.json({
    config: {
      totalProxies: proxyManager.proxies.length,
      requestDelayMs: apiClient.requestDelayMs,
      maxRetries: apiClient.maxRetries,
      backoffMultiplier: apiClient.backoffMultiplier,
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Proxy API Server running on http://localhost:${PORT}`);
  console.log(`\n📌 Example requests:`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/fetch -H "Content-Type: application/json" -d '{"url":"https://api.github.com/users/github"}'`);
  console.log(`   curl http://localhost:${PORT}/api/stats`);
  console.log(`   curl http://localhost:${PORT}/api/proxy/health\n`);
});
