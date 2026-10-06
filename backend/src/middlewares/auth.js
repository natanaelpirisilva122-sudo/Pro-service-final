import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';

export function authenticate(req, _res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return next(
      new AppError(
        'Token de autenticação não informado.',
        401,
        'AUTH_TOKEN_REQUIRED',
      ),
    );
  }

  const token = authorization.slice('Bearer '.length).trim();

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: Number(payload.sub),
      tipo: payload.role,
      nome: payload.nome,
    };
    return next();
  } catch {
    return next(
      new AppError('Token inválido ou expirado.', 401, 'AUTH_TOKEN_INVALID'),
    );
  }
}
