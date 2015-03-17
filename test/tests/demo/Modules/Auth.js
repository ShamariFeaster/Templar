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

_Templar.setAuthorizer(function(data){
  var cookie = this,
      url = data.route;
  
  if(_.isDef(cookie['status']) && cookie['status'] == 200)
    return true;
  else
    return false;
});

});

