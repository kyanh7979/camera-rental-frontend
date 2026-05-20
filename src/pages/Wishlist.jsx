import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiHeart, FiShoppingCart } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import useWishlistStore from '../store/wishlistStore.js';
import useCartStore from '../store/cartStore.js';
import Button from '../components/ui/Button.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { ROUTES } from '../constants/routes.js';

function Wishlist() {
  const { items, removeWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();
  const navigate = useNavigate();
  const [rentalModal, setRentalModal] = useState({ show: false, item: null, days: 1 });

  const isEmpty = items.length === 0;

  const handleRentClick = (item) => {
    setRentalModal({ show: true, item, days: 1 });
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl" style={{ color: 'var(--text-primary)' }}>
            Yêu thích
          </h1>
          <p className="mt-1 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
            Những sản phẩm bạn đã lưu lại.
          </p>
        </div>
        {!isEmpty && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {items.length} sản phẩm
          </p>
        )}
      </section>

      {isEmpty ? (
        <motion.div 
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
               style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
            <FiHeart className="w-10 h-10" style={{ color: 'var(--primary)' }} />
          </div>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Chưa có sản phẩm yêu thích
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Nhấn biểu tượng trái tim trên sản phẩm để lưu vào đây.
          </p>
          <Button onClick={() => navigate(ROUTES.CAMERAS)}>
            Khám phá sản phẩm
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 rounded-2xl border p-4 transition-all hover:shadow-lg"
              style={{ 
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div
                className="h-20 w-24 cursor-pointer overflow-hidden rounded-xl border"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
                onClick={() => navigate(`/cameras/${item.id}`)}
              >
                {item.image || item.images?.[0] ? (
                  <img
                    src={item.image || item.images[0]}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    Không có ảnh
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1 text-xs">
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                  {item.brand}
                </p>
                <p
                  className="cursor-pointer text-sm font-semibold transition-colors hover:text-cyan-400"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => navigate(`/cameras/${item.id}`)}
                >
                  {item.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(item.pricePerDay)} / ngày
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleRentClick(item)}
                >
                  <FiShoppingCart className="w-4 h-4 mr-1" />
                  Thuê
                </Button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => removeWishlist(item.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <FiTrash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <RentalModal
        rentalModal={rentalModal}
        setRentalModal={setRentalModal}
        addToCart={addToCart}
        navigate={navigate}
      />
    </div>
  );
}

function RentalModal({ rentalModal, setRentalModal, addToCart, navigate }) {
  if (!rentalModal.show || !rentalModal.item) return null;

  const handleConfirmRent = () => {
    if (rentalModal.item) {
      addToCart({ ...rentalModal.item, rentalDays: rentalModal.days });
      setRentalModal({ show: false, item: null, days: 1 });
      navigate(ROUTES.CHECKOUT);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--bg-overlay)' }}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md rounded-2xl border p-6"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Thuê camera
          </h3>
          
          <div className="mb-4 flex items-center gap-4 rounded-xl p-4" 
               style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <img
              src={rentalModal.item.image || rentalModal.item.images?.[0]}
              alt={rentalModal.item.name}
              className="h-16 w-20 rounded-lg object-cover"
            />
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {rentalModal.item.name}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {rentalModal.item.brand}
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                {formatCurrency(rentalModal.item.pricePerDay)} / ngày
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Số ngày thuê
            </label>
            <input
              type="number"
              min="1"
              value={rentalModal.days}
              onChange={(e) => setRentalModal({ ...rentalModal, days: parseInt(e.target.value) || 1 })}
              className="input w-full"
              style={{ 
                height: '2.75rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="mb-6 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--text-secondary)' }}>Số ngày</span>
              <span style={{ color: 'var(--text-primary)' }}>{rentalModal.days}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2" style={{ borderColor: 'var(--border-color)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tổng tiền</span>
              <span className="font-semibold" style={{ color: 'var(--primary)' }}>
                {formatCurrency(rentalModal.item.pricePerDay * rentalModal.days)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setRentalModal({ show: false, item: null, days: 1 })}
            >
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmRent}
            >
              Xác nhận thuê
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Wishlist;
