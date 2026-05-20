import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCard from '../components/CameraCard.jsx';
import SkeletonLoader from '../components/ui/SkeletonLoader.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import api from '../services/api.js';
import { CAMERA_BRANDS, CAMERA_CATEGORIES, SORT_OPTIONS } from '../constants/filters.js';
import { normalizeCategory } from '../constants/categories.js';

const PAGE_SIZE = 6;

const getCameraId = (c) => String(c?.id ?? c?._id ?? c?.cameraId ?? '');
const getCameraPrice = (c) => c?.pricePerDay ?? c?.dailyPrice ?? c?.price ?? 0;
const getCameraCategory = (c) => {
  if (!c?.category) return '';
  if (typeof c.category === 'object') return c.category?.name || '';
  return c.category;
};

// Get page numbers with ellipsis
const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  if (currentPage <= 3) {
    pages.push(1, 2, 3);
    if (totalPages > 3) pages.push('...');
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, '...');
    pages.push(totalPages - 2, totalPages - 1, totalPages);
  } else {
    pages.push(1, '...');
    pages.push(currentPage, currentPage + 1);
    if (currentPage + 2 < totalPages) pages.push('...');
    pages.push(totalPages);
  }

  return pages;
};

function Cameras() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cameraList, setCameraList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('price-desc');
  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 350);

  // Update URL when category changes
  useEffect(() => {
    if (category && category !== 'all') {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  }, [category, setSearchParams]);

  // Read category from URL on mount
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory && urlCategory !== category) {
      setCategory(urlCategory);
    }
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, brand, category]);

  // Fetch cameras
  useEffect(() => {
    const loadCameras = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        // Strip any leading /api prefix to avoid /api/api/... double-path
        // baseURL already ends with /api, so endpoint should be relative path like /cameras
        const rawEndpoint = import.meta.env.VITE_CAMERA_ENDPOINT || '/cameras';
        const endpoint = rawEndpoint.replace(/^\/api/, '');
        const res = await api.get(endpoint || '/cameras', { params: { size: 200 } });
        const raw = res?.data;
        let data = [];

        if (raw?.data?.content && Array.isArray(raw.data.content)) {
          data = raw.data.content;
        } else if (Array.isArray(raw?.data)) {
          data = raw.data;
        } else if (raw?.data?.items && Array.isArray(raw.data.items)) {
          data = raw.data.items;
        }

        setCameraList(data);
      } catch {
        setLoadError('Không kết nối được backend để lấy sản phẩm.');
        setCameraList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCameras();
  }, []);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = cameraList;

    if (category && category !== 'all') {
      result = result.filter((c) => {
        const cameraCategory = getCameraCategory(c);
        const normalized = normalizeCategory(cameraCategory);
        return normalized === category;
      });
    }

    if (brand !== 'all') {
      result = result.filter(
        (c) => (c.brand || '').toLowerCase() === brand.toLowerCase()
      );
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.brand || '').toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return getCameraPrice(a) - getCameraPrice(b);
        case 'price-desc':
          return getCameraPrice(b) - getCameraPrice(a);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [cameraList, debouncedSearch, sortBy, brand, category]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startItem = (safePage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <section className="space-y-1">
        <h1 className="text-xl font-semibold md:text-2xl" style={{ color: 'var(--text-primary)' }}>
          Danh mục máy ảnh
        </h1>
        <p className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
          Tìm kiếm, lọc và chọn bộ thiết bị phù hợp để thuê.
          Tất cả mức giá đã bao gồm bảo hiểm cơ bản và kiểm tra thiết bị trước khi thuê.
        </p>
      </section>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên máy hoặc hãng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border pl-9 pr-3 text-sm"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 rounded-xl border px-3 text-xs"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
            category === 'all'
              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
              : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 dark:border-slate-600 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-400'
          }`}
        >
          Tất cả
        </button>
        {CAMERA_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              category === cat
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 dark:border-slate-600 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Brand filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setBrand('all')}
          className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
            brand === 'all'
              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
              : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 dark:border-slate-600 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-400'
          }`}
        >
          Tất cả
        </button>
        {CAMERA_BRANDS.map((b) => (
          <button
            key={b}
            onClick={() => setBrand(b)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              brand.toLowerCase() === b.toLowerCase()
                ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 dark:border-slate-600 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-400'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Error */}
      {loadError && (
        <div className="glass-panel border-dashed border-amber-500/40 p-4 text-center">
          <p className="text-xs text-amber-400">{loadError}</p>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel border-dashed p-8 text-center" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Không tìm thấy sản phẩm nào.
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              layout
            >
              {paginated.map((camera) => (
                <CameraCard
                  key={getCameraId(camera)}
                  camera={camera}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                Hiển thị <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{startItem}-{endItem}</span> trong tổng <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{filtered.length}</span> sản phẩm
              </p>

              <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <FiChevronLeft size={16} />
                  <span className="hidden sm:inline">Trang trước</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {pageNumbers.map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span
                        key={`dots-${idx}`}
                        className="px-2 py-2 text-xs"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className="min-w-[36px] h-9 px-2 rounded-lg text-xs font-medium transition-all hover:scale-105"
                        style={
                          safePage === pageNum
                            ? { backgroundColor: '#14b8a6', color: 'white' }
                            : {
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)'
                              }
                        }
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <span className="hidden sm:inline">Trang sau</span>
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Cameras;
