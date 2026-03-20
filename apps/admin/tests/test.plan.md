# RawStack Admin Dashboard Test Plan

## Application Overview

The RawStack Admin Dashboard is a React + Vite single-page application running at http://localhost:5173. It provides an authenticated administration interface for managing platform users and account settings. Authentication state is JWT-based, persisted in localStorage, and refreshed via refresh tokens. The app has three primary routes: the root path `/` which renders a Login page for unauthenticated users and the Dashboard for authenticated users; `/users` for user management; and `/new-password` for password updates. All authenticated routes share a common layout consisting of a collapsible sidebar, a site header with breadcrumbs and a theme toggle, and a slide-in drawer for account and user forms. An unauthenticated user accessing any protected route is redirected to `/` (the Login page). Only users with admin privileges are permitted to log in.

## Test Scenarios

### 1. Authentication - Login

**Seed:** `tests/auth.setup.ts`

#### 1.1. Login page renders correctly when unauthenticated

**File:** `tests/auth/login-page-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state
    - expect: The page title is 'Rawstack admin dashboard'
    - expect: The RawStack logo and 'Admin Dashboard' heading are visible
    - expect: An Email input with placeholder 'hi@rawstack.io' is present
    - expect: A Password input with placeholder '*********' is present
    - expect: A 'Login' button is present and is disabled
    - expect: A 'Forgot Password' ghost button is present

#### 1.2. Login button is disabled until form is valid

**File:** `tests/auth/login-button-state.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state
    - expect: The 'Login' button is disabled
  2. Type a valid email address into the Email field
    - expect: The 'Login' button remains disabled because the password field is still empty
  3. Type fewer than 8 characters into the Password field
    - expect: The 'Login' button remains disabled due to failing the minimum length validation
  4. Type 8 or more characters into the Password field
    - expect: The 'Login' button becomes enabled

#### 1.3. Login field validation errors are shown inline

**File:** `tests/auth/login-validation.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state
  2. Type an invalid string (e.g. 'notanemail') into the Email field and tab away
    - expect: An inline error message reading 'Invalid email address' appears beneath the Email field
  3. Clear the Email field and tab away
    - expect: An inline error message reading 'Email is required' appears beneath the Email field
  4. Type a valid email, then type fewer than 8 characters into the Password field and tab away
    - expect: An inline error message reading 'Password must be at least 8 characters' appears beneath the Password field

#### 1.4. Successful admin login redirects to Dashboard

**File:** `tests/auth/login-success.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state
    - expect: The Login form is displayed
  2. Enter a valid admin email and a valid password (at least 8 characters), then click 'Login'
    - expect: The Login button enters a submitting/loading state while the request is in flight
  3. Wait for the login request to complete
    - expect: The user is redirected to the Dashboard page at '/'
    - expect: The sidebar, site header, and dashboard content are visible
    - expect: No error toast is displayed

#### 1.5. Login with invalid credentials shows error toast

**File:** `tests/auth/login-invalid-credentials.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state
    - expect: The Login form is displayed
  2. Enter a valid email and an incorrect password (8+ characters), then click 'Login'
    - expect: An error toast notification appears with the message 'Something went wrong!'
    - expect: The user remains on the Login page
    - expect: The Login form is still visible

#### 1.6. Login with a non-admin account is rejected

**File:** `tests/auth/login-non-admin.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state
    - expect: The Login form is displayed
  2. Enter the credentials of a user who exists but does not have the admin role, then click 'Login'
    - expect: An error toast notification appears with the message 'Something went wrong!'
    - expect: The user remains on the Login page and is not authenticated

#### 1.7. Forgot Password button toggles to password reset form

**File:** `tests/auth/forgot-password-toggle.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state
    - expect: The Login form is shown with 'Login' button and 'Forgot Password' ghost button
  2. Click the 'Forgot Password' button
    - expect: The password reset request form is displayed
    - expect: An Email input is present
    - expect: A 'Reset Password' button is present and disabled
    - expect: A 'Login' ghost button is present
    - expect: The Login form (with the Password field) is no longer visible
  3. Click the 'Login' button
    - expect: The standard Login form is restored with both Email and Password fields visible
    - expect: The 'Forgot Password' button is shown again

#### 1.8. Password reset request form validation and submission

**File:** `tests/auth/password-reset-request.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 with no stored auth state and click 'Forgot Password'
    - expect: The password reset request form is displayed with 'Reset Password' button disabled
  2. Type an invalid string into the Email field (e.g. 'bademail') and tab away
    - expect: An inline validation error is displayed beneath the Email field
    - expect: The 'Reset Password' button remains disabled
  3. Clear the field and type a valid email address
    - expect: The inline error disappears
    - expect: The 'Reset Password' button becomes enabled
  4. Click 'Reset Password'
    - expect: A success toast appears stating 'A password reset link has been sent to {email}'
    - expect: The button enters a submitting state while the request is in flight

