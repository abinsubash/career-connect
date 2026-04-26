# CareerConnect - Setup Guide

### **Quick Start (One-Click Setup)**

#### **Windows Users**
1. **Navigate to project folder**
2. **Double-click `setup.bat`** and wait for it to complete
3. Everything will be installed automatically!

#### **Mac/Linux Users**
```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

---

## **How It Works**

### **Backend (Flask) - `requirements.txt`**
Like `package.json` for Node.js, this file lists all Python dependencies.

**To update requirements.txt after installing new packages:**
```bash
pip freeze > requirements.txt
```

**To install all packages:**
```bash
pip install -r requirements.txt
```

---

### **Frontend (React) - `package.json`**
This works automatically with npm (like you mentioned).

**To install all packages:**
```bash
npm install
```

---

## **Manual Setup Instructions**

### **Backend Setup**
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install packages
pip install -r requirements.txt

# Run Flask server
python run.py
```

### **Frontend Setup**
```bash
# Navigate to frontend folder
cd frontend

# Install packages
npm install

# Run React dev server
npm run dev
```

---

## **Adding New Packages**

### **Backend (Flask)**
```bash
# Install package
pip install package-name

# Update requirements.txt
pip freeze > requirements.txt

# Commit to git
git add requirements.txt
git commit -m "Add new package"
```

### **Frontend (React)**
```bash
# Install package
npm install package-name

# package.json is auto-updated ✅
# Commit to git
git add package.json package-lock.json
git commit -m "Add new package"
```

---

## **Sharing Project with Team**

### **They Clone Your Project:**
```bash
git clone <your-repo-link>
cd careerConnect
```

### **They Run Setup (One of these):**

**Option 1 - Windows (Easiest):**
- Double-click `setup.bat` in the project folder

**Option 2 - Manual:**
```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Frontend (new terminal)
cd frontend
npm install
```

### **Ready to Go!**
```bash
# Terminal 1 - Backend
cd backend
.venv\Scripts\activate
python run.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## **Troubleshooting**

### **"Python not found"**
- Install Python from https://www.python.org/
- Make sure to check "Add Python to PATH"
- Restart terminal after installation

### **"Node not found"**
- Install Node.js from https://nodejs.org/ (LTS version)
- Restart terminal after installation

### **Package installation fails**
```bash
# Try updating pip first
pip install --upgrade pip

# Then try again
pip install -r requirements.txt
```

### **Virtual environment not working**
```bash
# Delete and recreate
rmdir /s .venv  # Windows
rm -rf .venv    # Mac/Linux

# Create fresh
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```

---

## **Project Structure**
```
careerConnect/
├── backend/          # Flask API
│   ├── .venv/        # Virtual environment (auto-created)
│   ├── requirements.txt
│   ├── run.py
│   └── app/
├── frontend/         # React app
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   └── src/
└── setup.bat         # One-click setup script
```

---

## **Summary**

| Task | Node.js | Flask |
|------|---------|-------|
| Dependency file | `package.json` | `requirements.txt` |
| Install all | `npm install` | `pip install -r requirements.txt` |
| Add package | `npm install pkg` | `pip install pkg` then `pip freeze > requirements.txt` |
| Update auto? | ✅ Yes | ❌ Manual |
| One-click setup | ✅ npm install | ✅ setup.bat |

