var $httpBackend, $timeout, $base64, noLocalStorage, noLoginService, noLoginServiceProvider, noUrl
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
		authUser: "gochinj",
		tokenResponseHeaders: {},
		tokenResponseBody: {
					
		    "access_token": "ZeRoXFgt2zNjdo4swgdiR3eTt3eVysJ0uBk7M1tSZnBPiF_4GOSV2QVeVsLmPecriUK29iMwIFx8f00NrwlTHxNVoi54cXOurNT40Cd7SNrp6qhyacIQEDLufajEev6_hoTyfxZdpbXwmAx62YZ7mZnHSHYWMkWFKhK_ha8t4skaCbaRkraU8nhFHWq0pH8_pIxFmPbcne_1vUh-t0FdxQT4F9rlyKZ_O2EKyXCiBLAUqHOFuuIXsfzjQk5Px9uXS4S-4bLr-YrjGM5HzmN9uJMbkQDIQJFF6UP8gSbHrmwTqZUC0q0gIi3UCkvDCdd5W1cYLiT9HGK8a_WTQnkJFZQOd_RKqyTSom5Soxqrv1T5utZEfFl9B3jCS-nJlbmmv_mHE5b0PLESI5G2SrzXwLX03MyhcocoQelCF5SxQHsOmRZi2Bv1qkTuv2l6h9ia6FRnz5TFOoQMe1TcwFIma1oaLPqVaGxXDwX6skMMuGc",
		    "token_type": "bearer",
		    "expires_in": 1209599,
		    "userName": "gochinj",
		    ".issued": "Thu, 23 Apr 2015 18:07:43 GMT",
		    ".expires": "Thu, 07 May 2015 18:07:43 GMT"

		},
		tokenResponse: "ZeRoXFgt2zNjdo4swgdiR3eTt3eVysJ0uBk7M1tSZnBPiF_4GOSV2QVeVsLmPecriUK29iMwIFx8f00NrwlTHxNVoi54cXOurNT40Cd7SNrp6qhyacIQEDLufajEev6_hoTyfxZdpbXwmAx62YZ7mZnHSHYWMkWFKhK_ha8t4skaCbaRkraU8nhFHWq0pH8_pIxFmPbcne_1vUh-t0FdxQT4F9rlyKZ_O2EKyXCiBLAUqHOFuuIXsfzjQk5Px9uXS4S-4bLr-YrjGM5HzmN9uJMbkQDIQJFF6UP8gSbHrmwTqZUC0q0gIi3UCkvDCdd5W1cYLiT9HGK8a_WTQnkJFZQOd_RKqyTSom5Soxqrv1T5utZEfFl9B3jCS-nJlbmmv_mHE5b0PLESI5G2SrzXwLX03MyhcocoQelCF5SxQHsOmRZi2Bv1qkTuv2l6h9ia6FRnz5TFOoQMe1TcwFIma1oaLPqVaGxXDwX6skMMuGc",
		loginInfo: {
			username: "gochinj",
			password: "fubar"
		}
	};

describe("Testing noinfopath-user module", function(){
	beforeEach(module('noinfopath.user'));
	beforeEach(module('base64'));
	beforeEach(module('noinfopath.data'));
	beforeEach(module('noinfopath.helpers'));
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
		noLocalStorage = $injector.get('noLocalStorage');
		noLoginService = $injector.get('noLoginService');
		noUrl = $injector.get('noUrl');
	}));

	it("Module must implement a provider interface for configuration", function(){
		expect(noLoginServiceProvider);
	});

	
	it("Module must implement all expected services", function(){
		expect(noLoginService);
	});

	describe("Testing noLoginService", function(){

		it("All noLoginService interfaces must exist.", function(){
			expect(noLoginService.login);
			expect(noLoginService.isAuthorized);
			expect(noLoginService.isAuthenticated);
			expect(noLoginService.user);
			expect(noLoginService.token);
		});

		var e2eData = {
			clientCredentials: null
		};


		function performLogin(done){


		$httpBackend
				.when("GET", "/config.json")
				.respond(200,mockConfig);
		
		$httpBackend
				.when("GET", NoCacheManifest.request.url)
				.respond(200,NoCacheManifest.response.body);
			
			$httpBackend.when('POST',expected.tokenEndPoint).respond(expected.tokenResponseBody, expected.tokenResponseHeaders);
			noLoginService.login(expected.loginInfo)
				.then(function(token){
					
					expect(angular.equals(token, expected.tokenResponseBody)).toBeTruthy();
				})
				.catch(function(err){
					console.log("err", err);
				})
				.finally(done);
			
			$timeout.flush();	
			$httpBackend.flush();
						
		}


		describe("Testing noLoginService.login...", function(){

			it("should return an access token.", function(done){
				performLogin(done);
			});
		});

		it("noLoginService.user should return the expected user.", function(){
			noLocalStorage.setItem('noUser', expected.authUser);
			var user = noLoginService.user();
			expect(angular.equals(user, expected.authUser)).toBeTruthy();
		});

		it("noLoginService.token should return the expected token.", function(){
			noLocalStorage.setItem('noUser',expected.tokenResponse);
			var token = noLoginService.token();
			expect(angular.equals(token, expected.tokenResponse)).toBeTruthy();
		});

		it("noLoginService.isAuthenticated should return true when noLocalStorage.noUser is truthy.", function(){
			noLocalStorage.setItem('noUser', expected.tokenResponse);
			expect(noLoginService.isAuthenticated()).toBe(true);
		})

		it("noLoginService.isAuthenticated should return false when noLocalStorage.noUser is falsy.", function(){
			noLocalStorage.setItem('noUser', ''); 
			expect(noLoginService.isAuthenticated()).toBe(false);
		})

		it("noLoginService.isAuthorized should return true when noLocalStorage.noAuthToken is truthy.", function(){
			noLocalStorage.setItem('noUser',expected.tokenResponse);
			expect(noLoginService.isAuthorized()).toBe(true);
		})

		it("noLoginService.isAuthorized should return false when noLocalStorage.noAuthToken is falsy.", function(){
			noLocalStorage.setItem('noUser', ''); 
			expect(noLoginService.isAuthorized()).toBe(false);
		})
	});

});