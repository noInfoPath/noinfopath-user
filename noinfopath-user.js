/**
 * NoInfoPath User
 */

(function(angular, undefined){
	"use strict";

	var $httpProviderRef;

	angular.module('noinfopath.user',['base64','http-auth-interceptor'])
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
				templateUrl: "tmpl/login-directive.html",
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
			var endpoints = {
				auth: "",
				token: ""
			};

			this.setAuthEndPoint = function setAuthEndPoint(uri){
				endpoints.auth = uri;
			};

			this.getAuthEndPoint = function getAuthEndPoint(){
				return endpoints.auth;
			}

			this.setTokenEndPoint = function setTokenEndPoint(uri){
				endpoints.token = uri;
			};

			this.getTokenEndPoint = function getTokenEndPoint(){
				return endpoints.token;
			}

			var loginService = function($q,$http,$base64,$localStorage,authService){
				var SELF =this;

				this.login = function login(loginInfo){
					var deferred = $q.defer();

					//noOnlineStatus.update('Authenticating');

					var creds = $base64.encode(loginInfo.username + ":" + loginInfo.password);
					
					$http.post(endpoints.auth, null, {
							headers: {
								"Authorization": "NoInfoPath " + creds
							},
							withCredentials: true
						})
						.then(function(resp){	
							var token = resp.headers('x-no-authorization'),
								user = resp.data;

							deferred.resolve({token: token, user: user});
						})
						.catch(deferred.reject);
					return deferred.promise;
				};

				this.authenticate = function authenticate(token, user){
					//noOnlineStatus.update('Requesting Access Token');

					var deferred = $q.defer(),
						payload = {
							"grant_type":"client_credentials",
							"token_type":"bearer"
						};


					$http.post(endpoints.token, payload, {
						headers: {
							"Authorization": "Basic " + token
						},
						withCredentials: true
					})
					.then(function(resp){
						$localStorage.noAuthToken = resp.data.access_token;
						$localStorage.noUser = user;
						$httpProviderRef.defaults.headers.common.Authorization = resp.data.token_type + " " + resp.data.access_token;						
						authService.loginConfirmed(resp.data);
						deferred.resolve($localStorage.noAuthToken);
					})
					.catch(deferred.reject);

					return deferred.promise;
				};

				this.isAuthenticated = function(){ return !!($localStorage.noUser); };

				this.isAuthorized = function() { return !!($localStorage.noAuthToken); };

				this.user = function() { return $localStorage.noUser; };

				this.token = function() { return $localStorage.noAuthToken; };
			};
		
			this.$get = [
				'$q',
				'$http',
				'$base64', 
				'$localStorage',
				'authService',
				function($q,$http,$base64,$localStorage,authService){
					return new loginService($q,$http,$base64,$localStorage, authService);
				}
			];
		}])
	;
})(angular)


