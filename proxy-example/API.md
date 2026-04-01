# Express Proxy API Server

A production-ready Express server that provides REST API endpoints for making requests through proxies with automatic rotation, rate limiting, and retry logic.

## Quick Start

### 1. Start the Server
```bash
npm run server
```

Server will start on `http://localhost:5000`

### 2. Test the API (in another terminal)
```bash
npm run client
```

## API Endpoints

### GET `/` 
Server health check and endpoint list.

**Example:**
```bash
curl http://localhost:5000
```

**Response:**
```json
{
  "status": "Proxy API Server Running 🚀",
  "endpoints": { ... }
}
```

---

### POST `/api/fetch`
Fetch a single URL through proxy with automatic rotation and retries.

**Body:**
```json
{
  "url": "https://api.github.com/users/github"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.github.com/users/github"}'
```

**Success Response (200):**
```json
{
  "success": true,
  "url": "https://api.github.com/users/github",
  "statusCode": 200,
  "proxy": "http://proxy1:8080",
  "attempt": 1,
  "data": {
    "login": "github",
    "id": 1,
    ...
  }
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Connect timeout",
  "attemptsExhausted": true
}
```

---

### POST `/api/batch`
Fetch multiple URLs in sequence with proxy rotation.

**Body:**
```json
{
  "urls": [
    "https://api.github.com/users/torvalds",
    "https://api.github.com/users/gvanrossum",
    "https://api.github.com/repos/torvalds/linux"
  ]
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://api.github.com/users/torvalds",
      "https://api.github.com/users/gvanrossum"
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "totalRequests": 2,
  "results": [
    {
      "url": "https://api.github.com/users/torvalds",
      "success": true,
      "statusCode": 200,
      "proxy": "http://proxy1:8080",
      "data": { ... }
    },
    {
      "url": "https://api.github.com/users/gvanrossum",
      "success": true,
      "statusCode": 200,
      "proxy": "http://proxy2:8080",
      "data": { ... }
    }
  ],
  "stats": { ... }
}
```

---

### GET `/api/stats`
Get detailed request statistics.

**Example:**
```bash
curl http://localhost:5000/api/stats
```

**Response:**
```json
{
  "statistics": {
    "totalRequests": 10,
    "successful": 10,
    "failed": 0,
    "successRate": "100.00%"
  },
  "proxyHealth": {
    "total": 3,
    "healthy": 3,
    "failed": 0,
    "healthPercentage": "100.00"
  },
  "timestamp": "2026-04-01T12:00:00.000Z"
}
```

---

### GET `/api/proxy/health`
Check proxy pool health status.

**Example:**
```bash
curl http://localhost:5000/api/proxy/health
```

**Response:**
```json
{
  "health": {
    "total": 3,
    "healthy": 3,
    "failed": 0,
    "healthPercentage": "100.00"
  },
  "timestamp": "2026-04-01T12:00:00.000Z"
}
```

---

### POST `/api/proxy/reset`
Reset all failed proxies (mark them as healthy again).

**Example:**
```bash
curl -X POST http://localhost:5000/api/proxy/reset
```

**Response:**
```json
{
  "message": "Failed proxies have been reset",
  "health": {
    "total": 3,
    "healthy": 3,
    "failed": 0,
    "healthPercentage": "100.00"
  }
}
```

---

### GET `/api/config`
Get current server configuration.

**Example:**
```bash
curl http://localhost:5000/api/config
```

**Response:**
```json
{
  "config": {
    "totalProxies": 3,
    "requestDelayMs": 1500,
    "maxRetries": 3,
    "backoffMultiplier": 2
  }
}
```

## Configuration

Edit `.env` in `proxy-example/` directory:

```env
# Comma-separated proxy list
PROXIES=http://proxy1:8080,http://proxy2:8080,http://proxy3:8080

# Delay between requests (ms) to respect rate limits
REQUEST_DELAY_MS=1500

# Maximum retry attempts for failed requests
MAX_RETRIES=3

# Exponential backoff multiplier (1s, 2s, 4s, etc.)
BACKOFF_MULTIPLIER=2

# Server port
PORT=5000
```

## Usage Examples

### JavaScript/Node.js
```javascript
const fetch = require('node-fetch');

async function getGitHubUser(username) {
  const response = await fetch('http://localhost:5000/api/fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: `https://api.github.com/users/${username}`
    })
  });
  
  const result = await response.json();
  return result.data;
}
```

### Python
```python
import requests

