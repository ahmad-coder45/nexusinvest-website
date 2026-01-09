// ============================================
// REFERRALS JAVASCRIPT
// ============================================

let currentUser = null;
let userData = null;
let allReferrals = [];
let currentLevel = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    currentUser = await checkAuth();
    if (!currentUser) return;
    
    await loadUserData();
    await loadReferralStats();
    await loadReferrals();
});

async function loadUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        userData = userDoc.data();
        
        // Set referral link
        const referralLink = `${window.location.origin}/register.html?ref=${userData.referralCode}`;
        document.getElementById('referralLink').value = referralLink;
        
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadReferralStats() {
    try {
        // Level 1
        const level1Snapshot = await db.collection('users')
            .where('referredBy', '==', currentUser.uid)
            .get();
        
        let level2Count = 0;
        let level3Count = 0;
        
        // Level 2 & 3
        for (const doc of level1Snapshot.docs) {
            const level2Snapshot = await db.collection('users')
                .where('referredBy', '==', doc.id)
                .get();
            level2Count += level2Snapshot.size;
            
            for (const level2Doc of level2Snapshot.docs) {
                const level3Snapshot = await db.collection('users')
                    .where('referredBy', '==', level2Doc.id)
                    .get();
                level3Count += level3Snapshot.size;
            }
        }
        
        document.getElementById('level1Count').textContent = level1Snapshot.size;
        document.getElementById('level2Count').textContent = level2Count;
        document.getElementById('level3Count').textContent = level3Count;
        document.getElementById('totalCommissions').textContent = formatCurrency(userData.totalCommissions || 0);
        
    } catch (error) {
        console.error('Error loading referral stats:', error);
    }
}

async function loadReferrals() {
    try {
        allReferrals = [];
        
        // Get Level 1
        const level1Snapshot = await db.collection('users')
            .where('referredBy', '==', currentUser.uid)
            .get();
        
        for (const doc of level1Snapshot.docs) {
            const referralData = doc.data();
            allReferrals.push({
                id: doc.id,
                level: 1,
                ...referralData
            });
            
            // Get Level 2
            const level2Snapshot = await db.collection('users')
                .where('referredBy', '==', doc.id)
                .get();
            
            for (const level2Doc of level2Snapshot.docs) {
                const level2Data = level2Doc.data();
                allReferrals.push({
                    id: level2Doc.id,
                    level: 2,
                    ...level2Data
                });
                
                // Get Level 3
                const level3Snapshot = await db.collection('users')
                    .where('referredBy', '==', level2Doc.id)
                    .get();
                
                for (const level3Doc of level3Snapshot.docs) {
                    allReferrals.push({
                        id: level3Doc.id,
                        level: 3,
                        ...level3Doc.data()
                    });
                }
            }
        }
        
        displayReferrals();
        
    } catch (error) {
        console.error('Error loading referrals:', error);
        showToast('Failed to load referrals', 'error');
    }
}

function filterReferrals(level) {
    currentLevel = level;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-level="${level}"]`).classList.add('active');
    
    displayReferrals();
}

function displayReferrals() {
    const container = document.getElementById('referralsList');
    
    let filteredReferrals = allReferrals;
    if (currentLevel !== 'all') {
        filteredReferrals = allReferrals.filter(r => r.level === parseInt(currentLevel));
    }
    
    if (filteredReferrals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No Referrals Yet</h3>
                <p>Share your referral link to start earning commissions</p>
                <button onclick="copyReferralLink()" class="btn btn-primary" style="margin-top: var(--spacing-md);">
                    <i class="fas fa-copy"></i> Copy Referral Link
                </button>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: var(--spacing-md);">';
    
    filteredReferrals.forEach(referral => {
        const levelColors = {
            1: 'var(--neon-green)',
            2: 'var(--electric-blue)',
            3: 'var(--light-blue)'
        };
        
        const commissionRates = {
            1: '12%',
            2: '2%',
            3: '1%'
        };
        
        const joinDate = referral.createdAt?.toDate();
        
        html += `
            <div style="padding: var(--spacing-md); background: rgba(0, 102, 255, 0.05); border: 1px solid rgba(0, 102, 255, 0.2); border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--spacing-md);">
                <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                    <div style="width: 50px; height: 50px; background: ${levelColors[referral.level]}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary-black);">
                        ${referral.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 style="margin-bottom: 0.25rem;">${referral.fullName}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-gray);">
                            ${referral.email}
                        </p>
                    </div>
                </div>
                
                <div style="display: flex; gap: var(--spacing-lg); align-items: center;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Level</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: ${levelColors[referral.level]};">
                            ${referral.level}
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Commission</div>
                        <div style="font-size: 1.25rem; font-weight: 700; color: ${levelColors[referral.level]};">
                            ${commissionRates[referral.level]}
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Invested</div>
                        <div style="font-size: 1.25rem; font-weight: 700;">
                            ${formatCurrency(referral.totalInvested || 0)}
                        </div>
                    </div>
                    
                    <div style="text-align: center;">
                        <div style="font-size: 0.85rem; color: var(--text-gray);">Joined</div>
                        <div style="font-size: 0.9rem;">
                            ${joinDate ? formatDate(joinDate) : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function copyReferralLink() {
    const linkInput = document.getElementById('referralLink');
    linkInput.select();
    document.execCommand('copy');
    showToast('Referral link copied to clipboard!', 'success');
}

function shareReferralLink() {
    const link = document.getElementById('referralLink').value;
    
    if (navigator.share) {
        navigator.share({
            title: 'Join NexusInvest',
            text: 'Start earning with crypto mining investments!',
            url: link
        }).catch(err => console.log('Error sharing:', err));
    } else {
        copyReferralLink();
    }
}

window.filterReferrals = filterReferrals;
window.copyReferralLink = copyReferralLink;
window.shareReferralLink = shareReferralLink;
