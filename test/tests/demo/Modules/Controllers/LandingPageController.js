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


function init(){
  EnvModel.banner = 'Edit My Profile';
  EnvModel.error = (ProfileFormMdl.uploadStatus === '0') ? 
                      'Your Profile Picture Upload Failed' : '';
  EnvModel.success_msg = '';
}


    
function loadProfile(){
  UserProfileModel.un = (_.isNullOrEmpty(UserProfileModel.un)) ? sessionStorage['un'] : UserProfileModel.un;
  UserProfileModel.uid = (_.isNullOrEmpty(UserProfileModel.uid)) ? sessionStorage['uid'] : UserProfileModel.uid;
  if(_.isNullOrEmpty(UserProfileModel.pp_src || sessionStorage['pp_src'])){
    Helper.ajax('server/profile-pic-src.php', 
      {uid: UserProfileModel.uid},
      function(data, status, jqXHR){
        UserProfileModel.pp_src = data.src;
    });
  }else{
    UserProfileModel.pp_src = sessionStorage['pp_src'];
  }
} 

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
  ProfileFormMdl.listen('states', function(e){
    ProfileFormMdl.cities = GeoInfo['city_map'][e.text];
  });
  
  $('#btn-update-profile').click(updateProfileHandler);
}

_Templar.success("partials/edit-profile.html", function(){
  init();
  bindHandlers();
  repopulateEditForm();
  loadProfile();
});
    
});