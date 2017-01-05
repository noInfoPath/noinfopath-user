//globals.js
/**
 * # noinfopath-user.js
 * @version 1.2.3
 *
 *
 * The noinfopath.user module contains services, and directives that assist in
 * developing an application that requires as secure and customized user
 * experience.
 *
 */
(function (angular, undefined) {
	"use strict";

	angular.module('noinfopath.user', [
		/*'http-auth-interceptor',*/
		'noinfopath.data',
		'noinfopath.helpers'
	]);

})(angular);
