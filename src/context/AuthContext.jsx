import { createContext, useContext, useEffect, useState } from 'react';
import {
  getUserProfile,
  loginUser,
  logoutUser,
  observeAuthChanges,
  registerUser,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuthChanges(async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthUser(null);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      setAuthUser(firebaseUser);

      try {
        const profile = await getUserProfile(firebaseUser.uid);

        setUserProfile(
          profile ?? {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName ?? 'Motorista',
            email: firebaseUser.email ?? '',
          },
        );
      } catch (error) {
        console.error(error);
        setUserProfile({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName ?? 'Motorista',
          email: firebaseUser.email ?? '',
        });
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = async (values) => {
    const profile = await registerUser(values);
    setUserProfile(profile);
    return profile;
  };

  const signIn = async (values) => {
    return loginUser(values);
  };

  const signOutUser = async () => {
    await logoutUser();
    setAuthUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        userProfile,
        loading,
        isAuthenticated: Boolean(authUser),
        register,
        signIn,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  }

  return context;
}

