import { expenseCategories, maintenanceTypes } from './constants';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const numberFormatter = new Intl.NumberFormat('pt-BR');

export function formatCurrency(value = 0) {
  return currencyFormatter.format(Number(value || 0));
}

export function formatMileage(value = 0) {
  return `${numberFormatter.format(Number(value || 0))} km`;
}

export function formatDate(value) {
  if (!value) {
    return 'Sem data';
  }

  const date = value.includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) {
    return 'Agora mesmo';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function sortByDate(items, direction = 'desc') {
  return [...items].sort((a, b) => {
    const first = new Date(`${a.date}T00:00:00`).getTime();
    const second = new Date(`${b.date}T00:00:00`).getTime();
    return direction === 'asc' ? first - second : second - first;
  });
}

export function sumCosts(items) {
  return items.reduce((total, item) => total + Number(item.cost || 0), 0);
}

export function getMaintenanceLabel(value) {
  return maintenanceTypes.find((type) => type.value === value)?.label ?? value;
}

export function getExpenseCategoryLabel(value) {
  return expenseCategories.find((category) => category.value === value)?.label ?? value;
}

export function daysSinceDate(value) {
  if (!value) {
    return 0;
  }

  const today = new Date();
  const date = new Date(`${value}T00:00:00`);
  const diff = today.getTime() - date.getTime();
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
}

