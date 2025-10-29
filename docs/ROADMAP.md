# Alumnetics Project Roadmap

## 1. Immediate Fixes (UI/UX & Bugs)
- [ ] Fix all broken asset paths (logo, chatbot.js, etc.)
- [ ] Correct all SVG icon path errors in dashboards
- [ ] Ensure all event listeners are attached to existing DOM elements
- [ ] Remove or update any demo/mock data references
- [ ] Test all dashboards (admin, alumni, student) for missing/broken elements

## 2. Authentication & Roles
- [x] Fix backend to accept all 6 roles (admin, alumni, student, faculty, employer, institute)
- [x] Update frontend role-based redirects (utils.js)
- [ ] Test registration and login for all roles
- [ ] Add admin user if not present

## 3. Event Management System
- [x] Admin Events List Page (backend connected, no mock data)
- [ ] Admin Create/Edit Event Form (multi-step, all fields, image upload)
- [ ] Admin Event Approvals Page (pending events, approve/reject)
- [ ] Integrate events section into admin dashboard (stats, widgets)
- [ ] Alumni My Events section (hosting/attending tabs)
- [ ] Student Events widget (upcoming, recommended)
- [ ] Public Events Discovery page (grid, filters, calendar)
- [ ] Event Detail page (full info, registration CTA)
- [ ] Event Registration flow (form, payment, confirmation)
- [ ] Events API service (CRUD, registration, approval, payment)
- [ ] End-to-end testing & bug fixes

## 4. General Improvements
- [ ] Refactor and clean up all JS and HTML files
- [ ] Remove all unused/duplicate code
- [ ] Add error handling and user feedback for all API calls
- [ ] Ensure all pages are responsive and mobile-friendly
- [ ] Add favicon and meta tags for branding

## 5. Deployment & DevOps
- [ ] Test Vercel deployment (frontend)
- [ ] Test serverless backend deployment (if needed)
- [ ] Add deployment scripts and documentation
- [ ] Finalize .env and config files for production

## 6. Documentation
- [x] Event Management Plan (feature breakdown, workflow)
- [x] Fix Applied: Role Error (backend/frontend)
- [x] Create Admin User Guide
- [ ] Update README with latest setup steps
- [ ] Add API documentation (endpoints, usage)
- [ ] Add user stories and acceptance criteria

## 7. Stretch Goals
- [ ] Integrate real-time notifications (Pusher/Supabase)
- [ ] Add analytics dashboard for admin
- [ ] Integrate payments (Stripe/Razorpay) for paid events
- [ ] Add email notifications (SendGrid/Mailgun)
- [ ] Cloudinary integration for image uploads

---

## Next Steps (Short-Term)
1. Fix all asset and SVG errors in admin-dashboard.html
2. Complete Admin Create/Edit Event Form (multi-step)
3. Test registration/login for all roles (especially admin)
4. Integrate event creation and approval flows
5. Clean up codebase and remove all demo data

---

**This roadmap will be updated as progress is made.**
