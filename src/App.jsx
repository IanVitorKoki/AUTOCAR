import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { ToastContainer } from './components/ui/ToastContainer';
import Dashboard from './pages/Dashboard';
import ExpenseForm from './pages/ExpenseForm';
import Expenses from './pages/Expenses';
import Login from './pages/Login';
import MaintenanceForm from './pages/MaintenanceForm';
import Maintenances from './pages/Maintenances';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import VehicleForm from './pages/VehicleForm';
import Vehicles from './pages/Vehicles';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';

function App() {
  return (
    <>
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

      <ToastContainer />
      <ConfirmDialog />
    </>
  );
}

export default App;
