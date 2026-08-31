# Cinemate Load Testing & Benchmarking Guide

This guide provides step-by-step reproducible commands for executing all load tests, caching experiments, rate-limiting assertions, and AI search evaluations.

---

## 1. Prerequisites

Ensure the backend server is running on port 5000:
```bash
# Terminal 1: Start Backend Server
cd server
npm start
```

---

## 2. Load Testing & Experiment Scripts

### 2.1 Redis Caching & Latency Speedup Experiment
Runs a controlled comparison between Cache MISS (Cold fetch) and Cache HIT (Warm Redis fetch) over 50 requests:
```bash
node tests/load/search-cache-benchmark.js
```
**What it measures:**
- Cold vs Warm Average Latency
- P50, P90, P95, P99 Percentiles
- Latency Speedup Factor (~400x)

---

### 2.2 Sliding-Window Rate Limiting Enforcement Test
Fires 25 burst requests against the AI Semantic Search endpoint (quota: 20 req/min) to assert HTTP 429 generation:
```bash
node tests/load/rate-limit-test.js
```
**What it verifies:**
- `X-RateLimit-Limit` & `X-RateLimit-Remaining` header decrementing
- HTTP `429 Too Many Requests` generation on request #21+
- `Retry-After: 60` response header compliance

---

### 2.3 Hybrid Recommendation Engine Concurrency Test
Fires 50 simultaneous requests against `/api/recommendations` with explainability computation:
```bash
node tests/load/recommendation-benchmark.js
```
**What it measures:**
- Concurrency throughput
- P50, P95, P99 Latencies
- Explainability generation time

---

### 2.4 AI Semantic Search vs Keyword Retrieval Evaluation
Runs 25 ground-truth evaluation queries against lexical keyword search and pgvector semantic search:
```bash
node evaluation/evaluate-search.js
```
**What it measures:**
- Precision@5 & Precision@10
- Recall@10
- Mean Reciprocal Rank (MRR)

---

## 3. Package.json Convenience Commands

You can also run all load tests via npm scripts in `package.json`:
```bash
npm run benchmark:cache       # Runs Redis caching latency benchmark
npm run benchmark:ratelimit   # Runs Rate limit assertion test
npm run benchmark:recs        # Runs Recommendation concurrency benchmark
npm run benchmark:ai          # Runs AI search Information Retrieval evaluation
```
