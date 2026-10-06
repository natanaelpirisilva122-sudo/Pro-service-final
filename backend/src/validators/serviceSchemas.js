import { z } from 'zod';

export const createServiceSchema = z.object({
  body: z.object({
    prestadorId: z.coerce.number().int().positive(),
    titulo: z.string().trim().min(3).max(150),
    descricao: z.string().trim().min(10).max(2000),
    categoria: z.string().trim().min(2).max(100),
    endereco: z.string().trim().min(5).max(255),
    cidade: z.string().trim().min(2).max(100),
    uf: z.string().trim().toUpperCase().length(2),
    valorCombinado: z.coerce.number().min(0).max(999999).optional().nullable(),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACEITO', 'CONCLUIDO', 'CANCELADO']),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  query: z.any().optional(),
});

export const listServicesSchema = z.object({
  body: z.any().optional(),
  params: z.any().optional(),
  query: z.object({
    status: z
      .enum(['PENDENTE', 'ACEITO', 'CONCLUIDO', 'CANCELADO'])
      .optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
