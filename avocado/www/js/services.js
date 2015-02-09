

app.factory('loginService', function ($state, $firebaseAuth, $firebase, helperService, surveyService, fbURL) {

    //Authentication*********************
    var s = {};

    s.mainFb = new Firebase(fbURL);

    s.uid = {};
    s.authData = {};
    s.userData = {};
    s.auth = $firebaseAuth(s.mainFb);

    //Set listener*****
    s.auth.$onAuth(function (authData) {
        helperService.hide();
        if (authData) {
            console.log("Saving user in fb", authData);
            s.mainFb.child("users").child(authData.uid).update(authData);
            var dataFb = s.mainFb.child("users").child(authData.uid).child("data");
            //set name and picture
            switch (authData.provider) {
            case 'facebook':
                dataFb.update({
                    name: authData.facebook.displayName,
                    pic_url: authData.facebook.cachedUserProfile.picture.data.url
                });
                break;
            case 'twitter':
                dataFb.update({
                    name: authData.twitter.displayName,
                    pic_url: authData.twitter.cachedUserProfile.profile_image_url
                });
                break;
            case 'password':
                dataFb.update({
                    pic_url: "http://www.milatacr.com/www/img/milata_icon_512.png"
                });
                break;
            };

            s.authData = authData;
            s.userData = $firebase(s.mainFb.child("users").child(authData.uid).child("data")).$asObject();
            //$rootScope.authData = authData;
            console.log("trying to go to home");
			
			surveyService.start(s.authData.uid);
			
            $state.go('survey');
        } else {
            console.log("not authorizing right now");
            $state.go('login');
        }
    });

    s.logout = function () {
        console.log("logging out...");
        s.auth.$unauth();
        s.authData = {};
		
		
		
        //$rootScope.authData = {};
    };

    s.checkSession = function () {
        var authData = s.auth.$getAuth();
        if (authData) {
            console.log("Already logged in.. rerouting to main", authData);
            $state.go("survey");
        } else {
            console.log("Not logged in.. redirecting to login page");
        }
    };

    return s;



});


app.factory('surveyService', function ($rootScope,  fbURL) {
    var s = {};
	
    var fb = {}; 
    var timerId = {};
	
	
    s.data = {};

    s.data.counter = 0;
    s.data.answers = [];
    s.data.questions = {};

    
	s.start = function(inUid){
	
		fb = new Firebase(fbURL).child("repo").child(inUid);
		getQuestions();
		startReporting();
	

	}
	
	//Get questions from Firebase and set listeners***********************8

    function getQuestions () {
        fb.child("questions").on("value", function (data) {
            console.log("Updating questions");
            s.data.counter = 0;
            console.log("Testing separate=", separateXY(data.val()));

            pairHelper(separateXY(data.val()));
            if ($rootScope.$root.$$phase != '$apply' && $rootScope.$root.$$phase != '$digest') {
                $rootScope.$apply(function () {
                    s.data.questions = data.val();
                });
            } else {
                s.data.questions = data.val();
            }
            fb.child("status").child("latestQuestionSet").set(s.data.questions);
            fb.child("status").child("lastQuestionsUpdated").set(new Date().toLocaleString());
        });
    }

	function startReporting(){
		
		//Set timer initially
		timerId = setInterval(reportFB, 60 * 60 * 1000);
		
		//Check if we want to reset
		fb.child("status").child("interval").on("value", function (data) {
			if (data.val() >= 60000) {
				var oldTimerId = timerId;
				console.log("Resetting interval");
				clearInterval(timerId);
				timerId = setInterval(reportFB, data.val());
				fb.child("status").update({
					lastTimerUpdated: new Date().toLocaleString() +
						", Old id: " + oldTimerId + ", " +
						"New id: " + timerId
				});
			} else {
				fb.child("status").update({
					lastTimerUpdated: "Interval too low? Must be >= 60000"
				});
			}
		});
	}


    //Report status and check for timeinterval reset
    function reportFB() {
        var now = new Date().toLocaleString();
        fbStat = fb.child("status");
        console.log(now);
        fbStat.update({
            lastChecked: now
        });
    }

    

    s.data.pairs = [];

    s.answerQ1 = function (score) {
        s.data.answers[s.data.counter] = {
            q1key: s.data.pairs[s.data.counter].q1,
            q1text: s.data.questions[s.data.pairs[s.data.counter].q1],
            q1score: score,
            q1time: Date.now()
        };

    };

    s.answerQ2 = function (score) {
        s.data.answers[s.data.counter].q2key = s.data.pairs[s.data.counter].q2;
        s.data.answers[s.data.counter].q2text = s.data.questions[s.data.pairs[s.data.counter].q2];
        s.data.answers[s.data.counter].q2score = score;
        s.data.answers[s.data.counter].q2time = Date.now();

        sendData(s.data.answers[s.data.counter]);

        updateCounter();

    };

    var updateCounter = function () {
        s.data.counter = (s.data.counter + 1) % s.data.pairs.length;
        console.log("counter is " + s.data.counter);
    };

    var sendData = function (record) {
        //to firebase
        console.log("sending!", record);
        fb.child("answers").push(record);
    };


    //Helper functions---------------------------------------------------------

    var pairHelper = function (p) {
        console.log("Running PariHelper");
        s.data.pairs = [];
        for (yKey in p.y) {
            for (xKey in p.x) {
                s.data.pairs.push({
                    q1: yKey,
                    q2: xKey
                });
            }
        }
        console.log("Question pair set: ", s.data.pairs);
        shuffle(s.data.pairs);
        console.log("Pair set after random: ", s.data.pairs);


    };


    function separateXY(p) {
        var res = {
            x: {},
            y: {}
        };

        for (var key in p) {
            if (p.hasOwnProperty(key)) {
                if (key.substring(0, 1) == 'y') {
                    res.y[key] = p[key];
                } else res.x[key] = p[key];
            }
        }
        return res;
    }



    function shuffle(array) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;

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


