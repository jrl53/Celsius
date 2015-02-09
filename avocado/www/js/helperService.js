app.factory('helperService', function($ionicLoading, $window, $rootScope){

    var s = {};
    
    //distance calculation helpers
    
    function toRad(value) {
	  var RADIANT_CONSTANT = 0.0174532925199433;
	  return (value * RADIANT_CONSTANT);
	}

	s.calcDistance = function(starting, ending) {
	  var KM_RATIO = 6371;
	  try {      
	    var dLat = toRad(ending.coords.latitude - starting.coords.latitude);
	    var dLon = toRad(ending.coords.longitude - starting.coords.longitude);
	    var lat1Rad = toRad(starting.coords.latitude);
	    var lat2Rad = toRad(ending.coords.latitude);
	    
	    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
	            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
	    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	    var d = KM_RATIO * c;
		 
		
		 
	    return d;
	  } catch(e) {
		 
	    return -1;
	  }
	}
    
    
    //update binding helpers*********************************************************
    
    s.apply = function(toUpdate){
        if($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest'){
            console.log("Applying with apply", toUpdate)  ;
			$rootScope.$apply(toUpdate);
           }
           else {
			 console.log("Applying without apply", toUpdate);
             toUpdate();
          }
    };
    
    //display helpers*********************************************************  
    s.show = function(text) {
        s.loading = $ionicLoading.show({
                template: text ? text : 'Loading..',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
    };

    s.hide = function() {
        $ionicLoading.hide();
    };

    s.notify = function(text) {
        s.show(text);
        $window.setTimeout(function() {
            s.hide();
        }, 1999);
    };
	
	//remove "-" from the firebase push key
	s.remDash = function(inString){
		return inString.replace(/\W/g, '');
	};
	
	s.randString = function(){
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for( var i=0; i < 5; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;	
	};
    
    return s;
});
