structureJS.module('TitleDescriptionController', function(require){

var _Templar = Templar,
    Helper = require('Helper'),
    mixin = require('Controller.NewAd.mixin'),
    NewAdCtrl = require('Controller')( mixin ); 
  
_Templar.success("#/new-ad/2", function(){
  NewAdCtrl.prevBtn(true,'#/new-ad');
  NewAdCtrl.nextBtn(true,'#/new-ad/typeform');
  NewAdCtrl.loadPartial('title-description.html');
  NewAdCtrl.init('Title & Description');
});

});