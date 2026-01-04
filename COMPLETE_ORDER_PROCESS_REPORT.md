# Complete Order Process Report - Borrands Platform

## 📋 Executive Summary

This document provides a comprehensive, step-by-step breakdown of the complete order lifecycle from creation to delivery, including all API calls, status transitions, email notifications, and data flow.

---

## 🔄 Complete Order Flow

### **PHASE 1: Order Creation**

#### **Step 1.1: Student Initiates Order**
- **Frontend:** Student adds items to cart and proceeds to checkout
- **Endpoint:** `POST /api/orders`
- **Authentication:** Student JWT token required
- **Request Body:**
  ```json
  {
    "restaurantId": "string",
    "items": [
      {
        "itemId": "string",
        "quantity": number,
        "specialInstructions": "string (optional)"
      }
    ],
    "deliveryAddress": "string",
    "deliveryInstructions": "string (optional)",
    "paymentMethod": "CARD" | "CASH"
  }
  ```

#### **Step 1.2: Backend Validation & Processing**
1. **Authentication Check:**
   - Verifies JWT token
   - Confirms user role is `STUDENT`
   - Extracts `studentId` from token

2. **Restaurant Validation:**
   - Checks restaurant exists
   - Verifies `isApproved: true` and `isActive: true`
   - Fetches restaurant owner's email for notification

3. **Item Validation:**
   - Loads menu items from database to prevent price tampering
   - Validates all items exist and are published
   - Recalculates prices from database
   - Filters out invalid items

4. **Price Calculation:**
   - **Subtotal:** Sum of (item price × quantity) for all items
   - **Service Charge:** Fixed ₦150
   - **Delivery Fee:** Fixed ₦500
   - **Total:** Subtotal + Service Charge + Delivery Fee

5. **Order Number Generation:**
   - Format: `OD-{timestamp}-{random}`
   - Example: `OD-1704123456789-456`
   - Ensured unique via database constraint

#### **Step 1.3: Database Record Creation**
```sql
INSERT INTO orders (
  id, studentId, restaurantId, items, subtotal, 
  deliveryFee, total, status, paymentStatus, 
  paymentMethod, deliveryAddress, deliveryInstructions,
  estimatedDeliveryTime, orderNumber, notes, createdAt
) VALUES (...)
```

**Order Status:** `PENDING`  
**Payment Status:** `PENDING`  
**Fields Set:**
- `items`: JSON string of normalized items
- `notes`: `serviceCharge=150`
- `estimatedDeliveryTime`: From restaurant settings (default: 30 minutes)

#### **Step 1.4: Email Notification - Restaurant**
- **Function:** `sendNewOrderEmailToRestaurant()`
- **Recipient:** Restaurant owner's email
- **Subject:** `New Order #OD-xxx - Action Required`
- **Content:**
  - Order number
  - Delivery address
  - Total amount
  - List of items with quantities and prices
  - Delivery instructions (if provided)
  - **Action Required:** Login to dashboard to accept/reject

**Error Handling:** Email failure does NOT block order creation (logged only)

---

### **PHASE 2: Restaurant Response**

#### **Step 2.1: Restaurant Reviews Order**
- **Frontend:** Restaurant dashboard displays new orders
- **Status Filter:** Shows orders with `status: PENDING`
- **Action Options:** Accept or Reject

#### **Step 2.2A: Restaurant REJECTS Order**
- **Endpoint:** `PATCH /api/orders/[id]/accept-reject`
- **Authentication:** Restaurant JWT token required
- **Request Body:**
  ```json
  {
    "action": "reject",
    "rejectionReason": "string (required)"
  }
  ```

**Backend Processing:**
1. Validates restaurant owns the order
2. Verifies order status is `PENDING`
3. Validates `rejectionReason` is provided
4. Updates order:
   - `status: CANCELLED`
   - `rejectionReason: {provided reason}`
   - `rejectedAt: {current timestamp}`
   - `cancelledAt: {current timestamp}`

**Email Notification - Student:**
- **Function:** `sendOrderRejectionEmailToStudent()`
- **Recipient:** Student's email
- **Subject:** `Order #OD-xxx Rejected`
- **Content:**
  - Order number
  - Restaurant name
  - **Rejection reason** (provided by restaurant)
  - Support contact information

**Result:** Order flow ENDS ❌

