(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('BrokerPortalController', BrokerPortalController);

    BrokerPortalController.$inject = ['AuthService'];

    function BrokerPortalController(AuthService) {
        var vm = this;

        // Properties
        vm.profile = null;
        vm.role = 'broker';

        activate();

        ////////////////

        function activate() {
            console.log('Broker Portal controller activated');

            // Get user profile
            vm.profile = AuthService.getUserProfile();

            console.log('Broker profile:', vm.profile);
        }
    }

})();
