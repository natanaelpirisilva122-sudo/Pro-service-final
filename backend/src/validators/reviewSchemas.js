import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    servicoId: z.coerce.number().int().positive(),
    nota: z.coerce.number().int().min(1).max(5),
    comentario: z.string().trim().max(1000).optional().nullable(),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});
