// ============================================
// TRANSACTIONS JAVASCRIPT
// ============================================

let currentUser = null;
let allTransactions = [];
let filteredTransactions = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 20;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    await loadTransactions();
});

async function loadTransactions() {
    try {
        const transactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        allTransactions = [];
        transactionsSnapshot.forEach(doc => {
            allTransactions.push({ id: doc.id, ...doc.data() });
        });
        
        filteredTransactions = allTransactions;
        displayTransactions();
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        showToast('Failed to load transactions', 'error');
    }
}

function filterTransactions(type) {
    currentFilter = type;
    currentPage = 1;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${type}"]`).classList.add('active');
    
    // Filter transactions
    if (type === 'all') {
        filteredTransactions = allTransactions;
        document.getElementById('filterTitle').textContent = 'All Transactions';
    } else {
        filteredTransactions = allTransactions.filter(t => t.type === type);
        const titles = {
            deposit: 'Deposits',
            withdrawal: 'Withdrawals',
            investment: 'Investments',
            daily_profit: 'Daily Profits',
            commission: 'Commissions',
            salary: 'Salaries'
        };
        document.getElementById('filterTitle').textContent = titles[type] || 'Transactions';
    }
    
    displayTransactions();
}

function displayTransactions() {
    const tbody = document.getElementById('transactionsBody');
    
    if (filteredTransactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-gray);">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block; opacity: 0.3;"></i>
                    No transactions found
                </td>
            </tr>
        `;
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    let html = '';
    
    pageTransactions.forEach(transaction => {
        const date = transaction.createdAt?.toDate();
        
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
                    <span style="color: ${transaction.amount >= 0 ? 'var(--neon-green)' : '#ff4444'}; font-weight: 600; font-size: 1.05rem;">
                        ${transaction.amount >= 0 ? '+' : ''}${formatCurrency(transaction.amount)}
                    </span>
                </td>
                <td>${formatCurrency(transaction.balanceBefore || 0)}</td>
                <td>${formatCurrency(transaction.balanceAfter || 0)}</td>
                <td style="max-width: 300px;">${transaction.description}</td>
                <td>${date ? formatDateTime(date) : 'N/A'}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Update pagination
    if (totalPages > 1) {
        document.getElementById('pagination').style.display = 'block';
        document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
        document.getElementById('prevBtn').disabled = currentPage === 1;
        document.getElementById('nextBtn').disabled = currentPage === totalPages;
    } else {
        document.getElementById('pagination').style.display = 'none';
    }
}

function loadPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTransactions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function loadNextPage() {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTransactions();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.filterTransactions = filterTransactions;
window.loadPreviousPage = loadPreviousPage;
window.loadNextPage = loadNextPage;
