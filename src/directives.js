//directives.js
(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.user')

		.directive('noLogin', [function(){
			var noLoginController = ['$scope', 'noLoginService', function($scope, noLoginService){
				$scope.credentials = {
					username: null,
					password: null
				};

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
				controller: ['$scope','$uibModal', function($scope, $uibModal){
					$scope.user = noLogin.user;

					$scope.logoutModal = function () {
					    var modalInstance = $uibModal.open({
					      	animation: true,
							controller: 'userLogoutController',
						  	backdrop: 'static',
					      	template: '<div class="modal-header"><h3 class="modal-title centertext">Log Out</h3></div><div class="modal-body centertext">Would You Like To Clear The Database As Well?</div><div class="modal-footer"><button class="btn btn-warning pull-left" type="button" ng-click="clearStorage(true)">Yes</button><button class="btn btn-primary pull-left" type="button" ng-click="clearStorage(false)">No</button><button class="btn btn-default" type="button" ng-click="close()">Cancel</button></div>'
					    });
					};
				}]
			};
		}])

		.controller('userLogoutController',['$scope', '$uibModalInstance', 'noLoginService', function ($scope, $uibModalInstance, noLoginService) {

			$scope.clearStorage = function(option){
				var clearDatabase = option;

				clearDb(clearDatabase);
			};

			$scope.close = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}])
	;
})(angular);
