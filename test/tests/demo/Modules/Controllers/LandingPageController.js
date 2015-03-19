structureJS.module('LandingPage', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    LandingPageModel = _Templar.getModel('LandingPage'),
    GeoInfo = require('GeoInfo-US'),
    _$ = $;   /*stop unecessary scope lookup*/
    
_Templar.success("partials/landing-page.html", function(){
  EnvModel.error = '';
  UserProfileModel.un = (_.isNullOrEmpty(UserProfileModel.un)) ? sessionStorage['un'] : UserProfileModel.un;
  UserProfileModel.uid = (_.isNullOrEmpty(UserProfileModel.uid)) ? sessionStorage['uid'] : UserProfileModel.uid;
  
  
  $.ajax('server/profile-pic-src.php',{
    method : 'POST',
    data : {uid: UserProfileModel.uid},
    dataType : 'json',
    success : function(data, status, jqXHR){
      
      if(_.isNullOrEmpty(data.error)){
        UserProfileModel.pp_src = data.src;
      }else{
        EnvModel.error = data.error;
      }
      
    },
    error : function(data, status, jqXHR){
      EnvModel.error = 'FATAL: ' + data.error;
    }
  });
  
  LandingPageModel.listen('states', function(e){
    LandingPageModel.cities = GeoInfo['city_map'][e.text];
  });
  
});
    
});