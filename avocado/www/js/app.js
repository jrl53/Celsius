// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('avocado', ['ionic']);

app.factory('surveyService', function () {
  var s = {};
  
  s.data = {};
  
  s.data.counter = 0;
  s.data.answers = [];
  s.data.questions = {
    y1 : "Cual es su satisfaccion general en Denny's?",
    x1 : "Que le parecio la limpieza?",
    x2 : "Que le parecio el servicio?",
    x3 : "Que le parecio la comida?"
  }

  s.data.pairs = [
    {q1: "y1", q2: "x1"},
    {q1: "y1", q2: "x2"},
    {q1: "y1", q2: "x3"}
  ];

  
  s.answerQ1 = function(score) {
    s.data.answers[s.data.counter] = {
      q1key : s.data.pairs[s.data.counter].q1,
      q1score : score,
      q1time : new Date().toLocaleString() 
    };

  };

  s.answerQ2 = function(score) {
    s.data.answers[s.data.counter] = {
      q2key : s.data.pairs[s.data.counter].q1,
      q2score : score,
      q2time : new Date().toLocaleString() 
    };

    updateCounter();

    sendData(s.data.answers[s.data.counter]);

  };

  var updateCounter = function(){
    s.data.counter = (s.data.counter + 1) % s.data.pairs.length;
    console.log("counter is " + s.data.counter);
  };
  
  var sendData = function(){
    //to firebase
    console.log("sending!");
  };
   

  return s;
});

app.controller('mainController', function($scope,$ionicSlideBoxDelegate, $timeout, surveyService) {
  // Main app controller, empty for the example
  $scope.data = surveyService.data;

  $scope.nextSlide = function(){
    $ionicSlideBoxDelegate.next();
  };

  $scope.answerQ1 = function(score){
    surveyService.answerQ1(score);
    $ionicSlideBoxDelegate.next();
  };

  $scope.answerQ2 = function(score){
    $ionicSlideBoxDelegate.next();
    surveyService.answerQ2(score);
    $timeout(function (){$ionicSlideBoxDelegate.slide(0);}, 3000)
  };

});


app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
