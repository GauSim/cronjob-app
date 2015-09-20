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

    self.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    self.sync = function () {
      $http.get('/api/list').success(function (data) {
        console.log(data);
        self.awesomeThings = data;
      });
    };

    self.newItem = {
      url: 'http://google.de',
      interval: 1
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
