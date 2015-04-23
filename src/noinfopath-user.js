/**
 * NoInfoPath User
 */

(function(angular, undefined){
	"use strict";

	var $httpProviderRef;

	console.log('line 9');
	angular.module('noinfopath.user',['base64','http-auth-interceptor','noinfopath.data','noinfopath.helpers'])
		.config(['$httpProvider', function($httpProvider){
			$httpProviderRef  = $httpProvider;
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
				templateUrl: "templates/login-directive.html",
				controller: noLoginController
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

		// .provider('noTokenService', [function(){
		// 	var endpointUri;

		// 	function _setEndPointUri(uri){
		// 		endpointUri = uri;
		// 	}
		// 	this.setEndPointUri = _setEndPointUri;

		// 	var tokenService = function($http,$base64,$localStorage, authService){
		// 		var SELF =this,
		// 			url = endpointUri + "/token";

		// 		this.authenticate = function(clientCreds, user){
		// 			//noOnlineStatus.update('Requesting Access Token');

		// 			var payload = {
		// 				"grant_type":"client_credentials",
		// 				"token_type":"bearer"
		// 			};


		// 			$http.post(url, payload, {
		// 				headers: {
		// 					"Authorization": "Basic " + clientCreds
		// 				},
		// 				withCredentials: true
		// 			})
		// 			.success(function(data, status, headers){
		// 				$localStorage.noAuthToken = data;
		// 				$localStorage.noUser = user;
		// 				$httpProviderRef.defaults.headers.common.Authorization = data.token_type + " " + data.access_token;						
		// 				authService.loginConfirmed(data);
		// 			})
		// 			.error(function(data, status){
		// 				log.write(status);
		// 			})
		// 		}
		// 	};

		// 	this.$get = [
		// 		'$http',
		// 		'$base64',
		// 		'$localStorage',
		// 		'authService',
		// 		function($http,$base64,$localStorage,authService){
		// 			return new tokenService($http,$base64,$localStorage,authService);
		// 		}
		// 	];
		// }])

		.provider('noLoginService',  [ function(){
			
			
			var loginService = function($q,$http,$base64,noLocalStorage,noUrl,noConfig,authService){
				var SELF =this;

				this.login = function login(loginInfo){
					var deferred = $q.defer();
						
					noConfig.whenReady()
						.then(function(){
							var params = {
								"grant_type": "password",
								"password": loginInfo.password,
								"username": loginInfo.username
							},
							url = noUrl.makeResourceUrl(noConfig.current.RESTURI, "token");
							;

							$http.post(url, null, {
								headers: {
									"Content-Type": "appication/x-www-form-urlencoded " 
								},
								data: params,
								withCredentials: true
							})
							.then(function(resp){	
								noLocalStorage.setItem("noUser", resp.data);

								$httpProviderRef.defaults.headers.common.Authorization = resp.data.token_type + " " + resp.data.access_token;						
						 		authService.loginConfirmed(resp.data);
								deferred.resolve(resp.data);
							})
							.catch(deferred.reject);
						});
									
					return deferred.promise;
				};

				// this.authenticate = function authenticate(token, user){
				// 	//noOnlineStatus.update('Requesting Access Token');

				// 	var deferred = $q.defer(),
				// 		payload = {
				// 			"grant_type":"client_credentials",
				// 			"token_type":"bearer"
				// 		};


				// 	$http.post(endpoints.token, payload, {
				// 		headers: {
				// 			"Authorization": "Bearer " + token
				// 		},
				// 		withCredentials: true
				// 	})
				// 	.then(function(resp){
				// 		noLocalStorage.noAuthToken = resp.data.access_token;
				// 		noLocalStorage.noUser = user;
				// 		$httpProviderRef.defaults.headers.common.Authorization = resp.data.token_type + " " + resp.data.access_token;						
				// 		authService.loginConfirmed(resp.data);
				// 		deferred.resolve(noLocalStorage.noAuthToken);
				// 	})
				// 	.catch(deferred.reject);

				// 	return deferred.promise;
				// };

				this.isAuthenticated = function(){ return !!(noLocalStorage.getItem("noUser")); };

				this.isAuthorized = function() { return !!(noLocalStorage.getItem("noUser")); };

				this.user = function() { return noLocalStorage.getItem("noUser"); };

				this.token = function() { return noLocalStorage.getItem("noUser"); };
			};
		
			this.$get = [
				'$q',
				'$http',
				'$base64', 
				'noLocalStorage',
				'noUrl',
				'noConfig',
				'authService',
				function($q,$http,$base64,noLocalStorage,noUrl,noConfig,authService){
					return new loginService($q,$http,$base64,noLocalStorage,noUrl,noConfig,authService);
				}
			];
		}])
	;
})(angular)


