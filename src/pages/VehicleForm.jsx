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
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import { defaultVehicleValues } from '../utils/constants';
import { vehicleSchema } from '../utils/schemas';
import { createVehicle, getVehicleById, updateVehicle } from '../services/vehicleService';

function VehicleForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(isEditing);

  usePageTitle(isEditing ? 'Editar veículo' : 'Novo veículo');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: defaultVehicleValues,
  });

  useEffect(() => {
    async function loadVehicle() {
      if (!isEditing || !authUser?.uid) {
        return;
      }

      try {
        setLoading(true);
        const vehicle = await getVehicleById(id, authUser.uid);
        reset({
          nickname: vehicle.nickname,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          plate: vehicle.plate,
          currentMileage: vehicle.currentMileage,
        });
      } catch (error) {
        toast.error(error.message || 'Não foi possível carregar o veículo.');
        navigate('/vehicles', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadVehicle();
  }, [authUser?.uid, id, isEditing]);

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await updateVehicle(id, values, authUser.uid);
        toast.success('Veículo atualizado com sucesso.');
      } else {
        await createVehicle(values, authUser.uid);
        toast.success('Veículo cadastrado com sucesso.');
      }

      navigate('/vehicles', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Não foi possível salvar o veículo.');
    }
  };

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Carregando dados do veículo..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEditing ? 'Edição' : 'Cadastro'}
        title={isEditing ? 'Atualize o veículo' : 'Cadastre um novo veículo'}
        description="Preencha os dados principais para usar o veículo como base de gastos, manutenções e alertas preventivos."
        actions={
          <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para veículos
          </Link>
        }
      />

      <Card className="p-6 sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Apelido do veículo" htmlFor="nickname" error={errors.nickname?.message} required>
              <Input id="nickname" placeholder="Ex.: Sedan da família" {...register('nickname')} />
            </FormField>

            <FormField label="Marca" htmlFor="brand" error={errors.brand?.message} required>
              <Input id="brand" placeholder="Ex.: Toyota" {...register('brand')} />
            </FormField>

            <FormField label="Modelo" htmlFor="model" error={errors.model?.message} required>
              <Input id="model" placeholder="Ex.: Corolla" {...register('model')} />
            </FormField>

            <FormField label="Ano" htmlFor="year" error={errors.year?.message} required>
              <Input id="year" type="number" placeholder="2024" {...register('year')} />
            </FormField>

            <FormField
              label="Placa"
              htmlFor="plate"
              error={errors.plate?.message}
              hint="Aceita padrões como ABC1234 e ABC1D23."
              required
            >
              <Input id="plate" className="uppercase" placeholder="ABC1D23" {...register('plate')} />
            </FormField>

            <FormField
              label="Quilometragem atual"
              htmlFor="currentMileage"
              error={errors.currentMileage?.message}
              required
            >
              <Input id="currentMileage" type="number" placeholder="45000" {...register('currentMileage')} />
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
              Cancelar
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? 'Salvar alterações' : 'Cadastrar veículo'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default VehicleForm;
