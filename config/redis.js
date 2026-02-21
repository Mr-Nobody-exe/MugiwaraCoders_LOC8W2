import { createClient } from 'redis';

let client;

export const connectRedis = async () => {
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  console.log('✅ Redis connected');
};

export const getRedis = () => {
  if (!client) throw new Error('Redis not connected');
  return client;
};