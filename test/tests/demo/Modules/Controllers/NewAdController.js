structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    ProfileFormMdl = _Templar.getModel('ProfileForm'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    Config = require('Config'),
    Controller = require('Controller'),
    P1Controller = new Controller(),
    P2Controller = new Controller(),
    NewAd = {part1 : {}, part2 : {}},
    _$ = $;   

/*--------- Part 1: Category Select  -------------------*/
P1Controller.sortCategories = function(){
  AdFormMdl.sort('category');
  AdFormMdl.update('category');
};

P1Controller.bindHandlers = function(){
  var P1Controller = this;

  AdFormMdl.listen('adType', function(e){
    AdFormMdl.category = AdTypeMap.Categories[e.value];
    P1Controller.sortCategories();
  });
};

P1Controller.init = function(bannerMsg){
  AdFormMdl.sort('adType');
  AdFormMdl.update('adType');
};

_Templar.success("#/new-ad", function(){
  P1Controller.init('Ad Category');
});

_Templar.success("#/new-ad/2", function(){
  P2Controller.init('Title & Description');
});

/*--------- PART 3: Details -------------------*/

/*Sub-routing - this avoids the old hide/show paradigm. Allows for much cleaner
  HTML as well as modularization of complex logic for each partial*/
_Templar.success("#/new-ad/typeform", function(){
  P2Controller.init(AdFormMdl.adType.current_selection);
  
  switch(AdFormMdl.adType.current_selection){
    case 'For Sale': 
      Route.openPartial(Config.formsDir + 'for-sale.html'
                        ,Config.categoryFormId);
      break;
    case 'Jobs': 
      Route.openPartial(Config.formsDir + 'jobs.html'
                        ,Config.categoryFormId);
      break;
    case 'Housing': 
      Route.openPartial(Config.formsDir + 'housing.html'
                        ,Config.categoryFormId);
      break;
    case 'Services': 
      Route.openPartial(Config.formsDir + 'services.html'
                        ,Config.categoryFormId);
      break;
    case 'Personals': 
      Route.openPartial(Config.formsDir + 'personals.html'
                        ,Config.categoryFormId);
      break;
    case 'Announcements': 
      Route.openPartial( Config.formsDir + 'announcements.html'
                        ,Config.categoryFormId);
      break;
    
  }
});
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
    details['city'] = ProfileFormMdl.cities;
    details['state'] = ProfileFormMdl.states;
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
  
  if(Helper.isChecked(AdFormMdl, 'contactMethods', 0)){
    details['phone_num'] = AdFormMdl.phoneNumber.replace(/[\-\s]/g, '');
  }
  
  if(Helper.isChecked(AdFormMdl, 'shouldSavePhoneNumber')){
    details['save_phone_num'] = true;
  }
  
  Helper.ajax('saveAd.php',updateObj,
    function(data){
      saveAdImages(data.insertId);
    });
}

P2Controller.bindHandlers = function(){
  _$('#save-ad').click(saveAd);
};

/*---------  PREVIEW -------------------*/
_Templar.success("#/new-ad/preview", function(){
  P2Controller.init('Ad Preview');
  
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