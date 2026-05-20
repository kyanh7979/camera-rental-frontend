import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiStar, FiTrendingUp, FiCamera, FiShield, FiClock, FiTruck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";

import Button from "../components/ui/Button.jsx";
import CameraCard from "../components/CameraCard.jsx";
import CategoryCard from "../components/CategoryCard.jsx";
import HomeBannerSection from "../components/HomeBannerSection.jsx";

import { CAMERA_CATEGORIES } from "../constants/filters.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { ROUTES } from "../constants/routes.js";
import { 
  DEFAULT_PLACEHOLDER, 
  getProductImages, 
  preloadProductImages,
  normalizeImageUrl,
  parseProductImages
} from "../utils/imageUtils.js";

import api from "../services/api.js";

const SLIDE_INTERVAL_MS = 3000;

// Fisher-Yates shuffle
const shuffleArray = (arr) => {
  if (!arr || arr.length === 0) return [];
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function Home() {
  const navigate = useNavigate();

  // State
  const [cameras, setCameras] = useState([]);
  const [sliderProducts, setSliderProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Refs
  const sliderTimerRef = useRef(null);
  const shuffledMapRef = useRef(new Map());
  const currentIdxRef = useRef(0);
  const imageIdxRef = useRef(0);
  const isMountedRef = useRef(true);
  const productsRef = useRef([]);

  // ================================================
  // FETCH DATA
  // ================================================
  useEffect(() => {
    isMountedRef.current = true;
    
    const fetchData = async () => {
      try {
        console.log("[Home] Fetching cameras...");
        const res = await api.get("/cameras", { 
          params: { page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' }
        });
        
        const data = res?.data?.data;
        let allCameras = [];
        
        if (Array.isArray(data)) {
          allCameras = data;
        } else if (data?.content && Array.isArray(data.content)) {
          allCameras = data.content;
        }
        
        console.log("[Home] Fetched cameras:", allCameras.length);
        console.log("[Home] Sample camera data:", allCameras[0]);

        if (isMountedRef.current) {
          setCameras(allCameras);
          productsRef.current = allCameras;
          
          // Filter products with valid images using utility function
          const withImages = allCameras.filter(p => {
            const imgs = parseProductImages(p);
            console.log(`[Home] Product ${p.id} "${p.name}": ${imgs.length} images - ${JSON.stringify(imgs).substring(0, 100)}`);
            return imgs.length > 0;
          });
          
          console.log("[Home] Slider products:", withImages.length);
          setSliderProducts(withImages);
          
          // Initialize shuffled map
          withImages.forEach(p => {
            if (!shuffledMapRef.current.has(p.id)) {
              shuffledMapRef.current.set(p.id, shuffleArray(parseProductImages(p)));
            }
          });
          
          // Preload all images in background
          preloadProductImages(withImages);
        }
      } catch (err) {
        console.error("[Home] Fetch error:", err);
        if (isMountedRef.current) {
          setCameras([]);
          setSliderProducts([]);
        }
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ================================================
  // SLIDER TIMER
  // ================================================
  useEffect(() => {
    // Cleanup existing timer
    if (sliderTimerRef.current) {
      clearInterval(sliderTimerRef.current);
      sliderTimerRef.current = null;
    }

    const products = sliderProducts;
    productsRef.current = products;
    
    if (products.length === 0) return;

    // Initialize refs
    currentIdxRef.current = 0;
    imageIdxRef.current = 0;
    setCurrentProductIndex(0);
    setCurrentImageIndex(0);

    const advance = () => {
      if (!isMountedRef.current) return;
      
      const totalProducts = productsRef.current.length;
      if (totalProducts === 0) return;

      const product = productsRef.current[currentIdxRef.current];
      if (!product) return;

      // Get images using utility
      let images = shuffledMapRef.current.get(product.id);
      if (!images || images.length === 0) {
        images = shuffleArray(parseProductImages(product));
        shuffledMapRef.current.set(product.id, images);
      }

      const nextImageIdx = imageIdxRef.current + 1;

      if (nextImageIdx < images.length) {
        // Next image
        imageIdxRef.current = nextImageIdx;
        setCurrentImageIndex(nextImageIdx);
      } else {
        // Next product
        currentIdxRef.current = (currentIdxRef.current + 1) % totalProducts;
        imageIdxRef.current = 0;
        setCurrentProductIndex(currentIdxRef.current);
        setCurrentImageIndex(0);
      }
    };

    // Start timer
    sliderTimerRef.current = setInterval(advance, SLIDE_INTERVAL_MS);

    // Cleanup
    return () => {
      if (sliderTimerRef.current) {
        clearInterval(sliderTimerRef.current);
        sliderTimerRef.current = null;
      }
    };
  }, [sliderProducts.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sliderTimerRef.current) {
        clearInterval(sliderTimerRef.current);
        sliderTimerRef.current = null;
      }
    };
  }, []);

  // ================================================
  // COMPUTED VALUES
  // ================================================
  
  // Current product
  const currentProduct = sliderProducts[currentProductIndex] || null;
  
  // Get safe images for current product
  const safeImages = currentProduct 
    ? (shuffledMapRef.current.get(currentProduct.id) || parseProductImages(currentProduct))
    : [];
  
  // Display image or placeholder
  const displayImage = safeImages[currentImageIndex] || DEFAULT_PLACEHOLDER;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    cameras.forEach(camera => {
      const category = typeof camera.category === 'object' 
        ? camera.category?.name 
        : camera.category;
      if (category) {
        counts[category] = (counts[category] || 0) + 1;
      }
    });
    return counts;
  }, [cameras]);

  // Featured products
  const featured = useMemo(() => {
    return [...cameras]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);
  }, [cameras]);

  // ================================================
  // RENDER
  // ================================================
  return (
    <div className="space-y-16 md:space-y-20">

      {/* HERO SECTION */}
      <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-center">
        {/* LEFT - Text */}
        <motion.div
          className="space-y-6"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
               style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)' }}>
            <FiCamera className="w-4 h-4" />
            <span>Dịch vụ thuê máy ảnh cao cấp</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            Nâng tầm từng 
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent"> khung hình </span>
            với thiết bị chuyên nghiệp
          </h1>

          <p className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Trải nghiệm dịch vụ thuê máy ảnh chuyên nghiệp với hàng trăm thiết bị từ các thương hiệu hàng đầu. 
            Giao hàng nhanh, hỗ trợ 24/7, giá cả hợp lý.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate(ROUTES.CAMERAS)}>
              Xem danh mục <FiArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate(ROUTES.CAMERAS)}>
              Máy nổi bật
            </Button>
          </div>
        </motion.div>

        {/* RIGHT - Hero Card */}
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            minHeight: '480px'
          }}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent z-0" />

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[480px]">
              <div className="w-12 h-12 border-4 border-t-4 rounded-full animate-spin"
                   style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : currentProduct ? (
            /* Slider Content */
            <div className="relative h-full min-h-[480px] flex flex-col">
              {/* Image Area */}
              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`product-${currentProduct.id}-image-${currentImageIndex}`}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  >
                    <img
                      src={displayImage}
                      alt={currentProduct.name || 'Product'}
                      className="w-full h-full object-contain"
                      style={{ minHeight: '320px', maxHeight: '400px' }}
                      onError={(e) => {
                        if (e.target.src !== DEFAULT_PLACEHOLDER) {
                          console.warn("[Home] Image load error for", displayImage, ", using placeholder");
                          e.target.src = DEFAULT_PLACEHOLDER;
                        }
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Product Dots */}
                {sliderProducts.length > 1 && (
                  <div className="absolute top-4 left-4 flex gap-2 z-10">
                    {sliderProducts.map((p, idx) => (
                      <div
                        key={`dot-${p.id || idx}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === currentProductIndex ? 'bg-cyan-400 scale-125' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Image Counter */}
                {safeImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {safeImages.map((_, idx) => (
                      <div
                        key={`img-dot-${idx}`}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          idx === currentImageIndex ? 'bg-cyan-400 scale-125' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Counter Badge */}
                <div className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium z-10"
                     style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                  {currentProductIndex + 1}/{sliderProducts.length}
                </div>
              </div>

              {/* Product Info */}
              <div className="relative z-10 p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-4 py-1.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                    NỔI BẬT
                  </span>
                  <div className="flex items-center gap-1.5">
                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                      {(currentProduct.rating || 5.0).toFixed(1)}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                  {currentProduct.name}
                </h3>

                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                  {typeof currentProduct.category === 'object'
                    ? currentProduct.category?.name
                    : currentProduct.category}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(currentProduct.pricePerDay || currentProduct.dailyPrice)}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>/ ngày</p>
                  </div>
                  <Button onClick={() => navigate(`/cameras/${currentProduct.id}`)}>
                    Chi tiết
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[480px] p-8">
              <FiCamera className="w-20 h-20 mb-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Không có sản phẩm nào để hiển thị</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Vui lòng thêm sản phẩm với hình ảnh
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* HOME BANNER */}
      <HomeBannerSection navigate={navigate} />

      {/* FEATURES */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <FiCamera className="w-6 h-6" />, title: '100+ Thiết bị', desc: 'Đa dạng lựa chọn', onClick: () => navigate(ROUTES.CAMERAS) },
          { icon: <FiShield className="w-6 h-6" />, title: 'Bảo hành', desc: 'Hỗ trợ kỹ thuật 24/7', onClick: () => navigate(ROUTES.WARRANTY_POLICY) },
          { icon: <FiTruck className="w-6 h-6" />, title: 'Giao nhanh', desc: 'Trong 24h', onClick: () => navigate(ROUTES.SHIPPING_POLICY) },
          { icon: <FiClock className="w-6 h-6" />, title: 'Linh hoạt', desc: 'Gia hạn dễ dàng', onClick: () => navigate(ROUTES.FLEXIBLE_DELIVERY) }
        ].map((item, i) => (
          <motion.div
            key={`feature-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            onClick={item.onClick}
            className="flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-cyan-500/40"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', color: 'var(--primary)' }}>
              {item.icon}
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CATEGORIES */}
      <section className="py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Danh mục sản phẩm
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Khám phá các loại thiết bị cho nhu cầu của bạn
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate(ROUTES.CAMERAS)}>
              Xem tất cả <FiArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {CAMERA_CATEGORIES.map((category, index) => (
              <CategoryCard
                key={`category-${category}`}
                name={category}
                productCount={categoryCounts[category] || 0}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                <FiTrendingUp className="w-6 h-6" style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Máy nổi bật
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Top sản phẩm được yêu thích nhất
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate(ROUTES.CAMERAS)}>
              Xem tất cả <FiArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={`skeleton-${i}`} className="rounded-2xl overflow-hidden animate-pulse"
                     style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div className="h-52" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                  <div className="p-4 space-y-3">
                    <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                    <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                    <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'var(--bg-secondary)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((camera, index) => (
                <motion.div
                  key={`featured-${camera.id || camera._id || index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <CameraCard camera={camera} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)' }}>
              <FiCamera className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)' }}>Không có sản phẩm nào</p>
            </div>
          )}
        </motion.div>
      </section>

    </div>
  );
}

export default Home;
