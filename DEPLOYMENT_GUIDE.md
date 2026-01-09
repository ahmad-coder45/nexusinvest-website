# 🚀 DEPLOYMENT GUIDE - NEXUSINVEST

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. Firebase Project Setup**
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Firestore Database
- [ ] Enable Storage
- [ ] Enable Functions (Blaze Plan required)
- [ ] Enable Hosting

### **2. Firebase Configuration**
1. Go to Project Settings → General → Your apps
2. Click "Add app" → Web app
3. Copy the Firebase configuration
4. Replace values in `js/firebase-config-template.js`
5. Rename file to `js/firebase-config.js`

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### **3. Admin Account Setup**
After deployment, create admin account:
1. Register a new user via the website
2. Go to Firebase Console → Firestore Database
3. Find the user document in `users` collection
4. Change `role` field from `"user"` to `"admin"`
5. Now you can login at `/admin/admin-login.html`

### **4. Payment Settings**
Configure payment details in Firestore:
1. Go to Firestore Database
2. Create collection: `settings`
3. Create document: `platform_settings`
4. Add fields:
   - `binanceWallet`: "YOUR_BINANCE_WALLET_ADDRESS"
   - `jazzcashNumber`: "03XXXXXXXXX"
   - `easypaisaNumber`: "03XXXXXXXXX"

---

## 🔧 **DEPLOYMENT STEPS**

### **Method 1: Firebase CLI (Recommended)**

#### **Step 1: Install Firebase CLI**
```bash
npm install -g firebase-tools
```

#### **Step 2: Login to Firebase**
```bash
firebase login
```

#### **Step 3: Initialize Firebase**
```bash
firebase init
```
Select:
- Hosting
- Firestore
- Storage
- Functions

#### **Step 4: Deploy Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

#### **Step 5: Deploy Storage Rules**
```bash
firebase deploy --only storage
```

#### **Step 6: Deploy Cloud Functions**
```bash
cd firebase/functions
npm install
cd ../..
firebase deploy --only functions
```

#### **Step 7: Deploy Website**
```bash
firebase deploy --only hosting
```

#### **Step 8: Deploy Everything**
```bash
firebase deploy
```

---

### **Method 2: Manual Deployment**

#### **Firestore Rules:**
1. Go to Firebase Console → Firestore Database → Rules
2. Copy content from `firebase/firestore.rules`
3. Paste and publish

#### **Storage Rules:**
1. Go to Firebase Console → Storage → Rules
2. Copy content from `firebase/storage.rules`
3. Paste and publish

#### **Cloud Functions:**
1. Go to Firebase Console → Functions
2. Click "Get Started"
3. Copy content from `firebase/functions/index.js`
4. Deploy via console or CLI

#### **Hosting:**
1. Go to Firebase Console → Hosting
2. Click "Get Started"
3. Upload all files (except firebase folder)
4. Deploy

---

## ⚙️ **POST-DEPLOYMENT CONFIGURATION**

### **1. Enable Email Verification**
1. Go to Firebase Console → Authentication → Templates
2. Customize email verification template
3. Enable email verification

### **2. Set Up Scheduled Functions**
Cloud Functions will automatically run:
- Daily profit distribution: Every day at 00:00 UTC
- Weekly salary payment: Every Sunday at 00:00 UTC
- Monthly withdrawal reset: 1st of each month at 00:00 UTC

### **3. Test All Features**
- [ ] User registration ($1 bonus)
- [ ] Email verification
- [ ] Login/Logout
- [ ] Deposit (all 3 methods)
- [ ] Withdrawal (check restrictions)
- [ ] Investment (all 7 plans)
- [ ] Referral system
- [ ] Admin login
- [ ] Admin deposit approval
- [ ] Admin withdrawal approval

### **4. Security Checklist**
- [ ] Firebase rules deployed
- [ ] Admin account secured
- [ ] Payment details configured
- [ ] Email verification enabled
- [ ] HTTPS enabled (automatic with Firebase Hosting)

---

## 🔐 **SECURITY BEST PRACTICES**

1. **Never commit `firebase-config.js`** (already in .gitignore)
2. **Use strong admin password**
3. **Enable 2FA on Firebase account**
4. **Regularly backup Firestore data**
5. **Monitor Cloud Functions logs**
6. **Review security rules monthly**

---

## 📊 **MONITORING & MAINTENANCE**

### **Firebase Console Monitoring:**
- Authentication: Track user signups
- Firestore: Monitor database usage
- Storage: Check file uploads
- Functions: View execution logs
- Hosting: Check traffic

### **Regular Tasks:**
- Review pending deposits/withdrawals daily
- Check Cloud Functions logs weekly
- Backup Firestore data monthly
- Update security rules as needed

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Cloud Functions not running**
**Solution:**
- Ensure Blaze Plan is active
- Check Functions logs in Firebase Console
- Verify timezone settings

### **Issue: Deposits not approving**
**Solution:**
- Check Firestore rules
- Verify admin permissions
- Check Cloud Functions logs

### **Issue: Email verification not sending**
**Solution:**
- Enable email verification in Firebase Console
- Check email template settings
- Verify SMTP configuration

### **Issue: Referral commissions not working**
**Solution:**
- Check Cloud Functions deployment
- Verify Firestore indexes
- Check user referral codes

---

## 📱 **CUSTOM DOMAIN SETUP**

1. Go to Firebase Console → Hosting → Add custom domain
2. Follow DNS configuration steps
3. Wait for SSL certificate (automatic)
4. Domain will be live in 24-48 hours

---

## 💰 **COST ESTIMATION**

### **Firebase Pricing (Blaze Plan):**
- **Hosting:** Free up to 10GB/month
- **Firestore:** Free up to 50K reads/day
- **Storage:** Free up to 5GB
- **Functions:** Free up to 2M invocations/month
- **Authentication:** Free up to 50K users

**Estimated Monthly Cost for 1000 users:** $5-$20

---

## 🎉 **LAUNCH CHECKLIST**

- [ ] Firebase project configured
- [ ] All rules deployed
- [ ] Cloud Functions deployed
- [ ] Website deployed
- [ ] Admin account created
- [ ] Payment details configured
- [ ] All features tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

## 📞 **SUPPORT**

For deployment issues:
1. Check Firebase Console logs
2. Review this deployment guide
3. Check Firebase documentation
4. Contact Firebase support

---

## 🚀 **YOU'RE READY TO LAUNCH!**

Your NexusInvest platform is production-ready with:
- ✅ Complete user authentication
- ✅ 3 payment methods
- ✅ 7 investment plans
- ✅ Automated daily profits
- ✅ 3-level referral system
- ✅ Weekly salary plans
- ✅ Admin panel
- ✅ Real-time updates
- ✅ Mobile responsive
- ✅ Secure & scalable

**Good luck with your launch! 🎊**
