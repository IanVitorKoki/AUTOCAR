import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, BellRing, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormField from '../components/forms/FormField';
import MaintenanceAttachmentsField from '../components/forms/MaintenanceAttachmentsField';
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
import { createMaintenance, getMaintenanceById, updateMaintenance } from '../services/maintenanceService';
import { getVehicleById } from '../services/vehicleService';
import { defaultMaintenanceValues, maintenanceAttachmentConfig, maintenanceTypes } from '../utils/constants';
import { maintenanceSchema } from '../utils/schemas';

function MaintenanceForm() {
  const { id, maintenanceId } = useParams();
  const isEditing = Boolean(maintenanceId);
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removedAttachmentPaths, setRemovedAttachmentPaths] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  usePageTitle(isEditing ? 'Editar manutencao' : 'Nova manutencao');

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
            reminderLabel: maintenance.reminderLabel || '',
            nextReminderDate: maintenance.nextReminderDate || '',
            nextReminderMileage: maintenance.nextReminderMileage ?? '',
          });

          setExistingAttachments(maintenance.attachments || []);
        }
      } catch (error) {
        toast.error(error.message || 'Nao foi possivel carregar os dados da manutencao.');
        navigate(`/vehicles/${id}/maintenances`, { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser?.uid, id, maintenanceId, isEditing]);

  const handleSelectFiles = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (!incomingFiles.length) {
      return;
    }

    const invalidFile = incomingFiles.find(
      (file) =>
        file.size > maintenanceAttachmentConfig.maxSizeInBytes ||
        !(file.type.startsWith('image/') || file.type === 'application/pdf'),
    );

    if (invalidFile) {
      toast.error('Use apenas imagens ou PDF com ate 10 MB por arquivo.');
      return;
    }

    if (
      existingAttachments.length + newFiles.length + incomingFiles.length >
      maintenanceAttachmentConfig.maxFiles
    ) {
      toast.error(`Voce pode manter ate ${maintenanceAttachmentConfig.maxFiles} arquivos por manutencao.`);
      return;
    }

    setNewFiles((current) => [...current, ...incomingFiles]);
  };

  const handleRemoveExisting = (attachment) => {
    setExistingAttachments((current) => current.filter((item) => item.path !== attachment.path));
    setRemovedAttachmentPaths((current) =>
      current.includes(attachment.path) ? current : [...current, attachment.path],
    );
  };

  const handleRemoveNew = (indexToRemove) => {
    setNewFiles((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (values) => {
    try {
      if (isEditing) {
        await updateMaintenance(maintenanceId, values, authUser.uid, id, {
          newFiles,
          removedAttachmentPaths,
        });
        toast.success('Manutencao atualizada com sucesso.');
      } else {
        await createMaintenance(values, authUser.uid, id, newFiles);
        toast.success('Manutencao registrada com sucesso.');
      }

      navigate(`/vehicles/${id}/maintenances`, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Nao foi possivel salvar a manutencao.');
    }
  };

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Preparando formulario da manutencao..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={isEditing ? 'Edicao' : 'Novo registro'}
        title={vehicle ? `${vehicle.nickname} • manutencao` : 'Registro de manutencao'}
        description="Detalhe o servico executado, anexe comprovantes e configure o proximo lembrete do veiculo."
        actions={
          <Link to={`/vehicles/${id}/maintenances`} className={buttonStyles({ variant: 'secondary' })}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para o historico
          </Link>
        }
      />

      <Card className="p-6 sm:p-8">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Tipo de manutencao" htmlFor="type" error={errors.type?.message} required>
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

            <FormField label="Descricao" htmlFor="description" error={errors.description?.message} required>
              <Input id="description" placeholder="Ex.: Troca de oleo e filtro" {...register('description')} />
            </FormField>

            <FormField label="Valor" htmlFor="cost" error={errors.cost?.message} required>
              <Input id="cost" type="number" step="0.01" placeholder="250.00" {...register('cost')} />
            </FormField>

            <FormField label="Quilometragem" htmlFor="mileage" error={errors.mileage?.message} required>
              <Input id="mileage" type="number" placeholder="45000" {...register('mileage')} />
            </FormField>
          </div>

          <FormField label="Observacoes" htmlFor="notes" error={errors.notes?.message}>
            <Textarea
              id="notes"
              rows={5}
              placeholder="Detalhes tecnicos, itens trocados, oficina responsavel ou proximos passos."
              {...register('notes')}
            />
          </FormField>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-3 text-brand-700 shadow-sm">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Lembrete preventivo</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Configure por data e/ou quilometragem para destacar esse cuidado no dashboard.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <FormField label="Titulo do lembrete" htmlFor="reminderLabel" error={errors.reminderLabel?.message}>
                <Input id="reminderLabel" placeholder="Ex.: Revisar oleo do motor" {...register('reminderLabel')} />
              </FormField>

              <FormField label="Proxima data" htmlFor="nextReminderDate" error={errors.nextReminderDate?.message}>
                <Input id="nextReminderDate" type="date" {...register('nextReminderDate')} />
              </FormField>

              <FormField
                label="Proxima quilometragem"
                htmlFor="nextReminderMileage"
                error={errors.nextReminderMileage?.message}
              >
                <Input
                  id="nextReminderMileage"
                  type="number"
                  placeholder="50000"
                  {...register('nextReminderMileage')}
                />
              </FormField>
            </div>
          </div>

          <MaintenanceAttachmentsField
            inputId="maintenance-attachments"
            helperText="Anexe fotos da manutencao, ordem de servico, nota fiscal ou comprovantes para consulta futura."
            existingAttachments={existingAttachments}
            newFiles={newFiles}
            maxFiles={maintenanceAttachmentConfig.maxFiles}
            onSelectFiles={handleSelectFiles}
            onRemoveExisting={handleRemoveExisting}
            onRemoveNew={handleRemoveNew}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
            <Link to={`/vehicles/${id}/maintenances`} className={buttonStyles({ variant: 'secondary' })}>
              Cancelar
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? 'Salvar alteracoes' : 'Registrar manutencao'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default MaintenanceForm;
