import useAuthStore from '../store/authStore.js';

const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    rentalHistory,
    token,
    addOrder,
    isAdmin,
    _hasHydrated
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    isHydrated: _hasHydrated,
    isAdmin: isAdmin(),
    login,
    register,
    logout,
    token,
    rentalHistory,
    addOrder
  };
};

export default useAuth;
