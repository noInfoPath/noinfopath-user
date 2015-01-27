var $httpBackend, $timeout, $base64, authService, $localStorage, noLoginService, noLoginServiceProvider,
	expected = {
		authEndPoint: "http://localhost:3003/auth",
		tokenEndPoint: "http://localhost:3002/token",
		authResponseHeaders: {
			"Connection": "keep-alive",
			"Content-Length": 138,
			"Content-Type": "application/json",
			"Date": "Tue, 27 Jan 2015 03:18:44 GMT",
			"x-no-authorization": "Tm9JbmZvUGF0aDo5czNBc2h0M09ETGswZmR4NVUwOTl6RWM5Y2dHbkVTcSA1NGI5YjljY2QyYThlM2U4MGU2MjZjZWQgMTQyMjMyODcyNDg5MQ=="				
		},
		authResponseBody: {
			"_id":"54b9b9ccd2a8e3e80e626ced",
			"username":"gochinj",
			"config":"54bd4718795c4fac01de2a03",
			"db":{
				"id":"54b9a2dcd2a8e3e80e626ce9",
				"ver":1
			}
		},
		tokenResponseHeaders: {},
		tokenResponseBody: {
			"access_token":"YiSiobZREIOL0JEpgkF1dBybrE+4OrptTHGyUV3aOOk=",
			"token_type":"Bearer"
		},
		loginInfo: {
			username: "gochinj",
			password: "fubar"
		}
	};

describe("Testing noinfopath-user module", function(){
	beforeEach(module('noinfopath.user'));
	beforeEach(module('base64'));
	beforeEach(module('ngStorage'));
	beforeEach(module('http-auth-interceptor'));
	beforeEach(function() {
		// Here we create a fake module just to intercept and store the provider
		// when it's injected, i.e. during the config phase.
		angular.module('dummyModule', [])
	  		.config(['noLoginServiceProvider', function(_noLoginServiceProvider_) {
	    		noLoginServiceProvider = _noLoginServiceProvider_;
	  		}]);

		module('dummyModule');

		// This actually triggers the injection into dummyModule
		inject(function(){});
	});	

	beforeEach(inject(function($injector){
		$httpBackend = $injector.get('$httpBackend');
		$timeout = $injector.get('$timeout');
		$base64 = $injector.get('$base64');
		authService = $injector.get('authService');
		$localStorage = $injector.get('$localStorage');
		noLoginService = $injector.get('noLoginService');
	}));

	it("Module must implement a provider interface for configuration", function(){
		expect(noLoginServiceProvider);
	});

	describe("Testing noLoginServiceProvider...", function(){
		it("should implemented all expected methods", function(){
			expect(noLoginServiceProvider.setAuthEndPoint);
			expect(noLoginServiceProvider.getAuthEndPoint);
			expect(noLoginServiceProvider.setTokenEndPoint);
			expect(noLoginServiceProvider.getTokenEndPoint);
		});

		it("should be able to set and get the auth endPointUri", function(){
			noLoginServiceProvider.setAuthEndPoint(expected.authEndPoint);
			var ep = noLoginServiceProvider.getAuthEndPoint();
			expect(ep).toBe(expected.authEndPoint);
		});

		it("should be able to set and get the token endPointUri", function(){
			noLoginServiceProvider.setTokenEndPoint(expected.tokenEndPoint);
			var ep = noLoginServiceProvider.getTokenEndPoint();
			expect(ep).toBe(expected.tokenEndPoint);
		});
	});

	it("Module must implement all expected services", function(){
		expect(noLoginService);
	});

	describe("Testing noLoginService", function(){

		it("All noLoginService interfaces must exist.", function(){
			expect(noLoginService.login);
			expect(noLoginService.authenticate);
			expect(noLoginService.isAuthenticated);
			expect(noLoginService.user);
		});

		var e2eData = {
			clientCredentials: null
		};

		function performLogin(done){
			noLoginServiceProvider.setAuthEndPoint(expected.authEndPoint);
			$httpBackend.when('POST',expected.authEndPoint).respond(expected.authResponseBody, expected.authResponseHeaders);
			noLoginService.login(expected.loginInfo)
				.then(function(credentials){
					
					clientCredentials = credentials;

					expect(credentials.token).toBe(expected.authResponseHeaders['x-no-authorization']);

					expect(angular.equals(credentials.user, expected.authResponseBody)).toBeTruthy();
				})
				.catch(function(err){
					console.log("err", err);
				})
				.finally(done);

			$httpBackend.flush();				
		}

		function requestToken(done){
			noLoginServiceProvider.setTokenEndPoint(expected.tokenEndPoint);
			$httpBackend.when('POST',expected.tokenEndPoint).respond(expected.tokenResponseBody, expected.authResponseHeaders);
			noLoginService.authenticate(e2eData.clientCredentials)
				.then(function(accessToken){
					expect(accessToken).toBe(expected.tokenResponseBody.access_token);
				})
				.finally(done);

			$httpBackend.flush();
		}

		describe("Testing noLoginService.login...", function(){

			it("should return an temporary client credentials.", function(done){
				performLogin(done);
			});


			it("should return an access token, when provided client credentials", function(done){
				requestToken(done);
			});
		});

		it("noLoginService.user should return the expected user.", function(){
			$localStorage.noUser = expected.authResponseBody;
			var user = noLoginService.user();
			console.log
			expect(angular.equals(user, expected.authResponseBody)).toBeTruthy();
		});

		it("noLoginService.token should return the expected token.", function(){
			$localStorage.noAuthToken = expected.tokenResponseBody;
			var token = noLoginService.token();
			expect(angular.equals(token, expected.tokenResponseBody)).toBeTruthy();
		});

		it("noLoginService.isAuthenticated should return true when $localStorage.noUser is truthy.", function(){
			$localStorage.noUser = expected.authResponseBody;
			expect(noLoginService.isAuthenticated()).toBe(true);
		})

		it("noLoginService.isAuthenticated should return false when $localStorage.noUser is falsy.", function(){
			$localStorage.noUser = undefined;
			expect(noLoginService.isAuthenticated()).toBe(false);
		})

		it("noLoginService.isAuthorized should return true when $localStorage.noAuthToken is truthy.", function(){
			$localStorage.noAuthToken = expected.authResponseBody;
			expect(noLoginService.isAuthorized()).toBe(true);
		})

		it("noLoginService.isAuthorized should return false when $localStorage.noAuthToken is falsy.", function(){
			$localStorage.noAuthToken = undefined;
			expect(noLoginService.isAuthorized()).toBe(false);
		})
	});

});