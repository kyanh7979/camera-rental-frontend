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
  FiDisc,
  FiPackage
} from 'react-icons/fi';

export const CAMERA_CATEGORIES = [
  'Máy ảnh DSLR',
  'Máy ảnh Mirrorless',
  'Máy ảnh Compact',
  'Máy ảnh Du Lịch',
  'Máy ảnh Vlog',
  'Máy quay Video',
  'Máy ảnh Cinema',
  'Action Camera',
  'Camera 360',
  'Flycam',
  'Lens',
  'Phụ kiện'
];

export const CATEGORY_CONFIG = {
  'Máy ảnh DSLR': {
    icon: FiCamera,
    gradient: 'from-blue-600 to-blue-700',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    hoverBg: 'rgba(59, 130, 246, 0.15)',
    textColor: '#3b82f6',
    description: 'Máy ảnh chuyên nghiệp'
  },
  'Máy ảnh Mirrorless': {
    icon: FiMaximize,
    gradient: 'from-cyan-600 to-cyan-700',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    hoverBg: 'rgba(6, 182, 212, 0.15)',
    textColor: '#06b6d4',
    description: 'Nhẹ, hiện đại, không gương lật'
  },
  'Máy ảnh Compact': {
    icon: FiCircle,
    gradient: 'from-purple-600 to-purple-700',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    hoverBg: 'rgba(168, 85, 247, 0.15)',
    textColor: '#a855f7',
    description: 'Nhỏ gọn, tiện lợi'
  },
  'Máy ảnh Du Lịch': {
    icon: FiNavigation,
    gradient: 'from-green-600 to-green-700',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    hoverBg: 'rgba(34, 197, 94, 0.15)',
    textColor: '#22c55e',
    description: 'Gọn nhẹ, dễ mang theo'
  },
  'Máy ảnh Vlog': {
    icon: FiVideo,
    gradient: 'from-pink-600 to-pink-700',
    bgColor: 'rgba(236, 72, 153, 0.1)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    hoverBg: 'rgba(236, 72, 153, 0.15)',
    textColor: '#ec4899',
    description: 'Tự quay, Live stream'
  },
  'Máy quay Video': {
    icon: FiFilm,
    gradient: 'from-red-600 to-red-700',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    hoverBg: 'rgba(239, 68, 68, 0.15)',
    textColor: '#ef4444',
    description: 'Chất lượng quay phim cao'
  },
  'Máy ảnh Cinema': {
    icon: FiFilm,
    gradient: 'from-orange-600 to-orange-700',
    bgColor: 'rgba(249, 115, 22, 0.1)',
    borderColor: 'rgba(249, 115, 22, 0.3)',
    hoverBg: 'rgba(249, 115, 22, 0.15)',
    textColor: '#f97316',
    description: 'Chuyên nghiệp, điện ảnh'
  },
  'Action Camera': {
    icon: FiZap,
    gradient: 'from-yellow-600 to-yellow-700',
    bgColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    hoverBg: 'rgba(234, 179, 8, 0.15)',
    textColor: '#eab308',
    description: 'Chống nước, gắn mũ, xe'
  },
  'Camera 360': {
    icon: FiGlobe,
    gradient: 'from-indigo-600 to-indigo-700',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    hoverBg: 'rgba(99, 102, 241, 0.15)',
    textColor: '#6366f1',
    description: 'Góc nhìn 360 độ'
  },
  'Flycam': {
    icon: FiNavigation,
    gradient: 'from-teal-600 to-teal-700',
    bgColor: 'rgba(20, 184, 166, 0.1)',
    borderColor: 'rgba(20, 184, 166, 0.3)',
    hoverBg: 'rgba(20, 184, 166, 0.15)',
    textColor: '#14b8a6',
    description: 'Máy bay không người lái'
  },
  'Lens': {
    icon: FiDisc,
    gradient: 'from-rose-600 to-rose-700',
    bgColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    hoverBg: 'rgba(244, 63, 94, 0.15)',
    textColor: '#f43f5e',
    description: 'Ống kính chuyên nghiệp'
  },
  'Phụ kiện': {
    icon: FiPackage,
    gradient: 'from-violet-600 to-violet-700',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    hoverBg: 'rgba(139, 92, 246, 0.15)',
    textColor: '#8b5cf6',
    description: 'Tripod, gimbal, đèn,...'
  }
};

export const CATEGORY_DEFAULTS = {
  fallback: 'Máy ảnh Mirrorless',
  hidden: []
};

export const normalizeCategory = (category) => {
  if (!category) return CATEGORY_DEFAULTS.fallback;

  const cat = String(category).trim();

  if (CAMERA_CATEGORIES.includes(cat)) {
    return cat;
  }

  const lowerCat = cat.toLowerCase();

  const categoryMap = {
    'dslr': 'Máy ảnh DSLR',
    'máy ảnh dsrl': 'Máy ảnh DSLR',
    'mirrorless': 'Máy ảnh Mirrorless',
    'compact': 'Máy ảnh Compact',
    'du lịch': 'Máy ảnh Du Lịch',
    'dulich': 'Máy ảnh Du Lịch',
    'travel': 'Máy ảnh Du Lịch',
    'vlog': 'Máy ảnh Vlog',
    'máy ảnh vlog': 'Máy ảnh Vlog',
    'video': 'Máy quay Video',
    'máy quay': 'Máy quay Video',
    'cinema': 'Máy ảnh Cinema',
    'máy ảnh cinema': 'Máy ảnh Cinema',
    'action': 'Action Camera',
    'action camera': 'Action Camera',
    '360': 'Camera 360',
    'camera 360': 'Camera 360',
    'flycam': 'Flycam',
    'fly cam': 'Flycam',
    'drone': 'Flycam',
    'lens': 'Lens',
    'ống kính': 'Lens',
    'phụ kiện': 'Phụ kiện',
    'accessories': 'Phụ kiện',
    'phu kien': 'Phụ kiện',
  };

  const normalized = categoryMap[lowerCat];

  return normalized || CATEGORY_DEFAULTS.fallback;
};

export const isValidCategory = (category) => {
  if (!category) return false;
  return CAMERA_CATEGORIES.includes(String(category).trim());
};

export const isHiddenCategory = (category) => {
  if (!category) return false;
  const cat = String(category).toLowerCase();
  return CATEGORY_DEFAULTS.hidden.some(h => cat === h.toLowerCase());
};
