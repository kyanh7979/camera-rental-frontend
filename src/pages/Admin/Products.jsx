import React, { useEffect, useState, useCallback } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiImage, FiSave, FiAlertCircle, FiEye, FiEyeOff, FiCheck, FiCpu, FiAlertTriangle, FiCamera } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { createCamera, updateCamera, deleteCamera, hideCamera, showCamera, getAdminCameras } from "../../services/cameraService.js";
import { showSuccess, showError } from "../../components/ui/ToastNotification.jsx";
import { CAMERA_CATEGORIES } from "../../constants/categories.js";

const BRANDS = ["Canon", "Fujifilm", "Panasonic", "Nikon", "Sony", "GoPro", "DJI", "Blackmagic", "Insta360"];

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ uploading: false, progress: 0, error: null });
  const [deleteModal, setDeleteModal] = useState({ show: false, product: null }); // Delete confirmation modal

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    category: "",
    dailyPrice: "",
    depositPrice: "",
    stockQuantity: "",
    features: [],
    images: [],
    sampleImages: [],
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [newFeature, setNewFeature] = useState("");
  const [specs, setSpecs] = useState([{ label: "", value: "" }]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAdminCameras();
      let data = [];
      if (res.data?.data?.content) {
        data = res.data.data.content;
      } else if (res.data?.data) {
        data = Array.isArray(res.data.data) ? res.data.data : [];
      } else if (Array.isArray(res.data)) {
        data = res.data;
      }
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
      showError("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product && product.id) {
      setEditingProduct(product);
      
      // Parse specs from product
      let parsedSpecs = [{ label: "", value: "" }];
      if (product.specifications) {
        try {
          if (typeof product.specifications === 'object') {
            parsedSpecs = Object.entries(product.specifications).map(([key, val]) => ({
              label: key,
              value: String(val)
            }));
          } else if (typeof product.specifications === 'string') {
            try {
              const parsed = JSON.parse(product.specifications);
              if (typeof parsed === 'object') {
                parsedSpecs = Object.entries(parsed).map(([key, val]) => ({
                  label: key,
                  value: String(val)
                }));
              }
            } catch {}
          }
        } catch {}
      } else if (product.specs && typeof product.specs === 'object') {
        parsedSpecs = Object.entries(product.specs).map(([key, val]) => ({
          label: key,
          value: String(val)
        }));
      }
      
      setFormData({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        category: product.category || "",
        dailyPrice: product.dailyPrice || product.pricePerDay || "",
        depositPrice: product.depositPrice || "",
        stockQuantity: product.stockQuantity || "",
        features: product.features || [],
        images: product.images || [],
        sampleImages: product.sampleImages || [],
      });
      setSpecs(parsedSpecs.length > 0 ? parsedSpecs : [{ label: "", value: "" }]);
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        brand: "",
        category: "",
        dailyPrice: "",
        depositPrice: "",
        stockQuantity: "",
        features: [],
        images: [],
        sampleImages: [],
      });
      setSpecs([{ label: "", value: "" }]);
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingProduct(null);
    setFormErrors({});
    setSpecs([{ label: "", value: "" }]);
  }, []);

  // Handle hide (deactivate) product
  const handleHide = async (id) => {
    try {
      await hideCamera(id);
      showSuccess("Đã ẩn sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      console.error("Hide error:", err);
      const errorMsg = err.response?.data?.message || "Ẩn sản phẩm thất bại";
      showError(errorMsg);
    }
  };

  // Handle show (activate) product
  const handleShow = async (id) => {
    try {
      await showCamera(id);
      showSuccess("Đã hiển thị sản phẩm thành công!");
      fetchProducts();
    } catch (err) {
      console.error("Show error:", err);
      const errorMsg = err.response?.data?.message || "Hiển thị sản phẩm thất bại";
      showError(errorMsg);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (product) => {
    setDeleteModal({ show: true, product });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ show: false, product: null });
  };

  // Handle actual delete
  const handleDelete = async () => {
    const product = deleteModal.product;
    if (!product) return;

    try {
      await deleteCamera(product.id);
      showSuccess("Xóa sản phẩm thành công!");
      closeDeleteModal();
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.message || "Xóa sản phẩm thất bại";
      showError(errorMsg);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Specs management
  const handleAddSpec = () => {
    setSpecs(prev => [...prev, { label: "", value: "" }]);
  };

  const handleRemoveSpec = (index) => {
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSpec = (index, field, value) => {
    setSpecs(prev => prev.map((spec, i) => 
      i === index ? { ...spec, [field]: value } : spec
    ));
  };

  const handleBrandSelect = (brandName) => {
    setFormData(prev => ({
      ...prev,
      brand: brandName,
    }));
    setFormErrors(prev => ({ ...prev, brand: null }));
  };

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    
    console.log("[Upload] Selected file:", file?.name);
    console.log("[Upload] File size:", file?.size);
    console.log("[Upload] File type:", file?.type);
    
    const validation = validateFile(file);
    if (!validation.valid) {
      console.warn("[Upload] Validation failed:", validation.error);
      showError(validation.error);
      e.target.value = '';
      return;
    }

    setUploadProgress({ uploading: true, progress: 0, error: null });
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      
      console.log("[Upload] Sending to /files/upload-image");
      
      // Use uploadApi instead of api for file uploads
      // uploadApi does NOT set Content-Type header, letting Axios set multipart with boundary
      const { uploadApi } = await import("../../services/api.js");
      const res = await uploadApi.post("/files/upload-image", formDataUpload, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, progress: percentCompleted }));
        }
      });
      
      console.log("[Upload] Response:", res);
      
      let imageUrl = null;
      if (res.data?.data?.url) imageUrl = res.data.data.url;
      else if (res.data?.data?.key) imageUrl = res.data.data.key;
      else if (res.data?.data?.path) imageUrl = res.data.data.path;
      else if (res.data?.url) imageUrl = res.data.url;
      else if (res.data?.path) imageUrl = res.data.path;
      else if (typeof res.data?.data === 'string') imageUrl = res.data.data;
      
      console.log("[Upload] Image URL:", imageUrl);
      
      if (imageUrl) {
        setFormData(prev => ({ ...prev, images: [...prev.images, imageUrl] }));
        showSuccess("Upload ảnh thành công!");
      } else {
        console.error("[Upload] No URL in response:", res.data);
        showError("Không lấy được URL ảnh");
      }
    } catch (err) {
      console.error("[Upload] Error:", err);
      console.error("[Upload] Error response:", err.response);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Upload ảnh thất bại. Vui lòng thử lại.";
      setUploadProgress({ uploading: false, progress: 0, error: errorMsg });
      showError(errorMsg);
    } finally {
      setUploadProgress({ uploading: false, progress: 0, error: null });
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Sample Images Management
  const handleSampleImageUpload = async (e) => {
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
        const newSampleImage = {
          imageUrl: imageUrl,
          title: "",
          displayOrder: formData.sampleImages.length
        };
        setFormData(prev => ({
          ...prev,
          sampleImages: [...prev.sampleImages, newSampleImage]
        }));
        showSuccess("Thêm ảnh sample thành công!");
      }
    } catch (err) {
      console.error("[Sample Image Upload] Error:", err);
      showError("Upload ảnh thất bại");
    } finally {
      setUploadProgress({ uploading: false, progress: 0, error: null });
      e.target.value = '';
    }
  };

  const addSampleImageByUrl = (url) => {
    if (!url || !url.trim()) return;
    const newSampleImage = {
      imageUrl: url.trim(),
      title: "",
      displayOrder: formData.sampleImages.length
    };
    setFormData(prev => ({
      ...prev,
      sampleImages: [...prev.sampleImages, newSampleImage]
    }));
  };

  const removeSampleImage = (index) => {
    setFormData(prev => ({
      ...prev,
      sampleImages: prev.sampleImages.filter((_, i) => i !== index)
    }));
  };

  const updateSampleImageTitle = (index, title) => {
    setFormData(prev => ({
      ...prev,
      sampleImages: prev.sampleImages.map((img, i) =>
        i === index ? { ...img, title } : img
      )
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = "Vui lòng nhập tên sản phẩm";
    }

    if (!formData.brand) {
      errors.brand = "Vui lòng chọn thương hiệu";
    }

    if (!formData.category) {
      errors.category = "Vui lòng chọn danh mục";
    }

    if (!formData.dailyPrice || parseFloat(formData.dailyPrice) <= 0) {
      errors.dailyPrice = "Vui lòng nhập giá thuê hợp lệ";
    }

    if (!formData.depositPrice || parseFloat(formData.depositPrice) < 0) {
      errors.depositPrice = "Vui lòng nhập tiền đặt cọc hợp lệ";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setSubmitting(true);
    
    try {
      // Convert specs array to object
      const specsObject = {};
      specs.forEach(spec => {
        if (spec.label.trim() && spec.value.trim()) {
          specsObject[spec.label.trim()] = spec.value.trim();
        }
      });
      
      // Only add specifications if there are valid specs
      const specificationsJson = Object.keys(specsObject).length > 0 
        ? JSON.stringify(specsObject) 
        : null;

      // Ensure category is always a string (not an object)
      const categoryValue = typeof formData.category === 'object' && formData.category !== null
        ? (formData.category.name || formData.category.value || '')
        : (formData.category || '');

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || "",
        brand: formData.brand,
        category: categoryValue,
        dailyPrice: parseFloat(formData.dailyPrice),
        deposit: parseFloat(formData.depositPrice) || 0,
        stock: parseInt(formData.stockQuantity) || 1,
        images: formData.images,
        sampleImages: formData.sampleImages.filter(img => img.imageUrl && img.imageUrl.trim()),
      };

      // Add specifications if available
      if (specificationsJson) {
        payload.specifications = specificationsJson;
      }

      if (editingProduct) {
        await updateCamera(editingProduct.id, payload);
        showSuccess("Cập nhật sản phẩm thành công!");
      } else {
        await createCamera(payload);
        showSuccess("Thêm sản phẩm thành công!");
      }

      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error("Submit error:", err);
      console.error("Error response:", err.response);
      
      // Xử lý lỗi 409 Conflict - trùng tên camera
      if (err.response?.status === 409) {
        const errorMessage = err.response?.data?.message || "Camera đã tồn tại!";
        console.log("409 Error message:", errorMessage);
        showError(errorMessage);
        // Fallback alert nếu toast không hoạt động
        // alert(errorMessage);
        return;
      }
      
      const errorMsg = err.response?.data?.message || 
        err.response?.data?.error ||
        (editingProduct ? "Cập nhật sản phẩm thất bại" : "Thêm sản phẩm thất bại. Vui lòng kiểm tra console.");
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Quản lý sản phẩm</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Tổng cộng: {products.length} sản phẩm</p>
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
          <span>Thêm sản phẩm</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
      ) : products.length === 0 ? (
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
          <p className="text-lg mb-4" style={{ color: 'var(--text-muted)' }}>Chưa có sản phẩm nào</p>
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
            Thêm sản phẩm đầu tiên
          </motion.button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Hình ảnh</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tên sản phẩm</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Thương hiệu</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Giá thuê/ngày</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tiền đặt cọc</th>
                  <th className="px-4 py-3 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tồn kho</th>
                  <th className="px-4 py-3 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Trạng thái</th>
                  <th className="px-4 py-3 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-card)'
              }}>
                {products.map((product, index) => {
                  const stock = product.stock || product.available || 0;
                  const isOutOfStock = stock === 0;
                  const isLowStock = stock > 0 && stock <= 2;
                  const isActive = product.isActive !== false;

                  return (
                  <motion.tr 
                    key={product.id} 
                    className={`transition-colors ${!isActive ? 'opacity-60' : isOutOfStock ? 'bg-red-50 dark:bg-red-900/10' : isLowStock ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}
                    style={{
                      backgroundColor: !isActive ? 'rgba(107, 114, 128, 0.05)' : isOutOfStock ? 'rgba(239, 68, 68, 0.05)' : isLowStock ? 'rgba(245, 158, 11, 0.05)' : undefined,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-4 py-3">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-xl" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <FiImage style={{ color: 'var(--text-muted)' }} size={24} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.name || 'N/A'}</p>
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {(product.description || '').substring(0, 50)}{(product.description || '').length > 50 ? '...' : ''}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: 'var(--text-secondary)' }}>{product.brand || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--primary)' }}>
                      {product.pricePerDay || product.dailyPrice ? 
                        new Intl.NumberFormat("vi-VN").format(product.pricePerDay || product.dailyPrice) + 'đ' : 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {product.depositPrice ? new Intl.NumberFormat("vi-VN").format(product.depositPrice) + 'đ' : '0đ'}
                    </td>
                    {/* Tồn kho column */}
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-green-500'}`}>
                        {stock}
                      </span>
                    </td>
                    {/* Trạng thái column */}
                    <td className="px-4 py-3 text-center">
                      {!isActive ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold min-w-[72px]" style={{ backgroundColor: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' }}>
                          Đã ẩn
                        </span>
                      ) : isOutOfStock ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold min-w-[72px]" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                          Hết hàng
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold min-w-[72px]" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                          Sắp hết
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold min-w-[72px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                          Còn hàng
                        </span>
                      )}
                    </td>
                    {/* Actions column */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenModal(product)} 
                          className="p-2.5 rounded-xl transition-all"
                          title="Sửa"
                          style={{ 
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            color: 'var(--primary)'
                          }}
                        >
                          <FiEdit2 size={18} />
                        </motion.button>
                        {/* Ẩn/Hiện button */}
                        {isActive ? (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleHide(product.id)} 
                            className="p-2.5 rounded-xl transition-all"
                            title="Ẩn sản phẩm"
                            style={{ 
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              color: '#f59e0b'
                            }}
                          >
                            <FiEyeOff size={18} />
                          </motion.button>
                        ) : (
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleShow(product.id)} 
                            className="p-2.5 rounded-xl transition-all"
                            title="Hiển thị sản phẩm"
                            style={{ 
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981'
                            }}
                          >
                            <FiEye size={18} />
                          </motion.button>
                        )}
                        {/* Xóa button */}
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openDeleteModal(product)} 
                          className="p-2.5 rounded-xl transition-all"
                          title="Xóa sản phẩm"
                          style={{ 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444'
                          }}
                        >
                          <FiTrash2 size={18} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modal */}
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'var(--bg-overlay)' }}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            {/* Modal Header */}
            <div 
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-secondary)'
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleCloseModal} 
                className="p-2 rounded-xl transition-all"
                style={{ color: 'var(--text-muted)' }}
              >
                <FiX size={20} />
              </motion.button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setFormErrors(prev => ({ ...prev, name: null }));
                  }} 
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: formErrors.name ? '#ef4444' : 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="VD: Canon EOS R5"
                />
                {formErrors.name && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                    <FiAlertCircle size={12} /> {formErrors.name}
                  </p>
                )}
              </div>

              {/* Thương hiệu */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Thương hiệu <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {BRANDS.map((brand) => {
                    const isSelected = formData.brand?.toLowerCase() === brand.toLowerCase();
                    return (
                      <motion.button
                        key={brand}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBrandSelect(brand)}
                        className="px-4 py-3 rounded-xl border font-medium text-sm transition-all"
                        style={{ 
                          borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-secondary)',
                          color: isSelected ? 'white' : 'var(--text-primary)',
                          boxShadow: isSelected ? '0 4px 14px rgba(6, 182, 212, 0.3)' : 'none',
                        }}
                      >
                        {brand}
                        {isSelected && (
                          <span className="ml-1.5">✓</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                {formErrors.brand && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                    <FiAlertCircle size={12} /> {formErrors.brand}
                  </p>
                )}
              </div>

              {/* Danh mục & Giá thuê */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({ ...formData, category: e.target.value });
                      setFormErrors(prev => ({ ...prev, category: null }));
                    }}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: formErrors.category ? '#ef4444' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">Chọn danh mục</option>
                    {CAMERA_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                      <FiAlertCircle size={12} /> {formErrors.category}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Giá thuê/ngày (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={formData.dailyPrice} 
                    onChange={(e) => {
                      setFormData({ ...formData, dailyPrice: e.target.value });
                      setFormErrors(prev => ({ ...prev, dailyPrice: null }));
                    }} 
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: formErrors.dailyPrice ? '#ef4444' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="VD: 500000"
                  />
                  {formErrors.dailyPrice && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                      <FiAlertCircle size={12} /> {formErrors.dailyPrice}
                    </p>
                  )}
                </div>
              </div>

              {/* Tiền đặt cọc & Số lượng */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Tiền đặt cọc (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={formData.depositPrice} 
                    onChange={(e) => {
                      setFormData({ ...formData, depositPrice: e.target.value });
                      setFormErrors(prev => ({ ...prev, depositPrice: null }));
                    }} 
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: formErrors.depositPrice ? '#ef4444' : 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="VD: 5000000"
                  />
                  {formErrors.depositPrice && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                      <FiAlertCircle size={12} /> {formErrors.depositPrice}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Số lượng trong kho</label>
                  <input 
                    type="number" 
                    value={formData.stockQuantity} 
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} 
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="VD: 10"
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mô tả</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none"
                  style={{ 
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                  placeholder="Mô tả chi tiết về sản phẩm..."
                  rows={3}
                />
              </div>

              {/* Thông số kỹ thuật */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Thông số kỹ thuật
                  </label>
                  <motion.button 
                    type="button" 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddSpec}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ 
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      color: 'var(--primary)'
                    }}
                  >
                    <FiPlus size={14} />
                    Thêm thông số
                  </motion.button>
                </div>
                
                <div className="space-y-2">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={spec.label} 
                        onChange={(e) => handleUpdateSpec(index, 'label', e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
                        style={{ 
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                        placeholder="Tên thông số (VD: Cảm biến)"
                      />
                      <input 
                        type="text" 
                        value={spec.value} 
                        onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                        className="flex-[2] px-3 py-2.5 rounded-xl border text-sm outline-none transition-all"
                        style={{ 
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)',
                        }}
                        placeholder="Giá trị (VD: Full-frame 33MP)"
                      />
                      <motion.button 
                        type="button" 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveSpec(index)}
                        disabled={specs.length === 1}
                        className="p-2.5 rounded-xl transition-all disabled:opacity-30"
                        style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444'
                        }}
                      >
                        <FiX size={16} />
                      </motion.button>
                    </div>
                  ))}
                </div>
                
                {specs.length > 0 && specs.some(s => s.label && s.value) && (
                  <p className="mt-2 text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <FiCpu size={12} />
                    Thông số sẽ được lưu dưới dạng JSON
                  </p>
                )}
              </div>

              {/* Tính năng nổi bật */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tính năng nổi bật</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={newFeature} 
                    onChange={(e) => setNewFeature(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())} 
                    className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                    placeholder="VD: Chống rung 5 trục, Quay 4K 60fps..."
                  />
                  <motion.button 
                    type="button" 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddFeature} 
                    className="px-5 py-3 rounded-xl font-medium transition-all"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    Thêm
                  </motion.button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm"
                        style={{ 
                          backgroundColor: 'rgba(6, 182, 212, 0.1)', 
                          color: 'var(--primary)' 
                        }}
                      >
                        {feature}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFeature(index)} 
                          className="hover:opacity-70"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Hình ảnh */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Hình ảnh sản phẩm <span className="text-xs" style={{ color: 'var(--text-muted)' }}>(JPG, PNG, WEBP, AVIF - Tối đa 5MB)</span>
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img src={img} alt={`Preview ${index + 1}`} className="w-20 h-20 object-cover rounded-xl border" 
                        style={{ borderColor: 'var(--border-color)' }} 
                      />
                      <motion.button 
                        type="button" 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeImage(index)} 
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: '#ef4444', color: 'white' }}
                      >
                        <FiX size={14} />
                      </motion.button>
                    </div>
                  ))}
                  <label 
                    className="w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ 
                      borderColor: uploadProgress.error ? '#ef4444' : (uploadProgress.uploading ? 'var(--primary)' : 'var(--border-color)'),
                      backgroundColor: 'var(--bg-secondary)',
                      opacity: uploadProgress.uploading ? 0.7 : 1
                    }}
                  >
                    {uploadProgress.uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
                        <span className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{uploadProgress.progress}%</span>
                      </div>
                    ) : (
                      <>
                        <FiImage size={24} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Upload</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={uploadProgress.uploading} 
                    />
                  </label>
                </div>
                {uploadProgress.error && (
                  <p className="text-xs flex items-center gap-1" style={{ color: '#ef4444' }}>
                    <FiAlertCircle size={12} /> {uploadProgress.error}
                  </p>
                )}
              </div>

              {/* Sample Images - Ảnh thực tế từ thiết bị */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex items-center gap-2">
                    <FiCamera size={16} style={{ color: 'var(--primary)' }} />
                    Ảnh thực tế từ thiết bị
                    <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(Tùy chọn)</span>
                  </span>
                </label>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Thêm ảnh chụp thực tế từ máy ảnh này để khách hàng xem trước chất lượng hình ảnh
                </p>

                {/* Sample Image List */}
                {formData.sampleImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                    {formData.sampleImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-color)' }}>
                          <img src={img.imageUrl} alt={`Sample ${index + 1}`} className="w-full h-24 object-cover" />
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeSampleImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: '#ef4444', color: 'white' }}
                          >
                            <FiX size={14} />
                          </motion.button>
                        </div>
                        <input
                          type="text"
                          value={img.title || ""}
                          onChange={(e) => updateSampleImageTitle(index, e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 rounded-lg border text-xs outline-none transition-all"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                          placeholder="Tiêu đề ảnh (tùy chọn)"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Sample Image Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* Upload Button */}
                  <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: uploadProgress.error ? '#ef4444' : (uploadProgress.uploading ? 'var(--primary)' : 'var(--border-color)'),
                      backgroundColor: 'var(--bg-secondary)',
                      opacity: uploadProgress.uploading ? 0.7 : 1
                    }}
                  >
                    {uploadProgress.uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{uploadProgress.progress}%</span>
                      </>
                    ) : (
                      <>
                        <FiImage size={16} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Upload ảnh</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
                      onChange={handleSampleImageUpload}
                      className="hidden"
                      disabled={uploadProgress.uploading}
                    />
                  </label>

                  {/* Add URL Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = window.prompt("Nhập URL ảnh:");
                      if (url) addSampleImageByUrl(url);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <FiPlus size={16} />
                    <span className="text-xs font-medium">Thêm URL</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <motion.button 
                  type="button" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseModal} 
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition-all"
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
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                    <>
                      <FiSave size={18} />
                      {editingProduct ? "Cập nhật" : "Thêm mới"}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'var(--bg-overlay)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl w-full max-w-md p-6"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)'
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                >
                  <FiAlertTriangle size={24} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    Xóa sản phẩm
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>

              <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Bạn có chắc muốn xóa sản phẩm{' '}
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  "{deleteModal.product?.name}"
                </span>{' '}
                không?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all"
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
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold transition-all"
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
