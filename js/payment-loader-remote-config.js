// ============================================
// LOAD PAYMENT METHODS FROM FIREBASE REMOTE CONFIG
// ============================================
// Best for: Instant updates without deployment
// Perfect for: Mobile apps and web apps

// ============================================
// SETUP INSTRUCTIONS:
// ============================================

/*
1. ENABLE REMOTE CONFIG:
   - Go to Firebase Console
   - Select your project
   - Click "Remote Config" in left menu
   - Click "Create configuration"

2. ADD PARAMETER:
   - Parameter key: payment_methods
   - Default value: (JSON below)
   - Description: Active payment methods
   - Click "Publish changes"

3. JSON VALUE:
{
  "methods": [
    {
      "id": "binance",
      "name": "Binance",
      "subtitle": "USDT (TRX Network)",
      "icon": "fab fa-bitcoin",
      "color": "#F3BA2F",
      "type": "wallet",
      "accountDetails": "TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK",
      "active": true
    },
    {
      "id": "nayapay",
      "name": "NayaPay",
      "subtitle": "Digital Bank",
      "icon": "fas fa-university",
      "color": "#00D4FF",
      "type": "iban",
      "accountDetails": "PK36NAYA0000001234567890",
      "active": true
    }
  ]
}
*/

// ============================================
// INITIALIZE REMOTE CONFIG
// ============================================

const remoteConfig = firebase.remoteConfig();

// Set config settings
remoteConfig.settings = {
    minimumFetchIntervalMillis: 3600000, // 1 hour
    fetchTimeoutMillis: 60000 // 1 minute
};

// Set default values
remoteConfig.defaultConfig = {
    payment_methods: JSON.stringify({
        methods: [
            {
                id: 'binance',
                name: 'Binance',
                subtitle: 'USDT (TRX Network)',
                icon: 'fab fa-bitcoin',
                color: '#F3BA2F',
                type: 'wallet',
                accountDetails: 'TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK',
                active: true
            }
        ]
    })
};

// ============================================
// LOAD PAYMENT METHODS
// ============================================

async function loadPaymentMethodsFromRemoteConfig() {
    try {
        // Fetch and activate
        await remoteConfig.fetchAndActivate();
        
        // Get payment methods
        const paymentMethodsJson = remoteConfig.getString('payment_methods');
        const data = JSON.parse(paymentMethodsJson);
        
        // Filter active methods
        const activeMethods = data.methods.filter(m => m.active);
        
        return activeMethods;
        
    } catch (error) {
        console.error('Error loading from Remote Config:', error);
        
        // Fallback to default
        const defaultJson = remoteConfig.defaultConfig.payment_methods;
        const data = JSON.parse(defaultJson);
        return data.methods.filter(m => m.active);
    }
}

// ============================================
// RENDER PAYMENT METHODS
// ============================================

async function renderPaymentMethodsFromRemoteConfig() {
    const methods = await loadPaymentMethodsFromRemoteConfig();
    
    const container = document.getElementById('paymentMethodsContainer');
    container.innerHTML = '';
    
    if (methods.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-gray);">
                <i class="fas fa-info-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>No payment methods available</p>
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
// AUTO-REFRESH (Optional)
// ============================================

// Refresh every hour
setInterval(async () => {
    console.log('Checking for payment method updates...');
    await renderPaymentMethodsFromRemoteConfig();
}, 3600000); // 1 hour

// ============================================
// HOW TO USE:
// ============================================

/*
1. TO ADD NEW METHOD:
   - Go to Firebase Console → Remote Config
   - Edit "payment_methods" parameter
   - Add new method to JSON array
   - Click "Publish changes"
   - Changes appear within 1 hour (or force refresh)

2. TO REMOVE METHOD:
   - Go to Firebase Console → Remote Config
   - Edit "payment_methods" parameter
   - Set active: false or remove from array
   - Click "Publish changes"

3. TO CHANGE ACCOUNT:
   - Go to Firebase Console → Remote Config
   - Edit "payment_methods" parameter
   - Update accountDetails
   - Click "Publish changes"

4. INSTANT UPDATES:
   - No deployment needed!
   - Changes propagate automatically
   - Users see updates within 1 hour
   - Or force refresh: remoteConfig.fetchAndActivate()
*/

// ============================================
// ADVANCED: FORCE REFRESH BUTTON
// ============================================

async function forceRefreshPaymentMethods() {
    showLoading();
    
    // Force fetch (ignore cache)
    remoteConfig.settings.minimumFetchIntervalMillis = 0;
    
    await renderPaymentMethodsFromRemoteConfig();
    
    // Reset to 1 hour
    remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
    
    hideLoading();
    showToast('Payment methods updated!', 'success');
}

// Add refresh button to admin panel
/*
<button onclick="forceRefreshPaymentMethods()">
    <i class="fas fa-sync-alt"></i> Refresh Payment Methods
</button>
*/

// ============================================
// PROS:
// ============================================
// ✅ Instant updates (no deployment)
// ✅ Change from Firebase Console
// ✅ Can A/B test different methods
// ✅ Can target specific users
// ✅ Version history
// ✅ Rollback capability
// ✅ Works great with mobile apps
// ✅ Free tier: 10,000 requests/day

// ============================================
// CONS:
// ============================================
// ❌ Requires Firebase setup
// ❌ Updates not instant (1 hour cache)
// ❌ JSON editing in console (not UI)
// ❌ Slightly more complex setup
