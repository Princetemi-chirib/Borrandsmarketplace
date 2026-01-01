# Restaurant System - Potential Bugs Report

## Critical Bugs (High Priority)

### 1. **Missing Import in Restaurant Stats API**
**File:** `app/api/restaurant/stats/route.ts`
**Issue:** Line 9 calls `verifyAppRequest()` but the import is missing the function itself (only imports the type)
**Impact:** API endpoint will crash when called
**Fix:** Ensure `verifyAppRequest` is properly imported from `@/lib/auth-app`

### 2. **Menu Items Not Loaded on Dashboard**
**File:** `app/dashboard/restaurant/page.tsx`
**Issue:** Line 95 declares `menuItems` state but it's never populated from API. Line 574 tries to use `menuItems.slice(0, 3)` but array is always empty.
**Impact:** Menu items preview section shows empty even when items exist
**Fix:** Add API call to fetch menu items in `fetchDashboardData()`

### 3. **Missing Stock Fields on Menu Items Display**
**File:** `app/dashboard/restaurant/page.tsx` (Lines 585-587)
**Issue:** Code tries to access `item.stock` and `item.lowStockThreshold` but MenuItem interface doesn't have these fields. Menu items don't have stock - inventory items do.
**Impact:** Runtime error when rendering menu items preview
**Fix:** Remove stock display from menu items or fetch inventory data separately

### 4. **Incorrect Index Finding in Quick Availability Toggle**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Lines 408-412, 456-460)
**Issue:** `findIndex` used to find global index, but if item doesn't exist in main array, returns -1, causing incorrect updates
**Impact:** Toggling availability may update wrong item or fail silently
**Fix:** Use item ID directly instead of index-based lookup

### 5. **Missing Error Handling for JSON.parse**
**File:** `app/dashboard/restaurant/orders/page.tsx` (Line 64)
**Issue:** `JSON.parse(order.items)` can throw if items string is malformed
**Impact:** Page crashes if order items JSON is invalid
**Fix:** Wrap in try-catch or use safe parsing function

---

## High Priority Bugs

### 6. **Race Condition in Menu Item Reordering**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Lines 148-161)
**Issue:** Items swapped in state immediately, but API calls are async and not awaited. If user moves multiple items quickly, state can get out of sync.
**Impact:** Menu item order can become inconsistent between UI and database
**Fix:** Disable UI during reorder operation, await both API calls

### 7. **No Validation Before Category Deletion**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Lines 577-580)
**Issue:** Categories can be deleted even if they have menu items. Schema has cascade delete, but no user warning.
**Impact:** All items in category will be deleted unexpectedly
**Fix:** Add check for items in category before deletion, show warning to user

### 8. **Empty Catch Blocks Hide Errors**
**File:** Multiple files
**Issue:** Empty `catch {}` blocks in several places (menu page lines 160, 174, orders page line 90)
**Impact:** Errors are silently swallowed, making debugging impossible
**Fix:** Add error logging at minimum: `catch (error) { console.error('Operation failed:', error); }`

### 9. **Incorrect Status Mapping in Orders**
**File:** `app/dashboard/restaurant/orders/page.tsx` (Lines 42-44, 96-100)
**Issue:** UI shows "Confirmed" but API expects "accepted". Normalization function only maps one way. Filtering compares lowercase but UI buttons use title case.
**Impact:** Status filtering may not work correctly, status updates may fail
**Fix:** Consistent status normalization throughout (store as lowercase, display as formatted)

### 10. **Missing Restaurant ID Validation in Menu Update**
**File:** `app/api/menu/[id]/route.ts` (Line 40)
**Issue:** After `updateMany`, fetches item by ID only, doesn't verify it belongs to restaurant. Could return item from another restaurant if ID collision occurs.
**Impact:** Security issue - could expose other restaurants' menu items
**Fix:** Add `restaurantId` to `findUnique` query

---

## Medium Priority Bugs

