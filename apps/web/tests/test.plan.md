# RawStack Web Application Test Plan

## Application Overview

RawStack is a Next.js public website serving as the customer-facing frontend for a full-stack SaaS platform. The application provides user authentication (register, login, logout), account management, password management (reset, set), and email verification flows. Authentication state is persisted in localStorage and managed through a React context provider. The UI includes a theme selector (Light, Dark, System), a header with conditional Login/Account navigation, and toast notifications for feedback. The API backend runs on port 3001.

## Test Scenarios

### 1. Home Page

**Seed:** `tests/seed.spec.ts`

#### 1.1. Home page renders correctly with all expected elements

**File:** `tests/home/home-page-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/
    - expect: The page title is 'Rawstack | Public Website'
    - expect: The header contains the RawStack logo and name
    - expect: The header contains a 'Login' button linking to /login
    - expect: The header contains a 'Toggle theme' button
    - expect: The main content contains the heading 'Build something great.'
    - expect: The main content contains the subheading 'Your starting point'
    - expect: The main content contains descriptive paragraph text about RawStack
    - expect: A 'Get started' link is visible pointing to https://rawstack.io
    - expect: A 'GitHub' link is visible pointing to https://github.com/rawstackio/rawstack

#### 1.2. Logo link navigates back to home page

**File:** `tests/home/logo-navigation.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login page is displayed
  2. Click the 'RawStack' logo link in the header
    - expect: The browser navigates to http://localhost:3000/
    - expect: The home page hero content is visible

#### 1.3. Theme selector switches between Light, Dark, and System modes

**File:** `tests/home/theme-selector.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/
    - expect: The page renders with the default theme
  2. Click the 'Toggle theme' button in the header
    - expect: A dropdown menu appears with three options: 'Light', 'Dark', and 'System'
  3. Click the 'Dark' menu item
    - expect: The dropdown closes
    - expect: The page visual theme changes to dark mode
  4. Click the 'Toggle theme' button again
    - expect: The dropdown menu re-opens
  5. Click the 'Light' menu item
    - expect: The dropdown closes
    - expect: The page visual theme changes to light mode
  6. Click the 'Toggle theme' button again and select 'System'
    - expect: The theme reverts to match the operating system preference

#### 1.4. Theme dropdown closes when pressing Escape key

**File:** `tests/home/theme-selector-escape.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/
    - expect: The home page is loaded
  2. Click the 'Toggle theme' button to open the dropdown
    - expect: The theme dropdown menu is visible with Light, Dark, System options
  3. Press the Escape key
    - expect: The dropdown menu closes without any theme change

#### 1.5. External links on home page open correctly

**File:** `tests/home/external-links.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/
    - expect: The home page is loaded
  2. Inspect the 'Get started' link href attribute
    - expect: The href is https://rawstack.io
  3. Inspect the 'GitHub' link href attribute
    - expect: The href is https://github.com/rawstackio/rawstack

### 2. Login Page

**Seed:** `tests/seed.spec.ts`

#### 2.1. Login page renders correctly with all expected elements

**File:** `tests/login/login-page-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The heading 'Login to your account' is visible
    - expect: An Email input field is present with placeholder 'hi@rawstack.io'
    - expect: A Password input field is present with placeholder '*********'
    - expect: The 'Login' button is present and initially disabled
    - expect: A 'Forgot Password' link is visible linking to /reset-password
    - expect: A 'Sign up' link is visible linking to /register
    - expect: The RawStack logo is visible in the header

#### 2.2. Login button is disabled when form fields are empty

**File:** `tests/login/login-button-disabled-empty.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login form is displayed
  2. Observe the 'Login' button state without filling in any fields
    - expect: The 'Login' button is disabled and cannot be clicked

#### 2.3. Login button is disabled when email is invalid format

**File:** `tests/login/login-button-disabled-invalid-email.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login form is displayed
  2. Type 'notanemail' into the Email field
    - expect: The text is entered into the Email field
  3. Type 'password123' into the Password field
    - expect: The text is entered into the Password field
  4. Observe the 'Login' button state
    - expect: The 'Login' button remains disabled because the email is not a valid email address format

#### 2.4. Login button is disabled when only email is filled

