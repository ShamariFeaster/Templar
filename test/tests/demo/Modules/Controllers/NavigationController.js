structureJS.module('NavigationControler', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileMdl = _Templar.getModel('UserProfile'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    GeoInfo = require('GeoInfo-US'),
    _$ = window.$;   /*stop unecessary scope lookup*/

_Templar.done(function(){

$('#goto-logout').click(function(e){
  EnvModel.error = '';
  Route.logout();
  sessionStorage.clear();
  UserProfileMdl.isSignedIn = false;
  Route.open('/login');
});

$('#goto-my-profile').click(function(e){
  EnvModel.error = '';
  Route.open('/my-profile');
});

$('#goto-edit-profile').click(function(e){
  EnvModel.error = '';
  Route.open('/editProfile');
});

/*Cascade value of state select*/
ProfileFormMdl.listen('states', function(e){
  ProfileFormMdl.cities = GeoInfo['city_map'][e.text];
});

});

});