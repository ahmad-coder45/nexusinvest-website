// ============================================
// SETTINGS PAGE JAVASCRIPT
// ============================================

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadPaymentMethods();
    
    // Update label based on selected payment method
    document.getElementById('newPaymentMethod').addEventListener('change', (e) => {
        const label = document.getElementById('accountDetailsLabel');
        if (e.target.value === 'binance') {
            label.textContent = 'Wallet Address (TRX Network)';
            document.getElementById('newAccountDetails').placeholder = 'Enter Binance USDT wallet address (TRX)';
        } else {
            label.textContent = 'IBAN Number';
            document.getElementById('newAccountDetails').placeholder = 'Enter IBAN number (e.g., PK00XXXXXXXXXXXXXXXXXXXX)';
        }
    });
});

// ============================================
// LOAD SETTINGS
// ============================================
async function loadSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('platform').get();
        
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            
            // Platform Settings
            if (settings.platformName) document.getElementById('platformName').value = settings.platformName;
            if (settings.supportEmail) document.getElementById('supportEmail').value = settings.supportEmail;
            if (settings.minDeposit) document.getElementById('minDeposit').value = settings.minDeposit;
            if (settings.minWithdrawal) document.getElementById('minWithdrawal').value = settings.minWithdrawal;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ============================================
// PAYMENT METHODS MANAGEMENT
// ============================================

// Load payment methods
async function loadPaymentMethods() {
    try {
        const methodsSnapshot = await db.collection('paymentMethods')
            .orderBy('createdAt', 'desc')
            .get();
        
        const listDiv = document.getElementById('paymentMethodsList');
        
        if (methodsSnapshot.empty) {
            listDiv.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No payment methods added yet</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">Add your first payment method above</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        methodsSnapshot.forEach(doc => {
            const method = doc.data();
            const methodId = doc.id;
            
            // Get method display name and icon
            const methodInfo = getMethodInfo(method.method);
            
            html += `
                <div class="payment-account-item">
                    <div class="payment-account-info">
                        <div class="payment-account-name">
                            <i class="${methodInfo.icon}" style="color: ${methodInfo.color}; margin-right: 0.5rem;"></i>
                            ${methodInfo.name}
                        </div>
                        <div class="payment-account-details">
                            ${method.accountDetails}
                        </div>
                    </div>
                    <div class="payment-account-actions">
                        <button 
                            class="btn-toggle ${method.active ? 'active' : 'inactive'}" 
                            onclick="togglePaymentMethod('${methodId}', ${!method.active})"
                        >
                            <i class="fas fa-${method.active ? 'check' : 'times'}"></i>
                            ${method.active ? 'Active' : 'Inactive'}
                        </button>
                        <button class="btn-remove" onclick="removePaymentMethod('${methodId}', '${methodInfo.name}')">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                </div>
            `;
        });
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading payment methods:', error);
        document.getElementById('paymentMethodsList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading payment methods</p>
            </div>
        `;
    }
}

// Get method info (name, icon, color)
function getMethodInfo(method) {
    const methodMap = {
        'binance': { name: 'Binance (USDT TRX)', icon: 'fab fa-bitcoin', color: '#F3BA2F' },
        'jazzcash': { name: 'JazzCash', icon: 'fas fa-mobile-alt', color: '#FF6B00' },
        'easypaisa': { name: 'EasyPaisa', icon: 'fas fa-wallet', color: '#00A859' },
        'nayapay': { name: 'NayaPay', icon: 'fas fa-university', color: '#00D4FF' },
        'sadapay': { name: 'SadaPay', icon: 'fas fa-credit-card', color: '#7C3AED' },
        'bank': { name: 'Bank Account', icon: 'fas fa-building-columns', color: '#4A90E2' }
    };
    
    return methodMap[method] || { name: method, icon: 'fas fa-money-bill', color: '#888' };
}

// Add payment method
async function addPaymentMethod() {
    try {
        const method = document.getElementById('newPaymentMethod').value;
        const accountDetails = document.getElementById('newAccountDetails').value.trim();
        
        if (!method) {
            alert('Please select a payment method');
            return;
        }
        
        if (!accountDetails) {
            alert('Please enter account details');
            return;
        }
        
        // Validate IBAN format for non-Binance methods
        if (method !== 'binance') {
            if (!accountDetails.startsWith('PK') || accountDetails.length < 24) {
                alert('Please enter a valid IBAN number (e.g., PK00XXXXXXXXXXXXXXXXXXXX)');
                return;
            }
        }
        
        // Check if method already exists
        const existingMethod = await db.collection('paymentMethods')
            .where('method', '==', method)
            .get();
        
        if (!existingMethod.empty) {
            alert('This payment method already exists. Please remove it first or edit the existing one.');
            return;
        }
        
        // Add to Firestore
        await db.collection('paymentMethods').add({
            method: method,
            accountDetails: accountDetails,
            active: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Payment method added successfully!');
        
        // Clear form
        document.getElementById('newPaymentMethod').value = '';
        document.getElementById('newAccountDetails').value = '';
        
        // Reload list
        loadPaymentMethods();
        
    } catch (error) {
        console.error('Error adding payment method:', error);
        alert('Error adding payment method: ' + error.message);
    }
}

// Toggle payment method active/inactive
async function togglePaymentMethod(methodId, newStatus) {
    try {
        await db.collection('paymentMethods').doc(methodId).update({
            active: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert(`Payment method ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        
        // Reload list
        loadPaymentMethods();
        
    } catch (error) {
        console.error('Error toggling payment method:', error);
        alert('Error updating payment method: ' + error.message);
    }
}

// Remove payment method
async function removePaymentMethod(methodId, methodName) {
    if (!confirm(`Are you sure you want to remove ${methodName}?\n\nThis will remove it from the deposit page for all users.`)) {
        return;
    }
    
    try {
        await db.collection('paymentMethods').doc(methodId).delete();
        
        alert('Payment method removed successfully!');
        
        // Reload list
        loadPaymentMethods();
        
    } catch (error) {
        console.error('Error removing payment method:', error);
        alert('Error removing payment method: ' + error.message);
    }
}

// ============================================
// SAVE PLATFORM SETTINGS
// ============================================
async function savePlatformSettings() {
    try {
        const platformName = document.getElementById('platformName').value;
        const supportEmail = document.getElementById('supportEmail').value;
        const minDeposit = parseFloat(document.getElementById('minDeposit').value);
        const minWithdrawal = parseFloat(document.getElementById('minWithdrawal').value);
        
        await db.collection('settings').doc('platform').set({
            platformName,
            supportEmail,
            minDeposit,
            minWithdrawal,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        alert('Platform settings saved successfully!');
    } catch (error) {
        console.error('Error saving platform settings:', error);
        alert('Error saving settings: ' + error.message);
    }
}

// ============================================
// CHANGE PASSWORD
// ============================================
async function changePassword() {
    try {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!newPassword || !confirmPassword) {
            alert('Please enter both password fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }
        
        const user = auth.currentUser;
        await user.updatePassword(newPassword);
        
        alert('Password changed successfully!');
        
        // Clear fields
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
    } catch (error) {
        console.error('Error changing password:', error);
        
        if (error.code === 'auth/requires-recent-login') {
            alert('Please logout and login again before changing password');
        } else {
            alert('Error changing password: ' + error.message);
        }
    }
}
