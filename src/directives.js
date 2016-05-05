//directives.js
(function(angular, undefined){
	"use strict";

	angular.module("noinfopath.user")

		.directive("noLogin", [function(){
			var noLoginController = ["$scope", "noLoginService", function($scope, noLoginService){
				$scope.credentials = {
					username: null,
					password: null
				};

				$scope.login = function(){
					//log.write($scope.credentials);
					noLoginService.login($scope.credentials);
				};

			}];

			var dir = {
				require: "A",
				link: noLoginController
			};

			return dir;
		}])

		.directive("noUserMenu",[function(){
			return {
				template: "Welcome {{user.username}}",
				controller: ["$scope", "$uibModal", "noConfig", "noLoginService",  function($scope, $uibModal, noConfig, noLoginService){

					noConfig.whenReady("config.json")
						.then(function(){
							var localStoresExists = noConfig.current.localStores ? true : false,
								databaseLogoutTemplate = '<div class="modal-header"><h3 class="modal-title centertext">Log Out</h3></div><div class="modal-body centertext">Would You Like To Clear The Database As Well?</div><div class="modal-footer"><button class="btn btn-warning pull-left" type="button" ng-click="logout(true)">Yes</button><button class="btn btn-primary pull-left" type="button" ng-click="logout(false)">No</button><button class="btn btn-default" type="button" ng-click="close()">Cancel</button></div>',
								logoutTemplate = '<div class="modal-header"><h3 class="modal-title centertext">Log Out</h3></div><div class="modal-body centertext">Are you sure you would like to logout?</div><div class="modal-footer"><button class="btn btn-warning pull-left" type="button" ng-click="logout()">Yes</button><button class="btn btn-primary pull-left" type="button" ng-click="close()">No</button></div>';

							$scope.logoutModal = function () {
							    var modalInstance = $uibModal.open({
							      	animation: true,
									controller: "userLogoutController",
								  	backdrop: "static",
							      	template: localStoresExists ? databaseLogoutTemplate : logoutTemplate
							    });
							};

						});

				}]
			};
		}])

		.directive("noSecurity", ["noLoginService", "$state", "noFormConfig", "noConfig", function(noLoginService, $state, noFormConfig, noConfig){
			function _link(scope, el, attrs){
				var objectId;

				if(attrs.noSecurity){
					if(attrs.noSecurity == "entity")
					{
						if($state.params.entity){
							objectId = noConfig.current.securityObjects[$state.params.entity];
						} else {
							objectId = noConfig.current.securityObjects[$state.current.name];
						}
					} else {
						objectId = attrs.noSecurity;
					}
					var perm = noLoginService.user.getPermissions(objectId);

					if(attrs.grant == "W"){
						if(perm && perm.canWrite){
							el.removeClass("ng-hide");
						} else {
							el.addClass("ng-hide");
						}
					} else {
						if(perm && perm.canRead){
							el.removeClass("ng-hide");
						} else {
							el.addClass("ng-hide");
						}
					}
				}
				// } else {
				// 	noFormConfig.getFormByRoute($state.current.name, $state.params.entity, scope)
				// 		.then(function(data){
				// 			if(noLoginService.user.getPermissions(data.security[attrs.noNav])){
				// 				el.removeClass("ng-hide");
				// 			} else {
				// 				el.addClass("ng-hide");
				// 			}
				// 		})
				// 		.catch(function(err) {
				// 			console.error(err);
				// 		});
				// }

			}

			return {
				restrict: "A",
				link: _link
			};
		}])

		.directive("noSecurityMenu", ["noLoginService", "$state", "noFormConfig", "noConfig", function(noLoginService, $state, noFormConfig, noConfig){
			function _compile(el, attrs){

				var buttons = el.find("button");

				for (var i = 0; i < buttons.length; i++){
					var buttonH = buttons[i],
						buttonA = angular.element(buttonH),
						matches = buttonH.outerHTML.match(/{[^}]*\}/g),
						match = matches ? matches[0].replace(/&quot;/g, "\"") : undefined,
						entityConfig = angular.fromJson(match ? match : {entity: buttonA.attr("ui-sref")}),
						sid = noConfig.current.securityObjects[entityConfig.entity];

					buttonA.attr("no-security", sid);
				}

				return angular.noop;
			}

			return {
				restrict: "A",
				compile: _compile
			};
		}])

		.directive("noUserGroups", ["$q", "$http", "noConfig", "$state", "noUrl", "noLoginService", "lodash", function($q, $http, noConfig, $state, noUrl, noLoginService, _){
			function _link(scope, el, attrs){
				var deferred = $q.defer(),
					user = $state.params.id,
					groupListURL = noUrl.makeResourceUrl(noConfig.current.NOREST, "odata/NoInfoPath_Groups"),
					memberGroupURL = noUrl.makeResourceUrl(noConfig.current.NOREST, "odata/NoInfoPath_Users(guid'" + user + "')/NoInfoPath_Groups"),
					groups;

				$http.get(groupListURL, {}, {
					headers: {
						"Authorization": noLoginService.user.token_type + " " + noLoginService.user.access_token
					},
					data: {},
					withCredentials: true
				})
				.then(function(resp){
					if(resp.data && resp.data.value && resp.data.value.length > 0){
						var groups = _.sortBy(resp.data.value, "GroupName");

						$http.get(memberGroupURL, {}, {
							headers: {
								"Authorization": noLoginService.user.token_type + " " + noLoginService.user.access_token
							},
							data: {},
							withCredentials: true
						})
						.then(function(resp2){
							var checkedItems = [];

							for(var i = 0; i < groups.length; i++){
								var value = groups[i],
									group = angular.element("<div></div>"),
									label = angular.element("<label></label>"),
									chbox = angular.element("<input type='checkbox'/>");

								group.addClass("checkbox");

								label.text(value.GroupName + " (" + value.GroupCode + ")");

								chbox[0].value = value.GroupID;

								if(_.find(resp2.data.value, {"GroupName": value.GroupName})){
									chbox[0].checked = true;
									checkedItems.push(value.GroupID);
								}

								label.prepend(chbox);
								group.append(label);
								el.append(group);

								scope.noReset_permissions = checkedItems;
							}

							deferred.resolve();
						})
						.catch(deferred.reject);
					}
				})
				.catch(deferred.reject);

				// $http.get(url, "odata/NoInfoPath_Users(" + user + ")/NoInfoPath_Groups")
				// 	.then(function(data){
				//
				// 	})
				// 	.catch(deferred.reject);

				return deferred;
			}

			return {
				restrict: "E",
				link: _link
			};
		}])

		.controller("userLogoutController",["$scope", "$uibModalInstance", "noLoginService", "noConfig", function ($scope, $uibModalInstance, noLoginService, noConfig) {
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
				$uibModalInstance.dismiss("cancel");
			};
		}])
	;
})(angular);
