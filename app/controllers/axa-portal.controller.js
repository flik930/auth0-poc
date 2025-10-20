(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('AxaPortalController', AxaPortalController);

    AxaPortalController.$inject = ['AuthService'];

    function AxaPortalController(AuthService) {
        var vm = this;

        // Properties
        vm.profile = null;
        vm.role = 'axa-internal';

        activate();

        ////////////////

        function activate() {
            console.log('AXA Portal controller activated');

            // Get user profile
            vm.profile = AuthService.getUserProfile();

            console.log('AXA Internal User profile:', vm.profile);
        }
    }

})();
