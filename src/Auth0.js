(function (angular, auth0, undefined) {
	"use strict";

	function NoAuth0Service($q, noConfig, $http, noLocalStorage, noSessionStorage) {
		var noAuth0;

		this.init = function () {

			// noAuth0 = new auth0.WebAuth({
			// 	domain: noConfig.current.auth0.domain,
			// 	clientID: noConfig.current.auth0.clientId
			// });
		};

		function _roAuth(username, password) {
			var payload = {
					"client_id": noConfig.current.auth0.clientId,
					"username": username.$viewValue,
					"password": password.$viewValue,
					"connection": "Username-Password-Authentication",
					"scope": "openid profile user_metadata offline_access",
					"audience": noConfig.current.auth0.audience,
					"grant_type": "password",
					"device": "browser"
				},
				config = {
					headers: {
						"Content-Type": "application/json"
					},
					responseType: "json"
				};

			return $http.post(noConfig.current.auth0.ro, payload);


		}

		function _tokenAuth(username, password) {
			var payload = {
					"grant_type":"password",
					"client_id": noConfig.current.auth0.clientId,
					"username": username,
					"password": password,
					"audience": noConfig.current.auth0.audience,
					"scope":"openid profile user_metadata offline_access",
					"realm":"Username-Password-Authentication"
				},
				config = {
					headers: {
						"Content-Type": "application/json"
					},
					responseType: "json"
				};


			return $http.post(noConfig.current.auth0.token, payload, config)
				.catch(console.error);

		}

		this.login = function (username, password) {
			return 	_tokenAuth(username, password)
				.then(function(authInfo){
					return authInfo.data;
				})
				.then(_getUserInformation)
				//.then(_getRESTAPIAccessToken.bind(null, username.$viewValue, password.$viewValue))
				.catch(function(err){
					throw err;
				});
		};

		this.refresh = function (refresh_token) {
			var payload = {
				"grant_type": "refresh_token",
				"client_id": noConfig.current.auth0.clientId,
				"refresh_token": refresh_token
			},
			config = {
				headers: {
					"Content-Type": "application/json"
				},
				responseType: "json"
			};



			return $http.post(noConfig.current.auth0.token, payload, config);
		};

		this.resolveAuthorization = function(user) {
			return $q(function(resolve, reject){
				if(!user.tokenExpired){
					resolve(user.token_type + " " + user.access_token);
				} else if (user.refresh_token){
					this.refresh(user.refresh_token)
						.then(function(resp){
							user.access_token = resp.data.access_token;
							user.expires = moment().add(resp.data.expires_in, "s");

							if (!noConfig.current.noUser || noConfig.current.noUser.storeUser) {
								noLocalStorage.setItem("noUser", user);
							} else {
								noSessionStorage.setItem("noUser", user);
							}

							resolve(user.token_type + " " + user.access_token);
						})
						.catch(function(err){
							reject(err);
						});
				} else {
					reject(new Error("Authorization Expired"));
				}
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
		}

		this.logout = function () {
			noAuth0.logout({
				returnTo: "", // URI
				client_id: "" // clientID
			});
		};
	}

	angular.module("noinfopath.user")
		.service("noAuth0Service", ["$q", "noConfig", "$http", "noLocalStorage", "noSessionStorage", NoAuth0Service]);
})(angular);
