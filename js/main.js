// ============================================
// MAIN JAVASCRIPT - UTILITIES & CONSTANTS
// ============================================

// Investment Plans Configuration
const INVESTMENT_PLANS = [
    {
        id: 1,
        name: 'Plan 01 - Starter',
        amount: 5,
        dailyProfit: 0.30,
        totalReturn: 9,
        duration: 30,
        locked: false
    },
    {
        id: 2,
        name: 'Plan 02 - Basic',
        amount: 12,
        dailyProfit: 0.36,
        totalReturn: 21.6,
        duration: 60,
        locked: false
    },
    {
        id: 3,
        name: 'Plan 03 - Standard',
        amount: 30,
        dailyProfit: 0.90,
        totalReturn: 54,
        duration: 60,
        locked: false
    },
    {
        id: 4,
        name: 'Plan 04 - Premium',
        amount: 50,
        dailyProfit: 1.50,
        totalReturn: 90,
        duration: 60,
        locked: false
    },
    {
        id: 5,
        name: 'Plan 05 - Gold (Locked)',
        amount: 120,
        dailyProfit: 7.20,
        totalReturn: 216,
        duration: 30,
        locked: true
    },
    {
        id: 6,
        name: 'Plan 06 - Platinum (Locked)',
        amount: 250,
        dailyProfit: 7.50,
        totalReturn: 450,
        duration: 60,
        locked: true
    },
    {
        id: 7,
        name: 'Plan 07 - Diamond (Locked)',
        amount: 550,
        dailyProfit: 16.50,
        totalReturn: 990,
        duration: 60,
        locked: true
    }
];

// Platform Configuration
const PLATFORM_CONFIG = {
    registrationBonus: 0.50,
    minWithdrawal: 5,
    withdrawalTax: 0.05, // 5%
    minDeposit: 5,
    weekendOff: true, // Saturday & Sunday off
    maxWithdrawalsPerMonth: 2,
    firstWithdrawalDays: 10,
    secondWithdrawalReferrals: 1
};

// Referral Commission Rates (4 levels)
const REFERRAL_RATES = {
    level1: 0.10, // 10%
    level2: 0.05, // 5%
    level3: 0.02, // 2%
    level4: 0.01  // 1%
};

// Salary Plans
const SALARY_PLANS = [
    {
        plan: 1,
        minSales: 1000,
        maxSales: 2499,
        weeklySalary: 5
    },
    {
        plan: 2,
        minSales: 2500,
        maxSales: 5999,
        weeklySalary: 15
    },
    {
        plan: 3,
        minSales: 6000,
        maxSales: Infinity,
        weeklySalary: 50
    }
];

// Check if today is weekend (Saturday or Sunday)
function isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Format date and time
function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Show toast notification
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
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Show loading overlay
function showLoading() {
    const loading = document.createElement('div');
    loading.id = 'loadingOverlay';
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="spinner"></div>
        <p>Processing...</p>
    `;
    document.body.appendChild(loading);
}

// Hide loading overlay
function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        document.body.removeChild(loading);
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Mobile menu toggle
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');

if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
        
        const icon = navbarToggle.querySelector('i');
        if (navbarMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navbarToggle.contains(e.target) && !navbarMenu.contains(e.target)) {
            navbarMenu.classList.remove('active');
            const icon = navbarToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('Copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Get plan by ID
function getPlanById(planId) {
    return INVESTMENT_PLANS.find(plan => plan.id === planId);
}

// Get salary plan by sales amount
function getSalaryPlan(directSales) {
    return SALARY_PLANS.find(plan => 
        directSales >= plan.minSales && directSales <= plan.maxSales
    );
}

// Calculate withdrawal tax
function calculateWithdrawalTax(amount) {
    return amount * PLATFORM_CONFIG.withdrawalTax;
}

// Calculate net withdrawal amount
function calculateNetWithdrawal(amount) {
    const tax = calculateWithdrawalTax(amount);
    return amount - tax;
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
function validatePassword(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (password.length < minLength) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return { valid: false, message: 'Password must contain uppercase, lowercase, and numbers' };
    }
    
    return { valid: true, message: 'Strong password' };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        INVESTMENT_PLANS,
        PLATFORM_CONFIG,
        REFERRAL_RATES,
        SALARY_PLANS,
        isWeekend,
        formatCurrency,
        formatDate,
        formatDateTime,
        showToast,
        showLoading,
        hideLoading,
        copyToClipboard,
        getPlanById,
        getSalaryPlan,
        calculateWithdrawalTax,
        calculateNetWithdrawal,
        isValidEmail,
        validatePassword
    };
}
