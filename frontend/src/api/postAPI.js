import axiosInstance from "./axiosInstance";

const postAPI = {
  // Create a new post
  createPost: async (caption, imageFile) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    const response = await axiosInstance.post("/posts/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all posts
  getAllPosts: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get("/posts/all", {
      params: { page, limit },
    });
    return response.data;
  },

  // Get posts from a specific user
  getUserPosts: async (userId, page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/posts/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get a specific post
  getPost: async (postId) => {
    const response = await axiosInstance.get(`/posts/${postId}`);
    return response.data;
  },

  // Delete a post
  deletePost: async (postId) => {
    const response = await axiosInstance.delete(`/posts/${postId}`);
    return response.data;
  },

  // Update a post caption
  updatePost: async (postId, caption) => {
    const response = await axiosInstance.put(`/posts/${postId}`, { caption });
    return response.data;
  },
};

export default postAPI;
