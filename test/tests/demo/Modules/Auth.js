structureJS.module('AuthModule', function(require){

var _ = require('Util'),
    _Templar = Templar,
    Route = require('Route');

_Templar.setAuthenticator(function(inputObj){
    var cookie = this,
        UserProfile = inputObj.UserProfile;
    sessionStorage.clear();
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
          cookie['uid'] =  data.cookie.uid;
          cookie['un'] =  data.cookie.un;
          cookie['role'] = data.cookie.role;
          cookie['sex'] =  data.cookie.sex;
          cookie['fn'] = data.cookie.fn;
          cookie['ln'] = data.cookie.ln;
          cookie['age'] = data.cookie.age;
          cookie['state'] = data.cookie.state;
          cookie['city'] = data.cookie.city;
          cookie['description'] =  data.cookie.description;
          cookie['pp_src'] = data.cookie.pp_src;
          
          if(_.isDef(inputObj.landingPage)){
            Route.open(inputObj.landingPage);
          }else{
            /*No explicit landing page means choose profile page if profile exists*/
            if(_.isDef(data.cookie.profileExists)){
              Route.open('/profile');
            }else{
              Route.open('/editProfile');
            }
          }
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
      
  function isSignedIn(){
    return (_.isDef(cookie['status']) && cookie['status'] == 200);
  }
  
  if(url.indexOf('/login') == 0){
    isAuthorized = true;
  }
  else if(url.indexOf('/profile') == 0 || url.indexOf('/editProfile') == 0){
    isAuthorized = isSignedIn();
  }
  else if(url.indexOf('/new-ad') == 0){
    isAuthorized = isSignedIn();
  }
  else if(url.indexOf('/my-ads') == 0){
    isAuthorized = isSignedIn();
  }
  else if(url.indexOf('/messages') == 0){
    isAuthorized = isSignedIn();
  }
  else if(url.indexOf('/wall') == 0){
    isAuthorized = isSignedIn();
  }

  return isAuthorized;

});

});

