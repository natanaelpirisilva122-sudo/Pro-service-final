import { AppError } from '../utils/AppError.js';

export function validate(schema) {
  return function validationMiddleware(req, _res, next) {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensagem: issue.message,
      }));

      return next(
        new AppError(
          'Existem dados inválidos na requisição.',
          400,
          'VALIDATION_ERROR',
          details,
        ),
      );
    }

    req.validated = result.data;
    return next();
  };
}
