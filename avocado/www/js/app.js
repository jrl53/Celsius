// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('avocado', ['ionic']);

app.factory('surveyService', function ($rootScope) {
  var s = {};
  var fb = new Firebase("https://celsius-avocado.firebaseio.com");
  s.data = {};
  
  s.data.counter = 0;
  s.data.answers = [];
  s.data.questions = {};

  fb.child("questions").once("value", function(data){
      console.log(data.val().length);
      pairHelper(countQ(data.val(), 'y') , countQ(data.val(), 'x'));
      if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){
          $rootScope.$apply(function() {
            s.data.questions = data.val();
          });
       }
       else {
         s.data.questions = data.val();
      }
      
      
  });
  
  s.data.pairs = [];

  
  s.answerQ1 = function(score) {
    s.data.answers[s.data.counter] = {
      q1key : s.data.pairs[s.data.counter].q1,
      q1score : score,
      q1time : new Date().toLocaleString() 
    };

  };

  s.answerQ2 = function(score) {
    s.data.answers[s.data.counter].q2key = s.data.pairs[s.data.counter].q2;
    s.data.answers[s.data.counter].q2score = score;
    s.data.answers[s.data.counter].q2time = new Date().toLocaleString(); 
    
    sendData(s.data.answers[s.data.counter]);
    
    updateCounter();

  };

  var updateCounter = function(){
    s.data.counter = (s.data.counter + 1) % s.data.pairs.length;
    console.log("counter is " + s.data.counter);
  };
  
  var sendData = function(record){
    //to firebase
    console.log("sending!", record);
    fb.child("answers").push(record);
  };
   
  
 //Helper functions
    
  var pairHelper = function(ynum, xnum){
      console.log("Running pairHelper with ynum=" + ynum + ", and xnum=" + xnum);
      for(i=0;i<ynum;i++){
        for(j=0;j<xnum;j++){
          s.data.pairs.push({q1: "y" + (i+1), q2: "x" + (j+1)});
        }
      }
      console.log("Question pair set: ", s.data.pairs);
      shuffle(s.data.pairs);
      console.log("Pair set after random: ", s.data.pairs);
      
      
  };
    
    
  function countQ(p,qType){
      var ct = 0;
      for (var key in p) {
          if (p.hasOwnProperty(key)) {
            if(key.substring(0,1) == qType){
              ct++;
            }
          }
      }
      
      return ct;
  }
    
  
 
    
    function shuffle(array) {
      var currentIndex = array.length, temporaryValue, randomIndex ;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }
    
    
    
  return s;
});

app.controller('mainController', function($scope,$ionicSlideBoxDelegate, $timeout, surveyService) {
  // Main app controller, empty for the example
  var fb = new Firebase("https://celsius-avocado.firebaseio.com");
  var qTimeout;
  $scope.data = surveyService.data;
  
      
  $scope.$watch(function(){
    return surveyService.data;
  },
    function(newVal, oldVal){
      console.log(newVal);
      $scope.data = newVal;
      
  }, true);
  
  $scope.disableSlide = function(){
    var isnabled = $ionicSlideBoxDelegate.enableSlide(false);
    console.log(isnabled);  
  };

  $scope.nextSlide = function(){
    $ionicSlideBoxDelegate.next();
  };

  $scope.answerQ1 = function(score){
    surveyService.answerQ1(score);
    $ionicSlideBoxDelegate.next();
    qTimeout = $timeout(function (){$ionicSlideBoxDelegate.slide(0);}, 15000)
    
  };

  $scope.answerQ2 = function(score){
    $timeout.cancel(qTimeout);
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
