var $httpBackend, $timeout, $base64, noLocalStorage, noLoginService, noUrl;


describe("Testing noinfopath-user module", function(){

	beforeEach(function() {
		module("noinfopath.user");

		//'base64', 'noinfopath.data', 'noinfopath.helpers', 'http-auth-interceptor', 'ui.router');

		module(function($provide, noLoginServiceProvider){
			$provide.provider("noLoginService", noLoginServiceProvider);
		});

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

		describe("All noLoginService interfaces must exist.", function(){
			it("should expose a login method.", function(){
				expect(noLoginService.login);
			});

			it("should expose a isAuthorized method.", function(){
				expect(noLoginService.isAuthorized);
			});

			it("should expose a isAuthenticated method.", function(){
				expect(noLoginService.isAuthenticated);
			});

			it("should expose a user method.", function(){
				expect(noLoginService.user);
			});

		});

		var e2eData = {
			clientCredentials: null
		};

		var req = noLoginServiceMocks.login.request;
		var resp = noLoginServiceMocks.login.response;

		describe("Testing noLoginService.login...", function(){

			it("should return an access token.", function(done){

				$httpBackend
					.when("GET", "/config.json")
					.respond(200,mockConfig);

				// $httpBackend
				// 		.when("GET", NoCacheManifest.request.url)
				// 		.respond(200,NoCacheManifest.response.body);

				$httpBackend
					.when('POST',req.url)
					.respond(resp.body, resp.header);

				noLoginService.login(req.body)
					.then(function(token){
						var x = angular.toJson(token);

						expect(x).toBeTruthy(noLoginServiceMocks.login.noInfoPathUser);
					})
					.catch(function(err){
						console.log("err", err);
					})
					.finally(done);

				$timeout.flush();
				$httpBackend.flush();
			});

			xit("noLoginService.user should return the expected user.", function(){
				var nou = new noInfoPath.NoInfoPathUser(noLoginServiceMocks.login.noInfoPathUser);
				noLocalStorage.setItem('noUser', nou);
				var actual = angular.toJson(noLoginService.user);
				var expected = noLoginServiceMocks.login.noInfoPathUser;

				//console.log("actual", actual);
				//console.log("expected",  expected);
				//console.log(user, noLoginServiceMocks.login.noInfoPathUser);
				//console.log(user, noLoginServiceMocks.noInfoPathUser)

				expect(angular.equals(actual, expected)).toBeTruthy();
			});

			it("noLoginService.isAuthenticated should return true when noLocalStorage.noUser is truthy.", function(){
				var nou = new noInfoPath.NoInfoPathUser(noLoginServiceMocks.noInfoPathUser);
				noLocalStorage.setItem('noUser', nou);
				expect(noLoginService.isAuthenticated).toBe(true);
			});

			it("noLoginService.isAuthenticated should return false when noLocalStorage.noUser is falsy.", function(){
				noLoginService.logout(mockConfig.localStores);
				//console.log("noLoginService.isAuthenticated", noLoginService.user)
				expect(noLoginService.isAuthenticated).toBe(false);
			});

			it("noLoginService.isAuthorized should return true when noLocalStorage.noAuthToken is truthy.", function(){
				var	t = angular.fromJson(noLoginServiceMocks.login.noInfoPathUser);
				t.expires = new Date();
				t.expires = new Date(t.expires.setFullYear(t.expires.getFullYear() + 1));
				//console.log("Test", t);


				//t.expires.setYear(t.expires.getYear() + 1);
				//console.log("Test", t);
				noLocalStorage.setItem('noUser', t);

				expect(noLoginService.isAuthorized).toBe(true);
			});

			xit("noLoginService.isAuthorized should return false when noLocalStorage.noAuthToken is falsy.", function(){
				noLoginService.logout();

				var	t = angular.fromJson(noLoginServiceMocks.login.noInfoPathUser);
				t.expires = (new Date(2015,3,1)).toISOString();

				noLocalStorage.setItem('noUser', t);

				expect(noLoginService.isAuthorized).toBe(false);
			});
		});
	});

});
