import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiStar, FiHeart, FiShoppingCart, FiZoomIn, FiX,
  FiCamera, FiCpu, FiGrid, FiSun, FiVideo, FiCrosshair, FiFeather,
  FiWifi, FiBattery, FiLink, FiAward, FiShield, FiTruck, FiClock,
  FiMessageCircle, FiPhone, FiChevronLeft, FiChevronRight,
  FiCheck, FiPackage, FiAlertTriangle, FiCalendar, FiDollarSign,
  FiTrendingUp, FiWind, FiCheckCircle, FiStar as FiStarFilled,
  FiSend, FiEdit3, FiTrash2, FiUser, FiInfo, FiBox, FiPercent,
  FiMapPin, FiTag, FiZap, FiBox as FiBoxIcon, FiRotateCw, FiSliders
} from 'react-icons/fi';
import { CAMERAS } from '../constants/cameras.js';
import api from '../services/api.js';
import { getReviewsByCamera, createReview, deleteReview } from '../services/reviewService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { getTodayISO, calculateRentalDays } from '../utils/date.js';
import Button from '../components/ui/Button.jsx';
import useCartStore from '../store/cartStore.js';
import useWishlistStore from '../store/wishlistStore.js';
import { showSuccess, showError } from '../components/ui/ToastNotification.jsx';
import { ROUTES } from '../constants/routes.js';
import useAuth from '../hooks/useAuth.js';

const CAMERA_ENDPOINT = import.meta.env.VITE_CAMERA_ENDPOINT || '/cameras';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const normalizeId = (camera) => String(camera?.id ?? camera?._id ?? camera?.cameraId ?? '');
const normalizePrice = (camera) => camera?.pricePerDay ?? camera?.dailyPrice ?? camera?.price ?? 0;
const toAbsoluteImage = (value) => {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `${API_BASE_URL}/${value}`.replace(/([^:]\/)\/+/g, '$1');
};
const normalizeImages = (camera) => {
  if (Array.isArray(camera?.images) && camera.images.length > 0) {
    return camera.images.map(toAbsoluteImage).filter(Boolean);
  }
  if (camera?.image) return [toAbsoluteImage(camera.image)];
  return ['https://images.pexels.com/photos/800/600'];
};
const normalizeSampleImages = (camera) => {
  if (Array.isArray(camera?.sampleImages) && camera.sampleImages.length > 0) {
    return camera.sampleImages.map(img => ({
      imageUrl: toAbsoluteImage(img.imageUrl || img.url || img),
      title: img.title || img.name || ''
    })).filter(img => img.imageUrl);
  }
  return [];
};

const DEMO_REVIEWS = [
  { id: 1, userName: 'Minh Hoàng', userAvatar: 'https://i.pravatar.cc/100?img=1', rating: 5, comment: 'Máy ảnh tuyệt vời! Chất lượng hình ảnh siêu nét, lấy nét nhanh và chính xác. Đã thuê 3 lần và luôn hài lòng.', createdAt: '2024-03-15' },
  { id: 2, userName: 'Thu Hà', userAvatar: 'https://i.pravatar.cc/100?img=5', rating: 5, comment: 'Trải nghiệm thuê máy ảnh tốt nhất! Máy mới, sạch sẽ, đầy đủ phụ kiện. Giao hàng nhanh chóng.', createdAt: '2024-03-10' },
  { id: 3, userName: 'Đức Anh', userAvatar: 'https://i.pravatar.cc/100?img=3', rating: 4, comment: 'Máy hoạt động tốt, pin trâu. Giá thuê hợp lý. Sẽ quay lại!', createdAt: '2024-03-05' }
];

const SPECS_ICONS = {
  'megapixels': <FiGrid className="w-4 h-4" />,
  'sensor': <FiCpu className="w-4 h-4" />,
  'video': <FiVideo className="w-4 h-4" />,
  'stabilization': <FiWind className="w-4 h-4" />,
  'mount': <FiLink className="w-4 h-4" />,
  'iso': <FiSun className="w-4 h-4" />,
  'autofocus': <FiCrosshair className="w-4 h-4" />,
  'weight': <FiFeather className="w-4 h-4" />,
  'battery': <FiBattery className="w-4 h-4" />,
  'connectivity': <FiWifi className="w-4 h-4" />,
  'resolution': <FiCamera className="w-4 h-4" />,
  'default': <FiAward className="w-4 h-4" />
};

