(function(angular, auth0, undefined){
	"use strict";

	function NoAuth0Service(noConfig){
		var noAuth0;

		this.init = function(){
			noAuth0 = new auth0.Authentication({
				domain: noConfig.current.auth0.domain,
				clientID: noConfig.current.auth0.clientId
			});
		};

		this.login = function(username, password, callback) {
			noAuth0.login({
				realm: 'Username-Password-Authentication',
				username: username.$viewValue,
				password: password.$viewValue,
				audience: noConfig.current.auth0.audience,
				response_type: "token",
				scope: "read:order write:order"
			}, callback);
		};

		this.logout = function() {
      localStorage.removeItem('id_token');
      localStorage.removeItem('profile');
      //authManager.unauthenticate();
    };
	}

	angular.module("noinfopath.user")
		.service("noAuth0Service", ["noConfig", NoAuth0Service])
	;
})(angular, auth0);
