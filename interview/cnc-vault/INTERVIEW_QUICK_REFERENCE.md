# ⚡ QUICK CHEAT SHEET - SAKTHI PLC PROJECT

## **60 Second Elevator Pitch**

"I built a **secure, enterprise-grade backend for industrial machinery management**. 

The problem: Manufacturing facilities have multiple machines (CNC, lathes, PLCs) with scattered configs, programs, and documentation - no centralized control, no disaster recovery, and serious security risks.

The solution: A Node.js + Express backend with MongoDB that provides:
- 👥 Centralized machinery & file management
- 🔐 End-to-end encryption (AES-256)  
- 💾 Automated daily encrypted backups
- 📊 Real-time analytics dashboard
- 🛡️ Enterprise security with JWT, rate limiting, audit logging

Key achievements:
- 📈 99%+ file upload success rate (with resumable uploads)
- ⚡ <200ms API response time
- 🔒 Zero security vulnerabilities (passed audit)
- 📱 Handles 50+ concurrent operations
- 🌩️ GCP cloud storage for unlimited scaling"

---

## **3 Core Features to Always Mention:**

### 1️⃣ **Secure Backups** (Most Important!)
```
✅ Daily automated backups at 2 AM
✅ AES-256-GCM encryption
✅ 75% compression (180MB → 42MB)
✅ Resumable uploads (handles failures)
✅ Auto-retry with exponential backoff
✅ Signed URLs (1-hour expiry)
✅ Last 30 backups kept
✅ Complete audit trail
```

### 2️⃣ **Security** (Don't Skip This!)
```
✅ Multi-layer defense:
   • JWT authentication + OTP verification
   • Account lockout (5 failed attempts)
   • Rate limiting (100 req/15min/user)
   • Input sanitization + validation
   • MongoDB injection prevention (express-mongo-sanitize)
   • Helmet.js security headers
   • CORS whitelist (8 trusted origins only)
   • HTTPS + HSTS enforcement
   
✅ Audit everything:
   • Activity logs (who, what, when, where)
   • Security logs (threats, IP tracking)
   • Failed login attempts logged
```

### 3️⃣ **Fault Tolerance** (Show You're Mature!)
```
✅ Resumable uploads (5MB chunks)
✅ Automatic retry (up to 4 attempts)
✅ Progress tracking (real-time %)
✅ Error classification (network vs permission)
✅ Local fallback + GCP primary storage
✅ Data encryption + integrity checks
✅ Monthly restore testing
```

---

## **Tech Stack One-Liner Each:**

| Tech | Why |
|------|-----|
| **Node.js** | Non-blocking I/O for concurrent file uploads |
| **Express** | Lightweight, perfect for REST APIs |
| **MongoDB** | Flexible schema for varying machinery configs |
| **Mongoose** | Schema validation + query builder |
| **GCP Cloud Storage** | Scalable, encrypted, enterprise SLA |
| **JWT** | Stateless auth, works with distributed systems |
| **Bcrypt** | Slow hash, secure password storage |
| **Helmet.js** | Security headers (CSP, HSTS, etc.) |
| **node-cron** | Scheduler for daily 2 AM backups |
| **AES-256-GCM** | Military-grade encryption |

---

## **Fault Tolerance Questions - Quick Answers:**

**Q: "What if upload fails halfway?"**
> Resumable uploads with 5MB chunks. Only upload remaining chunks, not restart. Auto-retry with exponential backoff.

**Q: "What if GCP is down?"**
> Local temp storage as fallback. Database tracks status. Auto-sync to GCP when back up. Never lose data.

**Q: "What if backup is corrupted?"**
> AES-256-GCM verifies integrity. Checksum validation. Keep 30 backups (can restore older version).

**Q: "What if database crashes?"**
> Backups stored in separate system. Can restore from backup to new database. Audit logs show what happened.

**Q: "What if someone hacks account?"**
> Activity logs show all actions. Can audit who accessed what. Backups encrypted separately. Can investigate + restore.

---

## **Security Questions - Quick Answers:**

**Q: "How do you prevent SQL injection?"**
> Use Mongoose (parameterized queries, not string concat). Plus express-mongo-sanitize middleware.

**Q: "How do you prevent password guessing?"**
> Account lockout after 5 failed attempts. Rate limiting 100 req/15min. Bcrypt hash (slow, resistant to cracking).

**Q: "How do you prevent DoS attacks?"**
> Rate limiting per user + IP. Helmet headers. Request validation. Timeout on slow connections.

**Q: "How do you prevent cross-site attacks?"**
> CORS whitelist (8 trusted origins only). CSP headers. JWT tokens (no cookies).

**Q: "What if admin password is weak?"**
> Bcrypt hashing so even weak passwords are hard to crack. JWT expiry (force re-auth). Account lockout kicks in.

---

## **Numbers to Know:**

