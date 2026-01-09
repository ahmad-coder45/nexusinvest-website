// ============================================
// ADMIN WITHDRAWALS MANAGEMENT
// ============================================

let currentAdmin = null;
let currentWithdrawalId = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentAdmin = await checkAdminAuth();
    if (!currentAdmin) return;
    
    await loadPendingWithdrawals();
    setupPendingCountsListener();
    setupRealtimeListener();
});

async function loadPendingWithdrawals() {
    try {
        const withdrawalsSnapshot = await db.collection('withdrawals')
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();
        
        const tbody = document.getElementById('withdrawalsBody');
        
        if (withdrawalsSnapshot.empty) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-gray);">
                        <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block; color: var(--neon-green); opacity: 0.3;"></i>
                        No pending withdrawals
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        
        for (const doc of withdrawalsSnapshot.docs) {
            const withdrawal = doc.data();
            const withdrawalId = doc.id;
            
            const userDoc = await db.collection('users').doc(withdrawal.userId).get();
            const userName = userDoc.data()?.fullName || 'Unknown User';
            const userEmail = userDoc.data()?.email || '';
            
            const date = withdrawal.createdAt?.toDate();
            
            html += `
                <tr>
                    <td>
                        <div>
                            <div style="font-weight: 600;">${userName}</div>
                            <div style="font-size: 0.85rem; color: var(--text-gray);">${userEmail}</div>
                        </div>
                    </td>
                    <td>
                        <span style="font-weight: 700; color: #ff4444; font-size: 1.1rem;">
                            ${formatCurrency(withdrawal.amount)}
                        </span>
                    </td>
                    <td>
                        <span style="color: #ff4444;">
                            ${formatCurrency(withdrawal.taxAmount)}
                        </span>
                    </td>
                    <td>
                        <span style="font-weight: 700; color: var(--neon-green); font-size: 1.1rem;">
                            ${formatCurrency(withdrawal.netAmount)}
                        </span>
                    </td>
                    <td>
                        <span class="admin-badge">${withdrawal.method}</span>
                    </td>
                    <td>
                        <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                            ${withdrawal.accountDetails}
                        </div>
                    </td>
                    <td>${date ? formatDateTime(date) : 'N/A'}</td>
                    <td>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="approveWithdrawal('${withdrawalId}')" class="action-btn approve">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button onclick="openRejectModal('${withdrawalId}')" class="action-btn reject">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading pending withdrawals:', error);
        showToast('Failed to load withdrawals', 'error');
    }
}

async function approveWithdrawal(withdrawalId) {
    if (!confirm('Are you sure you want to approve this withdrawal?')) {
        return;
    }
    
    try {
        showLoading();
        
        await db.collection('withdrawals').doc(withdrawalId).update({
            status: 'approved',
            approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
            approvedBy: currentAdmin.uid
        });
        
        showToast('Withdrawal approved successfully!', 'success');
        await loadPendingWithdrawals();
        hideLoading();
        
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        showToast('Failed to approve withdrawal', 'error');
        hideLoading();
    }
}

function openRejectModal(withdrawalId) {
    currentWithdrawalId = withdrawalId;
    document.getElementById('rejectModal').classList.add('active');
}

function closeRejectModal() {
    document.getElementById('rejectModal').classList.remove('active');
    document.getElementById('rejectionReason').value = '';
    currentWithdrawalId = null;
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
            
            await db.collection('withdrawals').doc(currentWithdrawalId).update({
                status: 'rejected',
                rejectionReason: reason,
                rejectedAt: firebase.firestore.FieldValue.serverTimestamp(),
                rejectedBy: currentAdmin.uid
            });
            
            showToast('Withdrawal rejected', 'success');
            closeRejectModal();
            await loadPendingWithdrawals();
            hideLoading();
            
        } catch (error) {
            console.error('Error rejecting withdrawal:', error);
            showToast('Failed to reject withdrawal', 'error');
            hideLoading();
        }
    });
}

function setupRealtimeListener() {
    db.collection('withdrawals')
        .where('status', '==', 'pending')
        .onSnapshot(() => {
            loadPendingWithdrawals();
        });
}

window.approveWithdrawal = approveWithdrawal;
window.openRejectModal = openRejectModal;
window.closeRejectModal = closeRejectModal;
