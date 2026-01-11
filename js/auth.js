// ============================================
// AUTHENTICATION JAVASCRIPT
// ============================================

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
// AUTH STATE OBSERVER
// ============================================

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        const currentPage = window.location.pathname;
        
        // Redirect to dashboard if on login/register page
        if (currentPage.includes('login.html') || currentPage.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is signed out
        const currentPage = window.location.pathname;
        const protectedPages = ['dashboard.html', 'deposit.html', 'withdrawal.html', 'transactions.html', 'profile.html', 'referrals.html', 'salary.html', 'my-investments.html'];
        
        // Redirect to login if trying to access protected page
        if (protectedPages.some(page => currentPage.includes(page))) {
            window.location.href = 'login.html';
        }
    }
});

// ============================================
// REGISTRATION
// ============================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const referralCode = document.getElementById('referralCode').value.trim();
        const terms = document.getElementById('terms').checked;
        
        // Validation
        if (!fullName || !email || !password) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (!validatePassword(password)) {
            showToast('Password must be at least 8 characters with 1 number and 1 special character', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!terms) {
            showToast('Please accept the Terms & Conditions', 'error');
            return;
        }
        
        // Show loading
        const registerBtn = document.getElementById('registerBtn');
        registerBtn.disabled = true;
        registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        
        try {
            // Create user with Firebase Auth
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Send email verification
            await user.sendEmailVerification();
            
            // Generate unique referral code
            const userReferralCode = generateRandomString(6).toUpperCase();
            
            // Find referrer if referral code provided
            let referredBy = '';
            if (referralCode) {
                const referrerQuery = await db.collection('users')
                    .where('referralCode', '==', referralCode)
                    .limit(1)
                    .get();
                
                if (!referrerQuery.empty) {
                    referredBy = referrerQuery.docs[0].id;
                }
            }
            
            // Create user document in Firestore
            await db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: email,
                fullName: fullName,
                phone: '',
                balance: 0,
                bonusBalance: 1, // $1 non-withdrawable bonus
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
            });
            
            // Create referral record if referred
            if (referredBy) {
                await db.collection('referrals').add({
                    userId: user.uid,
                    referredBy: referredBy,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            // Create transaction log for bonus
            await db.collection('transactions').add({
                userId: user.uid,
                type: 'bonus',
                amount: 1,
                balanceBefore: 0,
                balanceAfter: 0,
                description: 'Registration bonus (Non-withdrawable)',
                relatedId: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast('Account created successfully! Please verify your email.', 'success');
            
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'This email is already registered. Please login.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use a stronger password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }
            
            showToast(errorMessage, 'error');
            
            registerBtn.disabled = false;
            registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    });
}

// ============================================
// LOGIN
// ============================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        
        // Validation
        if (!email || !password) {
            showToast('Please enter email and password', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        try {
            // Set persistence based on remember me
            const persistence = remember ? 
                firebase.auth.Auth.Persistence.LOCAL : 
                firebase.auth.Auth.Persistence.SESSION;
            
            await auth.setPersistence(persistence);
            
            // Sign in
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Check if email is verified
            if (!user.emailVerified) {
                showToast('Please verify your email before logging in. Check your inbox.', 'error');
                await auth.signOut();
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                return;
            }
            
            // Get user data
            const userDoc = await db.collection('users').doc(user.uid).get();
            const userData = userDoc.data();
            
            // Check if user is blocked
            if (userData.status === 'blocked') {
                showToast('Your account has been blocked. Please contact support.', 'error');
                await auth.signOut();
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
                return;
            }
            
            showToast('Login successful! Redirecting...', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (userData.role === 'admin') {
                    window.location.href = 'admin/admin-dashboard.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many failed attempts. Please try again later.';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'This account has been disabled.';
            }
            
            showToast(errorMessage, 'error');
            
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        }
    });
}

// ============================================
// FORGOT PASSWORD
// ============================================
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value.trim();
        
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            await auth.sendPasswordResetEmail(email);
            showToast('Password reset link sent! Check your email.', 'success');
            closeModal('forgotPasswordModal');
            document.getElementById('resetEmail').value = '';
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to send reset link. Please try again.';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email.';
            }
            
            showToast(errorMessage, 'error');
        }
    });
}

// ============================================
// LOGOUT
// ============================================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }).catch((error) => {
            console.error('Logout error:', error);
            showToast('Logout failed. Please try again.', 'error');
        });
    }
}

// ============================================
// GET CURRENT USER
// ============================================
async function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            unsubscribe();
            if (user) {
                try {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    resolve({ ...user, ...userDoc.data() });
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(null);
            }
        });
    });
}

// ============================================
// CHECK AUTH
// ============================================
async function checkAuth() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        return user;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
        return null;
    }
}

// ============================================
// EXPORT FUNCTIONS
// ============================================
window.logout = logout;
window.getCurrentUser = getCurrentUser;
window.checkAuth = checkAuth;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.generateRandomString = generateRandomString;
