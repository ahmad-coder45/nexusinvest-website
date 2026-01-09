# 💎 NexusInvest - Crypto Mining Investment Platform

A complete, production-ready crypto mining investment platform with multi-level marketing (MLM) system, automated daily profits, 3-level referral commissions, and weekly salary plans.

![NexusInvest](https://img.shields.io/badge/Status-Production%20Ready-success)
![Firebase](https://img.shields.io/badge/Backend-Firebase-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🌟 **Features Overview**

### **User Features:**
- ✅ **Registration with $1 Bonus** - Non-withdrawable bonus for new users
- ✅ **7 Investment Plans** - From $5 to $550 with 80% ROI
- ✅ **Automated Daily Profits** - Automatic distribution every 24 hours
- ✅ **3-Level Referral System** - Earn 12%, 2%, 1% commissions
- ✅ **Weekly Salary Plans** - 3 tiers based on direct sales
- ✅ **Multiple Payment Methods** - Binance, JazzCash, EasyPaisa
- ✅ **Withdrawal System** - Min $5, 5% tax, with restrictions
- ✅ **Transaction Receipts** - PDF receipts for all transactions
- ✅ **Real-time Dashboard** - Track investments, earnings, referrals
- ✅ **Responsive Design** - Works on all devices

### **Admin Features:**
- ✅ **Complete Admin Panel** - Manage entire platform
- ✅ **Deposit Approvals** - Review and approve deposits
- ✅ **Withdrawal Approvals** - Review and approve withdrawals
- ✅ **User Management** - View, block, adjust balances
- ✅ **Investment Monitoring** - Track all investments
- ✅ **Referral Tree View** - Visualize MLM structure
- ✅ **Transaction History** - Complete audit trail
- ✅ **Reports & Analytics** - Platform statistics

---

## 🎨 **Design**

**Color Scheme:**
- Primary: Deep Black (#000000, #0a0a0a)
- Secondary: Electric Blue (#0066ff, #00a3ff)
- Accent: Neon Green (#00ff88, #39ff14)

**Visual Style:**
- 3D geometric elements
- Glass-morphism effects
- Animated gradients
- Professional mining hardware images
- Modern tech aesthetic

---

## 💰 **Investment Plans**

### **Regular Plans:**

| Plan | Investment | Daily Profit | Total Return | ROI | Duration |
|------|-----------|--------------|--------------|-----|----------|
| Plan 01 | $5 | $0.30 | $9 | 80% | 30 days |
| Plan 02 | $12 | $0.72 | $21.60 | 80% | 30 days |
| Plan 03 | $30 | $1.80 | $54 | 80% | 30 days |
| Plan 04 | $50 | $3.00 | $90 | 80% | 30 days |

### **Lock Plans (Higher ROI):**

| Plan | Investment | Daily Profit | Total Return | ROI | Duration |
|------|-----------|--------------|--------------|-----|----------|
| Plan 05 | $120 | $7.20 | $216 | 80% | 30 days |
| Plan 06 | $250 | $15.00 | $450 | 80% | 30 days |
| Plan 07 | $550 | $33.00 | $990 | 80% | 30 days |

---

## 🔗 **Referral Commission System**

**3-Level MLM Structure:**
- **Level 1 (Direct Referrals):** 12% commission
- **Level 2 (Indirect):** 2% commission
- **Level 3 (Indirect):** 1% commission

**Example:**
- User A refers User B → User B invests $100 → User A gets $12
- User B refers User C → User C invests $100 → User B gets $12, User A gets $2
- User C refers User D → User D invests $100 → User C gets $12, User B gets $2, User A gets $1

---

## 💵 **Salary Plans**

**Weekly Automated Payments:**

| Plan | Direct Sales Required | Weekly Salary |
|------|----------------------|---------------|
| Plan 1 | $1,000 | $5 |
| Plan 2 | $2,500 | $15 |
| Plan 3 | $6,000 | $50 |

---

## 💳 **Financial Rules**

### **Deposits:**
- Minimum: $5
- No maximum limit
- No deposit fees
- Payment methods: Binance, JazzCash, EasyPaisa
- Admin approval required

### **Withdrawals:**
- Minimum: $5
- Tax: 5% (deducted from withdrawal)
- **Restrictions:**
  - First withdrawal: Available after 10 days from first investment
  - Second withdrawal: Requires 1 active referral
- Admin approval required

### **Bonus:**
- $1 registration bonus (non-withdrawable)
- Can only be used for reinvestment

---

## 🛠️ **Technology Stack**

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Cloud Functions
- **Animations:** AOS / GSAP
- **Icons:** Font Awesome 6
- **Design:** Responsive, Mobile-first

---

## 📁 **Project Structure**

```
nexusinvest-website/
├── index.html                  # Homepage
├── about.html                  # About page
├── plans.html                  # Investment plans
├── how-it-works.html          # How it works
├── contact.html               # Contact page
├── faq.html                   # FAQ
├── terms.html                 # Terms & Conditions
├── privacy.html               # Privacy Policy
├── login.html                 # User login
├── register.html              # User registration
├── dashboard.html             # User dashboard
├── my-investments.html        # Active investments
├── deposit.html               # Deposit page
├── withdrawal.html            # Withdrawal page
├── transactions.html          # Transaction history
├── profile.html               # User profile
├── referrals.html             # Referral system
├── salary.html                # Salary plans
├── css/
│   ├── style.css             # Main styles
│   ├── dashboard.css         # Dashboard styles
│   ├── auth.css              # Authentication styles
│   └── responsive.css        # Responsive styles
├── js/
│   ├── main.js               # Main functionality
│   ├── firebase-config.js    # Firebase configuration
│   ├── auth.js               # Authentication
│   ├── dashboard.js          # Dashboard logic
│   ├── deposit.js            # Deposit logic
│   ├── withdrawal.js         # Withdrawal logic
│   ├── transactions.js       # Transactions
│   ├── investments.js        # Investments
│   ├── referrals.js          # Referral system
│   ├── salary.js             # Salary calculations
│   ├── daily-profit.js       # Daily profit distribution
│   └── animations.js         # Animations
├── admin/
│   ├── admin-login.html      # Admin login
│   ├── admin-dashboard.html  # Admin dashboard
│   ├── pending-deposits.html # Deposit approvals
│   ├── pending-withdrawals.html # Withdrawal approvals
│   ├── users-management.html # User management
│   ├── all-investments.html  # Investment monitoring
│   ├── referral-tree.html    # Referral tree view
│   ├── salary-management.html # Salary management
│   ├── css/
│   │   └── admin.css         # Admin styles
│   └── js/
│       ├── admin.js          # Admin logic
│       ├── admin-deposits.js # Deposit management
│       ├── admin-withdrawals.js # Withdrawal management
│       └── admin-users.js    # User management
├── firebase/
│   ├── firestore.rules       # Firestore security rules
│   ├── storage.rules         # Storage security rules
│   └── functions/
│       ├── index.js          # Cloud Functions
│       ├── package.json      # Dependencies
│       ├── daily-profit.js   # Daily profit function
│       ├── weekly-salary.js  # Weekly salary function
│       ├── referral-commission.js # Commission calculator
│       ├── deposit-handler.js # Deposit approval handler
│       ├── withdrawal-handler.js # Withdrawal approval handler
│       ├── receipt-generator.js # Receipt generator
│       └── email-sender.js   # Email notifications
└── images/
    ├── mining-machines/      # Mining hardware images
    ├── logos/                # Logo files
    └── icons/                # Icon files
```

---

## 🚀 **Setup Instructions**

### **Prerequisites:**
- Node.js (v14 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Git
- Code editor (VS Code recommended)

### **Step 1: Clone Repository**
```bash
git clone https://github.com/ahmad-coder45/nexusinvest-website.git
cd nexusinvest-website
```

### **Step 2: Firebase Project Setup**

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com/
   - Click "Add Project"
   - Enter project name: "NexusInvest"
   - Enable Google Analytics (optional)
   - Create project

2. **Enable Authentication:**
   - Go to Authentication → Get Started
   - Enable "Email/Password" provider
   - Enable email verification

3. **Create Firestore Database:**
   - Go to Firestore Database → Create Database
   - Start in production mode
   - Choose location closest to your users
   - Create database

4. **Set up Firebase Storage:**
   - Go to Storage → Get Started
   - Start in production mode

5. **Get Firebase Config:**
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy configuration object

### **Step 3: Configure Firebase**

1. Create `js/firebase-config.js`:
```javascript
// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
```

2. Update admin payment details in Firestore:
```javascript
// Create settings document
db.collection('settings').doc('platform_settings').set({
  binanceWallet: "YOUR_BINANCE_WALLET_ADDRESS",
  jazzcashNumber: "03XXXXXXXXX",
  easypaisaNumber: "03XXXXXXXXX",
  minDeposit: 5,
  minWithdrawal: 5,
  withdrawalTax: 5,
  registrationBonus: 1,
  commissionLevel1: 12,
  commissionLevel2: 2,
  commissionLevel3: 1,
  salaryPlan1Requirement: 1000,
  salaryPlan1Amount: 5,
  salaryPlan2Requirement: 2500,
  salaryPlan2Amount: 15,
  salaryPlan3Requirement: 6000,
  salaryPlan3Amount: 50,
  maintenanceMode: false
});
```

### **Step 4: Deploy Security Rules**

1. Deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

2. Deploy Storage rules:
```bash
firebase deploy --only storage:rules
```

### **Step 5: Deploy Cloud Functions**

```bash
cd firebase/functions
npm install
firebase deploy --only functions
```

### **Step 6: Create Admin Account**

1. Register a user account normally
2. In Firebase Console → Firestore → users collection
3. Find your user document
4. Add field: `role: "admin"`

### **Step 7: Deploy Website**

**Option 1: Firebase Hosting**
```bash
firebase init hosting
firebase deploy --only hosting
```

**Option 2: Local Development**
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using VS Code Live Server
# Install Live Server extension and click "Go Live"
```

### **Step 8: Access Website**

- **User Site:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin/admin-login.html

---

## 🔐 **Security**

### **Implemented Security Measures:**
- ✅ Firebase Authentication
- ✅ Firestore Security Rules
- ✅ Storage Security Rules
- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Session management
- ✅ File upload validation
- ✅ Transaction verification
- ✅ Admin action logging
- ✅ Encrypted communication (HTTPS)

---

## 📊 **Database Structure**

### **Collections:**

**users**
```javascript
{
  uid: string,
  email: string,
  fullName: string,
  phone: string,
  balance: number,
  bonusBalance: number,
  totalInvested: number,
  totalEarnings: number,
  totalCommissions: number,
  totalSalary: number,
  referralCode: string,
  referredBy: string,
  salaryPlan: number,
  directSales: number,
  lastSalaryPayment: timestamp,
  withdrawalCount: number,
  firstInvestmentDate: timestamp,
  createdAt: timestamp,
  status: string,
  role: string
}
```

**deposits**
```javascript
{
  depositId: string,
  userId: string,
  amount: number,
  method: string,
  proofUrl: string,
  status: string,
  rejectionReason: string,
  createdAt: timestamp,
  approvedAt: timestamp,
  approvedBy: string,
  receiptUrl: string
}
```

**withdrawals**
```javascript
{
  withdrawalId: string,
  userId: string,
  amount: number,
  taxAmount: number,
  netAmount: number,
  method: string,
  accountDetails: string,
  status: string,
  rejectionReason: string,
  withdrawalNumber: number,
  createdAt: timestamp,
  approvedAt: timestamp,
  approvedBy: string,
  paidAt: timestamp,
  receiptUrl: string
}
```

**investments**
```javascript
{
  investmentId: string,
  userId: string,
  planId: string,
  planName: string,
  amount: number,
  dailyProfit: number,
  totalReturn: number,
  roi: number,
  duration: number,
  daysCompleted: number,
  profitEarned: number,
  startDate: timestamp,
  endDate: timestamp,
  lastProfitDate: timestamp,
  status: string
}
```

**commissions**
```javascript
{
  commissionId: string,
  userId: string,
  fromUserId: string,
  investmentId: string,
  level: number,
  investmentAmount: number,
  commissionRate: number,
  commissionAmount: number,
  createdAt: timestamp
}
```

**salaries**
```javascript
{
  salaryId: string,
  userId: string,
  salaryPlan: number,
  amount: number,
  directSales: number,
  paymentDate: timestamp
}
```

---

## 🤖 **Automated Features**

### **Cloud Functions:**

1. **Daily Profit Distribution** - Runs at 00:00 UTC daily
2. **Weekly Salary Payment** - Runs every 7 days
3. **Referral Commission Calculator** - Triggers on investment
4. **Deposit Approval Handler** - Triggers on approval
5. **Withdrawal Approval Handler** - Triggers on approval
6. **User Registration Handler** - Triggers on signup
7. **Monthly Withdrawal Reset** - Runs on 1st of month
8. **Receipt Generator** - Generates PDF receipts
9. **Email Sender** - Sends notifications

---

## 📧 **Email Notifications**

Automated emails sent for:
- Registration welcome (with $1 bonus info)
- Email verification
- Deposit request confirmation
- Deposit approval/rejection
- Withdrawal request confirmation
- Withdrawal approval/rejection
- Investment purchase
- Daily profit summary
- Commission earned
- Weekly salary payment
- Withdrawal eligibility updates
- Investment completion

---

## 🧪 **Testing**

### **Test User Flow:**
1. Register → Verify $1 bonus
2. Deposit $5 → Admin approves
3. Invest in Plan 01 → Check active investment
4. Wait for daily profit → Verify balance update
5. Refer friend → Friend invests → Check commission
6. Wait 10 days → Withdraw → Admin approves
7. Refer another → Second withdrawal available

### **Test Admin Flow:**
1. Login as admin
2. Approve pending deposit
3. Approve pending withdrawal
4. View user details
5. Adjust user balance
6. View referral tree
7. Export reports

---

## 📱 **Responsive Design**

Fully responsive across all devices:
- ✅ Mobile (320px - 767px)
- ✅ Tablet (768px - 1023px)
- ✅ Desktop (1024px - 1439px)
- ✅ Large Desktop (1440px+)

---

## 🎯 **Performance**

- Page load time: < 3 seconds
- Optimized images (WebP format)
- Minified CSS/JS
- Lazy loading
- Efficient Firebase queries
- Browser caching
- PWA support

---

## 📄 **License**

MIT License - See LICENSE file for details

---

## 👨‍💻 **Developer**

**Ahmad Ameen**
- GitHub: [@ahmad-coder45](https://github.com/ahmad-coder45)
- Email: ah3869444@gmail.com

---

## 🆘 **Support**

For support, email support@nexusinvest.com or open an issue on GitHub.

---

## 🎉 **Acknowledgments**

- Firebase for backend infrastructure
- Font Awesome for icons
- AOS/GSAP for animations
- Mining hardware manufacturers for specifications

---

## 📝 **Changelog**

### Version 1.0.0 (2025-01-09)
- Initial release
- Complete MLM platform
- 7 investment plans
- 3-level referral system
- Weekly salary plans
- Automated daily profits
- Admin panel
- Transaction receipts
- Email notifications

---

**Copyright © 2025 Nexus Invest All rights reserved.**
