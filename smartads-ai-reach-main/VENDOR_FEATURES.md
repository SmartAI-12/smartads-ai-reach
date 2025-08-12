# Vendor Features for SmartAds BTL

This document outlines the vendor-specific features implemented in the SmartAds BTL application.

## Overview

Vendors (field representatives) have access to a specialized interface that allows them to:
- View only their assigned campaigns and tasks
- Check in at campaign locations using geolocation
- Upload proof photos with geotagging
- Log expenses related to their tasks
- Track their work progress transparently

## Features Implemented

### 1. Vendor-Specific Dashboard (`/vendor/dashboard`)

**Components:**
- `VendorDashboard.tsx` - Shows vendor-specific statistics and overview
- `useVendorCampaigns.ts` - Hook for fetching vendor's assigned campaigns
- `useVendorTasks.ts` - Hook for fetching vendor's assigned tasks
- `useVendorExpenses.ts` - Hook for fetching vendor's expenses

**Features:**
- Active campaigns count
- Task completion statistics
- Overdue tasks tracking
- Total check-ins and photos uploaded
- Expense summary
- Recent tasks and campaigns
- Quick action buttons

### 2. Vendor Campaigns List (`/vendor/campaigns`)

**Components:**
- `VendorCampaignsList.tsx` - Shows only campaigns assigned to the vendor
- `useVendorCampaigns.ts` - Data fetching hook

**Features:**
- Filter campaigns by status and budget
- Search functionality
- Task count per campaign
- Mobile-responsive design
- Pull-to-refresh functionality

### 3. Vendor Tasks List (`/vendor/tasks`)

**Components:**
- `VendorTasksList.tsx` - Shows only tasks assigned to the vendor
- `useVendorTasks.ts` - Data fetching hook
- `useVendorCheckins.ts` - Check-in, photo, and expense hooks

**Features:**
- Task status management (complete/incomplete)
- Geolocation check-ins
- Photo upload with geotagging
- Expense logging
- Mobile swipe actions
- Priority and due date tracking
- Overdue task highlighting

### 4. Geolocation Check-ins

**Implementation:**
- Uses browser's Geolocation API
- Stores coordinates in PostgreSQL with PostGIS
- Optional address and notes
- Automatic timestamp recording

**Database Schema:**
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES auth.users(id),
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  notes TEXT
);
```

### 5. Photo Upload with Geotagging

**Implementation:**
- File upload to Supabase Storage
- Automatic geolocation capture
- Optional captions
- Organized by task ID

**Storage Bucket:**
- Bucket name: `task-photos`
- 5MB file size limit
- Supported formats: JPEG, PNG, WebP, HEIC
- Public access for viewing

**Database Schema:**
```sql
CREATE TABLE task_photos (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES auth.users(id),
  photo_url TEXT,
  location GEOGRAPHY(POINT, 4326),
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### 6. Expense Logging

**Implementation:**
- Amount and category tracking
- Optional descriptions
- Status tracking (pending/approved/rejected)
- Receipt upload capability

**Database Schema:**
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2),
  category TEXT,
  description TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE
);
```

## Security & Permissions

### Row Level Security (RLS)

All vendor-specific tables have RLS policies:

1. **Campaigns**: Vendors can only view campaigns assigned to them
2. **Tasks**: Vendors can only view tasks assigned to them
3. **Check-ins**: Vendors can create check-ins for their tasks and view their own
4. **Photos**: Vendors can upload photos for their tasks and view their own
5. **Expenses**: Vendors can create expenses for their tasks and view their own

### Role-Based Access

- **Vendor Role**: Access to vendor-specific routes and features
- **Manager/Admin Role**: Can view all vendor data and manage assignments

## Mobile Optimization

### Responsive Design
- Mobile-first approach
- Touch-friendly interfaces
- Swipe actions for quick access
- Pull-to-refresh functionality

### Geolocation Features
- Automatic location detection
- Camera integration for photo capture
- Offline capability for data entry

## API Endpoints

### Vendor-Specific Queries
- `GET /campaigns?assigned_to=vendor_id` - Get vendor's campaigns
- `GET /tasks?assigned_to=vendor_id` - Get vendor's tasks
- `POST /check_ins` - Create check-in
- `POST /task_photos` - Upload photo
- `POST /expenses` - Log expense

## Database Migrations

### Required Migrations
1. `20250811180000_add_vendor_features.sql` - Core vendor tables and policies
2. `20250811190000_create_storage_bucket.sql` - Storage bucket for photos

### Key Tables
- `check_ins` - Location check-ins
- `task_photos` - Proof photos
- `expenses` - Expense tracking
- `profiles` - User roles (vendor role added)

## Usage Instructions

### For Vendors
1. **Login**: Use vendor credentials
2. **Dashboard**: View assigned work overview
3. **Campaigns**: Browse assigned campaigns
4. **Tasks**: Manage assigned tasks
5. **Check-in**: Use location services to record presence
6. **Photos**: Upload proof photos with location
7. **Expenses**: Log task-related expenses

### For Managers
1. **Assign Tasks**: Assign tasks to vendors
2. **Monitor Progress**: View vendor check-ins and photos
3. **Review Expenses**: Approve or reject expense claims
4. **Track Performance**: Monitor vendor activity and completion rates

## Technical Requirements

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- React Query for data fetching
- React Router for navigation

### Backend
- Supabase (PostgreSQL + Auth + Storage)
- PostGIS extension for geolocation
- Row Level Security (RLS)
- Storage buckets for file uploads

### Browser Support
- Geolocation API
- File API
- Modern ES6+ features

## Future Enhancements

1. **Real-time Updates**: Live notifications for task assignments
2. **Offline Mode**: Work without internet connection
3. **Push Notifications**: Task reminders and updates
4. **Advanced Analytics**: Performance metrics and insights
5. **Integration**: Connect with external mapping services
6. **Bulk Operations**: Batch photo uploads and check-ins
