import { formatCurrency } from '../../utils/formatters';
import Card from '../ui/Card';

function CategoryBreakdown({ items }) {
  const maxValue = items.length ? Math.max(...items.map((item) => item.total)) : 0;

  return (
    <Card className="h-full p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Resumo por categoria</h2>
        <p className="mt-2 text-sm text-slate-500">Veja onde o dinheiro está sendo investido no dia a dia.</p>
      </div>

      <div className="mt-6 space-y-4">
        {items.length ? (
          items.map((item) => (
            <div key={item.category}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-sm font-semibold text-slate-500">{formatCurrency(item.total)}</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
                  style={{ width: `${maxValue ? Math.max((item.total / maxValue) * 100, 12) : 0}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            Nenhum gasto cadastrado ainda para gerar o resumo por categoria.
          </div>
        )}
      </div>
    </Card>
  );
}

export default CategoryBreakdown;

