//directives.js
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.user")

		/*
		 * ## noLogin : directive
		 *
		 * Sets the credential object and a login function that calls the noLoginService login function onto the scope.
		 */
		.directive("noLogin", [function () {
			var noLoginController = ["$scope", "noLoginService", function ($scope, noLoginService) {
				$scope.credentials = {
					username: null,
					password: null
				};

				$scope.login = function () {
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

		/*
		 * ## noUserMenu : directive
		 *
		 * Sets a logout function on the scope that opens a modal to let the user log out. If there are localStores within the configuration, it also gives the option to clear local storage.
		 */
		.directive("noUserMenu", [function () {
		return {
			template: "Welcome {{user.username}}",
			controller: ["$scope", "$uibModal", "noConfig", "noLoginService", function ($scope, $uibModal, noConfig, noLoginService) {

				noConfig.whenReady("config.json")
					.then(function () {
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

		/*
		 * ## noUserGroups : directive
		 *
		 * Dynamically creates a set of checkboxes based on the number of user groups from the configured NOREST database.
		 */
		.directive("noUserGroups", ["$q", "$http", "noConfig", "$state", "noUrl", "noLoginService", "lodash", function ($q, $http, noConfig, $state, noUrl, noLoginService, _) {
		function _link(scope, el, attrs) {
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
				.then(function (resp) {
					if(resp.data && resp.data.value && resp.data.value.length > 0) {
						var groups = _.sortBy(resp.data.value, "GroupName");

						$http.get(memberGroupURL, {}, {
								headers: {
									"Authorization": noLoginService.user.token_type + " " + noLoginService.user.access_token
								},
								data: {},
								withCredentials: true
							})
							.then(function (resp2) {
								var checkedItems = [];

								for(var i = 0; i < groups.length; i++) {
									var value = groups[i],
										group = angular.element("<div></div>"),
										label = angular.element("<label></label>"),
										chbox = angular.element("<input type='checkbox'/>");

									group.addClass("checkbox");

									label.text(value.GroupName + " (" + value.GroupCode + ")");

									chbox[0].value = value.GroupID;

									if(_.find(resp2.data.value, {
											"GroupName": value.GroupName
										})) {
										chbox[0].checked = true;
										checkedItems.push(value.GroupID);
									}

									if(value.GroupName === "Administrator" && noLoginService.user.userId === $state.params.id) {
										chbox[0].disabled = true;
									}

									label.prepend(chbox);
									group.append(label);
									el.append(group);

									scope.noReset_permission = checkedItems;
								}

								deferred.resolve();
							})
							.catch(deferred.reject);
					}
				})
				.catch(deferred.reject);

			return deferred;
		}

		return {
			restrict: "E",
			link: _link
		};
	}])
		.directive("noSecurityGroups", ["$q", "$http", "noConfig", "$state", "noUrl", "noLoginService", "lodash", function ($q, $http, noConfig, $state, noUrl, noLoginService, _) {
			function _link(scope, el, attrs) {
				var deferred = $q.defer(),
					group = $state.params.id,
					securityObjects = noUrl.makeResourceUrl(noConfig.current.NOREST, "odata/NoInfoPath_Security_Objects"),
					memberGroupURL = noUrl.makeResourceUrl(noConfig.current.NOREST, "odata/NoInfoPath_Groups(guid'" + group + "')/NoInfoPath_Security_Objects"),
					groups;

				$http.get(groupListURL, {}, {
						headers: {
							"Authorization": noLoginService.user.token_type + " " + noLoginService.user.access_token
						},
						data: {},
						withCredentials: true
					})
					.then(function (resp) {
						if(resp.data && resp.data.value && resp.data.value.length > 0) {
							var secObjs = _.sortBy(resp.data.value, "Title");

							$http.get(memberGroupURL, {}, {
									headers: {
										"Authorization": noLoginService.user.token_type + " " + noLoginService.user.access_token
									},
									data: {},
									withCredentials: true
								})
								.then(function (resp2) {
									var checkedItems = [];

									for(var i = 0; i < secObjs.length; i++) {
										var value = secObjs[i],
											secobj = angular.element("<div></div>"),
											label = angular.element("<label></label>"),
											chbox = angular.element("<input type='checkbox'/>");

										secobj.addClass("checkbox");

										label.text(value.Title);

										chbox[0].value = value.SecurityObjectID;

										if(_.find(resp2.data.value, {
												"Title": value.Title
											})) {
											chbox[0].checked = true;
											checkedItems.push(value.GroupID);
										}

										label.prepend(chbox);
										group.append(label);
										el.append(secobj);

										scope.noReset_permission = checkedItems;
									}

									deferred.resolve();
								})
								.catch(deferred.reject);
						}
					})
					.catch(deferred.reject);

				return deferred;
			}

			return {
				restrict: "E",
				link: _link
			};
		}])
		.controller("userLogoutController", ["$scope", "$uibModalInstance", "noLoginService", "noConfig", function ($scope, $uibModalInstance, noLoginService, noConfig) {
		$scope.logout = function (option) {
			var clearDatabase,
				localStores;

			if(option) {
				clearDatabase = option;
				localStores = noConfig.current.localStores;
			}

			noLoginService.logout(localStores, clearDatabase);

			location.href = "/";
		};

		$scope.close = function () {
			$uibModalInstance.dismiss("cancel");
		};
	}])

		/*
		@directive noLogoutTimer

	 * noLogoutTimer is a directive that dynamically creates a modal popup that will show after a configured time informing the user that their inactivity
	 * will cause them to log out, and after 60 more seconds, log out the user.
	 *
	 * noLogoutTimer gets the configuration from noConfig, which is detailed below.
 	 *
	 * |Name|Type|Description|
 	 * |----|----|-----------|
 	 * |noUser.noLogoutTimer|int|The amount of time in milliseconds of inactivity that elapses before the noLogoutTimer modal dialoge appears.|
	 *
	*/
		.directive("noLogoutTimer", ["$timeout", "noLoginService", "noConfig", "$state", "$rootScope", "$interval", function($timeout, noLoginService, noConfig, $state, $rootScope, $interval){
			function _compile(el, attrs){
				el.html(
					"<div class='no-logout-container'>" +
						"<div class='no-logout-box no-flex-host'>" +
							"<div class='no-logout-header no-flex no-flex-item size-0'>Inactivity Timer</div>" +
							"<div class='no-logout-body no-flex no-flex-item size-1 vertical'>You will be logged out in <strong>{{logoutSeconds}}</strong> seconds due to inactivity. <br /> Click on 'Cancel' to stay logged in.</div>" +
							"<div class='no-logout-footer no-flex no-flex-item size-0 horizontal flex-center'><button class='no-logout-button no-flex no-flex-item size-0 btn btn-primary' type='button'>Cancel</button></div>" +
						"</div>" +
					"</div>"
				);

				return _link;
			}

			function _link(scope, el, attrs){


				var t = el.detach(),
					btn = t.find(".no-logout-button"),
					int;

				t.addClass("ng-hide");

        $("body").append(t);

				btn.click(function(e){
					el.addClass("ng-hide");
					$interval.cancel(int);
					resetTimer();
				});

				$rootScope.logoutTimerPopupHide = function(){
					el.addClass("ng-hide");
				}

				$rootScope.logoutTimerPopupShow = function(){
					el.removeClass("ng-hide");
					scope.logoutSeconds = 60;

					int = $interval(
						function(){
							scope.logoutSeconds--;

							if(scope.logoutSeconds == 0){
								$interval.cancel(int);
								logout();
							}
						},
						1000);
				}

				function resetTimer(){
					$timeout.cancel(logoutTimeout);
					logoutTimeout = $timeout($rootScope.logoutTimerPopupShow, noConfig.current.noUser.noLogoutTimer);
				}

				function logout(){
					noLoginService.logout();
					location.href = "/";
				}

				var logoutTimeout = $timeout(resetTimer, noConfig.current.noUser.noLogoutTimer);
				document.onmousemove = resetTimer;
    		document.onkeypress = resetTimer;
			}

			return {
				restrict: "E",
				compile: _compile
			};
	}])
	;
})(angular);
