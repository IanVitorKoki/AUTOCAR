import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/forms/FormField';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useToast } from '../hooks/useToast';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';
import { registerSchema } from '../utils/schemas';

function Register() {
  usePageTitle('Cadastro');

  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await createAccount(values);
      toast.success('Conta criada com sucesso. Vamos organizar sua garagem.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    }
  };

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Cadastre-se para começar a registrar veículos, manutenções e despesas em um painel unificado."
      footerText="Já possui acesso?"
      footerLinkLabel="Fazer login"
      footerTo="/login"
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <FormField label="Nome" htmlFor="name" error={errors.name?.message} required>
          <Input id="name" type="text" placeholder="Seu nome completo" {...register('name')} />
        </FormField>

        <FormField label="E-mail" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="voce@exemplo.com" {...register('email')} />
        </FormField>

        <FormField label="Senha" htmlFor="password" error={errors.password?.message} required>
          <Input id="password" type="password" placeholder="Crie uma senha segura" {...register('password')} />
        </FormField>

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          Criar conta
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;

