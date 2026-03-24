import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormField from '../components/forms/FormField';
import PageHeader from '../components/layout/PageHeader';
import Button, { buttonStyles } from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import {
  createMaintenance,
  getMaintenanceById,
  updateMaintenance,
} from '../services/maintenanceService';
import { getVehicleById } from '../services/vehicleService';
import { defaultMaintenanceValues, maintenanceTypes } from '../utils/constants';
import { maintenanceSchema } from '../utils/schemas';

function MaintenanceForm() {
  const { id, maintenanceId } = useParams();
  const isEditing = Boolean(maintenanceId);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);

  usePageTitle(isEditing ? 'Editar manutenção' : 'Nova manutenção');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: defaultMaintenanceValues,
  });

  useEffect(() => {
    async function loadData() {
      if (!authUser?.uid) {
        return;
      }

      try {
        setLoading(true);
        const vehicleData = await getVehicleById(id, authUser.uid);
        setVehicle(vehicleData);

        if (isEditing) {
          const maintenance = await getMaintenanceById({ maintenanceId, userId: authUser.uid });
          reset({
            type: maintenance.type,
            description: maintenance.description,
            date: maintenance.date,
            cost: maintenance.cost,
            mileage: maintenance.mileage,
            notes: maintenance.notes,
          });
        }
      } catch (error) {
        toast.error(error.message || 'Não foi possível carregar os dados da manutenção.');
        navigate(`/vehicles/${id}/maintenances`, { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser?.uid, id, maintenanceId, isEditing]);

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await updateMaintenance(maintenanceId, values, authUser.uid, id);
        toast.success('Manutenção atualizada com sucesso.');
      } else {
        await createMaintenance(values, authUser.uid, id);
        toast.success('Manutenção registrada com sucesso.');
      }

      navigate(`/vehicles/${id}/maintenances`, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Não foi possível salvar a manutenção.');
    }
  };

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Preparando formulário da manutenção..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEditing ? 'Edição' : 'Novo registro'}
        title={vehicle ? `${vehicle.nickname} • manutenção` : 'Registro de manutenção'}
        description="Detalhe o serviço executado para manter o histórico do veículo útil e confiável."
        actions={
          <Link to={`/vehicles/${id}/maintenances`} className={buttonStyles({ variant: 'secondary' })}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para o histórico
          </Link>
        }
      />

      <Card className="p-6 sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Tipo de manutenção" htmlFor="type" error={errors.type?.message} required>
              <Select id="type" {...register('type')}>
                <option value="">Selecione</option>
                {maintenanceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Data" htmlFor="date" error={errors.date?.message} required>
              <Input id="date" type="date" {...register('date')} />
            </FormField>

            <FormField
              label="Descrição"
              htmlFor="description"
              error={errors.description?.message}
              required
            >
              <Input id="description" placeholder="Ex.: Troca de óleo e filtro" {...register('description')} />
            </FormField>

            <FormField label="Valor" htmlFor="cost" error={errors.cost?.message} required>
              <Input id="cost" type="number" step="0.01" placeholder="250.00" {...register('cost')} />
            </FormField>

            <FormField label="Quilometragem" htmlFor="mileage" error={errors.mileage?.message} required>
              <Input id="mileage" type="number" placeholder="45000" {...register('mileage')} />
            </FormField>
          </div>

          <FormField label="Observações" htmlFor="notes" error={errors.notes?.message}>
            <Textarea
              id="notes"
              rows={5}
              placeholder="Detalhes técnicos, itens trocados, oficina responsável ou próximos passos."
              {...register('notes')}
            />
          </FormField>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link to={`/vehicles/${id}/maintenances`} className={buttonStyles({ variant: 'secondary' })}>
              Cancelar
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? 'Salvar alterações' : 'Registrar manutenção'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default MaintenanceForm;
