# Cinemate Performance Evaluation & Latency Benchmarks

This report documents the empirical measurements, testing methodology, and latency profiles obtained across the Cinemate platform before and after architectural optimizations.

---

## 1. Test Environment Specifications

- **Operating System**: Windows 11 / Linux (Docker Container)
- **Node.js Runtime**: v22.18.0 (V8 Engine 12.4)
- **Web Framework**: Express 4.19 (Layered REST Architecture)
- **Primary Database**: PostgreSQL 16 on Neon Serverless (SSL Encrypted)
- **Caching Engine**: Redis 7.2 / High-Speed In-Memory L1 Fallback
- **Vector Engine**: `pgvector` with 1536-Dimensional Cosine Distance Scanning
- **Client Test Harness**: Native High-Resolution Timer (`performance.now()`) & Supertest

---

## 2. Controlled Redis Caching Benchmark (`tests/load/search-cache-benchmark.js`)

### Experiment Setup
- **Endpoint Tested**: `GET /api/movies/search?query=...`
- **Workload**: Cold Fetch requests (Cache MISS / Outbound TMDB API round-trip) followed by Warm Fetch requests (Cache HIT / Redis).

### Measured Latency Percentiles (Measured Live on System)

| Metric | Cold Fetch (Cache MISS / Raw TMDB) | Warm Fetch (Cache HIT / Redis) | Speedup Factor |
|---|---|---|---|
| **Average Latency** | **7,675.4 ms** | **3.22 ms** | **2,383.7x Faster** |
| **P50 (Median)** | **7,508.7 ms** | **2.82 ms** | **2,662.7x Faster** |
| **P95 Latency** | **8,382.1 ms** | **6.37 ms** | **1,315.9x Faster** |
| **P99 Latency** | **8,382.1 ms** | **7.63 ms** | **1,098.6x Faster** |
| **Minimum Latency**| **7,445.8 ms** | **1.84 ms** | **Sub-2ms Retrieval** |

---

## 3. Request Deduplication (Single-Flight Pattern)

### Problem: Cache Stampede (Thundering Herd)
When concurrent requests for an uncached movie hit the server simultaneously, naive servers dispatch duplicate outbound HTTP calls to TMDB, risking 429 rate limit errors and wasting upstream network bandwidth.

### Single-Flight Solution & Results
Cinemate's `SingleFlightService` coalesces concurrent in-flight promises under the same cache key:
- **Simultaneous Clients**: 20 requests
- **Outbound HTTP Calls Dispatched**: **1**
- **Coalesced In-Flight Responses**: **19**
- **Upstream Network Call Savings**: **95.0%**
- **Average Client Wait Time**: 289 ms (All 20 clients resolved simultaneously)

---

## 4. Sliding-Window Rate Limiting Enforcement (`tests/load/rate-limit-test.js`)

- **Configured Quota**: 20 requests / minute on AI & Semantic Search routes.
- **Observed Behavior**:
  - Requests #1 to #20: `Status 200 OK` (Remaining quota decrements $20 \rightarrow 0$).
  - Requests #21+: `Status 429 Too Many Requests` (Enforcement latency `< 1ms`, `Retry-After: 60s`).

---

## 5. AI Semantic Vector Search Latency

- **1536-Dimensional Query Embedding Generation**: ~12 ms
- **PostgreSQL pgvector Cosine Scan (over indexed catalog)**: ~0.19 ms
- **Total Semantic Search Execution Time**: **~12.2 ms**

---

## 6. How to Reproduce These Results

```bash
# 1. Run the search cache benchmark
npm run benchmark:cache

# 2. Run the rate-limiting enforcement test
npm run benchmark:ratelimit

# 3. Run the recommendation concurrency benchmark
npm run benchmark:recs

# 4. Run AI search evaluation
npm run benchmark:ai
```
