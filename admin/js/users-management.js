// ============================================
// USERS MANAGEMENT JAVASCRIPT
// ============================================

let currentAdmin = null;
let allUsers = [];
let filteredUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
    currentAdmin = await checkAdminAuth();
    if (!currentAdmin) return;
    
    await loadUsers();
    await loadStats();
    setupPendingCountsListener();
});

async function loadUsers() {
    try {
        const usersSnapshot = await db.collection('users')
            .orderBy('createdAt', 'desc')
            .get();
        
        allUsers = [];
        usersSnapshot.forEach(doc => {
            allUsers.push({ id: doc.id, ...doc.data() });
        });
        
        filteredUsers = allUsers;
        displayUsers();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Failed to load users', 'error');
    }
}

async function loadStats() {
    try {
        let totalBalance = 0;
        let totalInvested = 0;
        let activeUsers = 0;
        
        allUsers.forEach(user => {
            totalBalance += user.balance || 0;
            totalInvested += user.totalInvested || 0;
            if (user.balance > 0 || user.totalInvested > 0) {
                activeUsers++;
            }
        });
        
        document.getElementById('totalUsers').textContent = allUsers.length;
        document.getElementById('activeUsers').textContent = activeUsers;
        document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
        document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function displayUsers() {
    const tbody = document.getElementById('usersBody');
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-gray);">
                    No users found
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    filteredUsers.forEach(user => {
        const joinDate = user.createdAt?.toDate();
        const roleColor = user.role === 'admin' ? '#ff4444' : 'var(--electric-blue)';
        
        html += `
            <tr>
                <td>
                    <div>
                        <div style="font-weight: 600;">${user.fullName || 'N/A'}</div>
                        <div style="font-size: 0.85rem; color: var(--text-gray);">${user.email}</div>
                    </div>
                </td>
                <td>
                    <span style="font-weight: 700; color: var(--neon-green);">
                        ${formatCurrency(user.balance || 0)}
                    </span>
                </td>
                <td>
                    <span style="font-weight: 700; color: var(--electric-blue);">
                        ${formatCurrency(user.totalInvested || 0)}
                    </span>
                </td>
                <td>
                    <span class="admin-badge success">
                        ${user.totalReferrals || 0}
                    </span>
                </td>
                <td>
                    <span class="admin-badge" style="background: rgba(${user.role === 'admin' ? '255, 68, 68' : '0, 102, 255'}, 0.2); color: ${roleColor};">
                        ${user.role || 'user'}
                    </span>
                </td>
                <td>${joinDate ? formatDate(joinDate) : 'N/A'}</td>
                <td>
                    <button onclick="viewUser('${user.id}')" class="action-btn view">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

async function viewUser(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const user = userDoc.data();
        
        // Get user's investments
        const investmentsSnapshot = await db.collection('investments')
            .where('userId', '==', userId)
            .get();
        
        // Get user's referrals
        const referralsSnapshot = await db.collection('users')
            .where('referredBy', '==', userId)
            .get();
        
        const joinDate = user.createdAt?.toDate();
        const lastLogin = user.lastLogin?.toDate();
        
        document.getElementById('userDetails').innerHTML = `
            <div style="display: grid; gap: var(--spacing-lg);">
                <!-- Personal Info -->
                <div style="padding: var(--spacing-md); background: rgba(0, 102, 255, 0.05); border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: var(--spacing-md);">Personal Information</h4>
                    <div style="display: grid; gap: var(--spacing-sm);">
                        <div><strong>Full Name:</strong> ${user.fullName || 'N/A'}</div>
                        <div><strong>Email:</strong> ${user.email}</div>
                        <div><strong>Phone:</strong> ${user.phone || 'N/A'}</div>
                        <div><strong>Referral Code:</strong> ${user.referralCode}</div>
                        <div><strong>Role:</strong> <span class="admin-badge">${user.role || 'user'}</span></div>
                    </div>
                </div>
                
                <!-- Financial Info -->
                <div style="padding: var(--spacing-md); background: rgba(0, 255, 136, 0.05); border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: var(--spacing-md);">Financial Information</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md);">
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">Balance</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--neon-green);">
                                ${formatCurrency(user.balance || 0)}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">Total Invested</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--electric-blue);">
                                ${formatCurrency(user.totalInvested || 0)}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">Total Profit</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--neon-green);">
                                ${formatCurrency(user.totalProfit || 0)}
                            </div>
                        </div>
                        <div>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">Commissions</div>
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--neon-green);">
                                ${formatCurrency(user.totalCommissions || 0)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Activity Info -->
                <div style="padding: var(--spacing-md); background: rgba(0, 102, 255, 0.05); border-radius: var(--radius-md);">
                    <h4 style="margin-bottom: var(--spacing-md);">Activity Information</h4>
                    <div style="display: grid; gap: var(--spacing-sm);">
                        <div><strong>Active Investments:</strong> ${investmentsSnapshot.size}</div>
                        <div><strong>Total Referrals:</strong> ${referralsSnapshot.size}</div>
                        <div><strong>Salary Plan:</strong> Plan ${user.salaryPlan || 0}</div>
                        <div><strong>Direct Sales:</strong> ${formatCurrency(user.directSales || 0)}</div>
                        <div><strong>Joined:</strong> ${joinDate ? formatDateTime(joinDate) : 'N/A'}</div>
                        <div><strong>Last Login:</strong> ${lastLogin ? formatDateTime(lastLogin) : 'Never'}</div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('userModal').classList.add('active');
        
    } catch (error) {
        console.error('Error viewing user:', error);
        showToast('Failed to load user details', 'error');
    }
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    
    filteredUsers = allUsers.filter(user => {
        const matchesSearch = 
            (user.fullName?.toLowerCase().includes(searchTerm)) ||
            (user.email?.toLowerCase().includes(searchTerm));
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    displayUsers();
}

function filterUsers() {
    searchUsers();
}

window.viewUser = viewUser;
window.closeUserModal = closeUserModal;
window.searchUsers = searchUsers;
window.filterUsers = filterUsers;