#### **Step 2.2B: Restaurant ACCEPTS Order**
- **Endpoint:** `PATCH /api/orders/[id]/accept-reject`
- **Request Body:**
  ```json
  {
    "action": "accept"
  }
  ```

**Backend Processing:**
1. Validates restaurant owns the order
2. Verifies order status is `PENDING`
3. Updates order:
   - `status: ACCEPTED`
   - No other fields changed

**Email Notifications Sent:**

1. **To Admin:**
   - **Function:** `sendOrderAcceptanceNotificationToAdmin()`
   - **Recipient:** `Miebaijoan15@gmail.com` (hardcoded)
   - **Subject:** `Order #OD-xxx Accepted - Rider Assignment Required`
   - **Content:**
     - Order number
     - Restaurant name
     - Student name
     - Delivery address
     - Total amount
     - List of items
     - **Action Required:** Assign rider via admin dashboard

2. **To Student:**
   - **Function:** `sendOrderAcceptanceEmailToStudent()`
   - **Recipient:** Student's email
   - **Subject:** `Order #OD-xxx Accepted! 🎉`
   - **Content:**
     - Order number
     - Restaurant name
     - Delivery address
     - Total amount
     - List of items
     - **Message:** "Your order is being prepared. A rider will be assigned shortly."

**Order Status:** `ACCEPTED`  
**Next Step:** Admin assigns rider

---

### **PHASE 3: Rider Assignment**

#### **Step 3.1: Admin Reviews Accepted Orders**
- **Frontend:** Admin dashboard → Orders page
- **Filter:** Shows orders with `status: ACCEPTED`
- **Action:** "Assign Rider" button available

#### **Step 3.2: Admin Assigns Rider**
- **Endpoint:** `PATCH /api/admin/orders/[id]/assign-rider`
- **Authentication:** Admin JWT token required
- **Request Body:**
  ```json
  {
    "riderId": "string"
  }
  ```

**Backend Validation:**
1. Verifies user is `ADMIN`
2. Validates order exists
3. **Checks order status is `ACCEPTED`** (only ACCEPTED orders can have riders)
4. **Checks order doesn't already have a rider** (prevents duplicate assignment)
5. Validates rider exists and is active

**Backend Processing:**
1. Updates order:
   - `riderId: {selected rider ID}`
   - `status: PREPARING` (automatically updated)
2. Fetches rider details including email

**Email Notifications Sent:**

1. **To Rider:**
   - **Function:** `sendRiderAssignmentEmail()`
   - **Recipient:** Rider's email
   - **Subject:** `New Delivery Assignment - Order #OD-xxx`
   - **Content:**
     - Professional greeting
     - **Message:** "Hello, you have been assigned a delivery to [Restaurant Name]"
     - Order number
     - Delivery address
     - Student name
     - Restaurant name

2. **To Student:**
   - **Function:** `sendOrderNotificationEmail()`
   - **Recipient:** Student's email
   - **Subject:** `Order 👨‍🍳 PREPARING - #OD-xxx`
   - **Content:**
     - Order number
     - Status: PREPARING
     - Restaurant name
     - Total amount
     - **Rider name** (who will deliver)
     - Delivery address

**Order Status:** `PREPARING`  
**Next Step:** Restaurant updates status as order progresses

---

### **PHASE 4: Order Preparation & Status Updates**

#### **Step 4.1: Restaurant Updates Status to READY**
- **Endpoint:** `PATCH /api/orders/[id]`
- **Authentication:** Restaurant JWT token required
- **Request Body:**
  ```json
  {
    "status": "READY"
  }
  ```

**Backend Processing:**
1. Validates restaurant owns the order
2. Validates status transition: `PREPARING → READY` (valid)
3. Updates order: `status: READY`
4. Fetches student details for notification

**Email Notification - Student:**
- **Function:** `sendOrderNotificationEmail()`
- **Recipient:** Student's email
- **Subject:** `Order 📦 READY - #OD-xxx`
- **Content:**
  - Order number
  - Status: READY
  - Restaurant name
  - Total amount
  - Delivery address
  - **Message:** "Your order is ready for pickup"

**Order Status:** `READY`  
**Next Step:** Restaurant marks as PICKED_UP when rider collects

#### **Step 4.2: Restaurant Updates Status to PICKED_UP**
- **Endpoint:** `PATCH /api/orders/[id]`
- **Request Body:**
  ```json
  {
    "status": "PICKED_UP"
  }
  ```

