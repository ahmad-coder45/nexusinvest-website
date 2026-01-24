// ============================================
// SETTINGS PAGE JAVASCRIPT
// ============================================

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
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
            
            // Salary Plans
            if (settings.plan1Amount) document.getElementById('plan1Amount').value = settings.plan1Amount;
            if (settings.plan2Amount) document.getElementById('plan2Amount').value = settings.plan2Amount;
            if (settings.plan3Amount) document.getElementById('plan3Amount').value = settings.plan3Amount;
            
            // Referral Settings
            if (settings.regBonus) document.getElementById('regBonus').value = settings.regBonus;
            if (settings.refCommission) document.getElementById('refCommission').value = settings.refCommission;
            
            // Payment Methods
            if (settings.enableCrypto !== undefined) document.getElementById('enableCrypto').checked = settings.enableCrypto;
            if (settings.enableBank !== undefined) document.getElementById('enableBank').checked = settings.enableBank;
            if (settings.enablePaypal !== undefined) document.getElementById('enablePaypal').checked = settings.enablePaypal;
            
            // Maintenance Mode
            if (settings.maintenanceMode !== undefined) document.getElementById('maintenanceMode').checked = settings.maintenanceMode;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
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
// SAVE SALARY PLANS
// ============================================
async function saveSalaryPlans() {
    try {
        const plan1Amount = parseFloat(document.getElementById('plan1Amount').value);
        const plan2Amount = parseFloat(document.getElementById('plan2Amount').value);
        const plan3Amount = parseFloat(document.getElementById('plan3Amount').value);
        
        await db.collection('settings').doc('platform').set({
            plan1Amount,
            plan2Amount,
            plan3Amount,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        alert('Salary plans saved successfully!');
    } catch (error) {
        console.error('Error saving salary plans:', error);
        alert('Error saving salary plans: ' + error.message);
    }
}

// ============================================
// SAVE REFERRAL SETTINGS
// ============================================
async function saveReferralSettings() {
    try {
        const regBonus = parseFloat(document.getElementById('regBonus').value);
        const refCommission = parseFloat(document.getElementById('refCommission').value);
        
        await db.collection('settings').doc('platform').set({
            regBonus,
            refCommission,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        alert('Referral settings saved successfully!');
    } catch (error) {
        console.error('Error saving referral settings:', error);
        alert('Error saving referral settings: ' + error.message);
    }
}

// ============================================
// SAVE PAYMENT METHODS
// ============================================
async function savePaymentMethods() {
    try {
        const enableCrypto = document.getElementById('enableCrypto').checked;
        const enableBank = document.getElementById('enableBank').checked;
        const enablePaypal = document.getElementById('enablePaypal').checked;
        
        await db.collection('settings').doc('platform').set({
            enableCrypto,
            enableBank,
            enablePaypal,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        alert('Payment methods saved successfully!');
    } catch (error) {
        console.error('Error saving payment methods:', error);
        alert('Error saving payment methods: ' + error.message);
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

// ============================================
// SAVE MAINTENANCE MODE
// ============================================
async function saveMaintenanceMode() {
    try {
        const maintenanceMode = document.getElementById('maintenanceMode').checked;
        
        await db.collection('settings').doc('platform').set({
            maintenanceMode,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        alert('Maintenance mode ' + (maintenanceMode ? 'enabled' : 'disabled') + ' successfully!');
    } catch (error) {
        console.error('Error saving maintenance mode:', error);
        alert('Error saving maintenance mode: ' + error.message);
    }
}
