// ============================================
// SALARY MANAGEMENT JAVASCRIPT
// ============================================

let allUsers = [];
let filteredUsers = [];

// Salary plan amounts
const SALARY_PLANS = {
    0: 0,
    1: 100,
    2: 200,
    3: 300
};

// ============================================
// LOAD SALARY DATA
// ============================================
async function loadSalaryData() {
    try {
        console.log('Loading salary data...');
        
        // Get all users
        const usersSnapshot = await db.collection('users').get();
        allUsers = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('Loaded users:', allUsers.length);
        
        // Calculate statistics
        updateStatistics();
        
        // Display users
        filteredUsers = [...allUsers];
        displayUsers();
        
        // Hide loading, show table
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('tableContent').style.display = 'block';
        
    } catch (error) {
        console.error('Error loading salary data:', error);
        document.getElementById('loadingState').innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #FF3B30;"></i>
            <p>Error loading data: ${error.message}</p>
        `;
    }
}

// ============================================
// UPDATE STATISTICS
// ============================================
function updateStatistics() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let totalPending = 0;
    let monthPaid = 0;
    let eligibleCount = 0;
    let totalMonth = 0;
    
    allUsers.forEach(user => {
        const salaryPlan = user.salaryPlan || 0;
        const salaryAmount = SALARY_PLANS[salaryPlan] || 0;
        
        if (salaryPlan > 0) {
            eligibleCount++;
            totalMonth += salaryAmount;
            
            // Check if paid this month
            const lastPayment = user.lastSalaryPayment ? user.lastSalaryPayment.toDate() : null;
            
            if (lastPayment) {
                const paymentMonth = lastPayment.getMonth();
                const paymentYear = lastPayment.getFullYear();
                
                if (paymentMonth === currentMonth && paymentYear === currentYear) {
                    monthPaid += salaryAmount;
                } else {
                    totalPending += salaryAmount;
                }
            } else {
                totalPending += salaryAmount;
            }
        }
    });
    
    document.getElementById('totalPending').textContent = `$${totalPending.toFixed(2)}`;
    document.getElementById('monthPaid').textContent = `$${monthPaid.toFixed(2)}`;
    document.getElementById('eligibleUsers').textContent = eligibleCount;
    document.getElementById('totalMonth').textContent = `$${totalMonth.toFixed(2)}`;
}

// ============================================
// DISPLAY USERS
// ============================================
function displayUsers() {
    const tbody = document.getElementById('salaryTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContent = document.getElementById('tableContent');
    
    if (filteredUsers.length === 0) {
        tableContent.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tableContent.style.display = 'block';
    emptyState.style.display = 'none';
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    tbody.innerHTML = filteredUsers.map(user => {
        const salaryPlan = user.salaryPlan || 0;
        const salaryAmount = SALARY_PLANS[salaryPlan] || 0;
        const directSales = user.directSales || 0;
        const lastPayment = user.lastSalaryPayment ? user.lastSalaryPayment.toDate() : null;
        
        // Determine status
        let status = 'pending';
        let statusText = 'Pending';
        
        if (lastPayment) {
            const paymentMonth = lastPayment.getMonth();
            const paymentYear = lastPayment.getFullYear();
            
            if (paymentMonth === currentMonth && paymentYear === currentYear) {
                status = 'paid';
                statusText = 'Paid';
            }
        }
        
        // Format last payment date
        const lastPaymentText = lastPayment 
            ? lastPayment.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Never';
        
        // Get user initials
        const initials = user.fullName 
            ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
            : 'U';
        
        // Plan name
        const planNames = {
            0: 'No Plan',
            1: 'Plan 1',
            2: 'Plan 2',
            3: 'Plan 3'
        };
        
        return `
            <tr data-user-id="${user.id}">
                <td>
                    <div class="user-info">
                        <div class="user-avatar">${initials}</div>
                        <div class="user-details">
                            <div class="user-name">${user.fullName || 'Unknown'}</div>
                            <div class="user-email">${user.email || ''}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="plan-badge plan-${salaryPlan}">${planNames[salaryPlan]}</span>
                </td>
                <td>${directSales}</td>
                <td class="amount">$${salaryAmount.toFixed(2)}</td>
                <td>${lastPaymentText}</td>
                <td>
                    <span class="status-badge status-${status}">${statusText}</span>
                </td>
                <td>
                    <div class="action-btns">
                        ${status === 'pending' && salaryAmount > 0 ? `
                            <button class="btn-pay" onclick="paySalary('${user.id}', ${salaryAmount})">
                                <i class="fas fa-check"></i> Pay
                            </button>
                        ` : ''}
                        <button class="btn-view" onclick="viewUserDetails('${user.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// PAY SALARY
// ============================================
async function paySalary(userId, amount) {
    if (!confirm(`Pay salary of $${amount.toFixed(2)} to this user?`)) {
        return;
    }
    
    try {
        const user = allUsers.find(u => u.id === userId);
        if (!user) {
            alert('User not found');
            return;
        }
        
        // Update user balance and last payment date
        await db.collection('users').doc(userId).update({
            balance: firebase.firestore.FieldValue.increment(amount),
            totalSalary: firebase.firestore.FieldValue.increment(amount),
            lastSalaryPayment: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Create salary record
        await db.collection('salaries').add({
            userId: userId,
            amount: amount,
            plan: user.salaryPlan,
            directSales: user.directSales || 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'paid'
        });
        
        // Create transaction record
        await db.collection('transactions').add({
            userId: userId,
            type: 'salary',
            amount: amount,
            balanceBefore: user.balance || 0,
            balanceAfter: (user.balance || 0) + amount,
            description: `Monthly salary payment - Plan ${user.salaryPlan}`,
            relatedId: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Salary paid successfully!');
        
        // Reload data
        await loadSalaryData();
        
    } catch (error) {
        console.error('Error paying salary:', error);
        alert('Error paying salary: ' + error.message);
    }
}

// ============================================
// PROCESS ALL PENDING
// ============================================
document.getElementById('processAllBtn').addEventListener('click', async () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get pending users
    const pendingUsers = allUsers.filter(user => {
        const salaryPlan = user.salaryPlan || 0;
        if (salaryPlan === 0) return false;
        
        const lastPayment = user.lastSalaryPayment ? user.lastSalaryPayment.toDate() : null;
        
        if (!lastPayment) return true;
        
        const paymentMonth = lastPayment.getMonth();
        const paymentYear = lastPayment.getFullYear();
        
        return !(paymentMonth === currentMonth && paymentYear === currentYear);
    });
    
    if (pendingUsers.length === 0) {
        alert('No pending salary payments');
        return;
    }
    
    const totalAmount = pendingUsers.reduce((sum, user) => {
        return sum + (SALARY_PLANS[user.salaryPlan] || 0);
    }, 0);
    
    if (!confirm(`Process ${pendingUsers.length} salary payments totaling $${totalAmount.toFixed(2)}?`)) {
        return;
    }
    
    const btn = document.getElementById('processAllBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        let successCount = 0;
        let errorCount = 0;
        
        for (const user of pendingUsers) {
            try {
                const amount = SALARY_PLANS[user.salaryPlan] || 0;
                
                // Update user
                await db.collection('users').doc(user.id).update({
                    balance: firebase.firestore.FieldValue.increment(amount),
                    totalSalary: firebase.firestore.FieldValue.increment(amount),
                    lastSalaryPayment: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                // Create salary record
                await db.collection('salaries').add({
                    userId: user.id,
                    amount: amount,
                    plan: user.salaryPlan,
                    directSales: user.directSales || 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'paid'
                });
                
                // Create transaction
                await db.collection('transactions').add({
                    userId: user.id,
                    type: 'salary',
                    amount: amount,
                    balanceBefore: user.balance || 0,
                    balanceAfter: (user.balance || 0) + amount,
                    description: `Monthly salary payment - Plan ${user.salaryPlan}`,
                    relatedId: null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                successCount++;
            } catch (error) {
                console.error('Error processing salary for user:', user.id, error);
                errorCount++;
            }
        }
        
        alert(`Processed ${successCount} payments successfully. ${errorCount} failed.`);
        
        // Reload data
        await loadSalaryData();
        
    } catch (error) {
        console.error('Error processing salaries:', error);
        alert('Error processing salaries: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-double"></i> Process All Pending';
    }
});

// ============================================
// VIEW USER DETAILS
// ============================================
function viewUserDetails(userId) {
    window.location.href = `users-management.html?userId=${userId}`;
}

// ============================================
// FILTERS
// ============================================
document.getElementById('filterPlan').addEventListener('change', applyFilters);
document.getElementById('filterStatus').addEventListener('change', applyFilters);
document.getElementById('searchUser').addEventListener('input', applyFilters);

function applyFilters() {
    const planFilter = document.getElementById('filterPlan').value;
    const statusFilter = document.getElementById('filterStatus').value;
    const searchTerm = document.getElementById('searchUser').value.toLowerCase();
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    filteredUsers = allUsers.filter(user => {
        // Plan filter
        if (planFilter !== 'all' && user.salaryPlan !== parseInt(planFilter)) {
            return false;
        }
        
        // Status filter
        if (statusFilter !== 'all') {
            const lastPayment = user.lastSalaryPayment ? user.lastSalaryPayment.toDate() : null;
            let status = 'pending';
            
            if (lastPayment) {
                const paymentMonth = lastPayment.getMonth();
                const paymentYear = lastPayment.getFullYear();
                
                if (paymentMonth === currentMonth && paymentYear === currentYear) {
                    status = 'paid';
                }
            }
            
            if (status !== statusFilter) {
                return false;
            }
        }
        
        // Search filter
        if (searchTerm) {
            const fullName = (user.fullName || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            
            if (!fullName.includes(searchTerm) && !email.includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
    
    displayUsers();
}

// ============================================
// EXPORT REPORT
// ============================================
document.getElementById('exportBtn').addEventListener('click', () => {
    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    let csv = 'User Name,Email,Salary Plan,Direct Sales,Amount,Last Payment,Status\n';
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    filteredUsers.forEach(user => {
        const salaryPlan = user.salaryPlan || 0;
        const salaryAmount = SALARY_PLANS[salaryPlan] || 0;
        const directSales = user.directSales || 0;
        const lastPayment = user.lastSalaryPayment ? user.lastSalaryPayment.toDate() : null;
        
        let status = 'Pending';
        if (lastPayment) {
            const paymentMonth = lastPayment.getMonth();
            const paymentYear = lastPayment.getFullYear();
            
            if (paymentMonth === currentMonth && paymentYear === currentYear) {
                status = 'Paid';
            }
        }
        
        const lastPaymentText = lastPayment 
            ? lastPayment.toLocaleDateString('en-US')
            : 'Never';
        
        csv += `"${user.fullName || 'Unknown'}","${user.email || ''}",${salaryPlan},${directSales},$${salaryAmount.toFixed(2)},${lastPaymentText},${status}\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salary-report-${monthName.replace(' ', '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadSalaryData();
});
