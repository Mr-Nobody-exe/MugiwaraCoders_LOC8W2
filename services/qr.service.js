import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { getRedis } from '../config/redis.js';
import QRToken from '../models/QRToken.js';

export const QR_TYPES = ['entry', 'breakfast', 'lunch', 'dinner'];

export const generateQRsForStudent = async (userId, eventId) => {
  const redis = getRedis();
  const results = [];

  for (const type of QR_TYPES) {
    const token = uuidv4();
    const expiresAt = new Date();

    if (type === 'entry') {
      expiresAt.setHours(expiresAt.getHours() + Number(process.env.QR_ENTRY_EXPIRY_HOURS || 24));
    } else {
      expiresAt.setHours(expiresAt.getHours() + Number(process.env.QR_MEAL_EXPIRY_HOURS || 12));
    }

    // Upsert in MongoDB (persistent record)
    await QRToken.findOneAndUpdate(
      { user: userId, event: eventId, type },
      { token, isUsed: false, expiresAt },
      { upsert: true, new: true }
    );

    // Cache in Redis with TTL
    const ttl = Math.floor((expiresAt - Date.now()) / 1000);
    await redis.setEx(`qr:${token}`, ttl, JSON.stringify({
      userId: userId.toString(),
      eventId: eventId.toString(),
      type,
      used: false,
    }));

    const qrDataUrl = await QRCode.toDataURL(token, { errorCorrectionLevel: 'H' });
    results.push({ type, token, qrDataUrl, expiresAt });
  }

  return results;
};

export const validateQR = async (token) => {
  const redis = getRedis();
  const cacheKey = `qr:${token}`;

  const cached = await redis.get(cacheKey);
  if (!cached) return { valid: false, reason: 'QR expired or not found' };

  const data = JSON.parse(cached);
  if (data.used) return { valid: false, reason: 'QR already used' };

  // Mark used in Redis
  data.used = true;
  const ttl = await redis.ttl(cacheKey);
  await redis.setEx(cacheKey, ttl > 0 ? ttl : 60, JSON.stringify(data));

  // Persist to MongoDB
  await QRToken.findOneAndUpdate({ token }, { isUsed: true, usedAt: new Date() });

  return { valid: true, data };
};