// ============================================
// WITHDRAWAL JAVASCRIPT
// ============================================

// Check if withdrawals are allowed (Mon-Fri, 9 AM - 9 PM)
function isWithdrawalTimeAllowed() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = now.getHours(); // 0-23
    
    // Check if it's Monday to Friday (1-5)
    const isWeekday = day >= 1 && day <= 5;
    
    // Check if it's between 9 AM (9) and 9 PM (21)
    const isWithinHours = hour >= 9 && hour < 21;
    
    return isWeekday && isWithinHours;
}

// Get next available withdrawal time
function getNextWithdrawalTime() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    // If it's weekend (Saturday or Sunday)
    if (day === 0 || day === 6) {
        // Next Monday at 9 AM
        const daysUntilMonday = day === 0 ? 1 : 2;
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + daysUntilMonday);
        nextMonday.setHours(9, 0, 0, 0);
        return nextMonday;
    }
    
    // If it's before 9 AM on a weekday
    if (hour < 9) {
        const today = new Date(now);
        today.setHours(9, 0, 0, 0);
        return today;
    }
    
    // If it's after 9 PM on a weekday
    if (hour >= 21) {
        // If it's Friday, next Monday
        if (day === 5) {
            const nextMonday = new Date(now);
            nextMonday.setDate(now.getDate() + 3);
            nextMonday.setHours(9, 0, 0, 0);
            return nextMonday;
        }
        // Otherwise, tomorrow at 9 AM
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow;
    }
    
    return null; // Currently allowed
}

// Format time remaining until next withdrawal window
function formatTimeUntilWithdrawal() {
    const nextTime = getNextWithdrawalTime();
    if (!nextTime) return null;
    
    const now = new Date();
    const diff = nextTime - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Update withdrawal form UI based on time
function updateWithdrawalUI() {
    const withdrawalForm = document.getElementById('withdrawalForm');
    const submitButton = document.querySelector('#withdrawalForm button[type="submit"]');
    const timeNotice = document.getElementById('timeNotice');
    
    if (!withdrawalForm) return;
    
    if (!isWithdrawalTimeAllowed()) {
        // Disable form
        const inputs = withdrawalForm.querySelectorAll('input, select, button');
        inputs.forEach(input => input.disabled = true);
        
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-clock"></i> WITHDRAWALS CLOSED';
            submitButton.style.background = '#666';
            submitButton.style.cursor = 'not-allowed';
        }
        
        // Show time notice
        if (timeNotice) {
            const timeLeft = formatTimeUntilWithdrawal();
            timeNotice.innerHTML = `
                <div style="background: rgba(255, 68, 68, 0.1); border-left: 3px solid #ff4444; padding: var(--spacing-md); border-radius: var(--radius-sm); margin-bottom: var(--spacing-lg);">
                    <i class="fas fa-exclamation-triangle" style="color: #ff4444;"></i>
                    <strong style="color: #ff4444;">Withdrawals Currently Closed</strong>
                    <p style="margin-top: 0.5rem; color: var(--text-gray);">
                        Withdrawals are only available Monday to Friday, 9 AM - 9 PM.<br>
                        Next available in: <strong style="color: var(--neon-green);">${timeLeft}</strong>
                    </p>
                </div>
            `;
        }
    } else {
        // Enable form
        const inputs = withdrawalForm.querySelectorAll('input, select, button');
        inputs.forEach(input => input.disabled = false);
        
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> SUBMIT WITHDRAWAL';
            submitButton.style.background = '';
            submitButton.style.cursor = '';
        }
        
        // Show success notice
        if (timeNotice) {
            const now = new Date();
            const hoursLeft = 21 - now.getHours();
            timeNotice.innerHTML = `
                <div style="background: rgba(0, 255, 136, 0.1); border-left: 3px solid var(--neon-green); padding: var(--spacing-md); border-radius: var(--radius-sm); margin-bottom: var(--spacing-lg);">
                    <i class="fas fa-check-circle" style="color: var(--neon-green);"></i>
                    <strong style="color: var(--neon-green);">Withdrawals Open</strong>
                    <p style="margin-top: 0.5rem; color: var(--text-gray);">
                        You can submit withdrawal requests now. Window closes in ${hoursLeft} hours (9 PM).
                    </p>
                </div>
            `;
        }
    }
}

