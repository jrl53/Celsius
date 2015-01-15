// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('avocado', ['ionic']);

app.factory('surveyService', function ($rootScope) {
  var s = {};
  var fb = new Firebase("https://celsius-avocado.firebaseio.com");
  var timerId = {};
  s.data = {};
  
  s.data.counter = 0;
  s.data.answers = [];
  s.data.questions = {};

  //Get questions from Firebase and set listeners***********************8
    
  function getQuestions()  {
      fb.child("questions").on("value", function(data){
          console.log("Updating questions");
          s.data.counter = 0; 
          console.log("Testing separate=", separateXY(data.val()));
          
          pairHelper(separateXY(data.val()));
          if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){
              $rootScope.$apply(function() {
                s.data.questions = data.val();
              });
           }
           else {
             s.data.questions = data.val();
          }
          fb.child("status").child("latestQuestionSet").set(s.data.questions);
          fb.child("status").child("lastQuestionsUpdated").set(new Date().toLocaleString());
    });
 }
    
   //Check if we want to reset
    fb.child("status").child("interval").on("value", function(data){
        if(data.val() >= 60000){
            var oldTimerId = timerId;
            console.log("Resetting interval");
            clearInterval(timerId);
            timerId = setInterval(reportFB,data.val());
            fb.child("status").update({lastTimerUpdated: new Date().toLocaleString() + 
                           ", Old id: " + oldTimerId + ", " +
                           "New id: " + timerId});
        }
        else {
            fb.child("status").update({lastTimerUpdated: "Interval too low? Must be >= 60000"});
        }
    });
  
  
  //Report status and check for timeinterval reset
    function reportFB(){
        var now = new Date().toLocaleString();
        fbStat = fb.child("status");
        console.log(now);
        fbStat.update({lastChecked: now});
    }
    
  getQuestions();
  
  //Set timer initially
  timerId = setInterval(reportFB,60*60*1000);
    
  s.data.pairs = [];

  s.answerQ1 = function(score) {
    s.data.answers[s.data.counter] = {
      q1key : s.data.pairs[s.data.counter].q1,
      q1text : s.data.questions[s.data.pairs[s.data.counter].q1],
      q1score : score,
      q1time : Date.now()
    };

  };

  s.answerQ2 = function(score) {
    s.data.answers[s.data.counter].q2key = s.data.pairs[s.data.counter].q2;
    s.data.answers[s.data.counter].q2text = s.data.questions[s.data.pairs[s.data.counter].q2];
    s.data.answers[s.data.counter].q2score = score;
    s.data.answers[s.data.counter].q2time = Date.now();
    
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
    
  var pairHelper = function(p){
      console.log("Running PariHelper");
      s.data.pairs = [];
      for(yKey in p.y){
        for(xKey in p.x){
          s.data.pairs.push({q1: yKey, q2: xKey });
        }
      }
      console.log("Question pair set: ", s.data.pairs);
      shuffle(s.data.pairs);
      console.log("Pair set after random: ", s.data.pairs);
      
      
  };
    
    
  function separateXY(p){
      var res = {
        x : {},
        y : {}
      };
      
      for(var key in p) {
        if(p.hasOwnProperty(key)) {
            if(key.substring(0,1) == 'y') {
            res.y[key] = p[key];
            }
        else res.x[key] = p[key];
        }
      }
      return res;
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
    qTimeout = $timeout(function (){$ionicSlideBoxDelegate.slide(0);}, 12000)
    
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
