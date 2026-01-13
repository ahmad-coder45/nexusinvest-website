// ============================================
// DEPOSIT JAVASCRIPT
// ============================================

let currentUser = null;
let selectedMethod = null;
let platformSettings = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    // Load platform settings
    await loadPlatformSettings();
});

// Load platform settings (admin payment details)
async function loadPlatformSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('platform_settings').get();
        if (settingsDoc.exists) {
            platformSettings = settingsDoc.data();
        } else {
            // Default settings if not configured
            platformSettings = {
                binanceWallet: 'YOUR_BINANCE_WALLET_ADDRESS',
                jazzcashIBAN: 'PK00XXXXXXXXXXXXXXXXXXXX',
                easypaisaIBAN: 'PK00XXXXXXXXXXXXXXXXXXXX',
                nayapayIBAN: 'PK00XXXXXXXXXXXXXXXXXXXX',
                sadapayIBAN: 'PK00XXXXXXXXXXXXXXXXXXXX'
            };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Failed to load payment details', 'error');
    }
}

// Select payment method
function selectPaymentMethod(method) {
    selectedMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('selected');
    
    // Show payment details
    showPaymentDetails(method);
    
    // Enable submit button
    document.getElementById('submitBtn').disabled = false;
}

// Show payment details
function showPaymentDetails(method) {
    const detailsDiv = document.getElementById('paymentDetails');
    const contentDiv = document.getElementById('paymentDetailsContent');
    
    let html = '';
    
    switch(method) {
        case 'binance':
            html = `
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div>
                        <label style="font-size: 0.9rem; color: var(--text-gray); display: block; margin-bottom: 0.5rem;">
                            Binance Wallet Address:
                        </label>
                        <div style="display: flex; gap: 0.5rem;">
                            <div class="input-wrapper" style="flex: 1;">
                                <i class="fas fa-wallet input-icon"></i>
                                <input 
                                    type="text" 
                                    value="${platformSettings.binanceWallet}" 
                                    readonly 
                                    class="form-input" 
                                    id="binanceAddress"
                                    style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: var(--white); font-weight: 500;"
                                >
                            </div>
                            <button 
                                onclick="copyToClipboard('${platformSettings.binanceWallet}')" 
                                class="btn btn-accent"
                            >
                                <i class="fas fa-copy"></i> COPY
                            </button>
                        </div>
                    </div>
                    <div style="padding: var(--spacing-sm); background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: #ffaa00;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Send payment to this wallet address and upload the transaction screenshot below
                    </div>
                </div>
            `;
            break;
            
        case 'jazzcash':
            html = `
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div>
                        <label style="font-size: 0.9rem; color: var(--text-gray); display: block; margin-bottom: 0.5rem;">
                            JazzCash IBAN Number:
                        </label>
                        <div style="display: flex; gap: 0.5rem;">
                            <div class="input-wrapper" style="flex: 1;">
                                <i class="fas fa-university input-icon"></i>
                                <input 
                                    type="text" 
                                    value="${platformSettings.jazzcashIBAN}" 
                                    readonly 
                                    class="form-input" 
                                    id="jazzcashIBAN"
                                    style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: var(--white); font-weight: 500;"
                                >
                            </div>
                            <button 
                                onclick="copyToClipboard('${platformSettings.jazzcashIBAN}')" 
                                class="btn btn-accent"
                            >
                                <i class="fas fa-copy"></i> COPY
                            </button>
                        </div>
                    </div>
                    <div style="padding: var(--spacing-sm); background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: #ffaa00;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Send payment to this JazzCash IBAN and upload the transaction screenshot below
                    </div>
                </div>
            `;
            break;
            
        case 'easypaisa':
            html = `
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div>
                        <label style="font-size: 0.9rem; color: var(--text-gray); display: block; margin-bottom: 0.5rem;">
                            EasyPaisa IBAN Number:
                        </label>
                        <div style="display: flex; gap: 0.5rem;">
                            <div class="input-wrapper" style="flex: 1;">
                                <i class="fas fa-university input-icon"></i>
                                <input 
                                    type="text" 
                                    value="${platformSettings.easypaisaIBAN}" 
                                    readonly 
                                    class="form-input" 
                                    id="easypaisaIBAN"
                                    style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: var(--white); font-weight: 500;"
                                >
                            </div>
                            <button 
                                onclick="copyToClipboard('${platformSettings.easypaisaIBAN}')" 
                                class="btn btn-accent"
                            >
                                <i class="fas fa-copy"></i> COPY
                            </button>
                        </div>
                    </div>
                    <div style="padding: var(--spacing-sm); background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: #ffaa00;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Send payment to this EasyPaisa IBAN and upload the transaction screenshot below
                    </div>
                </div>
            `;
            break;
            
        case 'nayapay':
            html = `
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div>
                        <label style="font-size: 0.9rem; color: var(--text-gray); display: block; margin-bottom: 0.5rem;">
                            NayaPay IBAN Number:
                        </label>
                        <div style="display: flex; gap: 0.5rem;">
                            <div class="input-wrapper" style="flex: 1;">
                                <i class="fas fa-university input-icon"></i>
                                <input 
                                    type="text" 
                                    value="${platformSettings.nayapayIBAN}" 
                                    readonly 
                                    class="form-input" 
                                    id="nayapayIBAN"
                                    style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: var(--white); font-weight: 500;"
                                >
                            </div>
                            <button 
                                onclick="copyToClipboard('${platformSettings.nayapayIBAN}')" 
                                class="btn btn-accent"
                            >
                                <i class="fas fa-copy"></i> COPY
                            </button>
                        </div>
                    </div>
                    <div style="padding: var(--spacing-sm); background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: #ffaa00;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Send payment to this NayaPay IBAN and upload the transaction screenshot below
                    </div>
                </div>
            `;
            break;
            
        case 'sadapay':
            html = `
                <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                    <div>
                        <label style="font-size: 0.9rem; color: var(--text-gray); display: block; margin-bottom: 0.5rem;">
                            SadaPay IBAN Number:
                        </label>
                        <div style="display: flex; gap: 0.5rem;">
                            <div class="input-wrapper" style="flex: 1;">
                                <i class="fas fa-university input-icon"></i>
                                <input 
                                    type="text" 
                                    value="${platformSettings.sadapayIBAN}" 
                                    readonly 
                                    class="form-input" 
                                    id="sadapayIBAN"
                                    style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: var(--white); font-weight: 500;"
                                >
                            </div>
                            <button 
                                onclick="copyToClipboard('${platformSettings.sadapayIBAN}')" 
                                class="btn btn-accent"
                            >
                                <i class="fas fa-copy"></i> COPY
                            </button>
                        </div>
                    </div>
                    <div style="padding: var(--spacing-sm); background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: #ffaa00;">
                        <i class="fas fa-exclamation-triangle"></i> 
                        Send payment to this SadaPay IBAN and upload the transaction screenshot below
                    </div>
                </div>
            `;
            break;
    }
    
    contentDiv.innerHTML = html;
    detailsDiv.style.display = 'block';
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Handle deposit form submission
const depositForm = document.getElementById('depositForm');
if (depositForm) {
    depositForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedMethod) {
            showToast('Please select a payment method', 'error');
            return;
        }
        
        const amount = parseFloat(document.getElementById('amount').value);
        const proofFile = document.getElementById('proofFile').files[0];
        
        // Validation
        if (amount < 5) {
            showToast('Minimum deposit amount is $5', 'error');
            return;
        }
        
        if (!proofFile) {
            showToast('Please upload payment proof', 'error');
            return;
        }
        
        // Check file size (max 5MB)
        if (proofFile.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        // Check file type
        if (!proofFile.type.startsWith('image/')) {
            showToast('Please upload an image file', 'error');
            return;
        }
        
        // Show loading
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            // Convert image to base64 (temporary solution without Firebase Storage)
            const proofBase64 = await fileToBase64(proofFile);
            
            // Create deposit request with base64 image
            await db.collection('deposits').add({
                userId: currentUser.uid,
                amount: amount,
                method: selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1),
                proofBase64: proofBase64, // Store as base64 temporarily
                proofFileName: proofFile.name,
                proofFileType: proofFile.type,
                status: 'pending',
                rejectionReason: '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                approvedAt: null,
                approvedBy: null,
                receiptUrl: null,
                note: 'Payment proof stored as base64 (Firebase Storage not enabled)'
            });
            
            showToast('Deposit request submitted successfully! Waiting for admin approval.', 'success');
            
            // Reset form
            depositForm.reset();
            document.getElementById('fileName').innerHTML = '';
            document.getElementById('paymentDetails').style.display = 'none';
            document.querySelectorAll('.payment-method-card').forEach(card => {
                card.classList.remove('selected');
            });
            selectedMethod = null;
            
            // Redirect to transactions after 2 seconds
            setTimeout(() => {
                window.location.href = 'transactions.html';
            }, 2000);
            
        } catch (error) {
            console.error('Deposit error:', error);
            showToast('Failed to submit deposit request. Please try again.', 'error');
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Deposit Request';
        }
    });
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    });
}

// Export function
window.selectPaymentMethod = selectPaymentMethod;
window.copyToClipboard = copyToClipboard;
