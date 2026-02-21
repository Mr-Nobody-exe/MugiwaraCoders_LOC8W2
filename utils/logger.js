// Lightweight logger — zero dependencies, colorized, timestamped.
// Drop-in replacement interface matches winston/pino for easy upgrade later.

const LEVELS = {
  error: { label: 'ERROR', color: '\x1b[31m' },  // Red
  warn:  { label: 'WARN ', color: '\x1b[33m' },  // Yellow
  info:  { label: 'INFO ', color: '\x1b[36m' },  // Cyan
  debug: { label: 'DEBUG', color: '\x1b[90m' },  // Gray
};

const RESET = '\x1b[0m';
const IS_PROD = process.env.NODE_ENV === 'production';

const timestamp = () => new Date().toISOString();

const log = (level, message, meta) => {
  // Suppress debug logs in production
  if (IS_PROD && level === 'debug') return;

  const { label, color } = LEVELS[level];
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';

  if (IS_PROD) {
    // Production: plain JSON for log aggregators (Datadog, CloudWatch, Railway logs)
    process.stdout.write(
      JSON.stringify({ timestamp: timestamp(), level: label.trim(), message, ...meta }) + '\n'
    );
  } else {
    // Development: colorized, human-readable
    process.stdout.write(
      `${color}[${label}]${RESET} ${timestamp()} — ${message}${metaStr}\n`
    );
  }
};

const logger = {
  error: (message, meta) => log('error', message, meta),
  warn:  (message, meta) => log('warn',  message, meta),
  info:  (message, meta) => log('info',  message, meta),
  debug: (message, meta) => log('debug', message, meta),

  // Convenience: log an Error object with stack trace
  exception: (err, context = '') => {
    log('error', `${context ? context + ': ' : ''}${err.message}`, {
      stack: IS_PROD ? undefined : err.stack,
    });
  },
};

export default logger;