**File:** `tests/login/login-button-disabled-email-only.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login form is displayed
  2. Type 'test@example.com' into the Email field
    - expect: The text is entered into the Email field
  3. Leave the Password field empty and observe the button state
    - expect: The 'Login' button remains disabled because password is required

#### 2.5. Login button becomes enabled when valid email and password are entered

**File:** `tests/login/login-button-enabled.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login form is displayed with the Login button disabled
  2. Type 'test@example.com' into the Email field
    - expect: The email field accepts the input
  3. Type 'password123' into the Password field
    - expect: The password field accepts the input
  4. Observe the 'Login' button state
    - expect: The 'Login' button is now enabled and clickable

#### 2.6. Login with invalid credentials shows error toast notification

**File:** `tests/login/login-invalid-credentials.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login form is displayed
  2. Type 'test@example.com' into the Email field
    - expect: The email field accepts the input
  3. Type 'wrongpassword' into the Password field
    - expect: The password field accepts the input
  4. Click the 'Login' button
    - expect: A toast error notification appears with the message 'Login failed. Please check your credentials.'
    - expect: The user remains on the /login page

#### 2.7. Forgot Password link navigates to reset-password page

**File:** `tests/login/forgot-password-link.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login page is displayed
  2. Click the 'Forgot Password' link
    - expect: The browser navigates to http://localhost:3000/reset-password
    - expect: The 'Reset your password' heading is visible

#### 2.8. Sign up link on login page navigates to register page

**File:** `tests/login/signup-link.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login page is displayed
  2. Click the 'Sign up' link
    - expect: The browser navigates to http://localhost:3000/register
    - expect: The 'Create an Account' heading is visible

#### 2.9. Password field masks input characters

**File:** `tests/login/password-masking.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The login form is displayed
  2. Type 'mysecretpassword' into the Password field
    - expect: The password input field is of type 'password', meaning characters are masked and not displayed in plain text

### 3. Registration Page

**Seed:** `tests/seed.spec.ts`

#### 3.1. Registration page renders correctly with all expected elements

**File:** `tests/register/register-page-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The heading 'Create an Account' is visible
    - expect: An Email input field is present with placeholder 'hi@rawstack.io'
    - expect: A Password input field is present with placeholder '*********'
    - expect: A Confirm Password input field is present with placeholder '*********'
    - expect: A 'Register' button is visible
    - expect: A 'Login' link is visible linking to /login for users who already have an account

#### 3.2. Register form shows validation errors when submitted empty

**File:** `tests/register/register-empty-submission.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The registration form is displayed
  2. Click the 'Register' button without filling in any fields
    - expect: An inline validation error 'Invalid email address' appears below the Email field
    - expect: An inline validation error 'Password must be at least 6 characters' appears below the Password field
    - expect: An inline validation error 'Confirm Password is required' appears below the Confirm Password field

#### 3.3. Register form shows error for invalid email format

**File:** `tests/register/register-invalid-email.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The registration form is displayed
  2. Type 'notanemail' into the Email field
    - expect: The text is entered
  3. Type 'password123' into the Password field and 'password123' into the Confirm Password field
    - expect: The fields accept the input
  4. Click the 'Register' button
    - expect: An inline validation error 'Invalid email address' appears below the Email field
    - expect: The form is not submitted to the API

#### 3.4. Register form shows error when password is shorter than 6 characters

**File:** `tests/register/register-short-password.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The registration form is displayed
  2. Type 'test@example.com' into the Email field
    - expect: The email field accepts the input
  3. Type '12345' (5 characters) into the Password field
    - expect: The password field accepts the input
  4. Type '12345' into the Confirm Password field and click 'Register'
    - expect: An inline validation error 'Password must be at least 6 characters' appears below the Password field

#### 3.5. Register form shows error when passwords do not match

**File:** `tests/register/register-passwords-mismatch.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The registration form is displayed
  2. Type 'test@example.com' into the Email field
    - expect: The email field accepts the input
  3. Type 'password123' into the Password field
    - expect: The password field accepts the input
  4. Type 'differentpassword' into the Confirm Password field
    - expect: The confirm password field accepts the input
  5. Click the 'Register' button
    - expect: An inline validation error 'Passwords must match' appears below the Confirm Password field
    - expect: The form is not submitted to the API

#### 3.6. Register form shows error when attempting to register with an existing email

**File:** `tests/register/register-duplicate-email.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The registration form is displayed
  2. Type an email address that already exists in the system into the Email field
    - expect: The email field accepts the input
  3. Type 'password123' into the Password field and 'password123' into the Confirm Password field
    - expect: Both fields accept the input
  4. Click the 'Register' button
    - expect: An inline validation error 'A user with this email already exists' appears below the Email field
    - expect: The user is not logged in or redirected

