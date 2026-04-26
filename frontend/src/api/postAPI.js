import axiosInstance from "./axiosInstance";

const postAPI = {
  // Create a new post (image required)
  createPost: async (caption, imageFile) => {
    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", imageFile);
    const response = await axiosInstance.post("/posts/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all posts
  getAllPosts: async (page = 1, limit = 10, userId = null) => {
    const params = { page, limit };
    if (userId) params.user_id = userId;
    const response = await axiosInstance.get("/posts/all", { params });
    return response.data;
  },

  // Get posts from a specific user
  getUserPosts: async (userId, page = 1, limit = 10, currentUserId = null) => {
    const params = { page, limit };
    if (currentUserId) params.current_user_id = currentUserId;
    const response = await axiosInstance.get(`/posts/user/${userId}`, { params });
    return response.data;
  },

  // Get a specific post
  getPost: async (postId, userId = null) => {
    const params = {};
    if (userId) params.user_id = userId;
    const response = await axiosInstance.get(`/posts/${postId}`, { params });
    return response.data;
  },

  // Delete a post
  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  },

  // Update a post caption and/or active status
  updatePost: async (postId, caption, isActive = null) => {
    const data = { caption };
    if (isActive !== null) {
      data.is_active = isActive;
    }
    const response = await axiosInstance.put(`/posts/${postId}`, data);
    return response.data;
  },

  // Like a post
  likePost: async (postId) => {
    const response = await axiosInstance.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Unlike a post
  unlikePost: async (postId) => {
    const response = await axiosInstance.post(`/posts/${postId}/unlike`);
    return response.data;
  },
};

export default postAPI;
