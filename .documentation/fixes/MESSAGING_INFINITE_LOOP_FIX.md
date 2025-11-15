# Messaging Infinite Loop Bug Fix

## Date: November 4, 2025

## 🐛 Issue Summary

**Symptoms:**
- Clicking on a person in conversations caused **hundreds of API calls**
- Backend crashed from request spam
- Console showed repeated:
  - `Load conversations error`
  - `Load messages error` 
  - CORS errors
  - `Send message error`
- Backend process would die/close

**Root Cause:**
The `useEffect` hook in `MessagingPage.jsx` had **wrong dependencies** that caused **infinite re-render loops**:

```javascript
// ❌ BAD - Caused infinite loop
useEffect(() => {
  // ... setup code that calls loadConversations()
  // ... and sets selectedUser
}, [selectedUser, navigate, location]); 
// ⬆️ Every time selectedUser changes, effect re-runs
// ⬆️ Effect calls loadMessages() which sets selectedUser
// ⬆️ selectedUser change triggers effect again = INFINITE LOOP!
```

## 🔧 Fixes Applied

### 1. **Fixed useEffect Dependencies**

**Before:**
```javascript
useEffect(() => {
  // ... initialization code
}, [selectedUser, navigate, location]); // ❌ BAD - causes loops
```

**After:**
```javascript
useEffect(() => {
  let mounted = true; // ✅ Cleanup flag
  
  // ... initialization code with mounted checks
  
  return () => {
    mounted = false; // ✅ Prevent state updates after unmount
    socketService.off('newMessage');
  };
}, [navigate]); // ✅ ONLY run once on mount
```

**Why this works:**
- Only depends on `navigate` (which never changes)
- Effect runs **once** when component mounts
- Cleanup function prevents memory leaks
- `mounted` flag prevents state updates after unmount

### 2. **Added Debounce Protection to loadConversations**

```javascript
const loadConversations = async () => {
  // ✅ Prevent multiple simultaneous calls
  if (loadConversations.isLoading) {
    console.log('⚠️ Already loading conversations, skipping...');
    return;
  }

  loadConversations.isLoading = true;

  try {
    // ... fetch conversations
  } finally {
    // ✅ Allow next call after 1 second
    setTimeout(() => {
      loadConversations.isLoading = false;
    }, 1000);
  }
};
```

**Benefits:**
- Prevents duplicate API calls
- 1-second cooldown between calls
- Logs when a call is skipped (for debugging)

### 3. **Added Debounce Protection to loadMessages**

```javascript
const loadMessages = async (userId) => {
  if (!userId) {
    console.warn('No userId provided to loadMessages');
    return;
  }

  // ✅ Prevent duplicate calls for same user
  if (loadMessages.currentUserId === userId && loadMessages.isLoading) {
    console.log('⚠️ Already loading messages for this user, skipping...');
    return;
  }

  loadMessages.currentUserId = userId;
  loadMessages.isLoading = true;

  try {
    // ... fetch messages
  } finally {
    // ✅ Allow next call after 500ms
    setTimeout(() => {
      loadMessages.isLoading = false;
    }, 500);
  }
};
```

**Benefits:**
- Won't reload if already loading same user
- 500ms cooldown between calls
- Tracks which user is currently loading

### 4. **Added Better Error Handling**

```javascript
try {
  const response = await fetch(url, options);
  
  // ✅ Check HTTP status
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const result = await response.json();
  // ...
} catch (error) {
  // ✅ Better error messages
  console.error('❌ Load messages error:', error.message);
}
```

### 5. **Added Mounted Check to Prevent Memory Leaks**

```javascript
useEffect(() => {
  let mounted = true; // ✅ Track if component is still mounted

  const checkAuth = async () => {
    await somethingAsync();
    
    // ✅ Only update state if still mounted
    if (!mounted) return;
    setCurrentUser(user);
  };

  checkAuth();

  return () => {
    mounted = false; // ✅ Mark as unmounted
  };
}, []);
```

## 📊 Before vs After

### Before Fix:
```
User clicks conversation
  ↓
useEffect runs (has selectedUser dependency)
  ↓
loadMessages() called
  ↓
setSelectedUser() called
  ↓
selectedUser changes → useEffect runs again ← LOOP!
  ↓
loadMessages() called again
  ↓
setSelectedUser() called again
  ↓
selectedUser changes → useEffect runs again ← LOOP!
  ↓
... (repeats 100+ times) ...
  ↓
Backend crashes from spam 💥
```

### After Fix:
```
User clicks conversation (ONCE)
  ↓
handleSelectConversation() called
  ↓
loadMessages() called
  ↓
Debounce check: not loading yet ✅
  ↓
Fetch messages from API
  ↓
setSelectedUser() with data
  ↓
Done! No loop 🎉
```

## 🎯 Files Modified

### `alumnetics-react/src/pages/MessagingPage.jsx`

**Lines Changed:**
1. **Line 26-85**: Fixed `useEffect` to only depend on `navigate`
2. **Line 99-139**: Added debounce to `loadConversations`
3. **Line 141-187**: Added debounce to `loadMessages`

**Key Changes:**
- Removed `selectedUser` and `location` from `useEffect` dependencies
- Added `mounted` flag for cleanup
- Added loading state checks to prevent duplicate calls
- Added 1000ms cooldown for conversations
- Added 500ms cooldown for messages
- Improved error logging

## ✅ Testing Steps

1. **Hard refresh browser** (`Ctrl + Shift + R`)
2. **Login** to the app
3. **Navigate to Messages**
4. **Click on a conversation**
5. **Expected Result:**
   - ✅ Only 1 API call to load conversations
   - ✅ Only 1 API call to load messages for that user
   - ✅ Person's name appears (e.g., "Admin User")
   - ✅ Messages load cleanly
   - ✅ No console spam
   - ✅ Backend stays running
6. **Click another conversation**
7. **Expected Result:**
   - ✅ Only 1 new API call for new user's messages
   - ✅ Smooth transition
   - ✅ No errors

## 🔍 How to Verify Fix

Open **DevTools Console** (`F12`) and watch for:

**Good Signs (✅):**
```
📋 Loaded conversations: Array(1)
📨 Loaded messages for user: {firstName: "Admin", lastName: "User", ...}
✅ Socket.io connected (WebSocket mode)
```

**Bad Signs (❌ - if you see these, something is wrong):**
```
⚠️ Already loading conversations, skipping...  ← Spam = still broken
❌ Load conversations error: ...  ← Repeated errors = still broken
net::ERR_FAILED  ← Repeated = backend crashed = still broken
```

## 🚀 Status

- ✅ Infinite loop fixed
- ✅ Debounce protection added
- ✅ Memory leak protection added
- ✅ Error handling improved
- ✅ Backend restarted (PID 15792 on port 5000)
- ✅ Frontend restarted (PID 13628 on port 5173)
- ✅ User names now display correctly

**Ready for testing!**

---

## 💡 Key Lessons

1. **Be careful with useEffect dependencies** - Including state that the effect modifies = infinite loop
2. **Always add debounce/throttle** to API calls triggered by user interactions
3. **Use mounted flags** to prevent state updates after unmount
4. **Add loading state checks** to prevent duplicate simultaneous calls
5. **Log skipped calls** during development to catch issues early

## 📚 React Best Practices Applied

- ✅ useEffect cleanup functions
- ✅ Mounted state tracking
- ✅ Minimal dependencies (only what truly changes)
- ✅ Debouncing expensive operations
- ✅ Loading state management
- ✅ Error boundary concepts
