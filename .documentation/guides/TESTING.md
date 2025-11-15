# 🧪 ALUMNETICS Testing Checklist

## Pre-Testing Setup
- [ ] Dev server running: `npm run dev`
- [ ] Browser open at: `http://localhost:5173`
- [ ] Clear localStorage (DevTools → Application → Local Storage → Clear All)

---

## 1. Landing Page Testing (`/`)

### Visual Tests
- [ ] Hero section loads with gradient background
- [ ] Logo and navigation visible
- [ ] All 9 sections render correctly:
  - [ ] Features (6 cards)
  - [ ] Events preview
  - [ ] Network section
  - [ ] Jobs preview
  - [ ] Success stories
  - [ ] Fundraising
  - [ ] Testimonials (3 cards)
  - [ ] Statistics (4 counters)
  - [ ] Call-to-action

### Interaction Tests
- [ ] "Get Started" button works
- [ ] "Login" button navigates to `/login`
- [ ] Smooth scroll animation works
- [ ] All cards have hover effects
- [ ] Responsive design (resize browser)

---

## 2. Login Page Testing (`/login`)

### Visual Tests
- [ ] Login form displays correctly
- [ ] Logo visible
- [ ] Remember me checkbox
- [ ] Forgot password link
- [ ] Register link

### Functional Tests
- [ ] Enter email: `student@test.com`
- [ ] Enter password: `password123`
- [ ] Click "Sign In"
- [ ] Should redirect to `/dashboard/student`
- [ ] Check localStorage has `authToken` and `userData`

### Role Testing
Try logging in as different roles:
- [ ] Student → Redirects to `/dashboard/student`
- [ ] Alumni → Redirects to `/dashboard/alumni`
- [ ] Admin → Redirects to `/dashboard/admin`

### Validation Tests
- [ ] Empty email shows error
- [ ] Invalid email format shows error
- [ ] Empty password shows error
- [ ] Form submission disabled until valid

---

## 3. Register Page Testing (`/register`)

### Visual Tests
- [ ] Registration form displays
- [ ] 6 role options visible
- [ ] Form fields match selected role

### Role-Specific Fields
Test each role:
- [ ] Student - Shows: Student ID, Year of Study, Branch
- [ ] Alumni - Shows: Graduation Year, Current Company
- [ ] Faculty - Shows: Department, Employee ID
- [ ] Admin - Shows: Admin Level
- [ ] Staff - Shows: Department, Employee ID
- [ ] Guest - Shows: Organization, Purpose

### Functional Tests
- [ ] Select role: Student
- [ ] Fill all required fields
- [ ] Password strength indicator works
- [ ] Confirm password validation
- [ ] Terms checkbox required
- [ ] Click "Create Account"
- [ ] Redirects to appropriate dashboard
- [ ] localStorage updated

---

## 4. Student Dashboard Testing (`/dashboard/student`)

### Authentication
- [ ] Requires login (redirects to `/login` if not authenticated)
- [ ] Shows correct user name from localStorage

### Visual Tests
- [ ] Welcome section displays
- [ ] Quick Actions (3 cards):
  - [ ] Join Events
  - [ ] Find Alumni
  - [ ] Post Questions
- [ ] Upcoming Events section (empty state)
- [ ] My Activities section (empty state)
- [ ] My Network section (empty state)

### Navigation Tests
- [ ] "View Profile" button → `/profile/student`
- [ ] Logo → `/` (landing page)
- [ ] All quick action cards clickable

---

## 5. Alumni Dashboard Testing (`/dashboard/alumni`)

### Visual Tests
- [ ] Welcome section
- [ ] Quick Actions (3 cards):
  - [ ] Join Events
  - [ ] Send Messages
  - [ ] Update Profile
- [ ] Your Network Stats (4 metrics):
  - [ ] Alumni Connections: 0
  - [ ] Events Attended: 0
  - [ ] Messages Sent: 0
  - [ ] Profile Views: 0
- [ ] Upcoming Events (empty state)
- [ ] Recent Activities (empty state)

### Navigation Tests
- [ ] "View Profile" → `/profile/alumni`
- [ ] Dashboard navigation works

---

## 6. Admin Dashboard Testing (`/dashboard/admin`)

### Tab Navigation
- [ ] 4 tabs visible: Overview, Events, Users, Analytics
- [ ] Click each tab, content changes
- [ ] Active tab highlighted

### Overview Tab
- [ ] Search section visible
- [ ] Platform stats (4 cards):
  - [ ] Total Users: 0
  - [ ] Active Events: 0
  - [ ] New Registrations: 0
  - [ ] Total Alumni: 0
- [ ] Recent Activities table

### Events Tab
- [ ] Event filters (Status, Date)
- [ ] Events table with columns
- [ ] Empty state message

### Users Tab
- [ ] User filters (Role, Status)
- [ ] Users table
- [ ] Empty state

### Analytics Tab
- [ ] Analytics cards
- [ ] Empty state

