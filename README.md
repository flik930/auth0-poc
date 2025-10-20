# Auth0 Universal Login with AngularJS - POC

This is a proof-of-concept (POC) implementation of Auth0 Universal Login with AngularJS. It demonstrates how to integrate Auth0 authentication into an AngularJS single-page application with features including login, logout, protected routes, user profile display, token management, and **role-based access control with multiple authentication methods**.

## ✅ Status: Fully Working!

The application is complete and fully functional. Users can:
- ✅ Login with Auth0 Universal Login
- ✅ Stay logged in across page refreshes
- ✅ See role-based portals (AXA Internal, Broker, Customer)
- ✅ View their profile with user information
- ✅ Logout from both the app and Auth0

**Quick Start:** See the setup instructions below to get started in 5 minutes!

## Features

- **Universal Login**: Uses Auth0's hosted login page for secure authentication
- **Role-Based Authentication**: Three user roles with different authentication methods:
  - **AXA Internal Users**: Enterprise SSO (Microsoft/GitHub OAuth)
  - **Brokers**: Email/Password authentication
  - **Customers**: Email/Password authentication
- **Role-Based Portals**: Automatic redirect to role-specific dashboards after login
- **Protected Routes**: UI Router resolve guards with role-based access control
- **User Profile**: Display authenticated user information
- **Token Management**: Automatic token handling with HTTP interceptors
- **Session Management**: Token storage and expiration handling
- **Custom Claims**: Extract user roles from JWT tokens
- **Logout**: Full logout flow with Auth0

## Prerequisites

- Node.js and npm installed
- An Auth0 account (free tier works fine)
- A web browser

## Project Structure

```
auth0-poc/
├── app/
│   ├── controllers/
│   │   ├── axa-portal.controller.js       # AXA Internal portal
│   │   ├── broker-portal.controller.js    # Broker portal
│   │   ├── callback.controller.js         # Auth callback handler
│   │   ├── customer-portal.controller.js  # Customer portal
│   │   ├── home.controller.js             # Home page
│   │   ├── navbar.controller.js           # Navigation
│   │   └── profile.controller.js          # User profile
│   ├── services/
│   │   ├── auth.interceptor.js            # HTTP token interceptor
│   │   └── auth.service.js                # Auth logic & role management
│   ├── views/
│   │   ├── axa-portal.html                # AXA Internal dashboard
│   │   ├── broker-portal.html             # Broker dashboard
│   │   ├── callback.html                  # Auth callback page
│   │   ├── customer-portal.html           # Customer dashboard
│   │   ├── home.html                      # Landing page
│   │   └── profile.html                   # User profile page
│   └── app.js                             # App config & routing
├── auth0-config.js                        # Auth0 credentials
├── index.html                             # Main HTML
├── package.json                           # Dependencies
├── README.md                              # This file
└── ROLE_SETUP_GUIDE.md                   # Role configuration guide
```

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Auth0

1. **Log in to your Auth0 Dashboard**: https://manage.auth0.com/

2. **Create a new Application**:
   - Navigate to **Applications** > **Applications**
   - Click **Create Application**
   - Name it (e.g., "AngularJS POC")
   - Select **Single Page Web Applications**
   - Click **Create**

3. **Configure Application Settings**:
   - Go to the **Settings** tab of your new application
   - Note down the following values:
     - **Domain** (e.g., `your-tenant.auth0.com`)
     - **Client ID** (e.g., `abc123...`)

4. **Configure Callback URLs**:
   In the same Settings tab, configure these URLs:

   - **Allowed Callback URLs**:
     ```
     http://localhost:3000/#!/callback
     ```

   - **Allowed Logout URLs**:
     ```
     http://localhost:3000
     ```

   - **Allowed Web Origins**:
     ```
     http://localhost:3000
     ```

   - Click **Save Changes** at the bottom

### Step 3: Update Configuration File

1. Open `auth0-config.js` in your project

2. Replace the placeholder values with your Auth0 credentials:
   ```javascript
   window.AUTH0_CONFIG = {
       domain: 'your-tenant.auth0.com',        // Replace with your Auth0 domain
       clientId: 'YOUR_CLIENT_ID',              // Replace with your Client ID
       redirectUri: 'http://localhost:3000/#!/callback',
       logoutReturnTo: 'http://localhost:3000',
       audience: '',  // Optional: Add your API identifier if you have one
       scope: 'openid profile email',
       responseType: 'token id_token'
   };
   ```