def get_github_user(username):
    response = requests.post(
        'http://localhost:5000/api/fetch',
        json={'url': f'https://api.github.com/users/{username}'}
    )
    return response.json()['data']
```

### cURL
```bash
# Single request
curl -X POST http://localhost:5000/api/fetch \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.github.com/users/github"}'

# Batch requests
curl -X POST http://localhost:5000/api/batch \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://api.github.com/users/github","https://api.github.com/users/torvalds"]}'

# Get stats
curl http://localhost:5000/api/stats | jq

# Get proxy health
curl http://localhost:5000/api/proxy/health | jq

# Reset proxies
curl -X POST http://localhost:5000/api/proxy/reset
```

## Features

✅ **Proxy Rotation** - Distributes requests across proxies
✅ **Automatic Retries** - Configurable retry logic with exponential backoff
✅ **Rate Limiting** - Respects HTTP 429 and delays between requests
✅ **Failure Tracking** - Marks failed proxies and skips them
✅ **Statistics** - Real-time request metrics
✅ **Health Monitoring** - Track proxy pool health
✅ **RESTful API** - Easy integration with any client
✅ **Error Handling** - Comprehensive error responses

## Monitoring

Watch the server logs while making requests:

```
🔗 API Request: Fetching https://api.github.com/users/github

📡 Request #1 (Attempt 1/3) via http://proxy1:8080
✅ Success on attempt 1
```

## Production Deployment

### Using PM2
```bash
npm install -g pm2

# Start server
pm2 start proxy-example/server.js --name "proxy-api"

# Monitor
pm2 monit

# View logs
pm2 logs proxy-api
```

### Using Docker
```dockerfile
FROM node:18

WORKDIR /app
COPY . .
RUN npm install

EXPOSE 5000
CMD ["npm", "run", "server"]
```

```bash
docker build -t proxy-api .
docker run -p 5000:5000 --env-file proxy-example/.env proxy-api
```

## Troubleshooting

**Issue: Connection refused**
- Make sure server is running: `npm run server`
- Check port 5000 is not in use: `netstat -an | grep 5000`

**Issue: All requests failing**
- Check proxy list in `.env`
- Try without proxies (leave PROXIES empty)
- Check firewall/network settings

**Issue: Rate limiting still happening**
- Increase `REQUEST_DELAY_MS` in `.env`
- Use premium proxies for better reliability

## Advanced Usage

### Custom Middleware
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Rate Limiting (npm package)
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100
});

app.use('/api/fetch', limiter);
```

### Authentication
```javascript
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  next();
});
```

## Performance Tips

1. **Use batch endpoint** for multiple requests
2. **Adjust REQUEST_DELAY_MS** based on target API
3. **Monitor proxy health** regularly
4. **Use connection pooling** in your HTTP client
5. **Consider clustering** for high-volume scenarios

---


## 🔧 HTTP Client Implementation

This project uses Node.js built-in modules:

- `http`
- `https`

instead of modern `fetch` or third-party libraries like `axios`.

---

### ❓ Why not `fetch`?

While `fetch` (available in Node.js 18+) provides a simpler API, it has limitations for this use case:

- ❌ No native support for HTTP proxy configuration  
- ❌ Requires external agents (`https-proxy-agent`) for proxy support  
- ❌ Less control over low-level request handling  

---

### ✅ Why `http/https`?

Using native modules allows:

- ✅ Full control over request lifecycle  
- ✅ Direct proxy routing (no extra libraries)  
- ✅ Better compatibility with proxy rotation logic  
- ✅ Fine-grained timeout and error handling  
- ✅ No external dependencies (lightweight & production-friendly)  

---

### 🧠 Design Decision

Since this project focuses on:

- Proxy rotation  
- Retry logic  
- Rate limiting  
- Failure tracking  

Using `http/https` ensures maximum flexibility and reliability without relying on external packages.

---

### 📌 Note

If your use case does **not require proxies**, you can simplify the implementation by switching to `fetch`.

---

## 💡 Summary

| Feature              | `http/https` | `fetch` |
|---------------------|-------------|--------|
| Proxy support       | ✅ Native    | ❌ Needs extra libs |
| Control             | ✅ High      | ⚠️ Limited |
| Simplicity          | ❌ Verbose   | ✅ Simple |
| Dependencies        | ✅ None      | ⚠️ May need extras |

For more examples, see `example.js` or run:
```bash
node example.js
```
