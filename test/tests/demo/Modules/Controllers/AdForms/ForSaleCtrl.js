structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = window.Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('MyProfile'),
    AdFormMdl = _Templar.getModel('AdForm'),
    Config = require('Config'),
    mixin = require('Controller.NewAd.mixin'),
    NewAdCtrl = require('Controller')( mixin ),
    _$ = window.$;

    
    
_Templar.success(Config.formsDir + 'for-sale.html', function(){
  Helper.init('Details');
});

function deleteAdImage(e){
  var confirmResponse = window.confirm('Do you want to delete this image?');
    if(confirmResponse == true){
      var $this = _$(this),
          imageId = $this.data('id'),
          imageUri = $this.attr('src');
      
      Helper.ajax('delete-ad-picture.php',
        {
          uid : UserProfileModel.uid,
          imageId : imageId,
          imageUri : imageUri
        }, 
        
        function(data, status){
          Helper.fadeInSuccessMsg('Image deletion successful.');
          AdFormMdl.ad_images = AdFormMdl.ad_images
                              .filter(function(obj){
                                return (obj.id != imageId);
                              });
          if(AdFormMdl.ad_images.length < 3){
            AdFormMdl.disablePicSubmission = false;
            EnvModel.error = "";
          }
          NewAdCtrl.bindHandlers();
          AdFormMdl.save();
      });
    }
}

function onBeforeSubmit(){
  _.log('running onbeforesubmit');
  AdFormMdl.save();
};

NewAdCtrl.bindHandlers = function(){
  _$('.upload-ad-pic').click(deleteAdImage);
  _$('#pic-submit').click(onBeforeSubmit);
};

/*--------------Image Upload Form----------------------*/
_Templar.success('#/new-ad/4/id/AdForm:image_id/uri/AdForm:image_uri', function(){
  NewAdCtrl.prevBtn(true,'#/new-ad/typeform');
  NewAdCtrl.nextBtn(true,'#/new-ad/preview');
  
  NewAdCtrl.loadPartial('pic-upload.html', function(){
  
    var newImageUri = AdFormMdl.image_uri,
      newImageId = AdFormMdl.image_id;
  
    AdFormMdl.load();
    
    if(newImageId != '-1' && AdFormMdl.ad_images.length <= 2){
      AdFormMdl.ad_images.push({src : Config.adPicDir + newImageUri, id : newImageId});
    }
    
    if(AdFormMdl.ad_images.length > 2){
      AdFormMdl.disablePicSubmission = true;
      Helper.fadeInErrorMsg("You've Reached The Max of 3 Picture Per Ad");
    }else{
      AdFormMdl.disablePicSubmission = false;
      EnvModel.error = "";
    }
    
    AdFormMdl.update('ad_images');
    
    NewAdCtrl.init('Upload Images', EnvModel.error);
  });
  
});
    
});