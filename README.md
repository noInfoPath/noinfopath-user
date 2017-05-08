# noinfopath-user.js
@version 2.0.9


The noinfopath.user module contains services, and directives that assist in
developing an application that requires as secure and customized user
experience.


## noLoginService : provider

Returns an instance of the `LoginService` class will all dependencies
injected.

## NoInfoPathUser : Class

This class provides an in memory representation of a NoInfoPath User.
It is instanciated by the `noLoginService`, when an online user logs in
or from the cached `LocalStorage` version when working offline.

### Constructors

#### NoInfoPathUser(data)

Contstructs new new NoInfoPathUser object from a JSON structure received
from a call to the `noLoginService::login` method or retreived from
local storage.

##### Usage
```js
var user = new NoInfoPathUser(data);
```

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|data|Object|A JSON data structure recevied after a successful login or from local storage|

### Methods
None.

### Properties
|Name|Type|Description|
|----|----|-----------|
|tokenExpired|Bool|Returns true if the users bearer token has expired.|


## LoginService : Class
LoginService is a backing class for the noLoginService provider. It provides the
functionality for login, logout, and user registration.  The LoginService
requires an active network connection to the NoInfoPath REST Service.

### Constructors

#### LoginService($q,$http,noLocalStorage,noUrl,noConfig, $rootScope)
This constructor is call via the Angular $injector service, as such, all
of the parameters must injectable services.

##### Usage
```js
var ls = LoginService($q, $http, noLocalStorage, noUrl, noConfig, $rootScope);
```

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|$q|Service|AngularJS promise service|
|$http|Service|AngularJS HTTP service|
|noLocalStorage|Service|NoInfoPath LocalStorage service|
|noUrl|Service|NoInfoPath Url formatting service|
|noConfig|Service|NoInfoPath Configuration service|
|$rootScope|Service|AngularJS root scope service.|

### Configuration

LoginService can be configured with an optional configuration hive in noConfig called noUser.

|Name|Type|Description|
|----|----|-----------|
|noUser|Object|Optional object within noConfig that holds the configuration for the noinfopath-user module|
|noUser.storeUser|Boolean|Determines to persist user login information between browser sessions or not. Defaults to true|
|noUser.noLogoutTimer|Int|noLogoutTimer directive configuration value. The amount of time in milliseconds of inactivity that elapses before the noLogoutTimer modal dialoge appears.|

### Methods

#### login(userInfo)
Calls the NoInfoPath Login service offered by the NoInfoPath REST API.
Upon a successful login a new NoInfoPathUser object is created, and
is cached in local storage.

##### Usage
```js
	noLoginService.login({username: "foo", password: "bar"})
		.then(angular.noop);
```
##### Parameters

|Name|Type|Description|
|----|----|-----------|
|userInfo|Object|Contains the username and password to try to authenticate.|

##### Returns
AngularJS $q Promise. When the promise resolves a NoInfoPathUser object
will be returned.

#### register(registerInfo)
Calls the NoInfoPath Account Registration service offered by the
NoInfoPath REST API.

##### Usage
```js
	noLoginService.register({username: "foo", password: "bar", confirmPassword: "bar"})
		.then(angular.noop);
```

##### Parameters

|Name|Type|Description|
|----|----|-----------|
|registerInfo|Object|Contains the username, password and confirmPassword data required for registering a new user.|

##### Returns
AngularJS $q Promise. When the promise resolves a NoInfoPathUser object
will be returned.

#### changePassword(updatePasswordInfo)
Calls the NoInfoPath Account Change Password service offered by the
NoInfoPath REST API.

##### Usage
```js
	noLoginService.changePassword({userId: "d11154b7-d48f-42e7-94c7-cf47e45e0d81", oldPassword: "hello", password: "bar", confirmPassword: "bar"})
		.then(angular.noop);
```
##### Parameters

|Name|Type|Description|
|----|----|-----------|
|updatePasswordInfo|Object|Contains the userId, the old password, the new password, and a confirmation of the new password. |

##### Returns
AngularJS $q Promise.

#### logout()
Logs out the current user, and deletes all data stored in local storage.

##### Usage
```js
	noLoginService.logout();
```
##### Parameters
None.

##### Returns
Undefined

### Properties
|Name|Type|Description|
|----|----|-----------|
|isAuthenticated|Bool|Returns true if the there is a valid user stored in local storage|
|isAuthorized|Bool|Turns true if the isAuthenticated and the bearer token is valid.|
|user|NoInfoPathUser|A reference to the currently logged in user.|

#### updateUser(userInfo)
Logs out the current user, and deletes all data stored in local storage.

##### Usage
```js
	noLoginService.updateUser(userInfo);
```
##### Parameters

|Name|Type|Description|
|----|----|-----------|
|userInfo|Object|An objet that contains the user to be updated, along with the properties to be updated. UserID, Email, and Username are required. FirstName and LastName are optional. |

##### Returns
AngularJS $q Promise Object. The promise returns the response from the WEBAPI.


## noLogin : directive

Sets the credential object and a login function that calls the noLoginService login function onto the scope.

## noUserMenu : directive

Sets a logout function on the scope that opens a modal to let the user log out. If there are localStores within the configuration, it also gives the option to clear local storage.

## noUserGroups : directive

Dynamically creates a set of checkboxes based on the number of user groups from the configured NOREST database.



noLogoutTimer is a directive that dynamically creates a modal popup that will show after a configured time informing the user that their inactivity
will cause them to log out, and after 60 more seconds, log out the user.

noLogoutTimer gets the configuration from noConfig, which is detailed below.

|Name|Type|Description|
|----|----|-----------|
|noUser.noLogoutTimer|int|The amount of time in milliseconds of inactivity that elapses before the noLogoutTimer modal dialoge appears.|


