# EVENT MANAGEMENT - TROUBLESHOOTING GUIDE

## ✅ ALL ISSUES FIXED!

### Problems That Were Found:
1. **Event not approved** - `isApproved` was `false`
2. **Admin missing institution** - `institution.name` was `undefined`
3. **Student user didn't exist** - Had to create from scratch
4. **Backend field mismatch** - Used `academic.institution` instead of `institution.name`

---

## 🎯 Current Setup

### User Accounts
| Email | Password | Role | Institution |
|-------|----------|------|-------------|
| admin@university1.edu | Admin@123 | admin | University1 |
| student@university1.edu | Student@123 | student | University1 |

### Database Status
- **Events in DB**: 1 (titled "check")
- **Event Status**: published, approved, University1
- **Visible to Student**: YES ✅

---

## 🚀 How to Test

### Test as Student:
1. Open: http://localhost:3000/pages/auth/login.html
2. Login: `student@university1.edu` / `Student@123`
3. Navigate to Events page
4. **Expected**: You should see the "check" event!

### Test as Admin:
1. Login: `admin@university1.edu` / `Admin@123`
2. Go to Events dashboard
3. **Expected**: You see ALL events (no filter)
4. Create new event → automatically visible to students from same institution

---

## 📊 How Event Filtering Works

### For Admin Users:
- See **ALL events** regardless of status, approval, or institution
- No filters applied

### For Students/Alumni:
- Only see events where:
  - `status === 'published'` ✅
  - `isApproved === true` ✅
  - `institution === user's institution` ✅

---

## 🛠️ Useful Scripts

### Check Database Status:
```bash
cd e:\demo\demo\alumnetics-backend
node test-events.js
```

### Approve All Events:
```bash
cd e:\demo\demo\alumnetics-backend
node approve-events.js
```

### Fix Users & Events:
```bash
cd e:\demo\demo\alumnetics-backend
node fix-events.js
```

---

## ⚠️ If Events Still Don't Show

Run this checklist:

### 1. Check Servers Running:
```powershell
Get-NetTCPConnection -LocalPort 5000,3000 -State Listen
```
Expected: Both 5000 and 3000 listening

### 2. Check Event in Database:
```bash
node test-events.js
```
Verify:
- Event status: `published`
- Event isApproved: `true`
- Event institution: matches user's institution

### 3. Check User Institution:
```bash
node test-events.js
```
Verify:
- User has `institution.name` field set
- Matches the event's institution

### 4. Check Browser Console:
- Open F12 Developer Tools
- Look for:
  - `🎯 Events page loaded`
  - `✅ Loaded X events`
  - Any error messages

### 5. Check Backend Logs:
Look in backend PowerShell window for:
```
🔍 Full User Object: {...}
🎓 Student/Alumni filter: {...}
📊 Found X events out of Y total
```

---

## 📝 Creating New Events

### From Admin Dashboard:
1. Login as admin
2. Go to Events section
3. Click "Create Event"
4. Fill in details:
   - **Status**: Set to "published" for visibility
   - **Institution**: Automatically set from admin's profile
5. Submit
6. **Event is automatically approved** ✅

### Manual Approval (if needed):
If an event is created but not approved:
```bash
cd e:\demo\demo\alumnetics-backend
node approve-events.js
```

---

## 🔧 Technical Details

### User Model Structure:
```javascript
{
  email: String,
  fullName: String,
  role: 'admin' | 'student' | 'alumni',
  institution: {
    name: String,  // e.g., "University1"
    type: String,
    location: String
  }
}
```

### Event Model Structure:
```javascript
{
  title: String,
  status: 'draft' | 'published',
  isApproved: Boolean,
  institution: String,  // e.g., "University1"
  organizer: ObjectId
}
```

### Backend Filtering Logic:
```javascript
// In eventController.js
if (req.user.role === 'admin') {
  // No filter - see all
} else {
  filter.status = 'published';
  filter.isApproved = true;
  filter.institution = req.user.institution.name;
}
```

---

## 📱 Contact for Issues

If events still don't show after following this guide:
1. Check all servers are running
2. Run `test-events.js` to verify database
3. Run `approve-events.js` to auto-approve
4. Check browser console (F12) for errors
5. Check backend PowerShell window for logs

---

**Last Updated**: October 23, 2025  
**Status**: ✅ ALL SYSTEMS WORKING
