# Admin Dashboard

A comprehensive Content Management System (CMS) for managing your portfolio website content. The admin dashboard is restricted to `twinedo.dev@gmail.com` only and provides full CRUD operations for all content types.

## Features

### 🔐 Authentication
- Secure JWT-based authentication
- Restricted to admin email only (`twinedo.dev@gmail.com`)
- Token-based session management
- Automatic token verification

### 📊 Dashboard Overview
- Statistics overview of all content
- Quick action buttons for common tasks
- Clean, intuitive interface

### 💼 Project Management
- Create, read, update, delete projects
- Support for both mobile and website projects
- Manage project metadata (year, platform, tag, description)
- Handle project links (App Store, Play Store, Website)
- Set project display status (active/inactive)

### 👔 Experience Management
- Full CRUD operations for work experiences
- Date handling in YYYY-MM format
- Support for current positions (no end date)
- Rich description management (multiple bullet points)
- Automatic date formatting for display

### 🖼️ Project Images Management
- View images organized by project buckets
- Update image properties (featured status, display order)
- Delete images with confirmation
- Support for image metadata management
- Automatic thumbnail generation

### 📄 CV Management
- Upload new CV files (PDF only)
- Download current CV
- Automatic file replacement
- File size validation (10MB limit)
- Standardized filename handling

## Setup Instructions

### 1. Database Setup

First, ensure your admin user exists in the database:

```bash
node setup-admin.js
```

This script will:
- Check if admin user exists
- Create admin user if not found
- Set proper superadmin role
- Display login credentials

**Default credentials:**
- Email: `twinedo.dev@gmail.com`
- Password: `admin123` (change this immediately!)

### 2. Environment Variables

Ensure these environment variables are set:

```env
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
NEXT_PUBLIC_BASE_URL=your-base-url
```

### 3. Access the Dashboard

1. Navigate to `/admin` in your browser
2. Login with your admin credentials
3. You'll be redirected to `/admin/dashboard`

## URL Structure

```
/admin                           # Login page
/admin/dashboard                 # Main dashboard
/admin/dashboard/projects        # Projects management
/admin/dashboard/experiences     # Experiences management
/admin/dashboard/images          # Project images management
/admin/dashboard/cv             # CV management
```

## Security Features

### Authentication Middleware
- JWT token verification
- Admin email restriction
- Superadmin role requirement
- Automatic token refresh

### Protected Routes
- All admin pages require authentication
- API endpoints have proper authorization
- Token-based session management
- Secure logout functionality

## API Endpoints

### Projects
- `GET /api/project` - List all projects
- `POST /api/project` - Create new project (auth required)
- `PATCH /api/project/:id` - Update project (auth required)
- `DELETE /api/project/:id` - Delete project (auth required)

### Experiences
- `GET /api/experience` - List all experiences
- `POST /api/experience` - Create new experience (auth required)
- `PATCH /api/experience/:id` - Update experience (auth required)
- `DELETE /api/experience/:id` - Delete experience (auth required)

### Project Images
- `GET /api/images/:bucket` - Get images for bucket
- `POST /api/project-images/upload` - Upload image metadata (auth required)
- `PATCH /api/project-images/:id` - Update image properties (auth required)
- `DELETE /api/project-images/:id` - Delete image (auth required)

### CV
- `GET /api/cv` - Get current CV info
- `GET /api/cv/download` - Download CV file
- `POST /api/cv/upload` - Upload new CV (auth required)

### Authentication
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/admin/verify` - Verify admin token (auth required)

## Usage Guide

### Adding a New Project

1. Go to **Projects** section
2. Click **Add New Project**
3. Fill in all required fields:
   - Project Name (required)
   - Year (required)
   - Platform (website/mobile)
   - Tag (required)
   - Bucket (required) - used for organizing project images
   - Description (one point per line)
   - Links (optional)
   - Display Status

### Managing Experiences

1. Go to **Experiences** section
2. Click **Add New Experience**
3. Fill in the form:
   - Company (required)
   - Position (required)
   - Start Date (YYYY-MM format, required)
   - End Date (YYYY-MM format, leave empty for current position)
   - Description (one bullet point per line)

### Organizing Project Images

1. Go to **Project Images** section
2. View images organized by bucket (project)
3. Update properties:
   - Toggle **Featured** status
   - Adjust **Display Order**
   - **Delete** unwanted images
4. Add new image metadata using **Add Image Metadata**

### Updating CV

1. Go to **CV Management** section
2. View current CV status
3. Upload new CV:
   - Select PDF file (max 10MB)
   - Click **Upload CV** or **Update CV**
   - File will be automatically renamed

## Technical Details

### Authentication Flow
1. User logs in with email/password
2. Backend verifies credentials and email restriction
3. JWT token issued and stored in localStorage
4. Token included in all authenticated requests
5. Middleware validates token and admin permissions

### Data Models

#### Project
```typescript
{
  id: string
  year: string
  platform: 'mobile' | 'website'
  tag: string
  project_name: string
  description: string[]
  link_appstore?: string
  link_playstore?: string
  link_website?: string
  display: string
  bucket: string
}
```

#### Experience
```typescript
{
  id: string
  company: string
  position: string
  startDate: string // YYYY-MM
  endDate?: string // YYYY-MM or null
  description: string[]
}
```

#### ProjectImage
```typescript
{
  id: string
  bucket: string
  filename: string
  isFeatured: boolean
  order: number
  blobUrl: string
}
```

### Error Handling
- Form validation with user feedback
- API error messages displayed to user
- Confirmation dialogs for destructive actions
- Loading states during operations

## Troubleshooting

### Login Issues
1. Verify admin user exists: `node setup-admin.js`
2. Check JWT_SECRET environment variable
3. Ensure email is exactly `twinedo.dev@gmail.com`

### Upload Issues
1. Check file size (CV: 10MB limit)
2. Verify file format (CV: PDF only)
3. Ensure proper authentication token

### Database Issues
1. Run `npx prisma generate`
2. Run `npx prisma migrate deploy`
3. Check database connection

## Development

The admin dashboard is built with:
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Elysia.js, Prisma ORM
- **Authentication**: JWT with bearer tokens
- **Database**: PostgreSQL (via Prisma)
- **File Storage**: Vercel Blob (for production)

### File Structure
```
src/app/admin/
├── components/
│   └── AdminLayout.tsx      # Main layout with sidebar
├── dashboard/
│   ├── page.tsx            # Dashboard overview
│   ├── projects/page.tsx   # Projects management
│   ├── experiences/page.tsx # Experiences management
│   ├── images/page.tsx     # Images management
│   └── cv/page.tsx         # CV management
├── hooks/
│   └── useAdminAuth.tsx    # Authentication hook
├── layout.tsx              # Admin layout wrapper
└── page.tsx                # Login page
```

## Security Considerations

- Admin access restricted to single email
- JWT tokens with expiration
- HTTPS required for production
- CORS properly configured
- Input validation on all forms
- File type and size validation
- SQL injection protection via Prisma