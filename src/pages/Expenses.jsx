import { CirclePlus, Filter, PencilLine, ReceiptText, Trash2 } from 'lucide-react';
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
import { deleteExpense, getExpensesByVehicle } from '../services/expenseService';
import { getVehicleById } from '../services/vehicleService';
import { expenseCategories } from '../utils/constants';
import {
  formatCurrency,
  formatDate,
  getCurrentMonthKey,
  getExpenseCategoryLabel,
  sortByDate,
  sumCosts,
} from '../utils/formatters';

function Expenses() {
  usePageTitle('Gastos');

  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    async function loadData() {
      if (!authUser?.uid) {
        return;
      }

      try {
        setLoading(true);

        const [vehicleData, expenseData] = await Promise.all([
          getVehicleById(id, authUser.uid),
          getExpensesByVehicle({ userId: authUser.uid, vehicleId: id }),
        ]);

        setVehicle(vehicleData);
        setExpenses(expenseData);
      } catch (error) {
        toast.error(error.message || 'Não foi possível carregar os gastos.');
        navigate('/vehicles', { replace: true });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser?.uid, id]);

  const displayedExpenses = sortByDate(
    selectedCategory === 'all'
      ? expenses
      : expenses.filter((expense) => expense.category === selectedCategory),
    sortDirection,
  );

  const currentMonthKey = getCurrentMonthKey();

  const handleDelete = async (expense) => {
    const confirmed = await confirm({
      title: 'Excluir gasto?',
      description: 'O lançamento será removido do histórico financeiro do veículo.',
      confirmLabel: 'Excluir gasto',
    });

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(expense.id);
      await deleteExpense(expense.id, authUser.uid);
      setExpenses((current) => current.filter((item) => item.id !== expense.id));
      toast.success('Gasto removido com sucesso.');
    } catch (error) {
      toast.error(error.message || 'Não foi possível excluir o gasto.');
    } finally {
      setDeletingId('');
    }
  };

  if (loading) {
    return (
      <div className="panel-muted flex min-h-[480px] items-center justify-center">
        <LoadingSpinner label="Carregando gastos do veículo..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Financeiro"
        title={vehicle ? `${vehicle.nickname} • gastos` : 'Gastos do veículo'}
        description="Controle despesas por categoria, acompanhe o custo mensal e mantenha a previsibilidade financeira do veículo."
        actions={
          <>
            <Link to="/vehicles" className={buttonStyles({ variant: 'secondary' })}>
              Voltar para veículos
            </Link>
            <Link to={`/vehicles/${id}/expenses/new`} className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Novo gasto
            </Link>
          </>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Resumo</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Total acumulado</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(sumCosts(expenses))}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">Gastos no mês</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(sumCosts(expenses.filter((expense) => expense.date.startsWith(currentMonthKey))))}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-3xl bg-slate-950 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-300">Lançamentos</p>
            <p className="mt-2 text-xl font-bold">{expenses.length}</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Filtros</h2>
              <p className="mt-2 text-sm text-slate-500">Refine a visualização por categoria e ordem de data.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="min-w-[220px]">
                <p className="mb-2 text-sm font-semibold text-slate-700">Categoria</p>
                <Select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                  <option value="all">Todas as categorias</option>
                  {expenseCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
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

      {!expenses.length ? (
        <EmptyState
          icon={ReceiptText}
          title="Nenhum gasto cadastrado"
          description="Adicione o primeiro gasto deste veículo para acompanhar custos mensais, categorias e histórico financeiro."
          action={
            <Link to={`/vehicles/${id}/expenses/new`} className={buttonStyles({ variant: 'primary' })}>
              <CirclePlus className="h-4 w-4" />
              Registrar primeiro gasto
            </Link>
          }
        />
      ) : displayedExpenses.length ? (
        <div className="grid gap-5">
          {displayedExpenses.map((expense) => (
            <Card key={expense.id} className="p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">{expense.description}</h2>
                    <Badge variant="emerald">{getExpenseCategoryLabel(expense.category)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{formatDate(expense.date)}</p>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(expense.cost)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/vehicles/${id}/expenses/${expense.id}/edit`}
                      className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                    >
                      <PencilLine className="h-4 w-4" />
                      Editar
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      isLoading={deletingId === expense.id}
                      onClick={() => handleDelete(expense)}
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
          description="Ajuste os filtros para visualizar outros gastos registrados neste veículo."
        />
      )}
    </div>
  );
}

export default Expenses;

