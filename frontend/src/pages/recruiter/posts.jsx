import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import postAPI from "../../api/postAPI";
import { RecruiterLayout } from "../../components/RecruiterLayout";

// ── Icons ──────────────────────────────────────────────────────────────────────
const LikeIcon = ({ filled }) => (
  <svg
    className={`w-5 h-5 ${filled ? "fill-current" : ""}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

// ── Feed Item Component ──────────────────────────────────────────────────────
function FeedItem({ post, onUserClick, onLike, onUnlike }) {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500/30 transition-all">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
        <button
          onClick={() => onUserClick(post.user_id)}
          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xs hover:opacity-80 transition-opacity"
        >
          {post.user?.name?.charAt(0).toUpperCase() || "U"}
        </button>
        <div className="flex-1 min-w-0">
          <button
            onClick={() => onUserClick(post.user_id)}
            className="font-semibold text-gray-100 text-sm hover:text-blue-400 transition-colors truncate"
          >
            {post.user?.name || "Unknown"}
          </button>
          <p className="text-gray-500 text-xs">
            {post.created_at && new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Image */}
      {post.image_url && (
        <div className="bg-gray-800 max-h-96 overflow-hidden flex items-center justify-center">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full h-auto object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Caption */}
      {post.caption && (
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-gray-300 text-sm break-words">{post.caption}</p>
        </div>
      )}

      {/* Likes Section */}
      <div className="px-4 py-2 border-b border-gray-800">
        <p className="text-xs text-gray-400">
          {post.likes_count === 0 ? "No likes yet" : `${post.likes_count} ${post.likes_count === 1 ? "like" : "likes"}`}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2">
        <button
          onClick={() => (post.is_liked_by_me ? onUnlike(post.id) : onLike(post.id))}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
            post.is_liked_by_me
              ? "bg-red-500/20 text-red-400"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <LikeIcon filled={post.is_liked_by_me} />
          {post.is_liked_by_me ? "Unlike" : "Like"}
        </button>
      </div>
    </div>
  );
}

// ── My Post Item Component ────────────────────────────────────────────────────
function MyPostItem({ post, onEdit, onDelete, onToggleStatus, onLike, onUnlike }) {
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedCaption, setEditedCaption] = useState("");

  const handleEditStart = (post) => {
    setEditingPostId(post.id);
    setEditedCaption(post.caption || "");
  };

  const handleEditSave = async (postId) => {
    await onEdit(postId, editedCaption);
    setEditingPostId(null);
    setEditedCaption("");
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500/30 transition-all">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {post.user?.name?.charAt(0).toUpperCase() || "Y"}
          </div>
          <div>
            <p className="font-semibold text-gray-100 text-sm">Your Post</p>
            <p className="text-gray-500 text-xs">
              {post.created_at && new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            post.is_active
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-gray-700/30 text-gray-400 border border-gray-600/30"
          }`}
        >
          {post.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {/* Image */}
        {post.image_url && (
          <div className="w-32 h-32 flex-shrink-0 bg-gray-800 overflow-hidden flex items-center justify-center">
            <img
              src={post.image_url}
              alt="Post"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Caption & Actions */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          {/* Caption */}
          {editingPostId === post.id ? (
            <div className="mb-3">
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Edit your caption..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {editedCaption.length}/500
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm break-words mb-3">
              {post.caption || <span className="text-gray-600 italic">No caption</span>}
            </p>
          )}

          {/* Stats */}
          <div className="text-xs text-gray-400 mb-3">
            {post.likes_count || 0} {post.likes_count === 1 ? "like" : "likes"}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {editingPostId === post.id ? (
              <>
                <button
                  onClick={() => handleEditSave(post.id)}
                  className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingPostId(null);
                    setEditedCaption("");
                  }}
                  className="bg-gray-700 text-gray-200 text-xs px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEditStart(post)}
                  className="flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  <EditIcon /> Edit
                </button>

                <button
                  onClick={() => onToggleStatus(post)}
                  className={`flex items-center gap-1 text-xs px-3 py-2 rounded transition-colors ${
                    post.is_active
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {post.is_active ? <EyeIcon /> : <EyeOffIcon />}
                  {post.is_active ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center gap-1 bg-red-900/30 text-red-400 text-xs px-3 py-2 rounded hover:bg-red-900/50 transition-colors"
                >
                  <DeleteIcon /> Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Posts Component ────────────────────────────────────────────────────────
export default function RecruiterPosts() {
  const recruiter = useSelector((state) => state.auth.recruiter);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const [allPosts, setAllPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAllPosts();
    if (token) {
      fetchMyPosts();
    }
  }, [token]);

  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postAPI.getAllPosts(1, 20);
      const activePosts = (response?.posts || []).filter(post => post.is_active === true);
      setAllPosts(activePosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const response = await postAPI.getUserPosts(recruiter?.id);
      setMyPosts(response?.user_posts || response?.posts || []);
    } catch (err) {
      console.error("Error fetching my posts:", err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
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
        setMyPosts([response.post, ...myPosts]);
        setAllPosts([response.post, ...allPosts]);
        setShowCreateModal(false);
        setCaption("");
        setImageFile(null);
        setImagePreview(null);
      } else {
        alert("Failed to create post");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error creating post: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = async (postId, editedCaption) => {
    try {
      const response = await postAPI.updatePost(postId, editedCaption);
      if (response.success) {
        setMyPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, caption: editedCaption } : p))
        );
        setAllPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, caption: editedCaption } : p))
        );
      }
    } catch (err) {
      console.error("Error updating post:", err);
      alert("Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const response = await postAPI.deletePost(postId);
      if (response.success) {
        setMyPosts((prev) => prev.filter((p) => p.id !== postId));
        setAllPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post");
    }
  };

  const handleToggleStatus = async (post) => {
    try {
      const newStatus = !post.is_active;
      const response = await postAPI.updatePost(post.id, post.caption, newStatus);
      
      if (response.success) {
        setMyPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, is_active: newStatus } : p))
        );
        setAllPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, is_active: newStatus } : p))
        );
        alert(`Post ${newStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        alert("Failed to update post status");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      alert("Error updating post status");
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await postAPI.likePost(postId);
      if (response.success) {
        setAllPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_liked_by_me: true,
                  likes_count: (p.likes_count || 0) + 1,
                }
              : p
          )
        );
        setMyPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_liked_by_me: true,
                  likes_count: (p.likes_count || 0) + 1,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Error liking:", err);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const response = await postAPI.unlikePost(postId);
      if (response.success) {
        setAllPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_liked_by_me: false,
                  likes_count: Math.max(0, (p.likes_count || 1) - 1),
                }
              : p
          )
        );
        setMyPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  is_liked_by_me: false,
                  likes_count: Math.max(0, (p.likes_count || 1) - 1),
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Error unliking:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-100 p-4">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RecruiterLayout>
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflowY:"auto" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
          body { font-family: 'DM Sans', sans-serif; }
        `}</style>

        <div className="max-w-2xl mx-auto px-4 py-8 w-full">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/recruiter/home")}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <BackIcon />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-100 mb-2">Posts</h1>
              <p className="text-gray-500">Explore and manage posts from the community</p>
            </div>
          </div>
          {token && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-500 to-violet-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <PlusIcon /> New Post
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3 px-4 font-semibold transition-colors border-b-2 ${
              activeTab === "all"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            All Posts
          </button>
          {token && (
            <button
              onClick={() => setActiveTab("my")}
              className={`py-3 px-4 font-semibold transition-colors border-b-2 ${
                activeTab === "my"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300"
              }`}
            >
              My Posts ({myPosts?.length || 0})
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* All Posts Tab */}
        {activeTab === "all" && (
          <div className="space-y-6 pb-8">
            {allPosts && allPosts.length > 0 ? (
              allPosts.map((post) => (
                <FeedItem
                  key={post.id}
                  post={post}
                  onUserClick={() => navigate(`/user-profile/${post.user_id}`)}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg font-semibold mb-2">No posts available</p>
                <p className="text-gray-600 text-sm">Be the first to share something!</p>
              </div>
            )}
          </div>
        )}

        {/* My Posts Tab */}
        {activeTab === "my" && (
          <div className="space-y-6 pb-8">
            {myPosts && myPosts.length > 0 ? (
              myPosts.map((post) => (
                <MyPostItem
                  key={post.id}
                  post={post}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                  onToggleStatus={handleToggleStatus}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg font-semibold mb-2">You haven't created any posts</p>
                <p className="text-gray-600 text-sm">Start by creating your first post!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900">
              <h2 className="text-xl font-bold text-gray-100">Create Post</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCaption("");
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="text-gray-500 hover:text-gray-300"
              >
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Image <span className="text-red-400">*</span>
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      <XIcon />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-gray-700 hover:border-blue-500/50 rounded-lg p-8 text-center cursor-pointer block transition-colors">
                    <UploadIcon />
                    <p className="text-gray-300 font-semibold text-sm mt-2">Click to upload image</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, GIF • Max 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Caption */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Caption <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write something..."
                  maxLength={500}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:border-blue-500 resize-none text-sm"
                />
                <p className="text-xs text-gray-500 text-right mt-1">{caption.length}/500</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCaption("");
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !imageFile}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </RecruiterLayout>
    );
  }
