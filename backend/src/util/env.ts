import 'dotenv/config';

export const env = {
  PORT: parseInt(process.env.BACKEND_PORT || '8080', 10),
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/otsec',
  WS_PATH: process.env.WS_PATH || '/live',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

