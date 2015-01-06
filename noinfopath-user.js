/**
 * NoInfoPath User
 */

(function(angular, undefined){
	"use strict";


	angular.module('noinfopath.user',['base64','http-auth-interceptor'])
		
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

		.provider('noTokenService', [function(){
			var endpointUri;

			function _setEndPointUri(uri){
				endpointUri = uri;
			}
			this.setEndPointUri = _setEndPointUri;

			var tokenService = function($http,$base64,authService){
				var SELF =this,
					url = endpointUri + "/token";

				this.authenticate = function(clientCreds){
					$http.post(url, {'':''}, {
						headers: {
							"Authorization": "NoInfoPath " + clientCreds
						},
						withCredentials: true
					})
					.success(function(data, status, headers){
						authService.loginConfirmed(data);
					})
					.error(function(data, status){
						log.write(status);
					})
				}
			};
		}])

		.provider('noLoginService',  [ function(){
			var endpointUri;

			function _setEndPointUri(uri){
				endpointUri = uri;
			}
			this.setEndPointUri = _setEndPointUri;

			var loginService = function($http,$base64,authService){
				var SELF =this,
					url = endpointUri + "/auth";

				this.login = function(loginInfo){
					var creds = $base64.encode(loginInfo.username + ":" + loginInfo.password);
					$http.post(url, null, {
						headers: {
							"Authorization": "NoInfoPath " + creds
						},
						withCredentials: true
					})
					.success(function(data, status, headers){
						authService.loginConfirmed(data);
					})
					.error(function(data, status){
						log.write(status);
					})
				}
			};
		
			this.$get = [
				'$http',
				'$base64', 
				'authService',
				function($http,$base64,authService){
					return new loginService($http,$base64,authService);
				}
			];;
		}])

	;
})(angular)


