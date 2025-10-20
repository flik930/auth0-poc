(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['AuthService'];

    function HomeController(AuthService) {
        var vm = this;

        // Properties
        vm.auth = AuthService;

        // Methods
        vm.login = login;

        activate();

        ////////////////

        function activate() {
            console.log('Home controller activated');
        }

        function login() {
            AuthService.login();
        }
    }

})();
