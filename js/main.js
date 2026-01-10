// ============================================
// NEXUSINVEST - MAIN CONFIGURATION
// ============================================

// Platform Configuration
const PLATFORM_CONFIG = {
    name: 'NexusInvest',
    registrationBonus: 0.50,
    minWithdrawal: 5,
    withdrawalTax: 0.05,
    minDeposit: 5,
    weekendMiningOff: true, // Saturday & Sunday OFF
    withdrawalHours: {
        enabled: true,
        days: [1, 2, 3, 4, 5], // Monday to Friday
        startHour: 9, // 9 AM
        endHour: 21 // 9 PM
    }
};

// Investment Plans Configuration
const INVESTMENT_PLANS = [
    {
        id: 'plan_01',
        name: 'Plan 01 - Starter',
        amount: 5,
        dailyProfit: 0.30,
        totalReturn: 9,
        duration: 30, // 30 DAYS
        roi: 80,
        status: 'open',
        icon: 'fa-seedling',
        badge: 'STARTER',
        description: 'Perfect for beginners starting their crypto mining journey'
    },
    {
        id: 'plan_02',
        name: 'Plan 02 - Basic',
        amount: 12,
        dailyProfit: 0.36,
        totalReturn: 21.60,
        duration: 60, // 60 DAYS
        roi: 80,
        status: 'open',
        icon: 'fa-chart-line',
        badge: 'STANDARD',
        description: 'Steady growth with consistent daily returns'
    },
    {
        id: 'plan_03',
        name: 'Plan 03 - Standard',
        amount: 30,
        dailyProfit: 0.90,
        totalReturn: 54,
        duration: 60, // 60 DAYS
        roi: 80,
        status: 'open',
        icon: 'fa-rocket',
        badge: 'ADVANCED',
        description: 'Advanced mining with higher daily profits'
    },
    {
        id: 'plan_04',
        name: 'Plan 04 - Premium',
        amount: 50,
        dailyProfit: 1.50,
        totalReturn: 90,
        duration: 60, // 60 DAYS
        roi: 80,
        status: 'open',
        icon: 'fa-fire',
        badge: 'POPULAR',
        description: 'Most popular plan with excellent returns'
    },
    {
        id: 'plan_05',
        name: 'Plan 05 - Gold',
        amount: 120,
        dailyProfit: 7.20,
        totalReturn: 216,
        duration: 30, // 30 DAYS
        roi: 80,
        status: 'locked',
        icon: 'fa-crown',
        badge: 'GOLD',
        description: 'Premium gold tier with accelerated profits',
        unlockRequirement: 'Complete 2 investments to unlock'
    },
    {
        id: 'plan_06',
        name: 'Plan 06 - Platinum',
        amount: 250,
        dailyProfit: 7.50,
        totalReturn: 450,
        duration: 60, // 60 DAYS
        roi: 80,
        status: 'locked',
        icon: 'fa-gem',
        badge: 'PLATINUM',
        description: 'Elite platinum mining with maximum efficiency',
        unlockRequirement: 'Complete 3 investments to unlock'
    },
    {
        id: 'plan_07',
        name: 'Plan 07 - Diamond',
        amount: 550,
        dailyProfit: 16.50,
        totalReturn: 990,
        duration: 60, // 60 DAYS
        roi: 80,
        status: 'locked',
        icon: 'fa-diamond',
        badge: 'DIAMOND',
        description: 'Ultimate diamond tier for serious investors',
        unlockRequirement: 'Complete 5 investments to unlock'
    }
];

// Referral Commission Rates (4 Levels)
const REFERRAL_RATES = {
    level1: 0.10, // 10%
    level2: 0.05, // 5%
    level3: 0.02, // 2%
    level4: 0.01  // 1%
};