#### 3.7. Successful registration logs in the user and redirects

**File:** `tests/register/register-success.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The registration form is displayed
  2. Type a unique, valid email address (e.g. newuser+timestamp@example.com) into the Email field
    - expect: The email field accepts the input
  3. Type 'password123' into the Password field
    - expect: The password field accepts the input
  4. Type 'password123' into the Confirm Password field
    - expect: The confirm password field accepts the input
  5. Click the 'Register' button
    - expect: The user is registered and logged in
    - expect: The user is redirected away from the registration page
    - expect: The header now shows the account avatar/dropdown instead of the Login button

#### 3.8. Login link on register page navigates to login page

**File:** `tests/register/register-login-link.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/register
    - expect: The registration page is displayed
  2. Click the 'Login' link at the bottom of the form
    - expect: The browser navigates to http://localhost:3000/login
    - expect: The 'Login to your account' heading is visible

### 4. Reset Password Page

**Seed:** `tests/seed.spec.ts`

#### 4.1. Reset password page renders correctly with all expected elements

**File:** `tests/reset-password/reset-password-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/reset-password
    - expect: The heading 'Reset your password' is visible
    - expect: An Email input field is present with placeholder 'hi@rawstack.io'
    - expect: A 'Reset Password' button is present and initially disabled
    - expect: A 'Login' link is visible linking to /login

#### 4.2. Reset Password button is disabled when email field is empty

**File:** `tests/reset-password/reset-button-disabled-empty.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/reset-password
    - expect: The reset password form is displayed
  2. Observe the 'Reset Password' button without filling in any fields
    - expect: The 'Reset Password' button is disabled and cannot be clicked

#### 4.3. Reset Password button is disabled for invalid email format

**File:** `tests/reset-password/reset-button-disabled-invalid-email.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/reset-password
    - expect: The reset password form is displayed
  2. Type 'notanemail' into the Email field
    - expect: The text is entered into the Email field
  3. Observe the 'Reset Password' button state
    - expect: The 'Reset Password' button remains disabled due to invalid email format

#### 4.4. Reset Password button becomes enabled with a valid email

**File:** `tests/reset-password/reset-button-enabled.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/reset-password
    - expect: The reset password form is displayed with the button disabled
  2. Type 'valid@example.com' into the Email field
    - expect: The email field accepts the input
  3. Observe the 'Reset Password' button state
    - expect: The 'Reset Password' button is now enabled and clickable

#### 4.5. Submitting reset password form shows success notification regardless of whether email exists

**File:** `tests/reset-password/reset-password-success-notification.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/reset-password
    - expect: The reset password form is displayed
  2. Type 'nonexistent@example.com' into the Email field
    - expect: The email field accepts the input and the button becomes enabled
  3. Click the 'Reset Password' button
    - expect: A toast success notification appears with the message 'A password reset link has been sent to nonexistent@example.com'
    - expect: The success message is shown regardless of whether the account exists (prevents user enumeration)

#### 4.6. Login link on reset password page navigates to login page

**File:** `tests/reset-password/reset-login-link.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/reset-password
    - expect: The reset password page is displayed
  2. Click the 'Login' link
    - expect: The browser navigates to http://localhost:3000/login
    - expect: The 'Login to your account' heading is visible

### 5. Set Password Page

**Seed:** `tests/seed.spec.ts`

#### 5.1. Set password page renders correctly with all expected elements

**File:** `tests/set-password/set-password-render.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/set-password
    - expect: The heading 'Set Your Password' is visible
    - expect: The subheading 'Create your new password' is visible
    - expect: A 'New Password' input field is present with placeholder 'Enter new password'
    - expect: A 'Confirm Password' input field is present with placeholder 'Confirm new password'
    - expect: An 'Update Password' button is present and initially disabled
    - expect: The standard site header with Login button and theme toggle is visible

#### 5.2. Update Password button is disabled when fields are empty

**File:** `tests/set-password/update-button-disabled-empty.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/set-password
    - expect: The set password form is displayed
  2. Observe the 'Update Password' button without filling in any fields
    - expect: The 'Update Password' button is disabled and cannot be clicked

