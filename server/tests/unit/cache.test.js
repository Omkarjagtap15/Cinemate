const { cacheService } = require('../../src/services/cache.service');
const singleFlight = require('../../src/services/singleFlight.service');

describe('Caching & Request Deduplication (Single-Flight)', () => {
  test('generateSearchKey creates deterministic lowercase key with sorted filters', () => {
    const key1 = cacheService.generateSearchKey('Batman ', 1, { genre: '28', year: '2022' });
    const key2 = cacheService.generateSearchKey('batman', 1, { year: '2022', genre: '28' });
    expect(key1).toBe(key2);
    expect(key1).toBe('movie:search:batman:1:genre:28|year:2022');
  });

  test('generateDetailKey generates correct standard key', () => {
    const key = cacheService.generateDetailKey(157336);
    expect(key).toBe('movie:details:157336');
  });

  test('Single-Flight coalesces concurrent executions into a single Promise', async () => {
    let executionCount = 0;
    const expensiveOperation = async () => {
      executionCount++;
      await new Promise((r) => setTimeout(r, 50));
      return { payload: 'success' };
    };

    const results = await Promise.all([
      singleFlight.do('test-key', expensiveOperation),
      singleFlight.do('test-key', expensiveOperation),
      singleFlight.do('test-key', expensiveOperation),
    ]);

    expect(results.length).toBe(3);
    expect(results[0].payload).toBe('success');
    expect(executionCount).toBe(1); // Only 1 execution instead of 3!
  });
});
