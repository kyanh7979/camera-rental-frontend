import { motion } from 'framer-motion';
import { FiHeart, FiStar, FiCamera, FiZoomIn, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { memo, useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getPrimaryImage } from '../utils/imageUtils.js';
import { ROUTES } from '../constants/routes.js';
import useWishlistStore from '../store/wishlistStore.js';
import useCartStore from '../store/cartStore.js';
import { normalizeCategory } from '../constants/categories.js';
import useAuth from '../hooks/useAuth.js';
import { showSuccess, showError } from '../components/ui/ToastNotification.jsx';

const normalizeId = (camera, index) =>
  String(camera?.id ?? camera?._id ?? camera?.cameraId ?? index);

const normalizePrice = (camera) =>
  camera?.pricePerDay ?? camera?.dailyPrice ?? camera?.price ?? 0;

const normalizeCategoryName = (camera) => {
  if (!camera?.category) return '';
  if (typeof camera.category === 'object') {
    return normalizeCategory(camera.category?.name);
  }
  return normalizeCategory(camera.category);
};

const normalizeBrand = (camera) => {
  if (!camera?.brand) return '';
  if (typeof camera.brand === 'object') return camera.brand?.name;
  return camera.brand;
};

const normalizeName = (camera) =>
  camera?.name || camera?.title || 'Unnamed camera';

const BRAND_COLORS = {
  fujifilm: { bg: 'from-orange-500 to-red-600', text: 'text-orange-500' },
  canon: { bg: 'from-red-500 to-orange-600', text: 'text-red-500' },
  nikon: { bg: 'from-yellow-500 to-orange-500', text: 'text-yellow-600' },
  sony: { bg: 'from-sky-400 to-blue-500', text: 'text-sky-400' },
  panasonic: { bg: 'from-red-600 to-red-800', text: 'text-red-600' },
  gopro: { bg: 'from-yellow-400 to-orange-500', text: 'text-orange-500' },
  dji: { bg: 'from-orange-500 to-red-500', text: 'text-orange-600' },
  blackmagic: { bg: 'from-gray-500 to-gray-700', text: 'text-gray-600' },
  insta360: { bg: 'from-cyan-500 to-blue-600', text: 'text-cyan-600' },
};

const getBrandColor = (brandName) => {
  if (!brandName) return BRAND_COLORS.sony;
  const key = brandName.toLowerCase();
  return BRAND_COLORS[key] || { bg: 'from-cyan-500 to-teal-600', text: 'text-cyan-500' };
};

function CameraCard({ camera, index }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const { isAuthenticated } = useAuth();

  const items = useWishlistStore((state) => state.items);
  const addWishlist = useWishlistStore((state) => state.addWishlist);
  const removeWishlist = useWishlistStore((state) => state.removeWishlist);
  const addToCart = useCartStore((state) => state.addToCart);

  if (!camera) return null;

  const cameraId = normalizeId(camera, index);
  const imageUrl = getPrimaryImage(camera);
  const price = normalizePrice(camera);
  const categoryName = normalizeCategoryName(camera);
  const name = normalizeName(camera);
  const brandName = normalizeBrand(camera);
  const brandColor = getBrandColor(brandName);
  const isFeatured = camera.featured || camera.isFeatured || camera.popular;
  const isNew = camera.isNew || camera.newArrival;

  const isWishlisted = items.some((item) => String(item.id) === cameraId);

  const availability = camera.availability || camera.stockQuantity;
  const isOutOfStock =
    (typeof availability === 'number' && availability <= 0) ||
    (typeof availability === 'string' && availability.toLowerCase().includes('hết')) ||
    (typeof availability === 'string' && availability.toLowerCase().includes('unavailable'));
  const lowStock = typeof availability === 'number' && availability > 0 && availability <= 3;

  const handleWishlist = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isWishlisted ? removeWishlist(cameraId) : addWishlist(camera);
  };

  const handleQuickRent = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isOutOfStock) {
      showError('Sản phẩm hiện không khả dụng');
      return;
    }

    if (!isAuthenticated) {
      showSuccess('Vui lòng đăng nhập để thuê nhanh');
      navigate(ROUTES.LOGIN, {
        state: { from: ROUTES.CAMERA_DETAIL.replace(':id', cameraId) }
      });
      return;
    }

    addToCart(
      {
        ...camera,
        id: cameraId,
        pricePerDay: price,
        images: camera.images?.length ? camera.images : imageUrl ? [imageUrl] : [],
      },
      1
    );

    showSuccess(`Đã thêm "${name}" vào giỏ hàng`);
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => navigate(ROUTES.CAMERA_DETAIL.replace(':id', cameraId))}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* IMAGE SECTION */}
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{ height: '14rem' }}
      >
        {!imageUrl || imgError ? (
          <div className="flex h-full items-center justify-center">
            <FiCamera className="w-16 h-16 opacity-30" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            style={{
              display: 'block',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            onError={() => setImgError(true)}
          />
        )}

        {/* Gradient Overlay */}
        <div
          className="pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.20) 50%, transparent 100%)',
          }}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div
            className="pointer-events-auto"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span className="rounded-xl bg-red-600/90 px-4 py-2 text-sm font-bold text-white shadow-lg">
              Hết hàng
            </span>
          </div>
        )}

        {/* BADGES LAYER */}
        <div
          className="pointer-events-none"
          style={{ position: 'absolute', inset: 0 }}
        >
          {/* Top-left: Featured / New / Category */}
          <div style={{ position: 'absolute', left: '0.75rem', top: '0.75rem' }}>
            {isFeatured ? (
              <span
                className="pointer-events-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-lg"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}
              >
                <FiStar className="w-3 h-3 fill-current" />
                Nổi bật
              </span>
            ) : isNew ? (
              <span className="pointer-events-auto rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                Mới
              </span>
            ) : categoryName ? (
              <span
                className="pointer-events-auto rounded-lg px-2.5 py-1 text-xs font-medium backdrop-blur-md"
                style={{ backgroundColor: 'rgba(6, 182, 212, 0.8)', color: 'white' }}
              >
                {categoryName}
              </span>
            ) : null}
          </div>

          {/* Top-right: Wishlist */}
          <div style={{ position: 'absolute', right: '0.75rem', top: '0.75rem' }}>
            <motion.button
              onClick={handleWishlist}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md transition-all duration-200"
              style={{
                backgroundColor: isWishlisted ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.6)',
                color: 'white',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Top-right below wishlist: Low stock */}
          {lowStock && !isOutOfStock && (
            <div style={{ position: 'absolute', right: '0.75rem', top: '3.25rem' }}>
              <span className="pointer-events-auto flex items-center gap-1 rounded-lg bg-amber-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <FiAlertCircle className="w-3 h-3" />
                Sắp hết
              </span>
            </div>
          )}

          {/* Bottom: Quick Rent */}
          {!isOutOfStock && (
            <div
              className="pointer-events-auto opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '0.75rem',
                right: '0.75rem',
                transform: 'translateY(0.5rem)',
              }}
            >
              <button
                onClick={handleQuickRent}
                className="w-full rounded-xl py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:shadow-xl hover:opacity-90"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)',
                }}
              >
                Thuê ngay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className={`flex-shrink-0 text-xs font-bold uppercase tracking-wider ${brandColor.text}`}>
              {brandName || 'Unknown Brand'}
            </span>
            <div className={`h-px w-6 flex-shrink-0 bg-gradient-to-r ${brandColor.bg}`} />
          </div>
          <span className="flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
            {categoryName}
          </span>
        </div>

        {/* Name */}
        <h3
          className="min-h-0 flex-shrink-0 font-bold leading-snug line-clamp-2 text-base transition-colors duration-200 group-hover:text-cyan-400"
          style={{ color: 'var(--text-primary)' }}
        >
          {name}
        </h3>

        {/* Rating */}
        <div className="flex min-h-0 flex-shrink-0 items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-4 h-4 ${i < Math.round(camera.rating || 5) ? 'fill-current' : ''}`}
                style={{ color: i < Math.round(camera.rating || 5) ? '#fbbf24' : 'var(--text-muted)' }}
              />
            ))}
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {typeof camera.rating === 'number' ? camera.rating.toFixed(1) : '5.0'}
          </span>
          {camera.reviewCount > 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ({camera.reviewCount} đánh giá)
            </span>
          )}
        </div>

        {/* Description */}
        {camera.description && (
          <p className="min-h-0 flex-shrink-0 line-clamp-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {camera.description}
          </p>
        )}

        {/* Stock Status */}
        {lowStock && (
          <div className="flex min-h-0 flex-shrink-0 items-center gap-1 text-xs text-amber-500">
            <FiAlertCircle className="w-3.5 h-3.5" />
            <span>Chỉ còn {availability} sản phẩm</span>
          </div>
        )}

        {/* Price & Action */}
        <div
          className="mt-auto flex min-h-0 flex-shrink-0 items-end justify-between border-t pt-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div>
            <p className="text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>
              {formatCurrency(price)}
            </p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>/ ngày</p>
          </div>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.CAMERA_DETAIL.replace(':id', cameraId));
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
            }}
            whileHover={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              scale: 1.05,
            }}
          >
            <FiZoomIn className="w-4 h-4" />
            Chi tiết
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default memo(CameraCard);
