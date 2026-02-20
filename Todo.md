# Solano Marriage License System - Project Roadmap

## Phase 1: Authentication & Role Infrastructure (Completed)
- [x] Update profile creation trigger to assign 'user' role to new signups
- [x] Create role detection utilities (`getUserRole()`, `getUserProfile()`)
- [x] Implement role-based routing middleware
- [x] Update signup flow to ensure only 'user' accounts are created publicly
- [x] Add role validation and error handling

## Phase 2: Manual Employee/Admin Setup (Completed)
- [x] Document process for admins to create employee accounts in Supabase
- [x] Create database functions for employee management
- [x] Verify RLS policies work with different roles

## Phase 3: User Dashboard (`/dashboard/user`)
- [x] Create basic user dashboard layout
- [x] Move Profile/Notifications to shared routes
- [ ] Implement live application status tracking
- [ ] Build application history timeline component
- [ ] Add office visit instructions display
- [ ] Create document download section (for finished licenses)

## Phase 4: Employee Dashboard (`/dashboard/employee`)
- [ ] Build application code entry form (to claim/process apps)
- [ ] Implement application processing interface (view/edit submitted data)
- [ ] Add real-time photo capture integration (for onsite verification)
- [ ] Create document generation trigger (PDF generation)
- [ ] Build status update workflow controls (Pending -> Processing -> Finished)

## Phase 5: Admin Dashboard (`/dashboard/admin`)
### 1. Staff & Employee Management
- [ ] Build **Employee Directory** with status and workload metrics
- [ ] Implement **Staff Onboarding** interface to create/revoke employee access
- [ ] Add **Real-time Activity Tracker** for staff members

### 2. System Analytics & KPIs
- [ ] Build **Application Funnel** chart (visualizing status distribution)
- [ ] Implement **Average Processing Time** metric
- [ ] Add **Submission Heatmap** (identifying peak office hours)

### 3. Application Oversight
- [ ] Create **Global Application Master Table** with advanced filtering
- [ ] Build **Status Override** capability for priority cases
- [ ] Implement **Global Search** for any application or user

### 4. Security & Compliance
- [ ] Build **Audit Trail Viewer** (searchable history of all sensitive actions)
- [ ] Implement **Document Generation History** (legal record of every PDF issued)

### 5. Storage & Health
- [ ] Add **Storage Usage Monitor** for photos and uploaded documents
- [ ] Create **System Health Dashboard** (database/API connectivity status)

## Phase 6: Polish & Integration
- [ ] Implement real-time Supabase subscriptions for status updates
- [ ] Ensure full mobile responsiveness for office workstations
- [ ] Finalize PDF templates for official marriage licenses
- [ ] End-to-end testing of the role-based workflow