**Backend Processing:**
1. Validates status transition: `READY → PICKED_UP` (valid)
2. Updates order: `status: PICKED_UP`

**Email Notification - Student:**
- **Function:** `sendOrderNotificationEmail()`
- **Recipient:** Student's email
- **Subject:** `Order 🚚 PICKED_UP - #OD-xxx`
- **Content:**
  - Order number
  - Status: PICKED_UP
  - Restaurant name
  - Total amount
  - Delivery address
  - **Message:** "Your order has been picked up and is on the way"

**Order Status:** `PICKED_UP`  
**Next Step:** Student marks as received when delivery arrives

---

### **PHASE 5: Order Delivery & Completion**

#### **Step 5.1: Student Receives Order**
- **Frontend:** Student order tracking page
- **Action:** "Mark as Received" button appears when status is `PICKED_UP`

#### **Step 5.2: Student Marks Order as Received**
- **Endpoint:** `PATCH /api/students/orders/[id]`
- **Authentication:** Student JWT token required
- **Request Body:**
  ```json
  {
    "action": "complete"
  }
  ```

**Backend Validation:**
1. Verifies student owns the order
2. **Checks order status is `PICKED_UP`** (only PICKED_UP orders can be marked complete)
3. Prevents duplicate completion (checks if already DELIVERED)

**Backend Processing:**
1. Updates order:
   - `status: DELIVERED`
   - `actualDeliveryTime: {current timestamp}`

**Order Status:** `DELIVERED`  
**Next Step:** Optional rating/review

#### **Step 5.3: Optional - Student Rates Order**
- **Endpoint:** `PATCH /api/students/orders/[id]`
- **Request Body:**
  ```json
  {
    "action": "rate",
    "rating": 1-5,
    "review": "string (optional)"
  }
  ```

**Backend Validation:**
1. Verifies order status is `DELIVERED`
2. Checks order hasn't been rated already
3. Validates rating is 1-5

**Backend Processing:**
1. Updates order:
   - `rating: {provided rating}`
   - `review: {provided review or empty string}`
   - `ratedAt: {current timestamp}`

**Order Status:** `DELIVERED` (unchanged)  
**Order Flow:** COMPLETE ✅

---

## 📊 Status Transition Matrix

| Current Status | Valid Next Statuses | Who Can Change | Notes |
|---------------|---------------------|---------------|-------|
| `PENDING` | `ACCEPTED`, `CANCELLED` | Restaurant | Initial state |
| `ACCEPTED` | `PREPARING`, `CANCELLED` | Admin (PREPARING), Restaurant (CANCELLED) | PREPARING set automatically when rider assigned |
| `PREPARING` | `READY`, `CANCELLED` | Restaurant | Order being prepared |
| `READY` | `PICKED_UP`, `CANCELLED` | Restaurant | Ready for pickup |
| `PICKED_UP` | `DELIVERED` | Student | Rider has collected order |
| `DELIVERED` | *(none)* | *(final state)* | Order complete |
| `CANCELLED` | *(none)* | *(final state)* | Order cancelled |

---

## 📧 Complete Email Notification Matrix

| Event | Recipient | Function | Trigger | Status Change |
|-------|-----------|----------|---------|---------------|
| Order Created | Restaurant | `sendNewOrderEmailToRestaurant()` | Order creation | `PENDING` |
| Order Accepted | Admin | `sendOrderAcceptanceNotificationToAdmin()` | Restaurant accepts | `ACCEPTED` |
| Order Accepted | Student | `sendOrderAcceptanceEmailToStudent()` | Restaurant accepts | `ACCEPTED` |
| Order Rejected | Student | `sendOrderRejectionEmailToStudent()` | Restaurant rejects | `CANCELLED` |
| Rider Assigned | Rider | `sendRiderAssignmentEmail()` | Admin assigns rider | `PREPARING` |
| Rider Assigned | Student | `sendOrderNotificationEmail()` | Admin assigns rider | `PREPARING` |
| Status: PREPARING | Student | `sendOrderNotificationEmail()` | Restaurant updates | `PREPARING` |
| Status: READY | Student | `sendOrderNotificationEmail()` | Restaurant updates | `READY` |
| Status: PICKED_UP | Student | `sendOrderNotificationEmail()` | Restaurant updates | `PICKED_UP` |