// Salary Plans Configuration
const SALARY_PLANS = [
    {
        id: 'salary_01',
        name: 'Salary Plan 1',
        minSales: 1000,
        maxSales: 2499,
        weeklySalary: 5,
        icon: 'fa-star',
        badge: 'BRONZE',
        description: 'Earn $5 weekly with $1,000+ direct sales'
    },
    {
        id: 'salary_02',
        name: 'Salary Plan 2',
        minSales: 2500,
        maxSales: 5999,
        weeklySalary: 15,
        icon: 'fa-star',
        badge: 'SILVER',
        description: 'Earn $15 weekly with $2,500+ direct sales'
    },
    {
        id: 'salary_03',
        name: 'Salary Plan 3',
        minSales: 6000,
        maxSales: Infinity,
        weeklySalary: 50,
        icon: 'fa-star',
        badge: 'GOLD',
        description: 'Earn $50 weekly with $6,000+ direct sales'
    }
];

// Withdrawal Rules
const WITHDRAWAL_RULES = {
    minAmount: 5,
    maxPerMonth: 2,
    firstWithdrawalDays: 10,
    secondWithdrawalReferrals: 1,
    taxRate: 0.05,
    processingTime: '24-48 hours',
    allowedDays: [1, 2, 3, 4, 5], // Monday to Friday
    allowedHours: { start: 9, end: 21 } // 9 AM to 9 PM
};

// Payment Methods
const PAYMENT_METHODS = {
    deposit: [
        { id: 'binance', name: 'Binance (USDT)', icon: 'fa-bitcoin', network: 'TRC20' },
        { id: 'jazzcash', name: 'JazzCash', icon: 'fa-mobile-alt' },
        { id: 'easypaisa', name: 'EasyPaisa', icon: 'fa-mobile-alt' }
    ],
    withdrawal: [
        { id: 'binance', name: 'Binance (USDT)', icon: 'fa-bitcoin', network: 'TRC20' },
        { id: 'jazzcash', name: 'JazzCash', icon: 'fa-mobile-alt' },
        { id: 'easypaisa', name: 'EasyPaisa', icon: 'fa-mobile-alt' }
    ]
};

// Helper Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'globalLoader';
    loader.className = 'global-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="spinner"></div>
            <p>Processing...</p>
        </div>
    `;
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('globalLoader');
    if (loader) {
        loader.remove();
    }
}

// Check if weekend
function isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

// Check if withdrawal time is allowed
function isWithdrawalTimeAllowed() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    const isWeekday = day >= 1 && day <= 5;
    const isWithinHours = hour >= 9 && hour < 21;
    
    return isWeekday && isWithinHours;
}

// Get plan by ID
function getPlanById(planId) {
    return INVESTMENT_PLANS.find(plan => plan.id === planId);
}

// Get salary plan by sales amount
function getSalaryPlanBySales(salesAmount) {
    return SALARY_PLANS.find(plan => 
        salesAmount >= plan.minSales && salesAmount <= plan.maxSales
    );
}

// Calculate referral commission
function calculateReferralCommission(amount, level) {
    const rate = REFERRAL_RATES[`level${level}`] || 0;
    return amount * rate;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password
function validatePassword(password) {
    return password.length >= 6;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.PLATFORM_CONFIG = PLATFORM_CONFIG;
    window.INVESTMENT_PLANS = INVESTMENT_PLANS;
    window.REFERRAL_RATES = REFERRAL_RATES;
    window.SALARY_PLANS = SALARY_PLANS;
    window.WITHDRAWAL_RULES = WITHDRAWAL_RULES;
    window.PAYMENT_METHODS = PAYMENT_METHODS;
    window.formatCurrency = formatCurrency;
    window.formatDate = formatDate;
    window.formatDateTime = formatDateTime;
    window.showToast = showToast;
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
    window.isWeekend = isWeekend;
    window.isWithdrawalTimeAllowed = isWithdrawalTimeAllowed;
    window.getPlanById = getPlanById;
    window.getSalaryPlanBySales = getSalaryPlanBySales;
    window.calculateReferralCommission = calculateReferralCommission;
    window.validateEmail = validateEmail;
    window.validatePassword = validatePassword;
    window.copyToClipboard = copyToClipboard;
}
