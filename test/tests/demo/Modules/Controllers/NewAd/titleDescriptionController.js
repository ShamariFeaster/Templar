structureJS.module('TitleDescriptionController', function(require){

var _Templar = Templar,
    Helper = require('Helper'),
    NewAdCtrl = require('Controller')( require('NewAd.extendo') );
  
_Templar.success("#/new-ad/2", function(){
  NewAdCtrl.prevBtn(true,'#/new-ad');
  NewAdCtrl.nextBtn(true,'#/new-ad/typeform');
  NewAdCtrl.openPartial('title-description.html');
  NewAdCtrl.init('Title & Description');
});

});