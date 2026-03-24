const firebaseErrorMessages = {
  'auth/email-already-in-use': 'Este e-mail já está em uso.',
  'auth/invalid-email': 'Informe um e-mail válido.',
  'auth/invalid-credential': 'Credenciais inválidas. Revise e tente novamente.',
  'auth/missing-password': 'Informe sua senha para continuar.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  'auth/user-disabled': 'Esta conta está desabilitada.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'permission-denied': 'Você não tem permissão para acessar este recurso.',
};

export function getFirebaseErrorMessage(error) {
  if (error?.code && firebaseErrorMessages[error.code]) {
    return firebaseErrorMessages[error.code];
  }

  return error?.message || 'Algo saiu do esperado. Tente novamente.';
}

