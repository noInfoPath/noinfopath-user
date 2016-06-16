//offline.js
(function (angular, undefined) {
	"use strict";

	window.noInfoPath = window.noInfoPath || {};

	function noOfflineStatus() {
		this.webSiteAvailable = false;
		this.webApiAvalable = false;
	}

	angular.module('noinfopath.user')
		.provider("noOfflineService", [function () {
			function noOfflineService($q, $timeout, $http, noConfig, noManifest, noIndexedDB) {
				this.whenReady = function () {
					var deferred = $q.defer();

					noConfig.whenReady()
						.then(noManifest.whenReady)
						.then(noIndexedDB.whenReady)
						.then(function (data) {
							console.info("noOfflineStatus", data)
							deferred.resolve(data);
						})
						.catch(function (err) {
							console.log(err);
							deferred.reject(err);
						})


					return deferred.promise;
				};
			}

			this.$get = ['$q', '$timeout', '$http', 'noConfig', 'noManifest', 'noIndexedDB', function ($q, $timeout, $http, noConfig, noManifest, noIndexedDB) {
				return new noOfflineService($q, $timeout, $http, noConfig, noManifest, noIndexedDB);
			}];
		}])

	;

})(angular);
