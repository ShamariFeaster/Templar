structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    AdFormMdl = _Templar.getModel('AdForm'),
    Config = require('Config'),
    Controller = require('Controller')(),
    _$ = $;

    
    
_Templar.success(Config.formsDir + 'for-sale.html', function(){
  Controller.init('Details');
});
    
_Templar.success('#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri', function(){
  Controller.init('Upload Images');
  if(AdFormMdl.image_id == -1 && AdFormMdl.image_uri == -1){
    AdFormMdl.freeze();
  }else{
    AdFormMdl.thaw();
    AdFormMdl.ad_images.push(Config.adPicDir + AdFormMdl.image_uri);
    AdFormMdl.update('ad_images');
  }
  
});
    
});