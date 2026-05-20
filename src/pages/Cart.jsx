import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useCartStore from '../store/cartStore.js';
import Button from '../components/ui/Button.jsx';
import { formatCurrency } from '../utils/formatCurrency.js';
import { ROUTES } from '../constants/routes.js';

function Cart() {
  const { items, removeFromCart, updateRentalDays, clearCart, getTotal } =
    useCartStore();
  const navigate = useNavigate();

  const total = useMemo(() => getTotal(), [getTotal]);
  const isEmpty = items.length === 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl" style={{ color: 'var(--text-primary)' }}>
            Giỏ hàng
          </h1>
          <p className="mt-1 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
            Kiểm tra thiết bị thuê của bạn trước khi thanh toán.
          </p>
        </div>
        {!isEmpty && (
          <Button
            variant="ghost"
            size="md"
            className="text-xs"
            onClick={clearCart}
          >
            Xóa toàn bộ giỏ hàng
          </Button>
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
            <FiShoppingBag className="w-10 h-10" style={{ color: 'var(--primary)' }} />
          </div>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Giỏ hàng của bạn đang trống
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Hãy thêm máy ảnh hoặc ống kính từ danh mục.
          </p>
          <Button onClick={() => navigate(ROUTES.CAMERAS)}>
            Xem danh mục
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
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
                <div className="h-20 w-24 overflow-hidden rounded-xl border"
                     style={{ 
                       borderColor: 'var(--border-color)',
                       backgroundColor: 'var(--bg-secondary)'
                     }}>
                  {item.image || item.images?.[0] ? (
                    <img
                      src={item.image || item.images[0]}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                      Không có ảnh
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1 text-xs">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--primary)' }}>
                    {item.brand} • {typeof item.category === 'string' ? item.category : item.category?.name || ''}
                  </p>

                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {item.name}
                  </p>

                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatCurrency(item.pricePerDay)} / ngày
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Số ngày thuê
                    </label>

                    <input
                      type="number"
                      min={1}
                      value={item.rentalDays}
                      onChange={(e) =>
                        updateRentalDays(
                          item.id,
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="h-9 w-16 rounded-xl border px-3 text-sm transition-all outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)',
                        '--tw-ring-color': 'var(--primary)'
                      }}
                    />

                    <p className="ml-auto text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Tạm tính:{' '}
                      <span className="font-semibold" style={{ color: 'var(--primary)' }}>
                        {formatCurrency(item.pricePerDay * item.rentalDays)}
                      </span>
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeFromCart(item.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all"
                  style={{ 
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <FiTrash2 className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>

          <motion.aside 
            className="h-fit rounded-2xl border p-6"
            style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--primary)'
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
              Tóm tắt đơn hàng
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Sản phẩm</span>
                <span style={{ color: 'var(--text-primary)' }}>{items.length}</span>
              </div>

              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Tổng tiền thuê</span>
                <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(total)}</span>
              </div>

              <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Bảo hiểm</span>
                <span>Đã bao gồm</span>
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                <span style={{ color: 'var(--text-primary)' }}>Tổng cần thanh toán</span>
                <span className="text-xl" style={{ color: 'var(--primary)' }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => navigate(ROUTES.CHECKOUT)}
            >
              Tiến hành thanh toán
            </Button>
          </motion.aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
