import { CirclePlus, Filter, PencilLine, Trash2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button, { buttonStyles } from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Select from '../components/ui/Select';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import { deleteMaintenance, getMaintenancesByVehicle } from '../services/maintenanceService';
import { getVehicleById } from '../services/vehicleService';
import { maintenanceTypes } from '../utils/constants';
import {
  formatCurrency,
  formatDate,
  formatMileage,
  getMaintenanceLabel,
  sortByDate,
  sumCosts,
} from '../utils/formatters';

function Maintenances() {
  usePageTitle('Manutenções');

  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    async function loadData() {
      if (!authUser?.uid) {
        return;
      }

      try {
        setLoading(true);

        const [vehicleData, maintenanceData] = await Promise.all([
          getVehicleById(id, authUser.uid),
          getMaintenancesByVehicle({ userId: authUser.uid, vehicleId: id }),
        ]);

        setVehicle(vehicleData);
        setMaintenances(maintenanceData);
      } catch (error) {
        toast.error(error.message || 'Não foi possível carregar as manutenções.');
        navigate('/vehicles', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser?.uid, id]);

  const displayedMaintenances = sortByDate(
    selectedType === 'all'
      ? maintenances
      : maintenances.filter((maintenance) => maintenance.type === selectedType),
    sortDirection,
  );

  const handleDelete = async (maintenance) => {
    const confirmed = await confirm({
      title: 'Excluir manutenção?',
      description: 'Esse registro sairá do histórico do veículo e não poderá ser recuperado.',
      confirmLabel: 'Excluir manutenção',
    });

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(maintenance.id);
      await deleteMaintenance(maintenance.id, authUser.uid);
      setMaintenances((current) => current.filter((item) => item.id !== maintenance.id));
      toast.success('Manutenção removida com sucesso.');
    } catch (error) {
      toast.error(error.message || 'Não foi possível excluir a manutenção.');
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Carregando histórico de manutenções..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manutenções"
        title={vehicle ? `${vehicle.nickname} • histórico técnico` : 'Histórico técnico'}
        description="Acompanhe serviços executados, custos e quilometragem para manter a manutenção preventiva sempre em dia."
        actions={
          <>
            <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
              Voltar para veículos
            </Link>
            <Link to={`/vehicles/${id}/maintenances/new`} className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Nova manutenção
            </Link>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Resumo</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Total investido</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(sumCosts(maintenances))}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Serviços lançados</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{maintenances.length}</p>
            </div>
          </div>
          {vehicle ? (
            <div className="mt-5 rounded-3xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Quilometragem atual</p>
              <p className="mt-2 text-xl font-bold">{formatMileage(vehicle.currentMileage)}</p>
            </div>
          ) : null}
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Filtros</h2>
              <p className="mt-2 text-sm text-slate-500">Refine a visualização por tipo e ordem de data.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="min-w-[220px]">
                <p className="mb-2 text-sm font-semibold text-slate-700">Tipo</p>
                <Select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
                  <option value="all">Todos os tipos</option>
                  {maintenanceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="min-w-[220px]">
                <p className="mb-2 text-sm font-semibold text-slate-700">Ordem</p>
                <Select value={sortDirection} onChange={(event) => setSortDirection(event.target.value)}>
                  <option value="desc">Mais recentes primeiro</option>
                  <option value="asc">Mais antigas primeiro</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {!maintenances.length ? (
        <EmptyState
          icon={Wrench}
          title="Nenhuma manutenção cadastrada"
          description="Registre o primeiro serviço deste veículo para acompanhar custo, data e quilometragem de execução."
          action={
            <Link to={`/vehicles/${id}/maintenances/new`} className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Registrar primeira manutenção
            </Link>
          }
        />
      ) : displayedMaintenances.length ? (
        <div className="grid gap-5">
          {displayedMaintenances.map((maintenance) => (
            <Card key={maintenance.id} className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{maintenance.description}</h2>
                    <Badge variant="brand">{getMaintenanceLabel(maintenance.type)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatDate(maintenance.date)} • {formatMileage(maintenance.mileage)}
                  </p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {maintenance.notes || 'Sem observações adicionais registradas.'}
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(maintenance.cost)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/vehicles/${id}/maintenances/${maintenance.id}/edit`}
                      className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                    >
                      <PencilLine className="h-4 w-4" />
                      Editar
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      isLoading={deletingId === maintenance.id}
                      onClick={() => handleDelete(maintenance)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Filter}
          title="Nenhum resultado para esse filtro"
          description="Ajuste os filtros para visualizar outras manutenções registradas neste veículo."
        />
      )}
    </div>
  );
}

export default Maintenances;

