structureJS.module('EditProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileMdl = _Templar.getModel('MyProfile'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    GeoInfo = require('GeoInfo-US'),
    Config = require('Config'),
    Controller = require('Controller')(),
    UpdateQuery = new (require('JRDBI').QueryCollection.Update)(),
    EQ = require('JRDBI').Condition.EQ,
    _$ = window.$;   /*stop unecessary scope lookup*/

function repopulateEditForm(){
  ProfileFormMdl.fn = UserProfileMdl.fn;
  ProfileFormMdl.ln = UserProfileMdl.ln;
  ProfileFormMdl.description = UserProfileMdl.description; 
  ProfileFormMdl.sex.current_selection = UserProfileMdl.sex;
  ProfileFormMdl.states.current_selection = UserProfileMdl.state;
  ProfileFormMdl.age.current_selection = UserProfileMdl.age;
  ProfileFormMdl.cities.current_selection = UserProfileMdl.city;
}

function updateProfileHandler(e){
  var updateFields = {
      fn : ProfileFormMdl.fn,
      ln : ProfileFormMdl.ln,
      age : ProfileFormMdl.age.current_selection,
      sex : ProfileFormMdl.sex.current_selection,
      state : ProfileFormMdl.states.current_selection,
      city : ProfileFormMdl.cities.current_selection,
      description : ProfileFormMdl.description
    };
    
  UpdateQuery
    .fields(updateFields)
    .condition( EQ('uid', UserProfileMdl.uid) )
    .execute('people', function(data){
      Helper.fadeInSuccessMsg('Profile Updated');
      UserProfileMdl.fn = sessionStorage['fn'] = ProfileFormMdl.fn;
      UserProfileMdl.ln = sessionStorage['ln'] = ProfileFormMdl.ln;
      UserProfileMdl.age = sessionStorage['age'] = ProfileFormMdl.age.current_selection;
      UserProfileMdl.sex = sessionStorage['sex'] = ProfileFormMdl.sex.current_selection;
      UserProfileMdl.state = sessionStorage['state'] = ProfileFormMdl.states.current_selection;
      UserProfileMdl.city = sessionStorage['city'] = ProfileFormMdl.cities.current_selection;
      UserProfileMdl.description = sessionStorage['description'] = ProfileFormMdl.description;
    });

}

Controller.bindHandlers = function(){
  $('#btn-update-profile').click(updateProfileHandler);
};

Controller.init = function(bannerMsg){
  EnvModel.error = (ProfileFormMdl.uploadStatus === '0') ? 
                      'Your Profile Picture Upload Failed' : '';
  repopulateEditForm();
};

_Templar.success("partials/edit-profile.html", function(){
  UserProfileMdl.pp_src = sessionStorage['pp_src'] = '';
  Controller.init('Edit My Profile');
});
    
}); 