### Step 4: Run the Application

```bash
npm start
```

This will start a local server at `http://localhost:3000` and automatically open it in your browser.

### Step 5: Configure Role-Based Authentication (Optional but Recommended)

To enable role-based authentication with different user types, follow the comprehensive guide in **[ROLE_SETUP_GUIDE.md](ROLE_SETUP_GUIDE.md)**.

**Quick overview:**
1. Enable Microsoft/GitHub OAuth for AXA Internal Users (simulates enterprise SSO)
2. Enable email/password database connection for Brokers and Customers
3. Create Auth0 Action to assign roles based on connection type or email domain
4. Test different user types

**See ROLE_SETUP_GUIDE.md for detailed step-by-step instructions.**

## How to Use

### Basic Usage (Without Role-Based Authentication)

If you skip Step 5 above, all users will be treated as "customers" and redirected to the customer portal.

### Role-Based Usage (Recommended)

After configuring roles in Step 5:

#### 1. Testing AXA Internal User (Enterprise SSO)

1. Click **Log In**
2. On the Auth0 login page, click **Microsoft** (or GitHub if you configured it)
3. Log in with your Microsoft/GitHub account
4. You'll be redirected to the **AXA Internal Portal**
5. The navigation bar will show a **"AXA Internal"** badge

**Features available:**
- Full administrative dashboard
- Internal systems access
- Broker and customer management
- Analytics and reporting

#### 2. Testing Broker User

1. Click **Log In**
2. Click **Sign Up** on the Auth0 login page
3. Create an account with email ending in `@broker.com` (e.g., `test@broker.com`)
   - Or use any email and manually set role in Auth0 dashboard
4. After login, you'll be redirected to the **Broker Portal**
5. The navigation bar will show a **"Broker"** badge

**Features available:**
- Client management dashboard
- Policy issuance and management
- Commission tracking
- Quote generation

#### 3. Testing Customer User

1. Click **Log In**
2. Click **Sign Up** on the Auth0 login page
3. Create an account with any regular email (e.g., `user@gmail.com`)
4. After login, you'll be redirected to the **Customer Portal**
5. The navigation bar will show a **"Customer"** badge

**Features available:**
- View and manage policies
- File claims
- Make payments
- Download documents

#### 4. Navigating Between Pages

- **My Portal**: Takes you to your role-specific dashboard
- **Profile**: Shows your user information and tokens (for debugging)
- **Role Badge**: Displays your current role in the navigation bar
- **Logout**: Clears session and returns to home page

#### 5. Protected Routes & Role Guards

- Each portal is protected by role-based guards
- Try accessing `/#!/broker-portal` as a customer - you'll be redirected to your correct portal
- Try accessing any portal without logging in - you'll be redirected to the home page
- This demonstrates both authentication and authorization

## Technical Details

### Authentication Flow

1. **User clicks "Log In"** → `AuthService.login()` is called
2. **Redirect to Auth0** → User authenticates on Auth0's hosted page (database or social)
3. **Callback** → Auth0 redirects back to `/#!/callback` with tokens in URL hash
4. **Parse Hash** → `AuthService.handleAuthentication()` extracts tokens
5. **Extract Role** → Role is extracted from ID token custom claim (`namespace/role`)
6. **Store Session** → Tokens and role are stored in localStorage
7. **Fetch Profile** → User profile is fetched using access token
8. **Role-Based Redirect** → User is redirected to appropriate portal based on role:
   - `axa-internal` → `/#!/axa-portal`
   - `broker` → `/#!/broker-portal`
   - `customer` → `/#!/customer-portal`

### Role Assignment Flow (Auth0 Action)

1. **Login Trigger** → Auth0 Action executes on successful authentication
2. **Detect Connection** → Action checks connection type:
   - Microsoft/GitHub OAuth → assign `axa-internal` role
   - Database with `@broker.com` email → assign `broker` role
   - Database (other) → assign `customer` role
3. **Store in Metadata** → Role saved to user's `app_metadata`
4. **Add to Token** → Role added as custom claim to ID token and access token
5. **Application Reads** → AngularJS app decodes token and extracts role

### Token Management

- **Access Token**: Stored in localStorage, automatically attached to API requests via HTTP interceptor
- **ID Token**: Stored in localStorage, contains user identity information
- **Expiration**: Tokens have an expiration time, checked before allowing access to protected routes
- **Auto-Attachment**: The `AuthInterceptor` automatically adds `Authorization: Bearer <token>` header to HTTP requests

