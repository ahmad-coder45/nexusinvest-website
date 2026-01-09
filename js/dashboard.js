// ============================================
// DASHBOARD JAVASCRIPT
// ============================================

let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    // Load dashboard data
    await loadDashboardData();
    
    // Set up real-time listeners
    setupRealtimeListeners();
});

// Load all dashboard data
async function loadDashboardData() {
    try {
        showLoading();
        
        // Load user data
        await loadUserData();
        
        // Load stats
        await loadStats();
        
        // Load active investments
        await loadActiveInvestments();
        
        // Load recent transactions
        await loadRecentTransactions();
        
        // Load referral stats
        await loadReferralStats();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
        hideLoading();
    }
}

// Load user data
async function loadUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        // Update user name
        const firstName = userData.fullName.split(' ')[0];
        document.getElementById('userName').textContent = firstName;
        document.getElementById('userNameMenu').textContent = userData.fullName;
        
        // Update avatar
        const initials = userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
        document.getElementById('userAvatar').textContent = initials;
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

// Load stats
async function loadStats() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        // Update balance stats
        const totalBalance = (userData.balance || 0) + (userData.bonusBalance || 0);
        document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
        document.getElementById('withdrawableBalance').textContent = formatCurrency(userData.balance || 0);
        document.getElementById('bonusBalance').textContent = formatCurrency(userData.bonusBalance || 0);
        document.getElementById('totalInvested').textContent = formatCurrency(userData.totalInvested || 0);
        document.getElementById('totalEarnings').textContent = formatCurrency(userData.totalEarnings || 0);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load active investments
async function loadActiveInvestments() {
    try {
        const investmentsSnapshot = await db.collection('investments')
            .where('userId', '==', currentUser.uid)
            .where('status', '==', 'active')
            .orderBy('startDate', 'desc')
            .limit(5)
            .get();
        
        const container = document.getElementById('activeInvestmentsContainer');
        
        if (investmentsSnapshot.empty) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <h3>No Active Investments</h3>
                    <p>Start investing to see your active plans here</p>
                    <a href="plans.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
                        Browse Plans
                    </a>
                </div>
            `;
            return;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: var(--spacing-md);">';
        
        investmentsSnapshot.forEach(doc => {
            const investment = doc.data();
            const progress = (investment.daysCompleted / investment.duration) * 100;
            const daysRemaining = investment.duration - investment.daysCompleted;
            
            html += `
                <div style="padding: var(--spacing-md); background: rgba(0, 102, 255, 0.05); border: 1px solid rgba(0, 102, 255, 0.2); border-radius: var(--radius-md);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-sm);">
                        <div>
                            <h4 style="margin-bottom: 0.25rem;">${investment.planName}</h4>
                            <p style="font-size: 0.85rem; color: var(--text-gray); margin: 0;">
                                ${formatCurrency(investment.amount)} invested
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.25rem; font-weight: 700; color: var(--neon-green);">
                                ${formatCurrency(investment.profitEarned || 0)}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">
                                Earned
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: var(--spacing-sm); font-size: 0.85rem; color: var(--text-gray);">
                        <span>Day ${investment.daysCompleted}/${investment.duration}</span>
                        <span>${daysRemaining} days remaining</span>
                    </div>
                    
                    <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                        <div style="flex: 1; padding: 0.5rem; background: rgba(0, 255, 136, 0.1); border-radius: var(--radius-sm); text-align: center;">
                            <div style="font-size: 0.75rem; color: var(--text-gray);">Daily Profit</div>
                            <div style="font-weight: 600; color: var(--neon-green);">${formatCurrency(investment.dailyProfit)}</div>
                        </div>
                        <div style="flex: 1; padding: 0.5rem; background: rgba(0, 102, 255, 0.1); border-radius: var(--radius-sm); text-align: center;">
                            <div style="font-size: 0.75rem; color: var(--text-gray);">Total Return</div>
                            <div style="font-weight: 600; color: var(--electric-blue);">${formatCurrency(investment.totalReturn)}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading active investments:', error);
    }
}

