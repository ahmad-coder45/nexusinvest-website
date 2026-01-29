// ============================================
// SETUP SCRIPT - INITIAL PAYMENT METHODS
// ============================================
// Run this in Firebase Console to add initial payment methods
// Go to: Firebase Console → Firestore → Run in Console

// INSTRUCTIONS:
// 1. Replace the account details below with your actual accounts
// 2. Copy this entire script
// 3. Open Firebase Console → Firestore
// 4. Click "Start collection" or use existing paymentMethods collection
// 5. Paste and run this script in browser console

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const BINANCE_WALLET = "TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK";  // Replace with your Binance USDT wallet (TRX network)
const NAYAPAY_IBAN = "PK36NAYA0000001234567890";              // Replace with your NayaPay IBAN

// ============================================
// SETUP FUNCTION
// ============================================

async function setupPaymentMethods() {
    console.log('🚀 Setting up payment methods...');
    
    try {
        // Add Binance
        await db.collection('paymentMethods').add({
            method: 'binance',
            accountDetails: BINANCE_WALLET,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Binance added successfully');
        
        // Add NayaPay
        await db.collection('paymentMethods').add({
            method: 'nayapay',
            accountDetails: NAYAPAY_IBAN,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ NayaPay added successfully');
        
        console.log('🎉 Payment methods setup complete!');
        console.log('📋 You can now:');
        console.log('   1. Go to Admin Dashboard → Settings');
        console.log('   2. See your payment methods');
        console.log('   3. Add more methods via UI');
        console.log('   4. Users will see these on Deposit page');
        
    } catch (error) {
        console.error('❌ Error setting up payment methods:', error);
    }
}

// Run the setup
setupPaymentMethods();

// ============================================
// ALTERNATIVE: MANUAL SETUP IN FIRESTORE
// ============================================

/*
If the script doesn't work, add manually in Firestore Console:

1. Go to Firestore Database
2. Click "Start collection" or select "paymentMethods"
3. Add Document 1:
   - Document ID: (auto)
   - Fields:
     * method: "binance" (string)
     * accountDetails: "YOUR_BINANCE_WALLET" (string)
     * active: true (boolean)
     * createdAt: (timestamp - click "Add field" → "timestamp")
     * updatedAt: (timestamp)

4. Add Document 2:
   - Document ID: (auto)
   - Fields:
     * method: "nayapay" (string)
     * accountDetails: "YOUR_NAYAPAY_IBAN" (string)
     * active: true (boolean)
     * createdAt: (timestamp)
     * updatedAt: (timestamp)

Done! Now deploy and test.
*/

// ============================================
// VERIFICATION SCRIPT
// ============================================

async function verifyPaymentMethods() {
    console.log('🔍 Verifying payment methods...');
    
    try {
        const snapshot = await db.collection('paymentMethods').get();
        
        if (snapshot.empty) {
            console.log('⚠️ No payment methods found!');
            console.log('Run setupPaymentMethods() first');
            return;
        }
        
        console.log(`✅ Found ${snapshot.size} payment method(s):`);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`\n📌 ${data.method.toUpperCase()}`);
            console.log(`   Account: ${data.accountDetails}`);
            console.log(`   Status: ${data.active ? '✅ Active' : '❌ Inactive'}`);
            console.log(`   ID: ${doc.id}`);
        });
        
    } catch (error) {
        console.error('❌ Error verifying payment methods:', error);
    }
}

// Uncomment to verify:
// verifyPaymentMethods();
