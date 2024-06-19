// lib/redis.js
import { env } from '@/env';
import Redis from 'ioredis';

// Use REDIS_URL from environment or fallback to localhost
const REDIS_URL = env.REDIS_URL;
const connection = new Redis(REDIS_URL);

export { connection };