# 🔄 **LOCAL UPDATE GUIDE - COPY THESE FILES**

## **FILES THAT CHANGED:**

### **User Side:**
1. ✅ `js/deposit.js` - **COMPLETELY REPLACED**

### **Admin Side:**
2. ✅ `admin/js/settings.js` - **NEW CODE ADDED** (lines 1-295)
3. ✅ `admin/js/admin-deposits.js` - **UPDATED** (lines 1-250)
4. ✅ `admin/settings.html` - **NEW SECTION ADDED** (Deposit Accounts section)

---

## **STEP-BY-STEP INSTRUCTIONS:**

### **STEP 1: Download Updated Files from GitHub**

Go to your GitHub repository and download these 4 files:

```
https://github.com/ahmad-coder45/nexusinvest-website/blob/main/js/deposit.js
https://github.com/ahmad-coder45/nexusinvest-website/blob/main/admin/js/settings.js
https://github.com/ahmad-coder45/nexusinvest-website/blob/main/admin/js/admin-deposits.js
https://github.com/ahmad-coder45/nexusinvest-website/blob/main/admin/settings.html
```

### **STEP 2: Replace Your Local Files**

1. **Replace** `js/deposit.js` with downloaded version
2. **Replace** `admin/js/settings.js` with downloaded version
3. **Replace** `admin/js/admin-deposits.js` with downloaded version
4. **Replace** `admin/settings.html` with downloaded version

### **STEP 3: Add Payment Methods to Firestore**

Go to Firebase Console → Firestore Database:

**Add Collection:** `paymentMethods`

**Add Document 1 (Binance BEP20):**
```
Document ID: (auto)
Fields:
  method: "binance-bep20"
  accountDetails: "YOUR_BINANCE_BEP20_WALLET_ADDRESS"
  active: true
  createdAt: (timestamp - click "Add field" → "timestamp")
  updatedAt: (timestamp)
```

**Add Document 2 (Binance TRX):**
```
Document ID: (auto)
Fields:
  method: "binance"
  accountDetails: "YOUR_BINANCE_TRX_WALLET_ADDRESS"
  active: true
  createdAt: (timestamp)
  updatedAt: (timestamp)
```

### **STEP 4: Update Method Info (Optional)**

If you want to add BEP20 as a separate method, update the `getMethodInfo` function in `js/deposit.js`:

Find this section (around line 95):
```javascript
function getMethodInfo(method) {
    const methodMap = {
        'binance': { 
            name: 'Binance', 
            subtitle: 'USDT (TRX Network)', 
            icon: 'fab fa-bitcoin', 
            color: '#F3BA2F',
            type: 'wallet'
        },
```

Add this after the binance entry:
```javascript
        'binance-bep20': { 
            name: 'Binance', 
            subtitle: 'USDT (BEP20 Network)', 
            icon: 'fab fa-bitcoin', 
            color: '#F3BA2F',
            type: 'wallet'
        },
```

Also update `admin/js/settings.js` around line 120:
```javascript
function getMethodInfo(method) {
    const methodMap = {
        'binance': { name: 'Binance (USDT TRX)', icon: 'fab fa-bitcoin', color: '#F3BA2F' },
        'binance-bep20': { name: 'Binance (USDT BEP20)', icon: 'fab fa-bitcoin', color: '#F3BA2F' },
```

And update the dropdown in `admin/settings.html`:
```html
<select id="newPaymentMethod" class="form-input" required>
    <option value="">Select payment method</option>
    <option value="binance">Binance (USDT TRX)</option>
    <option value="binance-bep20">Binance (USDT BEP20)</option>
    <option value="jazzcash">JazzCash</option>
    <option value="easypaisa">EasyPaisa</option>
    <option value="nayapay">NayaPay</option>
    <option value="sadapay">SadaPay</option>
    <option value="bank">Bank Account</option>
</select>
```

### **STEP 5: Test**

1. **Admin:** Login → Settings → See "Deposit Accounts" section
2. **Admin:** Should see your 2 Binance methods listed
3. **User:** Go to Deposit page → Should see 2 Binance options
4. **User:** Select one → Should see wallet address
5. **User:** Submit deposit
6. **Admin:** Approve → Balance should update automatically

---

## **QUICK FIX IF STILL NOT WORKING:**

### **Issue: Payment methods not showing on deposit page**

**Check:**
1. Open browser console (F12)
2. Look for errors
3. Check if Firestore collection `paymentMethods` exists
4. Check if documents have `active: true`

**Fix:**
```javascript
// Add this to js/deposit.js at line 30 (after loadPaymentMethods function starts)
console.log('Loading payment methods...');

// Add this after line 35 (after getting snapshot)
console.log('Found methods:', methodsSnapshot.size);
```

