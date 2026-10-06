import { AppError } from '../utils/AppError.js';

export function authorize(...roles) {
  return function roleMiddleware(req, _res, next) {
    if (!req.user) {
      return next(
        new AppError('Autenticação necessária.', 401, 'AUTH_REQUIRED'),
      );
    }

    if (!roles.includes(req.user.tipo)) {
      return next(
        new AppError(
          'Você não possui permissão para executar esta ação.',
          403,
          'FORBIDDEN',
        ),
      );
    }

    return next();
  };
}
