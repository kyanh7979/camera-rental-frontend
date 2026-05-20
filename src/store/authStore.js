import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ADMIN_EMAIL, ROLES } from '../constants/auth.js';
import orderService from '../services/orderService.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      rentalHistory: [],
      orders: [],
      ordersLoading: false,
      ordersError: null,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      isAdmin: () => {
        const { user } = get();
        if (!user) return false;
        return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
               user.role === ROLES.ADMIN;
      },

      async login(token, user) {
        console.log('authStore login called:', { token, user });
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
        console.log('authStore state after login:', get());
      },

      async register(token, user) {
        console.log('authStore register called:', { token, user });
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });
      },

      async logout() {
        try {
          // Clear cart
          const { default: useCartStore } = await import('./cartStore.js');
          useCartStore.getState().clearCart();
          
          // Clear wishlist
          const { default: useWishlistStore } = await import('./wishlistStore.js');
          useWishlistStore.getState().clearWishlist();
          
          // Clear AI chat messages and cache
          const aiModule = await import('./aiChatStore.js');
          if (aiModule.default) {
            aiModule.default.getState().clearMessages();
          }
          if (aiModule.clearAICache) {
            aiModule.clearAICache();
          }
        } catch (e) {
          console.error('Error during logout cleanup:', e);
        }
        
        set({ user: null, token: null, isAuthenticated: false, rentalHistory: [], orders: [], ordersError: null });
      },

      addOrder(order) {
        const current = get().rentalHistory;
        set({ rentalHistory: [order, ...current] });
      },

      fetchMyOrders: async () => {
        set({ ordersLoading: true, ordersError: null });
        try {
          const response = await orderService.getMyOrders(0, 20);
          const ordersData = response.data?.content || response.data?.data?.content || [];
          set({ orders: ordersData, ordersLoading: false });
          return ordersData;
        } catch (err) {
          console.error('Error fetching orders in store:', err);
          set({ ordersError: 'Không thể tải danh sách đơn thuê', ordersLoading: false });
          throw err;
        }
      }
    }),
    { 
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        console.log('=== Persist Rehydrated ===');
        console.log('user:', state?.user);
        console.log('isAuthenticated:', state?.isAuthenticated);
        if (state) {
          state.setHasHydrated(true);
        }
      }
    }
  )
);

export default useAuthStore;