### **Issue: Admin settings not showing deposit accounts**

**Check:**
1. Make sure you replaced `admin/settings.html` completely
2. Make sure you replaced `admin/js/settings.js` completely
3. Clear browser cache (Ctrl+Shift+Delete)
4. Hard refresh (Ctrl+F5)

---

## **ALTERNATIVE: MANUAL CODE UPDATE**

If downloading doesn't work, here's what changed:

### **In `js/deposit.js`:**

**OLD CODE (Lines 28-90):**
```javascript
// Hardcoded payment methods
const paymentMethods = {
    binance: { ... },
    jazzcash: { ... }
};
```

**NEW CODE:**
```javascript
// Load from Firestore
async function loadPaymentMethods() {
    const methodsSnapshot = await db.collection('paymentMethods')
        .where('active', '==', true)
        .orderBy('createdAt', 'asc')
        .get();
    
    // Render dynamically
    methodsSnapshot.forEach(doc => {
        const method = doc.data();
        // Create card...
    });
}
```

### **In `admin/js/settings.js`:**

**NEW CODE ADDED (Lines 1-295):**
```javascript
// Payment methods CRUD operations
async function loadPaymentMethods() { ... }
async function addPaymentMethod() { ... }
async function togglePaymentMethod() { ... }
async function removePaymentMethod() { ... }
```

### **In `admin/js/admin-deposits.js`:**

**UPDATED (Lines 140-180):**
```javascript
// Auto-update balance on approval
async function approveDeposit(depositId) {
    // Get user balance
    const currentBalance = userData.balance || 0;
    const newBalance = currentBalance + deposit.amount;
    
    // Update user balance
    await db.collection('users').doc(deposit.userId).update({
        balance: newBalance,
        totalDeposited: (userData.totalDeposited || 0) + deposit.amount
    });
    
    // Update deposit status
    await db.collection('deposits').doc(depositId).update({
        status: 'approved'
    });
}
```

---

## **FIRESTORE STRUCTURE:**

### **Collection: `paymentMethods`**

```
paymentMethods/
├─ document1/
│  ├─ method: "binance"
│  ├─ accountDetails: "TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK"
│  ├─ active: true
│  ├─ createdAt: Timestamp
│  └─ updatedAt: Timestamp
│
└─ document2/
   ├─ method: "binance-bep20"
   ├─ accountDetails: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
   ├─ active: true
   ├─ createdAt: Timestamp
   └─ updatedAt: Timestamp
```

---

## **VERIFICATION CHECKLIST:**

### **After Updating Files:**

- [ ] Replaced `js/deposit.js`
- [ ] Replaced `admin/js/settings.js`
- [ ] Replaced `admin/js/admin-deposits.js`
- [ ] Replaced `admin/settings.html`
- [ ] Added `paymentMethods` collection in Firestore
- [ ] Added Binance TRX document
- [ ] Added Binance BEP20 document
- [ ] Cleared browser cache
- [ ] Hard refreshed (Ctrl+F5)

### **Testing:**

- [ ] Admin: Can see Settings page
- [ ] Admin: Can see "Deposit Accounts" section
- [ ] Admin: Can see existing payment methods
- [ ] Admin: Can add new payment method
- [ ] Admin: Can toggle active/inactive
- [ ] Admin: Can remove payment method
- [ ] User: Can see deposit page
- [ ] User: Can see payment methods (2 Binance options)
- [ ] User: Can select method
- [ ] User: Can see wallet address
- [ ] User: Can copy address
- [ ] User: Can submit deposit
- [ ] Admin: Can approve deposit
- [ ] User: Balance updates automatically

---

## **TROUBLESHOOTING:**

### **Problem: "Loading..." forever on deposit page**

**Solution:**
1. Open browser console (F12)
2. Check for errors
3. Verify Firestore collection exists
4. Verify documents have correct structure
5. Check Firebase rules allow read access

### **Problem: Admin settings page blank**

**Solution:**
1. Clear browser cache
2. Hard refresh (Ctrl+F5)
3. Check browser console for errors
4. Verify `admin/settings.html` was replaced
5. Verify `admin/js/settings.js` was replaced

### **Problem: Balance not updating on approval**

**Solution:**
1. Check user document has `balance` field
2. Check deposit has correct `userId`
3. Check Firebase rules allow write to users
4. Check browser console for errors

---

## **CONTACT SUPPORT:**

If still not working:
1. Check browser console (F12) for errors
2. Check Firestore rules
3. Verify all 4 files were replaced
4. Verify Firestore collection structure
5. Clear cache and hard refresh

---

**After following these steps, your system should work perfectly!** ✨
