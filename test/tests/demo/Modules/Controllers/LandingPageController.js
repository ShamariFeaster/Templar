structureJS.module('LandingPage', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    GeoInfo = require('GeoInfo-US'),
    _$ = $;   /*stop unecessary scope lookup*/
    
_Templar.success("partials/edit-profile.html", function(){
  EnvModel.banner = 'Edit My Profile';
  EnvModel.error = (ProfileFormMdl.uploadStatus === '0') ? 
                      'Your Profile Picture Upload Failed' : '';
  EnvModel.success_msg = '';
  
  ProfileFormMdl.fn = UserProfileModel.fn;
  ProfileFormMdl.ln = UserProfileModel.ln;
  ProfileFormMdl.description = UserProfileModel.description; 
  ProfileFormMdl.sex.current_selection = UserProfileModel.sex;
  /*
  ProfileFormMdl.age = UserProfileModel.age;
  ProfileFormMdl.states = UserProfileModel.fn;
  ProfileFormMdl.cities = UserProfileModel.fn;
  */
  
  UserProfileModel.un = (_.isNullOrEmpty(UserProfileModel.un)) ? sessionStorage['un'] : UserProfileModel.un;
  UserProfileModel.uid = (_.isNullOrEmpty(UserProfileModel.uid)) ? sessionStorage['uid'] : UserProfileModel.uid;
  
  ProfileFormMdl.listen('states', function(e){
    ProfileFormMdl.cities = GeoInfo['city_map'][e.text];
  });
  
  Helper.ajax('server/profile-pic-src.php', 
    {uid: UserProfileModel.uid},
    function(data, status, jqXHR){
      UserProfileModel.pp_src = data.src;
  });
  
  $('#btn-update-profile').click(function(e){
    Helper.ajax('server/update-profile.php', 
      {
        uid: UserProfileModel.uid,
        fn : ProfileFormMdl.fn,
        ln : ProfileFormMdl.ln,
        age : ProfileFormMdl.age.current_selection.value,
        sex : ProfileFormMdl.sex.current_selection,
        state : ProfileFormMdl.states.current_selection.value,
        city : ProfileFormMdl.cities.current_selection.value,
        description : ProfileFormMdl.description
      }, 
      function(data, status, jqXHR){
        EnvModel.success_msg = data.success_msg;
        UserProfileModel.fn = data.fn;
        UserProfileModel.ln = data.ln;
        UserProfileModel.age = data.age;
        UserProfileModel.sex = data.sex;
        UserProfileModel.state = data.state;
        UserProfileModel.city = data.city;
        UserProfileModel.description = data.description;
    });

  });
  
});
    
});