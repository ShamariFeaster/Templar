structureJS.module('LandingPage', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    GeoInfo = require('GeoInfo-US'),
    _$ = $;   /*stop unecessary scope lookup*/
    
_Templar.success("partials/landing-page.html", function(){
  EnvModel.error = '';
  EnvModel.success_msg = '';

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
  
  ProfileFormMdl.listen('states', function(e){
    ProfileFormMdl.cities = GeoInfo['city_map'][e.text];
  });
  
  $('#btn-update-profile').click(function(e){
    $.ajax('server/update-profile.php',{
      method : 'POST',
      data : 
        {
        uid: UserProfileModel.uid,
        fn : ProfileFormMdl.fn,
        ln : ProfileFormMdl.ln,
        age : ProfileFormMdl.age.current_selection,
        sex : ProfileFormMdl.sex.current_selection,
        state : ProfileFormMdl.state.current_selection,
        city : ProfileFormMdl.city.current_selection,
        description : ProfileFormMdl.description
        },
      dataType : 'json',
      success : function(data, status, jqXHR){
        
        if(_.isNullOrEmpty(data.error)){
          EnvModel.success_msg = data.success_msg;
        }else{
          EnvModel.error = data.error;
        }
        
      },
      error : function(data, status, jqXHR){
        EnvModel.error = 'FATAL: ' + data.error;
      }
    });
  });
  
});
    
});