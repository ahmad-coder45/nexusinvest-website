// ============================================
// DAILY MINING CLAIM SYSTEM
// ============================================

const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check if user can claim today
async function canClaimToday(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (!userData.lastClaimAt) {
            return { canClaim: true, remainingTime: 0 };
        }
        
        const lastClaimAt = userData.lastClaimAt.toMillis();
        const now = Date.now();
        const diff = now - lastClaimAt;
        
        if (diff >= DAILY_COOLDOWN_MS) {
            return { canClaim: true, remainingTime: 0 };
        } else {
            const remainingMs = DAILY_COOLDOWN_MS - diff;
            return { canClaim: false, remainingTime: remainingMs };
        }
    } catch (error) {
        console.error('Error checking claim status:', error);
        return { canClaim: false, remainingTime: 0 };
    }
}

// Format remaining time
function formatRemainingTime(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
}

// Claim daily mining reward
async function claimDailyReward(userId) {
    try {
        showLoading();
        
        // Check if weekend
        if (isWeekend()) {
            hideLoading();
            showToast('Mining is off on weekends (Saturday & Sunday)', 'error');
            return false;
        }
        
        // Check if can claim
        const claimStatus = await canClaimToday(userId);
        
        if (!claimStatus.canClaim) {
            hideLoading();
            const timeLeft = formatRemainingTime(claimStatus.remainingTime);
            showToast(`You can claim again in ${timeLeft}`, 'error');
            return false;
        }
        
        // Get user's active investments
        const investmentsSnapshot = await db.collection('investments')
            .where('userId', '==', userId)
            .where('status', '==', 'active')
            .get();
        
        if (investmentsSnapshot.empty) {
            hideLoading();
            showToast('No active investments found', 'error');
            return false;
        }
        
        // Calculate total daily profit
        let totalDailyProfit = 0;
        investmentsSnapshot.forEach(doc => {
            const investment = doc.data();
            totalDailyProfit += investment.dailyProfit || 0;
        });
        
        // Update user balance and last claim time
        await db.collection('users').doc(userId).update({
            balance: firebase.firestore.FieldValue.increment(totalDailyProfit),
            totalProfit: firebase.firestore.FieldValue.increment(totalDailyProfit),
            lastClaimAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update each investment's days completed
        const batch = db.batch();
        investmentsSnapshot.forEach(doc => {
            const investment = doc.data();
            const newDaysCompleted = (investment.daysCompleted || 0) + 1;
            const newProfitEarned = (investment.profitEarned || 0) + investment.dailyProfit;
            
            const updateData = {
                daysCompleted: newDaysCompleted,
                profitEarned: newProfitEarned,
                lastProfitDate: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Check if investment is completed
            if (newDaysCompleted >= investment.duration) {
                updateData.status = 'completed';
                updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
            }
            
            batch.update(doc.ref, updateData);
        });
        
        await batch.commit();
        
        // Create transaction record
        await db.collection('transactions').add({
            userId: userId,
            type: 'mining_claim',
            amount: totalDailyProfit,
            status: 'completed',
            description: 'Daily mining reward claimed',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoading();
        showToast(`Successfully claimed ${formatCurrency(totalDailyProfit)}!`, 'success');
        
        return true;
        
    } catch (error) {
        console.error('Error claiming daily reward:', error);
        hideLoading();
        showToast('Failed to claim reward. Please try again.', 'error');
        return false;
    }
}

// Update claim button UI
async function updateClaimButtonUI(userId) {
    const claimButton = document.getElementById('claimButton');
    const claimTimer = document.getElementById('claimTimer');
    
    if (!claimButton) return;
    
    const claimStatus = await canClaimToday(userId);
    
    if (claimStatus.canClaim) {
        claimButton.disabled = false;
        claimButton.innerHTML = '<i class="fas fa-pickaxe"></i> CLAIM DAILY REWARD';
        claimButton.classList.remove('disabled');
        claimButton.classList.add('pulse');
        
        if (claimTimer) {
            claimTimer.textContent = 'Ready to claim!';
            claimTimer.style.color = 'var(--neon-green)';
        }
    } else {
        claimButton.disabled = true;
        claimButton.innerHTML = '<i class="fas fa-clock"></i> CLAIMED TODAY';
        claimButton.classList.add('disabled');
        claimButton.classList.remove('pulse');
        
        if (claimTimer) {
            const timeLeft = formatRemainingTime(claimStatus.remainingTime);
            claimTimer.textContent = `Next claim in: ${timeLeft}`;
            claimTimer.style.color = 'var(--text-gray)';
            
            // Update timer every second
            const timerInterval = setInterval(async () => {
                const status = await canClaimToday(userId);
                if (status.canClaim) {
                    clearInterval(timerInterval);
                    updateClaimButtonUI(userId);
                } else {
                    claimTimer.textContent = `Next claim in: ${formatRemainingTime(status.remainingTime)}`;
                }
            }, 1000);
        }
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.canClaimToday = canClaimToday;
    window.claimDailyReward = claimDailyReward;
    window.updateClaimButtonUI = updateClaimButtonUI;
    window.formatRemainingTime = formatRemainingTime;
}
