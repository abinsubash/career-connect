# Quick Reference: Posts Feature Testing

## ⚡ Quick Start

### 1. Servers Running?
```
Backend: http://localhost:5000
Frontend: http://localhost:5175
```

### 2. Create a Post
```
1. Go to http://localhost:5175/posts
2. Click "+ New Post"
3. Select an image (PNG, JPG, GIF, or WebP)
4. Add optional caption (max 500 chars)
5. Click "Create Post"
6. See success notification
```

### 3. Check Files Stored
```
Windows: C:\VS Code\careerConnect\backend\uploads\posts\
Mac/Linux: ~/careerConnect/backend/uploads/posts/

List files:
  Windows PowerShell: Get-ChildItem
  Terminal: ls -la
```

---

## 🔍 Validation Rules at a Glance

| Field | Rule | Error Message |
|-------|------|---------------|
| **Image** | Required | "Image is required" |
| **Image Type** | PNG, JPG, GIF, WebP only | "Invalid file type" |
| **File Size** | 10KB - 5MB | "File size too large" |
| **Image Dims** | 100x100 to 4000x4000 px | "Image too small/large" |
| **Aspect Ratio** | Max 5:1 | "Aspect ratio too extreme" |
| **Caption** | Max 500 characters | "Caption too long" |

---

## ❌ Common Errors & Fixes

### "Image is required"
**Cause**: No file selected
**Fix**: Click upload zone and select image

### "File size too large (6.2MB)"
**Cause**: Image > 5MB
**Fix**: Compress or resize image

### "Invalid file type"
**Cause**: Wrong format
**Fix**: Use PNG, JPG, GIF, or WebP

### "Image too small"
**Cause**: Image < 100x100 px
**Fix**: Use bigger image

### "Caption too long (650/500)"
**Cause**: Caption > 500 chars
**Fix**: Delete some text

### "Image too large (5000x5000)"
**Cause**: Image > 4000x4000 px
**Fix**: Resize in photo editor

---

## 📊 Backend Console Output

### ✅ Success
```
✅ Post created successfully: 550e8400-e29b-41d4-a716-446655440000
   Image saved to: C:\...\backend\uploads\posts\550e8400_photo.jpg
   Image URL: /uploads/posts/550e8400_photo.jpg
```

### ❌ Error
```
❌ Error saving file: [Error details]
❌ Error validating file: [Validation failure reason]
```

---

## 🧪 Test Cases

| Test | What to Do | Expected Result |
|------|-----------|-----------------|
| **Valid Upload** | Upload 2MB JPEG | ✅ Post created |
| **No Image** | Click Create without image | ❌ Error message |
| **Huge File** | Upload 10MB image | ❌ "Too large" error |
| **Wrong Format** | Upload PDF | ❌ "Invalid type" error |
| **Tiny Image** | Upload 50x50 image | ❌ "Too small" error |
| **Long Caption** | 600 character caption | ❌ "Too long" error |
| **Like Post** | Click heart | ❤️ Count increases |
| **View Image** | Click image in post | 🖼️ Modal opens |
| **Delete Post** | Click delete on own post | ✅ Post removed |

---

## 📸 Image Specification

### Perfect Image Specifications
```
Format: JPEG or PNG
Size: 1-3 MB (optimal)
Resolution: 800x600 to 2000x2000 pixels
Aspect Ratio: 1:1 to 2:1 (roughly square to 2x wide)
Quality: High quality / not compressed
```

### Acceptable
```
Format: GIF, WebP (less common)
Size: 10KB - 5MB
Resolution: 100x100 - 4000x4000 px
Aspect: Up to 5:1 ratio
```

### NOT Acceptable
```
❌ PDF, DOC, TXT files
❌ Less than 10KB
❌ More than 5MB
❌ Less than 100x100 px
❌ More than 4000x4000 px
❌ Extreme aspect ratio (>5:1)
❌ Corrupted files
```