// Initialize Firebase
let db;
firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        db = firebase.firestore();
        await loadUserData(user.uid);
        await loadWithdrawalHistory(user.uid);
        updateWithdrawalUI();
        
        // Update UI every minute
        setInterval(updateWithdrawalUI, 60000);
    } else {
        window.location.href = 'login.html';
    }
});

// Load user data
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        // Display user info
        document.getElementById('userName').textContent = userData.fullName || 'User';
        document.getElementById('userBalance').textContent = formatCurrency(userData.balance || 0);
        document.getElementById('withdrawalsThisMonth').textContent = userData.withdrawalsThisMonth || 0;
        
        // Calculate available balance (after tax)
        const availableBalance = userData.balance || 0;
        const taxAmount = availableBalance * 0.05;
        const netAmount = availableBalance - taxAmount;
        
        document.getElementById('availableBalance').textContent = formatCurrency(availableBalance);
        document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
        document.getElementById('netAmount').textContent = formatCurrency(netAmount);
        
        // Check withdrawal eligibility
        checkWithdrawalEligibility(userData);
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load user data', 'error');
    }
}

// Check withdrawal eligibility
function checkWithdrawalEligibility(userData) {
    const eligibilityDiv = document.getElementById('eligibilityStatus');
    const withdrawalForm = document.getElementById('withdrawalForm');
    
    const balance = userData.balance || 0;
    const withdrawalsThisMonth = userData.withdrawalsThisMonth || 0;
    const accountAge = userData.createdAt ? (Date.now() - userData.createdAt.toMillis()) / (1000 * 60 * 60 * 24) : 0;
    const activeReferrals = userData.activeReferrals || 0;
    
    let canWithdraw = true;
    let reasons = [];
    
    // Check time window
    if (!isWithdrawalTimeAllowed()) {
        canWithdraw = false;
        const timeLeft = formatTimeUntilWithdrawal();
        reasons.push(`⏰ Withdrawals only available Mon-Fri, 9 AM - 9 PM (Opens in: ${timeLeft})`);
    }
    
    // Check minimum balance
    if (balance < 5) {
        canWithdraw = false;
        reasons.push(`💰 Minimum withdrawal: $5 (Current: ${formatCurrency(balance)})`);
    }
    
    // Check monthly limit
    if (withdrawalsThisMonth >= 2) {
        canWithdraw = false;
        reasons.push('📅 Maximum 2 withdrawals per month reached');
    }
    
    // Check first withdrawal (10 days)
    if (withdrawalsThisMonth === 0 && accountAge < 10) {
        canWithdraw = false;
        const daysLeft = Math.ceil(10 - accountAge);
        reasons.push(`⏳ First withdrawal available after 10 days (${daysLeft} days left)`);
    }
    
    // Check second withdrawal (needs 1 active referral)
    if (withdrawalsThisMonth === 1 && activeReferrals < 1) {
        canWithdraw = false;
        reasons.push('👥 Second withdrawal requires 1 active referral');
    }
    
    // Display eligibility status
    if (canWithdraw) {
        eligibilityDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <strong>Eligible for Withdrawal</strong>
                <p>You can submit a withdrawal request now.</p>
            </div>
        `;
    } else {
        eligibilityDiv.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <strong>Withdrawal Not Available</strong>
                <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                    ${reasons.map(reason => `<li>${reason}</li>`).join('')}
                </ul>
            </div>
        `;
        
        // Disable form if not eligible
        const inputs = withdrawalForm.querySelectorAll('input, select, button');
        inputs.forEach(input => input.disabled = true);
    }
}

