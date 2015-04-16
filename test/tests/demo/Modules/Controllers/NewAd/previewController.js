structureJS.module('AdPreviewController', function(require){

var _ = require('Util'),
    Helper = require('Helper'),
    _Templar = window.Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    EnvMdl = _Templar.getModel('Environment'),
    Config = require('Config'),
    InsertQuery = new (require('JRDBI').QueryCollection.Insert)(),
    UpdateQuery = new (require('JRDBI').QueryCollection.Update)(),
    EQ = require('JRDBI').Condition.EQ,
    mixin = require('Controller.NewAd.mixin'),
    NewAdCtrl = require('Controller')( mixin ), 
    _$ = window.$; 
    

function saveAd(e){
  var details = {},
      shouldSavePhoneNumber = Helper.isChecked(AdFormMdl, 'shouldSavePhoneNumber');

  details['uid'] = UserProfileModel.uid;
  details['title'] = AdFormMdl.title;
  details['description'] = AdFormMdl.description;
  details['ad_state'] = 'draft';
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
  
  
  /*0 is 'call/text' option*/
  if(Helper.isChecked(AdFormMdl, 'contactMethods', 0)){
    details['phone_num'] = AdFormMdl.phoneNumber.replace(/[\-\s]/g, '');
  }else{
    shouldSavePhoneNumber = false;
  }
  
  InsertQuery
    .fields(details)
    .execute('ads', function(data){
      
      /*associate ad pics*/
      for(var i = 0; i < AdFormMdl.ad_images.length; i++){
        UpdateQuery
          .fields({ad_id : data.insertId})
          .condition( EQ('ad_pic_id', AdFormMdl.ad_images[i].id) )
          .execute('pics');
      }
      
      /*Save phone # to profile if requested*/
      if(shouldSavePhoneNumber == true){
        UpdateQuery
          .fields({phone_num : details['phone_num'] })
          .condition( EQ('uid' , details['uid'] ))
          .execute('people');
      }
      
      var successMsg = "Ad Saved As Draft. Goto 'My Ads' To Post It Publicly.";
      Helper.fadeInSuccessMsg(successMsg)
    });

}

NewAdCtrl.bindHandlers = function(){
  _$('#' + AdFormMdl.nav.next.label).click(saveAd);
};

/*---------  PREVIEW -------------------*/
_Templar.success("#/new-ad/preview", function(){
  NewAdCtrl.prevBtn(true,'#/new-ad/4/id/-1/uri/-1');
  NewAdCtrl.nextBtn(true,'#', 'Save');
  
  NewAdCtrl.init('Ad Preview');
  
  NewAdCtrl.loadPartial('preview.html', function(){
    
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

});