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
		tmp.expires = tmp.expires.valueOf();

		angular.extend(this, tmp);


		Object.defineProperties(this, {
			"tokenExpired": {
				"get": function () {
					var n = new Date().valueOf();
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
					//$httpProviderRef.defaults.headers.common.Authorization = this.user.token_type + " " + this.user.access_token;
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

						auth0User.access_token = authPackage.auth.access_token;
						//auth0User.userId = authPackage.user.user_metadata.hsl_user_id;
						//auth0User.first_name = ""; //authPackage.user.user_metadata.first_name;
						//auth0User.last_name = ""; //authPackage.user.user_metadata.last_name;
						auth0User.expires =  moment().add(authPackage.auth.expires_in, "s");
						auth0User.token_type = "Bearer";
						auth0User.refresh_token = authPackage.auth.refresh_token;

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
