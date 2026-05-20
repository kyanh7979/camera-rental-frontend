import api from "./api";

export const getCameras = (params) => {
  // If no type specified, fetch all products (cameras + lens + accessories)
  // Backend should return all products when no type filter is applied
  return api.get("/cameras", { params });
};

export const getAllProducts = async () => {
  // Fetch all products regardless of type
  // This is a wrapper to ensure we get cameras, lens, and accessories
  try {
    const res = await api.get("/cameras", { params: {} });
    return res;
  } catch (err) {
    console.error("Error fetching all products:", err);
    throw err;
  }
};

export const getCameraById = (id) => {
  return api.get("/cameras/" + id);
};

export const getCameraBySlug = (slug) => {
  return api.get("/cameras/slug/" + slug);
};

export const getBrands = () => {
  return api.get("/cameras/brands");
};

export const createCamera = (data) => {
  return api.post("/cameras", data);
};

export const updateCamera = (id, data) => {
  return api.put("/cameras/" + id, data);
};

export const deleteCamera = (id) => {
  return api.delete("/cameras/" + id);
};

export const hideCamera = (id) => {
  return api.patch("/cameras/" + id + "/hide");
};

export const showCamera = (id) => {
  return api.patch("/cameras/" + id + "/show");
};

// Get all cameras for admin (including inactive)
export const getAdminCameras = () => {
  return api.get("/cameras/admin/all");
};
