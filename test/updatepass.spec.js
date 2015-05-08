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

	var req = noLoginServiceMocks.updatepass.request
	var resp = noLoginServiceMocks.updatepass.response

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

		describe("Testing noLoginService.updatepass...", function(){

			it("Should successfully update a users password.", function(done){
				$httpBackend
						.when("GET", "/config.json")
						.respond(200,mockConfig);
				
				$httpBackend
						.when("GET", NoCacheManifest.request.url)
						.respond(200,NoCacheManifest.response.body);
				
				$httpBackend
					.when('POST',req.url)
					.respond(200, "");
				
				noLoginService.updatepass(req.body)
					.then(function(a,b,c,d,e){

					})
					.catch(function(err){
						console.log("err", err);
					})
					.finally(done);
				
				$timeout.flush();	
				$httpBackend.flush();
			});	
		});
	});
});