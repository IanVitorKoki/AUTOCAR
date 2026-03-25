import { ArrowRight, CarFront, CirclePlus, Gauge, ReceiptText, Wallet, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import InsightPanel from '../components/dashboard/InsightPanel';
import MonthlyHistoryChart from '../components/dashboard/MonthlyHistoryChart';
import RecentExpensesList from '../components/dashboard/RecentExpensesList';
import ReminderBoard from '../components/dashboard/ReminderBoard';
import SummaryCard from '../components/dashboard/SummaryCard';
import VehicleComparisonChart from '../components/dashboard/VehicleComparisonChart';
import PageHeader from '../components/layout/PageHeader';
import { buttonStyles } from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import { getExpensesByUser } from '../services/expenseService';
import { getMaintenancesByUser } from '../services/maintenanceService';
import { getVehiclesByUser } from '../services/vehicleService';
import { expenseCategories } from '../utils/constants';
import {
  daysSinceDate,
  daysUntilDate,
  formatCurrency,
  formatDate,
  formatMileage,
  getCurrentMonthKey,
  getMaintenanceLabel,
  getRecentMonthKeys,
  sumCosts,
} from '../utils/formatters';

function buildReminders(vehicles, maintenances) {
  const vehiclesById = vehicles.reduce((accumulator, vehicle) => {
    accumulator[vehicle.id] = vehicle;
    return accumulator;
  }, {});

  return maintenances
    .filter((maintenance) => maintenance.nextReminderDate || maintenance.nextReminderMileage !== null)
    .map((maintenance) => {
      const vehicle = vehiclesById[maintenance.vehicleId];

      if (!vehicle) {
        return null;
      }

      const reminderTitle = maintenance.reminderLabel || maintenance.description;
      const daysLeft = maintenance.nextReminderDate ? daysUntilDate(maintenance.nextReminderDate) : null;
      const mileageLeft =
        maintenance.nextReminderMileage === null || maintenance.nextReminderMileage === undefined
          ? null
          : Number(maintenance.nextReminderMileage) - Number(vehicle.currentMileage || 0);

      let variant = 'slate';
      let statusLabel = 'Programado';
      let priority = 2;

      if ((daysLeft !== null && daysLeft <= 0) || (mileageLeft !== null && mileageLeft <= 0)) {
        variant = 'danger';
        statusLabel = 'Vencido';
        priority = 0;
      } else if ((daysLeft !== null && daysLeft <= 30) || (mileageLeft !== null && mileageLeft <= 1500)) {
        variant = 'amber';
        statusLabel = 'Proximo';
        priority = 1;
      }

      const descriptionParts = [];

      if (maintenance.nextReminderDate) {
        descriptionParts.push(
          daysLeft !== null && daysLeft <= 0
            ? `Data alvo em ${formatDate(maintenance.nextReminderDate)}`
            : `Vence em ${formatDate(maintenance.nextReminderDate)}`,
        );
      }

      if (maintenance.nextReminderMileage !== null && maintenance.nextReminderMileage !== undefined) {
        descriptionParts.push(
          mileageLeft !== null && mileageLeft <= 0
            ? `Meta de ${formatMileage(maintenance.nextReminderMileage)} atingida`
            : `Faltam ${formatMileage(mileageLeft)}`,
        );
      }

      return {
        id: maintenance.id,
        title: reminderTitle,
        vehicleLabel: vehicle.nickname,
        description: descriptionParts.join(' • '),
        variant,
        statusLabel,
        priority,
        sortDate: maintenance.nextReminderDate || '9999-12-31',
        sortMileage:
          maintenance.nextReminderMileage === null || maintenance.nextReminderMileage === undefined
            ? Number.MAX_SAFE_INTEGER
            : Number(maintenance.nextReminderMileage),
      };
    })
    .filter(Boolean)
    .sort((first, second) => {
      if (first.priority !== second.priority) {
        return first.priority - second.priority;
      }

      if (first.sortDate !== second.sortDate) {
        return first.sortDate.localeCompare(second.sortDate);
      }

      return first.sortMileage - second.sortMileage;
    });
}

function buildAlerts(vehicles, maintenances, expenses, reminders) {
  const alerts = [];

  reminders.slice(0, 3).forEach((reminder) => {
    if (reminder.variant === 'danger' || reminder.variant === 'amber') {
      alerts.push({
        title: reminder.title,
        description: `${reminder.vehicleLabel} • ${reminder.description}`,
        label: reminder.statusLabel,
        variant: reminder.variant,
      });
    }
  });

  if (!vehicles.length) {
    alerts.push({
      title: 'Cadastre seu primeiro veiculo',
      description: 'Com um veiculo ativo voce consegue organizar historico, quilometragem e gastos.',
      label: 'Comecar',
      variant: 'brand',
    });
  }

  if (vehicles.length && !maintenances.length) {
    alerts.push({
      title: 'Nenhuma manutencao registrada',
      description: 'Adicione a primeira manutencao para formar um historico confiavel e gerar alertas uteis.',
      label: 'Atencao',
      variant: 'amber',
    });
  }

  if (vehicles.length && !expenses.length) {
    alerts.push({
      title: 'Seus gastos ainda nao estao sendo monitorados',
      description: 'Registrar despesas ajuda a enxergar custo real de uso e comparar periodos com clareza.',
      label: 'Financeiro',
      variant: 'brand',
    });
  }

  vehicles.forEach((vehicle) => {
    const latestMaintenance = maintenances.find((item) => item.vehicleId === vehicle.id);

    if (!latestMaintenance) {
      return;
    }

    const mileageGap = Math.max(Number(vehicle.currentMileage || 0) - Number(latestMaintenance.mileage || 0), 0);
    const daysGap = daysSinceDate(latestMaintenance.date);

    if (mileageGap >= 10000) {
      alerts.push({
        title: `${vehicle.nickname}: revisao de rotina sugerida`,
        description: `A ultima manutencao desse veiculo foi registrada em ${formatMileage(latestMaintenance.mileage)}.`,
        label: 'Quilometragem',
        variant: 'danger',
      });
      return;
    }

    if (daysGap >= 180) {
      alerts.push({
        title: `${vehicle.nickname}: revisao ha ${daysGap} dias`,
        description: `O ultimo lancamento foi em ${formatDate(latestMaintenance.date)}.`,
        label: 'Tempo',
        variant: 'amber',
      });
    }
  });

  return alerts.slice(0, 5);
}

function Dashboard() {
  usePageTitle('Dashboard');

  const { authUser, userProfile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    vehicles: [],
    maintenances: [],
    expenses: [],
  });

  useEffect(() => {
    async function loadDashboard() {
      if (!authUser?.uid) {
        return;
      }

      try {
        setLoading(true);

        const [vehicles, maintenances, expenses] = await Promise.all([
          getVehiclesByUser(authUser.uid),
          getMaintenancesByUser(authUser.uid),
          getExpensesByUser(authUser.uid),
        ]);

        setData({ vehicles, maintenances, expenses });
      } catch (error) {
        toast.error(error.message || 'Nao foi possivel carregar o dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [authUser?.uid]);

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Montando o panorama da sua garagem..." />
      </div>
    );
  }

  const { vehicles, maintenances, expenses } = data;
  const allCosts = [...maintenances, ...expenses];
  const currentMonthKey = getCurrentMonthKey();
  const monthlyCosts = allCosts.filter((item) => item.date?.startsWith(currentMonthKey));
  const latestMaintenance = maintenances[0];
  const recentExpenses = expenses.slice(0, 5);
  const monthKeys = getRecentMonthKeys(6);
  const vehiclesById = vehicles.reduce((accumulator, vehicle) => {
    accumulator[vehicle.id] = vehicle;
    return accumulator;
  }, {});

  const categorySummary = expenseCategories
    .map((category) => ({
      category: category.value,
      label: category.label,
      total: expenses
        .filter((expense) => expense.category === category.value)
        .reduce((total, expense) => total + Number(expense.cost || 0), 0),
    }))
    .filter((item) => item.total > 0)
    .sort((first, second) => second.total - first.total);

  const comparisonItems = vehicles
    .map((vehicle) => {
      const vehicleMaintenances = maintenances.filter((item) => item.vehicleId === vehicle.id);
      const vehicleExpenses = expenses.filter((item) => item.vehicleId === vehicle.id);

      return {
        id: vehicle.id,
        label: vehicle.nickname,
        totalCost: sumCosts(vehicleMaintenances) + sumCosts(vehicleExpenses),
        maintenanceCount: vehicleMaintenances.length,
        expenseCount: vehicleExpenses.length,
      };
    })
    .sort((first, second) => second.totalCost - first.totalCost)
    .slice(0, 6);

  const reminders = buildReminders(vehicles, maintenances);
  const alerts = buildAlerts(vehicles, maintenances, expenses, reminders);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel"
        title={`Ola, ${userProfile?.name?.split(' ')[0] ?? 'motorista'}`}
        description="Tenha uma visao central da sua garagem, com indicadores rapidos, historico visual e lembretes preventivos."
        actions={
          <>
            <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
              Ver veiculos
            </Link>
            <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Novo veiculo
            </Link>
          </>
        }
      />

      {!vehicles.length ? (
        <EmptyState
          icon={CarFront}
          title="Sua garagem ainda esta vazia"
          description="Cadastre o primeiro veiculo para comecar a acompanhar servicos, gastos e lembretes preventivos."
          action={
            <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Cadastrar primeiro veiculo
            </Link>
          }
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={CarFront}
          label="Veiculos cadastrados"
          value={vehicles.length}
          hint="Sua garagem ativa no sistema."
          accent="brand"
        />
        <SummaryCard
          icon={Wallet}
          label="Gasto no mes"
          value={formatCurrency(sumCosts(monthlyCosts))}
          hint="Manutencoes e despesas do periodo atual."
          accent="amber"
        />
        <SummaryCard
          icon={ReceiptText}
          label="Gasto acumulado"
          value={formatCurrency(sumCosts(allCosts))}
          hint="Consolidado historico da conta."
          accent="emerald"
        />
        <SummaryCard
          icon={Wrench}
          label="Manutencoes registradas"
          value={maintenances.length}
          hint="Quantidade total de servicos lancados."
          accent="slate"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <MonthlyHistoryChart monthKeys={monthKeys} expenses={expenses} maintenances={maintenances} />
        <VehicleComparisonChart items={comparisonItems} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ReminderBoard reminders={reminders.slice(0, 6)} />
        <RecentExpensesList expenses={recentExpenses} vehiclesById={vehiclesById} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Ultima manutencao</h2>
              <p className="mt-2 text-sm text-slate-500">
                O registro mais recente ajuda a orientar os proximos cuidados preventivos.
              </p>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
              <Gauge className="h-5 w-5" />
            </div>
          </div>

          {latestMaintenance ? (
            <div className="mt-6 rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-slate-900">{latestMaintenance.description}</p>
                  <p className="mt-2 text-sm text-slate-500">
                    {vehiclesById[latestMaintenance.vehicleId]?.nickname ?? 'Veiculo removido'} •{' '}
                    {getMaintenanceLabel(latestMaintenance.type)}
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(latestMaintenance.cost)}</p>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm text-slate-500">Data</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatDate(latestMaintenance.date)}</p>
                </div>
                <div className="rounded-3xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm text-slate-500">Quilometragem</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatMileage(latestMaintenance.mileage)}</p>
                </div>
                <div className="rounded-3xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-sm text-slate-500">Anexos</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {latestMaintenance.attachments?.length ?? 0} arquivo(s)
                  </p>
                </div>
              </div>
              <Link
                to={`/vehicles/${latestMaintenance.vehicleId}/maintenances`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
              >
                Ver historico desse veiculo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma manutencao registrada ainda. Assim que voce adicionar um servico, ele aparecera aqui.
            </div>
          )}
        </Card>

        <CategoryBreakdown items={categorySummary} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <InsightPanel alerts={alerts} />

        <section className="panel p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Proximo passo recomendado</h2>
              <p className="mt-2 text-sm text-slate-500">
                Escolha um veiculo para aprofundar manutencoes, anexar comprovantes e configurar lembretes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
                Abrir garagem
              </Link>
              <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
                Adicionar veiculo
              </Link>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

export default Dashboard;
