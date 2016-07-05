var $httpBackend, $timeout, noLocalStorage, noLoginService, noLoginServiceProvider, noUrl;


describe("Testing noinfopath-user module", function () {

	beforeEach(function () {
		module('noinfopath.user', 'noinfopath.data', 'noinfopath.helpers', 'http-auth-interceptor');

		// Here we create a fake module just to intercept and store the provider
		// when it's injected, i.e. during the config phase.
		angular.module('dummyModule', [])
			.config(['noLoginServiceProvider', function (_noLoginServiceProvider_) {
				noLoginServiceProvider = _noLoginServiceProvider_;
	  		}]);

		module('dummyModule');

		// This actually triggers the injection into dummyModule
		inject(function ($injector) {
			$httpBackend = $injector.get('$httpBackend');
			$timeout = $injector.get('$timeout');
			noLocalStorage = $injector.get('noLocalStorage');
			noLoginService = $injector.get('noLoginService');
			noUrl = $injector.get('noUrl');
			noConfig = $injector.get('noConfig');
		});
	});


	it("Module must implement a provider interface for configuration", function () {
		expect(noLoginServiceProvider);
	});


	it("Module must implement all expected services", function () {
		expect(noLoginService);
	});

	var req = noLoginServiceMocks.register.request;
	var resp = noLoginServiceMocks.register.response;

	describe("Testing noLoginService", function () {

		it("All noLoginService interfaces must exist.", function () {
			expect(noLoginService.login);
			expect(noLoginService.isAuthorized);
			expect(noLoginService.isAuthenticated);
			expect(noLoginService.user);
		});

		var e2eData = {
			clientCredentials: null
		};

		describe("Testing noLoginService.register...", function () {

			it("Should successfully register a user and return a status code of 200", function (done) {
				$httpBackend
					.when("GET", "/config.json")
					.respond(200, mockConfig);

				// $httpBackend
				// 		.when("GET", NoCacheManifest.request.url)
				// 		.respond(200,NoCacheManifest.response.body);

				$httpBackend
					.when('POST', req.url)
					.respond(200, resp);

				noConfig.whenReady()
					.then(noLoginService.register.bind(null, req.body))
					.then(function (resp) {
						expect(resp.status)
							.toBe(200);
					})
					.catch(function (err) {
						console.log("err", err);
					})
					.finally(done);

				$timeout.flush();
				$httpBackend.flush();
			});
		});
	});
});
