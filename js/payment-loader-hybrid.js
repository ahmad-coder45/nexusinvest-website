// ============================================
// HYBRID APPROACH - BEST OF BOTH WORLDS
// ============================================
// Combines: Firestore (for admin UI) + Config file (for fallback)
// Result: Admin can manage via UI, but has fallback if Firestore fails

// ============================================
// FALLBACK CONFIG (In case Firestore fails)
// ============================================

const FALLBACK_PAYMENT_METHODS = [
    {
        id: 'binance',
        name: 'Binance',
        subtitle: 'USDT (TRX Network)',
        icon: 'fab fa-bitcoin',
        color: '#F3BA2F',
        type: 'wallet',
        accountDetails: 'TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK',
        active: true
    },
    {
        id: 'nayapay',
        name: 'NayaPay',
        subtitle: 'Digital Bank',
        icon: 'fas fa-university',
        color: '#00D4FF',
        type: 'iban',
        accountDetails: 'PK36NAYA0000001234567890',
        active: true
    }
];

// ============================================
// LOAD WITH FALLBACK
// ============================================

async function loadPaymentMethodsHybrid() {
    try {
        // Try Firestore first
        const snapshot = await db.collection('paymentMethods')
            .where('active', '==', true)
            .orderBy('createdAt', 'asc')
            .get();
        
        if (!snapshot.empty) {
            const methods = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                methods.push({
                    id: data.method,
                    name: getMethodInfo(data.method).name,
                    subtitle: getMethodInfo(data.method).subtitle,
                    icon: getMethodInfo(data.method).icon,
                    color: getMethodInfo(data.method).color,
                    type: getMethodInfo(data.method).type,
                    accountDetails: data.accountDetails,
                    active: true
                });
            });
            
            console.log('✅ Loaded from Firestore');
            return methods;
        }
        
        // If empty, use fallback
        console.log('⚠️ Firestore empty, using fallback');
        return FALLBACK_PAYMENT_METHODS.filter(m => m.active);
        
    } catch (error) {
        console.error('❌ Firestore error, using fallback:', error);
        return FALLBACK_PAYMENT_METHODS.filter(m => m.active);
    }
}

// ============================================
// METHOD INFO HELPER
// ============================================

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
// RENDER WITH RETRY
// ============================================

async function renderPaymentMethodsHybrid(retries = 3) {
    let methods = [];
    
    for (let i = 0; i < retries; i++) {
        methods = await loadPaymentMethodsHybrid();
        
        if (methods.length > 0) {
            break;
        }
        
        console.log(`Retry ${i + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const container = document.getElementById('paymentMethodsContainer');
    container.innerHTML = '';
    
    if (methods.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #ff6b00;"></i>
                <p>Unable to load payment methods</p>
                <p style="font-size: 0.85rem; margin-top: 0.5rem;">Please contact support</p>
            </div>
        `;
        return;
    }
    
    methods.forEach(method => {
        const card = document.createElement('div');
        card.className = 'payment-method-card';
        card.setAttribute('data-method', method.id);
        card.onclick = () => selectPaymentMethod(method);
        
        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <div style="font-size: 2rem; color: ${method.color};">
                    <i class="${method.icon}"></i>
                </div>
                <div>
                    <h4 style="margin: 0;">${method.name}</h4>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-gray);">${method.subtitle}</p>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ============================================
// CACHE LAYER (Optional)
// ============================================

let cachedMethods = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function loadPaymentMethodsWithCache() {
    const now = Date.now();
    
    // Return cache if valid
    if (cachedMethods && cacheTime && (now - cacheTime) < CACHE_DURATION) {
        console.log('✅ Using cached methods');
        return cachedMethods;
    }
    
    // Load fresh data
    const methods = await loadPaymentMethodsHybrid();
    
    // Update cache
    cachedMethods = methods;
    cacheTime = now;
    
    return methods;
}

// ============================================
// HOW TO USE:
// ============================================

/*
1. NORMAL OPERATION:
   - Admin adds methods via Settings page
   - Stored in Firestore
   - Users see methods from Firestore
   - Everything works as before

2. IF FIRESTORE FAILS:
   - Automatically falls back to config
   - Users still see payment methods
   - No downtime!

3. TO UPDATE FALLBACK:
   - Edit FALLBACK_PAYMENT_METHODS array
   - Deploy once
   - Fallback is updated

4. BEST PRACTICE:
   - Keep fallback in sync with Firestore
   - Update fallback when adding new methods
   - Test fallback occasionally
*/

// ============================================
// PROS:
// ============================================
// ✅ Admin UI for easy management
// ✅ Fallback if Firestore fails
// ✅ No downtime
// ✅ Cached for performance
// ✅ Retry logic
// ✅ Best reliability

// ============================================
// CONS:
// ============================================
// ❌ Slightly more complex
// ❌ Need to maintain fallback
// ❌ Two sources of truth
