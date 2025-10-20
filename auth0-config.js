/**
 * Auth0 Configuration
 *
 * IMPORTANT: Replace these values with your Auth0 application credentials
 * You can find these in your Auth0 Dashboard:
 * https://manage.auth0.com/dashboard
 *
 * 1. Go to Applications > Applications
 * 2. Select your application (or create a new Single Page Application)
 * 3. Copy the Domain, Client ID from the Settings tab
 * 4. Set the Allowed Callback URLs to:
 *    - http://localhost:3000/#!/callback
 *    - https://auth0-poc.vercel.app/#!/callback
 * 5. Set the Allowed Logout URLs to:
 *    - http://localhost:3000
 *    - https://auth0-poc.vercel.app
 * 6. Set the Allowed Web Origins to:
 *    - http://localhost:3000
 *    - https://auth0-poc.vercel.app
 */

// Automatically detect the environment and set the appropriate base URL
var isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
var baseUrl = isLocalhost ? 'http://localhost:3000' : 'https://auth0-poc.vercel.app';

window.AUTH0_CONFIG = {
    // Your Auth0 domain (e.g., 'your-tenant.auth0.com' or 'your-tenant.us.auth0.com')
    domain: 'dev-accsjjui4pha873q.us.auth0.com',

    // Your Auth0 Client ID
    clientId: '1IDkQbK2Y8LacVuusqInhu1UoDEHaBmc',

    // The URL to redirect to after login (auto-detects environment)
    redirectUri: baseUrl + '/#!/callback',

    // The URL to redirect to after logout (auto-detects environment)
    logoutReturnTo: baseUrl,

    // Auth0 Audience (optional - use if you have an API)
    // This is typically the API identifier from your Auth0 Dashboard
    // Leave as empty string if you don't have an API
    audience: '',

    // Scopes to request
    scope: 'openid profile email',

    // Response type
    responseType: 'token id_token',

    // Note: responseMode defaults to 'fragment' (hash) for implicit flow
    // We handle the hash parsing before Angular routing to avoid conflicts

    // Custom namespace for claims (must match the one in Auth0 Action)
    namespace: 'https://axa-poc.com',

    // Role-based portal routes
    portalRoutes: {
        'axa-internal': 'axa-portal',
        'broker': 'broker-portal',
        'customer': 'customer-portal'
    }
};
