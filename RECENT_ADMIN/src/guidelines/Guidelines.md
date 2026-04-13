# Admin Website Guidelines

## Overview
This admin website is built for managing recruitment operations with a focus on job orders, applicants, companies, and deployment tracking. The system follows a three-level hierarchy for job orders: **Job Order → Positions → Applicants**.

---

## 🎨 Design System

### Color Scheme
- **Primary Colors**: Green (#10B981) and Yellow (#F59E0B)
- **Accent**: Based on triangular logo design
- **Dark Mode**: Full support across all components

### Layout
- **Sidebar Width**: 
  - Expanded: 256px (w-64)
  - Collapsed: 80px (w-20)
- **Smooth transitions** between sidebar states
- **Responsive design** with mobile breakpoints

---

## 📋 Core Features

### 1. Authentication
- **Login Page**: Username/password authentication
- **Session Management**: Logout functionality in header
- Located in: `/components/LoginPage.tsx`

### 2. Dashboard
- **Main Dashboard**: Overview with statistics cards and charts
- **Dashboard - Job Orders**: Focused job order analytics
- **Charts**: Implemented with Chart.js (not recharts)
- Dark mode compatible
- Located in: `/components/Dashboard.tsx`, `/components/DashboardJobOrders.tsx`

### 3. Analytics
- Time period filters (7, 30, 90 days, All Time)
- CSV export functionality
- Interactive charts with tooltips
- Dark mode support
- Located in: `/components/Analytics.tsx`

### 4. User Management
- **Manage Users**: User CRUD operations with search and filtering
- **Manage Roles**: Role permissions and access control
  - **Admin**: Full system access with all permissions
  - **Project Manager**: Manage projects, job orders, and team oversight
  - **Project Officer**: Handle recruitment, applicants, and job order operations
- Located in: `/components/ManageUsers.tsx`, `/components/ManageRoles.tsx`

### 5. Job Orders (Three-Level Hierarchy)
**Structure:**
```
Job Order
├── Position 1
│   ├── Applicant A
│   ├── Applicant B
│   └── Applicant C
└── Position 2
    ├── Applicant D
    └── Applicant E
```

**Features:**
- Job orders contain multiple positions
- Each position has its own set of applicants
- **Status Management**: Open, Closed, On Hold
  - Status is clickable dropdown (with ChevronDown icon)
  - Updates reflect across Companies and Job Orders tabs
- Search and filter functionality
- Modal dialogs for detailed views
- Located in: `/components/JobOrders.tsx`

**Job Order Attributes:**
- Job Order Code (e.g., JO-2026-001)
- Principal Company Name
- Status (Open/Closed/On Hold)
- Date Created
- Deadline
- Positions array

**Position Attributes:**
- Title
- Open Positions count
- Description
- Requirements
- Applicants array

**Applicant Attributes:**
- Name
- Resume Score (0-100)
- Status: applied, AI-screened, Shortlist, Scheduled, Accepted, Rejected
- Applied Date
- Rejection Reason (if applicable)

### 6. Companies
- Groups job orders by company
- Expandable/collapsible company rows
- Shows nested job orders for each company
- **Status dropdown** synced with Job Orders tab
- Located in: `/components/Companies.tsx`

### 7. Deployment
- Worker deployment tracking
- Dark mode support
- Located in: `/components/Deployment.tsx`

### 8. General Settings
- System configuration
- Located in: `/components/General.tsx`

---

## 🔄 Shared State Management

### Job Orders Context
All job order data is managed through a centralized context to ensure consistency across components.

**Location**: `/contexts/JobOrdersContext.tsx`

**Usage:**
```javascript
import { useJobOrders } from '../contexts/JobOrdersContext';

const { jobOrders, setJobOrders, updateJobOrderStatus } = useJobOrders();
```

**Functions:**
- `jobOrders`: Array of all job orders
- `setJobOrders`: Update entire job orders array
- `updateJobOrderStatus(jobOrderId, newStatus)`: Update specific job order status

**Benefits:**
- Companies and Job Orders tabs share same data
- Status changes reflect immediately in both views
- Single source of truth

---

## 🎯 Key Workflows

### Creating a Job Order
1. Navigate to Job Orders tab
2. Click "Create Job Order" button
3. Fill in company details and deadline
4. Add positions (title, description, requirements, open count)
5. Submit to create job order with initial "Open" status

### Managing Applicants
1. Navigate to Job Orders tab
2. Click on a job order to view positions
3. Click on a position to view applicants
4. Filter by status, search by name
5. Sort by resume score
6. Update applicant status or reject with reason

### Updating Job Order Status
1. **In Job Orders tab**: Click status badge (shows dropdown icon)
2. **In Companies tab**: Expand company, click job order status badge
3. Select new status: Open, Closed, or On Hold
4. Change reflects immediately in both tabs

---

## 🛠 Technical Stack

### Framework
- **React** with JSX syntax (`.tsx` files required by Figma Make)
- **JavaScript** (not TypeScript - converted during refactor)

### Styling
- **Tailwind CSS v4**
- Custom green/yellow theme
- Dark mode via state management

### Charts
- **Chart.js** (replaced recharts)
- Configured for dark mode
- Interactive tooltips

### Icons
- **Lucide React**

### UI Components
- Custom components in `/components/ui/`
- Shadcn-inspired design

---

## 📁 File Structure

```
/
├── App.tsx                          # Main app entry with auth
├── components/
│   ├── DashboardLayout.tsx          # Layout with sidebar & header
│   ├── Dashboard.tsx                # Main dashboard
│   ├── DashboardJobOrders.tsx       # Job orders dashboard
│   ├── Analytics.tsx                # Analytics page
│   ├── ManageUsers.tsx              # User management
│   ├── ManageRoles.tsx              # Role management
│   ├── JobOrders.tsx                # Job orders (3-level hierarchy)
│   ├── Companies.tsx                # Companies with grouped job orders
│   ├── Deployment.tsx               # Deployment tracking
│   ├── General.tsx                  # Settings
│   ├── LoginPage.tsx                # Authentication
│   ├── companiesData.tsx            # Company data
│   └── ui/                          # Reusable UI components
├── contexts/
│   └── JobOrdersContext.tsx         # Shared job orders state
├── styles/
│   └── globals.css                  # Global styles & Tailwind config
└── guidelines/
    └── Guidelines.md                # This file
```

---

## 🎨 UI Patterns

### Status Colors
```javascript
const getStatusColor = (status) => {
  switch (status) {
    case 'Open':
      return 'bg-green-100 text-green-800';
    case 'Closed':
      return 'bg-gray-100 text-gray-800';
    case 'On Hold':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
};
```

### Dark Mode Pattern
```javascript
className={darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
```

### Sidebar Toggle
- **Location**: Inside sidebar (not header)
- **Expanded**: X icon in top-right corner
- **Collapsed**: Menu icon centered below logo

---

## 🚀 Recent Updates

### Latest Changes (March 2026)
1. ✅ Converted TypeScript to JavaScript (maintaining .tsx extensions)
2. ✅ Replaced recharts with Chart.js across all dashboards
3. ✅ Implemented shared JobOrdersContext for data consistency
4. ✅ Made job order status clickable dropdown with sync between tabs
5. ✅ Moved sidebar toggle button from header to sidebar

---

## 📝 Job Order Terminology

**Job Orders** specifically refer to:
- Hiring workers for **piece work** or **intermittent jobs**
- **Short duration**: Not exceeding 6 months
- **Pay basis**: Daily or hourly
- **Hierarchy**: Job Order → Multiple Positions → Multiple Applicants per Position

---

## 🎓 Best Practices

### Component Organization
- Keep components focused and single-purpose
- Use shared contexts for cross-component state
- Maintain consistent naming conventions

### State Management
- Use JobOrdersContext for job orders data
- Local state for UI-specific concerns (modals, filters)
- Avoid prop drilling

### Styling
- Use Tailwind utility classes
- Follow green/yellow color scheme
- Ensure dark mode compatibility
- Maintain responsive design

### Data Flow
- Components consume from context
- Update through context methods
- Changes propagate automatically

---

## 🔍 Testing Checklist

When making changes, verify:
- [ ] Dark mode works correctly
- [ ] Sidebar collapse/expand functions smoothly
- [ ] Status changes reflect in both Companies and Job Orders
- [ ] Filters and search work as expected
- [ ] Charts render properly
- [ ] Modals open and close correctly
- [ ] Responsive design on mobile/tablet
- [ ] No console errors

---

## 📞 Quick Reference

### Common Tasks

**Add a new menu item:**
1. Add to `menuItems` array in `DashboardLayout.tsx`
2. Create component in `/components/`
3. Add case to `renderContent()` switch statement

**Add new job order status:**
1. Update type in `JobOrdersContext.tsx`
2. Update `getStatusColor()` function
3. Add option to status dropdowns

**Modify chart appearance:**
- Edit chart configuration in respective component
- Ensure dark mode compatibility
- Test interactive features (tooltips, legends)

---

## 📚 Additional Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/
- **Chart.js**: https://www.chartjs.org/docs/

---

*Last Updated: March 25, 2026*