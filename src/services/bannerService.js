import api, { uploadApi } from "./api";

// Get active banners for homepage (public)
export const getHomeBanners = () => {
  return api.get("/banners/home");
};

// Get primary banner for homepage (public)
export const getPrimaryBanner = () => {
  return api.get("/banners/home/primary");
};

// Admin: Get all banners
export const getAdminBanners = () => {
  return api.get("/admin/banners");
};

// Admin: Get banner by ID
export const getBannerById = (id) => {
  return api.get("/admin/banners/" + id);
};

// Admin: Create single banner
export const createBanner = (data) => {
  return api.post("/admin/banners", data);
};

// Admin: Batch create banners (multiple images at once)
export const createBannersBatch = (files, active = true, startOrder = 0) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("active", String(active));
  formData.append("startOrder", String(startOrder));
  // Use uploadApi for multipart/form-data requests
  return uploadApi.post("/admin/banners/batch", formData);
};

// Admin: Update banner
export const updateBanner = (id, data) => {
  return api.put("/admin/banners/" + id, data);
};

// Admin: Toggle banner active status
export const toggleBanner = (id) => {
  return api.patch("/admin/banners/" + id + "/toggle");
};

// Admin: Delete banner
export const deleteBanner = (id) => {
  return api.delete("/admin/banners/" + id);
};
