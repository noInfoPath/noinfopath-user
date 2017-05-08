//globals.js
/**
 * # noinfopath-user.js
 * @version 2.0.10
 *
 *
 * The noinfopath.user module contains services, and directives that assist in
 * developing an application that requires as secure and customized user
 * experience.
 *
 */
(function (angular, undefined) {
	"use strict";

	angular.module('noinfopath.user', [
		'noinfopath.data',
		'noinfopath.helpers'
	]);
})(angular);

//login.js
(function (angular, undefined) {
	"use strict";

	var $httpProviderRef;
	/*
	 * ## noLoginService : provider
	 *
	 * Returns an instance of the `LoginService` class will all dependencies
	 *	injected.
	 */
	/*
	 * ## NoInfoPathUser : Class
	 *
	 * This class provides an in memory representation of a NoInfoPath User.
	 * It is instanciated by the `noLoginService`, when an online user logs in
	 * or from the cached `LocalStorage` version when working offline.
	 *
	 * ### Constructors
	 *
	 * #### NoInfoPathUser(data)
	 *
	 * Contstructs new new NoInfoPathUser object from a JSON structure received
	 * from a call to the `noLoginService::login` method or retreived from
	 * local storage.
	 *
	 * ##### Usage
	 * ```js
	 * var user = new NoInfoPathUser(data);
	 * ```
	 *
	 * ##### Parameters
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |data|Object|A JSON data structure recevied after a successful login or from local storage|
	 *
	 * ### Methods
	 * None.
	 *
	 * ### Properties
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |tokenExpired|Bool|Returns true if the users bearer token has expired.|
	 *
	 */
	function NoInfoPathUser(lodash, noConfig, data) {
		var _ = lodash,
			noConfigCurrent = noConfig ? noConfig.current : {},
			securityObjects = noConfigCurrent ? noConfigCurrent.securityObjects : [],
			tmp, permissions = {};



		if (angular.isObject(data)) {
			tmp = data.data || data;
		} else {
			tmp = angular.fromJson(data);
			tmp = tmp.data || tmp;
		}

		tmp.acl = angular.fromJson(tmp.acl || "[]");

		function findAco(objectId, aco) {
			return aco.securityObjectID.toLowerCase() == objectId.toLowerCase();
		}

		for (var soi in securityObjects) {
			var so = securityObjects[soi],
				aco = _.find(tmp.acl, findAco.bind(null, so)),
				soo;

			if (aco) {
				soo = new NoAccessControl(aco);

				permissions[so] = soo;
			}

		}

		tmp.permissions = permissions || {};

		angular.extend(this, tmp);
		this.expires = new Date(Date.parse(this[".expires"]));

		Object.defineProperties(this, {
			"tokenExpired": {
				"get": function () {
					var n = new Date();
					return n >= this.expires;
				}
			}
		});

		this.getPermissions = function (objectId) {
			return this.permissions[objectId];
		};

	}
	noInfoPath.NoInfoPathUser = NoInfoPathUser;

	function NoAccessControl(aco) {

		Object.defineProperties(this, {
			canRead: {
				get: function () {
					return aco && aco.grant.indexOf("R") > -1;
				}
			},
			canWrite: {
				get: function () {
					return aco && aco.grant.indexOf("W") > -1;
				}
			}
		});
	}
	/*
	 * ## LoginService : Class
	 * LoginService is a backing class for the noLoginService provider. It provides the
	 * functionality for login, logout, and user registration.  The LoginService
	 * requires an active network connection to the NoInfoPath REST Service.
	 *
	 * ### Constructors
	 *
	 * #### LoginService($q,$http,noLocalStorage,noUrl,noConfig, $rootScope)
	 * This constructor is call via the Angular $injector service, as such, all
	 * of the parameters must injectable services.
	 *
	 * ##### Usage
	 * ```js
	 * var ls = LoginService($q, $http, noLocalStorage, noUrl, noConfig, $rootScope);
	 * ```
	 *
	 * ##### Parameters
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |$q|Service|AngularJS promise service|
	 * |$http|Service|AngularJS HTTP service|
	 * |noLocalStorage|Service|NoInfoPath LocalStorage service|
	 * |noUrl|Service|NoInfoPath Url formatting service|
	 * |noConfig|Service|NoInfoPath Configuration service|
	 * |$rootScope|Service|AngularJS root scope service.|
	 *
	 * ### Configuration
	 *
	 *	LoginService can be configured with an optional configuration hive in noConfig called noUser.
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |noUser|Object|Optional object within noConfig that holds the configuration for the noinfopath-user module|
	 * |noUser.storeUser|Boolean|Determines to persist user login information between browser sessions or not. Defaults to true|
	 * |noUser.noLogoutTimer|Int|noLogoutTimer directive configuration value. The amount of time in milliseconds of inactivity that elapses before the noLogoutTimer modal dialoge appears.|
	 *
	 * ### Methods
	 *
	 * #### login(userInfo)
	 * Calls the NoInfoPath Login service offered by the NoInfoPath REST API.
	 * Upon a successful login a new NoInfoPathUser object is created, and
	 * is cached in local storage.
	 *
	 * ##### Usage
	 * ```js
	 * 	noLoginService.login({username: "foo", password: "bar"})
	 * 		.then(angular.noop);
	 * ```
	 * ##### Parameters
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |userInfo|Object|Contains the username and password to try to authenticate.|
	 *
	 * ##### Returns
	 * AngularJS $q Promise. When the promise resolves a NoInfoPathUser object
	 * will be returned.
	 *
	 * #### register(registerInfo)
	 * Calls the NoInfoPath Account Registration service offered by the
	 * NoInfoPath REST API.
	 *
	 * ##### Usage
	 * ```js
	 * 	noLoginService.register({username: "foo", password: "bar", confirmPassword: "bar"})
	 * 		.then(angular.noop);
	 * ```
	 *
	 * ##### Parameters
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |registerInfo|Object|Contains the username, password and confirmPassword data required for registering a new user.|
	 *
	 * ##### Returns
	 * AngularJS $q Promise. When the promise resolves a NoInfoPathUser object
	 * will be returned.
	 *
	 * #### changePassword(updatePasswordInfo)
	 * Calls the NoInfoPath Account Change Password service offered by the
	 * NoInfoPath REST API.
	 *
	 * ##### Usage
	 * ```js
	 * 	noLoginService.changePassword({userId: "d11154b7-d48f-42e7-94c7-cf47e45e0d81", oldPassword: "hello", password: "bar", confirmPassword: "bar"})
	 * 		.then(angular.noop);
	 * ```
	 * ##### Parameters
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |updatePasswordInfo|Object|Contains the userId, the old password, the new password, and a confirmation of the new password. |
	 *
	 * ##### Returns
	 * AngularJS $q Promise.
	 *
	 * #### logout()
	 * Logs out the current user, and deletes all data stored in local storage.
	 *
	 * ##### Usage
	 * ```js
	 * 	noLoginService.logout();
	 * ```
	 * ##### Parameters
	 * None.
	 *
	 * ##### Returns
	 * Undefined
	 *
	 * ### Properties
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |isAuthenticated|Bool|Returns true if the there is a valid user stored in local storage|
	 * |isAuthorized|Bool|Turns true if the isAuthenticated and the bearer token is valid.|
	 * |user|NoInfoPathUser|A reference to the currently logged in user.|
	 *
	 * #### updateUser(userInfo)
	 * Logs out the current user, and deletes all data stored in local storage.
	 *
	 * ##### Usage
	 * ```js
	 * 	noLoginService.updateUser(userInfo);
	 * ```
	 * ##### Parameters
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |userInfo|Object|An objet that contains the user to be updated, along with the properties to be updated. UserID, Email, and Username are required. FirstName and LastName are optional. |
	 *
	 * ##### Returns
	 * AngularJS $q Promise Object. The promise returns the response from the WEBAPI.
	 *
	 */
	function LoginService($q, noHTTP, noLocalStorage, noSessionStorage, noUrl, noConfig, $rootScope, _, noAuth0Service) {
		var SELF = this,
			_user;

		$rootScope.failedLoginAttepts = 0;

		Object.defineProperties(this, {
			"isAuthenticated": {
				"get": function () {
					return angular.isObject(this.user);
				}
			},
			"isAuthorized": {
				"get": function () {
					return angular.isObject(this.user) && this.user.access_token && !this.user.tokenExpired;
				}
			},
			"user": {
				"get": function () {
					//console.log("user:get ", _user, angular.isUndefined(_user));
					if (angular.isUndefined(_user)) {
						var u = noLocalStorage.getItem("noUser"),
							t = noSessionStorage.getItem("noUser"),
							j = angular.toJson(u ? u : t);
						if (u || t) {
							_user = new NoInfoPathUser(_, noConfig, j);
						}
					}

					return _user;
				}
			}
		});

		this.whenAuthorized = function () {

			return $q(function (resolve, reject) {
				if (this.isAuthorized) {
					$httpProviderRef.defaults.headers.common.Authorization = this.user.token_type + " " + this.user.access_token;
					//authService.loginConfirmed(user);
					$rootScope.noUserAuth = true;
					$rootScope.failedLoginAttepts = 0;
					noInfoPath.setItem($rootScope, "noUser", _user);

					resolve(_user);
				} else {

					if ($rootScope.failedLoginAttepts === -1) {
						reject("authServiceOffline");
					} else {
						if ($rootScope.failedLoginAttepts > 3) {
							reject("tooManyFailedLogons");
						} else {
							reject("login");
						}
					}
				}
			}.bind(this));
		}.bind(this);

		this.Auth0 = function (loginInfo) {
			return new Promise(function (resolve, reject) {
				noAuth0Service.login(loginInfo.username, loginInfo.password)
					.then(function (authPackage) {
						var auth0User = authPackage.user;

						auth0User.access_token = authPackage.api.access_token;
						auth0User.userId = authPackage.user.user_metadata.hsl_user_id;
						auth0User.first_name = authPackage.user.user_metadata.first_name;
						auth0User.last_name = authPackage.user.user_metadata.last_name;
						auth0User.expires =  moment().add(authPackage.api.expires_in, "ms");
						auth0User.token_type = "Bearer";

						_user = new NoInfoPathUser(_, noConfig, auth0User);

						if (!noConfig.current.noUser || noConfig.current.noUser.storeUser) {
							noLocalStorage.setItem("noUser", _user);
						} else {
							noSessionStorage.setItem("noUser", _user);
						}

						$rootScope.noUserAuth = true;
						$rootScope.user = _user;
						$rootScope.failedLoginAttepts = 0;
						console.log(authPackage);
						console.log(_user);

						resolve(_user);
					})
					.catch(function (err) {
						console.error(err);
						var msg = "";
						switch (err.statusCode || err.status) {
							case 403:
							case 401:
								msg = err.description || err.statusText;
								$rootScope.failedLoginAttepts++;
								break;
							case 0:
								$rootScope.failedLoginAttepts = -1;
								msg = "Authentication service is offline.";
								break;
							}
						reject(msg);
					});
			});
		};

		this.login = function (loginInfo) {
			var deferred = $q.defer(),
				url = noUrl.makeResourceUrl(noConfig.current.AUTHURI, "token"),
				method = "POST",
				data = {
					"grant_type": "password",
					"password": loginInfo.password,
					"username": loginInfo.username
				};

			noHTTP.noRequestForm(url, method, data)
				.then(function (resp) {
					var user = new NoInfoPathUser(_, noConfig, resp);

					if (!noConfig.current.noUser || noConfig.current.noUser.storeUser) {
						noLocalStorage.setItem("noUser", user);
					} else {
						noSessionStorage.setItem("noUser", user);
					}

					$rootScope.noUserAuth = true;
					$rootScope.user = user;
					$rootScope.failedLoginAttepts = 0;

					deferred.resolve(user);
				})
				.catch(function (err) {
					var msg = "";
					switch (err.status) {
					case 400:
						msg = err.data.error_description;
						$rootScope.failedLoginAttepts++;
						break;
					case 0:
						$rootScope.failedLoginAttepts = -1;
						msg = "Authentication service is offline.";
						break;
					}

					deferred.reject(msg);
				});

			return deferred.promise;
		};

		this.register = function (registerInfo) {
			var deferred = $q.defer(),
				url = noUrl.makeResourceUrl(noConfig.current.WEBAPI, "api/account/register"),
				method = "POST",
				data = {
					"Email": registerInfo.email,
					"Password": registerInfo.password,
					"ConfirmPassword": registerInfo.confirmPassword
				};

			noHTTP.noRequestJSON(url, method, data)
				.then(function (resp) {
					deferred.resolve(resp);
				})
				.catch(deferred.reject);

			return deferred.promise;
		};

		this.changePassword = function (updatePasswordInfo) {
			var deferred = $q.defer(),
				url = noUrl.makeResourceUrl(noConfig.current.WEBAPI, "api/account/changepassword"),
				method = "POST",
				data = {
					"UserID": updatePasswordInfo.UserID,
					"OldPassword": updatePasswordInfo.OldPassword,
					"NewPassword": updatePasswordInfo.NewPassword,
					"ConfirmPassword": updatePasswordInfo.ConfirmPassword
				};

			noHTTP.noRequestJSON(url, method, data)
				.then(function (resp) {
					deferred.resolve(resp);
				})
				.catch(deferred.reject);

			return deferred.promise;
		};

		this.setPassword = function (setPasswordInfo) {
			var deferred = $q.defer(),
				url = noUrl.makeResourceUrl(noConfig.current.WEBAPI, "api/account/setpassword"),
				method = "POST",
				data = {
					"UserID": setPasswordInfo.UserID,
					"NewPassword": setPasswordInfo.NewPassword,
					"ConfirmPassword": setPasswordInfo.ConfirmPassword
				};

			noHTTP.noRequestJSON(url, method, data)
				.then(function (resp) {
					deferred.resolve(resp);
				})
				.catch(deferred.reject);

			return deferred.promise;
		};

		this.updatePermissions = function (updatePermissionInfo) {
			var deferred = $q.defer(),
				url = noUrl.makeResourceUrl(noConfig.current.WEBAPI, "api/account/updatepermissions"),
				method = "POST",
				data = updatePermissionInfo;

			noHTTP.noRequestJSON(url, method, data)
				.then(function (resp) {
					deferred.resolve(resp);
				})
				.catch(function (err) {
					deferred.reject(err);
				});

			return deferred.promise;
		};

		this.logout = function (stores, cleardb) {
			_user = "";
			noLocalStorage.removeItem("noUser");
			noSessionStorage.removeItem("noUser");

			if (stores && stores.nonDBStores) {
				for (var s in stores.nonDBStores) {
					noLocalStorage.removeItem(stores.nonDBStores[s]);
				}
			}

			if (cleardb && (stores.dbStores.clearDB === true)) {
				for (var d in stores.dbStores.stores) {
					noLocalStorage.removeItem(stores.dbStores.stores[d]);
				}
			}
		};

		this.logoutAuth0 = function () {
			// Get userId
			// Pass userId into this function: noAuth0Service.logout(userId);
			// call this.logout()
		};

		this.updateUser = function (userInfo) {
			var deferred = $q.defer(),
				url = noUrl.makeResourceUrl(noConfig.current.WEBAPI, "api/account/updateuser"),
				method = "POST",
				data = {
					"UserID": userInfo.UserID,
					"EmailAddress": userInfo.EmailAddress,
					"FirstName": userInfo.FirstName,
					"LastName": userInfo.LastName,
					"UserName": userInfo.UserName
				};

			noHTTP.noRequestJSON(url, method, data)
				.then(function (resp) {
					deferred.resolve(resp);
				})
				.catch(deferred.reject);

			return deferred.promise;
		};

		$rootScope.$on("event:auth-loginRequired", function () {
			$rootScope.$broadcast("noLoginService::loginRequired");
		});
	}

	angular.module("noinfopath.user")
		.config(["$httpProvider", function ($httpProvider) {
			$httpProviderRef = $httpProvider;
		}])
		.factory("noLoginService", ["$q", "noHTTP", "noLocalStorage", "noSessionStorage", "noUrl", "noConfig", "$rootScope", "lodash", "noAuth0Service", function ($q, noHTTP, noLocalStorage, noSessionStorage, noUrl, noConfig, $rootScope, _, noAuth0Service) {
			return new LoginService($q, noHTTP, noLocalStorage, noSessionStorage, noUrl, noConfig, $rootScope, _, noAuth0Service);
		}]);
})(angular);

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

		var dir = {
			templateUrl: function(el, attrs) {
				return attrs.templateUrl;
			},
			restrict: "E",
			link: function(scope, el, attrs) {
				var validateTemplate = el.find("#username, #password, #loginBtn"),
					btn = $(validateTemplate[2]);

				if(validateTemplate.length !== 3) throw "noLogin directive requires that the login HTML contain #username, #password, #loginBtn elements.";

				btn.click(function(e){
					var data = scope.credentials;

					if(data.$valid) {
						scope.$broadcast("noLogin::login", scope.credentials);
					} else {
						scope.$broadcast("no::validate");
					}
				});
				// scope.login = function () {
				// 	//log.write($scope.credentials);
				// 	//noLoginService.login($scope.credentials);
				// 	scope.$broadcast("noLogin::login", scope.credentials);
				// };
			}
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
							logoutTemplate = '<div class="modal-header"><h3 class="modal-title">Log Out</h3></div><div class="modal-body text-center">Are you sure you would like to logout?</div><div class="modal-footer center-text"><button class="btn btn-success pull-left" type="button" ng-click="logout()">Yes</button><button class="btn btn-defualt pull-left" type="button" ng-click="close()">No</button></div>';

						$scope.logoutModal = function () {
							var modalInstance = $uibModal.open({
								animation: true,
								controller: "userLogoutController",
								backdrop: "static",
								template: logoutTemplate
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

//security.js
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.user")
		.directive("noSecurity", ["noLoginService", "$state", "noFormConfig", "noConfig", "noSecurity", function (noLoginService, $state, noFormConfig, noConfig, noSecurity) {
		function _link(scope, el, attrs) {
			var perm, scopeVal;

			perm = noSecurity.getPermissions(attrs.noSecurity);

			if(attrs.grant === "W") {
				if(perm && perm.canWrite) {
					el.removeClass("ng-hide");
				} else {
					el.addClass("ng-hide");
				}
			} else {
				if(perm && perm.canRead) {
					el.removeClass("ng-hide");
				} else {
					el.addClass("ng-hide");
				}
			}

		}

		function _compile(el, attrs) {
			if(attrs.ngShow) {
				el.attr("ng-show", null);
			}

			return _link;
		}

		return {
			restrict: "A",
			compile: _compile
		};
		}])
		.directive("noSecurityMenu", ["noLoginService", "$state", "noFormConfig", "noConfig", function (noLoginService, $state, noFormConfig, noConfig) {
			function _compile(el, attrs) {

				var buttons = el.find("button");

				for(var i = 0; i < buttons.length; i++) {
					var buttonH = buttons[i],
						buttonA = angular.element(buttonH),
						matches = buttonH.outerHTML.match(/{[^}]*\}/g),
						match = matches ? matches[0].replace(/&quot;/g, "\"") : undefined,
						entityConfig = angular.fromJson(match ? match : {
							entity: buttonA.attr("ui-sref")
						}),
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
		.service("noSecurity", ["noLoginService", "$state", "noFormConfig", "noConfig", function (noLoginService, $state, noFormConfig, noConfig) {
			this.getPermissions = function (securityObject) {
				var objectId;

				if(securityObject === "entity") {
					if($state.params.entity) {
						objectId = noConfig.current.securityObjects[$state.params.entity];
					} else {
						objectId = noConfig.current.securityObjects[$state.current.name];
					}
				} else {
					objectId = securityObject;
				}
				var perm = noLoginService.user.getPermissions(objectId);

				return perm; //returns undefined or an object
			};
		}])
	;
})(angular);

(function (angular, auth0, undefined) {
	"use strict";

	function NoAuth0Service(noConfig, $http) {
		var noAuth0;

		this.init = function () {

			// noAuth0 = new auth0.WebAuth({
			// 	domain: noConfig.current.auth0.domain,
			// 	clientID: noConfig.current.auth0.clientId
			// });
		};

		this.login = function (username, password) {

			var payload = {
					"client_id": noConfig.current.auth0.clientId,
					"username": username.$viewValue,
					"password": password.$viewValue,
					"connection": "Username-Password-Authentication",
					"scope": "openid profile user_metadata",
					"audience": noConfig.current.auth0.audience,
					"grant_type": "password"
				},
				config = {
					headers: {
						"Content-Type": "application/json"
					},
					responseType: "json"
				};

			return $http.post(noConfig.current.auth0.ro, payload)
				.then(function(authInfo){
					return authInfo.data;
				})
				.then(_getUserInformation)
				.then(_getRESTAPIAccessToken.bind(null, username.$viewValue, password.$viewValue))
				.catch(function(err){
					throw err;
				});
		};

		function _getUserInformation(authInfo) {
			var config = {
					headers: {
						"Authorization": authInfo.token_type + " " + authInfo.access_token
					},
					responseType: "json"
				};

			return $http.get(noConfig.current.auth0.userinfo, config)
				.then(function(userInfo){
					console.log(userInfo);
					return {auth: authInfo, user: userInfo.data};
				})
				.catch(function(err){
					console.error(err);
				});

		}

		function _getRESTAPIAccessToken(username, password, authPackage) {
			var payload = {
					"grant_type":"password",
					"client_id": noConfig.current.auth0.clientId,
					"username": username,
					"password": password,
					"audience": noConfig.current.auth0.audience,
					"scope":"openid",
					"realm":"Username-Password-Authentication"
				},
				config = {
					headers: {
						"Content-Type": "application/json"
					},
					responseType: "json"
				};

			return $http.post(noConfig.current.auth0.token, payload, config)
				.then(function(apiInfo){
					authPackage.api = apiInfo.data;

					return authPackage;
				})
				.catch(function(err){
					console.error(err);
				});
		}

		this.logout = function () {
			noAuth0.logout({
				returnTo: "", // URI
				client_id: "" // clientID
			});
		};
	}

	angular.module("noinfopath.user")
		.service("noAuth0Service", ["noConfig", "$http", NoAuth0Service]);
})(angular);
