const request = require('supertest');
const app = require('../../src/app');

// Increase default timeout for integration tests dealing with external TMDB network calls
jest.setTimeout(15000);

describe('Cinemate REST API Integration Tests', () => {
  test('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services.tmdb).toBe('operational');
  });

  test('GET /api/metrics returns caching and queue telemetry', async () => {
    const res = await request(app).get('/api/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.body.overview).toBeDefined();
    expect(res.body.caching).toBeDefined();
    expect(res.body.api).toBeDefined();
    expect(res.body.tmdb).toBeDefined();
  });

  test('GET /api/movies/popular returns movie list with pagination', async () => {
    const res = await request(app).get('/api/movies/popular?page=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  test('Favorites CRUD flow: add, list, delete', async () => {
    const testMovie = {
      id: 999999,
      title: 'Unit Test Movie',
      poster_path: '/test.jpg',
    };

    // 1. Add favorite
    const addRes = await request(app)
      .post('/api/favorites')
      .set('x-user-id', 'test_jest_user')
      .send(testMovie);
    expect(addRes.statusCode).toBe(201);
    expect(addRes.body.success).toBe(true);

    // 2. Get favorites
    const getRes = await request(app)
      .get('/api/favorites')
      .set('x-user-id', 'test_jest_user');
    expect(getRes.statusCode).toBe(200);
    const found = getRes.body.data.some((m) => m.id === 999999);
    expect(found).toBe(true);

    // 3. Delete favorite
    const delRes = await request(app)
      .delete('/api/favorites/999999')
      .set('x-user-id', 'test_jest_user');
    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);
  });

  test('GET /api/search/semantic returns ranked vector results', async () => {
    const res = await request(app).get('/api/search/semantic?q=space');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
  });
});
