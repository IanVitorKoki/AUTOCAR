import { formatCurrency, formatDate, getExpenseCategoryLabel } from '../../utils/formatters';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

function RecentExpensesList({ expenses, vehiclesById }) {
  return (
    <Card className="h-full p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Últimos gastos</h2>
        <p className="mt-2 text-sm text-slate-500">Os lançamentos mais recentes aparecem aqui para consulta rápida.</p>
      </div>

      <div className="mt-6 space-y-4">
        {expenses.length ? (
          expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{expense.description}</p>
                  <Badge variant="emerald">{getExpenseCategoryLabel(expense.category)}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {vehiclesById[expense.vehicleId]?.nickname ?? 'Veículo removido'} • {formatDate(expense.date)}
                </p>
              </div>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(expense.cost)}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Ainda não existem gastos lançados.
          </div>
        )}
      </div>
    </Card>
  );
}

export default RecentExpensesList;
