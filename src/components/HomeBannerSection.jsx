import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getHomeBanners } from "../services/bannerService";

const SLIDE_INTERVAL_MS = 5000;

// Fixed content for the banner
const BANNER_CONTENT = {
  subtitle: "LensRent Premium Collection",
  title: "Thiết bị cao cấp cho mọi khoảnh khắc sáng tạo",
  description: "Sony • Canon • Nikon • Fujifilm — Thuê nhanh, giao tận nơi, trải nghiệm chuyên nghiệp.",
  buttonText: "Khám phá ngay",
  buttonLink: "/products",
};

function HomeBannerSection() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await getHomeBanners();
        if (res?.data?.data && Array.isArray(res.data.data)) {
          setBanners(res.data.data);
        }
      } catch (err) {
        console.log("[HomeBanner] No active banners or error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto slide
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const handleClick = () => {
    navigate(BANNER_CONTENT.buttonLink);
  };

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="mx-4 lg:mx-8 mb-8 md:mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="relative w-full rounded-2xl lg:rounded-3xl overflow-hidden group"
        style={{
          aspectRatio: '16/7',
          maxHeight: '420px'
        }}
      >
        {/* Banner Slider */}
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {/* Background Image */}
              <img
                src={currentBanner.imageUrl}
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.opacity = '0';
                }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Content - Always visible */}
          <div className="absolute inset-0 flex items-center">
            <div className="p-8 md:p-12 lg:p-16 max-w-[65%]">
              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-white/90 text-sm md:text-base font-medium mb-2 md:mb-3 tracking-wide"
              >
                {BANNER_CONTENT.subtitle}
              </motion.p>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-white text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 line-clamp-2 drop-shadow-lg"
              >
                {BANNER_CONTENT.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-white/80 text-sm md:text-base mb-4 md:mb-6 hidden sm:block max-w-lg"
              >
                {BANNER_CONTENT.description}
              </motion.p>

              {/* CTA Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                onClick={handleClick}
                className="flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 hover:gap-3"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)'
                }}
              >
                {BANNER_CONTENT.buttonText}
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </div>
          </div>

          {/* Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? 'bg-white scale-110' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Decorative Elements */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex gap-2 opacity-50">
            <div className="w-2 h-2 rounded-full bg-white/50" />
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default HomeBannerSection;
