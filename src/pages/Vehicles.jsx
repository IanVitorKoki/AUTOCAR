import { CarFront, CirclePlus, PencilLine, ReceiptText, Trash2, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/ui/Badge';
import Button, { buttonStyles } from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import { deleteVehicle, getVehiclesByUser } from '../services/vehicleService';
import { formatDateTime, formatMileage } from '../utils/formatters';

function Vehicles() {
  usePageTitle('Veículos');

  const { authUser } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    async function loadVehicles() {
      if (!authUser?.uid) {
        return;
      }

      try {
        setLoading(true);
        const data = await getVehiclesByUser(authUser.uid);
        setVehicles(data);
      } catch (error) {
        toast.error(error.message || 'Não foi possível carregar os veículos.');
      } finally {
        setLoading(false);
      }
    }

    loadVehicles();
  }, [authUser?.uid]);

  const handleDelete = async (vehicle) => {
    const confirmed = await confirm({
      title: 'Excluir veículo?',
      description:
        'Essa ação remove o veículo e também apaga todas as manutenções e gastos vinculados a ele.',
      confirmLabel: 'Excluir veículo',
    });

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(vehicle.id);
      await deleteVehicle(vehicle.id, authUser.uid);
      setVehicles((current) => current.filter((item) => item.id !== vehicle.id));
      toast.success('Veículo e histórico relacionado removidos com sucesso.');
    } catch (error) {
      toast.error(error.message || 'Não foi possível excluir o veículo.');
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Carregando os veículos cadastrados..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Garagem"
        title="Seus veículos"
        description="Cadastre, visualize e organize a frota pessoal. Cada veículo concentra o acesso para manutenções e gastos."
        actions={
          <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
            <CirclePlus className="h-4 w-4" />
            Novo veículo
          </Link>
        }
      />

      {!vehicles.length ? (
        <EmptyState
          icon={CarFront}
          title="Nenhum veículo cadastrado"
          description="Adicione um veículo para começar a acompanhar quilometragem, histórico de manutenções e despesas automotivas."
          action={
            <Link to="/vehicles/new" className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Adicionar veículo
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">{vehicle.nickname}</h2>
                    <Badge variant="brand">{vehicle.plate}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {vehicle.brand} {vehicle.model} • {vehicle.year}
                  </p>
                </div>

                <div className="rounded-[1.75rem] bg-slate-950 px-4 py-3 text-white shadow-soft">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Odômetro</p>
                  <p className="mt-2 text-lg font-bold">{formatMileage(vehicle.currentMileage)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-500">Marca</p>
                  <p className="mt-2 font-semibold text-slate-900">{vehicle.brand}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-500">Modelo</p>
                  <p className="mt-2 font-semibold text-slate-900">{vehicle.model}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 px-4 py-4">
                  <p className="text-sm text-slate-500">Atualizado em</p>
                  <p className="mt-2 font-semibold text-slate-900">{formatDateTime(vehicle.updatedAt)}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/vehicles/${vehicle.id}/maintenances`}
                  className={buttonStyles({ variant: 'secondary' })}
                >
                  <Wrench className="h-4 w-4" />
                  Manutenções
                </Link>
                <Link to={`/vehicles/${vehicle.id}/expenses`} className={buttonStyles({ variant: 'secondary' })}>
                  <ReceiptText className="h-4 w-4" />
                  Gastos
                </Link>
                <Link to={`/vehicles/${vehicle.id}/edit`} className={buttonStyles({ variant: 'ghost' })}>
                  <PencilLine className="h-4 w-4" />
                  Editar
                </Link>
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  isLoading={deletingId === vehicle.id}
                  onClick={() => handleDelete(vehicle)}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Vehicles;

