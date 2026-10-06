import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    erro: {
      codigo: 'RATE_LIMITED',
      mensagem:
        'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.',
    },
  },
});