### Route Protection

**Basic Authentication Protection:**

Protected routes use UI Router's `resolve` property:

```javascript
.state('profile', {
    // ... other config
    resolve: {
        authenticate: ['AuthService', '$state', function(AuthService, $state) {
            if (!AuthService.isAuthenticated()) {
                $state.go('home');
                return false;
            }
            return true;
        }]
    }
});
```

**Role-Based Authorization Protection:**

Portal routes add role verification:

```javascript
.state('broker-portal', {
    // ... other config
    resolve: {
        authenticate: ['AuthService', '$state', function(AuthService, $state) {
            // Check authentication
            if (!AuthService.isAuthenticated()) {
                $state.go('home');
                return false;
            }
            // Check role authorization
            if (AuthService.getUserRole() !== 'broker') {
                // Redirect to correct portal based on actual role
                AuthService.redirectToPortal();
                return false;
            }
            return true;
        }]
    }
});
```

### Key Files

- **auth0-config.js**: Auth0 configuration (domain, clientId, role routes, namespace)
- **app/app.js**: Main AngularJS module, routing configuration, and role-based guards
- **app/services/auth.service.js**: Core authentication logic, role extraction, portal routing
- **app/services/auth.interceptor.js**: HTTP interceptor for token management
- **app/controllers/axa-portal.controller.js**: AXA Internal User dashboard controller
- **app/controllers/broker-portal.controller.js**: Broker dashboard controller
- **app/controllers/customer-portal.controller.js**: Customer dashboard controller
- **app/controllers/navbar.controller.js**: Navigation with role display
- **app/views/**: HTML templates for portals and pages
- **ROLE_SETUP_GUIDE.md**: Complete Auth0 configuration guide for roles

## Security Considerations

### For Production

1. **Never expose tokens in UI**: This POC shows tokens for educational purposes only
2. **Use HTTPS**: Always use HTTPS in production
3. **Implement CSRF protection**: Add CSRF tokens for state parameter
4. **Token Renewal**: Implement silent authentication for token renewal
5. **Secure Storage**: Consider more secure token storage mechanisms
6. **Content Security Policy**: Implement CSP headers
7. **CORS Configuration**: Properly configure CORS for your APIs

### Environment Variables

For production, consider moving sensitive configuration to environment variables or a separate configuration file that is gitignored.

## Troubleshooting

### Issue: "Invalid state" error
- Clear localStorage and cookies
- Ensure callback URL matches exactly in Auth0 dashboard

### Issue: Redirect loop
- Check that your Auth0 domain and clientId are correct
- Verify callback URLs in Auth0 dashboard

### Issue: CORS errors
- Ensure you've added `http://localhost:3000` to Allowed Web Origins in Auth0
- Check browser console for specific CORS error messages

### Issue: Tokens not working
- Check token expiration
- Verify audience is correct if using an API
- Ensure proper scopes are requested

## Additional Resources

- [Auth0 Documentation](https://auth0.com/docs)
- [Auth0 AngularJS Quickstart](https://auth0.com/docs/quickstart/spa/angularjs)
- [Auth0.js SDK Documentation](https://auth0.com/docs/libraries/auth0js)
- [AngularJS Documentation](https://docs.angularjs.org/)
- [Angular UI Router](https://ui-router.github.io/ng1/)

## Next Steps

To extend this POC:

1. **Add API Integration**: Create a backend API and use the access token to make authenticated requests
2. **Implement Token Renewal**: Add silent authentication for seamless token renewal
3. **Add Role-Based Access Control**: Implement permissions and roles
4. **Multi-Factor Authentication**: Enable MFA in Auth0 dashboard
5. **Social Connections**: Configure Google, Facebook, or other social logins
6. **Customize Login Page**: Use Auth0's customization options for the Universal Login page
7. **Add Error Handling**: Implement comprehensive error handling and user feedback
8. **User Management**: Add profile editing and account management features

## License

MIT

## Support

For issues related to:
- **Auth0**: Check [Auth0 Community](https://community.auth0.com/)
- **AngularJS**: Check [AngularJS GitHub](https://github.com/angular/angular.js)
- **This POC**: Open an issue in your repository

---

**Note**: This is a proof-of-concept for learning purposes. For production applications, follow Auth0 and AngularJS best practices, implement proper error handling, and ensure all security measures are in place.
