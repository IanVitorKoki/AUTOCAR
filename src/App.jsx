import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { ToastContainer } from './components/ui/ToastContainer';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ExpenseForm = lazy(() => import('./pages/ExpenseForm'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Login = lazy(() => import('./pages/Login'));
const MaintenanceForm = lazy(() => import('./pages/MaintenanceForm'));
const Maintenances = lazy(() => import('./pages/Maintenances'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Register = lazy(() => import('./pages/Register'));
const VehicleForm = lazy(() => import('./pages/VehicleForm'));
const Vehicles = lazy(() => import('./pages/Vehicles'));

function App() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <LoadingSpinner label="Carregando módulo..." />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/vehicles/new" element={<VehicleForm />} />
              <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
              <Route path="/vehicles/:id/maintenances" element={<Maintenances />} />
              <Route path="/vehicles/:id/maintenances/new" element={<MaintenanceForm />} />
              <Route
                path="/vehicles/:id/maintenances/:maintenanceId/edit"
                element={<MaintenanceForm />}
              />
              <Route path="/vehicles/:id/expenses" element={<Expenses />} />
              <Route path="/vehicles/:id/expenses/new" element={<ExpenseForm />} />
              <Route path="/vehicles/:id/expenses/:expenseId/edit" element={<ExpenseForm />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}

export default App;
