/**
 * NoInfoPath User
 * version 0.0.3
 */

(function(angular, undefined){
	"use strict";

	var $httpProviderRef;

	angular.module('noinfopath.user',['base64','http-auth-interceptor','noinfopath.data','noinfopath.helpers'])
		.config(['$httpProvider',function($httpProvider){
			$httpProviderRef  = $httpProvider;
		}])

		.run(['noLoginService', function(noLoginService){
			if(noLoginService.isAuthorized){
				var user = noLoginService.user;
				$httpProviderRef.defaults.headers.common.Authorization = user.token_type + " " + user.access_token;
			}
		}])

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

		.provider('noLoginService',  [function(){
			var _user;

			function noInfoPathUser(data){
				if(angular.isObject(data)){
					this.token_type = data.token_type;
					this.access_token = data.access_token;
					this.username = data.userName;
					this.expires = new Date(data[".expires"]);
				}else{
					var tmp = angular.fromJson(data);
					angular.extend(this, tmp);
					this.expires = new Date(this.expires);
				}

				Object.defineProperties(this, {
					"tokenExpired": {
						"get": function(){
							var n = new Date();
							return n >= this.expires;
						}
					}
				});
			}

			window.noInfoPath = window.noInfoPath || {};
			window.noInfoPath.noInfoPathUser = noInfoPathUser;
			
			var loginService = function($q,$http,$base64,noLocalStorage,noUrl,noConfig,authService, $rootScope){
				var SELF =this;

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
									_user = new noInfoPathUser(j);
								}
							}
							
							return _user;
						}
					}
				});

				this.login = function login(loginInfo){
					var deferred = $q.defer();
						
					noConfig.whenReady()
						.then(function(){
							var params = $.param({
								"grant_type": "password",
								"password": loginInfo.password,
								"username": loginInfo.username
							}),
							url = noUrl.makeResourceUrl(noConfig.current.AUTHURI, "token");
							
							$http.post(url, params, {
								headers: {
									"Content-Type": "appication/x-www-form-urlencoded" 
								},
								data: params,
								withCredentials: true
							})
							.then(function(resp){	
								var user = new noInfoPathUser(resp.data)

								noLocalStorage.setItem("noUser", user);

								$httpProviderRef.defaults.headers.common.Authorization = user.token_type + " " + user.access_token;						
						 		authService.loginConfirmed(user);
								deferred.resolve(user);
							})
							.catch(deferred.reject);
						});
									
					return deferred.promise;
				};

				this.logout = function logout(){
					noLocalStorage.removeItem("noUser");
					_user = undefined;
					$rootScope.$broadcast("noLoginService::loginRequired");
				}

				$rootScope.$on("event:auth-loginRequired", function(){
					$rootScope.$broadcast("noLoginService::loginRequired");
				});

			};
		
			this.$get = [
				'$q',
				'$http',
				'$base64', 
				'noLocalStorage',
				'noUrl',
				'noConfig',
				'authService',
				'$rootScope',
				function($q,$http,$base64,noLocalStorage,noUrl,noConfig,authService, $rootScope){
					return new loginService($q,$http,$base64,noLocalStorage,noUrl,noConfig,authService, $rootScope);
				}
			];
		}])
	;
})(angular)


