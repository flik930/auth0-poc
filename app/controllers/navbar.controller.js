(function() {
    'use strict';

    angular
        .module('auth0App')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['AuthService'];

    function NavbarController(AuthService) {
        var nav = this;

        // Properties
        nav.auth = AuthService;

        // Methods
        nav.login = login;
        nav.logout = logout;
        nav.getUserRole = getUserRole;
        nav.getRoleDisplayName = getRoleDisplayName;
        nav.getPortalLink = getPortalLink;

        ////////////////

        function login() {
            AuthService.login();
        }

        function logout() {
            AuthService.logout();
        }

        function getUserRole() {
            return AuthService.getUserRole();
        }

        function getRoleDisplayName() {
            var role = AuthService.getUserRole();
            var roleNames = {
                'axa-internal': 'AXA Internal',
                'broker': 'Broker',
                'customer': 'Customer'
            };
            return roleNames[role] || 'User';
        }

        function getPortalLink() {
            var role = AuthService.getUserRole();
            return '#!/' + window.AUTH0_CONFIG.portalRoutes[role];
        }
    }

})();
