import { motion } from 'framer-motion';
import { FiHeart, FiStar, FiCamera, FiZoomIn, FiCheck, FiAlertCircle } from 'react-icons/fi';
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
  sony: { bg: 'from-black to-gray-700', text: 'text-gray-800' },
  panasonic: { bg: 'from-red-600 to-red-800', text: 'text-red-600' },
  gopro: { bg: 'from-yellow-400 to-orange-500', text: 'text-orange-500' },
  dji: { bg: 'from-orange-500 to-red-500', text: 'text-orange-600' },
  blackmagic: { bg: 'from-gray-700 to-black', text: 'text-gray-600' },
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

  // Check if product is available
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

    // Check if out of stock
    if (isOutOfStock) {
      showError('Sản phẩm hiện không khả dụng');
      return;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      showSuccess('Vui lòng đăng nhập để thuê nhanh');
      navigate(ROUTES.LOGIN, {
        state: { from: ROUTES.CAMERA_DETAIL.replace(':id', cameraId) }
      });
      return;
    }

    // Add to cart and navigate to checkout
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

  const handleQuickRentClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    handleQuickRent(e);
  };

  const handleQuickRentButton = (e) => {
    e.stopPropagation();
    e.preventDefault();
    handleQuickRent(e);
  };

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => navigate(ROUTES.CAMERA_DETAIL.replace(':id', cameraId))}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-2xl"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {!imageUrl || imgError ? (
          <div className="flex h-full items-center justify-center">
            <FiCamera className="w-16 h-16 opacity-30" style={{ color: 'var(--text-muted)' }} />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Featured Badge */}
        {isFeatured && (
          <div className="absolute left-3 top-3">
            <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
              <FiStar className="w-3 h-3 fill-current" />
              Nổi bật
            </span>
          </div>
        )}

        {/* New Badge */}
        {isNew && !isFeatured && (
          <div className="absolute left-3 top-3">
            <span className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
              Mới
            </span>
          </div>
        )}

        {/* Low Stock Warning */}
        {lowStock && !isOutOfStock && (
          <div className="absolute right-3 top-3">
            <span className="flex items-center gap-1 rounded-lg bg-amber-500/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <FiAlertCircle className="w-3 h-3" />
              Sắp hết
            </span>
          </div>
        )}

        {/* Wishlist Button */}
        <motion.button
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl backdrop-blur-md transition-all duration-200"
          style={{ 
            backgroundColor: isWishlisted ? 'rgba(239, 68, 68, 0.9)' : 'rgba(15, 23, 42, 0.6)',
            color: isWishlisted ? 'white' : 'white'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </motion.button>

        {/* Category Badge */}
        {categoryName && !isFeatured && !isNew && (
          <div className="absolute left-3 top-3">
            <span className="rounded-lg px-2.5 py-1 text-xs font-medium backdrop-blur-md"
                  style={{ 
                    backgroundColor: 'rgba(6, 182, 212, 0.8)',
                    color: 'white'
                  }}>
              {categoryName}
            </span>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <span className="rounded-xl bg-red-600/90 px-4 py-2 text-sm font-bold text-white shadow-lg">
              Hết hàng
            </span>
          </div>
        )}

        {/* Quick Rent Button */}
        {!isOutOfStock && (
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button
              onClick={handleQuickRentButton}
              className="w-full rounded-xl py-3 text-sm font-bold shadow-lg transition-all duration-200 hover:shadow-xl"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Thuê ngay
            </button>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${brandColor.text}`}>
              {brandName || 'Unknown Brand'}
            </span>
            <div className={`h-px w-6 bg-gradient-to-r ${brandColor.bg}`} />
          </div>
          {categoryName && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {categoryName}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-cyan-400 transition-colors duration-200 text-base"
            style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
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
          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {camera.description}
          </p>
        )}

        {/* Stock Status */}
        {lowStock && (
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <FiAlertCircle className="w-3.5 h-3.5" />
            <span>Chỉ còn {availability} sản phẩm</span>
          </div>
        )}

        {/* Price & Action */}
        <div className="mt-auto flex items-end justify-between pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
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
              color: 'var(--text-secondary)'
            }}
            whileHover={{ 
              backgroundColor: 'var(--primary)',
              color: 'white',
              scale: 1.05
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
