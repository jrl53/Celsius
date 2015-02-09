// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('avocado', ['ionic', 'firebase']);

app.constant('fbURL', "https://celsius-avocado.firebaseio.com");


app.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('login', {
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'loginCtrl'
        })
	
		.state('survey', {
            url: '/survey',
            templateUrl: 'templates/survey.html',
            controller: 'mainController'
        })
	
		.state('logout', {
            url: '/logout',
            templateUrl: 'templates/logout.html',
            controller: 'logoutController'
        }) 


    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');


}]);


app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})