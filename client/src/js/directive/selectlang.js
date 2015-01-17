/**
 * Directive to control the validity of version number
 */
angular.module('confman').directive('selectLang', ['$translate', '$locale',
  function ($translate, $locale) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs, controller) {
        var language = attrs.activeMenu;

        scope.$watch(function () {
          return $translate.use();
        }, function (selectedLanguage) {
          if (language === selectedLanguage) {
            element.addClass('active');
          } else {
            element.removeClass('active');
          }
        });
      }
    };
  }
]);
