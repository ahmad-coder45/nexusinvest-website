// ============================================
// AUTHENTICATION JAVASCRIPT - DEBUG VERSION
// ============================================
// This version includes detailed console logging to debug registration issues
// Replace auth.js with this file temporarily to debug, then switch back

// ============================================
// VALIDATION FUNCTIONS
// ============================================

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function validatePassword(password) {
    // At least 8 characters, 1 number, 1 special character
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    return minLength && hasNumber && hasSpecial;
}

// Generate random string for referral codes
function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ============================================
// DEBUG: CHECK FIREBASE INITIALIZATION
// ============================================
console.log('🔍 DEBUG: Checking Firebase initialization...');
console.log('Firebase object:', typeof firebase);
console.log('Auth object:', typeof auth);
console.log('Firestore object:', typeof db);

if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded!');
}
if (typeof auth === 'undefined') {
    console.error('❌ Firebase Auth not initialized!');
}
if (typeof db === 'undefined') {
    console.error('❌ Firestore not initialized!');
}

// ============================================
// AUTH STATE OBSERVER
// ============================================

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    console.log('🔍 DEBUG: Auth state changed:', user ? user.email : 'No user');
    
    if (user) {
        // User is signed in
        const currentPage = window.location.pathname;
        console.log('🔍 DEBUG: Current page:', currentPage);
        
        // Redirect to dashboard if on login/register page
        if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
            console.log('🔍 DEBUG: Redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        const currentPage = window.location.pathname;
        const protectedPages = ['dashboard.html', 'deposit.html', 'withdrawal.html', 'transactions.html', 'profile.html', 'referrals.html', 'salary.html', 'my-investments.html'];
        
        // Redirect to login if trying to access protected page
        if (protectedPages.some(page => currentPage.includes(page))) {
            console.log('🔍 DEBUG: Redirecting to login...');
            window.location.href = 'login.html';
        }
    }
});

