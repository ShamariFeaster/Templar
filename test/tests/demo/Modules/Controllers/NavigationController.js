structureJS.module('NavigationControler', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    _$ = $;   /*stop unecessary scope lookup*/

_Templar.success(function(){

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

});

});