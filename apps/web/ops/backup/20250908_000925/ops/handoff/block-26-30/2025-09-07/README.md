# Blocks 26–30 Recap (Runtime & UX)

**Done**
- \/api/health\ endpoint with rate-limit headers and audit logging.
- Security headers via \middleware.ts\ (CSP, frame, content type, referrer, permissions).
- Naive in-memory rate limiter (\src/lib/ratelimit.ts\).
- UX pages: \src/app/not-found.tsx\, \src/app/error.tsx\.
- Audit logger (\src/lib/audit.ts\) -> \ops/logs/audit.ndjson\.

**Verify**
Run: \.\verify-26-30.ps1\
