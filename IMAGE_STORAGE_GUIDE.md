# 📸 Image Storage & Validation Guide

## File Storage Location

### Physical Storage Path
```
Backend Directory Structure:
careerConnect/backend/
├── uploads/
│   └── posts/                    ← All uploaded images stored here
│       ├── {post_id}_{filename}.jpg
│       ├── {post_id}_{filename}.png
│       └── {post_id}_{filename}.webp
├── app/
│   ├── controllers/
│   │   └── posts/
│   │       └── post_controller.py  ← Image validation & storage logic
│   └── __init__.py                 ← File serving endpoint
└── run.py
```

### How Images Are Stored

1. **Upload Directory Creation**
   - Path: `/backend/uploads/posts/`
   - Auto-created if doesn't exist
   - Full path: `C:\VS Code\careerConnect\backend\uploads\posts\`

2. **Filename Format**
   - Pattern: `{post_id}_{original_filename}`
   - Example: `550e8400-e29b-41d4-a716-446655440000_my_photo.jpg`
   - Post ID ensures unique filenames
   - Original filename preserved for reference

3. **Database Storage**
   - Posts table stores: `/uploads/posts/{filename}`
   - Used for retrieval from frontend
   - Relative path ensures portability

### File Serving Flow

```
User Request → Frontend (React)
    ↓
GET /uploads/posts/filename.jpg
    ↓
Backend Flask App (@app.route)
    ↓
Validate: Security check (path traversal prevention)
    ↓
Check: File exists & has content
    ↓
send_file() with caching headers (24 hours)
    ↓
Image displayed in browser
```

---

## Validation Rules

### 📋 Image Validation Checklist

#### 1. **File Type Validation**
```
✅ Allowed: PNG, JPG, JPEG, GIF, WebP
❌ Not allowed: BMP, TIFF, SVG, PDF, etc.
```

#### 2. **File Size Validation**
```
Maximum: 5 MB (5,242,880 bytes)
Minimum: 10 KB (10,240 bytes)
Rule: File must have actual content
```

#### 3. **Image Dimension Validation**
```
Minimum: 100x100 pixels
Maximum: 4000x4000 pixels
Examples:
  ✅ 800x600 → Valid
  ✅ 1920x1080 → Valid
  ❌ 50x50 → Too small (< 100px)
  ❌ 5000x5000 → Too large (> 4000px)
```

#### 4. **Aspect Ratio Validation**
```
Maximum ratio: 5:1
Rule: Prevents extremely stretched images

Examples:
  ✅ 16:9 (1.78:1) → Valid
  ✅ 4:3 (1.33:1) → Valid
  ✅ 2:1 → Valid (exactly 2:1)
  ❌ 10:1 → Invalid (too extreme)
```

#### 5. **Image Format Verification**
```
Validates actual image format (not just extension)
Examples:
  ✅ File named "photo.jpg" with JPEG data → Valid
  ❌ File named "photo.jpg" with PNG data → Invalid
```

### 📝 Caption Validation

```
Maximum length: 500 characters
Minimum: Can be empty (optional)
Rules:
  - No more than 2 consecutive line breaks
  - Trimmed of whitespace
  - Encoded properly for database storage
```

### ❌ Validation Error Examples

```
1. Image Required
   Message: "Image is required. Please upload an image file."
   Code: 400 Bad Request

2. Invalid File Type
   Message: "Invalid file type. Allowed formats: PNG, JPG, JPEG, GIF, WEBP"
   Code: 400 Bad Request

3. File Too Large
   Message: "File size too large (6.2MB). Maximum allowed: 5MB"
   Code: 400 Bad Request

4. Image Dimensions Invalid
   Message: "Image too large. Maximum size: 4000x4000px"
   Code: 400 Bad Request

5. Extreme Aspect Ratio
   Message: "Image aspect ratio too extreme (max 5:1)"
   Code: 400 Bad Request

