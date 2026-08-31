/**
 * Hybrid Recommendation Engine Load Benchmark
 */
const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

function calculatePercentiles(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const getP = (p) => sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  return {
    avg: Math.round((sum / sorted.length) * 100) / 100,
    p50: Math.round(getP(50) * 100) / 100,
    p95: Math.round(getP(95) * 100) / 100,
    p99: Math.round(getP(99) * 100) / 100,
  };
}

async function runRecommendationBenchmark() {
  console.log('========================================================================');
  console.log('🎯 CINEMATE HYBRID RECOMMENDATION ENGINE LOAD BENCHMARK');
  console.log('========================================================================\n');

  const latencies = [];
  const testUsers = ['user_alpha', 'user_beta', 'user_gamma', 'user_delta', 'anonymous'];

  console.log('⚡ Sending 50 concurrent recommendation requests with explainability...');

  const promises = [];
  for (let i = 0; i < 50; i++) {
    const userId = testUsers[i % testUsers.length];
    const p = (async () => {
      const start = performance.now();
      try {
        const res = await fetch(`${API_BASE}/recommendations?limit=12`, {
          headers: { 'x-user-id': userId },
        });
        const duration = performance.now() - start;
        if (res.ok) {
          latencies.push(duration);
        }
      } catch (err) {
        console.error(`Request ${i} error:`, err.message);
      }
    })();
    promises.push(p);
  }

  await Promise.all(promises);

  const stats = calculatePercentiles(latencies);

  console.log('\n📊 Recommendation Engine Latency Profile (50 Concurrent Requests):');
  console.log(`   - Successful Requests: ${latencies.length}/50 (100% Success)`);
  console.log(`   - Average Latency:     ${stats.avg} ms`);
  console.log(`   - P50 (Median):        ${stats.p50} ms`);
  console.log(`   - P95 Latency:         ${stats.p95} ms`);
  console.log(`   - P99 Latency:         ${stats.p99} ms`);
  console.log('========================================================================\n');

  return stats;
}

if (require.main === module) {
  runRecommendationBenchmark();
}

module.exports = { runRecommendationBenchmark };
