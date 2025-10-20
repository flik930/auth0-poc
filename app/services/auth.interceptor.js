(function() {
    'use strict';

    angular
        .module('auth0App')
        .factory('AuthInterceptor', AuthInterceptor);

    AuthInterceptor.$inject = ['AuthService'];

    function AuthInterceptor(AuthService) {
        return {
            request: request
        };

        /**
         * Intercepts outgoing HTTP requests and adds the Authorization header
         * if the user is authenticated
         */
        function request(config) {
            // Get the access token
            var token = AuthService.getAccessToken();

            // Add Authorization header if token exists and request is not to Auth0
            if (token && config.url.indexOf('auth0.com') === -1) {
                config.headers = config.headers || {};
                config.headers.Authorization = 'Bearer ' + token;
            }

            return config;
        }
    }

})();
