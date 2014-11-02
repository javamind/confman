'use strict';

/**
 * Menu controller
 */
angular.module('confman').controller('langCtrl', ['$scope', '$translate', 'LanguageService',
    function($scope, $translate, LanguageService) {
        $scope.changeLanguage = function (languageKey) {
            $translate.use(languageKey);

            LanguageService.getBy(languageKey).then(function(languages) {
                $scope.languages = languages;
            });
        };

        LanguageService.getBy().then(function (languages) {
            $scope.languages = languages;
        });
    }]
);