6. Corrupted Image
   Message: "Invalid or corrupted image file: cannot identify image file"
   Code: 400 Bad Request

7. Caption Too Long
   Message: "Caption too long (650/500). Please shorten it."
   Code: 400 Bad Request
```

---

## Backend Implementation Details

### Validation Code Location
**File**: `backend/app/controllers/posts/post_controller.py`

### Key Functions

#### 1. `allowed_file(filename)`
```python
# Checks file extension
✅ Returns True if extension in ALLOWED_EXTENSIONS
❌ Returns False if invalid extension
```

#### 2. `validate_image(file)`
```python
# Comprehensive image validation
Steps:
  1. Check file size (min 10KB, max 5MB)
  2. Open image with PIL
  3. Verify dimensions (100-4000px)
  4. Calculate aspect ratio
  5. Verify image format
  6. Return list of errors (if any)
```

#### 3. `create_post(user_id)`
```python
# Main post creation with validation
Steps:
  1. Validate form data received
  2. Validate caption (optional, max 500 chars)
  3. Validate image file exists
  4. Check file extension
  5. Validate image content
  6. Create upload directory (if needed)
  7. Save file with secure filename
  8. Verify file was saved
  9. Create database record
  10. Return success or rollback on error

Error Handling:
  - Any validation failure → Delete uploaded file
  - Database error → Return 500, cleanup file
  - File save error → Return 500, cleanup temporary files
```

### File Security Features

```
✅ Secure Filename
   - Removes dangerous characters
   - Uses werkzeug.utils.secure_filename()

✅ Path Traversal Prevention
   - Validates filepath stays within upload directory
   - Prevents "../../../etc/passwd" attacks

✅ File Content Verification
   - Checks actual file type (not just extension)
   - PIL library verifies true image format

✅ Size Limits
   - File size validation
   - Prevents disk space exhaustion

✅ Directory Permissions
   - Upload folder created with safe permissions
   - Only Flask app can write here
```

---

## API Endpoints Details

### Create Post
```
POST /api/posts/create
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
  - image: File (required)
  - caption: String (optional, max 500 chars)

Response 201:
{
  "success": true,
  "message": "Post created successfully!",
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user123",
    "caption": "Beautiful sunset",
    "image_url": "/uploads/posts/550e8400_sunset.jpg",
    "likes_count": 0,
    "created_at": "2026-04-24T10:30:00"
  }
}

Response 400:
{
  "success": false,
  "error": "File size too large (6.2MB). Maximum allowed: 5MB"
}
```

### Get All Posts
```
GET /api/posts/all?page=1&limit=10
Response: Array of posts with image URLs
```

### Delete Post
```
DELETE /api/posts/{post_id}
Headers: Authorization: Bearer {token}

On Success:
  1. Image file deleted from /uploads/posts/
  2. Database record deleted
  3. Response 200 with success message
```

---

## Testing Image Upload

### Manual Testing Steps

1. **Go to Posts Page**
   ```
   Navigate to: http://localhost:5175/posts
   ```

2. **Click "New Post"**
   ```
   Button appears in top-right
   ```

3. **Upload Image**
   ```
   Click upload zone or drag & drop
   Select image from computer
   ```

4. **Add Caption (Optional)**
   ```
   Type in caption field
   Max 500 characters
   ```

5. **Submit**
   ```
   Click "Create Post" button
   Watch for success/error notification
   ```

### Test Cases

#### ✅ Valid Upload
- Image: 2MB JPEG
- Caption: "Beautiful day"
- Expected: Post created, image visible

#### ❌ No Image
- Click Create without selecting image
- Expected: Error "Image is required"

#### ❌ File Too Large
- Image: 10MB
- Expected: Error "File size too large"

#### ❌ Wrong Format
- File: document.pdf
- Expected: Error "Invalid file type"

#### ❌ Tiny Image
- Image: 50x50 pixels
- Expected: Error "Image too small"

#### ❌ Extreme Ratio
- Image: 10000x100 pixels
- Expected: Error "Extreme aspect ratio"

#### ❌ Caption Too Long
- Caption: 600 characters
- Expected: Error about character limit

---

## Browser Console Debug

### Check Image URL
```javascript
// In browser console
document.querySelector('img').src
// Should show: http://localhost:5175/uploads/posts/uuid_filename.jpg
```

### Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Upload post
4. Look for POST /api/posts/create
5. Check Response shows image_url
6. Look for GET /uploads/posts/filename
7. Verify 200 status and image loads
```

