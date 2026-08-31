# Cinemate REST API Specification

Base URL: `http://localhost:5000/api`

---

## 1. System & Telemetry

### 1.1 Health Check
- **Endpoint**: `GET /health`
- **Auth**: None
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2026-08-31T12:56:22.431Z",
  "uptime": 276.78,
  "services": {
    "database": "connected",
    "redis": "connected",
    "tmdb": "operational",
    "workers": "active"
  }
}
```

### 1.2 Performance & Telemetry Metrics
- **Endpoint**: `GET /metrics`
- **Auth**: None
- **Response**: `200 OK`
```json
{
  "timestamp": "2026-08-31T12:56:22.431Z",
  "uptimeSeconds": 276.78,
  "caching": {
    "hits": 142,
    "misses": 23,
    "sets": 23,
    "totalRequests": 165,
    "hitRate": "86.06%",
    "storage": "Redis",
    "configuredTTLs": {
      "SEARCH": 300,
      "DETAILS": 1800,
      "POPULAR": 1800
    }
  },
  "requestDeduplication": {
    "activeInFlightRequests": 0,
    "totalDeduplicatedRequests": 19
  }
}
```

---

## 2. Movies API

### 2.1 Get Now Playing Movies
- **Endpoint**: `GET /movies/now-playing?page=1`
- **Rate Limit**: 120 req/min
- **Cache TTL**: 15 minutes
- **Response**: `200 OK`
```json
{
  "success": true,
  "page": 1,
  "results": [
    {
      "id": 1368337,
      "title": "The Odyssey",
      "poster_path": "/...",
      "vote_average": 7.9,
      "release_date": "2026-07-15"
    }
  ],
  "total_pages": 42,
  "total_results": 840
}
```

### 2.2 Get Popular Movies
- **Endpoint**: `GET /movies/popular?page=1`
- **Rate Limit**: 120 req/min
- **Cache TTL**: 30 minutes

### 2.3 Get Top Rated Movies
- **Endpoint**: `GET /movies/top-rated?page=1`
- **Rate Limit**: 120 req/min
- **Cache TTL**: 15 minutes

### 2.4 Get Trending Movies
- **Endpoint**: `GET /movies/trending?timeWindow=day&page=1`
- **Rate Limit**: 120 req/min
- **Cache TTL**: 10 minutes

### 2.5 Multi-Filter Keyword Search
- **Endpoint**: `GET /movies/search?query=interstellar&page=1&year=2014&rating=8&genre=878`
- **Rate Limit**: 60 req/min
- **Cache TTL**: 5 minutes
- **Response**: `200 OK`

### 2.6 Movie Details & Sub-resources
- **Endpoint**: `GET /movies/:id` (Details, TTL: 30m)
- **Endpoint**: `GET /movies/:id/credits` (Cast & Crew, TTL: 30m)
- **Endpoint**: `GET /movies/:id/videos` (YouTube Trailer Keys, TTL: 30m)
- **Endpoint**: `GET /movies/:id/recommendations` (Similar titles, TTL: 15m)

---

## 3. AI Semantic Vector Search

### 3.1 Natural Language Semantic Search
- **Endpoint**: `GET /search/semantic?q=dark+psychological+thriller+with+plot+twist&limit=15`
- **Rate Limit**: 20 req/min
- **Response**: `200 OK`
```json
{
  "success": true,
  "query": "dark psychological thriller with plot twist",
  "count": 15,
  "results": [
    {
      "id": 550,
      "title": "Fight Club",
      "overview": "An insomniac office worker...",
      "poster_path": "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      "vote_average": 8.4,
      "similarityScore": 0.8942,
      "matchPercentage": 89
    }
  ]
}
```

---

## 4. Personalized Recommendations & Explainability

### 4.1 Get Personalized Hybrid Recommendations
- **Endpoint**: `GET /recommendations?limit=12`
- **Headers**: `x-user-id: <user_id>` or `Authorization: Bearer <clerk_jwt>`
- **Rate Limit**: 20 req/min
- **Response**: `200 OK`
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 157336,
      "title": "Interstellar",
      "matchScore": 0.942,
      "matchPercentage": 94,
      "recommendationReason": "Because you liked 'The Odyssey' and frequently watch Sci-Fi movies"
    }
  ],
  "weights": {
    "semanticSimilarity": 0.35,
    "genreAffinity": 0.25,
    "ratingQuality": 0.20,
    "popularity": 0.10,
    "historyPenalty": 0.10
  }
}
```

---

## 5. Favorites API

### 5.1 List Favorites
- **Endpoint**: `GET /favorites`
- **Headers**: `x-user-id: <user_id>`

### 5.2 Add Favorite
- **Endpoint**: `POST /favorites`
- **Body**: `{ "id": 157336, "title": "Interstellar", "poster_path": "/..." }`
- **Response**: `201 Created`

### 5.3 Remove Favorite
- **Endpoint**: `DELETE /favorites/:movieId`
- **Response**: `200 OK`

---

## 6. Background Jobs API

### 6.1 View Queue Metrics
- **Endpoint**: `GET /jobs/metrics`

### 6.2 Trigger Background Ingestion
- **Endpoint**: `POST /jobs/ingest`
- **Body**: `{ "category": "popular", "page": 1 }`
- **Response**: `202 Accepted`
