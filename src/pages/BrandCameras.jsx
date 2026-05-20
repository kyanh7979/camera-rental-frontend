import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCard from '../components/CameraCard.jsx';
import SkeletonLoader from '../components/ui/SkeletonLoader.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';
import api from '../services/api.js';
import { CAMERA_BRANDS, SORT_OPTIONS } from '../constants/filters.js';
import { ROUTES } from '../constants/routes.js';

const PAGE_SIZE = 8;

const getCameraId = (c) => String(c?.id ?? c?._id ?? c?.cameraId ?? '');
const getCameraPrice = (c) => c?.pricePerDay ?? c?.dailyPrice ?? c?.price ?? 0;

const BRAND_LABELS = Object.fromEntries(
  CAMERA_BRANDS.map((b) => [b.toLowerCase(), b])
);

function BrandCameras() {
  const { brand } = useParams();
  const navigate = useNavigate();

  const normalizedBrand = BRAND_LABELS[brand?.toLowerCase()] ?? brand ?? '';

  const [cameraList, setCameraList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('price-desc');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy]);

  useEffect(() => {
    const loadCameras = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        // Strip any leading /api prefix to avoid /api/api/... double-path
        const rawEndpoint = import.meta.env.VITE_CAMERA_ENDPOINT || '/cameras';
        const endpoint = rawEndpoint.replace(/^\/api/, '') || '/cameras';
        const res = await api.get(endpoint);
        const raw = res?.data;
        let data = [];
        if (Array.isArray(raw)) data = raw;
        else if (Array.isArray(raw?.data)) data = raw.data;
        else if (Array.isArray(raw?.data?.content)) data = raw.data.content;
        else if (Array.isArray(raw?.items)) data = raw.items;

        const filteredByBrand = data.filter(
          (c) => (c.brand || '').toLowerCase() === normalizedBrand.toLowerCase()
        );

        setCameraList(filteredByBrand);
      } catch {
        setLoadError('Không kết nối được backend để lấy sản phẩm.');
        setCameraList([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (normalizedBrand) {
      loadCameras();
    }
  }, [normalizedBrand]);

  const filtered = useMemo(() => {
    let result = cameraList;

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
  }, [cameraList, debouncedSearch, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (!CAMERA_BRANDS.map((b) => b.toLowerCase()).includes(brand?.toLowerCase())) {
    return (
      <div className="p-6 space-y-4">
        <button
          onClick={() => navigate(ROUTES.CAMERAS)}
          className="inline-flex items-center gap-2 text-sm transition"
          style={{ color: 'var(--text-secondary)' }}
        >
          <FiArrowLeft /> Quay lại danh mục
        </button>
        <div className="glass-panel border-dashed p-8 text-center" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Hãng không hợp lệ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <button
          onClick={() => navigate(ROUTES.CAMERAS)}
          className="inline-flex items-center gap-2 text-xs transition"
          style={{ color: 'var(--text-muted)' }}
        >
          <FiArrowLeft /> Tất cả máy ảnh
        </button>
        <h1 className="text-xl font-semibold md:text-2xl" style={{ color: 'var(--text-primary)' }}>
          {normalizedBrand}
        </h1>
        <p className="text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
          Khám phá bộ sưu tập máy ảnh và lens {normalizedBrand} chính hãng.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={`Tìm trong ${normalizedBrand}...`}
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
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} sản phẩm
          </p>

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

      {/* Brand logos / badges */}
      <div className="flex flex-wrap gap-2">
        {CAMERA_BRANDS.map((b) => (
          <button
            key={b}
            onClick={() => navigate(`/brands/${b.toLowerCase()}`)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              b.toLowerCase() === brand?.toLowerCase()
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={i} className="h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel border-dashed p-8 text-center" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Không tìm thấy sản phẩm nào.
          </p>
          <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            Thử tìm kiếm với từ khóa khác.
          </p>
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
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

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-xs">
              <button
                className="rounded-full border px-3 py-1 transition disabled:opacity-40"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-full border text-[11px] transition ${
                      n === page
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                        : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 dark:border-slate-600 dark:text-slate-300 dark:hover:border-cyan-500 dark:hover:text-cyan-400'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}

              <button
                className="rounded-full border px-3 py-1 transition disabled:opacity-40"
                style={{
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BrandCameras;