#### 5.3. Update Password button is disabled when password is less than 8 characters

**File:** `tests/set-password/update-button-disabled-short-password.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/set-password
    - expect: The set password form is displayed
  2. Type '1234567' (7 characters) into the 'New Password' field
    - expect: The field accepts the input
  3. Type '1234567' into the 'Confirm Password' field
    - expect: The field accepts the input
  4. Observe the 'Update Password' button state
    - expect: The 'Update Password' button remains disabled
    - expect: A validation error 'Password must be at least 8 characters' may appear

#### 5.4. Update Password button is enabled when passwords match and meet minimum length

**File:** `tests/set-password/update-button-enabled.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/set-password
    - expect: The set password form is displayed
  2. Type 'newpassword123' into the 'New Password' field
    - expect: The field accepts the input
  3. Type 'newpassword123' into the 'Confirm Password' field
    - expect: The field accepts the input
  4. Observe the 'Update Password' button state
    - expect: The 'Update Password' button is now enabled and clickable

#### 5.5. Set password shows error for mismatched passwords

**File:** `tests/set-password/set-password-mismatch.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/set-password
    - expect: The set password form is displayed
  2. Type 'newpassword123' into the 'New Password' field
    - expect: The field accepts the input
  3. Type 'differentpassword123' into the 'Confirm Password' field
    - expect: The field accepts the input
  4. Observe the button state or attempt to submit
    - expect: The 'Update Password' button remains disabled
    - expect: A validation error 'Passwords must match' is shown below the Confirm Password field after attempted submission

#### 5.6. Set password fails with error when user is not authenticated

**File:** `tests/set-password/set-password-unauthenticated.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/set-password in a fresh browser session (no auth data in localStorage)
    - expect: The set password form is displayed
  2. Type 'newpassword123' into the 'New Password' field
    - expect: The field accepts the input
  3. Type 'newpassword123' into the 'Confirm Password' field
    - expect: The field accepts the input and the button becomes enabled
  4. Click the 'Update Password' button
    - expect: A toast error notification appears with the message 'User not authenticated'
    - expect: The user is not redirected

### 6. Email Verification Page

**Seed:** `tests/seed.spec.ts`

#### 6.1. Email verification page shows loading state initially

**File:** `tests/email-verification/email-verification-loading.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/email-verification?token=some-token and immediately capture the page state
    - expect: A loading spinner or 'Loading' status indicator is briefly visible while the token is being verified against the API

#### 6.2. Email verification page shows error for an invalid token

**File:** `tests/email-verification/email-verification-invalid-token.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/email-verification?token=invalid-token-12345
    - expect: The RawStack logo is visible in the header
  2. Wait for the verification API call to complete
    - expect: The loading indicator disappears
    - expect: An error message 'Error! Invalid token' is displayed along with an alert triangle icon
    - expect: No success message is shown

#### 6.3. Email verification page shows error when token query param is absent

