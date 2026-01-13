// ============================================
// ADMIN AUTHENTICATION CHECK
// ============================================

let currentAdmin = null;

// Check if user is admin
async function checkAdminAuth() {
    return new Promise((resolve) => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                // Not logged in - redirect to admin login
                window.location.href = 'admin-login.html';
                resolve(null);
                return;
            }
            
            try {
                // Check if user has admin role
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                
                if (userData.role !== 'admin') {
                    // Not an admin - redirect to user dashboard
                    showToast('Access denied. Admin privileges required.', 'error');
                    await auth.signOut();
                    window.location.href = 'admin-login.html';
                    resolve(null);
                    return;
                }
                
                // User is admin
                currentAdmin = {
                    uid: user.uid,
                    email: user.email,
                    ...userData
                };
                
                resolve(currentAdmin);
                
            } catch (error) {
                console.error('Error checking admin auth:', error);
                window.location.href = 'admin-login.html';
                resolve(null);
            }
        });
    });
}

// Initialize admin auth check
document.addEventListener('DOMContentLoaded', async () => {
    // Only check on admin pages
    const currentPage = window.location.pathname;
    const adminPages = ['admin-dashboard.html', 'admin-settings.html', 'admin-deposits.html', 'admin-withdrawals.html', 'admin-users.html', 'admin-investments.html'];
    
    if (adminPages.some(page => currentPage.includes(page))) {
        currentAdmin = await checkAdminAuth();
    }
});

// Export
window.checkAdminAuth = checkAdminAuth;
