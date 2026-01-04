# Complete Order Flow Documentation

## Overview
This document outlines the complete order flow from creation to completion in the Borrands platform.

---

## 📋 Order Flow Steps

### **Step 1: Order Creation** 
**Endpoint:** `POST /api/orders`  
**Actor:** Student

1. Student places an order through checkout
2. Order is created with status: `PENDING`
3. Order details include:
   - Items, quantities, prices
   - Delivery address and instructions
   - Payment method
   - Subtotal, delivery fee, service charge (₦150), total
   - Order number (format: `OD-{timestamp}-{random}`)

4. **Email Notification Sent:**
   - **To:** Restaurant owner's email
   - **Function:** `sendNewOrderEmailToRestaurant()`
   - **Content:** New order details with accept/reject options

---

### **Step 2: Restaurant Accept/Reject**
**Endpoint:** `PATCH /api/orders/[id]/accept-reject`  
**Actor:** Restaurant

#### **Option A: Restaurant REJECTS Order**
1. Restaurant sends `action: 'reject'` with `rejectionReason`
2. Order status changes to: `CANCELLED`
3. `rejectedAt` and `cancelledAt` timestamps are set
4. **Email Notification Sent:**
   - **To:** Student's email
   - **Function:** `sendOrderRejectionEmailToStudent()`
   - **Content:** Order rejection with reason
5. **Flow Ends** ❌

#### **Option B: Restaurant ACCEPTS Order**
1. Restaurant sends `action: 'accept'`
2. Order status changes to: `ACCEPTED`
3. **Email Notification Sent:**
   - **To:** Admin email (`Miebaijoan15@gmail.com`)
   - **Function:** `sendOrderAcceptanceNotificationToAdmin()`
   - **Content:** Order accepted, rider assignment required
   - **Action Required:** Admin must assign a rider

---

### **Step 3: Admin Assigns Rider**
**Endpoint:** `PATCH /api/admin/orders/[id]/assign-rider`  
**Actor:** Admin

1. Admin selects a rider from available riders
2. Admin assigns rider via dashboard
3. Order status changes to: `PREPARING`
4. `riderId` is set on the order
5. **Email Notification Sent:**
   - **To:** Rider's email
   - **Function:** `sendRiderAssignmentEmail()`
   - **Content:** 
     - "Hello, you have been assigned a delivery to [restaurant name]"
     - Order number
     - Delivery address
     - Student name
     - Restaurant name

---

### **Step 4: Restaurant Updates Order Status**
**Endpoint:** `PATCH /api/orders/[id]`  
**Actor:** Restaurant

Restaurant can update order status through valid transitions:

1. **PREPARING → READY**
   - Order is ready for pickup
   - Status: `READY`

2. **READY → PICKED_UP**
   - Rider has picked up the order
   - Status: `PICKED_UP`

**Valid Status Transitions:**
```
PENDING → ACCEPTED | CANCELLED
ACCEPTED → PREPARING | CANCELLED
PREPARING → READY | CANCELLED
READY → PICKED_UP | CANCELLED
PICKED_UP → DELIVERED
DELIVERED → (final state)
CANCELLED → (final state)
```

---

### **Step 5: Student Marks Order as Received**
**Endpoint:** `PATCH /api/students/orders/[id]`  
**Actor:** Student

1. Student clicks "Mark as Received" button
2. Sends `action: 'complete'`
3. Order status changes to: `DELIVERED`
4. `actualDeliveryTime` timestamp is set
5. **Condition:** Order must be `PICKED_UP` or `IN_TRANSIT` status

---

### **Step 6: Optional - Student Rates Order**
**Endpoint:** `PATCH /api/students/orders/[id]`  
**Actor:** Student

1. Student can rate the order (1-5 stars)
2. Student can leave a review
3. Sends `action: 'rate'` with `rating` and `review`
4. `ratedAt` timestamp is set
5. **Condition:** Order must be `DELIVERED` and not already rated

---

## 📧 Email Notifications Summary

| Step | Recipient | Function | Trigger |
|------|-----------|----------|---------|
| 1 | Restaurant | `sendNewOrderEmailToRestaurant()` | Order created |
| 2A | Student | `sendOrderRejectionEmailToStudent()` | Order rejected |
| 2B | Admin | `sendOrderAcceptanceNotificationToAdmin()` | Order accepted |
| 3 | Rider | `sendRiderAssignmentEmail()` | Rider assigned |

---

## 🔄 Order Status Flow Diagram

```
PENDING
  ↓
  ├─→ CANCELLED (if rejected)
  │
  └─→ ACCEPTED
       ↓
       ├─→ CANCELLED (if cancelled)
       │
       └─→ PREPARING (when rider assigned)
            ↓
            ├─→ CANCELLED (if cancelled)
            │
            └─→ READY
                 ↓
                 ├─→ CANCELLED (if cancelled)
                 │
                 └─→ PICKED_UP
                      ↓
                      └─→ DELIVERED (when student marks as received)
```

---

## 🎯 Key Points

1. **Order Creation:** Only students can create orders
2. **Accept/Reject:** Only restaurants can accept/reject pending orders
3. **Rider Assignment:** Only admins can assign riders to ACCEPTED orders
4. **Status Updates:** Restaurants can update status through valid transitions
5. **Completion:** Students mark orders as received when they get the delivery
6. **Email Notifications:** All key steps trigger email notifications
7. **No WhatsApp:** All notifications are email-based (WhatsApp removed)

---

## 🔍 API Endpoints Reference

- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]/accept-reject` - Restaurant accept/reject
- `PATCH /api/admin/orders/[id]/assign-rider` - Admin assign rider
- `PATCH /api/orders/[id]` - Restaurant update status
- `PATCH /api/students/orders/[id]` - Student complete/rate order

---

## ⚠️ Important Notes

1. **Admin Email:** Currently hardcoded to `Miebaijoan15@gmail.com` in `sendOrderAcceptanceNotificationToAdmin()`
2. **Status Validation:** All status transitions are validated to prevent invalid state changes
3. **Error Handling:** Email failures don't block order processing (errors are logged)
4. **Authentication:** All endpoints require proper authentication and role verification

---

## 📝 Status Definitions

- **PENDING:** Order created, awaiting restaurant response
- **ACCEPTED:** Restaurant accepted, awaiting rider assignment
- **PREPARING:** Rider assigned, restaurant preparing order
- **READY:** Order ready for pickup
- **PICKED_UP:** Rider has picked up the order
- **DELIVERED:** Order delivered to student
- **CANCELLED:** Order cancelled (by restaurant or student)

---

*Last Updated: Based on current codebase analysis*