---

## 7. Profile Pages Testing

### Student Profile (`/profile/student`)
- [ ] Header with navigation
- [ ] Avatar with initials
- [ ] User info (name, email, college)
- [ ] Badges (Student, Department)
- [ ] About section (empty state)
- [ ] Education section (empty state)
- [ ] Projects section (empty state)
- [ ] Achievements section (empty state)
- [ ] Contact sidebar (email, phone)
- [ ] Skills sidebar (empty state)
- [ ] Interests sidebar (empty state)
- [ ] Availability sidebar (empty state)
- [ ] Privacy Settings (collapsible):
  - [ ] Profile Visibility toggle
  - [ ] Show Email toggle
  - [ ] Show Phone toggle
  - [ ] Allow Messages toggle
- [ ] "Edit Profile" button → `/profile/edit`

### Alumni Profile (`/profile/alumni`)
- [ ] Similar to Student Profile
- [ ] Work Experience section (instead of Projects)
- [ ] Mentorship section
- [ ] Industry section
- [ ] All toggles work

### Admin Profile (`/profile/admin`)
- [ ] No Privacy Settings section
- [ ] Responsibilities section (5 bullet points)
- [ ] Platform Overview (3 stats)
- [ ] Quick Actions (3 buttons)
- [ ] "Edit Profile" button works

---

## 8. Events Page Testing (`/events`)

### Visual Tests
- [ ] Header with "Back to Dashboard"
- [ ] Search & Filters section:
  - [ ] Search input
  - [ ] Event type dropdown (8 types)
  - [ ] Search button
- [ ] Loading state (3 skeleton cards)
- [ ] Empty state (calendar emoji + message)

### Search & Filter
- [ ] Type in search box
- [ ] Press Enter → triggers search
- [ ] Select event type
- [ ] Click Search button
- [ ] Results update

### Events Display (when data available)
- [ ] Event cards in 3-column grid
- [ ] Each card shows:
  - [ ] Event image
  - [ ] Event title
  - [ ] Description preview
  - [ ] Attendee count
  - [ ] Register button
- [ ] Hover effect on cards
- [ ] Click card → Opens modal

### Event Modal
- [ ] Modal displays full details
- [ ] Close button (X) works
- [ ] Click outside modal → closes
- [ ] Register button works
- [ ] Close button at bottom works

---

## 9. View Profile Testing (`/profile/view?id=123`)

### Loading State
- [ ] Spinner displays
- [ ] "Loading profile..." message
- [ ] Floating particles animate

### Error State
- [ ] Error emoji displays
- [ ] Error message shows
- [ ] "Go Back" button works

### Profile Content (when user exists)
- [ ] Avatar with initials
- [ ] Active badge
- [ ] User name with gradient
- [ ] Role display
- [ ] 3 badges (Department, Institution, Year)
- [ ] Bio section
- [ ] Contact Information:
  - [ ] Email (🔒 Hidden if privacy off)
  - [ ] Phone (🔒 Hidden if privacy off)
- [ ] Academic Details:
  - [ ] Degree Program
  - [ ] Graduation Year
  - [ ] Location

### Context-Aware Buttons
- [ ] If own profile: "Edit Profile" button shows
- [ ] If other's profile: "Send Message" button shows
- [ ] "Back to Search" button works

---

## 10. Edit Profile Testing (`/profile/edit`)

### Authentication
- [ ] Requires login
- [ ] Redirects to `/login` if not authenticated

### Form Sections
1. **Basic Information**
   - [ ] Full Name (required, pre-filled)
   - [ ] Email (disabled, pre-filled)
   - [ ] Phone (optional)
   - [ ] Location (optional)
   - [ ] Bio (textarea, optional)

2. **Academic Information**
   - [ ] Department
   - [ ] Institution
   - [ ] Degree
   - [ ] Graduation Year (number input)

3. **Skills & Interests**
   - [ ] Skills (comma-separated)
   - [ ] Interests (comma-separated)

4. **Privacy Settings**
   - [ ] Profile Visibility (toggle)
   - [ ] Show Email (toggle)
   - [ ] Show Phone (toggle)
   - [ ] Allow Messages (toggle)
   - [ ] All toggles animate on click

5. **Action Buttons**
   - [ ] Save Changes (primary button)
   - [ ] Cancel (secondary button)

### Functional Tests
- [ ] Edit fields
- [ ] Toggle privacy settings
- [ ] Click "Save Changes"
- [ ] Shows saving state (spinner)
- [ ] Success alert appears
- [ ] Redirects to profile page
- [ ] Check localStorage updated
- [ ] Cancel button shows confirmation
- [ ] Cancel confirmation works

---

## 11. Navigation Testing

### Global Navigation
- [ ] Logo always navigates to `/`
- [ ] Dashboard links work from all pages
- [ ] Profile links work from all pages
- [ ] Back buttons work correctly
- [ ] Browser back/forward works

