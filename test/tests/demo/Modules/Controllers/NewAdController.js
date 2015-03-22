structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    AdFormMdl = _Templar.getModel('AdForm'),
    _$ = $;   

function init(bannerMsg){
  Helper.init(bannerMsg);
  AdFormMdl.adType = AdTypeMap.AdTypes;
}
    
function bindHandlers(){
  AdFormMdl.listen('adType', function(e){
    AdFormMdl.category = AdTypeMap[e.value];
  });
}

_Templar.success("partials/Profile/new-ad-part-2.html", function(){
  init('New Ad');
  bindHandlers();
  //Helper.loadProfile(UserProfileModel);
});

});