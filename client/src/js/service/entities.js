'use strict';

var restActions = {
    'get':    {method:'GET', withCredentials: true},
    'save':   {method:'POST', withCredentials: true},
    'update': {method:'PUT', withCredentials: true},
    'query':  {method:'GET', isArray:true, withCredentials: true},
    'delete': {method:'DELETE', withCredentials: true},
    'options': { method : 'OPTIONS', withCredentials: true }
};

angular.module('confman')

    .factory('Environment', function Environment($resource, constants) {
        return $resource(constants.urlserver + 'app/environment/:id', { id: '@_id' },restActions);
    })
    .factory('SoftwareSuite', function SoftwareSuite($resource, constants) {
        return $resource(constants.urlserver + 'app/softwaresuite/:id', { id: '@_id' },restActions);
    })
    .factory('Application', function Application($resource, constants) {
        return $resource(constants.urlserver + 'app/application/:id', { id: '@_id' },restActions);
    })
    .factory('ApplicationVersion', function ApplicationVersion($resource, constants) {
        return $resource(constants.urlserver + 'app/applicationversion/:id', { id: '@_id' },restActions);
    })
    .factory('TrackingVersion', function TrackingVersion($resource, constants) {
        return $resource(constants.urlserver + 'app/trackingversion/:id', { id: '@_id' },restActions);
    })
    .factory('Instance', function Instance($resource, constants) {
        return $resource(constants.urlserver + 'app/instance/:id', { id: '@_id' },restActions);
    })
    .factory('Parameter', function Parameter($resource, constants) {
        return $resource(constants.urlserver + 'app/parameter/:id', { id: '@_id' },restActions);
    })
    .factory('ParamaterGroupment', function ParamaterGroupment($resource, constants) {
        return $resource(constants.urlserver + 'app/parametergroupment/:id', { id: '@_id' },restActions);
    })
    .factory('User', function ParamaterGroupment($resource, constants) {
        return $resource(constants.urlserver + 'app/user/:login', { login: '@_login' },restActions);
    });