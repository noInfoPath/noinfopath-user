//directives.js
(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.user')
	
		.directive('noLogin', [function(){
			var noLoginController = ['$scope', 'noLoginService', function($scope, noLoginService){
				$scope.credentials = {
					username: null,
					password: null
				}

				$scope.login = function(){
					log.write($scope.credentials);
					noLoginService.login($scope.credentials);
				};

			}];

			var dir = {
				require: "A",
				link: noLoginController
			};

			return dir;
		}])

		.directive('noUserMenu',['noLoginService', function(noLogin){
			return {
				template: "Welcome {{user.username}}",
				controller: ['$scope', function($scope){
					$scope.user = noLogin.user();
				}]
			}
		}])
;