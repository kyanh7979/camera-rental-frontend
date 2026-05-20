import { CAMERA_CATEGORIES } from './categories.js';

export const CAMERA_BRANDS = ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic'];

export { CAMERA_CATEGORIES };

export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Giá: Thấp đến cao' },
  { value: 'price-desc', label: 'Giá: Cao đến thấp' },
  { value: 'rating-desc', label: 'Đánh giá: Cao đến thấp' }
];

export const PRICE_RANGES = [
  { value: 'all', label: 'Tất cả mức giá' },
  { value: '0-50', label: '0$ - 50$/ngày' },
  { value: '50-100', label: '50$ - 100$/ngày' },
  { value: '100-150', label: '100$ - 150$/ngày' },
  { value: '150+', label: 'Trên 150$/ngày' }
];
