structureJS.module('AuthModule', function(require){

var _ = require('Util'),
    _Templar = Templar,
    Route = require('Route');

_Templar.setAuthenticator(function(inputObj){
    var cookie = this;
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
      url = (_.isString(data.route)) ? data.route.replace('#','') : ''.
      isAuthorized = false;
  
  switch(url){
  
    case '/login':
      isAuthorized = true;
      break;
      
    case '/landingPage':
      if(_.isDef(cookie['status']) && cookie['status'] == 200){
        isAuthorized = true;
      }
      break;
      
    default:
      break;
  }
   return isAuthorized;

});

});