// Handle withdrawal form submission
document.getElementById('withdrawalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check time window first
    if (!isWithdrawalTimeAllowed()) {
        const timeLeft = formatTimeUntilWithdrawal();
        showToast(`Withdrawals only available Mon-Fri, 9 AM - 9 PM. Opens in: ${timeLeft}`, 'error');
        return;
    }
    
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const amount = parseFloat(document.getElementById('amount').value);
    const method = document.getElementById('method').value;
    const accountDetails = document.getElementById('accountDetails').value;
    
    // Validation
    if (!amount || amount < 5) {
        showToast('Minimum withdrawal amount is $5', 'error');
        return;
    }
    
    if (!method) {
        showToast('Please select a withdrawal method', 'error');
        return;
    }
    
    if (!accountDetails) {
        showToast('Please enter your account details', 'error');
        return;
    }
    
    try {
        showLoading();
        
        // Get user data
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // Final checks
        if (userData.balance < amount) {
            hideLoading();
            showToast('Insufficient balance', 'error');
            return;
        }
        
        if (userData.withdrawalsThisMonth >= 2) {
            hideLoading();
            showToast('Maximum 2 withdrawals per month', 'error');
            return;
        }
        
        // Calculate tax
        const taxAmount = amount * 0.05;
        const netAmount = amount - taxAmount;
        
        // Create withdrawal request
        await db.collection('withdrawals').add({
            userId: user.uid,
            userName: userData.fullName,
            userEmail: userData.email,
            amount: amount,
            taxAmount: taxAmount,
            netAmount: netAmount,
            method: method,
            accountDetails: accountDetails,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            requestedAt: new Date().toISOString()
        });
        
        // Create transaction record
        await db.collection('transactions').add({
            userId: user.uid,
            type: 'withdrawal',
            amount: amount,
            netAmount: netAmount,
            taxAmount: taxAmount,
            method: method,
            status: 'pending',
            description: `Withdrawal request via ${method}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoading();
        showToast('Withdrawal request submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('withdrawalForm').reset();
        
        // Reload data
        await loadUserData(user.uid);
        await loadWithdrawalHistory(user.uid);
        
    } catch (error) {
        console.error('Error submitting withdrawal:', error);
        hideLoading();
        showToast('Failed to submit withdrawal request', 'error');
    }
});

// Load withdrawal history
async function loadWithdrawalHistory(userId) {
    try {
        const withdrawalsSnapshot = await db.collection('withdrawals')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        const historyDiv = document.getElementById('withdrawalHistory');
        
        if (withdrawalsSnapshot.empty) {
            historyDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No withdrawal history</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="table-responsive"><table class="data-table"><thead><tr><th>Date</th><th>Amount</th><th>Net Amount</th><th>Method</th><th>Status</th></tr></thead><tbody>';
        
        withdrawalsSnapshot.forEach(doc => {
            const withdrawal = doc.data();
            const statusClass = withdrawal.status === 'approved' ? 'success' : withdrawal.status === 'rejected' ? 'error' : 'warning';
            const statusIcon = withdrawal.status === 'approved' ? 'check-circle' : withdrawal.status === 'rejected' ? 'times-circle' : 'clock';
            
            html += `
                <tr>
                    <td>${formatDateTime(withdrawal.createdAt.toDate())}</td>
                    <td>${formatCurrency(withdrawal.amount)}</td>
                    <td>${formatCurrency(withdrawal.netAmount)}</td>
                    <td><span class="badge badge-info">${withdrawal.method}</span></td>
                    <td><span class="badge badge-${statusClass}"><i class="fas fa-${statusIcon}"></i> ${withdrawal.status}</span></td>
                </tr>
            `;
        });
        
        html += '</tbody></table></div>';
        historyDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading withdrawal history:', error);
    }
}

// Update amount display
document.getElementById('amount').addEventListener('input', (e) => {
    const amount = parseFloat(e.target.value) || 0;
    const taxAmount = amount * 0.05;
    const netAmount = amount - taxAmount;
    
    document.getElementById('displayTax').textContent = formatCurrency(taxAmount);
    document.getElementById('displayNet').textContent = formatCurrency(netAmount);
});

// Update account details placeholder based on method
document.getElementById('method').addEventListener('change', (e) => {
    const method = e.target.value;
    const accountDetails = document.getElementById('accountDetails');
    
    if (method === 'binance') {
        accountDetails.placeholder = 'Enter your Binance USDT address';
    } else if (method === 'jazzcash') {
        accountDetails.placeholder = 'Enter your JazzCash number (03XXXXXXXXX)';
    } else if (method === 'easypaisa') {
        accountDetails.placeholder = 'Enter your EasyPaisa number (03XXXXXXXXX)';
    }
});