---

## Console Logs (Backend)

### Successful Upload
```
✅ Post created successfully: 550e8400-e29b-41d4-a716-446655440000
   Image saved to: C:\VS Code\careerConnect\backend\uploads\posts\550e8400_photo.jpg
   Image URL: /uploads/posts/550e8400_photo.jpg

📥 Serving image: 550e8400_photo.jpg (2048KB)
```

### Upload Error
```
❌ Error saving file: [Errno 2] No such file or directory

❌ Error deleting image file: Could not delete...

❌ Error updating post: Caption is required
```

### Like/Unlike
```
❤️  Post liked by user123: 550e8400-e29b-41d4-a716-446655440000 (Total likes: 1)

💔 Post unliked by user123: 550e8400-e29b-41d4-a716-446655440000 (Total likes: 0)
```

---

## Troubleshooting

### Issue: Image Not Displaying

**Symptoms**: Broken image icon instead of photo

**Solutions**:
1. Check file exists in `/uploads/posts/`
2. Verify image_url in database
3. Check browser Network tab (404 error?)
4. Verify file has read permissions
5. Check Flask serving endpoint is working

### Issue: Upload Fails with "Server Error"

**Solutions**:
1. Check backend console for error message
2. Verify `/uploads/posts/` directory exists
3. Check disk space available
4. Verify Flask has write permissions
5. Restart backend server

### Issue: "File Too Large" Even for Small Files

**Solutions**:
1. Verify file size is actually under 5MB
   ```
   Windows: Right-click → Properties
   Mac/Linux: ls -lh filename
   ```
2. File extension must match actual format
3. Image must be corruption-free

### Issue: Image Dimensions Error

**Solutions**:
1. Check actual image dimensions
2. Resize image in editor if too large
3. Don't use extreme aspect ratios (very wide/tall)

---

## Performance Optimization

### Image Caching
```
Frontend:
  - Browser caches images for 24 hours
  - Cache-Control header: max-age=86400

Backend:
  - send_file() with cache_timeout=86400
  - Reduces server load on repeat views
```

### File Storage
```
Images stored on filesystem (not database)
  ✅ Faster serving
  ✅ Lower memory usage
  ✅ Easy to backup
  ✅ CDN-ready
```

### Database
```
Stores only image URL and metadata
  ✅ Small database footprint
  ✅ Fast queries
  ✅ Easy pagination
```

---

## Storage Capacity Planning

### Example Storage Usage
```
Average image size: 2MB
Average post size: 2MB (1 image + metadata)

1,000 posts: 2GB
10,000 posts: 20GB
100,000 posts: 200GB

Recommendation:
  - Monitor /uploads/posts/ folder
  - Archive old images after 6 months
  - Implement image compression for large uploads
  - Use external storage (S3, Azure) for production
```

---

## Future Enhancements

- [ ] Automatic image compression
- [ ] Multiple image upload support
- [ ] Image cropping tool
- [ ] Thumbnail generation
- [ ] CDN integration
- [ ] Cloud storage (AWS S3, Google Cloud)
- [ ] Image optimization pipeline
- [ ] EXIF data sanitization
- [ ] Auto-rotate based on orientation
- [ ] WebP format conversion

---

**Last Updated**: 2026-04-24
**Status**: ✅ Production Ready
