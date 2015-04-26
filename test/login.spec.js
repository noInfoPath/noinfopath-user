var $httpBackend, $timeout, $base64, noLocalStorage, noLoginService, noLoginServiceProvider, noUrl


describe("Testing noinfopath-user module", function(){

	beforeEach(function() {
		module('noinfopath.user', 'base64', 'noinfopath.data', 'noinfopath.helpers', 'http-auth-interceptor', 'ui.router');

		// Here we create a fake module just to intercept and store the provider
		// when it's injected, i.e. during the config phase.
		angular.module('dummyModule', [])
	  		.config(['noLoginServiceProvider', function(_noLoginServiceProvider_) {
	    		noLoginServiceProvider = _noLoginServiceProvider_;
	  		}]);

		module('dummyModule');

		// This actually triggers the injection into dummyModule
		inject(function($injector){
			$httpBackend = $injector.get('$httpBackend');
			$timeout = $injector.get('$timeout');
			$base64 = $injector.get('$base64');
			noLocalStorage = $injector.get('noLocalStorage');
			noLoginService = $injector.get('noLoginService');
			noUrl = $injector.get('noUrl');
		});
	});	


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
			//expect(noLoginService.token);
		});

		var e2eData = {
			clientCredentials: null
		};



		describe("Testing noLoginService.login...", function(){

			it("should return an access token.", function(done){
				$httpBackend
						.when("GET", "/config.json")
						.respond(200,mockConfig);
				
				$httpBackend
						.when("GET", NoCacheManifest.request.url)
						.respond(200,NoCacheManifest.response.body);
				
				$httpBackend
					.when('POST',expected.tokenEndPoint)
					.respond(expected.tokenResponseBody, expected.tokenResponseHeaders);
				
				noLoginService.login(expected.loginInfo)
					.then(function(token){
						var x = angular.toJson(token);
						//console.log(x === noLoginServiceMocks.noInfoPathUser)
						expect(x).toBeTruthy(noLoginServiceMocks.noInfoPathUser);
					})
					.catch(function(err){
						console.log("err", err);
					})
					.finally(done);
				
				$timeout.flush();	
				$httpBackend.flush();
			});


			it("noLoginService.user should return the expected user.", function(){
				var nou = new noInfoPath.noInfoPathUser(noLoginServiceMocks.noInfoPathUser);
				noLocalStorage.setItem('noUser', nou);
				var user = angular.toJson(noLoginService.user);
				//console.log(user, noLoginServiceMocks.noInfoPathUser)
				expect(angular.equals(user, noLoginServiceMocks.noInfoPathUser)).toBeTruthy();
			});

			it("noLoginService.isAuthenticated should return true when noLocalStorage.noUser is truthy.", function(){
				var nou = new noInfoPath.noInfoPathUser(noLoginServiceMocks.noInfoPathUser);
				noLocalStorage.setItem('noUser', nou);
				expect(noLoginService.isAuthenticated).toBe(true);
			})

			it("noLoginService.isAuthenticated should return false when noLocalStorage.noUser is falsy.", function(){
				noLoginService.logout(); 
				//console.log("noLoginService.isAuthenticated", noLoginService.user)
				expect(noLoginService.isAuthenticated).toBe(false);
			})

			it("noLoginService.isAuthorized should return true when noLocalStorage.noAuthToken is truthy.", function(){
				var	t = angular.fromJson(noLoginServiceMocks.noInfoPathUser);
				//t.expires = (new Date(2015,3,1)).toISOString();

				noLocalStorage.setItem('noUser', t);

				expect(noLoginService.isAuthorized).toBe(true);
			})

			it("noLoginService.isAuthorized should return false when noLocalStorage.noAuthToken is falsy.", function(){
				noLoginService.logout(); 

				var	t = angular.fromJson(noLoginServiceMocks.noInfoPathUser);
				t.expires = (new Date(2015,3,1)).toISOString();

				noLocalStorage.setItem('noUser', t);

				expect(noLoginService.isAuthorized).toBe(false);
			})		
		});
	});

});