import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import FormField from '../components/forms/FormField';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { loginSchema } from '../utils/schemas';

function Login() {
  usePageTitle('Login');

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const redirectTo = location.state?.from?.pathname ?? '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await signIn(values);
      toast.success('Bem-vindo de volta. Sua garagem já está pronta.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title="Entre na sua garagem"
      subtitle="Acesse sua conta para visualizar veículos, manutenções, gastos e os alertas da sua operação."
      footerText="Ainda não tem conta?"
      footerLinkLabel="Criar cadastro"
      footerTo="/register"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="E-mail" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="voce@exemplo.com" {...register('email')} />
        </FormField>

        <FormField label="Senha" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" placeholder="Sua senha" {...register('password')} />
        </FormField>

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Entrar agora
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;

