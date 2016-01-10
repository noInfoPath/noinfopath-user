
//globals.js

/**
 * # noinfopath-user.js
 * @version 1.0.2
 *
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
