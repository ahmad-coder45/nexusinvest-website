// ============================================
// ADMIN DEPOSITS MANAGEMENT
// ============================================

let currentAdmin = null;
let currentDepositId = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentAdmin = await checkAdminAuth();
    if (!currentAdmin) return;
    
    await loadPendingDeposits();
    setupPendingCountsListener();
    setupRealtimeListener();
});

async function loadPendingDeposits() {
    try {
        const depositsSnapshot = await db.collection('deposits')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        
        const tbody = document.getElementById('depositsBody');
        
        if (depositsSnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-gray);">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block; color: var(--neon-green); opacity: 0.3;"></i>
                        No pending deposits
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        for (const doc of depositsSnapshot.docs) {
            const deposit = doc.data();
            const depositId = doc.id;
            
            const userDoc = await db.collection('users').doc(deposit.userId).get();
            const userName = userDoc.data()?.fullName || 'Unknown User';
            const userEmail = userDoc.data()?.email || '';
            
            const date = deposit.createdAt?.toDate();
            
            html += `
                <tr>
                    <td>
                        <div>
                            <div style="font-weight: 600;">${userName}</div>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">${userEmail}</div>
                        </div>
                    </td>
                    <td>
                        <span style="font-weight: 700; color: var(--neon-green); font-size: 1.1rem;">
                            ${formatCurrency(deposit.amount)}
                        </span>
                    </td>
                    <td>
                        <span class="admin-badge">${deposit.method}</span>
                    </td>
                    <td>${date ? formatDateTime(date) : 'N/A'}</td>
                    <td>
                        <button onclick="viewProof('${depositId}')" class="action-btn view">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                    <td>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="approveDeposit('${depositId}')" class="action-btn approve">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button onclick="openRejectModal('${depositId}')" class="action-btn reject">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading pending deposits:', error);
        showToast('Failed to load deposits', 'error');
    }
}

async function viewProof(depositId) {
    try {
        const depositDoc = await db.collection('deposits').doc(depositId).get();
        const deposit = depositDoc.data();
        
        const userDoc = await db.collection('users').doc(deposit.userId).get();
        const userName = userDoc.data()?.fullName || 'Unknown User';
        
        // Handle both base64 and URL images
        const imageSource = deposit.proofImage || deposit.proofUrl || '';
        document.getElementById('proofImage').src = imageSource;
        
        document.getElementById('proofDetails').innerHTML = `
            <div style="padding: var(--spacing-md); background: rgba(0, 102, 255, 0.05); border-radius: var(--radius-md); margin-top: var(--spacing-md);">
                <div style="margin-bottom: 0.5rem;"><strong>User:</strong> ${userName}</div>
                <div style="margin-bottom: 0.5rem;"><strong>Amount:</strong> ${formatCurrency(deposit.amount)}</div>
                <div style="margin-bottom: 0.5rem;"><strong>Method:</strong> ${deposit.method}</div>
                <div><strong>Date:</strong> ${formatDateTime(deposit.createdAt?.toDate())}</div>
            </div>
        `;
        
        document.getElementById('proofModal').classList.add('active');
        
    } catch (error) {
        console.error('Error viewing proof:', error);
        showToast('Failed to load proof', 'error');
    }
}

function closeProofModal() {
    document.getElementById('proofModal').classList.remove('active');
}

async function approveDeposit(depositId) {
    if (!confirm('Are you sure you want to approve this deposit?\n\nThis will automatically add the amount to the user\'s balance.')) {
        return;
    }
    
    try {
        showLoading();
        
        const depositDoc = await db.collection('deposits').doc(depositId).get();
        const deposit = depositDoc.data();
        
        // Get user's current balance
        const userDoc = await db.collection('users').doc(deposit.userId).get();
        const userData = userDoc.data();
        const currentBalance = userData.balance || 0;
        const newBalance = currentBalance + deposit.amount;
        
        // Update user balance
        await db.collection('users').doc(deposit.userId).update({
            balance: newBalance,
            totalDeposited: (userData.totalDeposited || 0) + deposit.amount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update deposit status
        await db.collection('deposits').doc(depositId).update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: currentAdmin.uid
        });
        
        // Update transaction status
        const transactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', deposit.userId)
            .where('type', '==', 'deposit')
            .where('amount', '==', deposit.amount)
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();
        
        if (!transactionsSnapshot.empty) {
            const transactionDoc = transactionsSnapshot.docs[0];
            await db.collection('transactions').doc(transactionDoc.id).update({
                status: 'completed',
                completedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast(`Deposit approved! User balance updated: ${formatCurrency(currentBalance)} → ${formatCurrency(newBalance)}`, 'success');
        await loadPendingDeposits();
        hideLoading();
        
    } catch (error) {
        console.error('Error approving deposit:', error);
        showToast('Failed to approve deposit: ' + error.message, 'error');
        hideLoading();
    }
}

function openRejectModal(depositId) {
    currentDepositId = depositId;
    document.getElementById('rejectModal').classList.add('active');
}

function closeRejectModal() {
    document.getElementById('rejectModal').classList.remove('active');
    document.getElementById('rejectionReason').value = '';
    currentDepositId = null;
}

const rejectForm = document.getElementById('rejectForm');
if (rejectForm) {
    rejectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const reason = document.getElementById('rejectionReason').value.trim();
        
        if (!reason) {
            showToast('Please enter rejection reason', 'error');
            return;
        }
        
        try {
            showLoading();
            
            const depositDoc = await db.collection('deposits').doc(currentDepositId).get();
            const deposit = depositDoc.data();
            
            // Update deposit status
            await db.collection('deposits').doc(currentDepositId).update({
                status: 'rejected',
                rejectionReason: reason,
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
                rejectedBy: currentAdmin.uid
            });
            
            // Update transaction status
            const transactionsSnapshot = await db.collection('transactions')
                .where('userId', '==', deposit.userId)
                .where('type', '==', 'deposit')
                .where('amount', '==', deposit.amount)
                .where('status', '==', 'pending')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();
            
            if (!transactionsSnapshot.empty) {
                const transactionDoc = transactionsSnapshot.docs[0];
                await db.collection('transactions').doc(transactionDoc.id).update({
                    status: 'rejected',
                    rejectionReason: reason,
                    rejectedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            showToast('Deposit rejected', 'success');
            closeRejectModal();
            await loadPendingDeposits();
            hideLoading();
            
        } catch (error) {
            console.error('Error rejecting deposit:', error);
            showToast('Failed to reject deposit', 'error');
            hideLoading();
        }
    });
}

function setupRealtimeListener() {
    db.collection('deposits')
        .where('status', '==', 'pending')
        .onSnapshot(() => {
            loadPendingDeposits();
        });
}

window.viewProof = viewProof;
window.closeProofModal = closeProofModal;
window.approveDeposit = approveDeposit;
window.openRejectModal = openRejectModal;
window.closeRejectModal = closeRejectModal;
