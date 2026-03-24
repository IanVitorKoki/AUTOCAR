import {
  ArrowRight,
  CarFront,
  CirclePlus,
  Gauge,
  ReceiptText,
  Wallet,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import InsightPanel from '../components/dashboard/InsightPanel';
import RecentExpensesList from '../components/dashboard/RecentExpensesList';
import SummaryCard from '../components/dashboard/SummaryCard';
import PageHeader from '../components/layout/PageHeader';
import Button, { buttonStyles } from '../components/ui/Button';
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
  formatCurrency,
  formatDate,
  formatMileage,
  getCurrentMonthKey,
  getMaintenanceLabel,
  sumCosts,
} from '../utils/formatters';

function buildAlerts(vehicles, maintenances, expenses) {
  const alerts = [];

  if (!vehicles.length) {
    alerts.push({
      title: 'Cadastre seu primeiro veículo',
      description: 'Com um veículo ativo você consegue organizar histórico de manutenção, quilometragem e gastos.',
      label: 'Começar',
      variant: 'brand',
    });
  }

  if (vehicles.length && !maintenances.length) {
    alerts.push({
      title: 'Nenhuma manutenção registrada',
      description: 'Adicione a primeira manutenção para formar um histórico confiável e gerar alertas mais úteis.',
      label: 'Atenção',
      variant: 'amber',
    });
  }

  if (vehicles.length && !expenses.length) {
    alerts.push({
      title: 'Seus gastos ainda não estão sendo monitorados',
      description: 'Registrar despesas ajuda a enxergar custo real de uso e a comparar períodos com clareza.',
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
        title: `${vehicle.nickname}: revisão de rotina sugerida`,
        description: `A última manutenção desse veículo foi registrada em ${formatMileage(latestMaintenance.mileage)}.`,
        label: 'Quilometragem',
        variant: 'danger',
      });
      return;
    }

    if (daysGap >= 180) {
      alerts.push({
        title: `${vehicle.nickname}: revisão há ${daysGap} dias`,
        description: `O último lançamento foi em ${formatDate(latestMaintenance.date)}. Vale conferir itens preventivos.`,
        label: 'Tempo',
        variant: 'amber',
      });
    }
  });

  return alerts.slice(0, 4);
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
        toast.error(error.message || 'Não foi possível carregar o dashboard.');
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

  const alerts = buildAlerts(vehicles, maintenances, expenses);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Painel"
        title={`Olá, ${userProfile?.name?.split(' ')[0] ?? 'motorista'}`}
        description="Tenha uma visão central da sua garagem, com indicadores rápidos, alertas preventivos e histórico financeiro consolidado."
        actions={
          <>
            <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
              Ver veículos
            </Link>
            <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Novo veículo
            </Link>
          </>
        }
      />

      {!vehicles.length ? (
        <EmptyState
          icon={CarFront}
          title="Sua garagem ainda está vazia"
          description="Cadastre o primeiro veículo para começar a acompanhar histórico de serviços, gastos e alertas preventivos."
          action={
            <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Cadastrar primeiro veículo
            </Link>
          }
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={CarFront}
          label="Veículos cadastrados"
          value={vehicles.length}
          hint="Sua garagem ativa no sistema."
          accent="brand"
        />
        <SummaryCard
          icon={Wallet}
          label="Gasto no mês"
          value={formatCurrency(sumCosts(monthlyCosts))}
          hint="Manutenções e despesas do período atual."
          accent="amber"
        />
        <SummaryCard
          icon={ReceiptText}
          label="Gasto acumulado"
          value={formatCurrency(sumCosts(allCosts))}
          hint="Consolidado histórico da conta."
          accent="emerald"
        />
        <SummaryCard
          icon={Wrench}
          label="Manutenções registradas"
          value={maintenances.length}
          hint="Quantidade total de serviços lançados."
          accent="slate"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <RecentExpensesList expenses={recentExpenses} vehiclesById={vehiclesById} />

        <Card className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Última manutenção</h2>
              <p className="mt-2 text-sm text-slate-500">O registro mais recente ajuda a orientar próximos cuidados preventivos.</p>
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
                    {vehiclesById[latestMaintenance.vehicleId]?.nickname ?? 'Veículo removido'} •{' '}
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
                  <p className="text-sm text-slate-500">Observações</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {latestMaintenance.notes || 'Sem observações extras'}
                  </p>
                </div>
              </div>
              <Link
                to={`/vehicles/${latestMaintenance.vehicleId}/maintenances`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
              >
                Ver histórico desse veículo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma manutenção registrada ainda. Assim que você adicionar um serviço, ele aparecerá aqui.
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <CategoryBreakdown items={categorySummary} />
        <InsightPanel alerts={alerts} />
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Próximo passo recomendado</h2>
            <p className="mt-2 text-sm text-slate-500">
              O fluxo mais eficiente é escolher um veículo e aprofundar o histórico de manutenções e gastos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
              Abrir garagem
            </Link>
            <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
              Adicionar veículo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

