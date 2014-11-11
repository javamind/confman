

angular.module('confman').factory('Session', function () {
    this.create = function (login, firstName, lastName, email, userRoles) {
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.userRoles = userRoles;
    };
    this.invalidate = function () {
        this.login = null;
        this.firstName = null;
        this.lastName = null;
        this.email = null;
        this.userRoles = null;
    };
    return this;
});

angular.module('confman').factory('AuthenticationSharedService', function ($rootScope, $http, authService, Session, constants) {
    return {
        login: function (param) {
            var data ="username=" + encodeURIComponent(param.username) +"&password=" + encodeURIComponent(param.password) +"&_spring_security_remember_me=" + param.rememberMe +"&submit=Login";
            alert(constants.urlserver + 'app/authentication' + ' iii=' + document.location.origin);
            $http
                .post(constants.urlserver + 'app/authentication', data, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    ignoreAuthModule: 'ignoreAuthModule'
                })
                .success(function (datazz) {
                    alert("auth ok precision" + datazz);
                    $http.get(constants.urlserver + 'app/account')
                        .success(
                            function(data) {
                                alert("session");
                                Session.create(data.login, data.firstName, data.lastName, data.email, data.roles);
                                $rootScope.account = Session;
                                authService.loginConfirmed(data);
                            }
                        );
                })
                .error(function () {
                    $rootScope.authenticationError = true;
                    Session.invalidate();
                });
        },
        valid: function (authorizedRoles) {
            $http.get('protected/authentication_check.gif', { ignoreAuthModule: 'ignoreAuthModule'})
                .success(function () {
                    if (!Session.login) {
                        $http.get(constants.urlserver +  'app/account')
                            .success(function(data) {
                                Session.create(data.login, data.firstName, data.lastName, data.email, data.roles);
                                $rootScope.account = Session;
                                $rootScope.authenticated = true;
                            }
                        );
                    }
                    $rootScope.authenticated = !!Session.login;
                })
                .error(function (data) {
                    $rootScope.authenticated = false;

                    if (!$rootScope.isAuthorized(authorizedRoles)) {
                        $rootScope.$broadcast('event:auth-loginRequired', data);
                    }
                }
            );
        },
        isAuthorized: function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                if (authorizedRoles == '*') {
                    return true;
                }
                authorizedRoles = [authorizedRoles];
            }

            var isAuthorized = false;
            angular.forEach(authorizedRoles, function(authorizedRole) {
                var authorized = (!!Session.login &&
                    Session.userRoles.indexOf(authorizedRole) !== -1);
                if (authorized || authorizedRole == '*') {
                    isAuthorized = true;
                }
            });

            return isAuthorized;
        },
        logout: function () {
            $rootScope.authenticationError = false;
            $rootScope.authenticated = false;
            $rootScope.account = null;

            $http.get(constants.urlserver + 'app/logout');
            Session.invalidate();
            authService.loginCancelled();
        }
    };
});