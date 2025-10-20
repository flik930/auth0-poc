(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('CallbackController', CallbackController);

    CallbackController.$inject = ['$timeout', 'AuthService'];

    function CallbackController($timeout, AuthService) {
        var vm = this;

        // Properties
        vm.loading = true;
        vm.error = null;

        activate();

        ////////////////

        function activate() {
            console.log('Callback controller activated - processing authentication...');

            // The authentication is handled in the run block of app.js
            // This controller just provides UI feedback

            // Set a timeout to handle cases where authentication might fail
            $timeout(function() {
                if (vm.loading) {
                    vm.loading = false;
                    vm.error = 'Authentication is taking longer than expected. Please try again.';
                }
            }, 10000); // 10 second timeout
        }
    }

})();