### 11. **Date Comparison Timezone Issues**
**File:** `app/api/restaurant/stats/route.ts` (Lines 29-38)
**Issue:** Date filtering for "today" uses local timezone but database stores UTC. Can show wrong day's orders depending on timezone.
**Impact:** "Today's revenue" may be inaccurate
**Fix:** Use UTC consistently or convert properly

### 12. **Missing Error Messages for Failed Operations**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Multiple locations)
**Issue:** Many API calls don't show error messages to user if they fail. User sees no feedback.
**Impact:** Poor UX, users don't know why operations fail
**Fix:** Add error state and display error messages

### 13. **Potential Memory Leak with EventSource**
**File:** `app/dashboard/restaurant/orders/page.tsx` (Lines 80-92)
**Issue:** EventSource cleanup in useEffect, but if component unmounts during fetch, connection may not close properly
**Impact:** Memory leaks, multiple open connections
**Fix:** Ensure cleanup runs in all code paths

### 14. **No Loading State During Availability Toggle**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Lines 216-255)
**Issue:** Toggle button has no loading indicator, user can spam click causing multiple API calls
**Impact:** Race conditions, unnecessary API calls, UI inconsistency
**Fix:** Add loading state, disable button during operation

### 15. **Duplicate Category Items Filtering Logic**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Lines 395-442, 445-476)
**Issue:** Filtering logic for uncategorized items is duplicated. If categories are filtered differently, items might appear in both sections.
**Impact:** Items could appear multiple times or be missed
**Fix:** Extract filtering logic to reusable function

### 16. **Missing Token Validation in Frontend**
**File:** Multiple dashboard pages
**Issue:** Token retrieved from localStorage but no validation if it's expired or valid format
**Impact:** API calls fail with 401, but user sees generic error
**Fix:** Check token expiry/validity before API calls, redirect to login if invalid

### 17. **No Confirmation for Delete Operations**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Lines 163-175, 577-580, 613-616)
**Issue:** Items, categories, and packs can be deleted immediately without confirmation
**Impact:** Accidental deletions, poor UX
**Fix:** Add confirmation dialogs for delete operations

### 18. **Race Condition in Item Availability Toggle**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Lines 216-255)
**Issue:** If user toggles same item multiple times quickly, optimistic updates and API responses can conflict
**Impact:** Final state may be incorrect
**Fix:** Add debouncing or disable button during operation

---

## Low Priority Bugs / Code Quality Issues

### 19. **Inconsistent ID Field Handling**
**File:** Multiple files
**Issue:** Code uses both `_id` and `id` fields, with normalization. This creates confusion and potential bugs.
**Impact:** Subtle bugs when ID format doesn't match expectations
**Fix:** Standardize on one ID format throughout (prefer `id` from Prisma)

### 20. **Missing Input Validation**
**File:** `app/dashboard/restaurant/menu/page.tsx` (Line 178)
**Issue:** `saveItem` validates required fields but no validation for price > 0, name length, description length
**Impact:** Invalid data can be saved
**Fix:** Add comprehensive validation

### 21. **No Pagination for Menu Items**
**File:** `app/dashboard/restaurant/menu/page.tsx`
**Issue:** All menu items loaded at once. Large restaurants could have performance issues.
**Impact:** Slow page loads, memory issues with many items
**Fix:** Implement pagination or virtual scrolling

### 22. **Silent Failures in Settings Save**
**File:** `app/dashboard/restaurant/settings/page.tsx` (Lines 182-225)
**Issue:** If API call fails, error shown but form data not reverted. User may think save succeeded.
**Impact:** Data loss, user confusion
**Fix:** Revert form on error or reload from server

### 23. **Hardcoded Status Colors in Orders**
**File:** `app/dashboard/restaurant/orders/page.tsx` (Lines 103-120)
**Issue:** Status colors hardcoded in multiple places. If status enum changes, colors won't update.
**Impact:** Maintenance burden, potential styling bugs
**Fix:** Extract to constant object or utility function

### 24. **Missing Error Boundary**
**File:** All dashboard pages
**Issue:** No React Error Boundaries. If component crashes, entire page breaks.
**Impact:** Poor error recovery, bad UX
**Fix:** Add Error Boundaries around main sections