#### 1.9. Auto-login via URL token and email parameters

**File:** `tests/auth/auto-login.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/?password-token=VALID_TOKEN&email=admin@example.com with no stored auth state
    - expect: The standard Login form with Logo and heading is NOT rendered
    - expect: A spinner/loading indicator is displayed while the auto-login request is in flight
  2. Wait for the auto-login request to complete successfully
    - expect: A success toast appears with the message 'Auto login successful!'
    - expect: The user is automatically redirected to the '/new-password' page

#### 1.10. Auto-login with invalid token shows error and falls back to login form

**File:** `tests/auth/auto-login-error.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/?password-token=INVALID_TOKEN&email=admin@example.com with no stored auth state
    - expect: The auto-login spinner is displayed briefly
  2. Wait for the auto-login request to fail
    - expect: An error toast appears with the message 'Auto login failed, please login manually.'
    - expect: The standard Login form is displayed with the Logo, Email field, Password field, and 'Forgot Password' button

### 2. Protected Routes - Unauthenticated Access

**Seed:** `tests/auth.setup.ts`

#### 2.1. Unauthenticated access to /users redirects to login page

**File:** `tests/routing/unauthenticated-users-redirect.spec.ts`

**Steps:**
  1. With no stored auth state, navigate directly to http://localhost:5173/users
    - expect: The browser URL becomes http://localhost:5173/
    - expect: The Login page is displayed with the Email and Password fields
    - expect: The Users page content ('Rawstack Users') is not shown

#### 2.2. Unauthenticated access to /new-password redirects to login page

**File:** `tests/routing/unauthenticated-new-password-redirect.spec.ts`

**Steps:**
  1. With no stored auth state, navigate directly to http://localhost:5173/new-password
    - expect: The browser URL becomes http://localhost:5173/
    - expect: The Login page is displayed
    - expect: The 'Reset Your Password' form is not shown

#### 2.3. Unknown routes redirect to root

**File:** `tests/routing/unknown-route-redirect.spec.ts`

**Steps:**
  1. With no stored auth state, navigate to http://localhost:5173/some-nonexistent-path
    - expect: The browser URL becomes http://localhost:5173/
    - expect: The Login page is displayed
  2. Log in as an admin user, then navigate to http://localhost:5173/some-nonexistent-path
    - expect: The browser URL becomes http://localhost:5173/
    - expect: The Dashboard page is displayed

### 3. Dashboard

**Seed:** `tests/auth.setup.ts`

#### 3.1. Dashboard renders correctly when authenticated

**File:** `tests/dashboard/dashboard-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user
    - expect: The page displays 'This is your dashboard...' as the main heading
    - expect: A subtitle reading 'fill it with widgets, graphs and all the stats about your business!' is visible
    - expect: The sidebar is present on the left
    - expect: The site header with breadcrumb is present at the top
    - expect: The breadcrumb shows 'Dashboard > Dashboard'

#### 3.2. Sidebar navigation links are present and functional

**File:** `tests/dashboard/sidebar-navigation.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user
    - expect: The sidebar contains a 'Dashboard' navigation link
    - expect: The sidebar contains a 'Users' navigation link
    - expect: The RawStack logo is visible in the sidebar header
    - expect: The current user's email is displayed in the sidebar footer
  2. Click the 'Users' link in the sidebar
    - expect: The URL changes to http://localhost:5173/users
    - expect: The Users management page is rendered with the heading 'Rawstack Users'
  3. Click the 'Dashboard' link in the sidebar
    - expect: The URL changes to http://localhost:5173/
    - expect: The Dashboard page is rendered with 'This is your dashboard...'

#### 3.3. Sidebar can be collapsed and expanded

