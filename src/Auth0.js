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
					"scope": "openid profile user_metadata offline_access",
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
