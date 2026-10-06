import { AppError } from '../utils/AppError.js';

export function notFound(req, _res, next) {
  next(
    new AppError(
      `Rota não encontrada: ${req.method} ${req.originalUrl}`,
      404,
      'ROUTE_NOT_FOUND',
    ),
  );
}
