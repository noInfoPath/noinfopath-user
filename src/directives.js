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

		.directive('noUserMenu',['noLoginService', 'noConfig', function(noLoginService, noConfig){
			return {
				template: "Welcome {{user.username}}",
				controller: ['$scope','$uibModal', function($scope, $uibModal){
					$scope.user = noLoginService.user;

					var localStoresExists = noConfig.current.localStores ? true : false,
						databaseLogoutTemplate = '<div class="modal-header"><h3 class="modal-title centertext">Log Out</h3></div><div class="modal-body centertext">Would You Like To Clear The Database As Well?</div><div class="modal-footer"><button class="btn btn-warning pull-left" type="button" ng-click="logout(true)">Yes</button><button class="btn btn-primary pull-left" type="button" ng-click="logout(false)">No</button><button class="btn btn-default" type="button" ng-click="close()">Cancel</button></div>',
						logoutTemplate = '<div class="modal-header"><h3 class="modal-title centertext">Log Out</h3></div><div class="modal-body centertext">Are you sure you would like to logout?</div><div class="modal-footer"><button class="btn btn-warning pull-left" type="button" ng-click="logout()">Yes</button><button class="btn btn-primary pull-left" type="button" ng-click="close()">No</button></div>';

					$scope.logoutModal = function () {
					    var modalInstance = $uibModal.open({
					      	animation: true,
							controller: 'userLogoutController',
						  	backdrop: 'static',
					      	template: localStoresExists ? databaseLogoutTemplate : logoutTemplate
					    });
					};
				}]
			};
		}])

		.controller('userLogoutController',['$scope', '$uibModalInstance', 'noLoginService', "noConfig", function ($scope, $uibModalInstance, noLoginService, noConfig) {
			$scope.logout = function(option){
				var clearDatabase,
					localStores;

				if(option){
					clearDatabase = option;
					localStores = noConfig.current.localStores;
				}

				noLoginService.logout(localStores,clearDatabase);

				location.href = "/";
			};

			$scope.close = function () {
				$uibModalInstance.dismiss('cancel');
			};
		}])
	;
})(angular);
