(function() {
    'use strict';

    angular
        .module('auth0App')
        .factory('AuthService', AuthService);

    AuthService.$inject = ['$window', '$timeout', '$state'];

    function AuthService($window, $timeout, $state) {
        // Initialize Auth0 WebAuth
        var webAuth = new auth0.WebAuth({
            domain: window.AUTH0_CONFIG.domain,
            clientID: window.AUTH0_CONFIG.clientId,
            redirectUri: window.AUTH0_CONFIG.redirectUri,
            audience: window.AUTH0_CONFIG.audience,
            responseType: window.AUTH0_CONFIG.responseType,
            scope: window.AUTH0_CONFIG.scope
            // responseMode defaults to 'fragment' (hash) for implicit flow
        });

        // Redirect loop protection
        var isRedirecting = false;
        var redirectAttempts = 0;
        var MAX_REDIRECT_ATTEMPTS = 3;

        var service = {
            login: login,
            logout: logout,
            handleAuthentication: handleAuthentication,
            isAuthenticated: isAuthenticated,
            getAccessToken: getAccessToken,
            getIdToken: getIdToken,
            getUserProfile: getUserProfile,
            renewTokens: renewTokens,
            getUserRole: getUserRole,
            redirectToPortal: redirectToPortal,
            decodeToken: decodeToken
        };

        return service;

        ////////////////

        /**
         * Initiates the Auth0 Universal Login flow
         */
        function login() {
            console.log('[AuthService] 🚀 login() called - initiating Auth0 Universal Login');
            console.log('[AuthService] Current auth state before login:', {
                isAuthenticated: isAuthenticated(),
                hasAccessToken: !!getAccessToken(),
                hasIdToken: !!getIdToken()
            });

            try {
                console.log('[AuthService] Calling webAuth.authorize()...');
                webAuth.authorize();
            } catch (error) {
                console.error('[AuthService] ❌ ERROR calling webAuth.authorize():', error);
            }
        }

        /**
         * Logs out the user and clears local session
         */
        function logout() {
            console.log('[AuthService] Logging out...');

            // Remove tokens and user profile from localStorage
            $window.localStorage.removeItem('access_token');
            $window.localStorage.removeItem('id_token');
            $window.localStorage.removeItem('expires_at');
            $window.localStorage.removeItem('user_profile');
            $window.localStorage.removeItem('user_role');

            // Clear session storage (used by callback handler)
            $window.sessionStorage.removeItem('auth0_callback_hash');
            $window.sessionStorage.removeItem('auth0_should_process_callback');

            console.log('[AuthService] Local data cleared, redirecting to Auth0 logout...');

            // Logout from Auth0
            webAuth.logout({
                returnTo: window.AUTH0_CONFIG.logoutReturnTo,
                clientID: window.AUTH0_CONFIG.clientId
            });
        }

        /**
         * Handles the authentication callback from Auth0
         * Parses the hash and stores tokens
         */
        function handleAuthentication() {
            console.log('[AuthService] handleAuthentication() called');

            // Check if we have a stored hash from the pre-Angular callback handler
            var storedHash = $window.sessionStorage.getItem('auth0_callback_hash');
            var shouldProcess = $window.sessionStorage.getItem('auth0_should_process_callback');

            if (storedHash && shouldProcess === 'true') {
                console.log('[AuthService] Using stored callback hash from sessionStorage');

                // Clear the flags
                $window.sessionStorage.removeItem('auth0_should_process_callback');

                // Parse the stored hash
                webAuth.parseHash({ hash: storedHash }, function(err, authResult) {
                    // Clear the stored hash after parsing
                    $window.sessionStorage.removeItem('auth0_callback_hash');

                    console.log('[AuthService] parseHash callback:', {
                        hasError: !!err,
                        hasAuthResult: !!authResult,
                        error: err,
                        authResult: authResult ? 'exists' : 'null'
                    });

                    processAuthResult(err, authResult);
                });
            } else {
                console.log('[AuthService] No stored hash, trying to parse current URL hash');

                // Fallback to parsing current hash
                webAuth.parseHash(function(err, authResult) {
                    console.log('[AuthService] parseHash callback:', {
                        hasError: !!err,
                        hasAuthResult: !!authResult,
                        error: err,
                        authResult: authResult ? 'exists' : 'null'
                    });

                    processAuthResult(err, authResult);
                });
            }
        }

        /**
         * Process the authentication result (extracted for reuse)
         */
        function processAuthResult(err, authResult) {
            if (authResult && authResult.accessToken && authResult.idToken) {
                    console.log('[AuthService] 📦 Processing authentication result...');

                    // Step 1: Save tokens to localStorage
                    setSession(authResult);
                    console.log('[AuthService] ✅ Tokens saved to localStorage');

                    // Step 2: Extract and store user role from ID token
                    var decodedToken = decodeToken(authResult.idToken);
                    var roleClaim = window.AUTH0_CONFIG.namespace + '/role';
                    var userRole = decodedToken[roleClaim] || 'customer'; // Default to customer
                    $window.localStorage.setItem('user_role', userRole);

                    console.log('[AuthService] ✅ User role extracted and saved:', userRole);
                    console.log('[AuthService] 🔍 Role claim used:', roleClaim);

                    // Step 3: Verify tokens were saved correctly
                    var savedAccessToken = $window.localStorage.getItem('access_token');
                    var savedIdToken = $window.localStorage.getItem('id_token');
                    var savedExpiresAt = $window.localStorage.getItem('expires_at');
                    var savedRole = $window.localStorage.getItem('user_role');

                    console.log('[AuthService] 🔍 Verification - Saved data:', {
                        hasAccessToken: !!savedAccessToken,
                        hasIdToken: !!savedIdToken,
                        hasExpiresAt: !!savedExpiresAt,
                        role: savedRole,
                        isAuthenticated: isAuthenticated()
                    });

                    if (!isAuthenticated()) {
                        console.error('[AuthService] ❌ CRITICAL ERROR: Tokens saved but isAuthenticated() returns false!');
                        console.error('[AuthService] This should not happen. Check setSession() implementation.');
                        return;
                    }

                    // Step 4: Get user profile
                    console.log('[AuthService] 📥 Fetching user profile from Auth0...');
                    webAuth.client.userInfo(authResult.accessToken, function(err, user) {
                        if (err) {
                            console.error('[AuthService] ⚠️  Error fetching user profile:', err);
                            console.log('[AuthService] Continuing anyway - profile is optional');

                            // Wait a bit to ensure everything is saved, then redirect
                            $timeout(function() {
                                console.log('[AuthService] Redirecting without profile...');
                                redirectToPortal();
                            }, 500);
                            return;
                        }

                        // Store user profile
                        $window.localStorage.setItem('user_profile', JSON.stringify(user));
                        console.log('[AuthService] ✅ User profile saved:', user.email || user.name || 'Unknown');

                        // Step 5: Final verification before redirect
                        console.log('[AuthService] 🎬 Preparing to redirect to portal...');
                        console.log('[AuthService] Final state check:', {
                            isAuthenticated: isAuthenticated(),
                            role: getUserRole(),
                            hasProfile: !!getUserProfile()
                        });

                        // Wait a bit to ensure Angular digest cycle completes
                        $timeout(function() {
                            console.log('[AuthService] 🚀 Now calling redirectToPortal()...');
                            redirectToPortal();
                        }, 300);
                    });
                } else if (err) {
                    console.error('[AuthService] ❌ Authentication error:', err);
                    console.error('[AuthService] Error details:', {
                        error: err.error,
                        errorDescription: err.errorDescription,
                        state: err.state
                    });

                    // Only redirect to home for actual errors, not parsing failures
                    if (err.error !== 'invalid_token' && err.error !== 'invalid_hash') {
                        console.log('[AuthService] Redirecting to home due to auth error...');
                        $timeout(function() {
                            $state.go('home');
                        });
                    } else {
                        console.log('[AuthService] Ignoring parsing error (no callback data present)');
                    }
                } else {
                    console.log('[AuthService] ℹ️  No authResult and no error - likely not on callback page');
                }
        }

        /**
         * Stores authentication session data
         */
        function setSession(authResult) {
            console.log('[AuthService] setSession() called with authResult:', {
                hasAccessToken: !!authResult.accessToken,
                hasIdToken: !!authResult.idToken,
                expiresIn: authResult.expiresIn,
                expiresInType: typeof authResult.expiresIn
            });

            // Validate expiresIn - default to 1 hour (3600 seconds) if missing
            var expiresInSeconds = authResult.expiresIn;
            if (!expiresInSeconds || typeof expiresInSeconds !== 'number') {
                console.warn('[AuthService] ⚠️ expiresIn is missing or invalid! Defaulting to 3600 seconds (1 hour)');
                console.warn('[AuthService] Original expiresIn:', authResult.expiresIn);
                expiresInSeconds = 3600; // 1 hour default
            }

            // Calculate expiration time
            var currentTime = new Date().getTime();
            var expiresAt = (expiresInSeconds * 1000) + currentTime;
            var expiresAtString = JSON.stringify(expiresAt);

            console.log('[AuthService] Token expiration calculation:', {
                expiresInSeconds: expiresInSeconds,
                currentTime: currentTime,
                currentTimeReadable: new Date(currentTime).toISOString(),
                expiresAt: expiresAt,
                expiresAtReadable: new Date(expiresAt).toISOString(),
                timeUntilExpiry: Math.floor((expiresAt - currentTime) / 1000) + ' seconds'
            });

            // Validate that expiresAt is in the future
            if (expiresAt <= currentTime) {
                console.error('[AuthService] ❌ CRITICAL: Calculated expiresAt is in the past!');
                console.error('[AuthService] This will cause isAuthenticated() to return false immediately!');
                // Force 1 hour expiry
                expiresAt = currentTime + (3600 * 1000);
                expiresAtString = JSON.stringify(expiresAt);
                console.warn('[AuthService] Forced expiresAt to 1 hour from now:', new Date(expiresAt).toISOString());
            }

            // Save to localStorage
            $window.localStorage.setItem('access_token', authResult.accessToken);
            $window.localStorage.setItem('id_token', authResult.idToken);
            $window.localStorage.setItem('expires_at', expiresAtString);

            console.log('[AuthService] ✅ Tokens saved to localStorage successfully');

            // Immediate verification
            var savedExpiresAt = JSON.parse($window.localStorage.getItem('expires_at'));
            var isNowAuthenticated = new Date().getTime() < savedExpiresAt;
            console.log('[AuthService] Immediate verification after save:', {
                savedExpiresAt: savedExpiresAt,
                savedExpiresAtReadable: new Date(savedExpiresAt).toISOString(),
                currentTime: new Date().getTime(),
                isAuthenticated: isNowAuthenticated
            });

            if (!isNowAuthenticated) {
                console.error('[AuthService] ❌ CRITICAL: Immediately after saving, isAuthenticated() would return FALSE!');
            }
        }

        /**
         * Checks if user is authenticated
         */
        function isAuthenticated() {
            // Check if current time is before token expiration
            var expiresAtString = $window.localStorage.getItem('expires_at');
            var expiresAt = JSON.parse(expiresAtString || '0');
            var currentTime = new Date().getTime();
            var isAuth = currentTime < expiresAt;

            return isAuth;
        }

        /**
         * Gets the access token
         */
        function getAccessToken() {
            return $window.localStorage.getItem('access_token');
        }

        /**
         * Gets the ID token
         */
        function getIdToken() {
            return $window.localStorage.getItem('id_token');
        }

        /**
         * Gets the user profile from localStorage
         */
        function getUserProfile() {
            var profile = $window.localStorage.getItem('user_profile');
            return profile ? JSON.parse(profile) : null;
        }

        /**
         * Renews tokens using silent authentication
         */
        function renewTokens(callback) {
            webAuth.checkSession({}, function(err, result) {
                if (err) {
                    console.error('Error renewing token:', err);
                    callback(err);
                } else {
                    setSession(result);
                    callback(null, result);
                }
            });
        }

        /**
         * Gets the user's role from localStorage
         */
        function getUserRole() {
            return $window.localStorage.getItem('user_role') || 'customer';
        }

        /**
         * Redirects the user to their appropriate portal based on role
         */
        function redirectToPortal() {
            console.log('[AuthService] 🎯 redirectToPortal() called');

            // Prevent redirect loops
            if (isRedirecting) {
                console.warn('[AuthService] ⚠️  Already redirecting, skipping duplicate redirect');
                return;
            }

            redirectAttempts++;
            if (redirectAttempts > MAX_REDIRECT_ATTEMPTS) {
                console.error('[AuthService] ❌ Max redirect attempts reached! Possible redirect loop detected.');
                console.error('[AuthService] Redirecting to home instead to break the loop.');
                redirectAttempts = 0;
                isRedirecting = false;
                $state.go('home');
                return;
            }

            isRedirecting = true;

            // Check authentication before redirecting
            var authenticated = isAuthenticated();
            console.log('[AuthService] Authentication check before portal redirect:', authenticated);

            if (!authenticated) {
                console.warn('[AuthService] ⚠️  Not authenticated during redirectToPortal()');
                console.warn('[AuthService] This might be a timing issue - localStorage may not have persisted yet');
                console.warn('[AuthService] Waiting 500ms and trying again...');

                // Instead of immediately failing, wait and retry once
                isRedirecting = false;
                $timeout(function() {
                    var retryAuth = isAuthenticated();
                    console.log('[AuthService] Retry authentication check:', retryAuth);

                    if (!retryAuth) {
                        console.error('[AuthService] ❌ Still not authenticated after retry!');
                        console.error('[AuthService] Redirecting to home. User will need to login again.');
                        redirectAttempts = 0;
                        $state.go('home');
                        return;
                    }

                    // Retry the redirect
                    console.log('[AuthService] ✅ Authentication confirmed after retry, proceeding with redirect');
                    redirectToPortal();
                }, 500);
                return;
            }

            var role = getUserRole();
            var portalRoute = window.AUTH0_CONFIG.portalRoutes[role] || 'customer-portal';

            console.log('[AuthService] 🚀 Redirecting to portal:', portalRoute, 'for role:', role);
            console.log('[AuthService] Redirect attempt:', redirectAttempts, '/', MAX_REDIRECT_ATTEMPTS);

            // Use $timeout to ensure this happens after digest cycle
            $timeout(function() {
                $state.go(portalRoute).then(function() {
                    console.log('[AuthService] ✅ Successfully navigated to:', portalRoute);
                    // Reset redirect lock after successful navigation
                    $timeout(function() {
                        isRedirecting = false;
                        redirectAttempts = 0;
                    }, 1000);
                }, function(error) {
                    console.error('[AuthService] ❌ Navigation failed:', error);
                    isRedirecting = false;
                    // Don't reset attempts on failure - let it accumulate to prevent infinite loops
                });
            }, 100);
        }

        /**
         * Decodes a JWT token (simple base64 decode)
         * Returns the payload as an object
         */
        function decodeToken(token) {
            if (!token) return {};

            try {
                var parts = token.split('.');
                if (parts.length !== 3) {
                    console.error('Invalid token format');
                    return {};
                }

                // Decode the payload (second part)
                var payload = parts[1];
                // Replace URL-safe characters
                payload = payload.replace(/-/g, '+').replace(/_/g, '/');

                // Add padding if needed
                while (payload.length % 4 !== 0) {
                    payload += '=';
                }

                // Decode base64
                var decoded = $window.atob(payload);
                return JSON.parse(decoded);
            } catch (e) {
                console.error('Error decoding token:', e);
                return {};
            }
        }
    }

})();
