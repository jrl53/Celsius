app.controller('loginCtrl', ['$scope', 'loginService', 'helperService', 'fbURL', function ($scope, loginService, helperService, fbURL) {
	console.log("Starting loginController");
    var fb = new Firebase(fbURL);

    //loginService.checkSession();

    $scope.user = {
        email: "",
        password: "",
        name: ""
    };
    $scope.logWithPass = function () {
        helperService.show('Ingresando...');
        var email = this.user.email;
        var password = this.user.password;
        if (!email || !password) {
            helperService.notify("Favor complete los campos");
            return false;
        }

        loginService.auth.$authWithPassword({
            email: email,
            password: password
        }).then(function (authData) {
            helperService.hide();

        }, function (error) {
            helperService.hide();
            if (error.code == 'INVALID_EMAIL') {
                helperService.notify('Email incorrecto');
            } else if (error.code == 'INVALID_PASSWORD') {
                helperService.notify('Contraseña incorrecta');
            } else if (error.code == 'INVALID_USER') {
                helperService.notify('Usuario incorrecto');
            } else {
                helperService.notify('Oops, hay un problema. Favor avisarle a Chino');
            }
        });
    }

	loginService.checkSession();
	
}]);


app.controller('mainController', function ($scope, $ionicSlideBoxDelegate, $timeout, $state, surveyService, loginService) {
    
    console.log("starting maincontroller");
	//console.log("Starting surveryService from mainController");
	
	//$state.go('login');
	
	
    var qTimeout;
    $scope.data = surveyService.data;


    $scope.$watch(function () {
            return surveyService.data;
        },
        function (newVal, oldVal) {
            console.log("inside watch", newVal);
            $scope.data = newVal;

        }, true);

    $scope.disableSlide = function () {
        var isnabled = $ionicSlideBoxDelegate.enableSlide(false);
        console.log(isnabled);
    };

    $scope.nextSlide = function () {
        $ionicSlideBoxDelegate.next();
    };

    $scope.answerQ1 = function (score) {
        surveyService.answerQ1(score);
        $ionicSlideBoxDelegate.next();
        qTimeout = $timeout(function () {
            $ionicSlideBoxDelegate.slide(0);
        }, 12000)

    };

    $scope.answerQ2 = function (score) {
        $timeout.cancel(qTimeout);
        $ionicSlideBoxDelegate.next();
        surveyService.answerQ2(score);
        $timeout(function () {
            $ionicSlideBoxDelegate.slide(0);
        }, 3000)
    };

});

app.controller('logoutController', function ($scope, loginService) {
	
	console.log("Hi from logoutControlle!");
	loginService.logout();
	
});
