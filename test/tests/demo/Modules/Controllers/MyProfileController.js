structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    _$ = $;   /*stop unecessary scope lookup*/
    
function bindHandlers(){

}

_Templar.success("partials/profile.html", function(){
  Helper.init('My Profile');
  bindHandlers();
  Helper.loadProfile(UserProfileModel);
});

});