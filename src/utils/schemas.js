import { z } from 'zod';
import { normalizePlate } from '../lib/firestore';
import { plateRegex } from './constants';

const currentYear = new Date().getFullYear() + 1;

const dateSchema = z
  .string()
  .min(1, 'Informe uma data válida.')
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
    message: 'Informe uma data válida.',
  });

export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
  email: z.email('Informe um e-mail válido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export const vehicleSchema = z.object({
  nickname: z.string().trim().min(2, 'Informe um apelido para o veículo.'),
  brand: z.string().trim().min(2, 'Informe a marca.'),
  model: z.string().trim().min(2, 'Informe o modelo.'),
  year: z.coerce
    .number({ message: 'Informe um ano válido.' })
    .int('Informe um ano válido.')
    .min(1900, 'Informe um ano válido.')
    .max(currentYear, 'Informe um ano válido.'),
  plate: z
    .string()
    .trim()
    .min(7, 'Informe uma placa válida.')
    .refine((value) => plateRegex.test(normalizePlate(value)), {
      message: 'Use uma placa válida no padrão brasileiro.',
    }),
  currentMileage: z.coerce
    .number({ message: 'Informe uma quilometragem válida.' })
    .min(0, 'A quilometragem não pode ser negativa.'),
});

export const maintenanceSchema = z.object({
  type: z.string().min(1, 'Selecione um tipo de manutenção.'),
  description: z.string().trim().min(3, 'Descreva a manutenção realizada.'),
  date: dateSchema,
  cost: z.coerce.number({ message: 'Informe um valor válido.' }).positive('Informe um valor positivo.'),
  mileage: z.coerce
    .number({ message: 'Informe a quilometragem.' })
    .min(0, 'A quilometragem não pode ser negativa.'),
  notes: z.string().trim().max(400, 'Use no máximo 400 caracteres.').optional().or(z.literal('')),
});

export const expenseSchema = z.object({
  category: z.string().min(1, 'Selecione uma categoria.'),
  description: z.string().trim().min(3, 'Descreva o gasto.'),
  cost: z.coerce.number({ message: 'Informe um valor válido.' }).positive('Informe um valor positivo.'),
  date: dateSchema,
});

