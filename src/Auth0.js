(function(angular, auth0, undefined){
	"use strict";

	function NoAuth0Service(noConfig){
		var noAuth0;

		this.init = function(){
			noAuth0 = new auth0.WebAuth({
				domain: noConfig.current.auth0.domain,
				clientID: noConfig.current.auth0.clientId
			});
		};

		this.login = function(username, password, callback) {
			noAuth0.client.login({
				realm: 'Username-Password-Authentication',
				username: username.$viewValue,
				password: password.$viewValue,
				audience: noConfig.current.auth0.audience,
				response_type: "token",
				scope: "openid profile"
			}, callback);
		};

		this.getUserInformation = function(bearer, callback) {
			noAuth0.client.userInfo(bearer, callback);
		};

		this.logout = function() {
			noAuth0.logout({
				returnTo: "",// URI
				client_id: ""// clientID
			});
    };
	}

	angular.module("noinfopath.user")
		.service("noAuth0Service", ["noConfig", NoAuth0Service])
	;
})(angular, auth0);
