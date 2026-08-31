/**
 * Cinemate Redis Caching & Request Coalescing Benchmark (Phase 12, 13)
 * Measures real latency profiles: Cold Fetch (Cache MISS) vs Warm Fetch (Cache HIT)
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'cinemate-admin-secret';

function calculatePercentiles(samples) {
  if (!samples || samples.length === 0) {
    return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p95: 0, p99: 0 };
  }
  const sorted = [...samples].sort((a, b) => a - b);
  const getP = (p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    avg: Math.round((sum / sorted.length) * 100) / 100,
    p50: Math.round(getP(50) * 100) / 100,
    p90: Math.round(getP(90) * 100) / 100,
    p95: Math.round(getP(95) * 100) / 100,
    p99: Math.round(getP(99) * 100) / 100,
  };
}

async function runCacheBenchmark() {
  console.log('========================================================================');
  console.log('🚀 CINEMATE CONTROLLED REDIS CACHING LATENCY EXPERIMENT');
  console.log('========================================================================\n');

  const testQueries = ['interstellar', 'batman', 'inception', 'avatar', 'matrix'];

  // 1. Experiment A: Cold Fetch (Cache Purged)
  console.log('🧹 Purging Cache for Experiment A (Cold Fetch / Baseline)...');
  await fetch(`${API_BASE}/admin/demo/clear-cache`, {
    method: 'POST',
    headers: { 'x-admin-key': ADMIN_SECRET },
  });

  const coldLatencies = [];
  console.log('📊 Executing Cold Fetch Requests (Simulating fresh traffic)...');
  for (const q of testQueries) {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/movies/search?query=${q}`);
      const duration = performance.now() - start;
      if (res.ok) {
        coldLatencies.push(duration);
        console.log(`   - Cold Fetch [${q}]: ${Math.round(duration)}ms (CACHE MISS)`);
      }
    } catch (err) {
      console.error(`Cold request ${q} failed:`, err.message);
    }
  }

  // 2. Experiment B: Warm Fetch (Cached)
  console.log('\n⚡ Executing 50 Warm Fetch Requests (Simulating cached traffic)...');
  const warmLatencies = [];
  for (let i = 0; i < 50; i++) {
    const q = testQueries[i % testQueries.length];
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/movies/search?query=${q}`);
      const duration = performance.now() - start;
      if (res.ok) warmLatencies.push(duration);
    } catch (err) {
      console.error(`Warm request ${i} failed:`, err.message);
    }
  }

  const coldStats = calculatePercentiles(coldLatencies);
  const warmStats = calculatePercentiles(warmLatencies);
  const speedup = (coldStats.avg / Math.max(0.1, warmStats.avg)).toFixed(1);

  console.log('\n========================================================================');
  console.log('📈 EMPIRICAL BENCHMARK MEASUREMENTS');
  console.log('========================================================================\n');

  console.log('| Metric           | Cold Fetch (Cache MISS / Raw TMDB) | Warm Fetch (Cache HIT / Redis) | Speedup Factor |');
  console.log('|------------------|------------------------------------|--------------------------------|----------------|');
  console.log(`| Requests Tested  | ${coldLatencies.length}                                  | ${warmLatencies.length}                             | 10x Ratio      |`);
  console.log(`| Avg Latency      | ${coldStats.avg} ms                          | ${warmStats.avg} ms                            | ${speedup}x faster    |`);
  console.log(`| P50 (Median)     | ${coldStats.p50} ms                          | ${warmStats.p50} ms                            | ${(coldStats.p50 / Math.max(0.1, warmStats.p50)).toFixed(1)}x faster    |`);
  console.log(`| P95 Latency      | ${coldStats.p95} ms                          | ${warmStats.p95} ms                            | ${(coldStats.p95 / Math.max(0.1, warmStats.p95)).toFixed(1)}x faster    |`);
  console.log(`| P99 Latency      | ${coldStats.p99} ms                          | ${warmStats.p99} ms                            | ${(coldStats.p99 / Math.max(0.1, warmStats.p99)).toFixed(1)}x faster    |`);
  console.log(`| Min Latency      | ${coldStats.min} ms                           | ${warmStats.min} ms                             | Instantaneous  |`);

  console.log('\n========================================================================');
  console.log(`🏆 Conclusion: Redis caching achieves ${speedup}x latency reduction.`);
  console.log('========================================================================\n');

  return { coldStats, warmStats, speedup };
}

if (require.main === module) {
  runCacheBenchmark();
}

module.exports = { runCacheBenchmark };
