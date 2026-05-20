import { motion } from 'framer-motion';
import {
  FiCamera,
  FiMaximize,
  FiCircle,
  FiBox,
  FiVideo,
  FiFilm,
  FiZap,
  FiGlobe,
  FiNavigation,
  FiTrendingUp,
  FiGrid
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { CAMERA_CATEGORIES, CATEGORY_CONFIG, normalizeCategory } from '../constants/categories.js';

const getCategoryIcon = (name) => {
  const config = CATEGORY_CONFIG[name];
  if (config?.icon) {
    const IconComponent = config.icon;
    return <IconComponent className="w-8 h-8" />;
  }
  return <FiGrid className="w-8 h-8" />;
};

function CategoryCard({
  name,
  productCount = 0,
  index = 0
}) {
  const navigate = useNavigate();

  const normalizedName = normalizeCategory(name);
  const config = CATEGORY_CONFIG[normalizedName] || {
    icon: FiGrid,
    gradient: 'from-slate-600 to-slate-700',
    bgColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: 'rgba(100, 116, 139, 0.3)',
    hoverBg: 'rgba(100, 116, 139, 0.15)',
    textColor: 'var(--primary)',
    description: ''
  };

  const handleClick = () => {
    navigate(`/cameras?category=${encodeURIComponent(normalizedName)}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative w-full text-left overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: config.borderColor,
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      {/* Background Gradient Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Icon Container */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${config.gradient} shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-110`}
          style={{ color: 'white' }}
        >
          {getCategoryIcon(normalizedName)}
        </div>

        {/* Category Name */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold transition-colors duration-300 group-hover:text-cyan-400"
              style={{ color: 'var(--text-primary)' }}>
            {normalizedName}
          </h3>

          {config.description && (
            <p className="text-xs transition-colors duration-300"
               style={{ color: 'var(--text-muted)' }}>
              {config.description}
            </p>
          )}
        </div>

        {/* Product Count Badge */}
        {productCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
               style={{
                 backgroundColor: 'var(--bg-secondary)',
                 color: 'var(--text-muted)'
               }}>
            <FiBox className="w-3 h-3" />
            <span>{productCount} sản phẩm</span>
          </div>
        )}

        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
             style={{ color: config.textColor }}>
          <FiTrendingUp className="w-5 h-5" />
        </div>
      </div>
    </motion.button>
  );
}

export { CAMERA_CATEGORIES };
export default CategoryCard;