**File:** `tests/dashboard/sidebar-collapse.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user
    - expect: The sidebar is visible and expanded
  2. Click the sidebar toggle button in the site header
    - expect: The sidebar collapses or slides out of view (offcanvas behaviour)
  3. Click the sidebar toggle button again
    - expect: The sidebar expands back to its original state

#### 3.4. Theme toggle switches between Dark and Light mode

**File:** `tests/dashboard/theme-toggle.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user
    - expect: The site header shows a Moon icon indicating Dark mode is currently active
  2. Click the theme toggle button (Moon icon) in the site header
    - expect: The icon changes to a Sun icon indicating Light mode is now active
    - expect: The page appearance changes to reflect the Light theme
  3. Click the theme toggle button again (Sun icon)
    - expect: The icon changes back to a Moon icon
    - expect: The page appearance changes back to the Dark theme
  4. Reload the page
    - expect: The theme previously selected is persisted (stored in localStorage) and applied on load

#### 3.5. Breadcrumb link navigates back to Dashboard from a sub-page

**File:** `tests/dashboard/breadcrumb-navigation.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
    - expect: The breadcrumb shows 'Dashboard > Users'
  2. Click the 'Dashboard' breadcrumb link
    - expect: The URL changes to http://localhost:5173/
    - expect: The Dashboard page is rendered

### 4. User Account Menu and Logout

**Seed:** `tests/auth.setup.ts`

#### 4.1. User menu dropdown shows Account and Log out options

**File:** `tests/account/user-menu-dropdown.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user
    - expect: The sidebar footer shows the authenticated user's email address
  2. Click the user menu button in the sidebar footer (the element showing the user email with a chevron icon)
    - expect: A dropdown menu appears
    - expect: The menu contains an 'Account' option with a user icon
    - expect: The menu contains a 'Log out' option with a logout icon

#### 4.2. Clicking Account in user menu opens the account drawer

**File:** `tests/account/user-menu-account-drawer.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user
  2. Click the user menu button in the sidebar footer, then click 'Account'
    - expect: A slide-in drawer opens from the right on desktop (or from the bottom on mobile)
    - expect: The drawer title reads 'Edit Your Account'
    - expect: The Account form is displayed inside the drawer

#### 4.3. Account drawer can be closed

**File:** `tests/account/account-drawer-close.spec.ts`

**Steps:**
  1. Open the Account drawer via the user menu
    - expect: The drawer is open and visible
  2. Click the X (close) button in the drawer header
    - expect: The drawer slides closed and is no longer visible
    - expect: The main page content is fully visible and interactive again

#### 4.4. Log out clears session and returns to Login page

**File:** `tests/account/logout.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user
    - expect: The Dashboard is displayed
  2. Click the user menu button in the sidebar footer
    - expect: The dropdown menu appears
  3. Click 'Log out'
    - expect: The user is logged out
    - expect: The Login page is displayed
    - expect: The localStorage auth data is cleared
    - expect: Protected routes are no longer accessible without re-authenticating

### 5. Account Form (Edit Own Account)

**Seed:** `tests/auth.setup.ts`

#### 5.1. Account form displays current user details when editing own account

