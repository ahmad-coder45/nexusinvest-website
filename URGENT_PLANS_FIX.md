# 🚨 URGENT: PLANS.HTML HAS WRONG VALUES!

## ❌ CURRENT ISSUES IN plans.html:

### **Plan 02 - WRONG VALUES:**
- Shows: Daily $0.72, Duration 30 Days ❌
- Should be: Daily $0.36, Duration **60 Days** ✅

### **Plan 03 - WRONG VALUES:**
- Shows: Daily $1.80, Duration 30 Days ❌
- Should be: Daily $0.90, Duration **60 Days** ✅

### **Plan 04 - WRONG VALUES:**
- Shows: Daily $3.00, Duration 30 Days ❌
- Should be: Daily $1.50, Duration **60 Days** ✅

---

## ✅ CORRECT VALUES (YOUR REQUIREMENTS):

| Plan | Amount | Daily Profit | Total Return | Duration |
|------|--------|--------------|--------------|----------|
| 01 | $5 | $0.30 | $9 | 30 days ✅ |
| 02 | $12 | **$0.36** | $21.60 | **60 days** ✅ |
| 03 | $30 | **$0.90** | $54 | **60 days** ✅ |
| 04 | $50 | **$1.50** | $90 | **60 days** ✅ |
| 05 | $120 | $7.20 | $216 | 30 days ✅ |
| 06 | $250 | $7.50 | $450 | **60 days** ✅ |
| 07 | $550 | $16.50 | $990 | **60 days** ✅ |

---

## 🔧 WHAT NEEDS TO BE FIXED:

### **File: plans.html**

You need to manually update these sections:

### **Plan 02 Section (around line 230-260):**
```html
<!-- CURRENT (WRONG): -->
<li>
    <span class="feature-label">Daily Profit</span>
    <span class="feature-value highlight">$0.72</span> ❌
</li>
<li>
    <span class="feature-label">Duration</span>
    <span class="feature-value">30 Days</span> ❌
</li>

<!-- CHANGE TO: -->
<li>
    <span class="feature-label">Daily Profit</span>
    <span class="feature-value highlight">$0.36</span> ✅
</li>
<li>
    <span class="feature-label">Duration</span>
    <span class="feature-value">60 Days</span> ✅
</li>
```

### **Plan 03 Section (around line 270-300):**
```html
<!-- CURRENT (WRONG): -->
<li>
    <span class="feature-label">Daily Profit</span>
    <span class="feature-value highlight">$1.80</span> ❌
</li>
<li>
    <span class="feature-label">Duration</span>
    <span class="feature-value">30 Days</span> ❌
</li>

<!-- CHANGE TO: -->
<li>
    <span class="feature-label">Daily Profit</span>
    <span class="feature-value highlight">$0.90</span> ✅
</li>
<li>
    <span class="feature-label">Duration</span>
    <span class="feature-value">60 Days</span> ✅
</li>
```

### **Plan 04 Section (around line 310-340):**
```html
<!-- CURRENT (WRONG): -->
<li>
    <span class="feature-label">Daily Profit</span>
    <span class="feature-value highlight">$3.00</span> ❌
</li>
<li>
    <span class="feature-label">Duration</span>
    <span class="feature-value">30 Days</span> ❌
</li>

<!-- CHANGE TO: -->
<li>
    <span class="feature-label">Daily Profit</span>
    <span class="feature-value highlight">$1.50</span> ✅
</li>
<li>
    <span class="feature-label">Duration</span>
    <span class="feature-value">60 Days</span> ✅
</li>
```

---

## 📝 STEP-BY-STEP FIX INSTRUCTIONS:

### **Step 1: Open plans.html in VS Code**
```bash
cd nexusinvest-website
code plans.html
```

### **Step 2: Find and Replace**

Use VS Code's Find & Replace (Ctrl+H):

**Replace 1:**
- Find: `<span class="feature-value highlight">$0.72</span>`
- Replace: `<span class="feature-value highlight">$0.36</span>`

**Replace 2:**
- Find: `<span class="feature-value highlight">$1.80</span>`
- Replace: `<span class="feature-value highlight">$0.90</span>`

**Replace 3:**
- Find: `<span class="feature-value highlight">$3.00</span>`
- Replace: `<span class="feature-value highlight">$1.50</span>`

**Replace 4 (for Plans 2, 3, 4 only):**
- Manually change `30 Days` to `60 Days` for Plans 02, 03, 04

### **Step 3: Verify Changes**
Check that:
- Plan 01: $0.30 daily, 30 days ✅
- Plan 02: $0.36 daily, 60 days ✅
- Plan 03: $0.90 daily, 60 days ✅
- Plan 04: $1.50 daily, 60 days ✅
- Plan 05: $7.20 daily, 30 days ✅
- Plan 06: $7.50 daily, 60 days ✅
- Plan 07: $16.50 daily, 60 days ✅

### **Step 4: Save and Test**
```bash
# Test locally with Live Server
# Then commit and push
git add plans.html
git commit -m "Fix plan values - correct daily profits and durations"
git push origin main
```

---

## 🎯 VERIFICATION CHECKLIST:

After fixing, verify each plan shows:

- [ ] Plan 01: $5, $0.30/day, $9 total, 30 days
- [ ] Plan 02: $12, $0.36/day, $21.60 total, 60 days
- [ ] Plan 03: $30, $0.90/day, $54 total, 60 days
- [ ] Plan 04: $50, $1.50/day, $90 total, 60 days
- [ ] Plan 05: $120, $7.20/day, $216 total, 30 days
- [ ] Plan 06: $250, $7.50/day, $450 total, 60 days
- [ ] Plan 07: $550, $16.50/day, $990 total, 60 days

---

## 🚨 CRITICAL NOTES:

1. **main.js is CORRECT** ✅ (already fixed)
2. **plans.html is WRONG** ❌ (needs manual fix)
3. **Homepage issue** - separate problem (CSS loading)

---

## 💡 WHY THIS HAPPENED:

The plans.html file was created with old/incorrect values and wasn't updated when we changed the configuration in main.js. The HTML file needs manual updating because it's static content.

---

**🔥 FIX plans.html IMMEDIATELY - IT'S SHOWING WRONG VALUES TO USERS!**

**Priority:** 🚨 URGENT  
**Estimated Time:** 5 minutes  
**Difficulty:** Easy (Find & Replace)
