# 🎯 FEATURE IMPROVEMENTS - Implementation Guide

## 📋 **FEATURES TO IMPLEMENT:**

1. ✅ Fix $1.00 → $0.50 registration bonus display
2. ✅ Show user name and profile picture in header
3. ✅ Add profile picture upload functionality  
4. ✅ Auto-generate referral link on registration
5. ✅ Add proper payment method logos

---

## 🔧 **ISSUE 1: BONUS SHOWING $1.00 INSTEAD OF $0.50**

### **Problem:**
- Dashboard HTML has hardcoded `$1.00` for bonus balance
- Should dynamically load from database

### **Solution:**

The bonus balance line in `dashboard.html` (line 140) shows:
```html
<div class="stat-value" id="bonusBalance">$1.00</div>
```

This is just a **placeholder**. The actual value is loaded by JavaScript in `js/dashboard.js`.

**The real issue:** Your existing user account was created BEFORE we changed the bonus to $0.50.

**Fix Options:**

**Option A: Update Your Existing Account (Quick Fix)**
1. Go to Firebase Console → Firestore
2. Find your user document
3. Change `bonusBalance` from `1` to `0.5`
4. Refresh dashboard

**Option B: Register New Account (Test Fix)**
1. Logout
2. Register new account
3. New account will get $0.50 bonus
4. Check dashboard

**Option C: Update HTML Placeholder (Cosmetic)**
Change line 140 in `dashboard.html`:
```html
<div class="stat-value" id="bonusBalance">$0.00</div>
```

---

## 👤 **ISSUE 2: USER PROFILE PICTURE & NAME**

### **Current State:**
- Shows generic "U" avatar
- Shows "User" as name
- No profile picture upload

### **Required Changes:**

#### **1. Update Dashboard Header**

Current code (lines 103-110):
```html
<div class="user-menu">
    <div class="user-avatar" id="userAvatar">U</div>
    <div class="user-info">
        <div class="user-name" id="userNameMenu">User</div>
        <div class="user-role">Investor</div>
    </div>
</div>
```

**New code with profile picture:**
```html
<div class="user-menu" onclick="toggleUserDropdown()">
    <div class="user-avatar-wrapper">
        <img src="" alt="Profile" class="user-avatar-img" id="userAvatarImg" style="display: none;">
        <div class="user-avatar-initials" id="userAvatar">U</div>
        <div class="avatar-upload-indicator">
            <i class="fas fa-camera"></i>
        </div>
    </div>
    <div class="user-info">
        <div class="user-name" id="userNameMenu">User</div>
        <div class="user-role">Investor</div>
    </div>
</div>

<!-- User Dropdown Menu -->
<div class="user-dropdown" id="userDropdown" style="display: none;">
    <a href="profile.html" class="dropdown-item">
        <i class="fas fa-user"></i> My Profile
    </a>
    <a href="#" onclick="openProfilePictureUpload()" class="dropdown-item">
        <i class="fas fa-camera"></i> Change Picture
    </a>
    <a href="#" onclick="logout()" class="dropdown-item">
        <i class="fas fa-sign-out-alt"></i> Logout
    </a>
</div>

<!-- Hidden file input for profile picture -->
<input type="file" id="profilePictureInput" accept="image/*" style="display: none;" onchange="uploadProfilePicture(event)">
```

#### **2. Add CSS for Profile Picture**

Add to `css/dashboard.css`:
```css
.user-avatar-wrapper {
    position: relative;
    width: 45px;
    height: 45px;
    cursor: pointer;
}

.user-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--electric-blue);
}

.user-avatar-initials {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--electric-blue), var(--neon-green));
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--white);
}

.avatar-upload-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 18px;
    height: 18px;
    background: var(--electric-blue);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    color: var(--white);
    border: 2px solid var(--dark-bg);
    opacity: 0;
    transition: opacity 0.3s;
}

.user-avatar-wrapper:hover .avatar-upload-indicator {
    opacity: 1;
}

.user-dropdown {
    position: absolute;
    top: 70px;
    right: 20px;
    background: var(--card-bg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    padding: 0.5rem 0;
    min-width: 200px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    z-index: 1000;
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-light);
    text-decoration: none;
    transition: all 0.3s;
}

.dropdown-item:hover {
    background: rgba(0, 102, 255, 0.1);
    color: var(--electric-blue);
}

.dropdown-item i {
    width: 20px;
    text-align: center;
}
```

#### **3. Add JavaScript for Profile Picture Upload**

