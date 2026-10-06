import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, _next) {
  let error = err;

  if (err?.code === 'ER_DUP_ENTRY') {
    error = new AppError(
      'Já existe um registro com um dado que precisa ser único.',
      409,
      'DUPLICATE_RECORD',
    );
  }

  if (err?.code === 'ER_NO_REFERENCED_ROW_2') {
    error = new AppError(
      'Um dos registros relacionados não existe.',
      409,
      'REFERENTIAL_INTEGRITY_ERROR',
    );
  }

  const statusCode = error.statusCode ?? 500;
  const isOperational = error instanceof AppError;

  const payload = {
    erro: {
      codigo: error.code ?? 'INTERNAL_SERVER_ERROR',
      mensagem:
        statusCode === 500 && !isOperational
          ? 'Ocorreu um erro interno no servidor.'
          : error.message,
      detalhes: error.details,
      requestId: req.id,
    },
  };

  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    payload.erro.debug = error.stack;
  }

  if (statusCode >= 500) {
    console.error('[ERRO]', {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      error: err,
    });
  }

  res.status(statusCode).json(payload);
}
