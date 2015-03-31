structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    Controller = require('Controller')(),
    _$ = $;   /*stop unecessary scope lookup*/

_Templar.success("#/profile", function(){
  Controller.init('My Profile');
});

});