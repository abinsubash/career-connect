import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../../components/UserNavbar";
import postAPI from "../../api/postAPI";
import jobAPI from "../../api/jobAPI";

// ── Icons ──────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled = false, cls = "w-5 h-5" }) => (
  <svg className={cls} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BriefcaseIcon = ({ cls = "w-4 h-4" }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const MapPinIcon = ({ cls = "w-4 h-4" }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);

// ── Feed Item Component ──────────────────────────────────────────────────────
function FeedItem({ item, type, currentUserID, onPostLike, onPostUnlike, onUserClick }) {
  const [isLiked, setIsLiked] = useState(item.is_liked_by_me || false);
  const [likeCount, setLikeCount] = useState(item.likes_count || 0);

  const handleLike = async () => {
    if (type === "post") {
      if (isLiked) {
        await onPostUnlike(item.id);
        setLikeCount(Math.max(0, likeCount - 1));
      } else {
        await onPostLike(item.id);
        setLikeCount(likeCount + 1);
      }
      setIsLiked(!isLiked);
    }
  };

  if (type === "post") {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-6">
        {/* Post Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
          <button
            onClick={() => onUserClick(item.user?.id)}
            className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {item.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-semibold text-gray-100 text-sm">{item.user?.name || "Unknown"}</p>
              <p className="text-gray-500 text-xs">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </button>
        </div>

        {/* Post Image */}
        {item.image_url && (
          <div className="w-full bg-gray-800">
            <img 
              src={item.image_url} 
              alt="Post" 
              className="w-full h-auto max-h-96 object-cover"
              onError={(e) => {
                console.error("Image failed to load:", item.image_url);
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Post Actions */}
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center gap-4 mb-3">
            <button 
              onClick={handleLike}
              className={`transition-colors flex items-center gap-2 text-sm font-semibold ${
                isLiked 
                  ? "text-red-500" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <HeartIcon filled={isLiked} cls="w-5 h-5" />
              {likeCount === 0 ? "Like" : likeCount === 1 ? "1 Like" : `${likeCount} Likes`}
            </button>
          </div>

          {/* Like Count */}
          {likeCount > 0 && (
            <p className="text-xs text-gray-400">
              {isLiked ? "You liked this post" : `${likeCount} ${likeCount === 1 ? "person likes" : "people like"} this`}
            </p>
          )}
        </div>

        {/* Post Caption */}
        {item.caption && (
          <div className="px-4 py-3">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-gray-100">{item.user?.name}</span> {item.caption}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (type === "job") {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-6 hover:border-blue-500/50 transition-colors">
        {/* Job Header */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-start gap-3 mb-3">
            <button
              onClick={() => onUserClick(item.recruiter_id, 'recruiter')}
              className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              {item.recruiter?.name?.charAt(0).toUpperCase() || "R"}
            </button>
            <div className="flex-1">
              <button
                onClick={() => onUserClick(item.recruiter_id, 'recruiter')}
                className="font-bold text-gray-100 text-lg hover:text-blue-400 transition-colors text-left"
              >
                {item.recruiter?.name || "Recruiter"}
              </button>
              <p className="text-gray-500 text-sm">{item.recruiter?.company || "Company"}</p>
            </div>
          </div>
          <h3 className="font-bold text-gray-100 text-lg mb-1">{item.title}</h3>
          <p className="text-gray-400 text-sm">{item.department}</p>
        </div>

          {/* Job Company & Location */}
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <span className="font-semibold text-gray-300">{item.recruiter?.company_name || "Company"}</span>
            <div className="flex items-center gap-1">
              <MapPinIcon />
              {item.location}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/30 font-medium">
              <BriefcaseIcon /> {item.type}
            </span>
            {item.salary_min && (
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-medium">
                ${item.salary_min.toLocaleString()} - ${item.salary_max?.toLocaleString() || ""}
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-orange-500/20 text-orange-300 text-xs px-3 py-1 rounded-full border border-orange-500/30 font-medium">
              {item.location_type}
            </span>
          </div>

          {/* Short description */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">{item.description}</p>

          {/* Skills */}
          {item.skills && item.skills.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 font-semibold mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {item.skills.slice(0, 5).map((skill, idx) => (
                  <span key={idx} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700">
                    {skill}
                  </span>
                ))}
                {item.skills.length > 5 && <span className="text-gray-500 text-xs px-2 py-1">+{item.skills.length - 5} more</span>}
              </div>
            </div>
          )}

        {/* Job Footer */}
        <div className="px-4 py-3 flex items-center gap-2">
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity">
            Apply Now
          </button>
        </div>
      </div>
    );
  }
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function UserHome() {
  const user = useSelector((state) => state.userAuth.user);
  const navigate = useNavigate();

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleUserClick = (userId, userType = 'user') => {
    if (userType === 'recruiter') {
      navigate(`/recruiter-profile/${userId}`);
    } else {
      navigate(`/user-profile/${userId}`);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch posts and jobs
      const [postsRes, jobsRes] = await Promise.all([
        postAPI.getAllPosts(1, 20, user?.id),
        jobAPI.getMyJobs(1, 20)
      ]);

      // Combine posts and jobs
      const posts = (postsRes.posts || [])
        .filter(post => post.is_active === true)
        .map(post => ({
          ...post,
          type: 'post',
          timestamp: new Date(post.created_at).getTime(),
          is_liked_by_me: post.liked_by?.includes(user?.id) || false,
        }));

      const jobs = (jobsRes.jobs || []).map(job => ({
        ...job,
        type: 'job',
        timestamp: new Date(job.created_at || new Date()).getTime()
      }));

      // Merge and sort by date (newest first)
      const combined = [...posts, ...jobs].sort((a, b) => b.timestamp - a.timestamp);

      setFeed(combined);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(err.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  const handlePostLike = async (postId) => {
    try {
      await postAPI.likePost(postId);
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handlePostUnlike = async (postId) => {
    try {
      await postAPI.unlikePost(postId);
    } catch (err) {
      console.error("Error unliking post:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <UserNavbar currentPage="Home" />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Your Feed</h1>
          <p className="text-gray-500">Latest posts and job opportunities</p>
        </div>

        {/* Error  */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading feed...</p>
            </div>
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg font-semibold mb-2">No content yet</p>
            <p className="text-gray-600 text-sm">Follow users and check back soon for posts and job opportunities</p>
          </div>
        ) : (
          <div>
            {feed.map((item, idx) => (
              <FeedItem
                key={`${item.type}-${item.id}-${idx}`}
                item={item}
                type={item.type}
                currentUserID={user?.id}
                onPostLike={handlePostLike}
                onPostUnlike={handlePostUnlike}
                onUserClick={handleUserClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
