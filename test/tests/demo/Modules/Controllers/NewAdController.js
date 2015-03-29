structureJS.module('MyProfileController', function(require){

var _ = require('Util'),
    Route = require('Route'),
    Helper = require('Helper'),
    AdTypeMap = require('Type-Category-Map'),
    _Templar = Templar,
    EnvModel = _Templar.getModel('Environment'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    AdFormMdl = _Templar.getModel('AdForm'),
    _$ = $
    NewAd = {part1 : {}, part2 : {}};   

/*--------- PART 1 -------------------*/
NewAd.part1.sortCategories = function(){
  AdFormMdl.sort('category');
  AdFormMdl.update('category');
}

NewAd.part1.bindHandlers = function(){
  var NewAd = this;
  AdFormMdl.listen('adType', function(e){
    AdFormMdl.category = AdTypeMap.Categories[e.value];
    NewAd.sortCategories();
  });
}

NewAd.part1.init = function(bannerMsg){
  Helper.init(bannerMsg);
  this.bindHandlers();
  AdFormMdl.sort('adType');
  AdFormMdl.adType = AdTypeMap.AdTypes;
  this.sortCategories();
}

_Templar.success("#/new-ad", function(){
  NewAd.part1.init('New Ad');
});

/*--------- PART 2 -------------------*/
NewAd.part2.bindHandlers = function(){
  AdFormMdl.listen('isItemFree', function(e){
    if(e.checked == true){
      AdFormMdl.disablePriceField = true;
      AdFormMdl.itemPrice = '';
    }else{
      AdFormMdl.disablePriceField = false;
    }
  });
}

NewAd.part2.init = function(bannerMsg){
  Helper.init(bannerMsg);
  this.bindHandlers();
}

_Templar.success("#/new-ad/3", function(){
  NewAd.part2.init('New Ad');
});

});