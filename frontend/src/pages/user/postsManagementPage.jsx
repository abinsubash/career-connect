import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import UserNavbar from "../../components/UserNavbar";
import postAPI from "../../api/postAPI";

// ─── Icons ──────────────────────────────────────────────────────────────
const EditIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const LikeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
  </svg>
);

const EyeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────
export default function PostsManagementPage() {
  const user = useSelector((state) => state.userAuth.user);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postAPI.getUserPosts(user?.id);
      setPosts(response?.data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (post) => {
    setEditingPostId(post.id);
    setEditedCaption(post.caption || "");
  };

  const handleEditSave = async (postId) => {
    try {
      await postAPI.updatePost(postId, editedCaption);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, caption: editedCaption } : p
        )
      );
      setEditingPostId(null);
      setEditedCaption("");
    } catch (err) {
      console.error("Error updating post:", err);
      setError("Failed to update post");
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setDeletingPostId(postId);
        await postAPI.deletePost(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
        setError("Failed to delete post");
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  const handleToggleStatus = async (post) => {
    try {
      // For now, we'll toggle the status locally and save the caption
      // This is a placeholder until a dedicated status endpoint is created
      const newStatus = !post.is_active;
      // FUTURE: await postAPI.togglePostStatus(post.id, newStatus);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, is_active: newStatus } : p
        )
      );
    } catch (err) {
      console.error("Error toggling post status:", err);
      setError("Failed to update post status");
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await postAPI.likePost(postId);
      setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleUnlikePost = async (postId) => {
    try {
      await postAPI.unlikePost(postId);
      setLikedPosts((prev) => ({ ...prev, [postId]: false }));
    } catch (err) {
      console.error("Error unliking post:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <UserNavbar currentPage="Posts" />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <UserNavbar currentPage="Posts" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">My Posts</h1>
          <p className="text-gray-500">Manage all your posts — edit, delete, and control visibility</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
              >
                {/* Post Header */}
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-950">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {post.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-100 text-sm">{post.user?.name || "You"}</p>
                      <p className="text-gray-500 text-xs">
                        {post.created_at && new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
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
                </div>

                {/* Post Content */}
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
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <LikeIcon /> {post.likes_count || 0} likes
                      </span>
                      <span>Posted {post.created_at && new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {editingPostId === post.id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(post.id)}
                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPostId(null)}
                            className="bg-gray-700 text-gray-200 text-sm px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditStart(post)}
                            className="flex items-center gap-2 bg-gray-800 text-gray-300 text-sm px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                          >
                            <EditIcon /> Edit
                          </button>

                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`flex items-center gap-2 text-sm px-3 py-2 rounded transition-colors ${
                              post.is_active
                                ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                          >
                            {post.is_active ? <EyeIcon /> : <EyeOffIcon />}
                            {post.is_active ? "Deactivate" : "Activate"}
                          </button>

                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingPostId === post.id}
                            className="flex items-center gap-2 bg-red-900/30 text-red-400 text-sm px-3 py-2 rounded hover:bg-red-900/50 transition-colors disabled:opacity-50"
                          >
                            <DeleteIcon /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg font-semibold mb-2">No posts yet</p>
            <p className="text-gray-600 text-sm">Start creating posts to share your updates with the community</p>
          </div>
        )}
      </div>
    </div>
  );
}