**File:** `tests/email-verification/email-verification-no-token.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/email-verification (without any token query parameter)
    - expect: The page loads and makes an API call
  2. Wait for the verification process to complete
    - expect: An error message 'Error! Invalid token' is displayed
    - expect: The API returns a 400/422 error due to missing token

#### 6.4. Email verification page shows success message for a valid token

**File:** `tests/email-verification/email-verification-valid-token.spec.ts`

**Steps:**
  1. Obtain a valid email verification token from the system (e.g. register a new user and retrieve the token from the verification email or directly from the database)
    - expect: A valid token is available
  2. Navigate to http://localhost:3000/email-verification?token=<valid-token>
    - expect: The page loads and shows a loading state
  3. Wait for the verification API call to complete
    - expect: A success message 'Success! your email has been verified' is displayed along with a thumbs up icon
    - expect: No error message is shown

### 7. Account Page

**Seed:** `tests/seed.spec.ts`

#### 7.1. Account page is accessible and renders correctly for authenticated users

**File:** `tests/account/account-page-render.spec.ts`

**Steps:**
  1. Log in with valid credentials by navigating to /login and submitting the login form
    - expect: The user is logged in and the header shows the account avatar
  2. Navigate to http://localhost:3000/account
    - expect: The page renders with the heading 'Account Settings'
    - expect: The subheading 'Manage your account settings and set e-mail preferences.' is visible
    - expect: A breadcrumb navigation shows 'Home > Account'
    - expect: An email input field is pre-populated with the user's current email address
    - expect: A password input field is present (empty)
    - expect: A confirm password input field is present (empty)
    - expect: An 'Update' button is visible
    - expect: A 'Delete Account' button is visible

#### 7.2. Account page redirects unauthenticated users to home page

**File:** `tests/account/account-page-redirect-unauthenticated.spec.ts`

**Steps:**
  1. Ensure no user is logged in (fresh browser session with no auth data in localStorage)
    - expect: No user is authenticated
  2. Navigate to http://localhost:3000/account
    - expect: The page briefly shows the Account Settings layout but then redirects
    - expect: The user is redirected to http://localhost:3000/ (home page)
    - expect: The account form with user data is not displayed

#### 7.3. Account page breadcrumb Home link navigates to home page

**File:** `tests/account/account-breadcrumb-home.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account page is displayed with breadcrumb navigation
  2. Click the 'Home' link in the breadcrumb navigation
    - expect: The browser navigates to http://localhost:3000/
    - expect: The home page hero content is visible

#### 7.4. Account form shows error when updating email to one already in use

**File:** `tests/account/account-update-duplicate-email.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account form is displayed with the current user's email
  2. Clear the Email field and type an email address already registered to a different user
    - expect: The email field accepts the input
  3. Click the 'Update' button
    - expect: An inline validation error 'A user with this email already exists' appears below the Email field

#### 7.5. Account form allows updating email with valid new address

**File:** `tests/account/account-update-email.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account form is displayed
  2. Clear the Email field and type a new unique valid email address
    - expect: The email field accepts the new email
  3. Leave the Password and Confirm Password fields empty, then click 'Update'
    - expect: A toast success notification 'Account updated successfully' appears
    - expect: The unverified email banner becomes visible indicating the new email needs verification

#### 7.6. Account form allows updating password with valid matching passwords

**File:** `tests/account/account-update-password.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account form is displayed
  2. Leave the Email field with its current value, type 'newpassword123' into the Password field, and type 'newpassword123' into the Confirm Password field
    - expect: Both password fields accept the input
  3. Click the 'Update' button
    - expect: A toast success notification 'Account updated successfully' appears

#### 7.7. Account form shows validation error when password is less than 8 characters

**File:** `tests/account/account-password-too-short.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account form is displayed
  2. Type '1234567' (7 characters) into the Password field
    - expect: The password field accepts the input
  3. Type '1234567' into the Confirm Password field and click 'Update'
    - expect: A validation error 'Password must be at least 8 characters' appears
    - expect: The form is not submitted

#### 7.8. Account form shows validation error when passwords do not match

**File:** `tests/account/account-password-mismatch.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account form is displayed
  2. Type 'newpassword123' into the Password field
    - expect: The password field accepts the input
  3. Type 'differentpassword123' into the Confirm Password field and click 'Update'
    - expect: A validation error 'Passwords must match' appears below the Confirm Password field

#### 7.9. Account form shows validation error when password is filled but confirm password is empty

**File:** `tests/account/account-password-without-confirm.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account form is displayed
  2. Type 'newpassword123' into the Password field and leave Confirm Password empty
    - expect: The password field has a value, confirm password is empty
  3. Click the 'Update' button
    - expect: A validation error 'Please confirm your password' appears below the Confirm Password field

#### 7.10. Unverified email banner is visible when user has an unverified email

**File:** `tests/account/account-unverified-email-banner.spec.ts`

**Steps:**
  1. Log in with a user account that has a pending email change (unverified email) and navigate to /account
    - expect: A yellow warning banner is displayed with the text 'Your email address is unverified. Please check your inbox for a verification link.'
    - expect: A 'Resend email' button is present in the banner
  2. Click the 'Resend email' button
    - expect: A toast success notification 'Verification email sent' appears
    - expect: The button may briefly show a loading/disabled state while the request is in progress

#### 7.11. Delete Account button triggers confirmation dialog

