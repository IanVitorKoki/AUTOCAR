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
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import { createExpense, getExpenseById, updateExpense } from '../services/expenseService';
import { getVehicleById } from '../services/vehicleService';
import { defaultExpenseValues, expenseCategories } from '../utils/constants';
import { expenseSchema } from '../utils/schemas';

function ExpenseForm() {
  const { id, expenseId } = useParams();
  const isEditing = Boolean(expenseId);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);

  usePageTitle(isEditing ? 'Editar gasto' : 'Novo gasto');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultExpenseValues,
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
          const expense = await getExpenseById({ expenseId, userId: authUser.uid });
          reset({
            category: expense.category,
            description: expense.description,
            cost: expense.cost,
            date: expense.date,
          });
        }
      } catch (error) {
        toast.error(error.message || 'Não foi possível carregar os dados do gasto.');
        navigate(`/vehicles/${id}/expenses`, { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser?.uid, expenseId, id, isEditing]);

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await updateExpense(expenseId, values, authUser.uid, id);
        toast.success('Gasto atualizado com sucesso.');
      } else {
        await createExpense(values, authUser.uid, id);
        toast.success('Gasto registrado com sucesso.');
      }

      navigate(`/vehicles/${id}/expenses`, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Não foi possível salvar o gasto.');
    }
  };

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Preparando formulário do gasto..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEditing ? 'Edição' : 'Novo registro'}
        title={vehicle ? `${vehicle.nickname} • gasto` : 'Registro de gasto'}
        description="Detalhe a despesa para manter o histórico financeiro do veículo claro e consultável."
        actions={
          <Link to={`/vehicles/${id}/expenses`} className={buttonStyles({ variant: 'secondary' })}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para os gastos
          </Link>
        }
      />

      <Card className="p-6 sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Categoria" htmlFor="category" error={errors.category?.message} required>
              <Select id="category" {...register('category')}>
                <option value="">Selecione</option>
                {expenseCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Data" htmlFor="date" error={errors.date?.message} required>
              <Input id="date" type="date" {...register('date')} />
            </FormField>

            <FormField label="Descrição" htmlFor="description" error={errors.description?.message} required>
              <Input id="description" placeholder="Ex.: Seguro anual" {...register('description')} />
            </FormField>

            <FormField label="Valor" htmlFor="cost" error={errors.cost?.message} required>
              <Input id="cost" type="number" step="0.01" placeholder="850.00" {...register('cost')} />
            </FormField>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link to={`/vehicles/${id}/expenses`} className={buttonStyles({ variant: 'secondary' })}>
              Cancelar
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? 'Salvar alterações' : 'Registrar gasto'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default ExpenseForm;