**File:** `tests/account/account-form-own.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user and open the Account drawer via the user menu
    - expect: The drawer title reads 'Edit Your Account'
    - expect: A read-only 'Id' field is populated with the current user's UUID
    - expect: A clipboard copy button is present next to the Id field
    - expect: The Email field is populated with the current user's email address
    - expect: The Admin toggle switch is present but disabled (cannot remove own admin role)
    - expect: An 'Update Password' toggle switch is visible
    - expect: The password fields are initially disabled
    - expect: An 'Update' button and a 'Delete' button are present

#### 5.2. Copying user ID to clipboard works

**File:** `tests/account/copy-user-id.spec.ts`

**Steps:**
  1. Open the Account drawer for the current user
    - expect: The clipboard copy icon is displayed next to the Id field
  2. Click the clipboard copy button
    - expect: The icon changes to a clipboard-check icon indicating the copy was successful

#### 5.3. Update Password toggle enables and disables password fields

**File:** `tests/account/update-password-toggle.spec.ts`

**Steps:**
  1. Open the Account drawer for the current user (own account)
    - expect: The 'Update Password' toggle is off
    - expect: The password and confirm password fields are disabled and visually dimmed
  2. Toggle the 'Update Password' switch to the on position
    - expect: The password and confirm password fields become enabled and fully opaque
  3. Toggle the 'Update Password' switch back to the off position
    - expect: The password and confirm password fields are disabled again

#### 5.4. Updating own account email shows success toast

**File:** `tests/account/update-email.spec.ts`

**Steps:**
  1. Open the Account drawer for the current user
    - expect: The Email field shows the current email
  2. Clear the Email field and type a new valid email address, then click 'Update'
    - expect: A success toast appears with the message 'User updated successfully'
    - expect: The drawer remains open

#### 5.5. Updating own password with mismatched confirmation shows validation error

**File:** `tests/account/password-mismatch.spec.ts`

**Steps:**
  1. Open the Account drawer for the current user and toggle the 'Update Password' switch on
    - expect: The password fields are enabled
  2. Type a new password (8+ characters) in the first password field
  3. Type a different value in the confirm password field
    - expect: An inline error message reading 'Passwords must match' appears

#### 5.6. Updating own password with fewer than 8 characters shows validation error

**File:** `tests/account/password-min-length.spec.ts`

**Steps:**
  1. Open the Account drawer for the current user and toggle the 'Update Password' switch on
    - expect: The password fields are enabled
  2. Type fewer than 8 characters in the new password field
    - expect: An inline error message reading 'Password must be at least 8 characters' appears

### 6. Users Management Page

**Seed:** `tests/auth.setup.ts`

#### 6.1. Users page renders table with correct columns

**File:** `tests/users/users-page-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
    - expect: The page heading reads 'Rawstack Users'
    - expect: A subtitle reading 'Manage your users here' is visible
    - expect: The user table is rendered with column headers: Email, Status, Roles, Joined, Unverified Email, and an actions column
    - expect: A search input with placeholder 'Search users...' is visible
    - expect: A role filter dropdown is visible
    - expect: An 'Add User' button is visible
    - expect: Pagination controls are visible at the bottom of the table

#### 6.2. Users table displays user data correctly

**File:** `tests/users/users-table-data.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user and wait for data to load
    - expect: Each row has a user icon in the first column
    - expect: Each row shows the user's email address in the Email column
    - expect: Each row shows a 'Verified' or 'Unverified' badge in the Status column
    - expect: Each row shows role badge(s) in the Roles column (e.g. 'ADMIN' or 'VERIFIED_USER')
    - expect: Each row shows a date in the format YYYY-MM-DD in the Joined column
    - expect: Each row has an 'Edit' button in the actions column

#### 6.3. Empty state is shown when no users match

**File:** `tests/users/users-empty-state.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
  2. Type a search query that matches no users (e.g. 'zzznoresults@example.com') into the search input
    - expect: The table body shows a 'No results.' message spanning all columns

#### 6.4. Search filters users by email

**File:** `tests/users/users-search.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user and wait for data to load
    - expect: The table shows user records
  2. Type a partial email string into the 'Search users...' input
    - expect: The table updates to show only users whose email contains the search string
    - expect: Users not matching the query are no longer displayed in the table
  3. Clear the search input
    - expect: The table reverts to showing all users (up to the current page size)

#### 6.5. Role filter shows only users with the selected role

**File:** `tests/users/users-role-filter.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
    - expect: The role filter shows 'All Roles' by default
  2. Open the role filter dropdown and select 'Admin Only'
    - expect: The table updates to show only users who have the ADMIN role
    - expect: Non-admin users are not shown
  3. Open the role filter dropdown and select 'Verified Users'
    - expect: The table updates to show only users with the VERIFIED_USER role
  4. Open the role filter dropdown and select 'All Roles'
    - expect: The table reverts to showing all users regardless of role

#### 6.6. Email column sort toggles ASC, DESC, then no sort

**File:** `tests/users/users-sort-email.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
    - expect: No sort indicator is shown on the Email column header
  2. Click the Email column header button
    - expect: An ascending arrow icon appears on the Email header
    - expect: The table data is sorted by email in ascending order (A-Z)
  3. Click the Email column header button again
    - expect: A descending arrow icon appears on the Email header
    - expect: The table data is sorted by email in descending order (Z-A)
  4. Click the Email column header button a third time
    - expect: The sort indicator is removed from the Email header
    - expect: The table reverts to the default (unsorted) order

#### 6.7. Joined (createdAt) column sort toggles ASC, DESC, then no sort

**File:** `tests/users/users-sort-joined.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
    - expect: No sort indicator is shown on the Joined column header
  2. Click the Joined column header button
    - expect: An ascending arrow icon appears on the Joined header
    - expect: The table data is sorted by join date in ascending order (oldest first)
  3. Click the Joined column header button again
    - expect: A descending arrow icon appears on the Joined header
    - expect: The table data is sorted by join date in descending order (newest first)
  4. Click the Joined column header button a third time
    - expect: The sort indicator is removed
    - expect: The table reverts to the default order

