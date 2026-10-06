import 'dotenv/config';

function integerFromEnv(name, fallback) {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isNaN(value) ? fallback : value;
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: integerFromEnv('PORT', 3000),
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',

  DB_HOST: process.env.DB_HOST ?? '127.0.0.1',
  DB_PORT: integerFromEnv('DB_PORT', 3306),
  DB_USER: process.env.DB_USER ?? 'root',
  DB_PASSWORD: process.env.DB_PASSWORD ?? '',
  DB_NAME: process.env.DB_NAME ?? 'db_ProService',
  DB_CONNECTION_LIMIT: integerFromEnv('DB_CONNECTION_LIMIT', 10),

  JWT_SECRET:
    process.env.JWT_SECRET ??
    'chave-apenas-para-desenvolvimento-troque-em-producao-123456789',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '8h',
  BCRYPT_ROUNDS: integerFromEnv('BCRYPT_ROUNDS', 12),
});

if (env.NODE_ENV === 'production' && env.JWT_SECRET.includes('desenvolvimento')) {
  throw new Error('JWT_SECRET seguro é obrigatório em produção.');
}
