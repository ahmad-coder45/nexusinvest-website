const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// ============================================
// 1. DAILY PROFIT DISTRIBUTION
// Runs every day at 00:00 UTC
// ============================================
exports.dailyProfitDistribution = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Starting daily profit distribution...');
    
    try {
      // Get all active investments
      const investmentsSnapshot = await db.collection('investments')
        .where('status', '==', 'active')
        .get();
      
      const batch = db.batch();
      let processedCount = 0;
      
      for (const doc of investmentsSnapshot.docs) {
        const investment = doc.data();
        const investmentId = doc.id;
        
        // Check if profit already distributed today
        const lastProfitDate = investment.lastProfitDate?.toDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (lastProfitDate) {
          const lastProfit = new Date(lastProfitDate);
          lastProfit.setHours(0, 0, 0, 0);
          if (lastProfit.getTime() === today.getTime()) {
            continue; // Already processed today
          }
        }
        
        // Calculate profit
        const dailyProfit = investment.dailyProfit;
        const daysCompleted = (investment.daysCompleted || 0) + 1;
        const profitEarned = (investment.profitEarned || 0) + dailyProfit;
        
        // Update user balance
        const userRef = db.collection('users').doc(investment.userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        const newBalance = (userData.balance || 0) + dailyProfit;
        const newTotalEarnings = (userData.totalEarnings || 0) + dailyProfit;
        
        batch.update(userRef, {
          balance: newBalance,
          totalEarnings: newTotalEarnings
        });
        
        // Update investment
        const investmentRef = db.collection('investments').doc(investmentId);
        const updateData = {
          daysCompleted: daysCompleted,
          profitEarned: profitEarned,
          lastProfitDate: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Check if investment completed
        if (daysCompleted >= investment.duration) {
          updateData.status = 'completed';
          updateData.endDate = admin.firestore.FieldValue.serverTimestamp();
        }
        
        batch.update(investmentRef, updateData);
        
        // Create transaction log
        const transactionRef = db.collection('transactions').doc();
        batch.set(transactionRef, {
          userId: investment.userId,
          type: 'daily_profit',
          amount: dailyProfit,
          balanceBefore: userData.balance || 0,
          balanceAfter: newBalance,
          description: `Daily profit from ${investment.planName} (Day ${daysCompleted}/${investment.duration})`,
          relatedId: investmentId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        processedCount++;
      }
      
      await batch.commit();
      console.log(`Daily profit distribution completed. Processed ${processedCount} investments.`);
      
      return null;
    } catch (error) {
      console.error('Error in daily profit distribution:', error);
      throw error;
    }
  });

// ============================================
// 2. WEEKLY SALARY PAYMENT
// Runs every 7 days
// ============================================
exports.weeklySalaryPayment = functions.pubsub
  .schedule('0 0 * * 0')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Starting weekly salary payment...');
    
    try {
      const usersSnapshot = await db.collection('users').get();
      const batch = db.batch();
      let processedCount = 0;
      
      for (const doc of usersSnapshot.docs) {
        const user = doc.data();
        const userId = doc.id;
        
        // Check if 7 days passed since last payment
        const lastPayment = user.lastSalaryPayment?.toDate();
        if (lastPayment) {
          const daysSinceLastPayment = Math.floor((Date.now() - lastPayment.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLastPayment < 7) {
            continue;
          }
        }
        
        // Calculate direct sales
        const directSales = user.directSales || 0;
        
        // Determine salary plan
        let salaryPlan = 0;
        let salaryAmount = 0;
        
        if (directSales >= 6000) {
          salaryPlan = 3;
          salaryAmount = 50;
        } else if (directSales >= 2500) {
          salaryPlan = 2;
          salaryAmount = 15;
        } else if (directSales >= 1000) {
          salaryPlan = 1;
          salaryAmount = 5;
        }
        
        if (salaryAmount > 0) {
          // Update user balance
          const userRef = db.collection('users').doc(userId);
          const newBalance = (user.balance || 0) + salaryAmount;
          const newTotalSalary = (user.totalSalary || 0) + salaryAmount;
          
          batch.update(userRef, {
            balance: newBalance,
            totalSalary: newTotalSalary,
            salaryPlan: salaryPlan,
            lastSalaryPayment: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Create salary record
          const salaryRef = db.collection('salaries').doc();
          batch.set(salaryRef, {
            userId: userId,
            salaryPlan: salaryPlan,
            amount: salaryAmount,
            directSales: directSales,
            paymentDate: admin.firestore.FieldValue.serverTimestamp()
          });
          
          // Create transaction log
          const transactionRef = db.collection('transactions').doc();
          batch.set(transactionRef, {
            userId: userId,
            type: 'salary',
            amount: salaryAmount,
            balanceBefore: user.balance || 0,
            balanceAfter: newBalance,
            description: `Weekly Salary - Plan ${salaryPlan} ($${salaryAmount})`,
            relatedId: salaryRef.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          processedCount++;
        }
      }
      
      await batch.commit();
      console.log(`Weekly salary payment completed. Processed ${processedCount} users.`);
      
      return null;
    } catch (error) {
      console.error('Error in weekly salary payment:', error);
      throw error;
    }
  });

// ============================================
// 3. REFERRAL COMMISSION CALCULATOR
// Triggers when new investment is created
// ============================================
exports.calculateReferralCommission = functions.firestore
  .document('investments/{investmentId}')
  .onCreate(async (snap, context) => {
    const investment = snap.data();
    const investmentId = context.params.investmentId;
    
    console.log(`Calculating referral commission for investment ${investmentId}`);
    
    try {
      // Get investor's referral chain
      const investorDoc = await db.collection('users').doc(investment.userId).get();
      const investor = investorDoc.data();
      
      if (!investor.referredBy) {
        console.log('No referrer found');
        return null;
      }
      
      const batch = db.batch();
      const commissionRates = [12, 2, 1]; // Level 1, 2, 3
      let currentReferrerId = investor.referredBy;
      
      for (let level = 0; level < 3 && currentReferrerId; level++) {
        const referrerDoc = await db.collection('users').doc(currentReferrerId).get();
        
        if (!referrerDoc.exists) break;
        
        const referrer = referrerDoc.data();
        const commissionRate = commissionRates[level];
        const commissionAmount = (investment.amount * commissionRate) / 100;
        
        // Update referrer balance
        const referrerRef = db.collection('users').doc(currentReferrerId);
        const newBalance = (referrer.balance || 0) + commissionAmount;
        const newTotalCommissions = (referrer.totalCommissions || 0) + commissionAmount;
        
        // Update direct sales for Level 1 only
        if (level === 0) {
          const newDirectSales = (referrer.directSales || 0) + investment.amount;
          batch.update(referrerRef, {
            balance: newBalance,
            totalCommissions: newTotalCommissions,
            directSales: newDirectSales
          });
        } else {
          batch.update(referrerRef, {
            balance: newBalance,
            totalCommissions: newTotalCommissions
          });
        }
        
        // Create commission record
        const commissionRef = db.collection('commissions').doc();
        batch.set(commissionRef, {
          userId: currentReferrerId,
          fromUserId: investment.userId,
          investmentId: investmentId,
          level: level + 1,
          investmentAmount: investment.amount,
          commissionRate: commissionRate,
          commissionAmount: commissionAmount,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Create transaction log
        const transactionRef = db.collection('transactions').doc();
        batch.set(transactionRef, {
          userId: currentReferrerId,
          type: 'commission',
          amount: commissionAmount,
          balanceBefore: referrer.balance || 0,
          balanceAfter: newBalance,
          description: `Level ${level + 1} Commission (${commissionRate}%) from ${investor.fullName || investor.email}`,
          relatedId: commissionRef.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Move to next level
        currentReferrerId = referrer.referredBy;
      }
      
      await batch.commit();
      console.log('Referral commissions calculated and distributed');
      
      return null;
    } catch (error) {
      console.error('Error calculating referral commission:', error);
      throw error;
    }
  });

// ============================================
// 4. DEPOSIT APPROVAL HANDLER
// Triggers when deposit status changes to approved
// ============================================
exports.handleDepositApproval = functions.firestore
  .document('deposits/{depositId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const depositId = context.params.depositId;
    
    // Check if status changed to approved
    if (before.status !== 'approved' && after.status === 'approved') {
      console.log(`Processing deposit approval for ${depositId}`);
      
      try {
        const batch = db.batch();
        
        // Update user balance
        const userRef = db.collection('users').doc(after.userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        const newBalance = (userData.balance || 0) + after.amount;
        
        batch.update(userRef, {
          balance: newBalance
        });
        
        // Create transaction log
        const transactionRef = db.collection('transactions').doc();
        batch.set(transactionRef, {
          userId: after.userId,
          type: 'deposit',
          amount: after.amount,
          balanceBefore: userData.balance || 0,
          balanceAfter: newBalance,
          description: `Deposit approved via ${after.method}`,
          relatedId: depositId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await batch.commit();
        console.log('Deposit approval processed successfully');
        
        return null;
      } catch (error) {
        console.error('Error processing deposit approval:', error);
        throw error;
      }
    }
    
    return null;
  });

// ============================================
// 5. WITHDRAWAL APPROVAL HANDLER
// Triggers when withdrawal status changes to approved
// ============================================
exports.handleWithdrawalApproval = functions.firestore
  .document('withdrawals/{withdrawalId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const withdrawalId = context.params.withdrawalId;
    
    // Check if status changed to approved
    if (before.status !== 'approved' && after.status === 'approved') {
      console.log(`Processing withdrawal approval for ${withdrawalId}`);
      
      try {
        const batch = db.batch();
        
        // Update user balance
        const userRef = db.collection('users').doc(after.userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        const totalDeduction = after.amount; // Amount already includes 5% tax
        const newBalance = (userData.balance || 0) - totalDeduction;
        
        batch.update(userRef, {
          balance: newBalance,
          withdrawalCount: (userData.withdrawalCount || 0) + 1
        });
        
        // Create transaction log
        const transactionRef = db.collection('transactions').doc();
        batch.set(transactionRef, {
          userId: after.userId,
          type: 'withdrawal',
          amount: -totalDeduction,
          balanceBefore: userData.balance || 0,
          balanceAfter: newBalance,
          description: `Withdrawal approved via ${after.method} (Net: $${after.netAmount}, Tax: $${after.taxAmount})`,
          relatedId: withdrawalId,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await batch.commit();
        console.log('Withdrawal approval processed successfully');
        
        return null;
      } catch (error) {
        console.error('Error processing withdrawal approval:', error);
        throw error;
      }
    }
    
    return null;
  });

// ============================================
// 6. USER REGISTRATION HANDLER
// Triggers when new user is created
// ============================================
exports.handleUserRegistration = functions.auth.user().onCreate(async (user) => {
  console.log(`New user registered: ${user.email}`);
  
  try {
    // Generate unique referral code
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create user document
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      fullName: user.displayName || '',
      phone: '',
      balance: 0,
      bonusBalance: 1, // $1 non-withdrawable bonus
      totalInvested: 0,
      totalEarnings: 0,
      totalCommissions: 0,
      totalSalary: 0,
      referralCode: referralCode,
      referredBy: '',
      salaryPlan: 0,
      directSales: 0,
      lastSalaryPayment: null,
      withdrawalCount: 0,
      firstInvestmentDate: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active',
      role: 'user'
    });
    
    // Create transaction log for bonus
    await db.collection('transactions').add({
      userId: user.uid,
      type: 'bonus',
      amount: 1,
      balanceBefore: 0,
      balanceAfter: 0,
      description: 'Registration bonus (Non-withdrawable)',
      relatedId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('User document created with $1 bonus');
    
    return null;
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
});

// ============================================
// 7. MONTHLY WITHDRAWAL COUNTER RESET
// Runs on 1st day of each month at 00:00 UTC
// ============================================
exports.monthlyWithdrawalReset = functions.pubsub
  .schedule('0 0 1 * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Resetting monthly withdrawal counters...');
    
    try {
      const usersSnapshot = await db.collection('users').get();
      const batch = db.batch();
      
      usersSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          withdrawalCount: 0
        });
      });
      
      await batch.commit();
      console.log(`Reset withdrawal counters for ${usersSnapshot.size} users`);
      
      return null;
    } catch (error) {
      console.error('Error resetting withdrawal counters:', error);
      throw error;
    }
  });

// ============================================
// 8. CALLABLE FUNCTION: GET USER STATS
// ============================================
exports.getUserStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const userId = context.auth.uid;
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    // Get active investments count
    const investmentsSnapshot = await db.collection('investments')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();
    
    // Get referrals count (3 levels)
    const level1Snapshot = await db.collection('users')
      .where('referredBy', '==', userId)
      .get();
    
    let level2Count = 0;
    let level3Count = 0;
    
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
    
    return {
      balance: userData.balance || 0,
      bonusBalance: userData.bonusBalance || 0,
      totalInvested: userData.totalInvested || 0,
      totalEarnings: userData.totalEarnings || 0,
      totalCommissions: userData.totalCommissions || 0,
      totalSalary: userData.totalSalary || 0,
      activeInvestments: investmentsSnapshot.size,
      referrals: {
        level1: level1Snapshot.size,
        level2: level2Count,
        level3: level3Count,
        total: level1Snapshot.size + level2Count + level3Count
      },
      salaryPlan: userData.salaryPlan || 0,
      directSales: userData.directSales || 0,
      withdrawalCount: userData.withdrawalCount || 0
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new functions.https.HttpsError('internal', 'Error fetching user statistics');
  }
});