### Protected Routes
- [ ] Accessing dashboards without login → redirects to `/login`
- [ ] Accessing profiles without login → redirects to `/login`
- [ ] After login, redirects to intended page

### Role-Based Access
- [ ] Student can access student dashboard
- [ ] Alumni can access alumni dashboard
- [ ] Admin can access admin dashboard
- [ ] Cross-role access works (view other profiles)

---

## 12. Responsive Design Testing

### Desktop (1920px)
- [ ] All layouts display correctly
- [ ] Navigation visible
- [ ] Cards in proper grid
- [ ] No horizontal scroll

### Tablet (768px)
- [ ] 2-column grids adjust
- [ ] Navigation responsive
- [ ] Forms stack properly
- [ ] Modals fit screen

### Mobile (375px)
- [ ] Single column layout
- [ ] Navigation collapses
- [ ] Forms mobile-friendly
- [ ] Touch targets adequate

---

## 13. Browser Testing

### Chrome
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

### Firefox
- [ ] All features work
- [ ] Styling correct
- [ ] No console errors

### Safari
- [ ] All features work
- [ ] Backdrop-blur works
- [ ] No console errors

### Edge
- [ ] All features work
- [ ] No console errors

---

## 14. Performance Testing

### Load Time
- [ ] Landing page loads < 2s
- [ ] Navigation instant
- [ ] No flash of unstyled content

### Animations
- [ ] Smooth 60fps animations
- [ ] No jank during scroll
- [ ] Hover effects responsive

### Memory
- [ ] No memory leaks
- [ ] localStorage doesn't grow indefinitely

---

## 15. Accessibility Testing

### Keyboard Navigation
- [ ] Tab key works
- [ ] Enter key submits forms
- [ ] Escape closes modals
- [ ] Focus visible

### Screen Reader
- [ ] Form labels present
- [ ] Button text clear
- [ ] Alt text on images

---

## 16. Error Handling Testing

### Form Errors
- [ ] Empty required fields show error
- [ ] Invalid email format error
- [ ] Password mismatch error
- [ ] Minimum length validation

### API Errors (Future)
- [ ] Network error handling
- [ ] Timeout handling
- [ ] Error messages clear

---

## 17. LocalStorage Testing

### Check Data
1. Open DevTools → Application → Local Storage
2. Check keys:
   - [ ] `authToken` exists after login
   - [ ] `userData` exists with correct structure
3. Modify data:
   - [ ] Change user name → reflects in UI
   - [ ] Change role → affects dashboard
4. Clear data:
   - [ ] Clears on logout
   - [ ] Redirects to login

---

## 18. Integration Testing

### User Flow 1: New User Registration
1. [ ] Start at landing page
2. [ ] Click "Get Started"
3. [ ] Register as Student
4. [ ] Fill all fields
5. [ ] Submit form
6. [ ] Redirected to student dashboard
7. [ ] Navigate to profile
8. [ ] Click "Edit Profile"
9. [ ] Update information
10. [ ] Save changes
11. [ ] View updated profile

### User Flow 2: Returning User Login
1. [ ] Navigate to login
2. [ ] Enter credentials
3. [ ] Click "Sign In"
4. [ ] Dashboard loads
5. [ ] Browse events
6. [ ] Return to dashboard
7. [ ] Logout works

### User Flow 3: Admin Tasks
1. [ ] Login as admin
2. [ ] Access admin dashboard
3. [ ] Switch between tabs
4. [ ] Search functionality
5. [ ] View analytics
6. [ ] Navigate to profile
7. [ ] Return to dashboard

---

## 19. Edge Cases Testing

### Empty States
- [ ] No events → Shows empty message
- [ ] No activities → Shows empty state
- [ ] No network → Shows empty state

### Long Text
- [ ] Long names truncate properly
- [ ] Long bio displays correctly
- [ ] Long descriptions ellipsis

### Special Characters
- [ ] Names with special chars
- [ ] Emails with + sign
- [ ] Passwords with symbols

### Boundary Values
- [ ] Year: 1950 - 2050
- [ ] Empty optional fields
- [ ] Maximum text lengths

---

## 20. Final Checklist

### Code Quality
- [ ] No console errors
- [ ] No warnings
- [ ] No unused imports
- [ ] Clean console logs

### Documentation
- [ ] README.md complete
- [ ] Comments in complex code
- [ ] Testing guide complete

### Deployment Ready
- [ ] Build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] All assets bundled
- [ ] No broken links

---

## Test Results

**Date:** _______________  
**Tested By:** _______________  
**Browser:** _______________  
**Device:** _______________  

**Pass Rate:** _____ / _____  
**Critical Issues:** _______________  
**Minor Issues:** _______________  

**Status:** ⬜ Pass ⬜ Fail ⬜ Needs Fixes

---

## Notes

_Add any additional observations or issues found during testing:_

---

**Happy Testing! 🧪✨**
