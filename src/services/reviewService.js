import api from "./api";

export const getReviewsByCamera = (cameraId, page = 0, size = 10) => {
  return api.get(`/reviews/camera/${cameraId}`, { 
    params: { page, size } 
  });
};

export const createReview = (data) => {
  return api.post("/reviews", data);
};

export const updateReview = (id, data) => {
  return api.put(`/reviews/${id}`, data);
};

export const deleteReview = (id) => {
  return api.delete(`/reviews/${id}`);
};
