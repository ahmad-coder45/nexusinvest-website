// ============================================
// MY INVESTMENTS JAVASCRIPT
// ============================================

let currentUser = null;
let allInvestments = [];
let filteredInvestments = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    await loadInvestments();
    setupRealtimeListener();
});

async function loadInvestments() {
    try {
        const investmentsSnapshot = await db.collection('investments')
            .where('userId', '==', currentUser.uid)
            .orderBy('startDate', 'desc')
            .get();
        
        allInvestments = [];
        investmentsSnapshot.forEach(doc => {
            allInvestments.push({ id: doc.id, ...doc.data() });
        });
        
        updateStats();
        filteredInvestments = allInvestments;
        displayInvestments();
        
    } catch (error) {
        console.error('Error loading investments:', error);
        showToast('Failed to load investments', 'error');
    }
}

function updateStats() {
    const active = allInvestments.filter(i => i.status === 'active');
    const completed = allInvestments.filter(i => i.status === 'completed');
    
    const totalInvested = allInvestments.reduce((sum, i) => sum + (i.amount || 0), 0);
    const totalEarned = allInvestments.reduce((sum, i) => sum + (i.profitEarned || 0), 0);
    
    document.getElementById('activeCount').textContent = active.length;
    document.getElementById('completedCount').textContent = completed.length;
    document.getElementById('totalInvested').textContent = formatCurrency(totalInvested);
    document.getElementById('totalEarned').textContent = formatCurrency(totalEarned);
}

function filterInvestments(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    if (filter === 'all') {
        filteredInvestments = allInvestments;
    } else {
        filteredInvestments = allInvestments.filter(i => i.status === filter);
    }
    
    displayInvestments();
}

function displayInvestments() {
    const container = document.getElementById('investmentsList');
    
    if (filteredInvestments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-line"></i>
                <h3>No Investments Found</h3>
                <p>Start investing to see your investments here</p>
                <a href="plans.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
                    <i class="fas fa-plus"></i> Browse Plans
                </a>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    filteredInvestments.forEach(investment => {
        const progress = (investment.daysCompleted / investment.duration) * 100;
        const daysRemaining = investment.duration - investment.daysCompleted;
        const startDate = investment.startDate?.toDate();
        
        const statusColor = investment.status === 'active' ? 'var(--neon-green)' : 'var(--electric-blue)';
        const statusText = investment.status === 'active' ? 'Active' : 'Completed';
        
        html += `
            <div class="investment-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--spacing-md);">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">${investment.planName}</h3>
                        <p style="color: var(--text-gray); margin: 0;">
                            Started: ${startDate ? formatDate(startDate) : 'N/A'}
                        </p>
                    </div>
                    <span class="status-badge ${investment.status}" style="background: rgba(0, 255, 136, 0.2); color: ${statusColor};">
                        ${statusText}
                    </span>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                    <div style="padding: var(--spacing-sm); background: rgba(0, 102, 255, 0.05); border-radius: var(--radius-sm);">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Invested</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--electric-blue);">
                            ${formatCurrency(investment.amount)}
                        </div>
                    </div>
                    
                    <div style="padding: var(--spacing-sm); background: rgba(0, 255, 136, 0.05); border-radius: var(--radius-sm);">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Daily Profit</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--neon-green);">
                            ${formatCurrency(investment.dailyProfit)}
                        </div>
                    </div>
                    
                    <div style="padding: var(--spacing-sm); background: rgba(0, 255, 136, 0.05); border-radius: var(--radius-sm);">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Earned</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--neon-green);">
                            ${formatCurrency(investment.profitEarned || 0)}
                        </div>
                    </div>
                    
                    <div style="padding: var(--spacing-sm); background: rgba(0, 102, 255, 0.05); border-radius: var(--radius-sm);">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Total Return</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: var(--electric-blue);">
                            ${formatCurrency(investment.totalReturn)}
                        </div>
                    </div>
                </div>
                
                <div class="progress-bar" style="margin-bottom: var(--spacing-sm);">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-gray);">
                    <span>Day ${investment.daysCompleted}/${investment.duration}</span>
                    <span>${investment.status === 'active' ? `${daysRemaining} days remaining` : 'Completed'}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function setupRealtimeListener() {
    db.collection('investments')
        .where('userId', '==', currentUser.uid)
        .onSnapshot(() => {
            loadInvestments();
        });
}

window.filterInvestments = filterInvestments;
