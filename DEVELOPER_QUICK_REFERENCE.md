# Developer Quick Reference - Borrands System

## 🚀 Quick Start

### Test Credentials (Development)
```
Email: test@borrands.com
Password: password123
```

---

## 📡 API Call Pattern

### Standard API Call with Auth
```typescript
const token = localStorage.getItem('token');
const headers: any = { 'Content-Type': 'application/json' };
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}

const response = await fetch('/api/endpoint', {
  method: 'GET', // or POST, PATCH, DELETE
  headers,
  credentials: 'include', // For cookie-based auth
});

const json = await response.json();
```

---

## 🔄 Data Normalization Checklist

### When Fetching Data from API:

#### 1. **Unwrap Response Objects**
```typescript
// API returns { orders, pagination }
const json = await response.json();
const orders = json.orders || [];
```

#### 2. **Normalize Status to Lowercase**
```typescript
const normalized = orders.map((order: any) => ({
  ...order,
  status: order.status?.toLowerCase() || 'pending'
}));
```

#### 3. **Map ID Fields**
```typescript
const normalized = items.map((item: any) => ({
  ...item,
  _id: item.id || item._id // Map Prisma id to UI _id
}));
```

#### 4. **Parse JSON Fields**
```typescript
const normalized = orders.map((order: any) => ({
  ...order,
  items: typeof order.items === 'string' 
    ? JSON.parse(order.items) 
    : order.items
}));
```

### When Sending Data to API:

#### 1. **Convert Status to Uppercase**
```typescript
const apiStatus = status.toUpperCase();
body: JSON.stringify({ status: apiStatus })
```

---

## 🎨 Error State Pattern

### Add Error State to Component
```typescript
const [error, setError] = useState<string>('');

// In fetch:
try {
  // ... fetch logic
  if (!response.ok) {
    setError('Failed to load data. Please try again.');
  }
} catch (error) {
  setError('Network error. Please check your connection.');
}

// In JSX:
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    <div>
      <h3 className="text-sm font-medium text-red-800">Error Title</h3>
      <p className="text-sm text-red-700 mt-1">{error}</p>
    </div>
  </div>
)}
```

---

## 📊 Common API Endpoints

### Student APIs
```typescript
GET  /api/students/orders        // Returns { orders: [] }
GET  /api/students/favorites     // Returns { favorites: [] }
POST /api/orders                 // Create new order
```

### Restaurant APIs
```typescript
GET    /api/orders?status=all    // Returns { orders: [] }
PATCH  /api/orders/[id]          // Update order status
GET    /api/menu                 // Returns { items: [] }
POST   /api/menu                 // Create menu item
PATCH  /api/menu/[id]            // Update menu item
DELETE /api/menu/[id]            // Delete menu item
GET    /api/categories           // Returns { categories: [] }
GET    /api/packs                // Returns { packs: [] }
GET    /api/inventory            // Returns { items: [] }
GET    /api/inventory/alerts     // Returns { alerts: [] }
GET    /api/restaurant/profile   // Returns { profile: {} }
```

### Auth APIs
```typescript
POST /api/auth/login             // { email, password }
POST /api/auth/register          // { name, email, phone, password, ... }
```

---

## 🔐 Authentication Flow

### Login
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const result = await response.json();
if (result.success) {
  // Token in result.data.token
  localStorage.setItem('user', JSON.stringify(result.data.user));
  // Redirect based on role
  router.push('/dashboard/student'); // or restaurant, rider, admin
}
```

### Logout
```typescript
localStorage.removeItem('user');
localStorage.removeItem('token');
router.push('/auth/login');
```

---

## 🗂️ Database Field Reference

### Order Status (DB: UPPERCASE, UI: lowercase)
```
DB: PENDING, ACCEPTED, PREPARING, READY, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
UI: pending, accepted, preparing, ready, picked_up, in_transit, delivered, cancelled
```

### Inventory Status (DB: UPPERCASE, UI: lowercase)
```
DB: IN_STOCK, LOW_STOCK, OUT_OF_STOCK
UI: in_stock, low_stock, out_of_stock
```

### Alert Priority (DB: UPPERCASE, UI: lowercase)
```
DB: LOW, MEDIUM, HIGH
UI: low, medium, high
```

### ID Fields
```
Prisma: id (string)
UI Components: _id (string)
Always map: _id: item.id || item._id
```

---

## 🛠️ Common Fixes

### Fix: "Authorization Bearer undefined"
```typescript
// ❌ Wrong
headers: { Authorization: `Bearer ${token}` }