### 25. **No Optimistic Updates for Some Operations**
**File:** `app/dashboard/restaurant/settings/page.tsx`
**Issue:** Restaurant status toggle uses optimistic update, but other settings don't. Inconsistent UX.
**Impact:** Some operations feel slower than others
**Fix:** Use optimistic updates consistently or remove them

### 26. **Missing Type Safety**
**File:** Multiple files
**Issue:** Heavy use of `any` types (e.g., `item: any`, `order: any`). Loses TypeScript benefits.
**Impact:** Runtime errors that could be caught at compile time
**Fix:** Define proper interfaces/types

### 27. **No Debouncing for Search**
**File:** `app/dashboard/restaurant/orders/page.tsx` (Line 96-100)
**Issue:** Search filter runs on every keystroke. Can cause performance issues with many orders.
**Impact:** Laggy search experience
**Fix:** Add debouncing (e.g., 300ms delay)

### 28. **Missing Accessibility Attributes**
**File:** Multiple components
**Issue:** Toggle buttons, action buttons missing proper ARIA labels, keyboard navigation
**Impact:** Poor accessibility for screen readers
**Fix:** Add proper ARIA attributes

### 29. **Inventory Status Case Sensitivity**
**File:** `app/dashboard/restaurant/inventory/page.tsx` (Lines 94-98)
**Issue:** Status normalized to lowercase, but API might return uppercase. Comparison may fail.
**Impact:** Status filtering doesn't work correctly
**Fix:** Consistent case handling (normalize at API boundary)

### 30. **No Handling for Concurrent Order Status Updates**
**File:** `app/api/orders/[id]/route.ts` (Lines 54-62)
**Issue:** Status transition checked, but if two requests come simultaneously, both might pass validation
**Impact:** Invalid status transitions possible
**Fix:** Add database-level constraint or optimistic locking

---

## Data Integrity Issues


### 31. **Category Deletion Cascade Behavior**
**File:** Schema + Menu Management
**Issue:** Deleting category cascades to delete all menu items (onDelete: Cascade). No warning to user.
**Impact:** Data loss, user confusion
**Fix:** Add validation or change cascade behavior

### 32. **Pack Deletion Impact**
**File:** Schema
**Issue:** Packs can be deleted even if menu items reference them. Schema allows null, but deleted pack ID might still exist in items.
**Impact:** Orphaned references, potential errors
**Fix:** Validate before deletion, set packId to null for affected items

---

## Security Concerns

### 33. **Token in URL for EventSource**
**File:** `app/dashboard/restaurant/orders/page.tsx` (Line 84)
**Issue:** Token passed in URL query string for EventSource. URLs logged in browser history, server logs.
**Impact:** Token exposure risk
**Fix:** Use headers or cookies for authentication

### 34. **No Rate Limiting on Toggle Operations**
**File:** `app/dashboard/restaurant/menu/page.tsx`
**Issue:** Availability toggle can be called rapidly. No rate limiting on frontend or backend.
**Impact:** Potential DoS, unnecessary server load
**Fix:** Add debouncing or rate limiting

### 35. **Missing CSRF Protection**
**File:** All API endpoints
**Issue:** No CSRF tokens for state-changing operations
**Impact:** CSRF attack vulnerability
**Fix:** Implement CSRF protection for PATCH/POST/DELETE operations

---

## Summary by Category

**Critical (Must Fix Immediately):** 5 bugs
**High Priority:** 5 bugs  
**Medium Priority:** 13 bugs
**Low Priority:** 11 bugs

**Total: 34 potential bugs identified**

---

## Notes

This bug report was generated through code review. Some items may be false positives or intentional design decisions. Each should be verified through:
1. Manual testing
2. Code review with team
3. Running the application and checking for actual errors
4. Reviewing design decisions and requirements

**Most Critical Areas:**
1. Restaurant Stats API (syntax errors, missing imports)
2. Menu Items not loading on dashboard
3. Index-based state updates in availability toggle
4. Missing error handling for JSON parsing
5. Security issues with authentication

