structureJS.module('AuthModule', function(require){

var _ = require('Util'),
    _Templar = Templar,
    Route = require('Route');

_Templar.setAuthenticator(function(inputObj){
    var cookie = this,
        UserProfile = inputObj.UserProfile;
    $.ajax('server/authenticate.php',{
      method : 'POST',
      dataType : 'json',
      data : {username: inputObj.un,
              password : inputObj.pw},
              
      success : function(data, status, jqXHR){
        cookie['status'] = data.cookie.status;
        _.log(data);
        if(cookie['status'] == 403){
          inputObj.badPassword.call(null, 'Invalid Password');
        }else{
          cookie['uid'] = UserProfile.uid = data.cookie.uid;
          cookie['un'] = UserProfile.un = data.cookie.un;
          Route.open(inputObj.landingPage);
        }
      },
      
      error : function(data, status, jqXHR){
        cookie['status'] = 500;
      }
    });
  });

_Templar.setDeAuthenticator(function(inputObj){
  var cookie = this;
  cookie['status'] = 403;
});
  
_Templar.setAuthorizer(function(data){
  var cookie = this,
      url = (_.isString(data.route)) ? data.route.replace('#','') : '',
      isAuthorized = false;
      
  if(url.indexOf('/login') == 0){
    isAuthorized = true;
  }else if(url.indexOf('/landingPage') == 0){
    if(_.isDef(cookie['status']) && cookie['status'] == 200){
        isAuthorized = true;
      }
  }else{
    //noop
  }

   return isAuthorized;

});

});