---

## 🎯 File Storage Location

### Where Images Live
```
backend/
  └── uploads/
      └── posts/
          ├── 550e8400_sunset.jpg
          ├── 612c4ef8_beach.png
          └── 7a9b2c3e_mountains.webp
```

### How to Access via API
```
GET http://localhost:5175/uploads/posts/550e8400_sunset.jpg

Response: Image file (served with 24h cache)
```

### Database Entry
```
posts table:
  id: 550e8400-e29b-41d4-a716-446655440000
  image_url: /uploads/posts/550e8400_sunset.jpg
  created_at: 2026-04-24 10:30:00
```

---

## 🔧 Troubleshooting Steps

### Step 1: Check Backend Running
```powershell
# Open new terminal
cd backend
python run.py

# Should see:
# * Running on http://127.0.0.1:5000
# * Warning: This is a development server
```

### Step 2: Check Frontend Running
```powershell
# Open another terminal
cd frontend
npm run dev

# Should see:
# ➜ Local: http://localhost:5175
```

### Step 3: Verify File Storage
```powershell
# Check directory exists
Test-Path "C:\VS Code\careerConnect\backend\uploads\posts"

# Should return: True

# List files
Get-ChildItem "C:\VS Code\careerConnect\backend\uploads\posts"

# Should show uploaded images with UUID names
```

### Step 4: Check Database
```powershell
# Open SQLite database viewer or use Python:
cd backend
python

# In Python:
from app.db import db
from app.models.post_model import Post
Post.query.all()  # Lists all posts
```

### Step 5: Check Browser Console
```
1. Go to http://localhost:5175/posts
2. Press F12 (Open DevTools)
3. Go to Console tab
4. Check for errors
5. Look for image URLs
```

### Step 6: Check Network Tab
```
1. Press F12
2. Go to Network tab
3. Create a post
4. Look for:
   - POST /api/posts/create (201 Created)
   - GET /uploads/posts/filename (200 OK)
```

---

## ♻️ Reset Everything

### Clear Upload Directory
```powershell
cd "C:\VS Code\careerConnect\backend\uploads\posts"
Remove-Item * -Force  # Delete all files
```

### Reset Database
```powershell
cd backend
python reset_db.py
```

### Restart Everything
```powershell
# Terminal 1
cd backend
python run.py

# Terminal 2
cd frontend
npm run dev
```

---

## 📞 Quick Help

**Q: Where are uploaded images stored?**
A: `C:\VS Code\careerConnect\backend\uploads\posts\`

**Q: Why can't I see my image?**
A: Check that file exists in uploads folder, verify image_url in database

**Q: How do I check file sizes?**
A: Windows: Right-click → Properties → Size
   Linux/Mac: ls -lh in terminal

**Q: Can I upload multiple images?**
A: No, currently 1 image per post only

**Q: What if I delete a post?**
A: Image file is automatically deleted from disk

**Q: Can other users delete my posts?**
A: No, only post owner can delete

**Q: How long before images expire?**
A: Never (until manually deleted)

---

## 📋 Validation Checklist

When uploading, verify:
- [ ] Image file selected (not PDF/Doc)
- [ ] File size between 10KB - 5MB
- [ ] Image dimensions 100px to 4000px
- [ ] Aspect ratio not extreme (max 5:1)
- [ ] Caption (if added) ≤ 500 characters
- [ ] Image file not corrupted

---

## 🔐 Security Notes

```
✅ Only allowed image formats accepted
✅ File size limited to prevent abuse
✅ Filenames sanitized for safety
✅ Path traversal prevented
✅ Images served only to permitted origins
✅ Authentication required to create posts
✅ Only owner can delete their posts
```

---

**Need more help? See:**
- `IMAGE_STORAGE_GUIDE.md` - Complete technical guide
- `POSTS_VALIDATION_IMPROVEMENTS.md` - Detailed improvements

Generated: 2026-04-24