Add to `js/dashboard.js`:
```javascript
// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    if (!userMenu.contains(e.target) && dropdown) {
        dropdown.style.display = 'none';
    }
});

// Open profile picture upload
function openProfilePictureUpload() {
    document.getElementById('profilePictureInput').click();
}

// Upload profile picture
async function uploadProfilePicture(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image size must be less than 5MB', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = e.target.result;
            
            // Update user document with profile picture
            await db.collection('users').doc(currentUser.uid).update({
                profilePicture: base64Image,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update UI
            const avatarImg = document.getElementById('userAvatarImg');
            const avatarInitials = document.getElementById('userAvatar');
            
            avatarImg.src = base64Image;
            avatarImg.style.display = 'block';
            avatarInitials.style.display = 'none';
            
            showToast('Profile picture updated successfully!', 'success');
            hideLoading();
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        showToast('Failed to upload profile picture', 'error');
        hideLoading();
    }
}

// Load user profile picture
async function loadUserProfilePicture() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        if (userData.profilePicture) {
            const avatarImg = document.getElementById('userAvatarImg');
            const avatarInitials = document.getElementById('userAvatar');
            
            avatarImg.src = userData.profilePicture;
            avatarImg.style.display = 'block';
            avatarInitials.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading profile picture:', error);
    }
}

// Call this in loadUserData function
// Add after updating user name:
await loadUserProfilePicture();
```

---

## 🔗 **ISSUE 3: AUTO-GENERATE REFERRAL LINK**

### **Current State:**
- Referral code is generated during registration ✅
- Referral link is NOT auto-generated ❌

### **Solution:**

The referral code is already generated in `js/auth.js` (line 118):
```javascript
const userReferralCode = generateRandomString(6).toUpperCase();
```

**To show referral link on referrals page:**

Update `js/referrals.js` to generate link:
```javascript
// Generate referral link
function generateReferralLink(referralCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register.html?ref=${referralCode}`;
}

// Display referral link
async function loadReferralData() {
    const userDoc = await db.collection('users').doc(currentUser.uid).get();
    const userData = userDoc.data();
    
    const referralCode = userData.referralCode;
    const referralLink = generateReferralLink(referralCode);
    
    // Update UI
    document.getElementById('referralCode').textContent = referralCode;
    document.getElementById('referralLink').value = referralLink;
}
```

---

## 🖼️ **ISSUE 4: ADD PROPER PAYMENT METHOD LOGOS**

### **Current State:**
- Using Font Awesome icons
- Need actual payment method logos

### **Solution:**

#### **Payment Method Logos to Add:**

1. **EasyPaisa Logo**
   - Green circular logo
   - Download from: https://www.easypaisa.com.pk/

2. **JazzCash Logo**
   - Orange/Red logo
   - Download from: https://www.jazzcash.com.pk/

3. **Binance Logo**
   - Yellow/Gold logo
   - Download from: https://www.binance.com/

4. **NayaPay Logo**
   - Blue logo
   - Download from: https://nayapay.com/

5. **SadaPay Logo**
   - Purple logo
   - Download from: https://sadapay.pk/

#### **Implementation:**

**1. Create images folder structure:**
```
images/
  payment-methods/
    easypaisa.png
    jazzcash.png
    binance.png
    nayapay.png
    sadapay.png
```

**2. Update deposit.html:**

Replace icon code with image:
```html
<!-- Before -->
<i class="fas fa-wallet"></i>

<!-- After -->
<img src="images/payment-methods/easypaisa.png" alt="EasyPaisa" class="payment-logo">
```

**3. Add CSS for payment logos:**
```css
.payment-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
    border-radius: 8px;
}
```

---

## 📝 **IMPLEMENTATION CHECKLIST:**

### **Priority 1: Fix Bonus Display**
- [ ] Update existing user's bonusBalance in Firestore (1 → 0.5)
- [ ] OR register new test account
- [ ] Verify dashboard shows $0.50

### **Priority 2: User Profile Picture**
- [ ] Update dashboard.html with new avatar HTML
- [ ] Add CSS for profile picture
- [ ] Add JavaScript for upload functionality
- [ ] Test upload and display

### **Priority 3: Referral Link**
- [ ] Update referrals.js to generate link
- [ ] Display link on referrals page
- [ ] Add copy button functionality
- [ ] Test referral registration

### **Priority 4: Payment Logos**
- [ ] Download payment method logos
- [ ] Create images/payment-methods folder
- [ ] Update deposit.html with images
- [ ] Update withdrawal.html with images
- [ ] Add CSS styling

---

## 🚀 **QUICK FIX FOR BONUS ISSUE:**

**Fastest solution - Update your account in Firestore:**

1. Go to: https://console.firebase.google.com/project/nexusinvest-9c2bd/firestore
2. Click `users` collection
3. Find your user document
4. Click on it
5. Find field: `bonusBalance`
6. Change value from `1` to `0.5`
7. Click "Update"
8. Refresh dashboard

**Bonus will now show $0.50!** ✅

---

## 📱 **TESTING:**

After implementing:

1. **Profile Picture:**
   - Click on avatar
   - Select "Change Picture"
   - Upload image
   - Verify it displays

2. **Bonus Amount:**
   - Check dashboard
   - Should show $0.50
   - Check transactions
   - Should show $0.50 bonus entry

3. **Referral Link:**
   - Go to referrals page
   - Copy referral link
   - Open in incognito
   - Register with link
   - Verify referral tracked

4. **Payment Logos:**
   - Go to deposit page
   - See actual logos (not icons)
   - Go to withdrawal page
   - See actual logos

---

**Need help implementing any of these? Let me know which feature to start with!**
