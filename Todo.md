# User Roles & Dashboard Design - Implementation Plan

## Overview
Implement role-based authentication and dashboard system for the LGU Solano Marriage License System with three user types: users (applicants), employees (processors), and admins (managers).

## Authentication & Role Assignment Approach
- **Users**: Self-register via public signup, automatically assigned `role = 'user'`
- **Employees/Admins**: Manually created by admins in Supabase dashboard with explicit roles
- **Role Detection**: Check `profiles.role` on sign-in and redirect to appropriate dashboard

## Phase 1: Authentication & Role Infrastructure
- [ ] Update profile creation trigger to assign 'user' role to new signups
- [ ] Create role detection utilities (`getUserRole()`, `getUserProfile()`)
- [ ] Implement role-based routing middleware
- [ ] Update signup flow to ensure only 'user' accounts are created publicly
- [ ] Add role validation and error handling

## Phase 2: Manual Employee/Admin Setup Process
- [ ] Document process for admins to create employee accounts in Supabase
- [ ] Create database functions for employee management
- [ ] Test role assignments and access control
- [ ] Verify RLS policies work with different roles

## Phase 3: User Dashboard (`/dashboard/user`)
- [ ] Create `/dashboard/user` route and layout
- [ ] Implement application status tracking with real-time updates
- [ ] Build application history timeline component
- [ ] Add office visit instructions display
- [ ] Create document download section
- [ ] Implement profile management interface
- [ ] Add notification system for status changes

## Phase 4: Employee Dashboard (`/dashboard/employee`)
- [ ] Create `/dashboard/employee` route and layout
- [ ] Build application code entry form
- [ ] Implement application processing interface (view/edit data)
- [ ] Add real-time photo capture integration
- [ ] Create document generation trigger
- [ ] Build status update workflow controls
- [ ] Add recent applications list and search/filter

## Phase 5: Admin Dashboard (`/dashboard/admin`)
- [ ] Create `/dashboard/admin` route and layout
- [ ] Implement employee management interface (add/remove staff)
- [ ] Build system analytics dashboard (metrics, volumes)
- [ ] Create application oversight table (all applications)
- [ ] Add audit trail viewer
- [ ] Implement report generation and export tools
- [ ] Add system health monitoring

## Phase 6: Integration & Testing
- [ ] Update main `/dashboard` route to be role-aware and redirect appropriately
- [ ] Implement real-time subscriptions for status updates
- [ ] Add comprehensive error handling and role-based permissions
- [ ] Test all role transitions and access control
- [ ] Ensure mobile responsiveness for office workstations
- [ ] Performance optimization and bundle size monitoring

## Technical Requirements
- **Database**: Profiles table with role column, RLS policies
- **Authentication**: Supabase Auth with role-based redirects
- **UI Framework**: Next.js with Tailwind CSS and shadcn/ui
- **Real-time**: Supabase subscriptions for live updates
- **Security**: Role-based access control throughout

## Dependencies
- Supabase database schema (completed)
- RLS policies configured (completed)
- Basic authentication flow (completed)
- Storage bucket setup (completed)

## Success Criteria
- [ ] Users can sign up and access user dashboard
- [ ] Employees can be created manually and access employee dashboard
- [ ] Admins can manage employees and access admin dashboard
- [ ] All dashboards show role-appropriate features and data
- [ ] Real-time updates work across all user types
- [ ] Security policies prevent unauthorized access