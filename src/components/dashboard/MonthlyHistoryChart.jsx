import Card from '../ui/Card';
import { buildMonthlyCostSeries, formatCurrency, formatMonthLabel } from '../../utils/formatters';

function createPoints(values, maxValue, width, height, padding) {
  if (!values.length) {
    return [];
  }

  return values.map((value, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(values.length - 1, 1);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return [x, y];
  });
}

function pointsToPath(points) {
  return points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`)
    .join(' ');
}

function MonthlyHistoryChart({ monthKeys, expenses, maintenances }) {
  const expenseSeries = buildMonthlyCostSeries(expenses, monthKeys);
  const maintenanceSeries = buildMonthlyCostSeries(maintenances, monthKeys);
  const combinedSeries = monthKeys.map(
    (_, index) => Number(expenseSeries[index] || 0) + Number(maintenanceSeries[index] || 0),
  );
  const hasData = combinedSeries.some((value) => value > 0);

  const width = 420;
  const height = 220;
  const padding = 24;
  const maxValue = Math.max(...combinedSeries, ...expenseSeries, ...maintenanceSeries, 1);
  const expensePoints = createPoints(expenseSeries, maxValue, width, height, padding);
  const maintenancePoints = createPoints(maintenanceSeries, maxValue, width, height, padding);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Historico mensal</h2>
          <p className="mt-2 text-sm text-slate-500">
            Evolucao dos custos nos ultimos meses, separando gastos e manutencoes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
            Gastos
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Manutencoes
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="mt-6 overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full min-w-[360px]">
              {[0.25, 0.5, 0.75, 1].map((mark) => {
                const y = height - padding - mark * (height - padding * 2);

                return (
                  <line
                    key={mark}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="rgba(148, 163, 184, 0.25)"
                    strokeDasharray="4 6"
                  />
                );
              })}

              <path d={pointsToPath(expensePoints)} fill="none" stroke="#1667d9" strokeWidth="3" />
              <path d={pointsToPath(maintenancePoints)} fill="none" stroke="#f59e0b" strokeWidth="3" />

              {expensePoints.map(([x, y], index) => (
                <g key={`expense-${monthKeys[index]}`}>
                  <circle cx={x} cy={y} r="4.5" fill="#1667d9" />
                  <text
                    x={x}
                    y={height - 4}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#475569"
                  >
                    {formatMonthLabel(monthKeys[index])}
                  </text>
                </g>
              ))}

              {maintenancePoints.map(([x, y], index) => (
                <circle key={`maintenance-${monthKeys[index]}`} cx={x} cy={y} r="4.5" fill="#f59e0b" />
              ))}
            </svg>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Total do periodo</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {formatCurrency(combinedSeries.reduce((total, value) => total + value, 0))}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Gastos</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {formatCurrency(expenseSeries.reduce((total, value) => total + value, 0))}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Manutencoes</p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {formatCurrency(maintenanceSeries.reduce((total, value) => total + value, 0))}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
          Assim que houver lancamentos em meses diferentes, o historico visual aparecera aqui.
        </div>
      )}
    </Card>
  );
}

export default MonthlyHistoryChart;