**File:** `tests/account/account-delete-dialog.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account page is displayed
  2. Click the 'Delete Account' button
    - expect: A modal alert dialog appears with the title 'Are you sure?'
    - expect: The dialog contains the warning text 'This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.'
    - expect: A 'Cancel' button is visible in the dialog
    - expect: A 'Delete Account' confirmation button is visible in the dialog

#### 7.12. Cancelling the delete account dialog keeps the user on the account page

**File:** `tests/account/account-delete-cancel.spec.ts`

**Steps:**
  1. Log in and navigate to http://localhost:3000/account
    - expect: The account page is displayed
  2. Click the 'Delete Account' button to open the confirmation dialog
    - expect: The confirmation dialog is visible
  3. Click the 'Cancel' button in the dialog
    - expect: The dialog closes
    - expect: The user remains on the /account page
    - expect: The user account has not been deleted

#### 7.13. Confirming delete account removes the user and logs them out

**File:** `tests/account/account-delete-confirm.spec.ts`

**Steps:**
  1. Register and log in with a test user account, then navigate to /account
    - expect: The account page is displayed with the test user's information
  2. Click the 'Delete Account' button
    - expect: The confirmation dialog appears
  3. Click the 'Delete Account' button inside the confirmation dialog
    - expect: A toast success notification 'Account deleted successfully' appears
    - expect: The user is logged out
    - expect: The header reverts to showing the 'Login' button instead of the account avatar

### 8. Header and Navigation

**Seed:** `tests/seed.spec.ts`

#### 8.1. Header shows Login button when user is not authenticated

**File:** `tests/navigation/header-unauthenticated.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/ in a fresh session with no auth data
    - expect: The header displays a 'Login' button linking to /login
    - expect: No user avatar or account dropdown is visible

#### 8.2. Header shows account avatar dropdown when user is authenticated

**File:** `tests/navigation/header-authenticated.spec.ts`

**Steps:**
  1. Log in via the /login page with valid credentials
    - expect: The user is redirected after successful login
  2. Observe the header
    - expect: The 'Login' button is no longer visible
    - expect: An avatar with initials 'RS' is visible in the header
    - expect: The account dropdown trigger is present

#### 8.3. Account avatar dropdown menu shows Settings and Logout options

**File:** `tests/navigation/account-dropdown-options.spec.ts`

**Steps:**
  1. Log in and navigate to the home page
    - expect: The header shows the authenticated state with the RS avatar
  2. Click the RS avatar in the header
    - expect: A dropdown menu appears with two items: 'Settings' and 'Logout'

#### 8.4. Settings link in account dropdown navigates to account page

**File:** `tests/navigation/account-dropdown-settings.spec.ts`

**Steps:**
  1. Log in and click the RS avatar in the header
    - expect: The dropdown menu is visible with Settings and Logout options
  2. Click the 'Settings' link in the dropdown
    - expect: The browser navigates to http://localhost:3000/account
    - expect: The Account Settings page is displayed

#### 8.5. Logout option in account dropdown logs out the user

**File:** `tests/navigation/account-dropdown-logout.spec.ts`

**Steps:**
  1. Log in and click the RS avatar in the header
    - expect: The dropdown menu is visible
  2. Click the 'Logout' option in the dropdown
    - expect: The user is logged out
    - expect: The header reverts to showing the 'Login' button
    - expect: The user's auth data is cleared from localStorage

#### 8.6. Auth pages (login, register, reset-password) use the auth header layout without theme toggle

**File:** `tests/navigation/auth-pages-header-layout.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/login
    - expect: The header shows the RawStack logo
    - expect: No 'Toggle theme' button is present in this header
    - expect: No 'Login' button is shown in the header (it is on the main page content instead)
  2. Navigate to http://localhost:3000/register
    - expect: The same minimal auth header layout is used without the theme toggle
  3. Navigate to http://localhost:3000/reset-password
    - expect: The same minimal auth header layout is used

### 9. Toast Notifications

**Seed:** `tests/seed.spec.ts`

#### 9.1. Toast notifications are accessible via keyboard shortcut

**File:** `tests/notifications/toast-keyboard-shortcut.spec.ts`

**Steps:**
  1. Navigate to http://localhost:3000/
    - expect: The home page is loaded
  2. Observe the page for a 'Notifications' region with the label 'alt+T'
    - expect: A 'Notifications alt+T' region is present in the DOM for accessibility
    - expect: The region is used to house toast notifications
