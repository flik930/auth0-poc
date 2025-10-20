(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['AuthService'];

    function ProfileController(AuthService) {
        var vm = this;

        // Properties
        vm.profile = null;
        vm.accessToken = null;
        vm.idToken = null;

        activate();

        ////////////////

        function activate() {
            console.log('Profile controller activated');

            // Get user profile
            vm.profile = AuthService.getUserProfile();

            // Get tokens (for display purposes - in production, never expose tokens in UI)
            vm.accessToken = AuthService.getAccessToken();
            vm.idToken = AuthService.getIdToken();

            console.log('User profile:', vm.profile);
        }
    }

})();