#### 6.8. Rows per page selector changes the number of visible rows

**File:** `tests/users/users-rows-per-page.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user with enough users to paginate
    - expect: The 'Rows per page' selector shows '10' and the table displays up to 10 rows
  2. Open the 'Rows per page' selector and choose '20'
    - expect: The table updates to show up to 20 rows
    - expect: The selector now displays '20'
  3. Open the 'Rows per page' selector and choose '50'
    - expect: The table updates to show up to 50 rows

#### 6.9. Pagination controls navigate between pages

**File:** `tests/users/users-pagination.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user with enough users to span multiple pages
    - expect: The pagination shows 'Page 1 of N' where N > 1
    - expect: The first-page and previous-page buttons are disabled
    - expect: The next-page and last-page buttons are enabled
  2. Click the next-page button
    - expect: The pagination shows 'Page 2 of N'
    - expect: The first-page and previous-page buttons become enabled
    - expect: The table shows the next set of users
  3. Click the last-page button
    - expect: The pagination shows 'Page N of N'
    - expect: The next-page and last-page buttons are disabled
  4. Click the first-page button
    - expect: The pagination shows 'Page 1 of N'
    - expect: The first-page and previous-page buttons are disabled again

#### 6.10. Pagination controls are disabled on single page

**File:** `tests/users/users-pagination-single-page.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user with a result set small enough to fit on one page
    - expect: The pagination shows 'Page 1 of 1'
    - expect: All four pagination buttons (first, previous, next, last) are disabled

#### 6.11. Add User button opens the Create Account drawer

**File:** `tests/users/users-add-user-drawer.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
    - expect: The 'Add User' button is visible in the top-right of the table toolbar
  2. Click the 'Add User' button
    - expect: A slide-in drawer opens
    - expect: The drawer title reads 'Create Account'
    - expect: The Account form is displayed with only an Email field and a 'Create User' button (no Id field, no Admin toggle, no password toggle)

#### 6.12. Edit button on a user row opens the Edit Account drawer

**File:** `tests/users/users-edit-drawer.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user and wait for data to load
    - expect: At least one user row is visible with an 'Edit' button
  2. Click the 'Edit' button on any non-own-account user row
    - expect: A slide-in drawer opens
    - expect: The drawer title reads 'Edit Account'
    - expect: The Account form is displayed with a read-only Id field, the user's email pre-populated, an Admin toggle switch (enabled), an 'Update' button, and a 'Delete' button
    - expect: There is no 'Update Password' toggle (this toggle only appears when editing own account)

#### 6.13. Create new user from Add User drawer

**File:** `tests/users/users-create-user.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user and click 'Add User'
    - expect: The Create Account drawer is open
  2. Leave the email field empty and attempt to submit
    - expect: The 'Create User' button is disabled and cannot be submitted
  3. Type an invalid email string and observe
    - expect: An inline validation error appears for the email field
    - expect: The 'Create User' button remains disabled
  4. Enter a valid, unique email address and click 'Create User'
    - expect: A success toast appears with the message 'User created successfully'
    - expect: The drawer remains open

#### 6.14. Update a user's admin role toggle

**File:** `tests/users/users-update-admin-role.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
  2. Click 'Edit' on a non-own-account user row to open the Edit Account drawer
    - expect: The Admin toggle switch is enabled (not disabled)
  3. Toggle the Admin switch and click 'Update'
    - expect: A success toast appears with the message 'User updated successfully'

#### 6.15. Delete a user from the Edit Account drawer

**File:** `tests/users/users-delete-user.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
  2. Click 'Edit' on a non-own-account user row to open the Edit Account drawer
    - expect: A 'Delete' button with destructive styling is visible
  3. Click the 'Delete' button
    - expect: A success toast appears with the message 'User deleted successfully'

#### 6.16. Cannot remove admin role from own account

**File:** `tests/users/users-cannot-remove-own-admin-role.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
  2. Locate the row corresponding to the currently authenticated admin user and click 'Edit'
    - expect: The Edit Account drawer opens with the title 'Edit Your Account'
    - expect: The 'Update Password' toggle is visible (own account feature)
    - expect: The Admin toggle is disabled (cannot remove own admin role)

#### 6.17. Search and filter can be combined

**File:** `tests/users/users-search-and-filter.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user
    - expect: The table shows all users
  2. Select 'Admin Only' from the role filter and then type a partial email into the search input
    - expect: The table shows only admin users whose email matches the search query
    - expect: Non-admin users and admin users not matching the search are excluded

