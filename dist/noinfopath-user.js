
//globals.js

/**
 * # noinfopath-user.js
 * @version 1.0.4
 *
 *
 * The noinfopath.user module contains services, and directives that assist in
 * developing an application that requires as secure and customized user
 * experience.
 *
 */

(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.user',[
		'base64',
		/*'http-auth-interceptor',*/
		'noinfopath.data',
		'noinfopath.helpers'
	]);

})(angular);

//login.js


(function(angular, undefined){
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
	function NoInfoPathUser(data){
		var tmp;
		if(angular.isObject(data)){
			tmp = data;
		}else{
			tmp = angular.fromJson(data);

		}

		angular.extend(this, tmp);
		this.expires = new Date(Date.parse(this[".expires"]));

		Object.defineProperties(this, {
			"tokenExpired": {
				"get": function(){
					var n = new Date();
					return n >= this.expires;
				}
			}
		});
	}
	noInfoPath.NoInfoPathUser = NoInfoPathUser;

	/*
	 * ## LoginService : Class
	 * LoginService is a backing class for the noLoginService provider. It provides the
	 * functionality for login, logout, and user registration.  The LoginService
	 * requires an active network connection to the NoInfoPath REST Service.
	 *
	 * ### Constructors
	 *
	 * #### LoginService($q,$http,$base64,noLocalStorage,noUrl,noConfig, $rootScope)
	 * This constructor is call via the Angular $injector service, as such, all
	 * of the parameters must injectable services.
	 *
	 * ##### Usage
	 * ```js
	 * var ls = LoginService($q, $http, $base64, noLocalStorage, noUrl, noConfig, $rootScope);
	 * ```
	 *
	 * ##### Parameters
	 *
	 * |Name|Type|Description|
	 * |----|----|-----------|
	 * |$q|Service|AngularJS promise service|
	 * |$http|Service|AngularJS HTTP service|
	 * |$base64|Service|Base64 conversion service|
	 * |noLocalStorage|Service|NoInfoPath LocalStorage service|
	 * |noUrl|Service|NoInfoPath Url formatting service|
	 * |noConfig|Service|NoInfoPath Configuration service|
	 * |$rootScope|Service|AngularJS root scope service.|
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
	*/
	function LoginService($q,$http,$base64,noLocalStorage,noUrl,noConfig, $rootScope){
		var SELF = this,
			_user;

		$rootScope.failedLoginAttepts = 0;

		Object.defineProperties(this, {
			"isAuthenticated": {
				"get": function(){
					return angular.isObject(this.user);
				}
			},
			"isAuthorized": {
				"get": function() {
					return angular.isObject(this.user) && !this.user.tokenExpired;
				}
			},
			"user": {
				"get": function() {
					//console.log("user:get ", _user, angular.isUndefined(_user));
					if(angular.isUndefined(_user))
					{
						var u = noLocalStorage.getItem("noUser"),
							j = angular.toJson(u);
						if(u){
							_user = new NoInfoPathUser(j);
						}
					}

					return _user;
				}
			}
		});

		this.whenAuthorized = function(){
			return $q(function(resolve, reject){
				if(this.isAuthorized)
				{
					$httpProviderRef.defaults.headers.common.Authorization = this.user.token_type + " " + this.user.access_token;
					//authService.loginConfirmed(user);
					$rootScope.noUserAuth = true;
					$rootScope.failedLoginAttepts = 0;
					resolve(this.user);
				}else{

					if($rootScope.failedLoginAttepts === -1){
						reject("authServiceOffline");
					}else{
						if($rootScope.failedLoginAttepts > 3){
							reject("tooManyFailedLogons");
						}else{
							reject("login");
						}
					}
				}
			}.bind(this));
		}.bind(this);

		this.login = function login(loginInfo){
			var deferred = $q.defer();
				//console.log("loginInfo",loginInfo);
			noConfig.whenReady()
				.then(function(){
					var params = $.param({
						"grant_type": "password",
						"password": loginInfo.password,
						"username": loginInfo.username
					}),
					url = noUrl.makeResourceUrl(noConfig.current.AUTHURI, "token");

					//console.log("params",params);
					$http.post(url, params, {
						headers: {
							"Content-Type": "appication/x-www-form-urlencoded"
						},
						data: params,
						withCredentials: true
					})
					.then(function(resp){
						var user = new NoInfoPathUser(resp.data);

						noLocalStorage.setItem("noUser", user);

						$httpProviderRef.defaults.headers.common.Authorization = user.token_type + " " + user.access_token;
						//authService.loginConfirmed(user);
						$rootScope.noUserAuth = true;
						$rootScope.failedLoginAttepts = 0;
						deferred.resolve(user);
					})
					.catch(function(err){
						var msg = "";
						switch(err.status){
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
				});


			return deferred.promise;
		};

		this.register = function register(registerInfo){
			var deferred = $q.defer();

			noConfig.whenReady()
				.then(function(){
					var params = $.param({
						"Email": registerInfo.email,
						"Password": registerInfo.password,
						"ConfirmPassword": registerInfo.confirmPassword
					}),
					url = noUrl.makeResourceUrl(noConfig.current.NOREST, "api/account/register");

					$http.post(url, params, {
						headers: {
							"Content-Type": "application/x-www-form-urlencoded"
						},
						data: params,
						withCredentials: true
					})
					.then(function(resp){

						//console.log("registration complete",a,b,c,d,e);

						//$httpProviderRef.defaults.headers.common.Authorization = user.token_type + " " + user.access_token;
						deferred.resolve(resp);
					})
					.catch(deferred.reject);
				});
			return deferred.promise;
		};

		this.changePassword = function changePassword(updatePasswordInfo){
			var deferred = $q.defer();

			noConfig.whenReady()
				.then(function(){
					var params = $.param({
						"OldPassword": updatePasswordInfo.OldPassword,
						"NewPassword": updatePasswordInfo.NewPassword,
						"ConfirmPassword": updatePasswordInfo.ConfirmPassword
					}),
					url = noUrl.makeResourceUrl(noConfig.current.NOREST, "api/account/changepassword");

					$http.post(url, params, {
						headers: {
							"Content-Type": "application/x-www-form-urlencoded"
						},
						data: params,
						withCredentials: true
					})
					.then(function(resp){

						//console.log("Password Updated",a,b,c,d,e);

						//$httpProviderRef.defaults.headers.common.Authorization = user.token_type + " " + user.access_token;
						deferred.resolve(resp);
					})
					.catch(deferred.reject);
				});
			return deferred.promise;
		};

		this.logout = function logout(stores, cleardb){
			_user = "";
			noLocalStorage.removeItem("noUser");

			if(stores && stores.nonDBStores){
				for(var s in stores.nonDBStores){
					noLocalStorage.removeItem(stores.nonDBStores[s]);
				}
			}

			if(cleardb && (stores.dbStores.clearDB === true)){
				for(var d in stores.dbStores.stores){
					noLocalStorage.removeItem(stores.dbStores.stores[d]);
				}
			}
		};

		$rootScope.$on("event:auth-loginRequired", function(){
			$rootScope.$broadcast("noLoginService::loginRequired");
		});
	}

	angular.module('noinfopath.user')

		.config(['$httpProvider',function($httpProvider){
			$httpProviderRef  = $httpProvider;
		}])


		.factory('noLoginService',  [ '$q', '$http', '$base64', 'noLocalStorage', 'noUrl', 'noConfig', '$rootScope', function($q,$http,$base64,noLocalStorage,noUrl,noConfig, $rootScope){
			return new LoginService($q,$http,$base64,noLocalStorage,noUrl,noConfig, $rootScope);
		}])
	;
})(angular);

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

					var localStoresExists = noConfig.current.localStores ? noConfig.current.localStores : null,
						databaseLogoutTemplate = '<div class="modal-header"><h3 class="modal-title centertext">Log Out</h3></div><div class="modal-body centertext">Would You Like To Clear The Database As Well?</div><div class="modal-footer"><button class="btn btn-warning pull-left" type="button" ng-click="logout(true)">Yes</button><button class="btn btn-primary pull-left" type="button" ng-click="logout(false)">No</button><button class="btn btn-default" type="button" ng-click="close()">Cancel</button></div>',
						logoutTemplate = '<div class="modal-header"><h3 class="modal-title centertext">Log Out</h3></div><div class="modal-body centertext">Are you sure you would like to logout?</div><div class="modal-footer"><button class="btn btn-warning pull-left" type="button" ng-click="logout()">Yes</button><button class="btn btn-primary pull-left" type="button" ng-click="close()">No</button></div>';

					$scope.logoutModal = function () {
					    var modalInstance = $uibModal.open({
					      	animation: true,
							controller: 'userLogoutController',
						  	backdrop: 'static',
					      	template: localStoresExists ? databaseLogoutTemplate : logoutModal
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