```
🎯 FEATURES:
   • 50+ API endpoints
   • 7 major feature areas
   • 25+ user management
   • 15+ machinery types

⚡ PERFORMANCE:
   • <200ms avg response time
   • 99%+ file upload success
   • 4-10 minutes backup time
   • 75% compression ratio

🔐 SECURITY:
   • AES-256-GCM encryption
   • 1 hour JWT expiry
   • 100 requests/15 min rate limit
   • 5 failed login = lockout
   
💾 RELIABILITY:
   • 30 backups kept
   • 99.99% uptime (GCP SLA)
   • Daily automated backups
   • Zero data loss design
```

---

## **Comparison Matrix (For Alternative Questions):**

```
NODE.JS vs PYTHON (Django/Flask)
✅ Node.js WINS for:
   • Concurrent connections (non-blocking I/O)
   • Real-time operations
   • Single language stack
   • Smaller memory footprint
   
❌ Python WINS for:
   • CPU-intensive tasks
   • Data science features
   • Rapid prototyping
   • More mature frameworks

✓ chose Node.js → correct for file-heavy concurrent app


GCP vs AWS vs AZURE
✅ GCP WINS for:
   • Resumable upload API (perfect for our use case)
   • Better pricing per GB
   • Excellent compression
   • International regions
   
❌ Others are good but:
   • More expensive
   • More complex setup
   • Overkill features we don't need

✓ chose GCP → right choice


MONGODB vs PostgreSQL
✅ MongoDB WINS for:
   • Flexible schema (machinery configs vary)
   • Document-based (natural fit)
   • Faster for this data shape
   
❌ PostgreSQL WINS for:
   • Complex transactions
   • Structured data
   • Stricter validation
   
✓ chose MongoDB → good fit but could justify PostgreSQL
```

---

## **Demo Flow (If They Ask for Demo):**

```
1️⃣ SHOW: Dashboard
   → Overview stats (users, machines, files)
   → Machinery list with tags
   → Quick metrics

2️⃣ SHOW: File Management
   → Upload new machinery file
   → Show encryption + compression
   → Download with password protection

3️⃣ SHOW: Backup System
   → Backup history (30 backups)
   → Latest backup details
   → Download backup (signed URL expires in 1 hour)

4️⃣ SHOW: Security
   → Activity log (who did what)
   → Security log (threats, IPs blocked)
   → Failed login attempts

5️⃣ MENTION: API Testing
   → Show Postman collection
   → Rate limiting in action
   → JWT token refresh flow
```

---

## **Common Mistakes to Avoid:**

❌ **DON'T SAY:**
- "I used Node.js because it's the fastest" (not always true)
- "It's infinitely scalable" (nothing is, have limits)
- "It's unhackable" (no system is 100% secure)
- "I invented the backup concept" (don't overstate)
- "I used 15 different technologies" (overengineered?)

✅ **INSTEAD SAY:**
- "Node.js suited our concurrent file upload pattern"
- "Scales to handle growth without redesign"
- "Implemented defense-in-depth security"
- "Followed industry best practices"
- "Intentionally chose minimal, proven tech stack"

---

## **If They Ask: "What Would You Do Differently?"**

**GOOD ANSWER:**
"If rebuilding at 10x scale, I'd add:
1. **Redis** - cache tokens, rate limit state
2. **RabbitMQ** - async job queue for backups
3. **Elasticsearch** - search in large archives
4. **Cloudflare CDN** - serve files faster globally
5. **Prometheus + Grafana** - monitoring/alerting

But would NOT change:
- Core architecture (still solid)
- Node.js + Express (perfect fit)
- MongoDB (flexible schema still needed)
- GCP (no vendor lock-in issues)

Principle: **Don't over-engineer for hypothetical scale. Build for today's needs, but design for tomorrow's growth.**"

---

## **Power Phrases to Use:**

- "**Following security best practices...**"
- "**From an operational perspective...**"
- "**Thinking about fault tolerance...**"
- "**At scale, this approach would...**"
- "**Trade-off between X and Y...**"
- "**Production-grade implementation**"
- "**Defense-in-depth security**"
- "**Graceful degradation**"
- "**Single point of failure**"
- "**Horizontal scalability**"

---

## **Practice This 3X Before Interview!**

1. **Minute 1-2:** What problem it solves + who uses it
2. **Minute 3-4:** Top 3 features + technology stack
3. **Minute 5-7:** Fault tolerance (your strength!)
4. **Minute 8-9:** Security (prove you know this)
5. **Minute 10+:** Answer specific questions

---

## **Interview Day Checklist:**

✅ Explain problem first, then solution  
✅ Mention production concerns (not just features)  
✅ Talk about monitoring & operations  
✅ Show you think about security  
✅ Reference audit logs & compliance  
✅ Mention testing procedures  
✅ Use numbers (99%, <200ms, AES-256)  
✅ Ask clarifying questions if confused  
✅ Admit unknowns (better than guessing)  
✅ Smile & talk with confidence!

---

**Remember:** They want to know if you can build production systems, not just write code. Focus on reliability, security, and thinking like an operator. 🚀
