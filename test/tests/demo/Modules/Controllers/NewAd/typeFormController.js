structureJS.module('TypeFormController', function(require){

var Route = require('Route'),
    _Templar = Templar,
    AdFormMdl = _Templar.getModel('AdForm'),
    UserProfileModel = _Templar.getModel('UserProfile'),
    Config = require('Config'),
    Helper = require('Helper'),
    NewAdCtrl = require('Controller')( require('NewAd.extendo') );   

/*--------- PART 3: Details -------------------*/

/*Sub-routing - this avoids the old hide/show paradigm. Allows for much cleaner
  HTML as well as modularization of complex logic for each partial*/
_Templar.success("#/new-ad/typeform", function(){
  NewAdCtrl.init(AdFormMdl.adType.current_selection);
  var formPartial = 'TypeSpecificAdForms/';
  switch(AdFormMdl.adType.current_selection){
    case 'For Sale': 
      formPartial += 'for-sale.html';
      break;
    case 'Jobs': 
      formPartial += 'jobs.html';
      break;
    case 'Housing': 
      formPartial += 'housing.html';
      break;
    case 'Services': 
      formPartial += 'services.html';
      break;
    case 'Personals': 
      formPartial += 'personals.html';
      break;
    case 'Announcements': 
      formPartial += 'announcements.html';
      break;
    
  }
  
  NewAdCtrl.prevBtn(true,'#/new-ad/2');
  NewAdCtrl.nextBtn(true,'#/new-ad/4/id/-1/uri/-1');
  NewAdCtrl.openPartial(formPartial);

});

});