**Note:** No email sent when student marks as DELIVERED (student-initiated action)

---

## 🔒 Security & Validation Checks

### **Authentication & Authorization:**
- ✅ All endpoints require JWT authentication
- ✅ Role-based access control enforced:
  - Students can only create/complete their own orders
  - Restaurants can only manage their own orders
  - Admins can assign riders to any ACCEPTED order
- ✅ Order ownership verified before any modification

### **Data Validation:**
- ✅ Item prices validated from database (prevents tampering)
- ✅ Status transitions validated (prevents invalid state changes)
- ✅ Required fields validated (rejection reason, rider ID, etc.)
- ✅ Duplicate assignments prevented (rider already assigned check)
- ✅ JSON parsing errors handled gracefully

### **Error Handling:**
- ✅ Email failures don't block order processing
- ✅ JSON parse errors handled with fallback to empty array
- ✅ Database errors caught and logged
- ✅ Clear error messages returned to clients

---

## 🐛 Bugs Fixed in This Review

1. ✅ **IN_TRANSIT Status Bug:** Removed reference to non-existent `IN_TRANSIT` status
2. ✅ **Duplicate Query:** Optimized to single database query in status update endpoint
3. ✅ **JSON Parse Errors:** Added try-catch blocks for all `JSON.parse()` operations
4. ✅ **Rider Duplicate Assignment:** Added check to prevent assigning rider to order that already has one
5. ✅ **Error Messages:** Improved to include current status for better debugging
6. ✅ **Item Parsing:** Optimized to parse once and reuse in accept/reject endpoint

---

## 📝 Data Flow Summary

```
Student → Creates Order (PENDING)
    ↓
Restaurant → Receives Email
    ↓
Restaurant → Accepts/Rejects
    ├─→ Reject: Student gets email, Order CANCELLED ❌
    └─→ Accept: Admin + Student get emails, Order ACCEPTED
        ↓
        Admin → Assigns Rider
            ↓
            Order → Status: PREPARING
            ↓
            Rider + Student → Get emails
            ↓
            Restaurant → Updates Status: READY
                ↓
                Student → Gets email
                ↓
                Restaurant → Updates Status: PICKED_UP
                    ↓
                    Student → Gets email
                    ↓
                    Student → Marks as Received
                        ↓
                        Order → Status: DELIVERED ✅
                        ↓
                        (Optional) Student → Rates Order
```

---

## 🔍 Key Technical Details

### **Order Number Format:**
- Pattern: `OD-{timestamp}-{random}`
- Example: `OD-1704123456789-456`
- Ensures uniqueness across all orders

### **Price Calculation:**
- **Subtotal:** Sum of (item price × quantity)
- **Service Charge:** ₦150 (fixed)
- **Delivery Fee:** ₦500 (fixed)
- **Total:** Subtotal + Service Charge + Delivery Fee

### **Items Storage:**
- Stored as JSON string in database
- Parsed when needed for emails/display
- Error handling: Falls back to empty array if parse fails

### **Timestamps:**
- `createdAt`: Order creation time
- `rejectedAt`: When restaurant rejects (if rejected)
- `cancelledAt`: When order cancelled
- `actualDeliveryTime`: When student marks as received
- `ratedAt`: When student rates order

---

## ⚠️ Important Notes

1. **Admin Email:** Currently hardcoded to `Miebaijoan15@gmail.com` in `sendOrderAcceptanceNotificationToAdmin()`
2. **Payment Status:** Currently set to `PENDING` on order creation. Payment verification should be integrated with Paystack callback.
3. **Status Validation:** All status transitions are strictly validated to prevent invalid state changes.
4. **Email Failures:** Email sending failures are logged but do NOT block order processing.
5. **No WhatsApp:** All notifications are email-based (WhatsApp functionality removed).

---

## 🎯 Success Criteria

An order is considered successfully completed when:
- ✅ Order created with valid items and pricing
- ✅ Restaurant accepts the order
- ✅ Admin assigns a rider
- ✅ Restaurant updates status through READY → PICKED_UP
- ✅ Student marks order as received (DELIVERED)
- ✅ All parties receive appropriate email notifications
- ✅ Order status transitions follow valid flow

---

*Last Updated: Comprehensive review completed*
*All bugs fixed and inconsistencies resolved*

