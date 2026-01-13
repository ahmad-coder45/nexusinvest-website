# 🔧 ADMIN SETUP GUIDE - Complete Backend Configuration

## 📋 **TABLE OF CONTENTS**

1. [Make Your Account Admin](#step-1-make-your-account-admin)
2. [Login as Admin](#step-2-login-as-admin)
3. [Configure Payment Details](#step-3-configure-payment-details)
4. [Manage Deposits & Withdrawals](#step-4-manage-deposits--withdrawals)
5. [Firebase Security Rules](#step-5-firebase-security-rules)

---

## **STEP 1: MAKE YOUR ACCOUNT ADMIN** 🔐

### **Method 1: Using Firebase Console (Recommended)**

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Login with your Google account

2. **Select Your Project**
   - Click on: **nexusinvest-website**

3. **Open Firestore Database**
   - Click **Firestore Database** in left sidebar
   - Click **Data** tab

4. **Find Your User**
   - Click on **users** collection
   - Find your document (search by email: **ah3869444@gmail.com**)
   - Click on your user document

5. **Change Role to Admin**
   - Find field: `role`
   - Current value: `"user"`
   - Click the value to edit
   - Change to: `"admin"`
   - Click **Update**

6. **Verify**
   - Your role should now show: `role: "admin"`

---

## **STEP 2: LOGIN AS ADMIN** 🚀

### **Access Admin Panel**

1. **Go to Admin Login Page**
   ```
   https://your-website.web.app/admin-login.html
   ```

2. **Enter Your Credentials**
   - Email: ah3869444@gmail.com
   - Password: (your password)

3. **Click "Login as Admin"**
   - System will verify your admin role
   - If successful, redirects to Admin Dashboard

4. **Admin Dashboard URL**
   ```
   https://your-website.web.app/admin-dashboard.html
   ```

---

## **STEP 3: CONFIGURE PAYMENT DETAILS** 💳

### **Navigate to Settings**

1. **From Admin Dashboard**
   - Click **Platform Settings** in sidebar
   - OR click **Platform Settings** button

2. **You'll See 5 Payment Fields:**
   - ✅ Binance Wallet Address
   - ✅ JazzCash IBAN Number
   - ✅ EasyPaisa IBAN Number
   - ✅ NayaPay IBAN Number
   - ✅ SadaPay IBAN Number

---

### **HOW TO GET YOUR PAYMENT DETAILS**

#### **🪙 Binance Wallet Address**

1. Open Binance app/website
2. Go to **Wallet** → **Spot Wallet**
3. Select cryptocurrency (e.g., USDT)
4. Click **Deposit**
5. Copy wallet address
6. Paste in admin settings

**Example:**
```
TXYZabc123def456ghi789jkl012mno345pqr678
```

---

#### **📱 JazzCash IBAN**

1. Open **JazzCash app**
2. Tap **My Account** (bottom menu)
3. Tap **Account Details**
4. Find **IBAN Number**
5. Copy IBAN (24 characters starting with PK)
6. Paste in admin settings

**Example:**
```
PK36TMFB0000001123456789
```

---

#### **💰 EasyPaisa IBAN**

1. Open **EasyPaisa app**
2. Tap **My Account**
3. Tap **Account Details**
4. Find **IBAN Number**
5. Copy IBAN (24 characters starting with PK)
6. Paste in admin settings

**Example:**
```
PK70TMFB0000001234567890
```

---

#### **🏦 NayaPay IBAN**

1. Open **NayaPay app**
2. Tap **Account** (bottom menu)
3. Tap **Account Details**
4. Find **IBAN Number**
5. Copy IBAN (24 characters starting with PK)
6. Paste in admin settings

**Example:**
```
PK24NAYA0000001234567890
```

---

#### **💳 SadaPay IBAN**

1. Open **SadaPay app**
2. Tap **Account** (bottom menu)
3. Tap **Account Details**
4. Find **IBAN Number**
5. Copy IBAN (24 characters starting with PK)
6. Paste in admin settings

**Example:**
```
PK12SADA0000001234567890
```

---

### **SAVE SETTINGS**

1. **Fill All Fields**
   - Enter all 5 payment details
   - Make sure IBANs are 24 characters
   - Make sure IBANs start with "PK"

2. **Click "Save Settings"**
   - System validates IBAN format
   - Saves to Firebase Firestore
   - Shows success message

3. **Verify**
   - Refresh page
   - All fields should show your saved data

---

## **STEP 4: MANAGE DEPOSITS & WITHDRAWALS** 📊

### **Manage Deposits**

1. **Go to Admin Dashboard**
2. **Click "Manage Deposits"**
3. **You'll see:**
   - Pending deposits (waiting for approval)
   - User details
   - Amount
   - Payment method
   - Payment proof screenshot

4. **Actions:**
   - ✅ **Approve** - Credits user balance
   - ❌ **Reject** - Declines deposit with reason

---

### **Manage Withdrawals**

1. **Go to Admin Dashboard**
2. **Click "Manage Withdrawals"**
3. **You'll see:**
   - Pending withdrawals
   - User details
   - Amount
   - Withdrawal method
   - Account details

4. **Actions:**
   - ✅ **Approve** - Marks as paid
   - ❌ **Reject** - Declines withdrawal with reason

---

## **STEP 5: FIREBASE SECURITY RULES** 🔒

### **Update Firestore Rules**

1. **Go to Firebase Console**
2. **Click Firestore Database**
3. **Click "Rules" tab**
4. **Add Admin Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isAdmin();
    }
    
    // Settings collection (admin only)
    match /settings/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Deposits collection
    match /deposits/{depositId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Withdrawals collection
    match /withdrawals/{withdrawalId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Investments collection
    match /investments/{investmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null || isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Referrals collection
    match /referrals/{referralId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

5. **Click "Publish"**

---

## **✅ VERIFICATION CHECKLIST**

### **Admin Access:**
- [ ] Changed role to "admin" in Firebase
- [ ] Can login at admin-login.html
- [ ] Can access admin-dashboard.html
- [ ] Can access admin-settings.html

### **Payment Settings:**
- [ ] Entered Binance wallet address
- [ ] Entered JazzCash IBAN (24 chars, starts with PK)
- [ ] Entered EasyPaisa IBAN (24 chars, starts with PK)
- [ ] Entered NayaPay IBAN (24 chars, starts with PK)
- [ ] Entered SadaPay IBAN (24 chars, starts with PK)
- [ ] Clicked "Save Settings"
- [ ] Settings saved successfully

### **Test Deposit Flow:**
- [ ] Logout from admin
- [ ] Login as regular user
- [ ] Go to deposit page
- [ ] Select payment method
- [ ] See your IBAN/wallet displayed
- [ ] Can copy IBAN/wallet
- [ ] Upload payment proof
- [ ] Submit deposit request

### **Test Admin Approval:**
- [ ] Login as admin
- [ ] Go to Manage Deposits
- [ ] See pending deposit
- [ ] Can view payment proof
- [ ] Can approve/reject deposit

---

## **🎯 QUICK REFERENCE**

### **Admin URLs:**
```
Admin Login:     /admin-login.html
Admin Dashboard: /admin-dashboard.html
Settings:        /admin-settings.html
Deposits:        /admin-deposits.html
Withdrawals:     /admin-withdrawals.html
Users:           /admin-users.html
Investments:     /admin-investments.html
```

### **Firebase Collections:**
```
users          - User accounts
settings       - Platform settings (payment details)
deposits       - Deposit requests
withdrawals    - Withdrawal requests
investments    - Active investments
transactions   - Transaction history
referrals      - Referral records
```

### **Admin Permissions:**
```
✅ View all users
✅ Approve/reject deposits
✅ Approve/reject withdrawals
✅ Manage investments
✅ Configure payment settings
✅ View all transactions
✅ Manage referrals
```

---

## **🚀 DEPLOYMENT**

After setting up admin:

```bash
cd nexusinvest-website
firebase deploy --only hosting
```

Then access:
```
https://your-website.web.app/admin-login.html
```

---

## **📞 SUPPORT**

If you encounter issues:

1. **Check Firebase Console** - Verify role is "admin"
2. **Check Browser Console** - Look for errors (F12)
3. **Clear Cache** - Ctrl + Shift + R
4. **Verify Settings** - Make sure all IBANs are correct format

---

**You're all set!** 🎉

Your admin panel is ready to manage deposits, withdrawals, and platform settings!
