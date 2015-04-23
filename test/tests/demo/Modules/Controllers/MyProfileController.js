structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    mdl_MyProfile = _Templar.getModel('MyProfile'),
    mdl_MyAds = _Templar.getModel('MyAds'),
    mdl_UserProfile = _Templar.getModel('UserProfile'),
    Controller = require('Controller')(),
    _$ = window.$;   

_Templar.success("#/my-profile", function(){
  Controller.init('My Profile');
  
  mdl_UserProfile.uid = mdl_MyProfile.uid;
  mdl_UserProfile.fn = mdl_MyProfile.fn;
  mdl_UserProfile.ln = mdl_MyProfile.ln;
  mdl_UserProfile.age = mdl_MyProfile.age;
  mdl_UserProfile.city = mdl_MyProfile.city;
  mdl_UserProfile.state = mdl_MyProfile.state;
  mdl_UserProfile.description = mdl_MyProfile.description;
  
  Helper.fetchAds(mdl_MyProfile.uid, function(ads){
    mdl_UserProfile.ads.limit = 3;
    mdl_UserProfile.ads = ads;
  });
  
  Helper.fetchProfilePic(mdl_UserProfile);
});

});