// ============================================
// SALARY JAVASCRIPT
// ============================================

let currentUser = null;
let userData = null;

const salaryPlans = [
    { plan: 0, min: 0, max: 49, salary: 0 },
    { plan: 1, min: 50, max: 99, salary: 5 },
    { plan: 2, min: 100, max: 249, salary: 10 },
    { plan: 3, min: 250, max: 499, salary: 20 },
    { plan: 4, min: 500, max: Infinity, salary: 40 }
];

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    await loadSalaryData();
});

async function loadSalaryData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        userData = userDoc.data();
        
        const directSales = userData.directSales || 0;
        const currentPlan = userData.salaryPlan || 0;
        const totalSalary = userData.totalSalary || 0;
        const lastPayment = userData.lastSalaryPayment?.toDate();
        
        // Update stats
        document.getElementById('directSales').textContent = formatCurrency(directSales);
        document.getElementById('totalSalary').textContent = formatCurrency(totalSalary);
        document.getElementById('lastPayment').textContent = lastPayment ? formatDate(lastPayment) : 'Never';
        
        // Calculate next payment (every Sunday)
        const nextSunday = getNextSunday();
        document.getElementById('nextPayment').textContent = formatDate(nextSunday);
        
        // Update current plan
        const currentSalaryPlan = salaryPlans.find(p => p.plan === currentPlan);
        if (currentPlan === 0) {
            document.getElementById('currentPlanText').textContent = 'No active salary plan';
            document.getElementById('weeklySalary').textContent = '$0';
        } else {
            document.getElementById('currentPlanText').textContent = `Plan ${currentPlan} - Earning $${currentSalaryPlan.salary} weekly`;
            document.getElementById('weeklySalary').textContent = `$${currentSalaryPlan.salary}`;
        }
        
        // Update progress bars
        updateProgressBars(directSales, currentPlan);
        
    } catch (error) {
        console.error('Error loading salary data:', error);
        showToast('Failed to load salary data', 'error');
    }
}

function updateProgressBars(directSales, currentPlan) {
    salaryPlans.forEach((plan, index) => {
        if (index === 0) return; // Skip plan 0
        
        const progressBar = document.getElementById(`progress${plan.plan}`);
        const statusText = document.getElementById(`status${plan.plan}`);
        const planCard = document.querySelector(`[data-plan="${plan.plan}"]`);
        
        if (currentPlan === plan.plan) {
            planCard.classList.add('active');
            progressBar.style.width = '100%';
            statusText.textContent = '✓ Active Plan';
            statusText.style.color = 'var(--neon-green)';
        } else if (directSales >= plan.min) {
            progressBar.style.width = '100%';
            if (currentPlan > plan.plan) {
                statusText.textContent = '✓ Completed';
                statusText.style.color = 'var(--neon-green)';
            } else {
                statusText.textContent = '✓ Qualified';
                statusText.style.color = 'var(--neon-green)';
            }
        } else {
            const progress = (directSales / plan.min) * 100;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
            const needed = plan.min - directSales;
            statusText.textContent = `Need $${needed.toFixed(2)} more`;
        }
    });
}

function getNextSunday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    return nextSunday;
}
