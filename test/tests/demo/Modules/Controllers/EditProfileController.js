structureJS.module('EditProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    GeoInfo = require('GeoInfo-US'),
    _$ = $;   /*stop unecessary scope lookup*/

function repopulateEditForm(){
  ProfileFormMdl.fn = UserProfileModel.fn;
  ProfileFormMdl.ln = UserProfileModel.ln;
  ProfileFormMdl.description = UserProfileModel.description; 
  ProfileFormMdl.sex.current_selection = UserProfileModel.sex;
  ProfileFormMdl.states.current_selection = UserProfileModel.state;
  ProfileFormMdl.age.current_selection = UserProfileModel.age;
  ProfileFormMdl.cities.current_selection = UserProfileModel.city;
}

function updateProfileHandler(e){
  Helper.ajax('server/update-profile.php', 
    {
      uid: UserProfileModel.uid,
      fn : ProfileFormMdl.fn,
      ln : ProfileFormMdl.ln,
      age : ProfileFormMdl.age.current_selection,
      sex : ProfileFormMdl.sex.current_selection,
      state : ProfileFormMdl.states.current_selection,
      city : ProfileFormMdl.cities.current_selection,
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
}

function bindHandlers(){
  $('#btn-update-profile').click(updateProfileHandler);
  
  /*Cascade value of state select*/
  ProfileFormMdl.listen('states', function(e){
    ProfileFormMdl.cities = GeoInfo['city_map'][e.text];
  });
  
}

function init(bannerMsg){
  Helper.init(bannerMsg);
  EnvModel.error = (ProfileFormMdl.uploadStatus === '0') ? 
                      'Your Profile Picture Upload Failed' : '';
  bindHandlers();
  ProfileFormMdl.cities = GeoInfo['city_map'][ProfileFormMdl.states.current_selection];
}

_Templar.success("#/editProfile", function(){
  init('Edit My Profile');
  Helper.loadProfile(UserProfileModel);
  repopulateEditForm();
  
});
    
});