// Load recent transactions
async function loadRecentTransactions() {
    try {
        const transactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        const tbody = document.getElementById('transactionsBody');
        
        if (transactionsSnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-gray);">
                        No transactions yet
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        transactionsSnapshot.forEach(doc => {
            const transaction = doc.data();
            const date = transaction.createdAt?.toDate();
            
            // Transaction type icon and color
            let typeIcon = 'fa-exchange-alt';
            let typeColor = 'var(--electric-blue)';
            
            switch(transaction.type) {
                case 'deposit':
                    typeIcon = 'fa-plus-circle';
                    typeColor = 'var(--neon-green)';
                    break;
                case 'withdrawal':
                    typeIcon = 'fa-minus-circle';
                    typeColor = '#ff4444';
                    break;
                case 'investment':
                    typeIcon = 'fa-chart-line';
                    typeColor = 'var(--electric-blue)';
                    break;
                case 'commission':
                    typeIcon = 'fa-users';
                    typeColor = 'var(--neon-green)';
                    break;
                case 'salary':
                    typeIcon = 'fa-money-bill-wave';
                    typeColor = 'var(--neon-green)';
                    break;
                case 'daily_profit':
                    typeIcon = 'fa-coins';
                    typeColor = 'var(--neon-green)';
                    break;
                case 'bonus':
                    typeIcon = 'fa-gift';
                    typeColor = 'var(--neon-green)';
                    break;
            }
            
            html += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i class="fas ${typeIcon}" style="color: ${typeColor};"></i>
                            <span style="text-transform: capitalize;">${transaction.type.replace('_', ' ')}</span>
                        </div>
                    </td>
                    <td>
                        <span style="color: ${transaction.amount >= 0 ? 'var(--neon-green)' : '#ff4444'}; font-weight: 600;">
                            ${transaction.amount >= 0 ? '+' : ''}${formatCurrency(transaction.amount)}
                        </span>
                    </td>
                    <td>${transaction.description}</td>
                    <td>${date ? formatDateTime(date) : 'N/A'}</td>
                    <td>
                        <span class="status-badge completed">Completed</span>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Load referral stats
async function loadReferralStats() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        // Get Level 1 referrals
        const level1Snapshot = await db.collection('users')
            .where('referredBy', '==', currentUser.uid)
            .get();
        
        let level2Count = 0;
        let level3Count = 0;
        
        // Get Level 2 and 3 referrals
        for (const doc of level1Snapshot.docs) {
            const level2Snapshot = await db.collection('users')
                .where('referredBy', '==', doc.id)
                .get();
            level2Count += level2Snapshot.size;
            
            for (const level2Doc of level2Snapshot.docs) {
                const level3Snapshot = await db.collection('users')
                    .where('referredBy', '==', level2Doc.id)
                    .get();
                level3Count += level3Snapshot.size;
            }
        }
        
        // Update UI
        document.getElementById('level1Count').textContent = level1Snapshot.size;
        document.getElementById('level2Count').textContent = level2Count;
        document.getElementById('level3Count').textContent = level3Count;
        document.getElementById('totalCommission').textContent = formatCurrency(userData.totalCommissions || 0);
        
    } catch (error) {
        console.error('Error loading referral stats:', error);
    }
}

// Setup real-time listeners
function setupRealtimeListeners() {
    // Listen to user document changes
    db.collection('users').doc(currentUser.uid).onSnapshot((doc) => {
        if (doc.exists) {
            loadStats();
        }
    });
    
    // Listen to investments changes
    db.collection('investments')
        .where('userId', '==', currentUser.uid)
        .where('status', '==', 'active')
        .onSnapshot(() => {
            loadActiveInvestments();
        });
    
    // Listen to transactions changes
    db.collection('transactions')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .onSnapshot(() => {
            loadRecentTransactions();
        });
}

// Refresh dashboard
async function refreshDashboard() {
    await loadDashboardData();
    showToast('Dashboard refreshed', 'success');
}

// Export functions
window.refreshDashboard = refreshDashboard;
