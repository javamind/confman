'use strict';


angular.module('confman').factory('LanguageService', ['$http', '$translate', 'LANGUAGES', function ($http, $translate, LANGUAGES) {
    return {
        getBy: function(language) {

            if (!language) {
                language = 'en';
            }

            var promise =  $http.get('/i18n/' + language + '.json').then(function(response) {
                return LANGUAGES;
            });
            return promise;
        }
    };
}]);