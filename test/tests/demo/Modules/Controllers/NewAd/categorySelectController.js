structureJS.module('CategorySelectController', function(require){

var _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    AdTypeMap = require('Type-Category-Map'),
    Route = require('Route'),
    Config = require('Config'),
    Helper = require('Helper'),
    mixin = require('Controller.NewAd.mixin'),
    NewAdCtrl = require('Controller')( mixin ) ; 

NewAdCtrl.sortCategories = function(){
  AdFormMdl.sort('category');
  AdFormMdl.update('category');
};

NewAdCtrl.bindHandlers = function(){
  var NewAdCtrl = this;

  AdFormMdl.listen('adType', function(e){
    AdFormMdl.category = AdTypeMap.Categories[e.value];
    NewAdCtrl.sortCategories();
  });
};

NewAdCtrl.init = function(bannerMsg){
  AdFormMdl.ad_id = -1;
  AdFormMdl.sort('adType');
  AdFormMdl.update('adType');
};

NewAdCtrl.onload = function(){
  NewAdCtrl.prevBtn(false);
  NewAdCtrl.nextBtn(true,'#/new-ad/2');
  NewAdCtrl.loadPartial('pick-category.html');
  NewAdCtrl.init('Ad Category');
};

_Templar.success("#/new-ad", NewAdCtrl.onload);

return NewAdCtrl;
});