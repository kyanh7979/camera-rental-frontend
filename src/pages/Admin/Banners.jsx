import React, { useEffect, useState, useCallback, useRef } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiAlertCircle, FiEye, FiEyeOff, FiUpload, FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminBanners, createBannersBatch, updateBanner, toggleBanner, deleteBanner } from "../../services/bannerService";
import { showSuccess, showError } from "../../components/ui/ToastNotification.jsx";

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, banner: null });

  // Multi-upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ uploading: false, progress: 0, error: null });
  const [formData, setFormData] = useState({
    imageUrl: "",
    active: true,
    displayOrder: 0,
  });
  const [formErrors, setFormErrors] = useState({});

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await getAdminBanners();
      let data = [];
      if (res.data?.data) {
        data = Array.isArray(res.data.data) ? res.data.data : [];
      }
      setBanners(data);
    } catch (err) {
      console.error("Fetch error:", err);
      showError("Không thể tải danh sách banner");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner && banner.id) {
      // Edit mode - single banner
      setEditingBanner(banner);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setFormData({
        imageUrl: banner.imageUrl || "",
        active: banner.active !== false,
        displayOrder: banner.displayOrder || 0,
      });
    } else {
      // Add mode - multi upload
      setEditingBanner(null);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setFormData({
        imageUrl: "",
        active: true,
        displayOrder: banners.length,
      });
    }
    setFormErrors({});
    setUploadProgress({ uploading: false, progress: 0, error: null });
    setShowModal(true);
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingBanner(null);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setFormErrors({});
    setUploadProgress({ uploading: false, progress: 0, error: null });
  }, []);

  const handleToggle = async (banner) => {
    try {
      await toggleBanner(banner.id);
      showSuccess(banner.active ? "Đã ẩn banner" : "Đã bật banner");
      fetchBanners();
    } catch (err) {
      console.error("Toggle error:", err);
      showError("Thao tác thất bại");
    }
  };

  const openDeleteModal = (banner) => {
    setDeleteModal({ show: true, banner });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, banner: null });
  };

  const handleDelete = async () => {
    const banner = deleteModal.banner;
    if (!banner) return;

    try {
      await deleteBanner(banner.id);
      showSuccess("Xóa banner thành công!");
      closeDeleteModal();
      fetchBanners();
    } catch (err) {
      console.error("Delete error:", err);
      showError("Xóa banner thất bại");
    }
  };

  // File validation
  const validateFile = (file) => {
    if (!file) {
      return { valid: false, error: "Vui lòng chọn một file" };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: "Chỉ chấp nhận file JPG, PNG, WEBP, AVIF" };
    }
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File phải nhỏ hơn ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }
    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      showError(errors[0]);
    }

    if (validFiles.length > 0) {
      // Create preview URLs
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Remove file from selection
  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Reorder files (move left/right)
  const moveFile = (index, direction) => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedFiles.length) return;

    const newFiles = [...selectedFiles];
    const newPreviews = [...previewUrls];
    [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];

    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  // Single image upload (for edit mode)
  const handleSingleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      showError(validation.error);
      e.target.value = '';
      return;
    }

    setUploadProgress({ uploading: true, progress: 0, error: null });

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const { uploadApi } = await import("../../services/api.js");
      const res = await uploadApi.post("/files/upload-image", formDataUpload, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, progress: percentCompleted }));
        }
      });

      let imageUrl = null;
      if (res.data?.data?.url) imageUrl = res.data.data.url;
      else if (res.data?.data?.key) imageUrl = res.data.data.key;
      else if (res.data?.data?.path) imageUrl = res.data.data.path;
      else if (res.data?.url) imageUrl = res.data.url;
      else if (res.data?.path) imageUrl = res.data.path;
      else if (typeof res.data?.data === 'string') imageUrl = res.data.data;

      if (imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl }));
        showSuccess("Upload ảnh thành công!");
      } else {
        showError("Không lấy được URL ảnh");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errorMsg = err.response?.data?.message || "Upload ảnh thất bại";
      setUploadProgress({ uploading: false, progress: 0, error: errorMsg });
      showError(errorMsg);
    } finally {
      setUploadProgress({ uploading: false, progress: 0, error: null });
      e.target.value = '';
    }
  };

  // Submit batch upload
  const handleBatchSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showError("Vui lòng chọn ít nhất 1 ảnh");
      return;
    }

    setSubmitting(true);

    try {
      const res = await createBannersBatch(selectedFiles, formData.active, parseInt(formData.displayOrder) || 0);
      const createdCount = res.data?.data?.length || selectedFiles.length;
      showSuccess(`Đã thêm ${createdCount} banner thành công!`);
      handleCloseModal();
      fetchBanners();
    } catch (err) {
      console.error("Submit error:", err);
      const errorMsg = err.response?.data?.message || "Thao tác thất bại";
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit single edit
  const handleSingleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.imageUrl?.trim()) {
      showError("Vui lòng upload ảnh banner");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        imageUrl: formData.imageUrl,
        active: formData.active,
        displayOrder: parseInt(formData.displayOrder) || 0,
      };

      await updateBanner(editingBanner.id, payload);
      showSuccess("Cập nhật banner thành công!");
      handleCloseModal();
      fetchBanners();
    } catch (err) {
      console.error("Submit error:", err);
      const errorMsg = err.response?.data?.message || "Thao tác thất bại";
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditMode = editingBanner !== null;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Banner trang chủ</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Quản lý ảnh banner hiển thị trên trang chủ</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all"
          style={{ 
            backgroundColor: 'var(--primary)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
          }}
        >
          <FiPlus size={20} />
          <span>Thêm banner</span>
        </motion.button>
      </div>

      {/* Banner Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
      ) : banners.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 rounded-2xl"
          style={{ 
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)'
          }}
        >
          <FiImage className="mx-auto mb-4" size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
          <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>Chưa có banner nào</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal()} 
            className="px-5 py-2.5 rounded-xl font-semibold"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}
          >
            Thêm banner đầu tiên
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {/* Banner Preview */}
              <div className="relative aspect-[16/7] overflow-hidden">
                {banner.imageUrl ? (
                  <img 
                    src={banner.imageUrl} 
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}
                  >
                    <FiImage size={48} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                  </div>
                )}
                {/* Active Badge */}
                <div className="absolute top-3 right-3">
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      banner.active ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'
                    }`}
                  >
                    {banner.active ? 'Đang hiển thị' : 'Đang ẩn'}
                  </span>
                </div>
              </div>
              
              {/* Banner Info */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Order: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{banner.displayOrder || 0}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggle(banner)}
                      className="p-2 rounded-lg transition-all"
                      title={banner.active ? "Ẩn banner" : "Hiển thị banner"}
                      style={{ 
                        backgroundColor: banner.active ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: banner.active ? '#f59e0b' : '#10b981'
                      }}
                    >
                      {banner.active ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenModal(banner)}
                      className="p-2 rounded-lg transition-all"
                      title="Sửa"
                      style={{ 
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        color: 'var(--primary)'
                      }}
                    >
                      <FiEdit2 size={16} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openDeleteModal(banner)}
                      className="p-2 rounded-lg transition-all"
                      title="Xóa"
                      style={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444'
                      }}
                    >
                      <FiTrash2 size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={(e) => e.target === e.currentTarget && !submitting && handleCloseModal()}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
              style={{ 
                backgroundColor: 'var(--bg-card)', 
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              {/* Modal Header */}
              <div 
                className="px-6 py-4 flex items-center justify-between border-b flex-shrink-0"
                style={{ 
                  borderColor: 'var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)'
                }}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {isEditMode ? "Sửa banner" : "Thêm nhiều banner"}
                </h2>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCloseModal} 
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--text-muted)' }}
                  disabled={submitting}
                >
                  <FiX size={20} />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1">
                {isEditMode ? (
                  /* Edit Mode - Single Upload */
                  <form onSubmit={handleSingleSubmit} className="space-y-5">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Ảnh banner <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label 
                            className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.01]"
                            style={{ 
                              borderColor: uploadProgress.error ? '#ef4444' : (uploadProgress.uploading ? 'var(--primary)' : 'var(--border-color)'),
                              backgroundColor: 'var(--bg-secondary)',
                              opacity: uploadProgress.uploading ? 0.7 : 1
                            }}
                          >
                            {uploadProgress.uploading ? (
                              <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
                                <span className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{uploadProgress.progress}%</span>
                              </div>
                            ) : (
                              <>
                                <FiUpload size={28} style={{ color: 'var(--text-muted)' }} />
                                <span className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Click để upload</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif" 
                              onChange={handleSingleImageUpload} 
                              className="hidden" 
                              disabled={uploadProgress.uploading} 
                            />
                          </label>
                        </div>
                        {formData.imageUrl && (
                          <div className="relative w-36 h-36">
                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl border" style={{ borderColor: 'var(--border-color)' }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Display Order & Active */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                          Thứ tự hiển thị
                        </label>
                        <input 
                          type="number" 
                          value={formData.displayOrder} 
                          onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, active: !formData.active })}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            formData.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
                              formData.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {formData.active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-2">
                      <motion.button 
                        type="button" 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCloseModal} 
                        className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
                        style={{ 
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)'
                        }}
                        disabled={submitting}
                      >
                        Hủy
                      </motion.button>
                      <motion.button 
                        type="submit" 
                        whileHover={{ scale: submitting ? 1 : 1.02 }}
                        whileTap={{ scale: submitting ? 1 : 0.98 }}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ 
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
                        }}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          "Cập nhật"
                        )}
                      </motion.button>
                    </div>
                  </form>
                ) : (
                  /* Add Mode - Multi Upload */
                  <form onSubmit={handleBatchSubmit} className="space-y-5">
                    {/* Drop Zone */}
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        isDragging ? 'scale-[1.02]' : ''
                      }`}
                      style={{ 
                        borderColor: isDragging ? 'var(--primary)' : 'var(--border-color)',
                        backgroundColor: isDragging ? 'rgba(6, 182, 212, 0.05)' : 'var(--bg-secondary)'
                      }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                      />
                      
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                          style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
                        >
                          <FiUpload size={28} style={{ color: 'var(--primary)' }} />
                        </div>
                        <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Kéo thả ảnh vào đây
                        </h3>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                          hoặc
                        </p>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="px-5 py-2.5 rounded-xl font-medium transition-all"
                          style={{ 
                            backgroundColor: 'var(--primary)',
                            color: 'white'
                          }}
                        >
                          Chọn ảnh
                        </motion.button>
                        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                          JPG, PNG, WEBP, AVIF • Tối đa 5MB mỗi ảnh
                        </p>
                      </div>
                    </div>

                    {/* Preview Grid */}
                    {previewUrls.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Đã chọn: <span className="font-semibold" style={{ color: 'var(--primary)' }}>{previewUrls.length}</span> ảnh
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              previewUrls.forEach(url => URL.revokeObjectURL(url));
                              setSelectedFiles([]);
                              setPreviewUrls([]);
                            }}
                            className="text-xs px-3 py-1 rounded-lg transition-all"
                            style={{ 
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444'
                            }}
                          >
                            Xóa tất cả
                          </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[280px] overflow-y-auto p-1">
                          {previewUrls.map((url, index) => (
                            <motion.div
                              key={url}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group aspect-square rounded-xl overflow-hidden"
                              style={{ backgroundColor: 'var(--bg-secondary)' }}
                            >
                              <img 
                                src={url} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {/* Move Left */}
                                <button
                                  type="button"
                                  onClick={() => moveFile(index, 'left')}
                                  disabled={index === 0}
                                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all disabled:opacity-30"
                                >
                                  <FiChevronLeft size={14} className="text-white" />
                                </button>
                                {/* Remove */}
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="p-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 transition-all"
                                >
                                  <FiX size={14} className="text-white" />
                                </button>
                                {/* Move Right */}
                                <button
                                  type="button"
                                  onClick={() => moveFile(index, 'right')}
                                  disabled={index === previewUrls.length - 1}
                                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-all disabled:opacity-30"
                                >
                                  <FiChevronRight size={14} className="text-white" />
                                </button>
                              </div>
                              {/* Order Badge */}
                              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/50 text-white">
                                #{index + 1}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                          Thứ tự hiển thị sẽ bắt đầu từ <span className="font-semibold">Order: {formData.displayOrder}</span>
                        </p>
                      </div>
                    )}

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                          Bắt đầu từ order
                        </label>
                        <input 
                          type="number" 
                          value={formData.displayOrder} 
                          onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })} 
                          className="w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none"
                          style={{ 
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                          min="0"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-6">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, active: !formData.active })}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                            formData.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow ${
                              formData.active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {formData.active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-2">
                      <motion.button 
                        type="button" 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCloseModal} 
                        className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
                        style={{ 
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)'
                        }}
                        disabled={submitting}
                      >
                        Hủy
                      </motion.button>
                      <motion.button 
                        type="submit" 
                        whileHover={{ scale: submitting ? 1 : 1.02 }}
                        whileTap={{ scale: submitting ? 1 : 0.98 }}
                        className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        style={{ 
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
                        }}
                        disabled={submitting || selectedFiles.length === 0}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <FiCheck size={16} />
                            Thêm {selectedFiles.length > 0 ? selectedFiles.length : ''} banner
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
            onClick={(e) => e.target === e.currentTarget && closeDeleteModal()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl w-full max-w-sm p-6"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <FiTrash2 size={20} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    Xóa banner
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>

              <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Bạn có chắc muốn xóa banner này không?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: '#ef4444',
                    color: 'white'
                  }}
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
