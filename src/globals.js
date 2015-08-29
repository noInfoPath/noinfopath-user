
//globals.js

/**
 * # noinfopath-user.js
 * @version 0.0.11
 *
 * The noinfopath.user module contains services, and directives that assist in
 * developing an application that requires as secure and customized user
 * experience.
 *
 */

(function(angular, undefined){
	"use strict";

	angular.module('noinfopath.user',[
		'base64',
		/*'http-auth-interceptor',*/
		'noinfopath.data',
		'noinfopath.helpers'
	]);

})(angular);
