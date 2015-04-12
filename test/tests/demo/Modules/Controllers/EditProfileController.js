structureJS.module('EditProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    GeoInfo = require('GeoInfo-US'),
    Config = require('Config'),
    Controller = require('Controller')(),
    UpdateQuery = new (require('JRDBI').QueryCollection.Update)(),
    EQ = require('JRDBI').Condition.EQ,
    _$ = window.$;   /*stop unecessary scope lookup*/

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
    .condition( EQ('uid', UserProfileModel.uid) )
    .execute('people', function(data){
      Helper.fadeInSuccessMsg('Profile Updated');
      UserProfileModel.fn = sessionStorage['fn'] = ProfileFormMdl.fn;
      UserProfileModel.ln = sessionStorage['ln'] = ProfileFormMdl.ln;
      UserProfileModel.age = sessionStorage['age'] = ProfileFormMdl.age.current_selection;
      UserProfileModel.sex = sessionStorage['sex'] = ProfileFormMdl.sex.current_selection;
      UserProfileModel.state = sessionStorage['state'] = ProfileFormMdl.states.current_selection;
      UserProfileModel.city = sessionStorage['city'] = ProfileFormMdl.cities.current_selection;
      UserProfileModel.description = sessionStorage['description'] = ProfileFormMdl.description;
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
  UserProfileModel.pp_src = sessionStorage['pp_src'] = '';
  Controller.init('Edit My Profile');
});
    
}); 