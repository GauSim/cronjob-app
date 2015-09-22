'use strict';

/**
 * @ngdoc function
 * @name frontendApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the frontendApp
 */
angular.module('frontendApp')
  .controller('MainCtrl', function ($http) {
    var self = this;

    self.moment = moment;



    self.sync = function () {
      $http.get('/api/status')
        .success(function (status) {
          self.status = status;
        });
      $http.get('/api/list')
        .success(function (data) {
          self.awesomeThings = data;
        });
    };

    self.newItem = {
      url: 'http://google.de',
      interval: {
        seconds: 0,
        minutes: 0,
        hours: 0,
        days: 0,
        weeks: 0
      }
    };

    self.add = function () {
      $http.post('/api/add', self.newItem)
        .success(function (data) {
          self.sync();
        })
    };
    self.remove = function (item) {
      $http.post('/api/remove', item)
        .success(function (data) {
          self.sync();
        })
    }
    self.sync();

  });
