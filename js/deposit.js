// ============================================
// DEPOSIT JAVASCRIPT - DYNAMIC PAYMENT METHODS
// ============================================

let currentUser = null;
let selectedMethod = null;
let paymentMethods = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    // Load payment methods dynamically
    await loadPaymentMethods();
    
    // File upload handler
    document.getElementById('proofFile').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('fileName').textContent = `Selected: ${file.name}`;
        }
    });
});

// ============================================
// LOAD PAYMENT METHODS DYNAMICALLY
// ============================================
async function loadPaymentMethods() {
    try {
        const methodsSnapshot = await db.collection('paymentMethods')
            .where('active', '==', true)
            .orderBy('createdAt', 'asc')
            .get();
        
        const methodsContainer = document.querySelector('.payment-method-card').parentElement;
        methodsContainer.innerHTML = '';
        
        if (methodsSnapshot.empty) {
            methodsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                    <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No payment methods available at the moment</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">Please contact support</p>
                </div>
            `;
            return;
        }
        
        paymentMethods = [];
        
        methodsSnapshot.forEach(doc => {
            const method = doc.data();
            method.id = doc.id;
            paymentMethods.push(method);
            
            const methodInfo = getMethodInfo(method.method);
            
            const card = document.createElement('div');
            card.className = 'payment-method-card';
            card.setAttribute('data-method', method.method);
            card.onclick = () => selectPaymentMethod(method.method, method.accountDetails);
            
            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                    <div style="font-size: 2rem; color: ${methodInfo.color};">
                        <i class="${methodInfo.icon}"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0;">${methodInfo.name}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-gray);">${methodInfo.subtitle}</p>
                    </div>
                </div>
            `;
            
            methodsContainer.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading payment methods:', error);
        showToast('Failed to load payment methods', 'error');
    }
}

// Get method info (name, icon, color, subtitle)
function getMethodInfo(method) {
    const methodMap = {
        'binance': { 
            name: 'Binance', 
            subtitle: 'USDT (TRX Network)', 
            icon: 'fab fa-bitcoin', 
            color: '#F3BA2F',
            type: 'wallet'
        },
        'jazzcash': { 
            name: 'JazzCash', 
            subtitle: 'Mobile Wallet', 
            icon: 'fas fa-mobile-alt', 
            color: '#FF6B00',
            type: 'iban'
        },
        'easypaisa': { 
            name: 'EasyPaisa', 
            subtitle: 'Mobile Wallet', 
            icon: 'fas fa-wallet', 
            color: '#00A859',
            type: 'iban'
        },
        'nayapay': { 
            name: 'NayaPay', 
            subtitle: 'Digital Bank', 
            icon: 'fas fa-university', 
            color: '#00D4FF',
            type: 'iban'
        },
        'sadapay': { 
            name: 'SadaPay', 
            subtitle: 'Digital Bank', 
            icon: 'fas fa-credit-card', 
            color: '#7C3AED',
            type: 'iban'
        },
        'bank': { 
            name: 'Bank Account', 
            subtitle: 'Bank Transfer', 
            icon: 'fas fa-building-columns', 
            color: '#4A90E2',
            type: 'iban'
        }
    };
    
    return methodMap[method] || { 
        name: method, 
        subtitle: 'Payment Method', 
        icon: 'fas fa-money-bill', 
        color: '#888',
        type: 'iban'
    };
}

// ============================================
// SELECT PAYMENT METHOD
// ============================================
function selectPaymentMethod(method, accountDetails) {
    selectedMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('selected');
    
    // Show payment details
    showPaymentDetails(method, accountDetails);
    
    // Enable submit button
    document.getElementById('submitBtn').disabled = false;
}

// ============================================
// SHOW PAYMENT DETAILS
// ============================================
function showPaymentDetails(method, accountDetails) {
    const detailsDiv = document.getElementById('paymentDetails');
    const contentDiv = document.getElementById('paymentDetailsContent');
    
    const methodInfo = getMethodInfo(method);
    
    let html = '';
    
    if (methodInfo.type === 'wallet') {
        // Binance wallet address
        html = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                <div>
                    <label style="font-size: 0.9rem; color: var(--text-gray); display: block; margin-bottom: 0.5rem;">
                        Wallet Address (TRX Network):
                    </label>
                    <div style="display: flex; gap: 0.5rem;">
                        <div class="input-wrapper" style="flex: 1;">
                            <i class="fas fa-wallet input-icon"></i>
                            <input 
                                type="text" 
                                value="${accountDetails}" 
                                readonly 
                                class="form-input" 
                                id="paymentAddress"
                                style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: var(--white); font-weight: 500;"
                            >
                        </div>
                        <button 
                            onclick="copyToClipboard('${accountDetails}')" 
                            class="btn btn-accent"
                        >
                            <i class="fas fa-copy"></i> COPY
                        </button>
                    </div>
                </div>
                <div style="padding: var(--spacing-sm); background: rgba(255, 170, 0, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: #ffaa00;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <strong>Important:</strong> Send USDT via <strong>TRX (Tron) Network</strong> only. Other networks will result in loss of funds.
                </div>
            </div>
        `;
    } else {
        // IBAN for other methods
        html = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                <div>
                    <label style="font-size: 0.9rem; color: var(--text-gray); display: block; margin-bottom: 0.5rem;">
                        IBAN Number:
                    </label>
                    <div style="display: flex; gap: 0.5rem;">
                        <div class="input-wrapper" style="flex: 1;">
                            <i class="fas fa-university input-icon"></i>
                            <input 
                                type="text" 
                                value="${accountDetails}" 
                                readonly 
                                class="form-input" 
                                id="paymentAddress"
                                style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.2); color: var(--white); font-weight: 500; font-family: 'Courier New', monospace;"
                            >
                        </div>
                        <button 
                            onclick="copyToClipboard('${accountDetails}')" 
                            class="btn btn-accent"
                        >
                            <i class="fas fa-copy"></i> COPY
                        </button>
                    </div>
                </div>
                <div style="padding: var(--spacing-sm); background: rgba(0, 255, 136, 0.1); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--neon-green);">
                    <i class="fas fa-info-circle"></i> 
                    Send payment to this IBAN and upload the transaction screenshot below
                </div>
            </div>
        `;
    }
    
    contentDiv.innerHTML = html;
    detailsDiv.style.display = 'block';
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Failed to copy', 'error');
    });
}

