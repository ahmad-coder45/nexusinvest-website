// ============================================
// PAYMENT METHODS CONFIGURATION
// ============================================
// Simple approach: Edit this file to add/remove payment methods
// No database needed, just edit and deploy

const PAYMENT_METHODS_CONFIG = {
    binance: {
        name: "Binance",
        subtitle: "USDT (TRX Network)",
        icon: "fab fa-bitcoin",
        color: "#F3BA2F",
        type: "wallet",
        accountDetails: "TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK", // ← Edit this
        active: true, // ← Set to false to hide
        order: 1
    },
    
    jazzcash: {
        name: "JazzCash",
        subtitle: "Mobile Wallet",
        icon: "fas fa-mobile-alt",
        color: "#FF6B00",
        type: "iban",
        accountDetails: "PK00JAZZ0000001234567890", // ← Edit this
        active: true, // ← Set to false to hide
        order: 2
    },
    
    easypaisa: {
        name: "EasyPaisa",
        subtitle: "Mobile Wallet",
        icon: "fas fa-wallet",
        color: "#00A859",
        type: "iban",
        accountDetails: "PK00EASY0000001234567890", // ← Edit this
        active: true, // ← Set to false to hide
        order: 3
    },
    
    nayapay: {
        name: "NayaPay",
        subtitle: "Digital Bank",
        icon: "fas fa-university",
        color: "#00D4FF",
        type: "iban",
        accountDetails: "PK36NAYA0000001234567890", // ← Edit this
        active: true, // ← Set to false to hide
        order: 4
    },
    
    sadapay: {
        name: "SadaPay",
        subtitle: "Digital Bank",
        icon: "fas fa-credit-card",
        color: "#7C3AED",
        type: "iban",
        accountDetails: "PK00SADA0000001234567890", // ← Edit this
        active: false, // ← Currently hidden
        order: 5
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get all active payment methods
function getActivePaymentMethods() {
    return Object.entries(PAYMENT_METHODS_CONFIG)
        .filter(([key, method]) => method.active)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([key, method]) => ({ id: key, ...method }));
}

// Get specific payment method
function getPaymentMethod(methodId) {
    return PAYMENT_METHODS_CONFIG[methodId];
}

// Check if method is active
function isMethodActive(methodId) {
    return PAYMENT_METHODS_CONFIG[methodId]?.active || false;
}

// ============================================
// USAGE EXAMPLE
// ============================================

/*
// In deposit.js:

// Load payment methods
const activeMethods = getActivePaymentMethods();

activeMethods.forEach(method => {
    console.log(method.name, method.accountDetails);
});

// Get specific method
const binance = getPaymentMethod('binance');
console.log(binance.accountDetails);
*/

// ============================================
// HOW TO USE:
// ============================================

/*
1. TO ADD NEW METHOD:
   - Copy any existing method block
   - Change the key (e.g., 'bank')
   - Update name, icon, color, accountDetails
   - Set active: true
   - Set order number

2. TO REMOVE METHOD:
   - Set active: false
   OR
   - Delete the entire block

3. TO CHANGE ACCOUNT DETAILS:
   - Edit the accountDetails value
   - Save and deploy

4. TO REORDER METHODS:
   - Change the order numbers
   - Lower numbers appear first

5. DEPLOY:
   firebase deploy --only hosting
*/

// ============================================
// PROS:
// ============================================
// ✅ Very simple to edit
// ✅ No database needed
// ✅ Version controlled (Git)
// ✅ Fast loading (no API calls)
// ✅ Easy to backup

// ============================================
// CONS:
// ============================================
// ❌ Need to redeploy to change
// ❌ Can't change from admin panel
// ❌ Need code access
