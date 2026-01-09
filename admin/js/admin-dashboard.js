// ============================================
// ADMIN DASHBOARD JAVASCRIPT
// ============================================

let currentAdmin = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentAdmin = await checkAdminAuth();
    if (!currentAdmin) return;
    
    await loadDashboardStats();
    await loadRecentActivity();
    setupPendingCountsListener();
});

async function loadDashboardStats() {
    try {
        // Total Users
        const usersSnapshot = await db.collection('users').get();
        document.getElementById('totalUsers').textContent = usersSnapshot.size;
        
        // Total Invested & Active Investments
        const investmentsSnapshot = await db.collection('investments').get();
        let totalInvested = 0;
        let activeCount = 0;
        
        investmentsSnapshot.forEach(doc => {
            const investment = doc.data();
            totalInvested += investment.amount || 0;
            if (investment.status === 'active') {
                activeCount++;
            }
        });
        
        document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
        document.getElementById('activeInvestments').textContent = activeCount;
        
        // Pending Requests
        const { depositsCount, withdrawalsCount } = await loadPendingCounts();
        document.getElementById('pendingRequests').textContent = depositsCount + withdrawalsCount;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Failed to load dashboard statistics', 'error');
    }
}

async function loadRecentActivity() {
    try {
        const activityDiv = document.getElementById('recentActivity');
        
        // Get recent deposits
        const depositsSnapshot = await db.collection('deposits')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        // Get recent withdrawals
        const withdrawalsSnapshot = await db.collection('withdrawals')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        // Get recent investments
        const investmentsSnapshot = await db.collection('investments')
            .orderBy('startDate', 'desc')
            .limit(5)
            .get();
        
        let activities = [];
        
        depositsSnapshot.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: 'deposit',
                data: data,
                timestamp: data.createdAt?.toDate() || new Date()
            });
        });
        
        withdrawalsSnapshot.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: 'withdrawal',
                data: data,
                timestamp: data.createdAt?.toDate() || new Date()
            });
        });
        
        investmentsSnapshot.forEach(doc => {
            const data = doc.data();
            activities.push({
                type: 'investment',
                data: data,
                timestamp: data.startDate?.toDate() || new Date()
            });
        });
        
        // Sort by timestamp
        activities.sort((a, b) => b.timestamp - a.timestamp);
        activities = activities.slice(0, 10);
        
        if (activities.length === 0) {
            activityDiv.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                    No recent activity
                </div>
            `;
            return;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">';
        
        for (const activity of activities) {
            const userDoc = await db.collection('users').doc(activity.data.userId).get();
            const userName = userDoc.data()?.fullName || 'Unknown User';
            
            let icon, color, text;
            
            switch(activity.type) {
                case 'deposit':
                    icon = 'fa-plus-circle';
                    color = 'var(--neon-green)';
                    text = `${userName} deposited ${formatCurrency(activity.data.amount)}`;
                    break;
                case 'withdrawal':
                    icon = 'fa-minus-circle';
                    color = '#ff4444';
                    text = `${userName} requested withdrawal of ${formatCurrency(activity.data.amount)}`;
                    break;
                case 'investment':
                    icon = 'fa-chart-line';
                    color = 'var(--electric-blue)';
                    text = `${userName} invested ${formatCurrency(activity.data.amount)} in ${activity.data.planName}`;
                    break;
            }
            
            html += `
                <div style="padding: var(--spacing-sm); background: rgba(0, 102, 255, 0.05); border-radius: var(--radius-md); display: flex; align-items: center; gap: var(--spacing-sm);">
                    <i class="fas ${icon}" style="color: ${color}; font-size: 1.25rem;"></i>
                    <div style="flex: 1;">
                        <div>${text}</div>
                        <div style="font-size: 0.85rem; color: var(--text-gray);">${formatDateTime(activity.timestamp)}</div>
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        activityDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}
