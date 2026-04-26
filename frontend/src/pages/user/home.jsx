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

const CommentIcon = ({ cls = "w-5 h-5" }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = ({ cls = "w-5 h-5" }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BookmarkIcon = ({ cls = "w-5 h-5" }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const MoreIcon = ({ cls = "w-5 h-5" }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
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
  const [isLiked, setIsLiked] = useState(item.isLikedByMe || false);
  const [likeCount, setLikeCount] = useState(item.likes_count || 0);
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

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
          <button className="text-gray-500 hover:text-gray-300 transition-colors">
            <MoreIcon cls="w-5 h-5" />
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
              className={`transition-colors ${isLiked ? "text-red-500" : "text-gray-500 hover:text-gray-300"}`}
            >
              <HeartIcon filled={isLiked} />
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <CommentIcon />
            </button>
            <button className="text-gray-500 hover:text-gray-300 transition-colors">
              <SendIcon />
            </button>
            <button className="ml-auto text-gray-500 hover:text-gray-300 transition-colors">
              <BookmarkIcon />
            </button>
          </div>

          {/* Like Count */}
          <p className="text-sm font-semibold text-gray-100 mb-2">
            {likeCount === 0 ? "No likes yet" : `${likeCount} ${likeCount === 1 ? "like" : "likes"}`}
          </p>
        </div>

        {/* Post Caption */}
        {item.caption && (
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-gray-100">{item.user?.name} </span>
              {item.caption}
            </p>
          </div>
        )}

        {/* View Comments */}
        {showComments && (
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-800/30">
            <p className="text-xs text-gray-500 mb-3">Comments (coming soon)</p>
            <div className="text-sm text-gray-400">
              <p>Comments feature will be available soon</p>
            </div>
          </div>
        )}

        {/* Add Comment */}
        <div className="px-4 py-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 bg-gray-800 text-gray-100 text-sm px-3 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-600"
            />
            <button 
              disabled={!comment.trim()}
              className="text-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SendIcon cls="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === "job") {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden mb-6 hover:border-blue-500/50 transition-colors">
        {/* Job Header */}
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold">
              {item.title?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-gray-100 text-lg">{item.title}</h3>
              <p className="text-gray-400 text-sm">Posted recently</p>
            </div>
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
        </div>

        {/* Job Footer */}
        <div className="px-4 py-3 flex items-center gap-2">
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity">
            Apply Now
          </button>
          <button className="text-gray-500 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg">
            <BookmarkIcon />
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

  const handleUserClick = (userId) => {
    navigate(`/user-profile/${userId}`);
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
          timestamp: new Date(post.created_at).getTime()
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
