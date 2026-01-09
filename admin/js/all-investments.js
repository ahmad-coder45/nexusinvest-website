// ============================================
// ALL INVESTMENTS JAVASCRIPT
// ============================================

let currentAdmin = null;
let allInvestments = [];
let filteredInvestments = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    currentAdmin = await checkAdminAuth();
    if (!currentAdmin) return;
    
    await loadInvestments();
    setupPendingCountsListener();
});

async function loadInvestments() {
    try {
        const investmentsSnapshot = await db.collection('investments')
            .orderBy('startDate', 'desc')
            .get();
        
        allInvestments = [];
        
        for (const doc of investmentsSnapshot.docs) {
            const investment = doc.data();
            const userDoc = await db.collection('users').doc(investment.userId).get();
            const userName = userDoc.data()?.fullName || 'Unknown User';
            
            allInvestments.push({
                id: doc.id,
                userName: userName,
                ...investment
            });
        }
        
        filteredInvestments = allInvestments;
        updateStats();
        displayInvestments();
        
    } catch (error) {
        console.error('Error loading investments:', error);
        showToast('Failed to load investments', 'error');
    }
}

function updateStats() {
    const active = allInvestments.filter(i => i.status === 'active');
    const totalAmount = allInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalProfit = allInvestments.reduce((sum, i) => sum + (i.profitEarned || 0), 0);
    
    document.getElementById('totalInvestments').textContent = allInvestments.length;
    document.getElementById('activeInvestments').textContent = active.length;
    document.getElementById('totalAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('totalProfit').textContent = formatCurrency(totalProfit);
}

function filterInvestments(status) {
    currentFilter = status;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-status="${status}"]`).classList.add('active');
    
    if (status === 'all') {
        filteredInvestments = allInvestments;
    } else {
        filteredInvestments = allInvestments.filter(i => i.status === status);
    }
    
    displayInvestments();
}

function displayInvestments() {
    const tbody = document.getElementById('investmentsBody');
    
    if (filteredInvestments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-gray);">
                    No investments found
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    filteredInvestments.forEach(investment => {
        const progress = (investment.daysCompleted / investment.duration) * 100;
        const startDate = investment.startDate?.toDate();
        const statusColor = investment.status === 'active' ? 'var(--neon-green)' : 'var(--electric-blue)';
        
        html += `
            <tr>
                <td>
                    <div style="font-weight: 600;">${investment.userName}</div>
                </td>
                <td>${investment.planName}</td>
                <td>
                    <span style="font-weight: 700; color: var(--electric-blue);">
                        ${formatCurrency(investment.amount)}
                    </span>
                </td>
                <td>
                    <span style="font-weight: 700; color: var(--neon-green);">
                        ${formatCurrency(investment.dailyProfit)}
                    </span>
                </td>
                <td>
                    <span style="font-weight: 700; color: var(--neon-green);">
                        ${formatCurrency(investment.profitEarned || 0)}
                    </span>
                </td>
                <td>
                    <div style="min-width: 150px;">
                        <div class="progress-bar" style="margin-bottom: 0.25rem;">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div style="font-size: 0.85rem; color: var(--text-gray);">
                            ${investment.daysCompleted}/${investment.duration} days
                        </div>
                    </div>
                </td>
                <td>
                    <span class="admin-badge" style="background: rgba(0, 255, 136, 0.2); color: ${statusColor};">
                        ${investment.status}
                    </span>
                </td>
                <td>${startDate ? formatDate(startDate) : 'N/A'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

window.filterInvestments = filterInvestments;
