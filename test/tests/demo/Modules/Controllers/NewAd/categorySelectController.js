structureJS.module('CategorySelectController', function(require){

var _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    AdTypeMap = require('Type-Category-Map'),
    Controller = require('Controller')(); 
    
Controller.sortCategories = function(){
  AdFormMdl.sort('category');
  AdFormMdl.update('category');
};

Controller.bindHandlers = function(){
  var Controller = this;

  AdFormMdl.listen('adType', function(e){
    AdFormMdl.category = AdTypeMap.Categories[e.value];
    Controller.sortCategories();
  });
};

Controller.init = function(bannerMsg){
  AdFormMdl.sort('adType');
  AdFormMdl.update('adType');
};

_Templar.success("#/new-ad", function(){
  Controller.init('Ad Category');
});

});