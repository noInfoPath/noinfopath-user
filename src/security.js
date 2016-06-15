//security.js
(function (angular, undefined) {
	"use strict";

	angular.module("noinfopath.user")

	.directive("noSecurity", ["noLoginService", "$state", "noFormConfig", "noConfig", "noSecurity", function (noLoginService, $state, noFormConfig, noConfig, noSecurity) {
		function _link(scope, el, attrs) {
			var perm, scopeVal;

			perm = noSecurity.getPermissions(attrs.noSecurity);

			if(attrs.grant === "W") {
				if(perm && perm.canWrite) {
					el.removeClass("ng-hide");
				} else {
					el.addClass("ng-hide");
				}
			} else {
				if(perm && perm.canRead) {
					el.removeClass("ng-hide");
				} else {
					el.addClass("ng-hide");
				}
			}

		}

		function _compile(el, attrs) {
			if(attrs.ngShow) {
				el.attr("ng-show", null);
			}

			return _link;
		}

		return {
			restrict: "A",
			compile: _compile
		};
		}])

	.directive("noSecurityMenu", ["noLoginService", "$state", "noFormConfig", "noConfig", function (noLoginService, $state, noFormConfig, noConfig) {
		function _compile(el, attrs) {

			var buttons = el.find("button");

			for(var i = 0; i < buttons.length; i++) {
				var buttonH = buttons[i],
					buttonA = angular.element(buttonH),
					matches = buttonH.outerHTML.match(/{[^}]*\}/g),
					match = matches ? matches[0].replace(/&quot;/g, "\"") : undefined,
					entityConfig = angular.fromJson(match ? match : {
						entity: buttonA.attr("ui-sref")
					}),
					sid = noConfig.current.securityObjects[entityConfig.entity];

				buttonA.attr("no-security", sid);
			}

			return angular.noop;
		}

		return {
			restrict: "A",
			compile: _compile
		};
		}])

	.service("noSecurity", ["noLoginService", "$state", "noFormConfig", "noConfig", function (noLoginService, $state, noFormConfig, noConfig) {
		this.getPermissions = function (securityObject) {
			var objectId;

			if(securityObject === "entity") {
				if($state.params.entity) {
					objectId = noConfig.current.securityObjects[$state.params.entity];
				} else {
					objectId = noConfig.current.securityObjects[$state.current.name];
				}
			} else {
				objectId = securityObject;
			}
			var perm = noLoginService.user.getPermissions(objectId);

			return perm; //returns undefined or an object
		};
		}]);
})(angular);