// ✅ Correct
const token = localStorage.getItem('token');
const headers: any = {};
if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Fix: "Cannot read property 'map' of undefined"
```typescript
// ❌ Wrong
const orders = await response.json();
orders.map(...)

// ✅ Correct
const json = await response.json();
const orders = json.orders || [];
orders.map(...)
```

### Fix: "Status filter not working"
```typescript
// ❌ Wrong
order.status === 'pending' // DB has 'PENDING'

// ✅ Correct
order.status?.toLowerCase() === 'pending'
```

### Fix: "Items show as [object Object]"
```typescript
// ❌ Wrong
items: order.items // might be JSON string

// ✅ Correct
items: typeof order.items === 'string' 
  ? JSON.parse(order.items) 
  : order.items
```

---

## 🎯 Status Color Mapping

### Order Status Colors
```typescript
const getStatusColor = (status: string) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-indigo-100 text-indigo-800',
    picked_up: 'bg-cyan-100 text-cyan-800',
    in_transit: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};
```

### Inventory Status Colors
```typescript
const getStatusColor = (status: string) => {
  const colors = {
    in_stock: 'bg-green-100 text-green-800',
    low_stock: 'bg-yellow-100 text-yellow-800',
    out_of_stock: 'bg-red-100 text-red-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};
```

---

## 📱 User Roles & Routes

### Student
```
/dashboard/student
/dashboard/student/restaurants
/dashboard/student/favorites
/dashboard/student/orders
/dashboard/student/reviews
/dashboard/student/history
/dashboard/student/profile
```

### Restaurant
```
/dashboard/restaurant
/dashboard/restaurant/orders
/dashboard/restaurant/menu
/dashboard/restaurant/inventory
/dashboard/restaurant/analytics
/dashboard/restaurant/profile
/dashboard/restaurant/settings
```

### Rider
```
/dashboard/rider
/dashboard/rider/deliveries
/dashboard/rider/my-deliveries
/dashboard/rider/earnings
/dashboard/rider/location
/dashboard/rider/profile
```

### Admin
```
/dashboard/admin
/dashboard/admin/users
/dashboard/admin/restaurants
/dashboard/admin/riders
/dashboard/admin/orders
/dashboard/admin/analytics
```

---

## 🧪 Testing Patterns

### Test API Call
```typescript
// In browser console:
const token = localStorage.getItem('token');
fetch('/api/students/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(console.log);
```

### Test Status Normalization
```typescript
const status = 'PENDING';
console.log(status.toLowerCase()); // 'pending'
```

### Test JSON Parsing
```typescript
const items = '["item1","item2"]';
console.log(JSON.parse(items)); // ["item1", "item2"]
```

---

## 🚨 Common Error Messages

### "Email and password are required"
- Frontend sending wrong fields to login API
- Check you're sending `email` not `phone`

### "Authorization required"
- Missing bearer token
- Token expired or invalid
- Check localStorage for token

### "Cannot read property 'id' of undefined"
- Response not unwrapped properly
- Check for `json.items` vs `json`

### "Invalid status"
- Status casing mismatch
- Normalize to lowercase or uppercase as needed

---

## 📦 Package Dependencies

### Key Packages
```json
{
  "next": "14.x",
  "react": "18.x",
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "react-hook-form": "^7.x",
  "react-hot-toast": "^2.x"
}
```

---

## 🔍 Debugging Tips

### Enable API Logging
```typescript
// Add to API routes:
console.log('Request body:', await request.json());
console.log('User:', userId);
console.log('Response:', json);
```

### Check Token
```typescript
// In browser console:
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));
```

### Check Response Shape
```typescript
const response = await fetch('/api/endpoint');
const json = await response.json();
console.log('Response shape:', Object.keys(json));
console.log('Full response:', json);
```

---

*Last Updated: November 9, 2025*

