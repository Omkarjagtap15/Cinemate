const config = require('../config/env');
const logger = require('../utils/logger');
const { isRedisConnected } = require('../config/redis');

let Queue, Worker, QueueEvents;
try {
  const bullmq = require('bullmq');
  Queue = bullmq.Queue;
  Worker = bullmq.Worker;
  QueueEvents = bullmq.QueueEvents;
} catch (e) {
  logger.warn('BullMQ import deferred.');
}

// Redis connection options for BullMQ
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

// In-memory fallback queue for local development without active Redis instance
class MemoryQueue {
  constructor(name) {
    this.name = name;
    this.jobs = [];
    this.completed = 0;
    this.failed = 0;
    this.handlers = [];
  }

  async add(name, data, opts = {}) {
    const job = {
      id: `${this.name}_${Date.now()}_${Math.random()}`,
      name,
      data,
      opts,
      timestamp: Date.now(),
      status: 'pending',
    };
    this.jobs.push(job);
    logger.info(`[Queue: ${this.name}] Job queued: ${name} (ID: ${job.id})`);

    // Process asynchronously
    setTimeout(async () => {
      for (const handler of this.handlers) {
        try {
          job.status = 'active';
          const result = await handler(job);
          job.status = 'completed';
          job.returnvalue = result;
          this.completed++;
          logger.info(`[Worker: ${this.name}] Job ${job.id} completed successfully.`);
        } catch (err) {
          job.status = 'failed';
          job.failedReason = err.message;
          this.failed++;
          logger.error(`[Worker: ${this.name}] Job ${job.id} failed:`, { error: err.message });
        }
      }
    }, 100);

    return job;
  }

  process(handler) {
    this.handlers.push(handler);
  }

  async getMetrics() {
    return {
      name: this.name,
      active: this.jobs.filter((j) => j.status === 'active').length,
      waiting: this.jobs.filter((j) => j.status === 'pending').length,
      completed: this.completed,
      failed: this.failed,
      type: 'in-memory-queue',
    };
  }
}

// Queues instances
let ingestionQueue, embeddingQueue, recommendationQueue;

if (isRedisConnected() && Queue) {
  try {
    ingestionQueue = new Queue('movie-ingestion', { connection: redisConnection });
    embeddingQueue = new Queue('embedding-generation', { connection: redisConnection });
    recommendationQueue = new Queue('recommendation-refresh', { connection: redisConnection });
    logger.info('📦 BullMQ Queues initialized with Redis.');
  } catch (err) {
    logger.warn('Failed to initialize Redis BullMQ, using memory queues:', { error: err.message });
    ingestionQueue = new MemoryQueue('movie-ingestion');
    embeddingQueue = new MemoryQueue('embedding-generation');
    recommendationQueue = new MemoryQueue('recommendation-refresh');
  }
} else {
  ingestionQueue = new MemoryQueue('movie-ingestion');
  embeddingQueue = new MemoryQueue('embedding-generation');
  recommendationQueue = new MemoryQueue('recommendation-refresh');
  logger.info('📦 Memory-backed job queues initialized.');
}

module.exports = {
  ingestionQueue,
  embeddingQueue,
  recommendationQueue,
  redisConnection,
  Worker,
  getQueueMetrics: async () => {
    return {
      ingestion: await ingestionQueue.getMetrics?.() || { name: 'movie-ingestion' },
      embedding: await embeddingQueue.getMetrics?.() || { name: 'embedding-generation' },
      recommendation: await recommendationQueue.getMetrics?.() || { name: 'recommendation-refresh' },
    };
  },
};
