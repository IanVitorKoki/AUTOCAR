import Card from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

function VehicleComparisonChart({ items }) {
  const maxValue = items.length ? Math.max(...items.map((item) => item.totalCost), 1) : 1;

  return (
    <Card className="p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Comparativo por veiculo</h2>
        <p className="mt-2 text-sm text-slate-500">
          Veja rapidamente quais veiculos concentram mais custo e volume de operacoes.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.maintenanceCount} manutencao(oes) • {item.expenseCount} gasto(s)
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(item.totalCost)}</p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                  style={{ width: `${Math.max((item.totalCost / maxValue) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            O comparativo por veiculo sera exibido quando houver registros de manutencao ou gastos.
          </div>
        )}
      </div>
    </Card>
  );
}

export default VehicleComparisonChart;

