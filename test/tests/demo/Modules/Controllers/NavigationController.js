structureJS.module('NavigationControler', function(require){

var _ = require('Util'),
    Route = require('Route'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    _$ = $;   /*stop unecessary scope lookup*/

_Templar.success(function(){

$('#logout').click(function(e){
  Route.logout();
  Route.open('/login');
});

});

});