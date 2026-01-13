# 🌐 HOW TO OPEN YOUR WEBSITE FROM VS CODE

## 🚀 **QUICK METHODS:**

---

### **METHOD 1: Firebase CLI Command** ⚡ (RECOMMENDED)

In VS Code terminal:

```bash
firebase open hosting:site
```

✅ **Automatically opens your website in default browser!**

---

### **METHOD 2: Use Quick Launch Scripts** 🎯

I've created scripts for you!

#### **For Windows:**
```bash
open-admin.bat
```

#### **For Mac/Linux:**
```bash
bash open-admin.sh
```

✅ **Opens admin panel directly!**

---

### **METHOD 3: Ctrl + Click URL** 🖱️

1. In VS Code terminal, type:
   ```bash
   echo "https://nexusinvest-9c2bd.web.app/admin-login.html"
   ```

2. **Ctrl + Click** (Windows/Linux) or **Cmd + Click** (Mac) on the URL

3. Opens in browser!

---

### **METHOD 4: Copy & Paste** 📋

**Admin Panel:**
```
https://nexusinvest-9c2bd.web.app/admin-login.html
```

**Main Website:**
```
https://nexusinvest-9c2bd.web.app
```

**User Login:**
```
https://nexusinvest-9c2bd.web.app/login.html
```

**Register:**
```
https://nexusinvest-9c2bd.web.app/register.html
```

Copy any URL → Paste in browser → Enter

---

### **METHOD 5: VS Code Extension** 🔌

1. Install **"Live Server"** extension
2. Right-click `index.html`
3. Click **"Open with Live Server"**

⚠️ **Note:** This opens LOCAL version, not deployed version!

---

## 📱 **ALL YOUR WEBSITE URLS:**

After deployment, you have these URLs:

| Page | URL |
|------|-----|
| **Home** | https://nexusinvest-9c2bd.web.app |
| **Login** | https://nexusinvest-9c2bd.web.app/login.html |
| **Register** | https://nexusinvest-9c2bd.web.app/register.html |
| **Dashboard** | https://nexusinvest-9c2bd.web.app/dashboard.html |
| **Deposit** | https://nexusinvest-9c2bd.web.app/deposit.html |
| **Withdrawal** | https://nexusinvest-9c2bd.web.app/withdrawal.html |
| **Plans** | https://nexusinvest-9c2bd.web.app/plans.html |
| **Referrals** | https://nexusinvest-9c2bd.web.app/referrals.html |
| **Admin Login** | https://nexusinvest-9c2bd.web.app/admin-login.html |
| **Admin Dashboard** | https://nexusinvest-9c2bd.web.app/admin-dashboard.html |
| **Admin Settings** | https://nexusinvest-9c2bd.web.app/admin-settings.html |

---

## 🎯 **RECOMMENDED WORKFLOW:**

### **For Development:**

1. **Edit files in VS Code**
2. **Deploy changes:**
   ```bash
   firebase deploy
   ```
3. **Open website:**
   ```bash
   firebase open hosting:site
   ```
4. **Test changes in browser**

---

### **For Quick Admin Access:**

**Windows:**
```bash
open-admin.bat
```

**Mac/Linux:**
```bash
bash open-admin.sh
```

---

## 🔧 **TROUBLESHOOTING:**

### **Issue: "firebase command not found"**

**Solution:**
```bash
npm install -g firebase-tools
firebase login
```

---

### **Issue: "Website not loading"**

**Check:**
1. Is website deployed?
   ```bash
   firebase deploy --only hosting
   ```

2. Check deployment status:
   ```bash
   firebase hosting:channel:list
   ```

3. View hosting URL:
   ```bash
   firebase hosting:sites:list
   ```

---

### **Issue: "Script won't run"**

**For Mac/Linux:**
```bash
# Make script executable
chmod +x open-admin.sh

# Then run
bash open-admin.sh
```

**For Windows:**
```bash
# Just double-click open-admin.bat
# Or run in terminal:
open-admin.bat
```

---

## 💡 **PRO TIPS:**

### **1. Bookmark URLs**

Save these in your browser bookmarks:
- Admin Panel
- User Dashboard
- Firebase Console

### **2. Create VS Code Tasks**

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Open Admin Panel",
      "type": "shell",
      "command": "firebase open hosting:site",
      "problemMatcher": []
    },
    {
      "label": "Deploy & Open",
      "type": "shell",
      "command": "firebase deploy && firebase open hosting:site",
      "problemMatcher": []
    }
  ]
}
```

Then: **Ctrl+Shift+P** → **Tasks: Run Task** → **Open Admin Panel**

### **3. Add to package.json**

Add scripts:

```json
{
  "scripts": {
    "open": "firebase open hosting:site",
    "deploy": "firebase deploy",
    "deploy:open": "firebase deploy && firebase open hosting:site"
  }
}
```

Then run:
```bash
npm run open
```

---

## 🎨 **BROWSER SHORTCUTS:**

Once website is open:

| Action | Shortcut |
|--------|----------|
| Refresh | **Ctrl + R** |
| Hard Refresh | **Ctrl + Shift + R** |
| Open DevTools | **F12** |
| View Console | **Ctrl + Shift + J** |

---

## 📋 **QUICK REFERENCE:**

```bash
# Open website
firebase open hosting:site

# Deploy and open
firebase deploy && firebase open hosting:site

# View deployment info
firebase hosting:sites:list

# View logs
firebase functions:log

# Check status
firebase deploy:status
```

---

## 🚀 **FASTEST METHOD:**

**Just run this in VS Code terminal:**

```bash
firebase open hosting:site
```

**Done!** Your website opens automatically! 🎉

---

**Need help?** Check the other guides:
- **QUICK_START.md** - First time setup
- **ADMIN_SETUP_GUIDE.md** - Admin configuration
- **DEPOSIT_UPDATES.md** - Payment methods info
