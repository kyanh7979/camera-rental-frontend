import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore.js';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addToCart(camera, rentalDays = 1) {
        const existing = get().items.find((item) => item.id === camera.id);
        if (existing) {
          set({
            items: get().items.map((item) =>
              item.id === camera.id
                ? { ...item, rentalDays }
                : item
            )
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                id: camera.id,
                name: camera.name,
                brand: camera.brand,
                category: typeof camera.category === 'object' ? camera.category?.name : camera.category,
                image: camera.images?.[0],
                pricePerDay: camera.pricePerDay,
                rentalDays
              }
            ]
          });
        }
      },
      removeFromCart(id) {
        set({
          items: get().items.filter((item) => item.id !== id)
        });
      },
      updateRentalDays(id, rentalDays) {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, rentalDays } : item
          )
        });
      },
      clearCart() {
        set({ items: [] });
      },
      getTotal() {
        return get().items.reduce(
          (sum, item) => sum + item.pricePerDay * item.rentalDays,
          0
        );
      }
    }),
    {
      name: () => {
        const user = useAuthStore.getState()?.user;
        return user?.id ? `cart-store-${user.id}` : 'cart-store';
      }
    }
  )
);

export default useCartStore;