const getAvatarFromName = (name) => {
  const colors = ['1a5f7a', '57c5b6', '159895', '26a69a', '4db6ac', '80cbc4'];
  const color = colors[name?.charCodeAt(0) % colors.length] || '4db6ac';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=${color}&color=fff&size=128`;
};

// Content Tabs
const TABS = [
  { id: 'info', label: 'Thông tin', icon: <FiInfo className="w-4 h-4" /> },
  { id: 'specs', label: 'Thông số', icon: <FiSliders className="w-4 h-4" /> },
  { id: 'samples', label: 'Ảnh thực tế', icon: <FiCamera className="w-4 h-4" /> },
  { id: 'policy', label: 'Chính sách', icon: <FiShield className="w-4 h-4" /> },
];

function CameraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [camera, setCamera] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeSample, setActiveSample] = useState(0);
  const [isSampleZoomed, setIsSampleZoomed] = useState(false);
  const thumbnailRef = useRef(null);
  const sampleThumbRef = useRef(null);
  const [activeTab, setActiveTab] = useState('info');

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const loadCamera = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`${CAMERA_ENDPOINT}/${id}`);
        const payload = response?.data;
        const item = payload?.data || payload?.item || payload;
        if (item && normalizeId(item)) {
          setCamera(item);
          return;
        }
      } catch (error) {
        const demoCamera = CAMERAS.find(c => c.id === id);
        if (demoCamera) {
          setCamera(demoCamera);
          return;
        }
      }
      setCamera(null);
    };
    loadCamera().finally(() => setIsLoading(false));
  }, [id]);

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const response = await getReviewsByCamera(id, 0, 20);
      const data = response?.data?.data;
      if (data?.content && data.content.length > 0) {
        setReviews(data.content);
        setTotalReviews(data.totalElements || data.content.length);
        const avg = data.content.reduce((sum, r) => sum + r.rating, 0) / data.content.length;
        setAverageRating(avg);
      } else {
        setReviews(DEMO_REVIEWS);
        setTotalReviews(DEMO_REVIEWS.length);
        setAverageRating(4.5);
      }
    } catch (error) {
      setReviews(DEMO_REVIEWS);
      setTotalReviews(DEMO_REVIEWS.length);
      setAverageRating(4.5);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const images = useMemo(() => normalizeImages(camera), [camera]);
  const sampleImages = useMemo(() => normalizeSampleImages(camera), [camera]);

  const [startDate, setStartDate] = useState(getTodayISO());
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  });

  const rentalDays = calculateRentalDays(startDate, endDate);
  const { addToCart } = useCartStore();
  const { items, addWishlist, removeWishlist } = useWishlistStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-muted)' }}>Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
          <FiAlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Không tìm thấy sản phẩm</h2>
          <p style={{ color: 'var(--text-muted)' }}>Sản phẩm này có thể đã bị xóa hoặc không tồn tại.</p>
          <Button className="mt-4" onClick={() => navigate(ROUTES.CAMERAS)}>Quay lại danh mục</Button>
        </div>
      </div>
    );
  }

  const cameraId = normalizeId(camera);
  const pricePerDay = normalizePrice(camera);
  const depositPrice = camera.deposit || camera.depositPrice || pricePerDay * 30;
  const isWishlisted = items.some((item) => String(item.id) === cameraId);
  const totalPrice = pricePerDay * rentalDays;
  const availability = camera.availability || 'Còn hàng';
  const displayRating = totalReviews > 0 && averageRating > 0 ? averageRating : (camera.rating || 4.8);
  const userReview = reviews.find(r => r.userId === user?.id);

  const parseSpecifications = () => {
    if (camera.specs && typeof camera.specs === 'object' && !Array.isArray(camera.specs)) return camera.specs;
    const specsData = camera.specifications;
    if (typeof specsData === 'string' && specsData.trim()) {
      try { return JSON.parse(specsData); } catch { return {}; }
    }
    if (typeof specsData === 'object' && specsData !== null && !Array.isArray(specsData)) return specsData;
    return {};
  };
  const specs = parseSpecifications();
  const features = camera.features || [];

  const handleAddToCart = () => {
    addToCart({ ...camera, id: cameraId, pricePerDay, images }, rentalDays);
    showSuccess('Đã thêm vào giỏ hàng!');
  };
  const handleWishlist = () => {
    if (isWishlisted) { removeWishlist(cameraId); showSuccess('Đã xóa khỏi danh sách yêu thích'); }
    else { addWishlist({ ...camera, id: cameraId, pricePerDay, images }); showSuccess('Đã thêm vào danh sách yêu thích'); }
  };
  const handleRentNow = () => {
    if (!startDate || !endDate) { showError('Vui lòng chọn thời gian thuê'); return; }
    if (new Date(endDate) <= new Date(startDate)) { showError('Ngày trả máy phải lớn hơn ngày nhận máy'); return; }
    const rentalItem = {
      cameraId, id: cameraId, name: camera.name, brand: camera.brand,
      category: typeof camera.category === 'object' ? camera.category?.name : camera.category,
      image: images[0], pricePerDay, rentalDays, startDate, endDate, _rentNow: true
    };
    navigate(ROUTES.CHECKOUT, { state: { rentNowItem: rentalItem } });
  };

  const scrollThumbnails = (direction) => {
    if (thumbnailRef.current) thumbnailRef.current.scrollBy({ left: direction === 'left' ? -100 : 100, behavior: 'smooth' });
  };
  const scrollSampleThumbnails = (direction) => {
    if (sampleThumbRef.current) sampleThumbRef.current.scrollBy({ left: direction === 'left' ? -100 : 100, behavior: 'smooth' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) { showError('Vui lòng chọn số sao đánh giá'); return; }
    if (!reviewComment.trim()) { showError('Vui lòng nhập nội dung đánh giá'); return; }
    setIsSubmittingReview(true);
    try {
      await createReview({ cameraId: parseInt(cameraId), rating: reviewRating, comment: reviewComment.trim() });
      showSuccess('Cảm ơn bạn đã đánh giá!');
      setReviewRating(0); setReviewComment(''); setShowReviewForm(false);
      loadReviews();
    } catch (error) { showError(error.response?.data?.message || 'Không thể gửi đánh giá.'); }
    finally { setIsSubmittingReview(false); }
  };
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    try { await deleteReview(reviewId); showSuccess('Đã xóa đánh giá'); loadReviews(); }
    catch (error) { showError('Không thể xóa đánh giá'); }
  };

  const renderRatingStars = () => Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    const isFilled = hoverRating ? starValue <= hoverRating : starValue <= reviewRating;
    return (
      <button key={i} type="button" onClick={() => setReviewRating(starValue)}
        onMouseEnter={() => setHoverRating(starValue)} onMouseLeave={() => setHoverRating(0)}
        className="p-1 transition-transform hover:scale-110">
        <FiStarFilled className={`w-7 h-7 transition-colors ${isFilled ? 'fill-current' : ''}`}
          style={{ color: isFilled ? '#fbbf24' : 'var(--text-muted)' }} />
      </button>
    );
  });
  const renderStars = (count, max = 5, size = 'w-4 h-4') => Array.from({ length: max }, (_, i) => (
    <FiStarFilled key={i} className={`${size} ${i < count ? 'fill-current' : ''}`}
      style={{ color: i < count ? '#fbbf24' : 'var(--text-muted)' }} />
  ));
  const getSpecIcon = (key) => {
    const lowerKey = key.toLowerCase();
    for (const [k, icon] of Object.entries(SPECS_ICONS)) {
      if (lowerKey.includes(k)) return icon;
    }
    return SPECS_ICONS.default;
  };
  const getRatingDistribution = () => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++; });
    const total = reviews.length || 1;
    return { 5: Math.round((dist[5] / total) * 100), 4: Math.round((dist[4] / total) * 100), 3: Math.round((dist[3] / total) * 100), 2: Math.round((dist[2] / total) * 100), 1: Math.round((dist[1] / total) * 100) };
  };
  const ratingDist = getRatingDistribution();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button onClick={() => navigate(ROUTES.CAMERAS)}
          className="inline-flex items-center gap-2 text-sm transition-colors hover:text-cyan-400"
          style={{ color: 'var(--text-muted)' }}>
          <FiArrowLeft className="w-4 h-4" />
          <span>Quay lại danh mục</span>
        </button>
      </div>

      {/* MAIN CONTENT - Fixed Layout */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_0.7fr] gap-8" style={{ alignItems: 'start' }}>

          {/* ==================== COLUMN 1: GALLERY ONLY ==================== */}
          <div>
            {/* Main Image */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="relative overflow-hidden rounded-2xl cursor-zoom-in group"
                style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div className="relative" style={{ minHeight: '480px' }}>
                  <AnimatePresence mode="wait">
                    <motion.img key={activeThumb} src={images[activeThumb] || images[0]} alt={camera.name}
                      className="w-full h-full object-contain absolute inset-0 p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }} />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 right-4 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{ backgroundColor: 'rgba(6, 182, 212, 0.9)' }}>
                    <FiZoomIn className="w-5 h-5 text-white" />
                  </div>
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                      <span className="text-xs font-medium text-white">{activeThumb + 1} / {images.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="relative mt-4">
                  <button onClick={() => scrollThumbnails('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md hover:scale-110 transition-transform shadow-lg"
                    style={{ backgroundColor: 'var(--bg-card)' }}>
                    <FiChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  </button>
                  <div ref={thumbnailRef} className="flex gap-2 overflow-x-auto scrollbar-hide px-11 py-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {images.map((img, idx) => (
                      <button key={idx} onClick={() => setActiveThumb(idx)}
                        className={`flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                          idx === activeThumb ? 'ring-2 ring-cyan-500 ring-offset-2 scale-105 shadow-lg' : 'hover:ring-2 hover:ring-cyan-500/50 hover:scale-105 opacity-70 hover:opacity-100'
                        }`} style={{ width: '64px', height: '64px', ringOffsetColor: 'var(--bg-primary)' }}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <button onClick={() => scrollThumbnails('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md hover:scale-110 transition-transform shadow-lg"
                    style={{ backgroundColor: 'var(--bg-card)' }}>
                    <FiChevronRight className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* ==================== COLUMN 2: PRODUCT INFO + RENTAL ==================== */}
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            {/* Brand & Category */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: 'var(--primary)', color: '#0f172a' }}>{camera.brand}</span>
              <span className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                {camera.category?.name || camera.category || 'Máy ảnh'}
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {camera.name}
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">{renderStars(Math.round(displayRating), 5, 'w-4 h-4')}</div>
                <span className="font-bold" style={{ color: 'var(--primary)' }}>{displayRating.toFixed(1)}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>({totalReviews} đánh giá)</span>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{ backgroundColor: availability === 'Còn hàng' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)', color: availability === 'Còn hàng' ? '#22c55e' : '#f59e0b' }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: availability === 'Còn hàng' ? '#22c55e' : '#f59e0b' }} />
                <span className="font-medium">{availability}</span>
              </div>
              {camera.available && (
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Còn lại: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{camera.available}</span></span>
              )}
            </div>

            {/* Price Display */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(pricePerDay)}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/ngày</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tiền đặt cọc</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(depositPrice)}</span>
              </div>
            </div>

            {/* Rental Period */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <FiCalendar className="w-4 h-4" /> Chọn thời gian thuê
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Ngày nhận</label>
                  <input type="date" value={startDate} min={getTodayISO()} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--primary)' }} />
                </div>
                <div>
                  <label className="block text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Ngày trả</label>
                  <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--primary)' }} />
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tổng <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{rentalDays}</span> ngày</span>
                <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            {/* Rent Now Button */}
            <Button size="lg" className="w-full font-bold py-3.5 text-base" onClick={handleRentNow}
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0891b2 100%)', boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)' }}>
              <span className="flex items-center justify-center gap-2"><FiZap className="w-5 h-5" />Thuê ngay</span>
            </Button>
          </motion.div>

          {/* ==================== COLUMN 3: SUPPORT + ACTIONS ==================== */}
          <div>
            <motion.div className="sticky top-28 space-y-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
              {/* Support Card - Fixed Phone Number */}
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <FiPhone className="w-4 h-4" /> Liên hệ hỗ trợ
                </h3>
                <a href="tel:0359506390" className="flex items-center gap-3 p-3 rounded-lg transition-all"
                  style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                    <FiPhone className="w-5 h-5 text-slate-900" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider mb-0.5 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Hotline 24/7</p>
                    <p className="text-lg font-bold whitespace-nowrap" style={{ color: 'var(--primary)' }}>0359 506 390</p>
                  </div>
                </a>
              </div>

              {/* Action Buttons - Cart & Wishlist */}
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="flex-1 py-3 px-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 text-sm"
                  style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                  <FiShoppingCart className="w-5 h-5" />Giỏ hàng
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleWishlist}
                  className="flex-1 py-3 px-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 text-sm"
                  style={{ borderColor: isWishlisted ? '#ef4444' : 'var(--border-color)', backgroundColor: isWishlisted ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-card)', color: isWishlisted ? '#ef4444' : 'var(--text-secondary)' }}>
                  <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'Đã thích' : 'Yêu thích'}
                </motion.button>
              </div>

              {/* Quick Benefits */}
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                      <FiCheckCircle className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Máy mới 100%</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                      <FiShield className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Bảo hành 12 tháng</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                      <FiTruck className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Giao tận nơi</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                      <FiTrendingUp className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Yêu thích nhất</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRODUCT TABS - Full Width Below Hero */}
      <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        
          {/* Tab Headers */}
          <div className="flex overflow-x-auto border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id ? 'border-cyan-500' : 'border-transparent'
                }`}
                style={{ color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                {tab.icon}{tab.label}
                {tab.id === 'samples' && sampleImages.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)' }}>{sampleImages.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Info Tab - Description */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                {camera.description && (
                  <div>
                    <h3 className="text-base font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <FiBoxIcon className="w-5 h-5" /> Mô tả sản phẩm
                    </h3>
                    <div className="p-6 rounded-xl leading-relaxed" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      <p className="whitespace-pre-line text-base">{camera.description}</p>
                    </div>
                  </div>
                )}
                {features.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <FiAward className="w-5 h-5" /> Tính năng nổi bật
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(6, 182, 212, 0.08)' }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                            <FiCheck className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-base" style={{ color: 'var(--text-primary)' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specs Tab - Full Specifications */}
            {activeTab === 'specs' && specs && Object.keys(specs).length > 0 && (
              <div>
                <h3 className="text-base font-semibold uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <FiSliders className="w-5 h-5" /> Thông số kỹ thuật
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl transition-colors hover:shadow-md"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}>
                          <span style={{ color: 'var(--primary)' }}>{getSpecIcon(key)}</span>
                        </div>
                        <span className="text-sm capitalize" style={{ color: 'var(--text-muted)' }}>{key.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Images Tab */}
            {activeTab === 'samples' && (
              <div className="space-y-4">
                {sampleImages.length > 0 ? (
                  <>
                    <h3 className="text-base font-semibold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <FiCamera className="w-5 h-5" /> Ảnh thực tế từ thiết bị ({sampleImages.length})
                    </h3>
                    <div className="relative overflow-hidden rounded-2xl cursor-zoom-in group"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                      onClick={() => setIsSampleZoomed(true)}>
                      <div className="aspect-video relative">
                        <img src={sampleImages[activeSample]?.imageUrl} alt={sampleImages[activeSample]?.title || 'Sample'}
                          className="w-full h-full object-contain p-4" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 right-4 p-3 rounded-xl backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"
                          style={{ backgroundColor: 'rgba(6, 182, 212, 0.9)' }}>
                          <FiZoomIn className="w-5 h-5 text-white" />
                        </div>
                        {sampleImages.length > 1 && (
                          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                            <span className="text-xs font-medium text-white">{activeSample + 1} / {sampleImages.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {sampleImages[activeSample]?.title && (
                      <p className="text-center text-base font-medium" style={{ color: 'var(--text-secondary)' }}>{sampleImages[activeSample].title}</p>
                    )}
                    {sampleImages.length > 1 && (
                      <div className="relative">
                        <button onClick={() => scrollSampleThumbnails('left')}
                          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-md"
                          style={{ backgroundColor: 'var(--bg-card)' }}>
                          <FiChevronLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                        </button>
                        <div ref={sampleThumbRef} className="flex gap-2 overflow-x-auto px-12 py-2"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {sampleImages.map((img, idx) => (
                            <button key={idx} onClick={() => setActiveSample(idx)}
                              className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-xl transition-all ${
                                idx === activeSample ? 'ring-2 ring-cyan-500 ring-offset-2 scale-105' : 'hover:ring-2 hover:ring-cyan-500/50 opacity-70 hover:opacity-100'
                              }`}>
                              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <button onClick={() => scrollSampleThumbnails('right')}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md shadow-md"
                          style={{ backgroundColor: 'var(--bg-card)' }}>
                          <FiChevronRight className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <FiCamera className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-base" style={{ color: 'var(--text-muted)' }}>Chưa có ảnh thực tế cho sản phẩm này</p>
                  </div>
                )}
              </div>
            )}

            {/* Policy Tab */}
            {activeTab === 'policy' && (
              <div>
                <h3 className="text-base font-semibold uppercase tracking-wider mb-5 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <FiShield className="w-5 h-5" /> Chính sách thuê
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: <FiDollarSign className="w-5 h-5" />, title: 'Tiền đặt cọc', desc: formatCurrency(depositPrice), color: '#22c55e', highlight: true },
                    { icon: <FiPackage className="w-5 h-5" />, title: 'Quy định trả máy', desc: 'Sạch sẽ, đầy đủ phụ kiện', color: '#3b82f6' },
                    { icon: <FiAlertTriangle className="w-5 h-5" />, title: 'Đền bù hư hỏng', desc: 'Theo mức độ thiệt hại thực tế', color: '#ef4444' },
                    { icon: <FiTruck className="w-5 h-5" />, title: 'Giao hàng', desc: 'Hỗ trợ giao tận nơi', color: '#8b5cf6' },
                    { icon: <FiClock className="w-5 h-5" />, title: 'Gia hạn thuê', desc: 'Liên hệ trước 24h', color: '#f59e0b' },
                    { icon: <FiCheck className="w-5 h-5" />, title: 'Bảo hành', desc: 'Hỗ trợ kỹ thuật 24/7', color: '#06b6d4' }
                  ].map((item, idx) => (
                    <motion.div key={idx} className="p-5 rounded-xl border transition-all duration-300 hover:shadow-lg"
                      style={{ backgroundColor: item.highlight ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-secondary)', borderColor: item.highlight ? 'var(--primary)' : 'var(--border-color)' }}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                          <span style={{ color: item.color }}>{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                <FiStar className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Đánh giá khách hàng</h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{totalReviews} đánh giá</p>
              </div>
            </div>
            {isAuthenticated && (
              <button onClick={() => setShowReviewForm(!showReviewForm)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all"
                style={{ backgroundColor: showReviewForm ? 'var(--bg-secondary)' : 'var(--primary)', color: showReviewForm ? 'var(--text-secondary)' : '#0f172a' }}>
                {showReviewForm ? <><FiX className="w-4 h-4" />Đóng</> : <><FiEdit3 className="w-4 h-4" />Viết đánh giá</>}
              </button>
            )}
          </div>

          {/* Review Form */}
          <AnimatePresence>
            {showReviewForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <FiEdit3 className="w-5 h-5" style={{ color: 'var(--primary)' }} />Đánh giá của bạn
                  </h3>
                  <div className="mb-4">
                    <label className="block text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Chọn số sao *</label>
                    <div className="flex items-center gap-1">{renderRatingStars()}</div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm mb-2 font-medium" style={{ color: 'var(--text-secondary)' }}>Nội dung đánh giá *</label>
                    <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Chia sẻ trải nghiệm của bạn..." rows={4}
                      className="w-full px-4 py-3 rounded-xl border text-sm resize-none outline-none focus:ring-2"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--primary)' }} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setShowReviewForm(false); setReviewRating(0); setReviewComment(''); }}
                      className="px-4 py-2.5 rounded-xl border transition-all" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>Hủy</button>
                    <button onClick={handleSubmitReview} disabled={isSubmittingReview || reviewRating === 0 || !reviewComment.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50"
                      style={{ backgroundColor: 'var(--primary)', color: '#0f172a' }}>
                      {isSubmittingReview ? 'Đang gửi...' : <><FiSend className="w-4 h-4" />Gửi đánh giá</>}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isAuthenticated && (
            <div className="p-4 rounded-xl mb-6 flex items-center gap-3" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
              <FiUser className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Vui lòng <a href={ROUTES.LOGIN} className="underline font-semibold" style={{ color: 'var(--primary)' }}>đăng nhập</a> để viết đánh giá</p>
            </div>
          )}

          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl mb-6"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="text-center min-w-[120px] p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <p className="text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>{displayRating.toFixed(1)}</p>
              <div className="flex items-center justify-center gap-0.5 mb-1">{renderStars(Math.round(displayRating), 5, 'w-4 h-4')}</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{totalReviews} đánh giá</p>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm w-5" style={{ color: 'var(--text-muted)' }}>{star}</span>
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${ratingDist[star] || 0}%`, backgroundColor: 'var(--primary)' }} />
                  </div>
                  <span className="text-xs w-10 text-right" style={{ color: 'var(--text-muted)' }}>{ratingDist[star] || 0}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Grid */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-3 border-t-3 rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 rounded-xl" style={{ backgroundColor: 'var(--bg-card)' }}>
              <FiStar className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Chưa có đánh giá nào</p>
              <p style={{ color: 'var(--text-muted)' }}>Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review, idx) => (
                <motion.div key={review.id || idx} className="p-5 rounded-2xl border relative"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * idx }}>
                  {review.userId === user?.id && (
                    <button onClick={() => handleDeleteReview(review.id)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-red-500/10" title="Xóa">
                      <FiTrash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <img src={review.userAvatar || getAvatarFromName(review.userName)} alt={review.userName}
                      className="w-10 h-10 rounded-full object-cover ring-2" style={{ ringColor: 'var(--primary)' }}
                      onError={(e) => { e.target.src = getAvatarFromName(review.userName); }} />
                    <div>
                      <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{review.userName}</h4>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">{renderStars(review.rating, 5, 'w-3.5 h-3.5')}</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{review.comment}"</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* IMAGE ZOOM MODAL */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)' }}
            onClick={() => setIsZoomed(false)}>
            <button onClick={() => setIsZoomed(false)} className="absolute top-6 right-6 p-3 rounded-full hover:scale-110 z-10"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}><FiX className="w-6 h-6 text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); setActiveThumb(Math.max(0, activeThumb - 1)); }}
              className="absolute left-6 p-4 rounded-full hover:scale-110 z-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <FiChevronLeft className="w-8 h-8 text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); setActiveThumb(Math.min(images.length - 1, activeThumb + 1)); }}
              className="absolute right-6 p-4 rounded-full hover:scale-110 z-10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <FiChevronRight className="w-8 h-8 text-white" /></button>
            <motion.img key={activeThumb} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={images[activeThumb]} alt={camera.name} className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              {images.map((_, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveThumb(idx); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeThumb ? 'w-8 bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
            <div className="absolute top-6 left-6 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              <span className="text-sm font-medium text-white">{activeThumb + 1} / {images.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SAMPLE IMAGE ZOOM MODAL */}
      <AnimatePresence>
        {isSampleZoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(10px)' }}
            onClick={() => setIsSampleZoomed(false)}>
            <button onClick={() => setIsSampleZoomed(false)} className="absolute top-6 right-6 p-3 rounded-full z-10"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}><FiX className="w-6 h-6 text-white" /></button>
            <motion.img key={`sample-${activeSample}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              src={sampleImages[activeSample]?.imageUrl} alt={sampleImages[activeSample]?.title || 'Sample'}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
              {sampleImages.map((_, idx) => (
                <button key={idx} onClick={(e) => { e.stopPropagation(); setActiveSample(idx); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeSample ? 'w-8 bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CameraDetail;
