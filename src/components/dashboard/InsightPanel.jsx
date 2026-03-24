import { ShieldCheck, TriangleAlert } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

function InsightPanel({ alerts }) {
  return (
    <Card className="h-full p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Alertas inteligentes</h2>
          <p className="mt-2 text-sm text-slate-500">Sinais simples para ajudar na rotina de cuidados com sua garagem.</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
          <TriangleAlert className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {alerts.length ? (
          alerts.map((alert, index) => (
            <div key={`${alert.title}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{alert.title}</p>
                <Badge variant={alert.variant}>{alert.label}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{alert.description}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              <p className="font-semibold">Tudo em ordem</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-emerald-800/80">
              Nenhum alerta crítico no momento. Continue registrando suas ações para manter o histórico atualizado.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default InsightPanel;

