# 📸 POSTS IMAGE UPLOAD - DEBUGGING & TESTING GUIDE

## What Was Fixed

✅ **Created uploads directory**: `/backend/uploads/posts/` now exists
✅ **Added detailed logging**: Backend logs will show upload process
✅ **Fixed image URLs**: Images now return full URLs like `http://localhost:5000/uploads/posts/xyz.jpg`
✅ **Updated Post model**: Returns proper URLs that frontend can load

---

## Test Steps

### Step 1: Clear Browser & Start Fresh
```
1. Close all browser tabs
2. Ctrl+Shift+Delete → Clear all browsing data (All time)
3. Check: Cookies, Cache, Cached images
4. Close browser completely
```

### Step 2: Verify Backend is Running
```powershell
# Check if backend terminal shows:
# ✓ "Running on http://127.0.0.1:5000"
# ✓ "Restarting with stat" (means it auto-reloaded)
```

### Step 3: Start Frontend Fresh
```powershell
# Terminal: Frontend
cd frontend
npm run dev
```

### Step 4: Go to Posts Page
```
http://localhost:5175/posts
```

### Step 5: Create a Post
1. Click **"+ New Post"** button
2. Select an image (JPG, PNG, GIF, WebP)
3. Image should show in preview
4. Type optional caption
5. Click **"Create Post"**

### Step 6: Check Backend Terminal
Look for logs like:
```
================================================================================
📝 POST CREATION REQUEST FROM USER: user_123
================================================================================
Request form data: {'caption': 'My post!'}
Request files: ['image']
📤 Saving file to: C:\VS Code\careerConnect\backend\uploads\posts\550e8400_photo.jpg
✅ File saved successfully: 550e8400_photo.jpg (1024.5KB)
✅ Post created successfully: 550e8400-e29b-41d4-a716-446655440000
   Image saved to: C:\VS Code\careerConnect\backend\uploads\posts\550e8400_photo.jpg
   Image URL: /uploads/posts/550e8400_photo.jpg
```

### Step 7: Verify Image Displays
1. Image should appear in post grid on home page
2. Click image → should open in viewer modal
3. Click heart → should like/unlike

---

## File Locations

### Backend
- Source: `backend/app/controllers/posts/post_controller.py`
- Uploads dir: `backend/uploads/posts/`
- Model: `backend/app/models/post_model.py`
- Routes: `backend/app/routes/posts/post_routes.py`

### Frontend
- Posts page: `frontend/src/pages/user/posts.jsx`
- API: `frontend/src/api/postAPI.js`
- Axios: `frontend/src/api/axiosInstance.js`

### Database
- File: `backend/instance/careerconnect.db`
- Tables: `posts`, `post_likes`

---

## Expected Image URLs

### In Database
```
image_url: /uploads/posts/550e8400_photo.jpg
```

### In API Response
```json
{
  "image_url": "http://localhost:5000/uploads/posts/550e8400_photo.jpg"
}
```

### In Frontend
```jsx
<img src="http://localhost:5000/uploads/posts/550e8400_photo.jpg" />
```

---

## Common Issues & Solutions

### ❌ Image Shows Broken Icon
**Cause**: Image URL is not loading
**Fix**:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Take a screenshot of failed request
4. Check if URL is correct in Response tab
5. Test URL directly: `http://localhost:5000/uploads/posts/xyz.jpg`

### ❌ Upload Form Shows Error
**Cause**: Backend validation failing
**Fix**:
1. Check backend terminal for error message
2. Verify image constraints:
   - Size: 10KB - 5MB
   - Format: PNG, JPG, JPEG, GIF, WebP
   - Dimensions: 100x100 - 4000x4000px
   - Aspect ratio: Max 5:1

### ❌ "404 Not Found" for Image
**Cause**: File not saved to disk
**Fix**:
1. Check if directory exists: `backend/uploads/posts/`
2. Check file permissions
3. Check backend terminal for save errors

### ❌ Images Not Showing on Home Page
**Cause**: API not returning images or wrong URL
**Fix**:
1. Check API response with Network tab
2. Verify image_url field is present
3. Test URL in browser address bar

---

## Debugging Checklist

- [ ] Backend is running (`python run.py`)
- [ ] `/backend/uploads/posts/` directory exists
- [ ] Frontend is running (`npm run dev`)
- [ ] Browser cache is cleared
- [ ] Image file meets requirements (10KB-5MB, 100-4000px)
- [ ] Network tab shows successful POST request
- [ ] Backend terminal shows ✅ success messages
- [ ] Database has record in `posts` table
- [ ] File exists in `/backend/uploads/posts/` directory
- [ ] Image URL starts with `http://localhost:5000/`

---

## Testing Commands

### Verify Backend Uploads Directory
```powershell
Test-Path "C:\VS Code\careerConnect\backend\uploads\posts"
Get-ChildItem "C:\VS Code\careerConnect\backend\uploads\posts"
```

### Test Image Serving Endpoint
```powershell
curl http://localhost:5000/uploads/posts/test.jpg
```

Or in Python:
```python
import requests
r = requests.get('http://localhost:5000/uploads/posts/test.jpg')
print(r.status_code)  # Should be 404 if file not there, or 200 if found
```

### Check Database
```powershell
sqlite3 "C:\VS Code\careerConnect\backend\instance\careerconnect.db" "SELECT id, user_id, image_url, likes_count FROM posts LIMIT 5;"
```

---

## Expected Behavior Flow

```
User → Frontend
   ↓
Frontend sends FormData with image (multipart/form-data)
   ↓
Backend /api/posts/create receives request
   ↓
Backend validates: caption ≤ 500 chars, image exists, file type OK, dimensions OK
   ↓
Backend saves file to: /backend/uploads/posts/{uuid}_{filename}
   ↓
Backend creates DB record with image_url: /uploads/posts/{filename}
   ↓
Backend returns JSON with image_url: http://localhost:5000/uploads/posts/{filename}
   ↓
Frontend receives full URL and stores in state
   ↓
Frontend renders <img src="http://localhost:5000/uploads/posts/{filename}" />
   ↓
Browser loads image from backend
   ↓
Image displays on page ✅
```

---

## Status Summary

- ✅ Backend upload logic: READY
- ✅ Database schema: READY
- ✅ File storage directory: CREATED
- ✅ Image URL construction: FIXED
- ✅ Frontend display: READY
- ✅ API endpoints: READY
- ⏳ **Waiting for user test**: Please try uploading an image now!

---

Generated: 2026-04-24
Last Updated: Posts Image Upload Fixed & Ready for Testing
