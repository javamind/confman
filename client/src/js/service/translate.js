'use strict';


angular.module('confman.services').factory('LanguageService', ['$http', '$translate', 'LANGUAGES', function ($http, $translate, LANGUAGES) {
  function getBy(language) {

    if (!language) {
      language = 'en';
    }

    var promise = $http.get('/i18n/' + language + '.json').then(function (response) {
      return LANGUAGES;
    });
    return promise;
  }

  return {
    getBy:getBy
  };
}]);