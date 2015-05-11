/*
noinfopath-user.js 
@version 0.0.8
*/

//globals.js
(function(angular, undefined){
	"use strict";
	
	angular.module('noinfopath.user',[
		'base64',
		/*'http-auth-interceptor',*/
		'noinfopath.data',
		'noinfopath.helpers'
	]);

})(angular);
/*
noinfopath-user.js 
version 0.0.6
*/

//globals.js
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

	angular.module('noinfopath.user')
	
		.config(['$httpProvider',function($httpProvider){
			$httpProviderRef  = $httpProvider;
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
			
			var loginService = function($q,$http,$base64,noLocalStorage,noUrl,noConfig, $rootScope){
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
								var user = new noInfoPathUser(resp.data)

								noLocalStorage.setItem("noUser", user);

								$httpProviderRef.defaults.headers.common.Authorization = user.token_type + " " + user.access_token;						
						 		//authService.loginConfirmed(user);
								deferred.resolve(user);
							})
							.catch(deferred.reject);
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
								"ConfirmPassword": registerInfo.confirmPassowrd
							}),
							url = noUrl.makeResourceUrl(noConfig.current.AUTHURI, "api/account/register");

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

				this.updatepass = function updatepass(updatepassInfo){
					var deferred = $q.defer();

					noConfig.whenReady()
						.then(function(){
							var params = $.param({
								"OldPassword": updatepassInfo.OldPassword,
								"NewPassword": updatepassInfo.NewPassword,
								"ConfirmPassword": updatepassInfo.ConfirmPassword
							}),
							url = noUrl.makeResourceUrl(noConfig.current.AUTHURI, "api/account/changepassword");

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
				
				'$rootScope',
				function($q,$http,$base64,noLocalStorage,noUrl,noConfig, $rootScope){
					return new loginService($q,$http,$base64,noLocalStorage,noUrl,noConfig, $rootScope);
				}
			];
		}])
	;
})(angular);

