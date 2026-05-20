import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useAuthStore from './authStore.js';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      addWishlist(camera) {
        const exists = get().items.find(
          (item) => item.id === camera.id
        );
        if (!exists) {
          set({
            items: [
              ...get().items,
              {
                id: camera.id,
                name: camera.name,
                brand: camera.brand,
                image: camera.images?.[0],
                pricePerDay: camera.pricePerDay
              }
            ]
          });
        }
      },
      removeWishlist(id) {
        set({
          items: get().items.filter((item) => item.id !== id)
        });
      },
      clearWishlist() {
        set({ items: [] });
      }
    }),
    {
      name: () => {
        const user = useAuthStore.getState()?.user;
        return user?.id ? `wishlist-store-${user.id}` : 'wishlist-store';
      }
    }
  )
);

export default useWishlistStore;

