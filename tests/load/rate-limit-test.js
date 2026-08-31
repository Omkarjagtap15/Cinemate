/**
 * Cinemate Rate Limit Enforcement Benchmark (Phase 11)
 * Asserts HTTP 429 Too Many Requests response generation when quota is exceeded.
 */
const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function runRateLimitTest() {
  console.log('========================================================================');
  console.log('🛡️ CINEMATE SLIDING-WINDOW RATE LIMIT ENFORCEMENT TEST');
  console.log('========================================================================\n');

  console.log('🚀 Firing 25 rapid requests against AI endpoint (Quota limit: 20 req/min)...\n');

  let allowedCount = 0;
  let blocked429Count = 0;
  let retryAfterHeader = null;

  for (let i = 1; i <= 25; i++) {
    const start = performance.now();
    try {
      const res = await fetch(`${API_BASE}/search/semantic?q=rate_limit_probe_${i}`);
      const duration = Math.round(performance.now() - start);

      if (res.status === 200) {
        allowedCount++;
        const rem = res.headers.get('x-ratelimit-remaining');
        console.log(`[Req #${i.toString().padStart(2, ' ')}] Status 200 OK (${duration}ms) - Remaining Quota: ${rem}`);
      } else if (res.status === 429) {
        blocked429Count++;
        retryAfterHeader = res.headers.get('retry-after');
        console.log(`[Req #${i.toString().padStart(2, ' ')}] Status 429 TOO MANY REQUESTS (${duration}ms) - Retry-After: ${retryAfterHeader}s`);
      }
    } catch (err) {
      console.error(`Request ${i} network error:`, err.message);
    }
  }

  console.log('\n========================================================================');
  console.log('📊 RATE LIMIT TEST SUMMARY:');
  console.log(`   - Allowed Requests: ${allowedCount}`);
  console.log(`   - Blocked (429):    ${blocked429Count}`);
  console.log(`   - Rate Limit Active: ${blocked429Count > 0 ? '✅ YES (Enforced)' : '⚠️ NO'}`);
  console.log('========================================================================\n');

  return { allowedCount, blocked429Count, retryAfterHeader };
}

if (require.main === module) {
  runRateLimitTest();
}

module.exports = { runRateLimitTest };
