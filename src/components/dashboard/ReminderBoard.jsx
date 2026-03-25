import Card from '../ui/Card';
import Badge from '../ui/Badge';

function ReminderBoard({ reminders }) {
  return (
    <Card className="p-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Lembretes ativos</h2>
        <p className="mt-2 text-sm text-slate-500">
          Vencimentos por data e quilometragem configurados nas manutencoes.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {reminders.length ? (
          reminders.map((reminder) => (
            <div key={reminder.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{reminder.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{reminder.vehicleLabel}</p>
                </div>
                <Badge variant={reminder.variant}>{reminder.statusLabel}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{reminder.description}</p>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
            Nenhum lembrete ativo ainda. Configure proximas revisoes por data ou quilometragem nas manutencoes.
          </div>
        )}
      </div>
    </Card>
  );
}

export default ReminderBoard;
