// ============================================
// PROFILE JAVASCRIPT
// ============================================

let currentUser = null;
let userData = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    await loadProfileData();
});

async function loadProfileData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        userData = userDoc.data();
        
        // Fill form
        document.getElementById('fullName').value = userData.fullName || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';
        
        // Account stats
        const memberSince = userData.createdAt?.toDate();
        document.getElementById('memberSince').textContent = memberSince ? formatDate(memberSince) : 'N/A';
        document.getElementById('referralCode').textContent = userData.referralCode || 'N/A';
        
        // Email verification status
        if (currentUser.emailVerified) {
            document.getElementById('emailVerified').innerHTML = '<i class="fas fa-check-circle" style="color: var(--neon-green);"></i> Verified';
        } else {
            document.getElementById('emailVerified').innerHTML = '<i class="fas fa-times-circle" style="color: #ff4444;"></i> Not Verified';
        }
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Failed to load profile data', 'error');
    }
}

// Update profile
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!fullName) {
            showToast('Please enter your full name', 'error');
            return;
        }
        
        const updateBtn = document.getElementById('updateBtn');
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        
        try {
            await db.collection('users').doc(currentUser.uid).update({
                fullName: fullName,
                phone: phone
            });
            
            showToast('Profile updated successfully!', 'success');
            
            updateBtn.disabled = false;
            updateBtn.innerHTML = '<i class="fas fa-save"></i> Update Profile';
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile', 'error');
            
            updateBtn.disabled = false;
            updateBtn.innerHTML = '<i class="fas fa-save"></i> Update Profile';
        }
    });
}

// Change password
const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!validatePassword(newPassword)) {
            showToast('Password must be at least 8 characters with 1 number and 1 special character', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        const passwordBtn = document.getElementById('passwordBtn');
        passwordBtn.disabled = true;
        passwordBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
        
        try {
            // Re-authenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                currentPassword
            );
            
            await currentUser.reauthenticateWithCredential(credential);
            
            // Update password
            await currentUser.updatePassword(newPassword);
            
            showToast('Password changed successfully!', 'success');
            
            // Reset form
            passwordForm.reset();
            
            passwordBtn.disabled = false;
            passwordBtn.innerHTML = '<i class="fas fa-key"></i> Change Password';
            
        } catch (error) {
            console.error('Error changing password:', error);
            let errorMessage = 'Failed to change password';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Current password is incorrect';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'New password is too weak';
            }
            
            showToast(errorMessage, 'error');
            
            passwordBtn.disabled = false;
            passwordBtn.innerHTML = '<i class="fas fa-key"></i> Change Password';
        }
    });
}

function copyReferralCode() {
    const code = document.getElementById('referralCode').textContent;
    navigator.clipboard.writeText(code);
    showToast('Referral code copied!', 'success');
}

window.copyReferralCode = copyReferralCode;
