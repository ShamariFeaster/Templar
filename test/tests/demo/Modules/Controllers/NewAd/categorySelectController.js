structureJS.module('CategorySelectController', function(require){

var _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    AdTypeMap = require('Type-Category-Map'),
    Route = require('Route'),
    Config = require('Config'),
    Helper = require('Helper'),
    NewAdCtrl = require('Controller')( require('NewAd.extendo') ) ; 
    


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

  AdFormMdl.sort('adType');
  AdFormMdl.update('adType');
};

_Templar.success("#/new-ad", function(){
  NewAdCtrl.prevBtn(false);
  NewAdCtrl.nextBtn(true,'#/new-ad/2');
  NewAdCtrl.openPartial('pick-category.html');
  NewAdCtrl.init('Ad Category');
});

});