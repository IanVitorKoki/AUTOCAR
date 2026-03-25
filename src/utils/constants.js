import { CarFront, LayoutDashboard } from 'lucide-react';

export const maintenanceTypes = [
  { value: 'troca-de-oleo', label: 'Troca de oleo' },
  { value: 'revisao', label: 'Revisao' },
  { value: 'pneus', label: 'Pneus' },
  { value: 'freios', label: 'Freios' },
  { value: 'bateria', label: 'Bateria' },
  { value: 'suspensao', label: 'Suspensao' },
  { value: 'alinhamento-balanceamento', label: 'Alinhamento e balanceamento' },
  { value: 'outro', label: 'Outro' },
];

export const expenseCategories = [
  { value: 'combustivel', label: 'Combustivel' },
  { value: 'manutencao', label: 'Manutencao' },
  { value: 'documento', label: 'Documento' },
  { value: 'seguro', label: 'Seguro' },
  { value: 'lavagem', label: 'Lavagem' },
  { value: 'estacionamento', label: 'Estacionamento' },
  { value: 'outro', label: 'Outro' },
];

export const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    description: 'Resumo da sua garagem',
    icon: LayoutDashboard,
  },
  {
    to: '/vehicles',
    label: 'Veiculos',
    description: 'Acesso a veiculos, manutencoes e gastos',
    icon: CarFront,
  },
];

export const defaultVehicleValues = {
  nickname: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  plate: '',
  currentMileage: 0,
};

export const defaultMaintenanceValues = {
  type: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  cost: '',
  mileage: '',
  notes: '',
  reminderLabel: '',
  nextReminderDate: '',
  nextReminderMileage: '',
};

export const defaultExpenseValues = {
  category: '',
  description: '',
  cost: '',
  date: new Date().toISOString().slice(0, 10),
};

export const plateRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

export const maintenanceAttachmentConfig = {
  maxFiles: 5,
  maxSizeInBytes: 10 * 1024 * 1024,
};
