import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';

import { checkDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { requestId } from './middlewares/requestId.js';
import { apiRoutes } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openApiPath = path.resolve(__dirname, '../docs/openapi.yaml');
const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));

export const app = express();

app.disable('x-powered-by');
app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL.split(',').map((url) => url.trim()),
    credentials: false,
  }),
);
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/health', async (_req, res) => {
  try { await checkDatabaseConnection(); res.json({status:'ok', banco:'conectado', sistema:'Pro Service API', versao:'2.0.0'}); }
  catch { res.status(503).json({status:'indisponivel', banco:'sem conexao'}); }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use('/api/v1', apiRoutes);

app.use(notFound);
app.use(errorHandler);
