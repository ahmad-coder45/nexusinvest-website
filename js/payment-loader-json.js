// ============================================
// LOAD PAYMENT METHODS FROM JSON FILE
// ============================================

async function loadPaymentMethodsFromJSON() {
    try {
        const response = await fetch('/payment-methods.json');
        const data = await response.json();
        
        // Get only active methods
        const activeMethods = data.methods
            .filter(method => method.active)
            .sort((a, b) => a.order - b.order);
        
        return {
            methods: activeMethods,
            settings: data.settings
        };
        
    } catch (error) {
        console.error('Error loading payment methods:', error);
        return { methods: [], settings: {} };
    }
}

// ============================================
// USAGE IN DEPOSIT.JS
// ============================================

async function renderPaymentMethods() {
    const { methods, settings } = await loadPaymentMethodsFromJSON();
    
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
// HOW TO USE:
// ============================================

/*
1. TO ADD NEW METHOD:
   - Open payment-methods.json
   - Copy any method object
   - Change id, name, accountDetails
   - Set active: true
   - Save and deploy

2. TO REMOVE METHOD:
   - Open payment-methods.json
   - Set active: false
   OR
   - Delete the entire object

3. TO CHANGE ACCOUNT:
   - Open payment-methods.json
   - Edit accountDetails
   - Save and deploy

4. DEPLOY:
   firebase deploy --only hosting

5. NO CODE CHANGES NEEDED!
   Just edit the JSON file
*/

// ============================================
// PROS:
// ============================================
// ✅ Very easy to edit (just JSON)
// ✅ No JavaScript knowledge needed
// ✅ Can use online JSON editors
// ✅ Fast loading
// ✅ Version controlled

// ============================================
// CONS:
// ============================================
// ❌ Need to redeploy
// ❌ Can't change from admin panel
// ❌ Need file access