### 7. New Password Page

**Seed:** `tests/auth.setup.ts`

#### 7.1. New password page renders correctly when authenticated

**File:** `tests/new-password/new-password-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/new-password as an authenticated admin user
    - expect: The page heading reads 'Reset Your Password'
    - expect: A password input with placeholder 'new password' is visible
    - expect: A confirm password input with placeholder 'confirm password' is visible
    - expect: An 'Update Password' button is present and disabled initially
    - expect: The sidebar and site header layout is rendered around the form

#### 7.2. Password update button is disabled until a valid password is entered

**File:** `tests/new-password/new-password-button-state.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/new-password as an authenticated admin user
    - expect: The 'Update Password' button is disabled
  2. Type fewer than 8 characters into the password field
    - expect: An inline error message 'Password must be at least 8 characters' appears
    - expect: The 'Update Password' button remains disabled
  3. Type 8 or more characters into the password field and matching text into the confirm field
    - expect: No validation errors are shown
    - expect: The 'Update Password' button becomes enabled

#### 7.3. Passwords not matching shows validation error and disables submit

**File:** `tests/new-password/new-password-mismatch.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/new-password as an authenticated admin user
  2. Type a valid password (8+ characters) in the first field and a different value in the confirm field
    - expect: An inline error 'Passwords must match' appears beneath the confirm password field
    - expect: The 'Update Password' button is disabled

#### 7.4. Successful password update shows toast and redirects to Dashboard

**File:** `tests/new-password/new-password-success.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/new-password as an authenticated admin user
  2. Enter a valid new password in both fields (at least 8 characters, matching) and click 'Update Password'
    - expect: A success toast appears with the message 'Your password has been updated'
    - expect: The user is redirected to the Dashboard at http://localhost:5173/

#### 7.5. Failed password update shows error toast

**File:** `tests/new-password/new-password-error.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/new-password as an authenticated admin user
  2. Enter matching passwords and click 'Update Password', while the API is configured to return an error
    - expect: An error toast appears with the message 'Oops! Something went wrong'
    - expect: The user remains on the /new-password page

#### 7.6. New password page is accessible only when authenticated

**File:** `tests/new-password/new-password-unauthenticated.spec.ts`

**Steps:**
  1. With no stored auth state, navigate directly to http://localhost:5173/new-password
    - expect: The URL changes to http://localhost:5173/
    - expect: The Login page is shown and the New Password form is not accessible

### 8. Layout and Responsiveness

**Seed:** `tests/auth.setup.ts`

#### 8.1. Sidebar is collapsible via offcanvas behaviour

**File:** `tests/layout/sidebar-offcanvas.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user on a desktop viewport
    - expect: The sidebar is fully expanded and all navigation items are visible with labels
  2. Click the sidebar trigger/toggle button in the header
    - expect: The sidebar slides off-canvas and is no longer visible
  3. Click the sidebar trigger again
    - expect: The sidebar slides back into view

#### 8.2. User dropdown opens at the correct side based on device

**File:** `tests/layout/user-dropdown-direction.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173 as an authenticated admin user on a desktop viewport
  2. Click the user menu button in the sidebar footer
    - expect: The dropdown menu opens to the right side of the sidebar on desktop
  3. Resize the viewport to a mobile size and click the user menu button
    - expect: The dropdown menu opens at the bottom of the trigger on mobile

#### 8.3. Account/user drawer opens from the right on desktop and from the bottom on mobile

**File:** `tests/layout/drawer-direction.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user on a desktop viewport and click 'Add User'
    - expect: The drawer slides in from the right side of the screen
  2. Close the drawer, resize the viewport to a mobile size, and click 'Add User'
    - expect: The drawer slides up from the bottom of the screen

#### 8.4. 'Add User' label is only shown on large screens

**File:** `tests/layout/add-user-label-responsive.spec.ts`

**Steps:**
  1. Navigate to http://localhost:5173/users as an authenticated admin user on a desktop viewport
    - expect: The 'Add User' button shows the plus icon and the 'Add User' text label
  2. Resize the viewport below the 'lg' breakpoint
    - expect: The 'Add User' button shows only the plus icon; the 'Add User' text label is hidden
