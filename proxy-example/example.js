require('dotenv').config();
const ProxyManager = require('./proxyManager');
const APIClient = require('./apiClient');

/**
 * Example: Scraping with Proxy Rotation and Rate Limiting
 */

async function main() {
  // Parse proxies from environment (or use empty array for direct requests)
  const proxyList = process.env.PROXIES
    ? process.env.PROXIES.split(',').map(p => p.trim())
    : [];

  // Initialize proxy manager
  const proxyManager = new ProxyManager(proxyList);

  // Initialize API client
  const apiClient = new APIClient(proxyManager, {
    requestDelayMs: parseInt(process.env.REQUEST_DELAY_MS) || 1000,
    maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
    backoffMultiplier: parseFloat(process.env.BACKOFF_MULTIPLIER) || 2,
  });

  // Example API endpoints to call
  const endpoints = [
    '/users/github',
    '/users/torvalds',
    '/users/gvanrossum',
    '/users/brendaneich',
    '/repos/torvalds/linux',
    '/repos/python/cpython',
  ];

  console.log('🚀 Starting API requests with proxy rotation...\n');

  // Make requests (core)
  for (const endpoint of endpoints) {
    const url = `https://api.github.com${endpoint}`;

    const result = await apiClient.requestWithRetry(url);

    if (result.success) {
      try {
        const data = JSON.parse(result.data);
        console.log(`   📊 Response: ${JSON.stringify(data).substring(0, 100)}...\n`);
      } catch (e) {
        console.log(`   📊 Response received\n`);
      }
    } else {
      console.log(`   ❌ Failed: ${result.error}\n`);
    }
  }

  // Print statistics
  console.log('\n📈 Final Statistics:');
  console.log('='.repeat(50));
  const stats = apiClient.getStats();
  console.log(`Total Requests: ${stats.totalRequests}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Success Rate: ${stats.successRate}`);

  if (stats.proxyHealth) {
    console.log(`\n🌐 Proxy Health:`);
    console.log(`Total Proxies: ${stats.proxyHealth.total}`);
    console.log(`Healthy: ${stats.proxyHealth.healthy}`);
    console.log(`Failed: ${stats.proxyHealth.failed}`);
    console.log(`Health: ${stats.proxyHealth.healthPercentage}%`);
  }
}

main().catch(console.error);
