(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('CustomerPortalController', CustomerPortalController);

    CustomerPortalController.$inject = ['AuthService'];

    function CustomerPortalController(AuthService) {
        var vm = this;

        // Properties
        vm.profile = null;
        vm.role = 'customer';

        activate();

        ////////////////

        function activate() {
            console.log('Customer Portal controller activated');

            // Get user profile
            vm.profile = AuthService.getUserProfile();

            console.log('Customer profile:', vm.profile);
        }
    }

})();
