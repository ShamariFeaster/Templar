structureJS.module('AdPreviewController', function(require){

var _ = require('Util'),
    Helper = require('Helper'),
    _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    Config = require('Config'),
    Controller = require('Controller')(),
    _$ = $; 
    
function saveAdImages(adID){
  if(AdFormMdl.ad_images.length > 0){
    Helper.ajax('associateAdPic.php', {
      adID : adID,
      imagesJson : AdFormMdl.ad_images
    });
  }
  
}

function saveAd(e){
  var details = {},
      updateObj = {uid : UserProfileModel.uid, details : details};
      
  details['save_phone_num'] = false;
  details['title'] = AdFormMdl.description;
  details['description'] = AdFormMdl.title;
  details['ad_state'] = 'active';
  details['ad_type'] = AdFormMdl.adType.current_selection;
  details['ad_category'] = AdFormMdl.category.current_selection;
  details['price'] = (Helper.isChecked(AdFormMdl, 'isItemFree')) ? 0 : AdFormMdl.itemPrice;
  
  if(Helper.isChecked(AdFormMdl, 'useMyLocation')){
    details['city'] = UserProfileModel.city;
    details['state'] = UserProfileModel.state;
  }else{
    details['city'] = AdFormMdl.customCity;
  }
  
  if(Helper.isChecked(AdFormMdl, 'useCustomCity')){
    details['city'] = AdFormMdl.customCity;
  }
  
  if(Helper.isChecked(AdFormMdl, 'shouldExpire')){
    details['end'] = Helper.parseDate(AdFormMdl.expiryDate) || Helper.todayPlusXDays(90);
  }else{
    details['end'] = Helper.todayPlusXDays(90);
  }
  
  if(Helper.areAnyChecked(AdFormMdl, 'contactMethods')){
    details['contact_methods'] = 
      Helper.getCheckedVals(AdFormMdl, 'contactMethods')
        .map(function(v){return "'" + v + "'";}).join();
  }
  
  if(Helper.isChecked(AdFormMdl, 'shouldSavePhoneNumber')){
    details['save_phone_num'] = true;
  }
  
  /*0 is 'call/text' option*/
  if(Helper.isChecked(AdFormMdl, 'contactMethods', 0)){
    details['phone_num'] = AdFormMdl.phoneNumber.replace(/[\-\s]/g, '');
  }else{
    details['phone_num'] = '';
    details['save_phone_num'] = false;
  }
  
  Helper.ajax('saveAd.php',updateObj,
    function(data){
      saveAdImages(data.insertId);
    });
}

Controller.bindHandlers = function(){
  _$('#save-ad').click(saveAd);
};

/*---------  PREVIEW -------------------*/
_Templar.success("#/new-ad/preview", function(){
  Controller.init('Ad Preview');
  
  if(Helper.isChecked(AdFormMdl, 'isItemFree')){
    AdFormMdl.itemPrice = 'Free';
  }
  
  if(AdFormMdl.ad_images.length > 0){
    AdFormMdl.descriptionClass = '';
  }else{
    AdFormMdl.descriptionClass = 'center';
  }
});

});