// ============================================
// HANDLE DEPOSIT FORM SUBMISSION
// ============================================
document.getElementById('depositForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!selectedMethod) {
        showToast('Please select a payment method', 'error');
        return;
    }
    
    const amount = parseFloat(document.getElementById('amount').value);
    const proofFile = document.getElementById('proofFile').files[0];
    
    // Validation
    if (!amount || amount < 5) {
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
    
    try {
        showLoading();
        
        // Convert image to base64
        const base64Image = await fileToBase64(proofFile);
        
        // Get user data
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        
        // Create deposit request
        await db.collection('deposits').add({
            userId: currentUser.uid,
            userName: userData.fullName,
            userEmail: userData.email,
            amount: amount,
            method: selectedMethod,
            proofImage: base64Image,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            requestedAt: new Date().toISOString()
        });
        
        // Create transaction record
        await db.collection('transactions').add({
            userId: currentUser.uid,
            type: 'deposit',
            amount: amount,
            method: selectedMethod,
            status: 'pending',
            description: `Deposit request via ${selectedMethod}`,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoading();
        showToast('Deposit request submitted successfully!', 'success');
        
        // Reset form
        document.getElementById('depositForm').reset();
        document.getElementById('fileName').textContent = '';
        document.getElementById('paymentDetails').style.display = 'none';
        document.getElementById('submitBtn').disabled = true;
        
        // Remove selected class
        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        selectedMethod = null;
        
    } catch (error) {
        console.error('Error submitting deposit:', error);
        hideLoading();
        showToast('Failed to submit deposit request', 'error');
    }
});

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ============================================
// USD TO PKR CONVERSION
// ============================================
const USD_TO_PKR = 280;

document.getElementById('amount').addEventListener('input', (e) => {
    const amount = parseFloat(e.target.value) || 0;
    const pkr = amount * USD_TO_PKR;
    
    const pkrHint = document.getElementById('pkrHint');
    if (pkrHint) {
        if (amount > 0) {
            pkrHint.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>≈ ₨${pkr.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PKR</span>
            `;
            pkrHint.style.color = 'var(--neon-green)';
        } else {
            pkrHint.innerHTML = `
                <i class="fas fa-sync-alt"></i>
                <span>Enter amount to see PKR equivalent</span>
            `;
            pkrHint.style.color = 'var(--text-gray)';
        }
    }
});
