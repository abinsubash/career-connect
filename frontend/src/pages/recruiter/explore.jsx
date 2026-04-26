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

// ── Main Explore Component ────────────────────────────────────────────────────
export default function RecruiterExplore() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postAPI.getAllPosts(1, 20);
      const activePosts = (response?.posts || []).filter(post => post.is_active === true);
      setPosts(activePosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  const handleLike = async (postId) => {
    try {
      const response = await postAPI.likePost(postId);
      if (response.success) {
        setPosts((prev) =>
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
        setPosts((prev) =>
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
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/recruiter/home")}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <BackIcon />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-100">Explore Posts</h1>
            <p className="text-gray-500">Discover posts from our community members</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Posts */}
        {posts && posts.length > 0 ? (
          <div className="space-y-6 pb-8">
            {posts.map((post) => (
              <FeedItem
                key={post.id}
                post={post}
                onUserClick={handleUserClick}
                onLike={handleLike}
                onUnlike={handleUnlike}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg font-semibold mb-2">No posts available</p>
            <p className="text-gray-600 text-sm">Be the first to share something!</p>
          </div>
        )}
        </div>
        </div>
      </RecruiterLayout>
    );
  }
