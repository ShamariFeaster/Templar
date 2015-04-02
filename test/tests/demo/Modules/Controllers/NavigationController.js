structureJS.module('NavigationControler', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    GeoInfo = require('GeoInfo-US'),
    _$ = $;   /*stop unecessary scope lookup*/

_Templar.done(function(){

$('#goto-logout').click(function(e){
  EnvModel.error = '';
  Route.logout();
  sessionStorage.clear();
  Route.open('/login');
});

$('#goto-profile').click(function(e){
  EnvModel.error = '';
  Route.open('/profile');
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