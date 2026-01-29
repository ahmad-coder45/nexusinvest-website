// ============================================
// LOAD PAYMENT METHODS FROM GOOGLE SHEETS
// ============================================
// Perfect for non-technical users!
// Edit payment methods in Google Sheets like Excel

// ============================================
// SETUP INSTRUCTIONS:
// ============================================

/*
1. CREATE GOOGLE SHEET:
   - Go to: https://sheets.google.com
   - Create new spreadsheet
   - Name it: "NexusInvest Payment Methods"

2. ADD COLUMNS (Row 1):
   A: method
   B: name
   C: subtitle
   D: icon
   E: color
   F: type
   G: accountDetails
   H: active

3. ADD DATA (Example Row 2):
   A: binance
   B: Binance
   C: USDT (TRX Network)
   D: fab fa-bitcoin
   E: #F3BA2F
   F: wallet
   G: TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK
   H: TRUE

4. PUBLISH SHEET:
   - File → Share → Publish to web
   - Select: Entire Document
   - Format: CSV
   - Click: Publish
   - Copy the URL

5. UPDATE CODE:
   - Replace SHEET_URL below with your URL
*/

// ============================================
// CONFIGURATION
// ============================================

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv';

// ============================================
// LOAD FROM GOOGLE SHEETS
// ============================================

async function loadPaymentMethodsFromSheets() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        // Parse CSV
        const rows = csvText.split('\n').slice(1); // Skip header
        const methods = [];
        
        rows.forEach(row => {
            const cols = row.split(',');
            
            if (cols.length >= 8 && cols[7].toLowerCase() === 'true') {
                methods.push({
                    id: cols[0].trim(),
                    name: cols[1].trim(),
                    subtitle: cols[2].trim(),
                    icon: cols[3].trim(),
                    color: cols[4].trim(),
                    type: cols[5].trim(),
                    accountDetails: cols[6].trim(),
                    active: true
                });
            }
        });
        
        return methods;
        
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        return [];
    }
}

// ============================================
// RENDER PAYMENT METHODS
// ============================================

async function renderPaymentMethodsFromSheets() {
    const methods = await loadPaymentMethodsFromSheets();
    
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
// GOOGLE SHEETS TEMPLATE
// ============================================

/*
COPY THIS TO YOUR GOOGLE SHEET:

method          | name      | subtitle              | icon              | color   | type   | accountDetails                      | active
----------------|-----------|----------------------|-------------------|---------|--------|-------------------------------------|-------
binance         | Binance   | USDT (TRX Network)   | fab fa-bitcoin    | #F3BA2F | wallet | TXn7Y8WL9sZ3bVjviGfR5pNuySwV8Mf3kK | TRUE
jazzcash        | JazzCash  | Mobile Wallet        | fas fa-mobile-alt | #FF6B00 | iban   | PK00JAZZ0000001234567890            | TRUE
easypaisa       | EasyPaisa | Mobile Wallet        | fas fa-wallet     | #00A859 | iban   | PK00EASY0000001234567890            | TRUE
nayapay         | NayaPay   | Digital Bank         | fas fa-university | #00D4FF | iban   | PK36NAYA0000001234567890            | TRUE
sadapay         | SadaPay   | Digital Bank         | fas fa-credit-card| #7C3AED | iban   | PK00SADA0000001234567890            | FALSE
*/

// ============================================
// HOW TO USE:
// ============================================

/*
1. TO ADD NEW METHOD:
   - Open Google Sheet
   - Add new row
   - Fill in all columns
   - Set active to TRUE
   - Changes appear immediately (no deploy!)

2. TO REMOVE METHOD:
   - Open Google Sheet
   - Change active to FALSE
   OR
   - Delete the row

3. TO CHANGE ACCOUNT:
   - Open Google Sheet
   - Edit accountDetails column
   - Changes appear immediately!

4. NO DEPLOYMENT NEEDED!
   - Just edit the sheet
   - Refresh user page
   - Changes appear instantly
*/

// ============================================
// PROS:
// ============================================
// ✅ Super easy to edit (like Excel)
// ✅ No technical knowledge needed
// ✅ Changes appear instantly (no deploy)
// ✅ Can share with team
// ✅ Can edit from phone
// ✅ Version history in Google Sheets
// ✅ Can add comments/notes

// ============================================
// CONS:
// ============================================
// ❌ Requires Google account
// ❌ Sheet must be public
// ❌ Slightly slower loading
// ❌ Depends on Google Sheets API
