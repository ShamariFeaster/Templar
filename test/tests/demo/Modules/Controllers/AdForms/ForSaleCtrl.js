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

function deleteAdImage(e){
  var confirmResponse = window.confirm('Do you want to delete this image?');
    if(confirmResponse == true){
      var $this = _$(this),
          imageId = $this.data('id'),
          imageUri = $this.attr('src');
      
      Helper.ajax('server/delete-ad-picture.php',{
        uid : UserProfileModel.uid,
        imageId : imageId,
        imageUri : imageUri
      }, function(data, status){
        EnvModel.success_msg = 'Image deletion successful.';
        AdFormMdl.ad_images = AdFormMdl.ad_images
                            .filter(function(obj){
                              return (obj.id != imageId);
                            });
        if(AdFormMdl.ad_images.length < 3){
          AdFormMdl.disablePicSubmission = false;
          EnvModel.error = "";
        }
        Controller.bindHandlers();
        AdFormMdl.save();
      });
    }
}

function onBeforeSubmit(){
  _.log('running onbeforesubmit');
  AdFormMdl.save();
};

Controller.bindHandlers = function(){
  _$('.ad-pic').click(deleteAdImage);
  _$('#pic-submit').click(onBeforeSubmit);
};

_Templar.success('#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri', function(){
  
  var newImageUri = AdFormMdl.image_uri,
      newImageId = AdFormMdl.image_id;
  
  AdFormMdl.load();
  
  if(newImageId != '-1' && AdFormMdl.ad_images.length <= 2){
    AdFormMdl.ad_images.push({src : Config.adPicDir + newImageUri, id : newImageId});
  }
  
  if(AdFormMdl.ad_images.length > 2){
    AdFormMdl.disablePicSubmission = true;
    EnvModel.error = "You've Reached The Max of 3 Picture Per Ad";
  }else{
    AdFormMdl.disablePicSubmission = false;
    EnvModel.error = "";
  }
  
  AdFormMdl.update('ad_images');
  Controller.init('Upload Images', EnvModel.error);
  
  
  
});
    
});