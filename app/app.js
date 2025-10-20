(function() {
    'use strict';

    angular
        .module('auth0App', ['ui.router'])
        .config(configureRoutes)
        .config(configureHttpInterceptor)
        .run(runBlock);

    /**
     * Configure UI Router states
     */
    configureRoutes.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider'];
    function configureRoutes($stateProvider, $urlRouterProvider, $locationProvider) {
        // Use hash-based routing
        $locationProvider.hashPrefix('!');

        // Default route
        $urlRouterProvider.otherwise('/');

        // Define states
        $stateProvider
            // Home state (public)
            .state('home', {
                url: '/',
                templateUrl: 'app/views/home.html',
                controller: 'HomeController',
                controllerAs: 'vm'
            })
            // Callback state (handles Auth0 redirect)
            .state('callback', {
                url: '/callback',
                templateUrl: 'app/views/callback.html',
                controller: 'CallbackController',
                controllerAs: 'vm'
            })
            // Profile state (protected)
            .state('profile', {
                url: '/profile',
                templateUrl: 'app/views/profile.html',
                controller: 'ProfileController',
                controllerAs: 'vm',
                resolve: {
                    // Protect this route - must be authenticated
                    authenticate: ['AuthService', '$state', function(AuthService, $state) {
                        if (!AuthService.isAuthenticated()) {
                            $state.go('home');
                            return false;
                        }
                        return true;
                    }]
                }
            })
            // AXA Internal User Portal (protected - role-based)
            .state('axa-portal', {
                url: '/axa-portal',
                templateUrl: 'app/views/axa-portal.html',
                controller: 'AxaPortalController',
                controllerAs: 'vm',
                resolve: {
                    authenticate: ['AuthService', '$state', function(AuthService, $state) {
                        if (!AuthService.isAuthenticated()) {
                            $state.go('home');
                            return false;
                        }
                        if (AuthService.getUserRole() !== 'axa-internal') {
                            // Redirect to correct portal based on role
                            AuthService.redirectToPortal();
                            return false;
                        }
                        return true;
                    }]
                }
            })
            // Broker Portal (protected - role-based)
            .state('broker-portal', {
                url: '/broker-portal',
                templateUrl: 'app/views/broker-portal.html',
                controller: 'BrokerPortalController',
                controllerAs: 'vm',
                resolve: {
                    authenticate: ['AuthService', '$state', function(AuthService, $state) {
                        if (!AuthService.isAuthenticated()) {
                            $state.go('home');
                            return false;
                        }
                        if (AuthService.getUserRole() !== 'broker') {
                            // Redirect to correct portal based on role
                            AuthService.redirectToPortal();
                            return false;
                        }
                        return true;
                    }]
                }
            })
            // Customer Portal (protected - role-based)
            .state('customer-portal', {
                url: '/customer-portal',
                templateUrl: 'app/views/customer-portal.html',
                controller: 'CustomerPortalController',
                controllerAs: 'vm',
                resolve: {
                    authenticate: ['AuthService', '$state', function(AuthService, $state) {
                        if (!AuthService.isAuthenticated()) {
                            $state.go('home');
                            return false;
                        }
                        if (AuthService.getUserRole() !== 'customer') {
                            // Redirect to correct portal based on role
                            AuthService.redirectToPortal();
                            return false;
                        }
                        return true;
                    }]
                }
            });
    }

    /**
     * Configure HTTP interceptor for adding authentication tokens
     */
    configureHttpInterceptor.$inject = ['$httpProvider'];
    function configureHttpInterceptor($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }

    /**
     * Run block - executes when the app starts
     */
    runBlock.$inject = ['AuthService', '$rootScope', '$state', '$window'];
    function runBlock(AuthService, $rootScope, $state, $window) {
        console.log('[Auth0 App] Application started');

        // Check if we're on the callback page or if the pre-handler set the processing flag
        var isOnCallbackPage = $window.location.hash.indexOf('#!/callback') !== -1;
        var shouldProcessCallback = $window.sessionStorage.getItem('auth0_should_process_callback') === 'true';
        var hasStoredHash = !!$window.sessionStorage.getItem('auth0_callback_hash');

        console.log('[Auth0 App] Callback check:', {
            isOnCallbackPage: isOnCallbackPage,
            shouldProcessCallback: shouldProcessCallback,
            hasStoredHash: hasStoredHash
        });

        // Handle authentication if:
        // 1. We're on the callback page AND there's a stored hash from pre-handler
        // 2. OR the pre-handler set the flag to process
        if ((isOnCallbackPage && hasStoredHash) || shouldProcessCallback) {
            console.log('[Auth0 App] Auth0 callback detected - calling handleAuthentication()');
            AuthService.handleAuthentication();
        } else {
            console.log('[Auth0 App] No Auth0 callback to process');
        }

        // Listen for state change errors
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            console.error('[Auth0 App] State change error:', error);
        });

        // Optional: Listen for state changes to verify authentication
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            console.log('[Auth0 App] Changing state from', fromState.name || 'initial', 'to:', toState.name);
        });
    }

})();
