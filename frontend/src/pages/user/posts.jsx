import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserNavbar from "../../components/UserNavbar";
import postAPI from "../../api/postAPI";

// ── Icons ──────────────────────────────────────────────────────────────────────
const ImageIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
  </svg>
);
const UploadIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const TrashIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const XIcon = ({ cls }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Posts = () => {
  const user = useSelector((state) => state.userAuth.user);
  const token = useSelector((state) => state.userAuth.token);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch posts based on active tab
  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async (resetPage = true) => {
    try {
      setLoading(true);
      setError(null);
      
      const pageNum = resetPage ? 1 : page;
      const limit = 10;
      
      let response;
      if (activeTab === "all") {
        response = await postAPI.getAllPosts(pageNum, limit);
      } else {
        response = await postAPI.getUserPosts(user?.id, pageNum, limit);
      }

      if (response.success) {
        if (resetPage) {
          setPosts(response.posts || []);
          setPage(2);
        } else {
          setPosts((prev) => [...prev, ...(response.posts || [])]);
          setPage((prev) => prev + 1);
        }
        setHasMore(response.posts?.length === limit);
      } else {
        setError(response.error || "Failed to load posts");
      }
    } catch (err) {
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    try {
      setSubmitting(true);
      const response = await postAPI.createPost(caption, imageFile);
      
      if (response.success) {
        setPosts([response.post, ...posts]);
        setShowCreateModal(false);
        setCaption("");
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert(response.error || "Failed to create post");
      }
    } catch (err) {
      alert(err.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await postAPI.deletePost(postId);
      if (response.success) {
        setPosts(posts.filter((p) => p.id !== postId));
      } else {
        alert(response.error || "Failed to delete post");
      }
    } catch (err) {
      alert(err.message || "Failed to delete post");
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .grad-text { background: linear-gradient(135deg,#4f8ef7,#7c5cfc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
      `}</style>

      <UserNavbar currentPage="Posts" />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="mb-6">
            <h1 className="syne font-extrabold text-3xl text-gray-100 mb-1">Posts</h1>
            <p className="text-gray-500">Share your moments and connect with others</p>
          </div>
          {token && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all"
            >
              + Create Post
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`font-semibold text-sm transition-all pb-2 border-b-2 ${
              activeTab === "all"
                ? "text-blue-400 border-blue-400"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            All Posts
          </button>
          {token && (
            <button
              onClick={() => setActiveTab("my")}
              className={`font-semibold text-sm transition-all pb-2 border-b-2 ${
                activeTab === "my"
                  ? "text-blue-400 border-blue-400"
                  : "text-gray-500 border-transparent hover:text-gray-300"
              }`}
            >
              My Posts
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Posts Grid */}
        {loading && posts.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <ImageIcon cls="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {activeTab === "my" ? "You haven't created any posts yet" : "No posts available"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                >
                  {/* Post Image */}
                  <div className="relative bg-gray-800 h-64 overflow-hidden group cursor-pointer">
                    <img
                      src={post.image_url || post.image_data}
                      alt="Post"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Post Info */}
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-800">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {post.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-100 text-sm">
                          {post.user?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {post.caption}
                      </p>
                    )}

                    {/* Actions - Show only for own posts */}
                    {user?.id === post.user_id && (
                      <div className="flex gap-2 pt-3 border-t border-gray-800">
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-red-500/20"
                        >
                          <TrashIcon cls="w-3.5 h-3.5 inline mr-1.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-8 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5 disabled:opacity-50 transition-all"
                >
                  {loading ? "Loading..." : "Load More Posts"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-800">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="syne font-bold text-xl text-gray-100">Create Post</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCaption("");
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <XIcon cls="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              {/* Image Preview or Upload Area */}
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all"
                  >
                    <XIcon cls="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-700 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-xl p-8 text-center cursor-pointer transition-colors block">
                  <UploadIcon cls="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <div className="text-gray-300 text-sm">
                    <p className="font-semibold">Click to select image</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    required
                  />
                </label>
              )}

              {/* Caption */}
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's on your mind? (optional)"
                maxLength={500}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none text-sm"
                rows="3"
              />

              <p className="text-xs text-gray-500 text-right">
                {caption.length}/500 characters
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCaption("");
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !imageFile}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
