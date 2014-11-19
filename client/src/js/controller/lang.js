'use strict';

/**
 * Menu controller
 */
angular.module('confman').controller('langCtrl', ['$scope', '$rootScope', '$translate', 'LanguageService',
    function($scope, $rootScope, $translate, LanguageService) {
        $scope.changeLanguage = function (languageKey) {
            $translate.use(languageKey);
            $rootScope.language=languageKey;

            LanguageService.getBy(languageKey).then(function(languages) {
                $scope.languages = languages;
            });
        };

        LanguageService.getBy().then(function (languages) {
            $scope.languages = languages;
        });


    }]
);

