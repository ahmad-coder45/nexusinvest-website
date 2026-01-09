// ============================================
// ADMIN AUTHENTICATION & UTILITIES
// ============================================

// Check admin authentication
async function checkAdminAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'admin-login.html';
                reject('Not authenticated');
                return;
            }
            
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                
                if (userData.role !== 'admin') {
                    showToast('Access denied. Admin privileges required.', 'error');
                    await auth.signOut();
                    window.location.href = 'admin-login.html';
                    reject('Not admin');
                    return;
                }
                
                resolve({ ...user, ...userData });
            } catch (error) {
                console.error('Error checking admin auth:', error);
                reject(error);
            }
        });
    });
}

// Load pending counts
async function loadPendingCounts() {
    try {
        const depositsSnapshot = await db.collection('deposits')
            .where('status', '==', 'pending')
            .get();
        
        const withdrawalsSnapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending')
            .get();
        
        const depositsCount = depositsSnapshot.size;
        const withdrawalsCount = withdrawalsSnapshot.size;
        
        document.getElementById('pendingDepositsCount').textContent = depositsCount;
        document.getElementById('pendingWithdrawalsCount').textContent = withdrawalsCount;
        
        return { depositsCount, withdrawalsCount };
    } catch (error) {
        console.error('Error loading pending counts:', error);
        return { depositsCount: 0, withdrawalsCount: 0 };
    }
}

// Setup real-time pending counts
function setupPendingCountsListener() {
    db.collection('deposits')
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            document.getElementById('pendingDepositsCount').textContent = snapshot.size;
        });
    
    db.collection('withdrawals')
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            document.getElementById('pendingWithdrawalsCount').textContent = snapshot.size;
        });
}

window.checkAdminAuth = checkAdminAuth;
window.loadPendingCounts = loadPendingCounts;
window.setupPendingCountsListener = setupPendingCountsListener;
