import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import UserNavbar from "../../components/UserNavbar";
import postAPI from "../../api/postAPI";
import jobAPI from "../../api/jobAPI";

// ─── Icons ──────────────────────────────────────────────────────────────
const LikeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
  </svg>
);

const BackIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const SendIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
  </svg>
);

// ─── Main Component ────────────────────────────────────────────────────
export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.userAuth.user);

  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userJobs, setUserJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, fetch posts and jobs. UserInfo would come from a dedicated endpoint
      const [postsRes, jobsRes] = await Promise.all([
        postAPI.getUserPosts(userId),
        jobAPI.getUserJobs(userId),
      ]);

      // Create basic user info from posts (fallback)
      if (postsRes?.data && postsRes.data.length > 0) {
        const firstPost = postsRes.data[0];
        setUserInfo({
          id: userId,
          name: firstPost.user?.name || "User",
          email: firstPost.user?.email || "",
          headline: firstPost.user?.headline || "CareerConnect Member",
          avatar: firstPost.user?.avatar || "",
        });
      } else {
        setUserInfo({
          id: userId,
          name: "User",
          email: "",
          headline: "CareerConnect Member",
          avatar: "",
        });
      }

      setUserPosts(postsRes?.data || []);
      setUserJobs(jobsRes?.data || []);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
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

  const isOwnProfile = currentUser?.id === parseInt(userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-gray-100">
        <UserNavbar currentPage="Profile" />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-400">Loading profile...</p>
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

      <UserNavbar currentPage="Profile" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors mb-6"
        >
          <BackIcon /> Back
        </button>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* User Header */}
        {userInfo && (
          <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-800 rounded-lg p-8 mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userInfo.name?.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-100 mb-2">{userInfo.name}</h1>
                <p className="text-gray-400 mb-1">{userInfo.headline}</p>
                {userInfo.email && <p className="text-gray-500 text-sm">{userInfo.email}</p>}
              </div>

              {/* Edit Profile Button (if own profile) */}
              {isOwnProfile && (
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {userPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Posts ({userPosts.length})</h2>
            <div className="grid grid-cols-1 gap-6">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors"
                >
                  {/* Post Header */}
                  <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-100 text-sm">{post.user?.name || "User"}</p>
                        <p className="text-gray-500 text-xs">
                          {post.created_at && new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Image */}
                  {post.image_url && (
                    <div className="relative w-full bg-gray-800 max-h-96 overflow-hidden flex items-center justify-center">
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

                  {/* Post Actions */}
                  <div className="px-4 py-3 flex items-center gap-4 border-b border-gray-800">
                    <button
                      onClick={() =>
                        likedPosts[post.id]
                          ? handleUnlikePost(post.id)
                          : handleLikePost(post.id)
                      }
                      className={`flex items-center gap-2 transition-colors ${
                        likedPosts[post.id]
                          ? "text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <LikeIcon /> {post.likes_count || 0}
                    </button>
                    <button className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
                      <SendIcon /> Comment
                    </button>
                  </div>

                  {/* Post Caption */}
                  {post.caption && (
                    <div className="px-4 py-3">
                      <p className="text-gray-300 text-sm break-words">{post.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs Section */}
        {userJobs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-100 mb-6">Jobs Posted ({userJobs.length})</h2>
            <div className="grid grid-cols-1 gap-6">
              {userJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-100">{job.title}</h3>
                      <p className="text-gray-400 text-sm">{job.company_name || "Company"}</p>
                    </div>
                    {isOwnProfile && (
                      <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-gray-300 transition-colors text-sm px-3 py-1 hover:bg-gray-800 rounded">
                          Edit
                        </button>
                        <button className="text-red-500 hover:text-red-400 transition-colors text-sm px-3 py-1 hover:bg-red-900/20 rounded">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Job Meta Info */}
                  <div className="flex flex-wrap gap-3 mb-3">
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30">
                      {job.type}
                    </span>
                    {job.salary_min && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                        ${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString() || ""}
                      </span>
                    )}
                    <span className="bg-orange-500/20 text-orange-300 text-xs px-3 py-1 rounded-full border border-orange-500/30">
                      {job.location_type}
                    </span>
                  </div>

                  {/* Job Description */}
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{job.description}</p>

                  {/* Skills */}
                  {job.skills && job.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((skill, idx) => (
                          <span key={idx} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-gray-500 text-xs px-2 py-1">+{job.skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {userPosts.length === 0 && userJobs.length === 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg font-semibold mb-2">No content yet</p>
            <p className="text-gray-600 text-sm">
              {isOwnProfile
                ? "Start by uploading a post or creating a job!"
                : "This user hasn't uploaded any posts or jobs yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