// ============================================
// REGISTRATION
// ============================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    console.log('🔍 DEBUG: Register form found');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🔍 DEBUG: Registration form submitted');
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const referralCode = document.getElementById('referralCode').value.trim();
        const terms = document.getElementById('terms').checked;
        
        console.log('🔍 DEBUG: Form data:', {
            fullName,
            email,
            hasPassword: !!password,
            hasReferralCode: !!referralCode,
            termsAccepted: terms
        });
        
        // Validation
        if (!fullName || !email || !password) {
            console.log('❌ DEBUG: Missing required fields');
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            console.log('❌ DEBUG: Invalid email');
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            console.log('❌ DEBUG: Weak password');
            showToast('Password must be at least 8 characters with 1 number and 1 special character', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            console.log('❌ DEBUG: Passwords do not match');
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!terms) {
            console.log('❌ DEBUG: Terms not accepted');
            showToast('Please accept the Terms & Conditions', 'error');
            return;
        }
        
        console.log('✅ DEBUG: All validations passed');
        
        // Show loading
        const registerBtn = document.getElementById('registerBtn');
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
        try {
            // STEP 1: Create user with Firebase Auth
            console.log('🔵 STEP 1: Creating user in Firebase Auth...');
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            console.log('✅ STEP 1 SUCCESS: User created with UID:', user.uid);
            console.log('   Email:', user.email);
            
            // STEP 2: Send email verification
            console.log('🔵 STEP 2: Sending verification email...');
            await user.sendEmailVerification();
            console.log('✅ STEP 2 SUCCESS: Verification email sent');
            
            // STEP 3: Generate unique referral code
            console.log('🔵 STEP 3: Generating referral code...');
            const userReferralCode = generateRandomString(6).toUpperCase();
            console.log('✅ STEP 3 SUCCESS: Referral code generated:', userReferralCode);
            
            // STEP 4: Find referrer if referral code provided
            let referredBy = '';
            if (referralCode) {
                console.log('🔵 STEP 4: Looking up referrer with code:', referralCode);
                const referrerQuery = await db.collection('users')
                    .where('referralCode', '==', referralCode)
                    .limit(1)
                    .get();
                
                if (!referrerQuery.empty) {
                    referredBy = referrerQuery.docs[0].id;
                    console.log('✅ STEP 4 SUCCESS: Referrer found:', referredBy);
                } else {
                    console.log('⚠️ STEP 4 WARNING: Referral code not found');
                }
            } else {
                console.log('⏭️ STEP 4 SKIPPED: No referral code provided');
            }
            
            // STEP 5: Create user document in Firestore
            console.log('🔵 STEP 5: Creating user document in Firestore...');
            const userData = {
                uid: user.uid,
                email: email,
                fullName: fullName,
                phone: '',
                balance: 0,
                bonusBalance: 0.5,
                totalInvested: 0,
                totalEarnings: 0,
                totalCommissions: 0,
                totalSalary: 0,
                referralCode: userReferralCode,
                referredBy: referredBy,
                salaryPlan: 0,
                directSales: 0,
                lastSalaryPayment: null,
                withdrawalCount: 0,
                firstInvestmentDate: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active',
                role: 'user'
            };
            console.log('   User data to save:', userData);
            
            await db.collection('users').doc(user.uid).set(userData);
            console.log('✅ STEP 5 SUCCESS: User document created in Firestore');
            
            // STEP 6: Verify document was created
            console.log('🔵 STEP 6: Verifying document creation...');
            const docSnapshot = await db.collection('users').doc(user.uid).get();
            if (docSnapshot.exists) {
                console.log('✅ STEP 6 SUCCESS: Document verified!');
                console.log('   Document data:', docSnapshot.data());
            } else {
                console.error('❌ STEP 6 FAILED: Document not found after creation!');
            }
            
            // STEP 7: Create referral record if referred
            if (referredBy) {
                console.log('🔵 STEP 7: Creating referral record...');
                await db.collection('referrals').add({
                    userId: user.uid,
                    referredBy: referredBy,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ STEP 7 SUCCESS: Referral record created');
            } else {
                console.log('⏭️ STEP 7 SKIPPED: No referrer');
            }
            
            // STEP 8: Create transaction log for bonus
            console.log('🔵 STEP 8: Creating bonus transaction...');
            const transactionData = {
                userId: user.uid,
                type: 'bonus',
                amount: 0.5,
                balanceBefore: 0,
                balanceAfter: 0,
                description: 'Registration bonus (Non-withdrawable)',
                relatedId: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            console.log('   Transaction data:', transactionData);
            
            const transactionRef = await db.collection('transactions').add(transactionData);
            console.log('✅ STEP 8 SUCCESS: Transaction created with ID:', transactionRef.id);
            
            // SUCCESS!
            console.log('🎉 REGISTRATION COMPLETE! All steps successful!');
            console.log('📊 Summary:');
            console.log('   - User UID:', user.uid);
            console.log('   - Email:', user.email);
            console.log('   - Referral Code:', userReferralCode);
            console.log('   - Referred By:', referredBy || 'None');
            console.log('   - Bonus Amount: $0.50');
            
            showToast('Account created successfully! Please verify your email.', 'success');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                console.log('🔍 DEBUG: Redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ REGISTRATION FAILED!');
            console.error('Error object:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, null, 2));
            
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please login.';
                console.log('💡 TIP: User already exists, try logging in');
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use a stronger password.';
                console.log('💡 TIP: Use at least 8 characters with numbers and special characters');
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
                console.log('💡 TIP: Check email format');
            } else if (error.code === 'permission-denied' || error.message.includes('permission')) {
                errorMessage = 'Permission denied. Please contact support.';
                console.log('💡 TIP: Firestore rules might be blocking writes');
                console.log('💡 FIX: Deploy Firestore rules or check Firebase Console');
            }
            
            showToast(errorMessage, 'error');
            
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    });
} else {
    console.log('⚠️ DEBUG: Register form not found on this page');
}

// ============================================
// LOGIN
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    console.log('🔍 DEBUG: Login form found');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🔍 DEBUG: Login form submitted');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            console.log('❌ DEBUG: Missing email or password');
            showToast('Please enter email and password', 'error');
            return;
        }
        
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        try {
            console.log('🔵 Attempting login for:', email);
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            console.log('✅ Login successful:', userCredential.user.uid);
            
            showToast('Login successful!', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            console.error('❌ Login failed:', error.code, error.message);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }
            
            showToast(errorMessage, 'error');
            
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    });
}

// ============================================
// LOGOUT
// ============================================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        console.log('🔍 DEBUG: Logout clicked');
        try {
            await auth.signOut();
            console.log('✅ Logout successful');
            showToast('Logged out successfully', 'success');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('❌ Logout failed:', error);
            showToast('Logout failed', 'error');
        }
    });
}

// ============================================
// CHECK AUTH (for protected pages)
// ============================================
async function checkAuth() {
    console.log('🔍 DEBUG: Checking authentication...');
    return new Promise((resolve) => {
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ User authenticated:', user.uid);
                resolve(user);
            } else {
                console.log('❌ No user authenticated');
                const currentPage = window.location.pathname;
                const protectedPages = ['dashboard.html', 'deposit.html', 'withdrawal.html', 'transactions.html', 'profile.html', 'referrals.html', 'salary.html', 'my-investments.html'];
                
                if (protectedPages.some(page => currentPage.includes(page))) {
                    console.log('🔍 DEBUG: Protected page, redirecting to login');
                    window.location.href = 'login.html';
                }
                resolve(null);
            }
        });
    });
}

console.log('🔍 DEBUG: auth-debug.js loaded successfully');
