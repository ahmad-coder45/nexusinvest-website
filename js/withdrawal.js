// ============================================
// WITHDRAWAL JAVASCRIPT
// ============================================

let currentUser = null;
let userData = null;
let isEligible = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    await loadUserData();
    await checkWithdrawalEligibility();
});

// Load user data
async function loadUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        userData = userDoc.data();
        
        // Update available balance
        document.getElementById('availableBalance').textContent = formatCurrency(userData.balance || 0);
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load user data', 'error');
    }
}

// Check withdrawal eligibility
async function checkWithdrawalEligibility() {
    try {
        const eligibilityDiv = document.getElementById('eligibilityStatus');
        const submitBtn = document.getElementById('submitBtn');
        
        // Check if user has sufficient balance
        if ((userData.balance || 0) < 5) {
            eligibilityDiv.innerHTML = `
                <div style="padding: var(--spacing-lg); text-align: center; background: rgba(255, 68, 68, 0.1); border-radius: var(--radius-md);">
                    <i class="fas fa-times-circle" style="font-size: 3rem; color: #ff4444; margin-bottom: var(--spacing-md);"></i>
                    <h3 style="color: #ff4444; margin-bottom: var(--spacing-sm);">Insufficient Balance</h3>
                    <p style="color: var(--text-gray);">
                        Your balance is below the minimum withdrawal amount of $5.
                        <br>Please deposit or earn more to withdraw.
                    </p>
                    <a href="deposit.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
                        <i class="fas fa-plus-circle"></i> Deposit Funds
                    </a>
                </div>
            `;
            submitBtn.disabled = true;
            return;
        }
        
        // Get withdrawal count this month
        const withdrawalCount = userData.withdrawalCount || 0;
        
        // First withdrawal check (10 days from first investment)
        if (withdrawalCount === 0) {
            if (!userData.firstInvestmentDate) {
                eligibilityDiv.innerHTML = `
                    <div style="padding: var(--spacing-lg); text-align: center; background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-md);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ffaa00; margin-bottom: var(--spacing-md);"></i>
                        <h3 style="color: #ffaa00; margin-bottom: var(--spacing-sm);">No Investment Yet</h3>
                        <p style="color: var(--text-gray);">
                            You need to make your first investment before you can withdraw.
                            <br>First withdrawal is available 10 days after your first investment.
                        </p>
                        <a href="plans.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
                            <i class="fas fa-chart-line"></i> Browse Plans
                        </a>
                    </div>
                `;
                submitBtn.disabled = true;
                return;
            }
            
            const firstInvestmentDate = userData.firstInvestmentDate.toDate();
            const daysSinceFirstInvestment = Math.floor((Date.now() - firstInvestmentDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSinceFirstInvestment < 10) {
                const daysRemaining = 10 - daysSinceFirstInvestment;
                eligibilityDiv.innerHTML = `
                    <div style="padding: var(--spacing-lg); text-align: center; background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-md);">
                        <i class="fas fa-clock" style="font-size: 3rem; color: #ffaa00; margin-bottom: var(--spacing-md);"></i>
                        <h3 style="color: #ffaa00; margin-bottom: var(--spacing-sm);">First Withdrawal Locked</h3>
                        <p style="color: var(--text-gray);">
                            Your first withdrawal will be available in <strong>${daysRemaining} days</strong>.
                            <br>First withdrawal is available 10 days after your first investment.
                        </p>
                        <div style="margin-top: var(--spacing-md); padding: var(--spacing-sm); background: rgba(0, 102, 255, 0.1); border-radius: var(--radius-sm);">
                            <small>First Investment: ${formatDate(firstInvestmentDate)}</small>
                        </div>
                    </div>
                `;
                submitBtn.disabled = true;
                return;
            }
        }
        
        // Second withdrawal check (requires 1 active referral)
        if (withdrawalCount === 1) {
            // Check if user has at least 1 referral with active investment
            const referralsSnapshot = await db.collection('users')
                .where('referredBy', '==', currentUser.uid)
                .get();
            
            let hasActiveReferral = false;
            
            for (const doc of referralsSnapshot.docs) {
                const referralId = doc.id;
                const investmentsSnapshot = await db.collection('investments')
                    .where('userId', '==', referralId)
                    .where('status', '==', 'active')
                    .limit(1)
                    .get();
                
                if (!investmentsSnapshot.empty) {
                    hasActiveReferral = true;
                    break;
                }
            }
            
            if (!hasActiveReferral) {
                eligibilityDiv.innerHTML = `
                    <div style="padding: var(--spacing-lg); text-align: center; background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-md);">
                        <i class="fas fa-users" style="font-size: 3rem; color: #ffaa00; margin-bottom: var(--spacing-md);"></i>
                        <h3 style="color: #ffaa00; margin-bottom: var(--spacing-sm);">Second Withdrawal Locked</h3>
                        <p style="color: var(--text-gray);">
                            You've used your first withdrawal this month.
                            <br>To unlock your second withdrawal, you need to refer at least <strong>1 new member</strong> who makes an active investment.
                        </p>
                        <a href="referrals.html" class="btn btn-primary" style="margin-top: var(--spacing-md);">
                            <i class="fas fa-share-alt"></i> Share Referral Link
                        </a>
                    </div>
                `;
                submitBtn.disabled = true;
                return;
            }
        }
        
        // Monthly limit check (max 2 withdrawals per month)
        if (withdrawalCount >= 2) {
            eligibilityDiv.innerHTML = `
                <div style="padding: var(--spacing-lg); text-align: center; background: rgba(255, 68, 68, 0.1); border-radius: var(--radius-md);">
                    <i class="fas fa-ban" style="font-size: 3rem; color: #ff4444; margin-bottom: var(--spacing-md);"></i>
                    <h3 style="color: #ff4444; margin-bottom: var(--spacing-sm);">Monthly Limit Reached</h3>
                    <p style="color: var(--text-gray);">
                        You've reached the maximum of 2 withdrawals for this month.
                        <br>Your withdrawal limit will reset on the 1st of next month.
                    </p>
                </div>
            `;
            submitBtn.disabled = true;
            return;
        }
        
        // User is eligible
        isEligible = true;
        eligibilityDiv.innerHTML = `
            <div style="padding: var(--spacing-lg); text-align: center; background: rgba(0, 255, 136, 0.1); border-radius: var(--radius-md);">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--neon-green); margin-bottom: var(--spacing-md);"></i>
                <h3 style="color: var(--neon-green); margin-bottom: var(--spacing-sm);">Withdrawal Available</h3>
                <p style="color: var(--text-gray);">
                    You can withdraw funds from your account.
                    <br>Withdrawals used this month: <strong>${withdrawalCount}/2</strong>
                </p>
            </div>
        `;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error checking eligibility:', error);
        showToast('Failed to check withdrawal eligibility', 'error');
    }
}

// Handle withdrawal form submission
const withdrawalForm = document.getElementById('withdrawalForm');
if (withdrawalForm) {
    withdrawalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!isEligible) {
            showToast('You are not eligible for withdrawal at this time', 'error');
            return;
        }
        
        const method = document.getElementById('method').value;
        const accountDetails = document.getElementById('accountDetails').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        
        // Validation
        if (!method) {
            showToast('Please select a withdrawal method', 'error');
            return;
        }
        
        if (!accountDetails) {
            showToast('Please enter your account details', 'error');
            return;
        }
        
        if (amount < 5) {
            showToast('Minimum withdrawal amount is $5', 'error');
            return;
        }
        
        if (amount > userData.balance) {
            showToast('Insufficient balance', 'error');
            return;
        }
        
        // Calculate tax
        const taxAmount = amount * 0.05;
        const netAmount = amount - taxAmount;
        
        // Confirm withdrawal
        if (!confirm(`You will receive ${formatCurrency(netAmount)} after 5% tax. Continue?`)) {
            return;
        }
        
        // Show loading
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            // Create withdrawal request
            await db.collection('withdrawals').add({
                userId: currentUser.uid,
                amount: amount,
                taxAmount: taxAmount,
                netAmount: netAmount,
                method: method,
                accountDetails: accountDetails,
                status: 'pending',
                rejectionReason: '',
                withdrawalNumber: (userData.withdrawalCount || 0) + 1,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedAt: null,
                approvedBy: null,
                paidAt: null,
                receiptUrl: null
            });
            
            showToast('Withdrawal request submitted! Waiting for admin approval.', 'success');
            
            // Reset form
            withdrawalForm.reset();
            document.getElementById('withdrawalAmount').textContent = '$0.00';
            document.getElementById('taxAmount').textContent = '$0.00';
            document.getElementById('netAmount').textContent = '$0.00';
            
            // Redirect to transactions after 2 seconds
            setTimeout(() => {
                window.location.href = 'transactions.html';
            }, 2000);
            
        } catch (error) {
            console.error('Withdrawal error:', error);
            showToast('Failed to submit withdrawal request. Please try again.', 'error');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Withdrawal Request';
        }
    });
}
