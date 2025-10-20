(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('CallbackController', CallbackController);

    CallbackController.$inject = ['$timeout', '$interval', 'AuthService'];

    function CallbackController($timeout, $interval, AuthService) {
        var vm = this;

        // Properties
        vm.loading = true;
        vm.error = null;

        activate();

        ////////////////

        function activate() {
            console.log('[CallbackController] Activated - processing authentication...');

            // The authentication is handled in the run block of app.js
            // This controller just provides UI feedback

            // Check periodically if authentication completed successfully
            var checkInterval = $interval(function() {
                if (AuthService.isAuthenticated()) {
                    console.log('[CallbackController] Authentication successful, stopping loader');
                    vm.loading = false;
                    $interval.cancel(checkInterval);
                }
            }, 100); // Check every 100ms

            // Set a timeout to handle cases where authentication might fail
            $timeout(function() {
                $interval.cancel(checkInterval);
                if (vm.loading) {
                    console.error('[CallbackController] Timeout reached, authentication took too long');
                    vm.loading = false;
                    vm.error = 'Authentication is taking longer than expected. Please try again.';
                }
            }, 10000); // 10 second timeout
        }
    }

})();
