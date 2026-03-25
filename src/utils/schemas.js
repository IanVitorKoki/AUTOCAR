import { z } from 'zod';
import { normalizePlate } from '../lib/firestore';
import { plateRegex } from './constants';

const currentYear = new Date().getFullYear() + 1;

const dateSchema = z
  .string()
  .min(1, 'Informe uma data valida.')
  .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
    message: 'Informe uma data valida.',
  });

const optionalDateSchema = z
  .string()
  .optional()
  .transform((value) => value ?? '')
  .refine((value) => value === '' || !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
    message: 'Informe uma data de lembrete valida.',
  });

const optionalMileageSchema = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
  z
    .number({ message: 'Informe uma quilometragem de lembrete valida.' })
    .min(0, 'A quilometragem de lembrete nao pode ser negativa.')
    .nullable(),
);

export const loginSchema = z.object({
  email: z.email('Informe um e-mail valido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome completo.'),
  email: z.email('Informe um e-mail valido.'),
  password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
});

export const vehicleSchema = z.object({
  nickname: z.string().trim().min(2, 'Informe um apelido para o veiculo.'),
  brand: z.string().trim().min(2, 'Informe a marca.'),
  model: z.string().trim().min(2, 'Informe o modelo.'),
  year: z.coerce
    .number({ message: 'Informe um ano valido.' })
    .int('Informe um ano valido.')
    .min(1900, 'Informe um ano valido.')
    .max(currentYear, 'Informe um ano valido.'),
  plate: z
    .string()
    .trim()
    .min(7, 'Informe uma placa valida.')
    .refine((value) => plateRegex.test(normalizePlate(value)), {
      message: 'Use uma placa valida no padrao brasileiro.',
    }),
  currentMileage: z.coerce
    .number({ message: 'Informe uma quilometragem valida.' })
    .min(0, 'A quilometragem nao pode ser negativa.'),
});

export const maintenanceSchema = z.object({
  type: z.string().min(1, 'Selecione um tipo de manutencao.'),
  description: z.string().trim().min(3, 'Descreva a manutencao realizada.'),
  date: dateSchema,
  cost: z.coerce.number({ message: 'Informe um valor valido.' }).positive('Informe um valor positivo.'),
  mileage: z.coerce
    .number({ message: 'Informe a quilometragem.' })
    .min(0, 'A quilometragem nao pode ser negativa.'),
  notes: z.string().trim().max(400, 'Use no maximo 400 caracteres.').optional().or(z.literal('')),
  reminderLabel: z.string().trim().max(80, 'Use no maximo 80 caracteres.').optional().or(z.literal('')),
  nextReminderDate: optionalDateSchema,
  nextReminderMileage: optionalMileageSchema,
});

export const expenseSchema = z.object({
  category: z.string().min(1, 'Selecione uma categoria.'),
  description: z.string().trim().min(3, 'Descreva o gasto.'),
  cost: z.coerce.number({ message: 'Informe um valor valido.' }).positive('Informe um valor positivo.'),
  date: dateSchema,
});
