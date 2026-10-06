import { z } from 'zod';

const phoneRegex = /^[0-9()+\-\s]{8,20}$/;

export const registerSchema = z.object({
  body: z.object({
    nome: z.string().trim().min(3, 'Informe o nome completo.').max(120),
    email: z.string().trim().toLowerCase().email('E-mail inválido.').max(180),
    telefone: z
      .string()
      .trim()
      .regex(phoneRegex, 'Telefone inválido.')
      .optional()
      .nullable(),
    senha: z
      .string()
      .min(8, 'A senha deve possuir pelo menos 8 caracteres.')
      .max(72),
    tipo: z.enum(['CLIENTE', 'PRESTADOR']),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email('E-mail inválido.'),
    senha: z.string().min(1, 'Informe a senha.'),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});
