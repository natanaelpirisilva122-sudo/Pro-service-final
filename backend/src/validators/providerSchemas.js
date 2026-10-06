import { z } from 'zod';

export const updateProviderProfileSchema = z.object({
  body: z
    .object({
      descricao: z.string().trim().max(1000).optional().nullable(),
      cidade: z.string().trim().min(2).max(100).optional().nullable(),
      uf: z
        .string()
        .trim()
        .toUpperCase()
        .length(2, 'UF deve possuir 2 caracteres.')
        .optional()
        .nullable(),
      precoHora: z.coerce.number().min(0).max(999999).optional().nullable(),
      anosExperiencia: z.coerce.number().int().min(0).max(80).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Informe ao menos um campo para atualização.',
    }),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const addSkillSchema = z.object({
  body: z.object({
    habilidadeId: z.coerce.number().int().positive(),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const providerSearchSchema = z.object({
  body: z.any().optional(),
  params: z.any().optional(),
  query: z.object({
    q: z.string().trim().max(120).optional(),
    habilidade: z.string().trim().max(100).optional(),
    cidade: z.string().trim().max(100).optional(),
    uf: z.string().trim().toUpperCase().length(2).optional(),
    precoMax: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
