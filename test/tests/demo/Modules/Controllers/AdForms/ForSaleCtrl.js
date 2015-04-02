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
  Helper.init('Details');
});

Controller.bindHandlers = function(){
  _$('.ad-pic').click(function(e){
    var confirmResponse = window.confirm('Do you want to delete this image?');
    if(confirmResponse == true){
      var id = _$(this).data('id');
      _.log(id);
    }
    
  });
};

_Templar.success('#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri', function(){
  
  var newImageUri = AdFormMdl.image_uri,
      newImageId = AdFormMdl.image_id;
  
  AdFormMdl.load();
  
  if(newImageId != '-1' && AdFormMdl.ad_images.length < 2){
    AdFormMdl.ad_images.push({src : Config.adPicDir + newImageUri, id : newImageId});
  }
  
  if(AdFormMdl.ad_images.length >= 2){
    AdFormMdl.disablePicSubmission = true;
    EnvModel.error = "You've Reached The Max of 2 Picture Per Ad";
  }
  
  AdFormMdl.update('ad_images');
  Controller.init('Upload Images');
  
  AdFormMdl.save();
  
});
    
});